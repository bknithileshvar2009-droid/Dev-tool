import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportStudyHistoryToPDF(options: {
  sessions: any[];
  userName?: string;
  rangeLabel?: string;
  isPrint?: boolean;
}) {
  const {
    sessions,
    userName = 'BK NITHILESHVAR',
    rangeLabel = 'All Available History',
    isPrint = false,
  } = options;

  const doc = new jsPDF('p', 'mm', 'a4');

  // Title Header Banner
  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, 210, 42, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(6, 182, 212); // Cyan
  doc.text(`APES AI — STUDY HISTORY REPORT`, 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(203, 213, 225);
  doc.text(`Student: ${userName}`, 14, 27);
  doc.text(`Range: ${rangeLabel}`, 14, 34);

  const nowFormatted = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${nowFormatted}`, 196, 34, { align: 'right' });

  // Table Columns and Rows
  const tableColumn = ['Date & Time', 'Subject & Topic / Task', 'Duration', 'Status', 'Paused'];
  const tableRows: any[] = [];

  sessions.forEach((s) => {
    const sStart = s.startTimestamp || (s.createdAt ? new Date(s.createdAt).getTime() : Date.now());
    const dateStr = new Date(sStart).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = new Date(sStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const subjectText = s.subject || 'General Study';
    const taskText = s.task ? ` (${s.task})` : '';

    tableRows.push([
      `${dateStr}\n${timeStr}`,
      `${subjectText}${taskText}`,
      formatTotalDurationHours(s.actualElapsedMinutes || s.duration || 0),
      (s.status || 'completed').toUpperCase(),
      s.totalBreakMinutes ? `${s.totalBreakMinutes}m` : '0m',
    ]);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 48,
    margin: { horizontal: 14, bottom: 20 },
    styles: { fontSize: 9, cellPadding: 3.5, font: 'helvetica' },
    headStyles: { fillColor: [8, 145, 178], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 85 },
      2: { cellWidth: 28, fontStyle: 'bold' },
      3: { cellWidth: 23 },
      4: { cellWidth: 18 },
    },
  });

  // Calculate Aggregates
  const totalDuration = sessions.reduce((sum, s) => sum + (s.actualElapsedMinutes || s.duration || 0), 0);
  const totalSessionsCount = sessions.length;
  const avgDuration = totalSessionsCount > 0 ? Math.round(totalDuration / totalSessionsCount) : 0;

  const lastAutoTable = (doc as any).lastAutoTable;
  let finalY = (lastAutoTable ? lastAutoTable.finalY : 100) + 12;

  // Add Summary Box if room exists on page, otherwise add page
  if (finalY + 35 > doc.internal.pageSize.height - 20) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, finalY, 182, 28, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`EXECUTIVE ACADEMIC SUMMARY (${rangeLabel})`, 20, finalY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Sessions: ${totalSessionsCount}`, 20, finalY + 19);
  doc.text(`Total Active Duration: ${formatTotalDurationHours(totalDuration)}`, 80, finalY + 19);
  doc.text(`Avg Session: ${avgDuration} min`, 150, finalY + 19);

  // Add Page Numbers (Page X of Y) across all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `APES AI Verified Study Report — Page ${i} of ${totalPages}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 8,
      { align: 'center' }
    );
  }

  if (isPrint) {
    doc.autoPrint();
    const pdfBlob = doc.output('bloburl');
    window.open(pdfBlob, '_blank');
  } else {
    const filename = `APES_AI_Study_Report_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }
}

export function formatTotalDurationHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  return `${hours}h ${remainingMinutes}m`;
}
