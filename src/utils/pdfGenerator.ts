/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ActivityRecord,
  ActivityCategory,
  DailyGoal,
  DailyReflection,
  formatDurationMinutes,
  formatTime24to12,
  calculateUniqueLoggedMinutes,
  detectOverlappingActivities,
} from './dayInReviewTypes';

export interface GeneratePDFReportOptions {
  date: string; // YYYY-MM-DD
  activities: ActivityRecord[];
  categories: ActivityCategory[];
  goals: DailyGoal[];
  reflection?: DailyReflection;
  userName?: string;
}

export function generateDailyReportPDF({
  date,
  activities,
  categories,
  goals,
  reflection,
  userName = 'APESFLOW Student',
}: GeneratePDFReportOptions): void {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // Calculate Summary Statistics
  let totalLoggedMins = 0;
  let timerMins = 0;
  let manualMins = 0;

  activities.forEach(a => {
    totalLoggedMins += a.durationMinutes || 0;
    if (a.trackingMethod === 'timer') {
      timerMins += a.durationMinutes || 0;
    } else {
      manualMins += a.durationMinutes || 0;
    }
  });

  const uniqueLoggedMins = calculateUniqueLoggedMinutes(activities);
  const overlaps = detectOverlappingActivities(activities);
  const totalDayMins = 24 * 60;
  const untrackedMins = Math.max(0, totalDayMins - uniqueLoggedMins);

  // Category Summaries
  const catTotals = new Map<string, { mins: number; count: number }>();
  activities.forEach(a => {
    const existing = catTotals.get(a.categoryId) || { mins: 0, count: 0 };
    existing.mins += a.durationMinutes || 0;
    existing.count += 1;
    catTotals.set(a.categoryId, existing);
  });

  // Color Palette
  const primaryColor = '#06b6d4'; // Cyan
  const darkBg = '#0b1120';
  const textDark = '#1e293b';
  const textMuted = '#64748b';

  // Header Banner
  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('APESFLOW — MY DAY IN REVIEW', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(6, 182, 212);
  doc.text(`Daily Activity & Performance Report • ${date}`, 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const genTimeStr = new Date().toLocaleString();
  doc.text(`Generated: ${genTimeStr} | User: ${userName}`, pageWidth - 14, 22, { align: 'right' });

  let currentY = 38;

  // Key Summary Cards Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  // Column 1
  doc.text('TOTAL DURATION', 20, currentY + 8);
  doc.setFontSize(12);
  doc.setTextColor(2, 132, 199);
  doc.text(formatDurationMinutes(totalLoggedMins), 20, currentY + 16);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${activities.length} Recorded Activities`, 20, currentY + 22);

  // Column 2
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('UNIQUE LOGGED TIME', 70, currentY + 8);
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129);
  doc.text(formatDurationMinutes(uniqueLoggedMins), 70, currentY + 16);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${Math.round((uniqueLoggedMins / totalDayMins) * 100)}% of 24h Day Covered`, 70, currentY + 22);

  // Column 3
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('TRACKING METHOD', 125, currentY + 8);
  doc.setFontSize(10);
  doc.setTextColor(217, 119, 6);
  doc.text(`Timer: ${formatDurationMinutes(timerMins)}`, 125, currentY + 15);
  doc.text(`Manual: ${formatDurationMinutes(manualMins)}`, 125, currentY + 21);

  // Column 4
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('UNTRACKED GAP', 170, currentY + 8);
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(formatDurationMinutes(untrackedMins), 170, currentY + 16);
  doc.setFontSize(7);
  doc.text(overlaps.length > 0 ? `⚠️ ${overlaps.length} Overlaps Detected` : '✓ Clean Schedule', 170, currentY + 22);

  currentY += 34;

  // Category Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 17, 32);
  doc.text('1. Category Distribution Breakdown', 14, currentY);
  currentY += 4;

  const categoryRows: Array<[string, string, string, string]> = [];
  catTotals.forEach((data, catId) => {
    const cat = categoryMap.get(catId);
    const catName = cat ? `${cat.icon} ${cat.name}` : catId;
    const pct = totalLoggedMins > 0 ? Math.round((data.mins / totalLoggedMins) * 100) : 0;
    categoryRows.push([
      catName,
      formatDurationMinutes(data.mins),
      `${pct}% of Logged Time`,
      `${data.count} ${data.count === 1 ? 'activity' : 'activities'}`,
    ]);
  });

  if (categoryRows.length === 0) {
    categoryRows.push(['No activities recorded', '0m', '0%', '0 activities']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Category', 'Total Time', '% Logged Time', 'Count']],
    body: categoryRows,
    theme: 'grid',
    headStyles: {
      fillColor: [11, 17, 32],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 10;

  // Chronological Activity Log Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 17, 32);
  doc.text('2. Detailed Activity Log & Timings', 14, currentY);
  currentY += 4;

  const activityRows: Array<[string, string, string, string, string, string]> = activities.map(a => {
    const cat = categoryMap.get(a.categoryId);
    const catName = cat ? `${cat.icon} ${cat.name}` : a.categoryId;
    const timing = a.startTime && a.endTime ? `${formatTime24to12(a.startTime)} - ${formatTime24to12(a.endTime)}` : 'Manual Log';
    return [
      timing,
      a.title,
      catName,
      formatDurationMinutes(a.durationMinutes),
      a.trackingMethod.toUpperCase(),
      a.notes || '—',
    ];
  });

  if (activityRows.length === 0) {
    activityRows.push(['—', 'No activities recorded for this date.', '—', '0m', '—', '—']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Time Window', 'Activity Title', 'Category', 'Duration', 'Method', 'Notes & Takeaways']],
    body: activityRows,
    theme: 'striped',
    headStyles: {
      fillColor: [6, 182, 212],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 42 },
      2: { cellWidth: 35 },
      3: { cellWidth: 20 },
      4: { cellWidth: 18 },
      5: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 10;

  // Check Page Break before Goals & Reflections
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 20;
  }

  // Daily Reflection & Goals Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 17, 32);
  doc.text('3. Daily Goals & Personal Reflection', 14, currentY);
  currentY += 6;

  // Goals List
  if (goals && goals.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text('Daily Targets & Goals Progress:', 14, currentY);
    currentY += 5;

    goals.forEach(g => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(`• ${g.title} (${g.goalType.replace('_', ' ')})`, 18, currentY);
      currentY += 4.5;
    });
    currentY += 2;
  }

  // Reflection Text Box
  if (reflection) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    const boxHeight = 38;
    doc.roundedRect(14, currentY, pageWidth - 28, boxHeight, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(16, 185, 129);
    doc.text('✓ What Went Well Today:', 18, currentY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(reflection.whatWentWell || 'None recorded', 18, currentY + 12, { maxWidth: pageWidth - 38 });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(217, 119, 6);
    doc.text('🎯 Tomorrow\'s Top Priority:', 18, currentY + 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(reflection.topPriorityTomorrow || 'None specified', 18, currentY + 27, { maxWidth: pageWidth - 38 });

    currentY += boxHeight + 8;
  }

  // Footer Disclaimer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Generated by APESFLOW Study Command Center. This report contains user-recorded activities and may not represent every minute of the day.',
      14,
      pageHeight - 8
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
  }

  // Save Dynamic Filename
  const fileName = `APESFLOW_Daily_Report_${date}.pdf`;
  doc.save(fileName);
}


export interface CombinedDaySummaryItem {
  date: string; // YYYY-MM-DD
  weekday?: string;
  fullDateStr?: string;
  activities?: ActivityRecord[];
  goals?: DailyGoal[];
  reflection?: DailyReflection | string;
  dailySummaryNotes?: string;
  aiSummary?: string;
  entries?: Record<string, any> | any[];
  completedTasks?: string[];
  totalStudyMins?: number;
}

export interface GenerateCombinedPDFOptions {
  dateRangeLabel: string;
  summaries: CombinedDaySummaryItem[];
  categories?: ActivityCategory[];
  userName?: string;
  autoPrint?: boolean;
}

export function generateCombinedMultiDayReportPDF({
  dateRangeLabel,
  summaries,
  categories = [],
  userName = "APESFLOW Student",
  autoPrint = false,
}: GenerateCombinedPDFOptions): void {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // Document Header
  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("APESFLOW — COMBINED DAILY SUMMARY REPORT", 14, 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(6, 182, 212);
  doc.text(`Range: ${dateRangeLabel} • ${summaries.length} ${summaries.length === 1 ? "Day" : "Days"} Included`, 14, 23);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const genTimeStr = new Date().toLocaleString();
  doc.text(`Generated: ${genTimeStr} | User: ${userName}`, pageWidth - 14, 23, { align: "right" });

  let currentY = 38;

  if (!summaries || summaries.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("No daily summary records found for the selected date range.", 14, currentY);
  } else {
    // Sort summaries chronologically
    const sortedSummaries = [...summaries].sort((a, b) => a.date.localeCompare(b.date));

    sortedSummaries.forEach((summary, index) => {
      let fullDateStr = summary.fullDateStr;
      if (!fullDateStr) {
        try {
          const dObj = new Date(summary.date + "T12:00:00");
          fullDateStr = dObj.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        } catch {
          fullDateStr = summary.date;
        }
      }

      if (currentY > pageHeight - 50) {
        doc.addPage();
        currentY = 20;
      }

      // Date Header Banner Box
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, currentY, pageWidth - 28, 11, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(11, 17, 32);
      doc.text(`${fullDateStr}`, 18, currentY + 7.5);

      const rawActivities = summary.activities || [];
      const rawEntries = summary.entries
        ? Array.isArray(summary.entries)
          ? summary.entries
          : Object.values(summary.entries)
        : [];
      const activityCount = rawActivities.length + rawEntries.length;

      let totalMins = summary.totalStudyMins || 0;
      if (totalMins === 0) {
        rawActivities.forEach(a => { totalMins += a.durationMinutes || 0; });
        rawEntries.forEach((e: any) => { totalMins += e.durationMinutes || 0; });
      }

      const durStr = totalMins > 0 ? formatDurationMinutes(totalMins) : "0m";
      doc.setFontSize(8);
      doc.setTextColor(2, 132, 199);
      doc.text(`Total Time: ${durStr} | ${activityCount} Records`, pageWidth - 18, currentY + 7.5, { align: "right" });

      currentY += 15;

      const tableRows: Array<[string, string, string, string]> = [];

      rawActivities.forEach(a => {
        const cat = categoryMap.get(a.categoryId);
        const catName = cat ? `${cat.icon} ${cat.name}` : a.categoryId;
        const timing = a.startTime && a.endTime ? `${formatTime24to12(a.startTime)} - ${formatTime24to12(a.endTime)}` : "Logged";
        tableRows.push([
          timing,
          a.title,
          catName,
          formatDurationMinutes(a.durationMinutes || 0),
        ]);
      });

      rawEntries.forEach((e: any) => {
        const timeStr = e.time || (e.timestamp ? new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Logged");
        const title = e.topic || e.description || e.subject || "Activity Entry";
        const subj = e.subject || e.eventType || "Study";
        const dur = e.durationMinutes ? formatDurationMinutes(e.durationMinutes) : (e.durationSeconds ? `${Math.round(e.durationSeconds / 60)}m` : "—");
        tableRows.push([timeStr, title, subj, dur]);
      });

      if (tableRows.length === 0) {
        tableRows.push(["—", "No recorded activities for this date.", "—", "0m"]);
      }

      autoTable(doc, {
        startY: currentY,
        head: [["Time / Type", "Activity / Topic", "Category / Subject", "Duration"]],
        body: tableRows,
        theme: "striped",
        headStyles: {
          fillColor: [6, 182, 212],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [30, 41, 59],
        },
        margin: { left: 14, right: 14 },
      });

      // @ts-ignore
      currentY = doc.lastAutoTable.finalY + 5;

      const reflectionText =
        summary.dailySummaryNotes ||
        (typeof summary.reflection === "string"
          ? summary.reflection
          : summary.reflection?.whatWentWell || summary.reflection?.topPriorityTomorrow || "");
      const aiSummaryText = summary.aiSummary;

      if (reflectionText || aiSummaryText || (summary.goals && summary.goals.length > 0)) {
        if (currentY > pageHeight - 35) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text("Daily Reflections & Goals:", 14, currentY);
        currentY += 4;

        if (summary.goals && summary.goals.length > 0) {
          summary.goals.forEach(g => {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(2, 132, 199);
            doc.text(`• Target: ${g.title} (${(g as any).completed ? "Completed ✓" : "In Progress"})`, 18, currentY);
            currentY += 4;
          });
        }

        if (reflectionText) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7.5);
          doc.setTextColor(71, 85, 105);
          doc.text(`Notes: ${reflectionText}`, 18, currentY, { maxWidth: pageWidth - 36 });
          currentY += 5;
        }

        if (aiSummaryText) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(13, 148, 136);
          doc.text(`AI Summary: ${aiSummaryText}`, 18, currentY, { maxWidth: pageWidth - 36 });
          currentY += 5;
        }
      }

      currentY += 3;

      if (index < sortedSummaries.length - 1) {
        doc.setDrawColor(226, 232, 240);
        doc.line(14, currentY, pageWidth - 14, currentY);
        currentY += 6;
      }
    });
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "APESFLOW Daily Summary History Report • Confidential Personal Record",
      14,
      pageHeight - 8
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: "right" });
  }

  if (autoPrint) {
    try {
      doc.autoPrint();
      doc.save(`APESFLOW_Combined_Daily_Summaries_${dateRangeLabel.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    } catch {
      doc.save(`APESFLOW_Combined_Daily_Summaries_${dateRangeLabel.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    }
  } else {
    doc.save(`APESFLOW_Combined_Daily_Summaries_${dateRangeLabel.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
  }
}
