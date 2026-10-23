import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailyRegistryDayRecord } from '../utils/firebase';

export function exportStudyHistoryToPDF(options: {
  sessions: any[];
  userName?: string;
  rangeLabel?: string;
  isPrint?: boolean;
}) {
  const { sessions, userName = 'BK NITHILESHVAR' } = options;
  const doc = new jsPDF('p', 'mm', 'a4');

  // Title Styling
  doc.setFontSize(22);
  doc.setTextColor(40);
  doc.text(`Study Session Report`, 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(`Student: ${userName}`, 105, 30, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 37, { align: 'center' });

  const tableColumn = ['Timestamp', 'Subject', 'Duration (min)'];
  const tableRows: any[] = [];

  sessions.forEach((session) => {
    tableRows.push([
      new Date(session.startTimestamp || session.timestamp).toLocaleString(),
      session.subject || 'General Study',
      session.actualElapsedMinutes || session.duration || 0,
    ]);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    margin: { horizontal: 14 },
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    didDrawPage: (data: any) => {
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    },
  });

  const totalDuration = sessions.reduce((sum, s) => sum + (s.actualElapsedMinutes || s.duration || 0), 0);
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Total Study Duration: ${formatTotalDurationHours(totalDuration)}`, 14, finalY);

  doc.save(`Study_Report_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function formatTotalDurationHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
