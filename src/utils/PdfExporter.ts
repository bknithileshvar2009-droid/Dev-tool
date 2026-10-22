/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FocusSessionRecord, loadUserStudySessions, getUserProfile } from './firebase';

export interface ExportStudyReportOptions {
  sessions: FocusSessionRecord[];
  rangeLabel: string;
  userName?: string;
}

/**
 * Generate a professional, printer-friendly PDF report from study session history.
 * Formats daily summaries, detailed session breakdown, student name, and pagination.
 */
export function exportStudyHistoryToPDF({
  sessions,
  rangeLabel,
  userName = 'APES AI Student',
}: ExportStudyReportOptions): void {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Header Banner
  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('APES AI — STUDY TIME REPORT', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(6, 182, 212);
  doc.text(`Report Period: ${rangeLabel}`, 14, 23);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const genDate = new Date().toLocaleString();
  doc.text(`Generated: ${genDate} | Student: ${userName}`, pageWidth - 14, 23, { align: 'right' });

  // 2. Metrics & Daily Summaries Calculation
  let totalMins = 0;
  const dailySummaryMap: Record<string, { minutes: number; sessionCount: number; subjects: Set<string> }> = {};

  sessions.forEach(s => {
    const elapsed = s.actualElapsedMinutes || Math.round(((s.endTimestamp || Date.now()) - s.startTimestamp) / 60000) || 0;
    totalMins += elapsed;

    const dateKey = new Date(s.startTimestamp).toISOString().slice(0, 10);
    if (!dailySummaryMap[dateKey]) {
      dailySummaryMap[dateKey] = { minutes: 0, sessionCount: 0, subjects: new Set() };
    }
    dailySummaryMap[dateKey].minutes += elapsed;
    dailySummaryMap[dateKey].sessionCount += 1;
    if (s.subject) dailySummaryMap[dateKey].subjects.add(s.subject);
  });

  let currentY = 42;

  // Executive Metric Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 20, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('TOTAL RECORDED STUDY TIME', 20, currentY + 7);
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129);
  doc.text(`${Math.floor(totalMins / 60)}h ${totalMins % 60}m (${totalMins} mins)`, 20, currentY + 15);

  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('TOTAL STUDY SESSIONS', 95, currentY + 7);
  doc.setFontSize(13);
  doc.setTextColor(6, 182, 212);
  doc.text(`${sessions.length} Sessions`, 95, currentY + 15);

  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('ACTIVE DAYS LOGGED', 155, currentY + 7);
  doc.setFontSize(13);
  doc.setTextColor(99, 102, 241);
  doc.text(`${Object.keys(dailySummaryMap).length} Days`, 155, currentY + 15);

  currentY += 28;

  // 3. Daily Summary Table
  const dailyRows = Object.entries(dailySummaryMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dateKey, stats]) => {
      const fullDate = new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const hoursStr = `${Math.floor(stats.minutes / 60)}h ${stats.minutes % 60}m`;
      const subjectsStr = Array.from(stats.subjects).join(', ') || 'General Study';
      return [fullDate, hoursStr, `${stats.sessionCount} sessions`, subjectsStr];
    });

  if (dailyRows.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Daily Study Breakdown', 14, currentY);
    currentY += 4;

    autoTable(doc, {
      startY: currentY,
      head: [['Calendar Date', 'Total Time', 'Sessions', 'Subjects Studied']],
      body: dailyRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // 4. Session Details Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Detailed Session Log', 14, currentY);
  currentY += 4;

  const sessionRows = sessions.map((s, idx) => {
    const dateStr = new Date(s.startTimestamp).toLocaleDateString();
    const startStr = new Date(s.startTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endStr = s.endTimestamp ? new Date(s.endTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active';
    const dur = `${s.actualElapsedMinutes || Math.round(((s.endTimestamp || Date.now()) - s.startTimestamp) / 60000)} mins`;
    return [
      idx + 1,
      dateStr,
      s.subject || 'General Study',
      s.task || 'Focus Sprint',
      `${startStr} - ${endStr}`,
      dur,
      s.status ? s.status.toUpperCase() : 'COMPLETED',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Date', 'Subject', 'Topic / Goal', 'Time Window', 'Duration', 'Status']],
    body: sessionRows.length > 0 ? sessionRows : [['-', '-', 'No recorded sessions', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [11, 17, 32], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
      doc.text(`APES AI • Verified Academic Report • Student: ${userName}`, 14, pageHeight - 10);
    },
  });

  doc.save(`APES_AI_Study_Report_${rangeLabel.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Convenience utility that directly retrieves study sessions from 'users/{uid}/studySessions',
 * retrieves the user's name from their profile, and generates the PDF report.
 */
export async function generateStudySessionPDF(
  uid: string,
  options?: {
    rangeLabel?: string;
    userName?: string;
    sessions?: FocusSessionRecord[];
  }
): Promise<void> {
  if (!uid) {
    console.warn('[PdfExporter] Cannot generate PDF without authenticated UID.');
    return;
  }

  // 1. Fetch study sessions from users/{uid}/studySessions if not provided
  let sessions = options?.sessions;
  if (!sessions) {
    sessions = await loadUserStudySessions(uid);
  }

  // 2. Fetch user's profile name from Firebase if not provided
  let studentName = options?.userName;
  if (!studentName || studentName === 'APES AI Student') {
    const profile = await getUserProfile(uid);
    if (profile?.displayName) {
      studentName = profile.displayName;
    }
  }

  // 3. Export PDF
  exportStudyHistoryToPDF({
    sessions: sessions || [],
    rangeLabel: options?.rangeLabel || 'All History',
    userName: studentName || 'APES AI Student',
  });
}
