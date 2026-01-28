import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Color Palette (McKinsey-inspired) ──────────────────────────────────
const C = {
  navyDark:   [10, 22, 40]   as const,  // #0A1628
  navy:       [27, 45, 79]   as const,  // #1B2D4F
  navyMid:    [38, 62, 105]  as const,  // #263E69
  gold:       [200, 169, 81] as const,  // #C8A951
  goldLight:  [218, 196, 132] as const, // #DAC484
  white:      [255, 255, 255] as const,
  offWhite:   [244, 245, 247] as const, // #F4F5F7
  grayLight:  [235, 237, 240] as const, // #EBEDF0
  grayMed:    [156, 163, 175] as const, // #9CA3AF
  textDark:   [26, 26, 46]   as const,  // #1A1A2E
  textBody:   [55, 65, 81]   as const,  // #374151
  textMuted:  [107, 114, 128] as const, // #6B7280
  accent:     [79, 70, 229]  as const,  // subtle indigo
  warmAccent: [234, 88, 12]  as const,  // warm orange for highlights
};

// ─── Page Dimensions (Landscape A4) ────────────────────────────────────
const W = 297;
const H = 210;
const M = { left: 24, right: 24, top: 20, bottom: 18 };
const CW = W - M.left - M.right; // content width

// ─── Helpers ────────────────────────────────────────────────────────────
function setFill(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setFillColor(c[0], c[1], c[2]);
}
function setDraw(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setDrawColor(c[0], c[1], c[2]);
}
function setTextC(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}

function drawPageNumber(doc: jsPDF, pageNum: number, total: number, light = false) {
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, light ? C.grayMed : C.textMuted);
  doc.text(`${String(pageNum).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, W - M.right, H - 10, { align: 'right' });
}

function drawSectionLabel(doc: jsPDF, label: string, y: number, color: readonly [number, number, number] = C.gold) {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, color);
  doc.text(label.toUpperCase(), M.left, y);
  // Underline accent
  setFill(doc, color);
  doc.rect(M.left, y + 1.5, 20, 0.6, 'F');
}

function drawHeading(doc: jsPDF, text: string, y: number, size = 28) {
  doc.setFontSize(size);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, C.textDark);
  doc.text(text, M.left, y);
}

function drawDividerLine(doc: jsPDF, y: number) {
  setDraw(doc, C.grayLight);
  doc.setLineWidth(0.3);
  doc.line(M.left, y, W - M.right, y);
}

function drawConfidentialFooter(doc: jsPDF, light = false) {
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, light ? [80, 90, 110] : C.textMuted);
  doc.text('CONFIDENTIAL', M.left, H - 10);
  doc.text('Inbox Business Solutions', M.left + 35, H - 10);
}

// Rounded rectangle helper
function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, style: 'F' | 'S' | 'FD' = 'F') {
  doc.roundedRect(x, y, w, h, r, r, style);
}

// ─── SLIDE 1: Cover Page ────────────────────────────────────────────────
function drawCover(doc: jsPDF) {
  // Full dark background
  setFill(doc, C.navyDark);
  doc.rect(0, 0, W, H, 'F');

  // Subtle geometric accent - top gold line
  setFill(doc, C.gold);
  doc.rect(0, 0, W, 2.5, 'F');

  // Subtle vertical accent line on left
  setFill(doc, C.gold);
  doc.rect(M.left, 45, 1.5, 80, 'F');

  // Company name
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, C.gold);
  doc.text('INBOX BUSINESS SOLUTIONS', M.left + 10, 58);

  // Main title
  doc.setFontSize(34);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, C.white);
  const titleLines = doc.splitTextToSize('Strategic Brand Refresh and Market Acceleration Framework', CW - 40);
  doc.text(titleLines, M.left + 10, 78);

  // Subtitle
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, C.goldLight);
  doc.text('Kingdom of Saudi Arabia', M.left + 10, 115);

  // Bottom accent bar
  setFill(doc, C.navy);
  doc.rect(0, H - 35, W, 35, 'F');

  // Bottom details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, C.grayMed);
  doc.text('CONFIDENTIAL', M.left, H - 18);

  doc.setFontSize(9);
  setTextC(doc, C.grayMed);
  doc.text('2025', W - M.right, H - 18, { align: 'right' });

  // Decorative dots pattern (subtle)
  setFill(doc, [20, 35, 60]);
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 8; col++) {
      doc.circle(W - 60 + col * 6, 55 + row * 6, 0.6, 'F');
    }
  }
}

// ─── SLIDE 2: Executive Summary ─────────────────────────────────────────
function drawExecutiveSummary(doc: jsPDF) {
  // White background
  setFill(doc, C.white);
  doc.rect(0, 0, W, H, 'F');

  // Top accent line
  setFill(doc, C.navyDark);
  doc.rect(0, 0, W, 1.2, 'F');

  drawSectionLabel(doc, 'EXECUTIVE SUMMARY', 30);
  drawHeading(doc, 'Elevating Institutional Presence', 46, 26);

  // Three stat boxes
  const stats = [
    { number: '20+', label: 'Years of Delivery', sublabel: 'Enterprise track record' },
    { number: '750+', label: 'Projects Completed', sublabel: 'Cross-sector portfolio' },
    { number: '12', label: 'Week Engagement', sublabel: 'End-to-end execution' },
  ];

  const boxW = (CW - 16) / 3;
  const boxY = 58;
  const boxH = 48;

  stats.forEach((stat, i) => {
    const x = M.left + i * (boxW + 8);

    // Box background
    setFill(doc, C.navyDark);
    drawRoundedRect(doc, x, boxY, boxW, boxH, 3, 'F');

    // Gold accent top
    setFill(doc, C.gold);
    doc.rect(x, boxY, boxW, 2.5, 'F');
    // Re-round top corners
    setFill(doc, C.navyDark);
    doc.rect(x, boxY + 2, boxW, 3, 'F');
    setFill(doc, C.gold);
    doc.rect(x + 8, boxY, 25, 2.5, 'F');

    // Number
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    setTextC(doc, C.white);
    doc.text(stat.number, x + 12, boxY + 22);

    // Label
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setTextC(doc, C.goldLight);
    doc.text(stat.label, x + 12, boxY + 32);

    // Sublabel
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setTextC(doc, C.grayMed);
    doc.text(stat.sublabel, x + 12, boxY + 39);
  });

  // Summary paragraph
  const summaryY = boxY + boxH + 14;
  drawDividerLine(doc, summaryY - 6);

  doc.setFontSize(11.5);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, C.textBody);
  const summaryText = 'This engagement repositions Inbox Business Solutions in Saudi Arabia as an institutional-grade transformation partner. The strategy focuses on translating existing strengths\u2014longevity, delivery reliability, and cross-domain expertise\u2014into a clear, disciplined, and authoritative market signal aligned with Saudi enterprise expectations.';
  const lines = doc.splitTextToSize(summaryText, CW);
  doc.text(lines, M.left, summaryY);

  const nextY = summaryY + lines.length * 6 + 6;

  // Key insight box
  setFill(doc, [252, 249, 240]); // warm cream
  drawRoundedRect(doc, M.left, nextY, CW, 28, 2, 'F');
  setFill(doc, C.gold);
  doc.rect(M.left, nextY, 2, 28, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, C.gold);
  doc.text('KEY INSIGHT', M.left + 10, nextY + 8);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  setTextC(doc, C.textBody);
  const insightText = 'Brand is not an aesthetic exercise but a mechanism for reducing perceived operational and governance risk in the Saudi enterprise market.';
  const insightLines = doc.splitTextToSize(insightText, CW - 20);
  doc.text(insightLines, M.left + 10, nextY + 16);

  drawConfidentialFooter(doc);
  drawPageNumber(doc, 2, 14);
}

// ─── SLIDE 3: Strategic Context ─────────────────────────────────────────
function drawStrategySlide(doc: jsPDF) {
  setFill(doc, C.white);
  doc.rect(0, 0, W, H, 'F');
  setFill(doc, C.navyDark);
  doc.rect(0, 0, W, 1.2, 'F');

  drawSectionLabel(doc, '01 / STRATEGY', 30);
  drawHeading(doc, 'Strategic Context', 46, 26);

  // Two-column layout
  const colW = (CW - 14) / 2;
  const colY = 56;

  // Left column
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, C.textBody);
  const leftText = 'Inbox Business Solutions enters the Saudi market as an established enterprise technology organization with more than two decades of delivery history and a portfolio exceeding 750 projects across complex, regulated, and mission-critical environments.\n\nIts service portfolio spans governance, risk and compliance, cybersecurity, enterprise platforms, managed services, digital transformation, and large-scale systems integration.';
  const leftLines = doc.splitTextToSize(leftText, colW);
  doc.text(leftLines, M.left, colY);

  // Right column
  const rightText = 'The strategic objective is to refresh and recalibrate the Inbox brand so it is interpreted in Saudi Arabia as an institutional-grade transformation partner, rather than a generalist IT services provider.\n\nSaudi Arabia\'s enterprise market privileges partners that demonstrate continuity, regulatory literacy, and long-term alignment. The refresh is deliberately evolutionary\u2014the Inbox name, legacy, and accumulated trust remain intact.';
  const rightLines = doc.splitTextToSize(rightText, colW);
  doc.text(rightLines, M.left + colW + 14, colY);

  // Bottom highlight bar
  const barY = 145;
  setFill(doc, C.navyDark);
  drawRoundedRect(doc, M.left, barY, CW, 38, 3, 'F');

  // Three key points in the bar
  const points = [
    { icon: '\u25CF', title: 'Positioning', desc: 'Institutional-grade partner' },
    { icon: '\u25CF', title: 'Approach', desc: 'Evolutionary, not revolutionary' },
    { icon: '\u25CF', title: 'Signal', desc: 'Governance & assurance focus' },
  ];
  const pW = CW / 3;
  points.forEach((p, i) => {
    const px = M.left + i * pW + 14;

    // Vertical divider between items
    if (i > 0) {
      setDraw(doc, C.navyMid);
      doc.setLineWidth(0.3);
      doc.line(M.left + i * pW, barY + 8, M.left + i * pW, barY + 30);
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setTextC(doc, C.gold);
    doc.text(p.title, px, barY + 16);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setTextC(doc, C.grayMed);
    doc.text(p.desc, px, barY + 25);
  });

  drawConfidentialFooter(doc);
  drawPageNumber(doc, 3, 14);
}

// ─── SLIDE 4: Strategic Approach ────────────────────────────────────────
function drawApproachSlide(doc: jsPDF) {
  setFill(doc, C.white);
  doc.rect(0, 0, W, H, 'F');
  setFill(doc, C.navyDark);
  doc.rect(0, 0, W, 1.2, 'F');

  drawSectionLabel(doc, '02 / APPROACH', 30);
  drawHeading(doc, 'Four Integrated Layers', 46, 26);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, C.textBody);
  const introText = 'The approach is structured around the principle that brand, narrative, and experience must move in sequence, not in parallel. Authority is built first through strategic definition, then through expression, and finally through amplification.';
  const introLines = doc.splitTextToSize(introText, CW);
  doc.text(introLines, M.left, 56);

  // Four layer cards
  const layers = [
    { num: '01', title: 'Strategic Definition', desc: 'Crystallizing positioning, narrative, and decision logic', color: C.navyDark },
    { num: '02', title: 'Brand System Refresh', desc: 'Aligning visual, verbal, and governance systems', color: C.navy },
    { num: '03', title: 'Market Interface Design', desc: 'Website, collateral, and executive touchpoints', color: C.navyMid },
    { num: '04', title: 'Authority Amplification', desc: 'LinkedIn presence and ecosystem participation', color: [55, 85, 135] as const },
  ];

  const cardW = (CW - 18) / 4;
  const cardY = 80;
  const cardH = 85;

  layers.forEach((layer, i) => {
    const x = M.left + i * (cardW + 6);

    // Card background
    setFill(doc, layer.color as readonly [number, number, number]);
    drawRoundedRect(doc, x, cardY, cardW, cardH, 3, 'F');

    // Gold accent top
    setFill(doc, C.gold);
    doc.rect(x + 6, cardY + 6, 16, 2, 'F');

    // Number
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    setTextC(doc, C.gold);
    doc.text(layer.num, x + 6, cardY + 26);

    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setTextC(doc, C.white);
    const titleLines = doc.splitTextToSize(layer.title, cardW - 12);
    doc.text(titleLines, x + 6, cardY + 38);

    // Divider
    setFill(doc, [255, 255, 255]);
    doc.rect(x + 6, cardY + 50, cardW - 12, 0.3, 'F');

    // Description
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setTextC(doc, C.grayMed);
    const descLines = doc.splitTextToSize(layer.desc, cardW - 12);
    doc.text(descLines, x + 6, cardY + 58);

    // Arrow between cards
    if (i < 3) {
      setFill(doc, C.gold);
      const arrowX = x + cardW + 1;
      const arrowY = cardY + cardH / 2;
      // Simple arrow
      doc.setFontSize(14);
      setTextC(doc, C.gold);
      doc.text('\u2192', arrowX - 1, arrowY + 1);
    }
  });

  // Bottom note
  setFill(doc, C.offWhite);
  drawRoundedRect(doc, M.left, cardY + cardH + 8, CW, 14, 2, 'F');
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'italic');
  setTextC(doc, C.textMuted);
  doc.text('Each layer builds on the previous one to ensure that external signals are consistent, credible, and scalable.', M.left + 8, cardY + cardH + 17);

  drawConfidentialFooter(doc);
  drawPageNumber(doc, 4, 14);
}

// ─── SLIDES 5-8: Layer Detail Slides ────────────────────────────────────
interface LayerDetail {
  section: string;
  title: string;
  description: string;
  bullets: string[];
  outcome: string;
  pageNum: number;
}

function drawLayerDetailSlide(doc: jsPDF, layer: LayerDetail) {
  setFill(doc, C.white);
  doc.rect(0, 0, W, H, 'F');
  setFill(doc, C.navyDark);
  doc.rect(0, 0, W, 1.2, 'F');

  // Left panel (dark)
  const panelW = 90;
  setFill(doc, C.navyDark);
  doc.rect(0, 1.2, panelW, H - 1.2, 'F');

  // Gold accent
  setFill(doc, C.gold);
  doc.rect(0, 1.2, 2, H - 1.2, 'F');

  // Section label on panel
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, C.gold);
  doc.text(layer.section.toUpperCase(), 14, 30);

  // Title on panel
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, C.white);
  const panelTitle = doc.splitTextToSize(layer.title, panelW - 24);
  doc.text(panelTitle, 14, 48);

  // Right content area
  const contentX = panelW + 16;
  const contentW = W - panelW - 16 - M.right;

  // Description
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, C.textBody);
  const descLines = doc.splitTextToSize(layer.description, contentW);
  doc.text(descLines, contentX, 32);

  let bulletY = 32 + descLines.length * 6.5 + 10;

  // Key Activities label
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, C.gold);
  doc.text('KEY ACTIVITIES', contentX, bulletY);
  bulletY += 10;

  // Bullets
  layer.bullets.forEach((bullet) => {
    // Bullet dot
    setFill(doc, C.gold);
    doc.circle(contentX + 3, bulletY - 1.5, 1.5, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    setTextC(doc, C.textBody);
    const bLines = doc.splitTextToSize(bullet, contentW - 12);
    doc.text(bLines, contentX + 10, bulletY);
    bulletY += bLines.length * 6 + 5;
  });

  // Outcome box
  bulletY += 4;
  setFill(doc, C.offWhite);
  drawRoundedRect(doc, contentX, bulletY, contentW, 28, 2, 'F');
  setFill(doc, C.navyDark);
  doc.rect(contentX, bulletY, 2.5, 28, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, C.navyDark as unknown as readonly [number, number, number]);
  doc.text('OUTCOME', contentX + 10, bulletY + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, C.textBody);
  const outLines = doc.splitTextToSize(layer.outcome, contentW - 20);
  doc.text(outLines, contentX + 10, bulletY + 16);

  // Page number on panel
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, C.grayMed);
  doc.text(`${String(layer.pageNum).padStart(2, '0')} / 14`, panelW - 10, H - 12, { align: 'right' });

  drawConfidentialFooter(doc);
}

// ─── SLIDE 9: Deliverables Overview ─────────────────────────────────────
function drawDeliverablesOverview(doc: jsPDF) {
  setFill(doc, C.white);
  doc.rect(0, 0, W, H, 'F');
  setFill(doc, C.navyDark);
  doc.rect(0, 0, W, 1.2, 'F');

  drawSectionLabel(doc, '04 / DELIVERABLES', 30);
  drawHeading(doc, 'Comprehensive Deliverables', 46, 24);

  // Summary table using autoTable
  autoTable(doc, {
    startY: 56,
    margin: { left: M.left, right: M.right },
    head: [['Category', 'Deliverable', 'Description']],
    body: [
      ['Strategy', 'Positioning Framework', 'Saudi-specific positioning and value articulation'],
      ['Strategy', 'Narrative Architecture', 'Core narrative, message hierarchy, and persona lenses'],
      ['Branding', 'Visual Identity Refresh', 'Updated logo system, typography, and color palette'],
      ['Branding', 'Brand Governance Guide', 'Voice, language, usage rules, and brand templates'],
      ['Digital', 'Website Content', 'Full content drafts and information architecture'],
      ['Digital', 'Website Design', 'UX flows and UI design'],
      ['Collateral', 'Brochures', 'Corporate and service-specific brochures'],
      ['Collateral', 'Swag & Client Kits', 'Kit concepts, item selection, and design'],
      ['Authority', 'LinkedIn Playbook', 'Editorial calendar and content formats'],
      ['Community', 'Community Framework', 'Roundtable formats, themes, and cadence'],
    ],
    styles: {
      fontSize: 9,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      lineColor: C.grayLight as unknown as [number, number, number],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: C.navyDark as unknown as [number, number, number],
      textColor: C.white as unknown as [number, number, number],
      fontSize: 9,
      fontStyle: 'bold',
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    bodyStyles: {
      textColor: C.textBody as unknown as [number, number, number],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold', textColor: C.navyDark as unknown as [number, number, number] },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
  });

  drawConfidentialFooter(doc);
  drawPageNumber(doc, 9, 14);
}

// ─── SLIDE 10-13: Deliverable Detail Slides ─────────────────────────────
interface DeliverableGroup {
  section: string;
  title: string;
  items: { name: string; desc: string }[];
  pageNum: number;
}

function drawDeliverableDetailSlide(doc: jsPDF, group: DeliverableGroup) {
  setFill(doc, C.white);
  doc.rect(0, 0, W, H, 'F');
  setFill(doc, C.navyDark);
  doc.rect(0, 0, W, 1.2, 'F');

  drawSectionLabel(doc, group.section, 30);
  drawHeading(doc, group.title, 46, 22);

  const cardW = (CW - (group.items.length - 1) * 8) / Math.min(group.items.length, 4);
  const startY = 60;

  group.items.forEach((item, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const x = M.left + col * (cardW + 8);
    const y = startY + row * 60;

    // Card
    setFill(doc, C.offWhite);
    drawRoundedRect(doc, x, y, cardW, 50, 2, 'F');

    // Top accent
    setFill(doc, C.navyDark);
    doc.rect(x, y, cardW, 3, 'F');
    // Rounded top
    drawRoundedRect(doc, x, y, cardW, 6, 2, 'F');
    setFill(doc, C.offWhite);
    doc.rect(x, y + 4, cardW, 4, 'F');

    // Title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setTextC(doc, C.navyDark as unknown as readonly [number, number, number]);
    const nameLines = doc.splitTextToSize(item.name, cardW - 12);
    doc.text(nameLines, x + 6, y + 16);

    // Description
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setTextC(doc, C.textMuted);
    const descLines = doc.splitTextToSize(item.desc, cardW - 12);
    doc.text(descLines, x + 6, y + 16 + nameLines.length * 5.5 + 3);
  });

  drawConfidentialFooter(doc);
  drawPageNumber(doc, group.pageNum, 14);
}

// ─── SLIDE 14: Timeline ─────────────────────────────────────────────────
function drawTimelineSlide(doc: jsPDF) {
  setFill(doc, C.white);
  doc.rect(0, 0, W, H, 'F');
  setFill(doc, C.navyDark);
  doc.rect(0, 0, W, 1.2, 'F');

  drawSectionLabel(doc, '05 / TIMELINE', 30);
  drawHeading(doc, '12-Week Execution Plan', 46, 26);

  const phases = [
    { phase: 'Phase 1', title: 'Strategy & Positioning', weeks: 2, start: 0 },
    { phase: 'Phase 2', title: 'Brand Refresh & Governance', weeks: 2, start: 2 },
    { phase: 'Phase 3', title: 'Website Content & Design', weeks: 4, start: 4 },
    { phase: 'Phase 4', title: 'Collateral & Swag Systems', weeks: 2, start: 8 },
    { phase: 'Phase 5', title: 'LinkedIn & Community Setup', weeks: 2, start: 10 },
  ];

  const ganttX = M.left + 70;
  const ganttW = CW - 70;
  const weekW = ganttW / 12;
  const rowH = 22;
  const startY = 64;

  // Week headers
  for (let w = 1; w <= 12; w++) {
    const wx = ganttX + (w - 1) * weekW;

    // Alternate background
    if (w % 2 === 0) {
      setFill(doc, [250, 250, 252]);
      doc.rect(wx, startY - 6, weekW, rowH * 5 + 22, 'F');
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setTextC(doc, C.textMuted);
    doc.text(`W${w}`, wx + weekW / 2, startY - 2, { align: 'center' });
  }

  // Divider below headers
  setDraw(doc, C.grayLight);
  doc.setLineWidth(0.3);
  doc.line(ganttX, startY + 2, ganttX + ganttW, startY + 2);

  // Phase rows
  const colors: (readonly [number, number, number])[] = [
    C.navyDark,
    C.navy,
    C.navyMid,
    [55, 85, 135],
    [75, 105, 155],
  ];

  phases.forEach((p, i) => {
    const y = startY + 8 + i * rowH;

    // Phase label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    setTextC(doc, C.textMuted);
    doc.text(p.phase, M.left, y + 4);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    setTextC(doc, C.textDark);
    doc.text(p.title, M.left, y + 11);

    // Gantt bar
    const barX = ganttX + p.start * weekW + 1;
    const barW = p.weeks * weekW - 2;
    setFill(doc, colors[i]);
    drawRoundedRect(doc, barX, y + 1, barW, 13, 2, 'F');

    // Duration label on bar
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    setTextC(doc, C.white);
    doc.text(`${p.weeks} weeks`, barX + barW / 2, y + 9.5, { align: 'center' });
  });

  // Total bar
  const totalY = startY + 8 + 5 * rowH + 8;
  drawDividerLine(doc, totalY - 6);

  setFill(doc, C.gold);
  drawRoundedRect(doc, ganttX + 1, totalY, ganttW - 2, 14, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, C.navyDark as unknown as readonly [number, number, number]);
  doc.text('TOTAL: 12 WEEKS END-TO-END EXECUTION', ganttX + ganttW / 2, totalY + 9.5, { align: 'center' });

  // Legend
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, C.textBody);
  doc.text('Phase 1', M.left, totalY + 6);

  drawConfidentialFooter(doc);
  drawPageNumber(doc, 13, 14);
}

// ─── SLIDE 15: Outcome / Closing ────────────────────────────────────────
function drawOutcomeSlide(doc: jsPDF) {
  // Full dark background
  setFill(doc, C.navyDark);
  doc.rect(0, 0, W, H, 'F');

  // Gold accent line at top
  setFill(doc, C.gold);
  doc.rect(0, 0, W, 2.5, 'F');

  // Section label
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, C.gold);
  doc.text('OUTCOME', M.left, 35);
  setFill(doc, C.gold);
  doc.rect(M.left, 37, 20, 0.6, 'F');

  // Main heading
  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, C.white);
  doc.text('A Clearer Brand.', M.left, 58);
  doc.text('A Stronger Signal.', M.left, 72);

  // Body text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, C.grayMed);
  const outcomeText = 'This engagement equips Inbox Business Solutions with a coherent, authoritative, and Saudi-relevant brand system that reflects its true institutional capability. The outcome is not a louder brand, but a clearer one\u2014one that reduces friction in enterprise conversations, shortens trust-building cycles, and positions Inbox as a long-term partner aligned with the Kingdom\'s digital and governance ambitions.';
  const lines = doc.splitTextToSize(outcomeText, CW - 20);
  doc.text(lines, M.left, 90);

  // Three outcome pillars
  const pillars = [
    { title: 'Reduce Friction', desc: 'Clearer positioning eliminates ambiguity in enterprise conversations' },
    { title: 'Build Trust Faster', desc: 'Coherent brand signal shortens decision cycles with Saudi stakeholders' },
    { title: 'Align with KSA Vision', desc: 'Position as a long-term partner in the Kingdom\'s digital transformation' },
  ];

  const pillarY = 130;
  const pillarW = (CW - 16) / 3;

  pillars.forEach((p, i) => {
    const x = M.left + i * (pillarW + 8);

    // Separator line
    setFill(doc, C.gold);
    doc.rect(x, pillarY, 20, 1.5, 'F');

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    setTextC(doc, C.white);
    doc.text(p.title, x, pillarY + 14);

    // Description
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setTextC(doc, C.grayMed);
    const dLines = doc.splitTextToSize(p.desc, pillarW - 6);
    doc.text(dLines, x, pillarY + 24);
  });

  // Bottom bar
  setFill(doc, C.navy);
  doc.rect(0, H - 28, W, 28, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setTextC(doc, C.gold);
  doc.text('INBOX BUSINESS SOLUTIONS', M.left, H - 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setTextC(doc, C.grayMed);
  doc.text('Strategic Brand Refresh \u2022 Kingdom of Saudi Arabia \u2022 2025', M.left, H - 7);

  drawPageNumber(doc, 14, 14, true);
}

// ─── MAIN GENERATOR ─────────────────────────────────────────────────────
export function generatePresentationPdf(): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // ── Slide 1: Cover
  drawCover(doc);

  // ── Slide 2: Executive Summary
  doc.addPage();
  drawExecutiveSummary(doc);

  // ── Slide 3: Strategy
  doc.addPage();
  drawStrategySlide(doc);

  // ── Slide 4: Approach
  doc.addPage();
  drawApproachSlide(doc);

  // ── Slides 5-8: Layer Details
  const layerDetails: LayerDetail[] = [
    {
      section: 'Layer 1',
      title: 'Strategic Positioning & Narrative Architecture',
      description: 'This layer establishes the intellectual foundation of the refresh. It focuses on how Inbox should be understood by Saudi enterprise decision-makers and how its diverse service portfolio is unified into a single institutional proposition.',
      bullets: [
        'Analysis of Inbox\u2019s current service mix and legacy perception',
        'Definition of a Saudi-relevant positioning anchored in governance, assurance, and operational continuity',
        'Development of a core narrative that reframes Inbox as a long-term transformation partner',
        'Message hierarchy tailored to CIOs, transformation leaders, and risk/compliance stakeholders',
      ],
      outcome: 'All subsequent design and communication decisions are grounded in strategy rather than aesthetics.',
      pageNum: 5,
    },
    {
      section: 'Layer 2',
      title: 'Brand Refresh & Governance System',
      description: 'This layer translates strategy into a disciplined brand system. The objective is to increase clarity, authority, and consistency while retaining recognizability.',
      bullets: [
        'Visual identity refresh (logo refinement, typography, color systems)',
        'Bilingual brand logic for English and Arabic contexts',
        'Development of a brand governance framework covering tone, language, and usage',
        'Templates for executive communication, proposals, and presentations',
      ],
      outcome: 'A brand that behaves consistently across leadership, sales, and public channels.',
      pageNum: 6,
    },
    {
      section: 'Layer 3',
      title: 'Website & Market-Facing Assets',
      description: 'The website is treated as an enterprise validation interface rather than a marketing brochure. Content precedes design to ensure narrative clarity.',
      bullets: [
        'Website content strategy and information architecture',
        'Executive-level copywriting for core pages and services',
        'UX and UI design aligned with enterprise credibility expectations',
        'Development of print and digital collateral including corporate and service brochures',
        'Design of client kits and swag systems aligned with Saudi executive norms',
      ],
      outcome: 'An enterprise-grade digital presence that validates institutional capability to senior decision-makers.',
      pageNum: 7,
    },
    {
      section: 'Layer 4',
      title: 'Authority & Ecosystem Presence',
      description: 'This layer focuses on sustained visibility through thought presence and selective community engagement.',
      bullets: [
        'LinkedIn positioning framework and editorial strategy for the brand and leadership',
        'Content themes centered on transformation, governance, and operational resilience',
        'Design of closed-door roundtables and executive forums',
        'Community playbook covering format, cadence, and stakeholder targeting',
      ],
      outcome: 'Sustained visibility and authority in the Saudi enterprise ecosystem through disciplined thought leadership.',
      pageNum: 8,
    },
  ];

  layerDetails.forEach((layer) => {
    doc.addPage();
    drawLayerDetailSlide(doc, layer);
  });

  // ── Slide 9: Deliverables Overview
  doc.addPage();
  drawDeliverablesOverview(doc);

  // ── Slides 10-12: Deliverable Details
  const deliverableGroups: DeliverableGroup[] = [
    {
      section: 'DELIVERABLES / STRATEGY & AUTHORITY',
      title: 'Strategy & Authority',
      items: [
        { name: 'Strategic Positioning Framework', desc: 'Saudi-specific positioning, differentiation logic, and value articulation' },
        { name: 'Narrative Architecture', desc: 'Core narrative, message hierarchy, and executive persona lenses' },
        { name: 'Go-to-Market Messaging Matrix', desc: 'Messaging alignment across CIO, Transformation, Risk & Compliance stakeholders' },
        { name: 'LinkedIn Strategy & Playbook', desc: 'Platform role definition, leadership voice framework, content pillars, and editorial calendar' },
      ],
      pageNum: 10,
    },
    {
      section: 'DELIVERABLES / WEBSITE & BRANDING',
      title: 'Website, Branding & Collateral',
      items: [
        { name: 'Website Content & Design', desc: 'Information architecture, executive-level copy, enterprise-grade UX and UI' },
        { name: 'Visual Identity Refresh', desc: 'Refined logo system, typography, and color palette' },
        { name: 'Brand Guidelines', desc: 'Comprehensive brand book covering visual, verbal, and governance rules' },
        { name: 'Brochures & Company Profile', desc: 'Corporate and service-specific brochures aligned with refreshed positioning' },
      ],
      pageNum: 11,
    },
    {
      section: 'DELIVERABLES / COLLATERAL & COMMUNITY',
      title: 'Collateral, Swag & Community',
      items: [
        { name: 'Swag & Client Kits', desc: 'Executive folders, notebooks, pens, premium packaging, welcome cards, event kits, and branded utilities' },
        { name: 'Community Strategy Framework', desc: 'Objectives, audience definition, and strategic role of community' },
        { name: 'Engagement Formats', desc: 'Roundtables, executive briefings, and small-format salons' },
        { name: 'Community Playbook', desc: 'Cadence, themes, participant curation, and facilitation approach' },
      ],
      pageNum: 12,
    },
  ];

  deliverableGroups.forEach((group) => {
    doc.addPage();
    drawDeliverableDetailSlide(doc, group);
  });

  // ── Slide 13: Timeline
  doc.addPage();
  drawTimelineSlide(doc);

  // ── Slide 14: Outcome
  doc.addPage();
  drawOutcomeSlide(doc);

  // Save
  doc.save('Inbox-Business-Solutions-Strategic-Brand-Refresh.pdf');
}
