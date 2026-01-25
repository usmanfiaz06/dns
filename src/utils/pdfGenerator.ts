import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, CompanyProfile } from '../types/invoice';
import { defaultCompanyProfile, defaultPDFPages } from '../types/invoice';

const QNS_GREEN = '#8BC34A';
const TEXT_DARK = '#1a1a1a';
const TEXT_GRAY = '#666666';

const formatCurrency = (amount: number): string => {
  return `PKR ${amount.toLocaleString('en-PK')}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const drawLogo = (doc: jsPDF, x: number, y: number, size: number = 40, profile?: CompanyProfile) => {
  if (profile?.logoData) {
    try {
      doc.addImage(profile.logoData, 'PNG', x, y, size, size);
      doc.setTextColor(TEXT_DARK);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(profile.companyName || 'QNS', x + size + 5, y + size / 2 - 2);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(profile.tagline || 'Padle Courts', x + size + 5, y + size / 2 + 6);
      doc.setFontSize(10);
      doc.setTextColor(TEXT_GRAY);
      doc.text(profile.byLine || 'by Super Dialer (Pvt. SMC) ltd.', x + size + 45, y + size / 2 + 2);
    } catch {
      drawDefaultLogo(doc, x, y, size, profile);
    }
  } else {
    drawDefaultLogo(doc, x, y, size, profile);
  }
};

const drawDefaultLogo = (doc: jsPDF, x: number, y: number, size: number, profile?: CompanyProfile) => {
  doc.setFillColor(QNS_GREEN);
  doc.circle(x + size / 2, y + size / 2, size / 2, 'F');
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  doc.circle(x + size / 2, y + size / 2, size / 3, 'S');
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 3;
  doc.line(cx - r * 0.7, cy + r * 0.7, cx + r * 0.7, cy - r * 0.7);

  doc.setTextColor(TEXT_DARK);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(profile?.companyName || 'QNS', x + size + 5, y + size / 2 - 2);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(profile?.tagline || 'Padle Courts', x + size + 5, y + size / 2 + 6);
  doc.setFontSize(10);
  doc.setTextColor(TEXT_GRAY);
  doc.text(profile?.byLine || 'by Super Dialer (Pvt. SMC) ltd.', x + size + 45, y + size / 2 + 2);
};

const drawHeader = (doc: jsPDF, profile?: CompanyProfile) => {
  drawLogo(doc, 15, 10, 25, profile);
  doc.setFillColor(QNS_GREEN);
  doc.rect(0, 42, doc.internal.pageSize.width, 3, 'F');
};

const drawCoverPage = (doc: jsPDF, invoice: Invoice) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const profile = invoice.companyProfile || defaultCompanyProfile;

  doc.setFillColor(245, 250, 240);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Logo
  if (profile.logoData) {
    try {
      doc.addImage(profile.logoData, 'PNG', pageWidth / 2 - 35, 45, 70, 70);
    } catch {
      doc.setFillColor(QNS_GREEN);
      doc.circle(pageWidth / 2, 80, 35, 'F');
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(3);
      doc.circle(pageWidth / 2, 80, 23, 'S');
      doc.line(pageWidth / 2 - 16, 96, pageWidth / 2 + 16, 64);
    }
  } else {
    doc.setFillColor(QNS_GREEN);
    doc.circle(pageWidth / 2, 80, 35, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(3);
    doc.circle(pageWidth / 2, 80, 23, 'S');
    doc.line(pageWidth / 2 - 16, 96, pageWidth / 2 + 16, 64);
  }

  doc.setTextColor(TEXT_DARK);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.companyName || 'QNS', pageWidth / 2, 140, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(profile.tagline || 'Padle Courts', pageWidth / 2, 152, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(TEXT_GRAY);
  doc.text(profile.byLine || 'by Super Dialer (Pvt. SMC) ltd.', pageWidth / 2, 165, { align: 'center' });

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('PADEL COURTS', pageWidth / 2, 200, { align: 'center' });
  doc.text('QUOTATION', pageWidth / 2, 215, { align: 'center' });

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

  doc.setFontSize(10);
  doc.setTextColor(TEXT_GRAY);
  doc.text('Premium Padel Court Designers & Builders', pageWidth / 2, pageHeight - 30, { align: 'center' });
};

const drawIntroPage = (doc: jsPDF, invoice: Invoice) => {
  const profile = invoice.companyProfile || defaultCompanyProfile;
  drawHeader(doc, profile);

  const pageWidth = doc.internal.pageSize.width;
  let y = 60;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text(profile.aboutTitle || 'About QNS Padel Courts', 20, y);

  y += 20;

  // Add intro image if available
  if (profile.introImage) {
    try {
      doc.addImage(profile.introImage, 'JPEG', 20, y, pageWidth - 40, 60);
      y += 70;
    } catch {
      // Skip if image fails
    }
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);

  const aboutText = profile.aboutText || defaultCompanyProfile.aboutText;
  const splitText = doc.splitTextToSize(aboutText, pageWidth - 40);
  doc.text(splitText, 20, y);

  y += splitText.length * 6 + 30;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('Why Choose Us?', 20, y);

  y += 15;

  const features = profile.features || defaultCompanyProfile.features;

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

const drawProjectsPage = (doc: jsPDF, invoice: Invoice) => {
  const profile = invoice.companyProfile || defaultCompanyProfile;
  drawHeader(doc, profile);

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
  doc.text('A showcase of our premium padel court installations.', 20, y);

  y += 25;

  const projects = (invoice.pastProjects || []).filter(p => p.enabled);

  if (projects.length === 0) {
    // Draw placeholder boxes
    const boxWidth = (pageWidth - 50) / 2;
    const boxHeight = 70;

    doc.setFillColor(240, 245, 235);
    doc.roundedRect(20, y, boxWidth, boxHeight, 3, 3, 'F');
    doc.roundedRect(30 + boxWidth, y, boxWidth, boxHeight, 3, 3, 'F');

    doc.setFontSize(9);
    doc.setTextColor(TEXT_GRAY);
    doc.text('Project Image', 20 + boxWidth / 2, y + boxHeight / 2, { align: 'center' });
    doc.text('Project Image', 30 + boxWidth + boxWidth / 2, y + boxHeight / 2, { align: 'center' });
  } else {
    projects.forEach((project, index) => {
      if (y > 230) {
        doc.addPage();
        drawHeader(doc, profile);
        y = 60;
      }

      // Project title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(TEXT_DARK);
      doc.text(`${index + 1}. ${project.name}`, 20, y);
      y += 8;

      // Project description
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(TEXT_GRAY);
      const descLines = doc.splitTextToSize(project.description, pageWidth - 40);
      doc.text(descLines, 20, y);
      y += descLines.length * 5 + 10;

      // Project images
      if (project.images && project.images.length > 0) {
        const imgWidth = (pageWidth - 60) / Math.min(project.images.length, 3);
        const imgHeight = 50;

        project.images.slice(0, 3).forEach((img, imgIndex) => {
          try {
            doc.addImage(img.data, 'JPEG', 20 + imgIndex * (imgWidth + 10), y, imgWidth, imgHeight);
          } catch {
            doc.setFillColor(240, 245, 235);
            doc.roundedRect(20 + imgIndex * (imgWidth + 10), y, imgWidth, imgHeight, 3, 3, 'F');
          }
        });
        y += imgHeight + 20;
      } else {
        y += 10;
      }
    });
  }

  // Testimonial at bottom
  if (y < 230) {
    y = 230;
  }
  doc.setFillColor(QNS_GREEN);
  doc.setTextColor(255, 255, 255);
  doc.roundedRect(20, y, pageWidth - 40, 40, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.text('"Excellence in every court we build"', pageWidth / 2, y + 25, { align: 'center' });
};

const drawQuotationPage = (doc: jsPDF, invoice: Invoice): number => {
  const profile = invoice.companyProfile || defaultCompanyProfile;
  drawHeader(doc, profile);

  const pageWidth = doc.internal.pageSize.width;
  let y = 55;

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('PADEL COURTS', pageWidth / 2, y, { align: 'center' });
  doc.text('QUOTATION', pageWidth / 2, y + 12, { align: 'center' });

  y += 30;

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

  const enabledItems = invoice.quotationItems.filter(item => item.enabled);

  doc.setFillColor(QNS_GREEN);
  doc.rect(15, y, pageWidth - 30, 10, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${invoice.courtSize} Padel Court Material`, pageWidth / 2, y + 7, { align: 'center' });

  y += 15;

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

const drawTermsPage = (doc: jsPDF, invoice: Invoice, startY?: number) => {
  const profile = invoice.companyProfile || defaultCompanyProfile;
  let y = startY || 50;
  const pageWidth = doc.internal.pageSize.width;

  if (!startY) {
    drawHeader(doc, profile);
    y = 55;
  }

  if (y > 200) {
    doc.addPage();
    drawHeader(doc, profile);
    y = 55;
  }

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

  if (invoice.includeTax) {
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Tax (${invoice.taxPercentage}%) is included in the total.`, 20, y);
  }
};

const generatePDFDocument = (invoice: Invoice): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pages = [...(invoice.pdfPages || defaultPDFPages)]
    .filter(p => p.enabled)
    .sort((a, b) => a.order - b.order);

  let isFirstPage = true;
  let quotationEndY: number | undefined;

  pages.forEach(page => {
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    switch (page.type) {
      case 'cover':
        drawCoverPage(doc, invoice);
        break;
      case 'intro':
        drawIntroPage(doc, invoice);
        break;
      case 'projects':
        drawProjectsPage(doc, invoice);
        break;
      case 'quotation':
        quotationEndY = drawQuotationPage(doc, invoice);
        break;
      case 'terms':
        drawTermsPage(doc, invoice, quotationEndY);
        quotationEndY = undefined;
        break;
    }
  });

  return doc;
};

export const generatePDF = (invoice: Invoice): void => {
  const doc = generatePDFDocument(invoice);
  const fileName = `QNS_Quotation_${invoice.clientName.replace(/\s+/g, '_') || 'Client'}_${formatDate(invoice.date)}.pdf`;
  doc.save(fileName);
};

export const previewPDF = (invoice: Invoice): string => {
  const doc = generatePDFDocument(invoice);
  return doc.output('datauristring');
};
