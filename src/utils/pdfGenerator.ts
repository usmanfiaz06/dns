import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice } from '../types/invoice';

const QNS_GREEN = '#8BC34A';
const TEXT_DARK = '#1a1a1a';
const TEXT_GRAY = '#666666';

// Helper to format currency
const formatCurrency = (amount: number): string => {
  return `PKR ${amount.toLocaleString('en-PK')}`;
};

// Helper to format date
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Draw QNS Logo placeholder (circle with text)
const drawLogo = (doc: jsPDF, x: number, y: number, size: number = 40) => {
  // Draw circle
  doc.setFillColor(QNS_GREEN);
  doc.circle(x + size / 2, y + size / 2, size / 2, 'F');

  // Draw inner circle design
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  doc.circle(x + size / 2, y + size / 2, size / 3, 'S');

  // Draw diagonal line in circle
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 3;
  doc.line(cx - r * 0.7, cy + r * 0.7, cx + r * 0.7, cy - r * 0.7);

  // Draw QNS text
  doc.setTextColor(TEXT_DARK);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('QNS', x + size + 5, y + size / 2 - 2);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Padle Courts', x + size + 5, y + size / 2 + 6);

  // Company name
  doc.setFontSize(10);
  doc.setTextColor(TEXT_GRAY);
  doc.text('by Super Dialer (Pvt. SMC) ltd.', x + size + 45, y + size / 2 + 2);
};

// Draw header with green line
const drawHeader = (doc: jsPDF) => {
  drawLogo(doc, 15, 10, 25);

  // Green line under header
  doc.setFillColor(QNS_GREEN);
  doc.rect(0, 42, doc.internal.pageSize.width, 3, 'F');
};

// Page 1: Cover Page
const drawCoverPage = (doc: jsPDF, invoice: Invoice) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Background gradient effect (light green)
  doc.setFillColor(245, 250, 240);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Large QNS branding
  doc.setFillColor(QNS_GREEN);
  doc.circle(pageWidth / 2, 80, 35, 'F');

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(3);
  doc.circle(pageWidth / 2, 80, 23, 'S');
  doc.line(pageWidth / 2 - 16, 96, pageWidth / 2 + 16, 64);

  doc.setTextColor(TEXT_DARK);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('QNS', pageWidth / 2, 140, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Padle Courts', pageWidth / 2, 152, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(TEXT_GRAY);
  doc.text('by Super Dialer (Pvt. SMC) ltd.', pageWidth / 2, 165, { align: 'center' });

  // Title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('PADEL COURTS', pageWidth / 2, 200, { align: 'center' });
  doc.text('QUOTATION', pageWidth / 2, 215, { align: 'center' });

  // Client info box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(30, 235, pageWidth - 60, 50, 5, 5, 'F');
  doc.setDrawColor(QNS_GREEN);
  doc.setLineWidth(1);
  doc.roundedRect(30, 235, pageWidth - 60, 50, 5, 5, 'S');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('Prepared for:', 45, 255);

  doc.setFontSize(18);
  doc.text(invoice.clientName || 'Client Name', 45, 273);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);
  doc.text(`Date: ${formatDate(invoice.date)}`, pageWidth - 45, 255, { align: 'right' });

  // Footer text
  doc.setFontSize(10);
  doc.setTextColor(TEXT_GRAY);
  doc.text('Premium Padel Court Designers & Builders', pageWidth / 2, pageHeight - 30, { align: 'center' });
};

// Page 2: About / Introduction
const drawIntroPage = (doc: jsPDF) => {
  drawHeader(doc);

  const pageWidth = doc.internal.pageSize.width;
  let y = 60;

  // About section
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('About QNS Padel Courts', 20, y);

  y += 20;

  const aboutText = `QNS - Premium Padel Courts. We are elite padel-court designers & builders, founded by pro players for players. At QNS, we don't just build courts - we engineer high-performance playing environments based on first-hand experience.

With deep expertise in padel, our team understands every nuance: optimal court geometry, high-grade surface materials, advanced lighting systems, shock absorption, weather resilience, and athlete comfort.

We source only industry-leading materials, rigorously tested for durability, consistency, and player performance.`;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);

  const splitText = doc.splitTextToSize(aboutText, pageWidth - 40);
  doc.text(splitText, 20, y);

  y += splitText.length * 6 + 30;

  // Why Choose Us
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('Why Choose QNS?', 20, y);

  y += 15;

  const features = [
    'Founded by professional padel players',
    'Industry-leading materials and construction',
    'FIP standards compliance',
    'Complete installation and support',
    'Weather-resilient designs',
    'Custom configurations available'
  ];

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);

  features.forEach(feature => {
    doc.setFillColor(QNS_GREEN);
    doc.circle(25, y - 2, 2, 'F');
    doc.text(feature, 32, y);
    y += 12;
  });
};

// Page 3: Past Projects / Gallery placeholder
const drawProjectsPage = (doc: jsPDF) => {
  drawHeader(doc);

  const pageWidth = doc.internal.pageSize.width;
  let y = 60;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('Our Projects', 20, y);

  y += 20;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);
  doc.text('A showcase of our premium padel court installations across Pakistan.', 20, y);

  y += 25;

  // Project boxes (placeholders for images)
  const boxWidth = (pageWidth - 50) / 2;
  const boxHeight = 70;

  // Row 1
  doc.setFillColor(240, 245, 235);
  doc.roundedRect(20, y, boxWidth, boxHeight, 3, 3, 'F');
  doc.roundedRect(30 + boxWidth, y, boxWidth, boxHeight, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setTextColor(TEXT_GRAY);
  doc.text('Project Image', 20 + boxWidth / 2, y + boxHeight / 2, { align: 'center' });
  doc.text('Project Image', 30 + boxWidth + boxWidth / 2, y + boxHeight / 2, { align: 'center' });

  y += boxHeight + 15;

  // Row 2
  doc.setFillColor(240, 245, 235);
  doc.roundedRect(20, y, boxWidth, boxHeight, 3, 3, 'F');
  doc.roundedRect(30 + boxWidth, y, boxWidth, boxHeight, 3, 3, 'F');

  doc.text('Project Image', 20 + boxWidth / 2, y + boxHeight / 2, { align: 'center' });
  doc.text('Project Image', 30 + boxWidth + boxWidth / 2, y + boxHeight / 2, { align: 'center' });

  y += boxHeight + 25;

  // Testimonial
  doc.setFillColor(QNS_GREEN);
  doc.setTextColor(255, 255, 255);
  doc.roundedRect(20, y, pageWidth - 40, 40, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.text('"Excellence in every court we build"', pageWidth / 2, y + 25, { align: 'center' });
};

// Quotation Page
const drawQuotationPage = (doc: jsPDF, invoice: Invoice) => {
  drawHeader(doc);

  const pageWidth = doc.internal.pageSize.width;
  let y = 55;

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('PADEL COURTS', pageWidth / 2, y, { align: 'center' });
  doc.text('QUOTATION', pageWidth / 2, y + 12, { align: 'center' });

  y += 30;

  // Client info section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Client Name:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.clientName || 'N/A', 55, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Dated:', pageWidth - 60, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(invoice.date), pageWidth - 40, y);

  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Description:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.description, 55, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Number of Courts:', pageWidth - 80, y);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.numberOfCourts.toString(), pageWidth - 35, y);

  y += 15;

  // Calculate total
  let total = invoice.subTotal * invoice.numberOfCourts;
  let taxAmount = 0;

  if (invoice.includeTax) {
    taxAmount = total * (invoice.taxPercentage / 100);
    total += taxAmount;
  }

  // Sub total line
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  let subTotalText = `SUB TOTAL: ${formatCurrency(invoice.subTotal * invoice.numberOfCourts)} /-`;
  if (!invoice.includeTax) {
    subTotalText += ' (excluding tax';
    if (!invoice.includeCivilWork) {
      subTotalText += ' & civil work';
    }
    subTotalText += ')';
  }
  doc.text(subTotalText, 20, y);

  y += 15;

  // Quotation table
  const enabledItems = invoice.quotationItems.filter(item => item.enabled);

  // Table header
  doc.setFillColor(QNS_GREEN);
  doc.rect(15, y, pageWidth - 30, 10, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${invoice.courtSize} Padel Court Material`, pageWidth / 2, y + 7, { align: 'center' });

  y += 15;

  // Table content
  const tableData = enabledItems.map((item, index) => [
    (index + 1).toString(),
    item.name,
    item.description.map(d => `• ${d}`).join('\n')
  ]);

  autoTable(doc, {
    startY: y,
    head: [],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [26, 26, 26],
      lineColor: [200, 200, 200],
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 'auto' }
    },
    alternateRowStyles: {
      fillColor: [250, 252, 248]
    }
  });

  return (doc as any).lastAutoTable.finalY + 10;
};

// Terms and conditions page
const drawTermsPage = (doc: jsPDF, invoice: Invoice, startY?: number) => {
  let y = startY || 50;
  const pageWidth = doc.internal.pageSize.width;

  if (!startY) {
    drawHeader(doc);
    y = 55;
  }

  // Check if we need a new page
  if (y > 200) {
    doc.addPage();
    drawHeader(doc);
    y = 55;
  }

  // Civil Work section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('CIVIL WORK:', 20, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);

  if (invoice.includeCivilWork) {
    doc.text(`• Civil work included in quotation: ${formatCurrency(invoice.civilWorkMinPrice)} - ${formatCurrency(invoice.civilWorkMaxPrice)}`, 25, y);
  } else {
    doc.text(`• Civil work pricing will range between ${(invoice.civilWorkMinPrice / 1000).toFixed(0)}k to ${(invoice.civilWorkMaxPrice / 1000).toFixed(0)}k PKR`, 25, y);
  }

  y += 15;

  // Payment Structure
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('PAYMENT STRUCTURE:', 20, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);
  doc.text(`• ${invoice.paymentStructure.advance}% in advance`, 25, y);
  y += 7;
  doc.text(`• ${invoice.paymentStructure.onDelivery}% at the delivery of glass and turf`, 25, y);
  y += 7;
  doc.text(`• ${invoice.paymentStructure.onCompletion}% upon completion`, 25, y);

  y += 15;

  // Add-ons
  const enabledAddOns = invoice.addOns.filter(a => a.enabled);
  if (enabledAddOns.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(TEXT_DARK);
    doc.text('Add-ons:', 20, y);

    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TEXT_GRAY);

    enabledAddOns.forEach(addon => {
      doc.text(`• ${addon.name} (${addon.quantity}) ${formatCurrency(addon.price)}`, 25, y);
      y += 7;
    });

    y += 8;
  }

  // Terms & Conditions
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('TERMS & CONDITIONS:', 20, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);

  invoice.termsAndConditions.forEach(term => {
    const splitTerm = doc.splitTextToSize(`• ${term}`, pageWidth - 50);
    doc.text(splitTerm, 25, y);
    y += splitTerm.length * 5 + 3;
  });

  // Tax info if applicable
  if (invoice.includeTax) {
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Tax (${invoice.taxPercentage}%) is included in the total.`, 20, y);
  }
};

export const generatePDF = (invoice: Invoice): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Page 1: Cover
  drawCoverPage(doc, invoice);

  // Page 2: Introduction
  doc.addPage();
  drawIntroPage(doc);

  // Page 3: Projects
  doc.addPage();
  drawProjectsPage(doc);

  // Page 4: Quotation
  doc.addPage();
  const quotationEndY = drawQuotationPage(doc, invoice);

  // Page 5 or continue: Terms
  drawTermsPage(doc, invoice, quotationEndY);

  // Save PDF
  const fileName = `QNS_Quotation_${invoice.clientName.replace(/\s+/g, '_') || 'Client'}_${formatDate(invoice.date)}.pdf`;
  doc.save(fileName);
};

export const previewPDF = (invoice: Invoice): string => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Page 1: Cover
  drawCoverPage(doc, invoice);

  // Page 2: Introduction
  doc.addPage();
  drawIntroPage(doc);

  // Page 3: Projects
  doc.addPage();
  drawProjectsPage(doc);

  // Page 4: Quotation
  doc.addPage();
  const quotationEndY = drawQuotationPage(doc, invoice);

  // Page 5 or continue: Terms
  drawTermsPage(doc, invoice, quotationEndY);

  return doc.output('datauristring');
};
