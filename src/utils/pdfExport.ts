import { jsPDF } from 'jspdf';
import { Project, AuditLog } from '../types';

export const exportProjectsAuditPDF = (projects: Project[], logs: AuditLog[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 20;

  // Swiss style styling: sharp black & white, clean monospace/helvetica
  doc.setFont('courier', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text('ZOO // SOFTWARE PROJECT REGISTRY & AUDIT LOG', 15, currentY);

  currentY += 7;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  doc.text(`GENERATED: ${now}  |  TOTAL PROJECTS: ${projects.length}  |  CLASSIFICATION: INTERNAL TECH AUDIT`, 15, currentY);

  currentY += 4;
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.5);
  doc.line(15, currentY, pageWidth - 15, currentY);

  currentY += 8;

  // SECTION 1: PROJECTS OVERVIEW TABLE
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text('01. ACTIVE SOFTWARE PROJECT REGISTRY', 15, currentY);

  currentY += 6;

  // Table Header
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text('PROJECT NAME', 15, currentY);
  doc.text('BUSINESS VERTICAL', 65, currentY);
  doc.text('START DATE', 115, currentY);
  doc.text('VERSION', 145, currentY);
  doc.text('USERS', 170, currentY);

  currentY += 2;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(15, currentY, pageWidth - 15, currentY);

  currentY += 5;

  // Table Rows
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);

  projects.forEach((proj) => {
    // Check if we need a new page
    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('courier', 'bold');
    doc.text(proj.name.substring(0, 26), 15, currentY);

    doc.setFont('courier', 'normal');
    doc.text(proj.businessType.substring(0, 28), 65, currentY);
    doc.text(proj.startDate, 115, currentY);
    doc.text(proj.version, 145, currentY);
    doc.text(proj.activeUsers.toLocaleString(), 170, currentY);

    currentY += 3;
    // Sub-line with host and live site
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text(`Live: ${proj.details.liveSite}  |  Host: ${proj.details.hostedCompany}`, 15, currentY);
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);

    currentY += 5;
  });

  currentY += 6;
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.5);
  doc.line(15, currentY, pageWidth - 15, currentY);

  currentY += 8;

  // SECTION 2: AUDIT & ACTIVITY LOG
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text('02. VERIFIED AUDIT TRAIL & SYSTEM LOGS', 15, currentY);

  currentY += 6;

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text('TIMESTAMP (UTC)', 15, currentY);
  doc.text('ACTION', 55, currentY);
  doc.text('PROJECT', 85, currentY);
  doc.text('AUTHOR', 125, currentY);
  doc.text('SUMMARY', 145, currentY);

  currentY += 2;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(15, currentY, pageWidth - 15, currentY);

  currentY += 5;

  logs.forEach((log) => {
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(70, 70, 70);
    doc.text(log.timestamp.replace('T', ' ').substring(0, 16), 15, currentY);

    doc.setFont('courier', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(log.action, 55, currentY);

    doc.setFont('courier', 'normal');
    doc.text(log.projectName.substring(0, 20), 85, currentY);
    doc.text(log.author, 125, currentY);

    // Summary can wrap or be clipped
    const splitSummary = doc.splitTextToSize(log.summary, 50);
    doc.text(splitSummary, 145, currentY);

    currentY += Math.max(6, splitSummary.length * 3.5 + 2);
  });

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text(`ZOO OPERATING SYSTEM — PAGE ${i} OF ${pageCount}`, 15, 290);
    doc.text(`CONFIDENTIAL ENGINEERING AUDIT REPORT`, pageWidth - 65, 290);
  }

  // Save the PDF
  const filename = `zoo_project_registry_${new Date().toISOString().substring(0, 10)}.pdf`;
  doc.save(filename);
};
