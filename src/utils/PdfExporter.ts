/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FocusSessionRecord,
  loadUserStudySessions,
  getUserProfile,
  splitSessionByLocalCalendarDays,
  getLocalDateString,
} from './firebase';

export interface ExportStudyReportOptions {
  sessions: FocusSessionRecord[];
  rangeLabel: string;
  userName?: string;
  isPrint?: boolean;
}

/**
 * Format total minutes or seconds into a clean "Xh Ym" string (handles > 24 hours accurately)
 */
export function formatTotalDurationHours(totalMinutes: number): string {
  const hrs = Math.floor(Math.max(0, totalMinutes) / 60);
  const mins = Math.max(0, Math.round(totalMinutes % 60));
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Generate a professional, printer-friendly PDF report from study session history.
 * Formats daily summaries with midnight splits, detailed session breakdown, student name, and pagination.
 */
export function exportStudyHistoryToPDF({
  sessions,
  rangeLabel,
  userName = 'BK NITHILESHVAR',
  isPrint = false,
}: ExportStudyReportOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Header Banner (Iron Man-inspired Black & Gold Accents)
  doc.setFillColor(11, 15, 25);
  doc.rect(0, 0, pageWidth, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('APES AI — STUDY TIME REPORT', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(6, 182, 212); // Cyan accent
  doc.text(`Selected Range: ${rangeLabel}`, 14, 23);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const genDate = new Date().toLocaleString();
  doc.text(`Generated: ${genDate} | Student: ${userName}`, pageWidth - 14, 23, { align: 'right' });

  // 2. Metrics & Daily Summaries Calculation (Attributing Midnight Spans Accurately)
  let totalActiveMinutes = 0;
  const dailySummaryMap: Record<string, { activeSeconds: number; sessionCount: number }> = {};

  sessions.forEach(s => {
    const sStart = s.startTimestamp || (s.createdAt ? new Date(s.createdAt).getTime() : Date.now());
    const sEnd = s.endTimestamp || (sStart + (s.actualElapsedMinutes || 0) * 60000);
    const activeSec = (s.actualElapsedMinutes || Math.round((sEnd - sStart) / 60000)) * 60;
    totalActiveMinutes += Math.round(activeSec / 60);

    // Attribute active seconds across midnight boundaries to each calendar date
    const split = splitSessionByLocalCalendarDays(sStart, sEnd, activeSec);
    Object.entries(split).forEach(([dayKey, sliceSec]) => {
      if (!dailySummaryMap[dayKey]) {
        dailySummaryMap[dayKey] = { activeSeconds: 0, sessionCount: 0 };
      }
      dailySummaryMap[dayKey].activeSeconds += sliceSec;
    });

    // Count session on starting date
    const startDayKey = getLocalDateString(new Date(sStart));
    if (dailySummaryMap[startDayKey]) {
      dailySummaryMap[startDayKey].sessionCount += 1;
    }
  });

  let currentY = 44;

  // Executive Metric Cards
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 22, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL ACTIVE STUDY TIME', 20, currentY + 7);
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(formatTotalDurationHours(totalActiveMinutes), 20, currentY + 16);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL SESSIONS', 90, currentY + 7);
  doc.setFontSize(13);
  doc.setTextColor(6, 182, 212); // Cyan
  doc.text(`${sessions.length} Sessions`, 90, currentY + 16);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('CALENDAR DAYS WITH STUDY', 150, currentY + 7);
  doc.setFontSize(13);
  doc.setTextColor(245, 158, 11); // Amber
  doc.text(`${Object.keys(dailySummaryMap).length} Days`, 150, currentY + 16);

  currentY += 30;

  // 3. Daily Summary Table (Accurately reporting midnight splits)
  const dailyRows = Object.entries(dailySummaryMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dateKey, stats]) => {
      const fullDate = new Date(dateKey + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const durationStr = formatTotalDurationHours(Math.round(stats.activeSeconds / 60));
      return [fullDate, durationStr, `${stats.sessionCount} session(s)`];
    });

  if (dailyRows.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Daily Study Summary (Midnight-Adjusted Totals)', 14, currentY);
    currentY += 4;

    autoTable(doc, {
      startY: currentY,
      head: [['Calendar Date & Weekday', 'Total Actual Study Time', 'Sessions Count']],
      body: dailyRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;
  }

  // 4. Detailed Session Log Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Individual Session Log', 14, currentY);
  currentY += 4;

  const sessionRows = sessions.map((s, idx) => {
    const sStart = s.startTimestamp || (s.createdAt ? new Date(s.createdAt).getTime() : 0);
    const startDateStr = new Date(sStart).toLocaleDateString();
    const startTimeStr = new Date(sStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = s.endTimestamp ? new Date(s.endTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Incomplete';
    const activeMins = s.actualElapsedMinutes || Math.round(((s.endTimestamp || Date.now()) - sStart) / 60000);
    const durationStr = formatTotalDurationHours(activeMins);
    const pausedStr = s.totalBreakMinutes ? `${s.totalBreakMinutes}m paused` : 'None';
    const statusStr = (s.status || 'completed').toUpperCase();
    const shortId = (s.sessionId || `session_${idx + 1}`).replace(/^study_/, '').slice(0, 10);

    return [
      idx + 1,
      shortId,
      startDateStr,
      `${startTimeStr} - ${endTimeStr}`,
      durationStr,
      pausedStr,
      statusStr,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Ref ID', 'Date', 'Time Window', 'Active Duration', 'Paused', 'Status']],
    body: sessionRows.length > 0 ? sessionRows : [['-', '-', 'No study sessions recorded', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [11, 15, 25], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
      doc.text(`APES AI • Verified Academic Study Report • Student: ${userName}`, 14, pageHeight - 10);
    },
  });

  if (isPrint) {
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    const printWindow = window.open(blobUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
  } else {
    doc.save(`APES_AI_Study_Report_${rangeLabel.replace(/\s+/g, '_')}.pdf`);
  }

  return doc;
}

/**
 * Convenience utility to export study history for UID, fetching all available sessions
 * if "All Available History" is requested to ensure zero missing pages or records.
 */
export async function generateStudySessionPDF(
  uid: string,
  options?: {
    rangeLabel?: string;
    userName?: string;
    sessions?: FocusSessionRecord[];
    isPrint?: boolean;
  }
): Promise<void> {
  let sessions = options?.sessions;

  // If sessions not provided or "All Available History", fetch complete dataset from Firebase
  if (!sessions || options?.rangeLabel === 'All Available History') {
    if (uid) {
      sessions = await loadUserStudySessions(uid);
    } else {
      sessions = sessions || [];
    }
  }

  let studentName = options?.userName;
  if (!studentName || studentName === 'APES AI Student') {
    if (uid) {
      const profile = await getUserProfile(uid);
      studentName = profile?.displayName || 'BK NITHILESHVAR';
    } else {
      studentName = 'BK NITHILESHVAR';
    }
  }

  exportStudyHistoryToPDF({
    sessions: sessions || [],
    rangeLabel: options?.rangeLabel || 'All Available History',
    userName: studentName || 'BK NITHILESHVAR',
    isPrint: !!options?.isPrint,
  });
}
