import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, CompanyProfile } from '../types/invoice';
import { defaultCompanyProfile, defaultPDFPages } from '../types/invoice';

const QNS_GREEN_RGB = [139, 195, 74] as const;
const TEXT_DARK = '#1a1a1a';
const TEXT_GRAY = '#666666';
const DARK_BG = [30, 35, 40] as const;

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
    } catch {
      drawDefaultLogoCircle(doc, x, y, size);
    }
  } else {
    drawDefaultLogoCircle(doc, x, y, size);
  }
};

const drawDefaultLogoCircle = (doc: jsPDF, x: number, y: number, size: number) => {
  doc.setFillColor(...QNS_GREEN_RGB);
  doc.circle(x + size / 2, y + size / 2, size / 2, 'F');
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  doc.circle(x + size / 2, y + size / 2, size / 3, 'S');
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 3;
  doc.line(cx - r * 0.7, cy + r * 0.7, cx + r * 0.7, cy - r * 0.7);
};

const drawHeader = (doc: jsPDF, profile?: CompanyProfile) => {
  const pageWidth = doc.internal.pageSize.width;

  drawLogo(doc, 15, 8, 22, profile);

  doc.setTextColor(TEXT_DARK);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(profile?.companyName || 'QNS', 42, 18);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);
  doc.text(profile?.tagline || 'Padel Courts', 42, 24);

  doc.setFillColor(...QNS_GREEN_RGB);
  doc.rect(0, 35, pageWidth, 2.5, 'F');
};

/* ============ COVER PAGE - REDESIGNED ============ */
const drawCoverPage = (doc: jsPDF, invoice: Invoice) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const profile = invoice.companyProfile || defaultCompanyProfile;

  // Dark top section
  doc.setFillColor(...DARK_BG);
  doc.rect(0, 0, pageWidth, pageHeight * 0.6, 'F');

  // Green accent bar at top
  doc.setFillColor(...QNS_GREEN_RGB);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Logo
  const logoSize = 50;
  const logoX = pageWidth / 2 - logoSize / 2;
  if (profile.logoData) {
    try {
      doc.addImage(profile.logoData, 'PNG', logoX, 35, logoSize, logoSize);
    } catch {
      drawDefaultLogoCircle(doc, logoX, 35, logoSize);
    }
  } else {
    drawDefaultLogoCircle(doc, logoX, 35, logoSize);
  }

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.companyName || 'QNS', pageWidth / 2, 110, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...QNS_GREEN_RGB);
  doc.text(profile.tagline || 'Padel Courts', pageWidth / 2, 122, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text(profile.byLine || 'by Super Dialer (Pvt. SMC) ltd.', pageWidth / 2, 134, { align: 'center' });

  // Divider line
  doc.setDrawColor(...QNS_GREEN_RGB);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 30, 145, pageWidth / 2 + 30, 145);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PADEL COURTS', pageWidth / 2, 162, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(...QNS_GREEN_RGB);
  doc.text('QUOTATION', pageWidth / 2, 174, { align: 'center' });

  // Light bottom section
  doc.setFillColor(250, 252, 248);
  doc.rect(0, pageHeight * 0.6, pageWidth, pageHeight * 0.4, 'F');

  // Client info card
  const cardY = pageHeight * 0.6 + 20;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.roundedRect(30, cardY, pageWidth - 60, 55, 4, 4, 'FD');

  // Green left accent
  doc.setFillColor(...QNS_GREEN_RGB);
  doc.rect(30, cardY, 4, 55, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);
  doc.text('PREPARED FOR', 45, cardY + 16);

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text(invoice.clientName || 'Client Name', 45, cardY + 32);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);
  doc.text(formatDate(invoice.date), 45, cardY + 44);

  doc.text(`${invoice.numberOfCourts} Court${invoice.numberOfCourts > 1 ? 's' : ''} · ${invoice.courtSize}`, pageWidth - 45, cardY + 32, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text('Premium Padel Court Designers & Builders', pageWidth / 2, pageHeight - 15, { align: 'center' });
};

/* ============ INTRO PAGE ============ */
const drawIntroPage = (doc: jsPDF, invoice: Invoice) => {
  const profile = invoice.companyProfile || defaultCompanyProfile;
  drawHeader(doc, profile);

  const pageWidth = doc.internal.pageSize.width;
  let y = 50;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text(profile.aboutTitle || 'About QNS Padel Courts', 20, y);

  y += 15;

  // Intro image
  if (profile.introImage) {
    try {
      doc.addImage(profile.introImage, 'JPEG', 20, y, pageWidth - 40, 55);
      y += 62;
    } catch {
      // skip
    }
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);

  const aboutText = profile.aboutText || defaultCompanyProfile.aboutText;
  const splitText = doc.splitTextToSize(aboutText, pageWidth - 40);
  doc.text(splitText, 20, y);

  y += splitText.length * 5 + 20;

  // Features section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('Why Choose Us?', 20, y);
  y += 12;

  const features = profile.features || defaultCompanyProfile.features;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  features.forEach(feature => {
    doc.setFillColor(...QNS_GREEN_RGB);
    doc.circle(25, y - 1.5, 1.8, 'F');
    doc.setTextColor(TEXT_GRAY);
    doc.text(feature, 32, y);
    y += 10;
  });
};

/* ============ INDIVIDUAL PROJECT PAGE ============ */
const drawSingleProjectPage = (doc: jsPDF, invoice: Invoice, project: Invoice['pastProjects'][0], projectIndex: number) => {
  const profile = invoice.companyProfile || defaultCompanyProfile;
  drawHeader(doc, profile);

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let y = 50;

  // Project number badge
  doc.setFillColor(...QNS_GREEN_RGB);
  doc.roundedRect(20, y - 5, 30, 10, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`Project ${projectIndex + 1}`, 35, y + 2, { align: 'center' });

  y += 15;

  // Project name
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text(project.name || 'Untitled Project', 20, y);

  y += 10;

  // Description
  if (project.description) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TEXT_GRAY);
    const descLines = doc.splitTextToSize(project.description, pageWidth - 40);
    doc.text(descLines, 20, y);
    y += descLines.length * 5.5 + 12;
  }

  // Images - large format
  const images = project.images || [];
  if (images.length > 0) {
    const margin = 20;
    const gap = 8;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - y - 30;

    if (images.length === 1) {
      // Single image - full width
      const imgHeight = Math.min(availableHeight, 120);
      try {
        doc.addImage(images[0].data, 'JPEG', margin, y, availableWidth, imgHeight);
      } catch {
        doc.setFillColor(240, 245, 235);
        doc.roundedRect(margin, y, availableWidth, imgHeight, 4, 4, 'F');
      }
    } else if (images.length === 2) {
      // Two images side by side
      const imgWidth = (availableWidth - gap) / 2;
      const imgHeight = Math.min(availableHeight, 100);
      images.forEach((img, i) => {
        const x = margin + i * (imgWidth + gap);
        try {
          doc.addImage(img.data, 'JPEG', x, y, imgWidth, imgHeight);
        } catch {
          doc.setFillColor(240, 245, 235);
          doc.roundedRect(x, y, imgWidth, imgHeight, 4, 4, 'F');
        }
      });
    } else {
      // Three images: one large on top, two smaller below
      const topHeight = Math.min(availableHeight * 0.6, 80);
      try {
        doc.addImage(images[0].data, 'JPEG', margin, y, availableWidth, topHeight);
      } catch {
        doc.setFillColor(240, 245, 235);
        doc.roundedRect(margin, y, availableWidth, topHeight, 4, 4, 'F');
      }

      y += topHeight + gap;
      const bottomWidth = (availableWidth - gap) / 2;
      const bottomHeight = Math.min(availableHeight - topHeight - gap, 55);

      for (let i = 1; i < Math.min(images.length, 3); i++) {
        const x = margin + (i - 1) * (bottomWidth + gap);
        try {
          doc.addImage(images[i].data, 'JPEG', x, y, bottomWidth, bottomHeight);
        } catch {
          doc.setFillColor(240, 245, 235);
          doc.roundedRect(x, y, bottomWidth, bottomHeight, 4, 4, 'F');
        }
      }
    }
  }

  // Bottom accent
  doc.setFillColor(...QNS_GREEN_RGB);
  doc.rect(0, pageHeight - 5, pageWidth, 5, 'F');
};

/* ============ PROJECTS OVERVIEW PAGE (if no individual projects) ============ */
const drawProjectsPage = (doc: jsPDF, invoice: Invoice) => {
  const profile = invoice.companyProfile || defaultCompanyProfile;
  drawHeader(doc, profile);

  const pageWidth = doc.internal.pageSize.width;
  let y = 50;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('Our Projects', 20, y);
  y += 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);
  doc.text('A showcase of our premium padel court installations.', 20, y);
  y += 20;

  // Placeholder boxes
  const boxWidth = (pageWidth - 50) / 2;
  const boxHeight = 70;
  doc.setFillColor(240, 245, 235);
  doc.roundedRect(20, y, boxWidth, boxHeight, 3, 3, 'F');
  doc.roundedRect(30 + boxWidth, y, boxWidth, boxHeight, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setTextColor(TEXT_GRAY);
  doc.text('Project Image', 20 + boxWidth / 2, y + boxHeight / 2, { align: 'center' });
  doc.text('Project Image', 30 + boxWidth + boxWidth / 2, y + boxHeight / 2, { align: 'center' });

  y = 230;
  doc.setFillColor(...QNS_GREEN_RGB);
  doc.setTextColor(255, 255, 255);
  doc.roundedRect(20, y, pageWidth - 40, 40, 3, 3, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.text('"Excellence in every court we build"', pageWidth / 2, y + 25, { align: 'center' });
};

/* ============ QUOTATION PAGE ============ */
const drawQuotationPage = (doc: jsPDF, invoice: Invoice): number => {
  const profile = invoice.companyProfile || defaultCompanyProfile;
  drawHeader(doc, profile);

  const pageWidth = doc.internal.pageSize.width;
  let y = 50;

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('PADEL COURTS QUOTATION', pageWidth / 2, y, { align: 'center' });

  y += 18;

  // Client info bar
  doc.setFillColor(250, 252, 248);
  doc.roundedRect(15, y, pageWidth - 30, 22, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('Client:', 22, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.clientName || 'N/A', 42, y + 9);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', pageWidth - 62, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(invoice.date), pageWidth - 45, y + 9);

  doc.setFont('helvetica', 'bold');
  doc.text('Courts:', 22, y + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(`${invoice.numberOfCourts} × ${invoice.courtSize}`, 45, y + 17);

  y += 30;

  // Sub total
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  let subTotalText = `SUB TOTAL: ${formatCurrency(invoice.subTotal * invoice.numberOfCourts)} /-`;
  if (!invoice.includeTax) {
    subTotalText += ' (excluding tax';
    if (!invoice.includeCivilWork) subTotalText += ' & civil work';
    subTotalText += ')';
  }
  doc.text(subTotalText, 20, y);

  y += 12;

  // Table header
  const enabledItems = invoice.quotationItems.filter(item => item.enabled);

  doc.setFillColor(...QNS_GREEN_RGB);
  doc.roundedRect(15, y, pageWidth - 30, 10, 2, 2, 'F');
  doc.setFontSize(10);
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
      lineColor: [220, 220, 220],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 'auto' }
    },
    alternateRowStyles: {
      fillColor: [250, 252, 248]
    }
  });

  return (doc as any).lastAutoTable.finalY + 10;
};

/* ============ TERMS PAGE ============ */
const drawTermsPage = (doc: jsPDF, invoice: Invoice, startY?: number) => {
  const profile = invoice.companyProfile || defaultCompanyProfile;
  let y = startY || 50;
  const pageWidth = doc.internal.pageSize.width;

  if (!startY) {
    drawHeader(doc, profile);
    y = 50;
  }

  if (y > 200) {
    doc.addPage();
    drawHeader(doc, profile);
    y = 50;
  }

  // Civil work
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('CIVIL WORK:', 20, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);

  if (invoice.includeCivilWork) {
    doc.text(`• Civil work included: ${formatCurrency(invoice.civilWorkMinPrice)} - ${formatCurrency(invoice.civilWorkMaxPrice)}`, 25, y);
  } else {
    doc.text(`• Civil work pricing: ${(invoice.civilWorkMinPrice / 1000).toFixed(0)}k - ${(invoice.civilWorkMaxPrice / 1000).toFixed(0)}k PKR`, 25, y);
  }

  y += 15;

  // Payment structure
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
  doc.text(`• ${invoice.paymentStructure.onDelivery}% at delivery of glass and turf`, 25, y);
  y += 7;
  doc.text(`• ${invoice.paymentStructure.onCompletion}% upon completion`, 25, y);

  y += 15;

  // Add-ons
  const enabledAddOns = invoice.addOns.filter(a => a.enabled);
  if (enabledAddOns.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(TEXT_DARK);
    doc.text('ADD-ONS:', 20, y);

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

  // Terms
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK);
  doc.text('TERMS & CONDITIONS:', 20, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY);

  invoice.termsAndConditions.forEach(term => {
    if (y > 270) {
      doc.addPage();
      drawHeader(doc, profile);
      y = 50;
    }
    const splitTerm = doc.splitTextToSize(`• ${term}`, pageWidth - 50);
    doc.text(splitTerm, 25, y);
    y += splitTerm.length * 5 + 3;
  });

  if (invoice.includeTax) {
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(TEXT_DARK);
    doc.text(`Tax (${invoice.taxPercentage}%) is included in the total.`, 20, y);
  }
};

/* ============ MAIN GENERATOR ============ */
const generatePDFDocument = (invoice: Invoice): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pages = [...(invoice.pdfPages || defaultPDFPages)]
    .filter(p => p.enabled)
    .sort((a, b) => a.order - b.order);

  const enabledProjects = (invoice.pastProjects || []).filter(p => p.enabled);

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
        // If there are enabled projects, render each on its own page
        if (enabledProjects.length > 0) {
          drawSingleProjectPage(doc, invoice, enabledProjects[0], 0);
          for (let i = 1; i < enabledProjects.length; i++) {
            doc.addPage();
            drawSingleProjectPage(doc, invoice, enabledProjects[i], i);
          }
        } else {
          drawProjectsPage(doc, invoice);
        }
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
