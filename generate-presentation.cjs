const { jsPDF } = require('jspdf');
const { applyPlugin } = require('jspdf-autotable');
applyPlugin(jsPDF);
const fs = require('fs');

// ── Colors ──
const C = {
  navyDark: [10, 22, 40],
  navy: [27, 45, 79],
  navyMid: [38, 62, 105],
  gold: [200, 169, 81],
  goldLight: [218, 196, 132],
  white: [255, 255, 255],
  offWhite: [244, 245, 247],
  grayLight: [235, 237, 240],
  grayMed: [156, 163, 175],
  textDark: [26, 26, 46],
  textBody: [55, 65, 81],
  textMuted: [107, 114, 128],
};
const W = 297, H = 210, ML = 24, MR = 24;
const CW = W - ML - MR;

function sf(d, c) { d.setFillColor(c[0], c[1], c[2]); }
function sd(d, c) { d.setDrawColor(c[0], c[1], c[2]); }
function st(d, c) { d.setTextColor(c[0], c[1], c[2]); }
function pn(d, n, t, light) { d.setFontSize(8); d.setFont('helvetica', 'normal'); st(d, light ? C.grayMed : C.textMuted); d.text(String(n).padStart(2, '0') + ' / ' + String(t).padStart(2, '0'), W - MR, H - 10, { align: 'right' }); }
function sl(d, l, y, c) { d.setFontSize(9); d.setFont('helvetica', 'bold'); st(d, c || C.gold); d.text(l.toUpperCase(), ML, y); sf(d, c || C.gold); d.rect(ML, y + 1.5, 20, 0.6, 'F'); }
function hd(d, t, y, s) { d.setFontSize(s || 28); d.setFont('helvetica', 'bold'); st(d, C.textDark); d.text(t, ML, y); }
function ft(d, light) { d.setFontSize(7); d.setFont('helvetica', 'normal'); st(d, light ? [80, 90, 110] : C.textMuted); d.text('CONFIDENTIAL', ML, H - 10); d.text('Inbox Business Solutions', ML + 35, H - 10); }
function dl(d, y) { sd(d, C.grayLight); d.setLineWidth(0.3); d.line(ML, y, W - MR, y); }

const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

// ═══════════════════════════════════════════════════════
// SLIDE 1: COVER
// ═══════════════════════════════════════════════════════
sf(doc, C.navyDark); doc.rect(0, 0, W, H, 'F');
sf(doc, C.gold); doc.rect(0, 0, W, 2.5, 'F');
sf(doc, C.gold); doc.rect(ML, 45, 1.5, 80, 'F');

// Decorative dots
sf(doc, [20, 35, 60]);
for (let r = 0; r < 6; r++) for (let c2 = 0; c2 < 10; c2++) doc.circle(W - 70 + c2 * 6, 45 + r * 6, 0.6, 'F');

doc.setFontSize(14); doc.setFont('helvetica', 'bold'); st(doc, C.gold);
doc.text('INBOX BUSINESS SOLUTIONS', ML + 10, 58);

doc.setFontSize(34); doc.setFont('helvetica', 'bold'); st(doc, C.white);
const tLines = doc.splitTextToSize('Strategic Brand Refresh and Market Acceleration Framework', CW - 40);
doc.text(tLines, ML + 10, 78);

doc.setFontSize(16); doc.setFont('helvetica', 'normal'); st(doc, C.goldLight);
doc.text('Kingdom of Saudi Arabia', ML + 10, 115);

sf(doc, C.navy); doc.rect(0, H - 35, W, 35, 'F');
doc.setFontSize(9); st(doc, C.grayMed);
doc.text('CONFIDENTIAL', ML, H - 18);
doc.text('2025', W - MR, H - 18, { align: 'right' });

// ═══════════════════════════════════════════════════════
// SLIDE 2: EXECUTIVE SUMMARY
// ═══════════════════════════════════════════════════════
doc.addPage();
sf(doc, C.white); doc.rect(0, 0, W, H, 'F');
sf(doc, C.navyDark); doc.rect(0, 0, W, 1.2, 'F');
sl(doc, 'EXECUTIVE SUMMARY', 30);
hd(doc, 'Elevating Institutional Presence', 46, 26);

const stats = [
  { n: '20+', l: 'Years of Delivery', s: 'Enterprise track record' },
  { n: '750+', l: 'Projects Completed', s: 'Cross-sector portfolio' },
  { n: '12', l: 'Week Engagement', s: 'End-to-end execution' },
];
const bW = (CW - 16) / 3, bY = 58, bH = 48;
stats.forEach((stat, i) => {
  const x = ML + i * (bW + 8);
  sf(doc, C.navyDark); doc.roundedRect(x, bY, bW, bH, 3, 3, 'F');
  sf(doc, C.gold); doc.rect(x + 8, bY, 25, 2.5, 'F');
  doc.setFontSize(32); doc.setFont('helvetica', 'bold'); st(doc, C.white); doc.text(stat.n, x + 12, bY + 22);
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); st(doc, C.goldLight); doc.text(stat.l, x + 12, bY + 32);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); st(doc, C.grayMed); doc.text(stat.s, x + 12, bY + 39);
});

const sY = bY + bH + 14;
dl(doc, sY - 6);
doc.setFontSize(11.5); doc.setFont('helvetica', 'normal'); st(doc, C.textBody);
const summaryText = 'This engagement repositions Inbox Business Solutions in Saudi Arabia as an institutional-grade transformation partner. The strategy focuses on translating existing strengths\u2014longevity, delivery reliability, and cross-domain expertise\u2014into a clear, disciplined, and authoritative market signal aligned with Saudi enterprise expectations.';
const sLines = doc.splitTextToSize(summaryText, CW);
doc.text(sLines, ML, sY);
const nY = sY + sLines.length * 6 + 6;

sf(doc, [252, 249, 240]); doc.roundedRect(ML, nY, CW, 28, 2, 2, 'F');
sf(doc, C.gold); doc.rect(ML, nY, 2, 28, 'F');
doc.setFontSize(9); doc.setFont('helvetica', 'bold'); st(doc, C.gold); doc.text('KEY INSIGHT', ML + 10, nY + 8);
doc.setFontSize(11); doc.setFont('helvetica', 'italic'); st(doc, C.textBody);
const insightText = 'Brand is not an aesthetic exercise but a mechanism for reducing perceived operational and governance risk in the Saudi enterprise market.';
doc.text(doc.splitTextToSize(insightText, CW - 20), ML + 10, nY + 16);
ft(doc); pn(doc, 2, 14);

// ═══════════════════════════════════════════════════════
// SLIDE 3: STRATEGIC CONTEXT
// ═══════════════════════════════════════════════════════
doc.addPage();
sf(doc, C.white); doc.rect(0, 0, W, H, 'F');
sf(doc, C.navyDark); doc.rect(0, 0, W, 1.2, 'F');
sl(doc, '01 / STRATEGY', 30);
hd(doc, 'Strategic Context', 46, 26);

const colW = (CW - 14) / 2;
doc.setFontSize(11); doc.setFont('helvetica', 'normal'); st(doc, C.textBody);
const leftText = 'Inbox Business Solutions enters the Saudi market as an established enterprise technology organization with more than two decades of delivery history and a portfolio exceeding 750 projects across complex, regulated, and mission-critical environments.\n\nIts service portfolio spans governance, risk and compliance, cybersecurity, enterprise platforms, managed services, digital transformation, and large-scale systems integration.';
doc.text(doc.splitTextToSize(leftText, colW), ML, 56);

const rightText = 'The strategic objective is to refresh and recalibrate the Inbox brand so it is interpreted in Saudi Arabia as an institutional-grade transformation partner, rather than a generalist IT services provider.\n\nSaudi Arabia\'s enterprise market privileges partners that demonstrate continuity, regulatory literacy, and long-term alignment. The refresh is deliberately evolutionary\u2014the Inbox name, legacy, and accumulated trust remain intact.';
doc.text(doc.splitTextToSize(rightText, colW), ML + colW + 14, 56);

sf(doc, C.navyDark); doc.roundedRect(ML, 145, CW, 38, 3, 3, 'F');
const points = [
  { t: 'Positioning', d: 'Institutional-grade partner' },
  { t: 'Approach', d: 'Evolutionary, not revolutionary' },
  { t: 'Signal', d: 'Governance & assurance focus' },
];
const pW = CW / 3;
points.forEach((p, i) => {
  const px = ML + i * pW + 14;
  if (i > 0) { sd(doc, C.navyMid); doc.setLineWidth(0.3); doc.line(ML + i * pW, 153, ML + i * pW, 175); }
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); st(doc, C.gold); doc.text(p.t, px, 161);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); st(doc, C.grayMed); doc.text(p.d, px, 170);
});
ft(doc); pn(doc, 3, 14);

// ═══════════════════════════════════════════════════════
// SLIDE 4: FOUR INTEGRATED LAYERS
// ═══════════════════════════════════════════════════════
doc.addPage();
sf(doc, C.white); doc.rect(0, 0, W, H, 'F');
sf(doc, C.navyDark); doc.rect(0, 0, W, 1.2, 'F');
sl(doc, '02 / APPROACH', 30);
hd(doc, 'Four Integrated Layers', 46, 26);

doc.setFontSize(11); doc.setFont('helvetica', 'normal'); st(doc, C.textBody);
const appIntro = 'The approach is structured around the principle that brand, narrative, and experience must move in sequence, not in parallel. Authority is built first through strategic definition, then through expression, and finally through amplification.';
doc.text(doc.splitTextToSize(appIntro, CW), ML, 56);

const layers = [
  { n: '01', t: 'Strategic Definition', d: 'Crystallizing positioning, narrative, and decision logic', c: C.navyDark },
  { n: '02', t: 'Brand System Refresh', d: 'Aligning visual, verbal, and governance systems', c: C.navy },
  { n: '03', t: 'Market Interface Design', d: 'Website, collateral, and executive touchpoints', c: C.navyMid },
  { n: '04', t: 'Authority Amplification', d: 'LinkedIn presence and ecosystem participation', c: [55, 85, 135] },
];
const cW2 = (CW - 18) / 4, cY = 80, cH = 85;
layers.forEach((l, i) => {
  const x = ML + i * (cW2 + 6);
  sf(doc, l.c); doc.roundedRect(x, cY, cW2, cH, 3, 3, 'F');
  sf(doc, C.gold); doc.rect(x + 6, cY + 6, 16, 2, 'F');
  doc.setFontSize(28); doc.setFont('helvetica', 'bold'); st(doc, C.gold); doc.text(l.n, x + 6, cY + 26);
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); st(doc, C.white); doc.text(doc.splitTextToSize(l.t, cW2 - 12), x + 6, cY + 38);
  sf(doc, C.white); doc.rect(x + 6, cY + 50, cW2 - 12, 0.3, 'F');
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); st(doc, C.grayMed); doc.text(doc.splitTextToSize(l.d, cW2 - 12), x + 6, cY + 58);
  if (i < 3) { doc.setFontSize(14); st(doc, C.gold); doc.text('\u2192', x + cW2 + 1, cY + cH / 2 + 1); }
});
sf(doc, C.offWhite); doc.roundedRect(ML, cY + cH + 8, CW, 14, 2, 2, 'F');
doc.setFontSize(9.5); doc.setFont('helvetica', 'italic'); st(doc, C.textMuted);
doc.text('Each layer builds on the previous one to ensure that external signals are consistent, credible, and scalable.', ML + 8, cY + cH + 17);
ft(doc); pn(doc, 4, 14);

// ═══════════════════════════════════════════════════════
// SLIDES 5-8: LAYER DETAIL SLIDES
// ═══════════════════════════════════════════════════════
const layerDetails = [
  {
    section: 'Layer 1', title: 'Strategic Positioning\n& Narrative Architecture', pageNum: 5,
    desc: 'This layer establishes the intellectual foundation of the refresh. It focuses on how Inbox should be understood by Saudi enterprise decision-makers and how its diverse service portfolio is unified into a single institutional proposition.',
    bullets: [
      'Analysis of Inbox\u2019s current service mix and legacy perception',
      'Definition of a Saudi-relevant positioning anchored in governance, assurance, and operational continuity',
      'Development of a core narrative that reframes Inbox as a long-term transformation partner',
      'Message hierarchy tailored to CIOs, transformation leaders, and risk/compliance stakeholders',
    ],
    outcome: 'All subsequent design and communication decisions are grounded in strategy rather than aesthetics.',
  },
  {
    section: 'Layer 2', title: 'Brand Refresh\n& Governance System', pageNum: 6,
    desc: 'This layer translates strategy into a disciplined brand system. The objective is to increase clarity, authority, and consistency while retaining recognizability.',
    bullets: [
      'Visual identity refresh (logo refinement, typography, color systems)',
      'Bilingual brand logic for English and Arabic contexts',
      'Development of a brand governance framework covering tone, language, and usage',
      'Templates for executive communication, proposals, and presentations',
    ],
    outcome: 'A brand that behaves consistently across leadership, sales, and public channels.',
  },
  {
    section: 'Layer 3', title: 'Website &\nMarket-Facing Assets', pageNum: 7,
    desc: 'The website is treated as an enterprise validation interface rather than a marketing brochure. Content precedes design to ensure narrative clarity.',
    bullets: [
      'Website content strategy and information architecture',
      'Executive-level copywriting for core pages and services',
      'UX and UI design aligned with enterprise credibility expectations',
      'Print and digital collateral including corporate and service brochures',
      'Client kits and swag systems aligned with Saudi executive norms',
    ],
    outcome: 'An enterprise-grade digital presence that validates institutional capability to senior decision-makers.',
  },
  {
    section: 'Layer 4', title: 'Authority &\nEcosystem Presence', pageNum: 8,
    desc: 'This layer focuses on sustained visibility through thought presence and selective community engagement.',
    bullets: [
      'LinkedIn positioning framework and editorial strategy for the brand and leadership',
      'Content themes centered on transformation, governance, and operational resilience',
      'Design of closed-door roundtables and executive forums',
      'Community playbook covering format, cadence, and stakeholder targeting',
    ],
    outcome: 'Sustained visibility and authority in the Saudi enterprise ecosystem through disciplined thought leadership.',
  },
];

layerDetails.forEach(layer => {
  doc.addPage();
  sf(doc, C.white); doc.rect(0, 0, W, H, 'F');
  sf(doc, C.navyDark); doc.rect(0, 0, W, 1.2, 'F');

  // Left panel
  const panelW = 90;
  sf(doc, C.navyDark); doc.rect(0, 1.2, panelW, H - 1.2, 'F');
  sf(doc, C.gold); doc.rect(0, 1.2, 2, H - 1.2, 'F');

  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); st(doc, C.gold);
  doc.text(layer.section.toUpperCase(), 14, 30);

  doc.setFontSize(22); doc.setFont('helvetica', 'bold'); st(doc, C.white);
  doc.text(doc.splitTextToSize(layer.title, panelW - 24), 14, 48);

  // Right content
  const cx = panelW + 16, cw = W - panelW - 16 - MR;

  doc.setFontSize(12); doc.setFont('helvetica', 'normal'); st(doc, C.textBody);
  const dLines = doc.splitTextToSize(layer.desc, cw);
  doc.text(dLines, cx, 32);

  let bulletY = 32 + dLines.length * 6.5 + 10;
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); st(doc, C.gold);
  doc.text('KEY ACTIVITIES', cx, bulletY);
  bulletY += 10;

  layer.bullets.forEach(bullet => {
    sf(doc, C.gold); doc.circle(cx + 3, bulletY - 1.5, 1.5, 'F');
    doc.setFontSize(11); doc.setFont('helvetica', 'normal'); st(doc, C.textBody);
    const bLines = doc.splitTextToSize(bullet, cw - 12);
    doc.text(bLines, cx + 10, bulletY);
    bulletY += bLines.length * 6 + 5;
  });

  bulletY += 4;
  sf(doc, C.offWhite); doc.roundedRect(cx, bulletY, cw, 28, 2, 2, 'F');
  sf(doc, C.navyDark); doc.rect(cx, bulletY, 2.5, 28, 'F');
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); st(doc, C.navyDark);
  doc.text('OUTCOME', cx + 10, bulletY + 8);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); st(doc, C.textBody);
  doc.text(doc.splitTextToSize(layer.outcome, cw - 20), cx + 10, bulletY + 16);

  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); st(doc, C.grayMed);
  doc.text(String(layer.pageNum).padStart(2, '0') + ' / 14', panelW - 10, H - 12, { align: 'right' });
  ft(doc);
});

// ═══════════════════════════════════════════════════════
// SLIDE 9: DELIVERABLES OVERVIEW
// ═══════════════════════════════════════════════════════
doc.addPage();
sf(doc, C.white); doc.rect(0, 0, W, H, 'F');
sf(doc, C.navyDark); doc.rect(0, 0, W, 1.2, 'F');
sl(doc, '04 / DELIVERABLES', 30);
hd(doc, 'Comprehensive Deliverables', 46, 24);

doc.autoTable({
  startY: 56,
  margin: { left: ML, right: MR },
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
  styles: { fontSize: 9, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 }, lineColor: C.grayLight, lineWidth: 0.2 },
  headStyles: { fillColor: C.navyDark, textColor: C.white, fontSize: 9, fontStyle: 'bold', cellPadding: { top: 4, bottom: 4, left: 4, right: 4 } },
  bodyStyles: { textColor: C.textBody },
  alternateRowStyles: { fillColor: [250, 250, 252] },
  columnStyles: { 0: { cellWidth: 35, fontStyle: 'bold', textColor: C.navyDark }, 1: { cellWidth: 55, fontStyle: 'bold' }, 2: { cellWidth: 'auto' } },
});
ft(doc); pn(doc, 9, 14);

// ═══════════════════════════════════════════════════════
// SLIDES 10-12: DELIVERABLE DETAIL SLIDES
// ═══════════════════════════════════════════════════════
const deliverableGroups = [
  {
    section: 'DELIVERABLES / STRATEGY & AUTHORITY', title: 'Strategy & Authority', pageNum: 10,
    items: [
      { name: 'Strategic Positioning\nFramework', desc: 'Saudi-specific positioning, differentiation logic, and value articulation' },
      { name: 'Narrative\nArchitecture', desc: 'Core narrative, message hierarchy, and executive persona lenses' },
      { name: 'Go-to-Market\nMessaging Matrix', desc: 'Messaging alignment across CIO, Transformation, Risk & Compliance stakeholders' },
      { name: 'LinkedIn Strategy\n& Playbook', desc: 'Platform role definition, leadership voice framework, content pillars, and editorial calendar' },
    ],
  },
  {
    section: 'DELIVERABLES / WEBSITE & BRANDING', title: 'Website, Branding & Collateral', pageNum: 11,
    items: [
      { name: 'Website Content\n& Design', desc: 'Information architecture, executive-level copy, enterprise-grade UX and UI' },
      { name: 'Visual Identity\nRefresh', desc: 'Refined logo system, typography, and color palette' },
      { name: 'Brand\nGuidelines', desc: 'Comprehensive brand book covering visual, verbal, and governance rules' },
      { name: 'Brochures &\nCompany Profile', desc: 'Corporate and service-specific brochures aligned with refreshed positioning' },
    ],
  },
  {
    section: 'DELIVERABLES / COLLATERAL & COMMUNITY', title: 'Collateral, Swag & Community', pageNum: 12,
    items: [
      { name: 'Swag &\nClient Kits', desc: 'Executive folders, notebooks, pens, premium packaging, welcome cards, event kits' },
      { name: 'Community Strategy\nFramework', desc: 'Objectives, audience definition, and strategic role of community' },
      { name: 'Engagement\nFormats', desc: 'Roundtables, executive briefings, and small-format salons' },
      { name: 'Community\nPlaybook', desc: 'Cadence, themes, participant curation, and facilitation approach' },
    ],
  },
];

deliverableGroups.forEach(group => {
  doc.addPage();
  sf(doc, C.white); doc.rect(0, 0, W, H, 'F');
  sf(doc, C.navyDark); doc.rect(0, 0, W, 1.2, 'F');
  sl(doc, group.section, 30);
  hd(doc, group.title, 46, 22);

  const cardW = (CW - 24) / 4;
  group.items.forEach((item, i) => {
    const x = ML + i * (cardW + 8);
    const y = 60;

    // Card background
    sf(doc, C.offWhite); doc.roundedRect(x, y, cardW, 100, 3, 3, 'F');

    // Top accent bar
    sf(doc, C.navyDark); doc.roundedRect(x, y, cardW, 6, 3, 3, 'F');
    sf(doc, C.offWhite); doc.rect(x, y + 4, cardW, 4, 'F');

    // Gold accent line
    sf(doc, C.gold); doc.rect(x + 8, y + 12, 18, 1.5, 'F');

    // Title
    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); st(doc, C.navyDark);
    const nLines = doc.splitTextToSize(item.name.replace(/\n/g, ' '), cardW - 16);
    doc.text(nLines, x + 8, y + 24);

    // Divider
    sf(doc, C.grayLight); doc.rect(x + 8, y + 24 + nLines.length * 6 + 2, cardW - 16, 0.4, 'F');

    // Description
    doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); st(doc, C.textMuted);
    const dLines = doc.splitTextToSize(item.desc, cardW - 16);
    doc.text(dLines, x + 8, y + 24 + nLines.length * 6 + 10);
  });

  ft(doc); pn(doc, group.pageNum, 14);
});

// ═══════════════════════════════════════════════════════
// SLIDE 13: TIMELINE
// ═══════════════════════════════════════════════════════
doc.addPage();
sf(doc, C.white); doc.rect(0, 0, W, H, 'F');
sf(doc, C.navyDark); doc.rect(0, 0, W, 1.2, 'F');
sl(doc, '05 / TIMELINE', 30);
hd(doc, '12-Week Execution Plan', 46, 26);

const phases = [
  { phase: 'Phase 1', title: 'Strategy & Positioning', weeks: 2, start: 0 },
  { phase: 'Phase 2', title: 'Brand Refresh & Governance', weeks: 2, start: 2 },
  { phase: 'Phase 3', title: 'Website Content & Design', weeks: 4, start: 4 },
  { phase: 'Phase 4', title: 'Collateral & Swag Systems', weeks: 2, start: 8 },
  { phase: 'Phase 5', title: 'LinkedIn & Community Setup', weeks: 2, start: 10 },
];

const ganttX = ML + 75, ganttW = CW - 75, weekW = ganttW / 12, rowH = 22, startY = 64;

// Week headers
for (let w = 1; w <= 12; w++) {
  const wx = ganttX + (w - 1) * weekW;
  if (w % 2 === 0) { sf(doc, [250, 250, 252]); doc.rect(wx, startY - 6, weekW, rowH * 5 + 22, 'F'); }
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); st(doc, C.textMuted);
  doc.text('W' + w, wx + weekW / 2, startY - 2, { align: 'center' });
}
sd(doc, C.grayLight); doc.setLineWidth(0.3); doc.line(ganttX, startY + 2, ganttX + ganttW, startY + 2);

const phaseColors = [C.navyDark, C.navy, C.navyMid, [55, 85, 135], [75, 105, 155]];
phases.forEach((p, i) => {
  const y = startY + 8 + i * rowH;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); st(doc, C.textMuted); doc.text(p.phase, ML, y + 4);
  doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); st(doc, C.textDark); doc.text(p.title, ML, y + 11);

  const barX = ganttX + p.start * weekW + 1, barW = p.weeks * weekW - 2;
  sf(doc, phaseColors[i]); doc.roundedRect(barX, y + 1, barW, 13, 2, 2, 'F');
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); st(doc, C.white);
  doc.text(p.weeks + ' weeks', barX + barW / 2, y + 9.5, { align: 'center' });
});

const totalY = startY + 8 + 5 * rowH + 8;
dl(doc, totalY - 6);
sf(doc, C.gold); doc.roundedRect(ganttX + 1, totalY, ganttW - 2, 14, 2, 2, 'F');
doc.setFontSize(10); doc.setFont('helvetica', 'bold'); st(doc, C.navyDark);
doc.text('TOTAL: 12 WEEKS END-TO-END EXECUTION', ganttX + ganttW / 2, totalY + 9.5, { align: 'center' });
ft(doc); pn(doc, 13, 14);

// ═══════════════════════════════════════════════════════
// SLIDE 14: OUTCOME / CLOSING
// ═══════════════════════════════════════════════════════
doc.addPage();
sf(doc, C.navyDark); doc.rect(0, 0, W, H, 'F');
sf(doc, C.gold); doc.rect(0, 0, W, 2.5, 'F');

doc.setFontSize(9); doc.setFont('helvetica', 'bold'); st(doc, C.gold);
doc.text('OUTCOME', ML, 35);
sf(doc, C.gold); doc.rect(ML, 37, 20, 0.6, 'F');

doc.setFontSize(30); doc.setFont('helvetica', 'bold'); st(doc, C.white);
doc.text('A Clearer Brand.', ML, 58);
doc.text('A Stronger Signal.', ML, 72);

doc.setFontSize(12); doc.setFont('helvetica', 'normal'); st(doc, C.grayMed);
const outcomeText = 'This engagement equips Inbox Business Solutions with a coherent, authoritative, and Saudi-relevant brand system that reflects its true institutional capability. The outcome is not a louder brand, but a clearer one\u2014one that reduces friction in enterprise conversations, shortens trust-building cycles, and positions Inbox as a long-term partner aligned with the Kingdom\'s digital and governance ambitions.';
doc.text(doc.splitTextToSize(outcomeText, CW - 20), ML, 90);

const pillars = [
  { title: 'Reduce Friction', desc: 'Clearer positioning eliminates ambiguity in enterprise conversations' },
  { title: 'Build Trust Faster', desc: 'Coherent brand signal shortens decision cycles with Saudi stakeholders' },
  { title: 'Align with KSA Vision', desc: 'Position as a long-term partner in the Kingdom\'s digital transformation' },
];
const pillarY = 130, pillarW = (CW - 16) / 3;
pillars.forEach((p, i) => {
  const x = ML + i * (pillarW + 8);
  sf(doc, C.gold); doc.rect(x, pillarY, 20, 1.5, 'F');
  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); st(doc, C.white); doc.text(p.title, x, pillarY + 14);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); st(doc, C.grayMed);
  doc.text(doc.splitTextToSize(p.desc, pillarW - 6), x, pillarY + 24);
});

sf(doc, C.navy); doc.rect(0, H - 28, W, 28, 'F');
doc.setFontSize(11); doc.setFont('helvetica', 'bold'); st(doc, C.gold);
doc.text('INBOX BUSINESS SOLUTIONS', ML, H - 14);
doc.setFontSize(9); doc.setFont('helvetica', 'normal'); st(doc, C.grayMed);
doc.text('Strategic Brand Refresh \u2022 Kingdom of Saudi Arabia \u2022 2025', ML, H - 7);
pn(doc, 14, 14, true);

// ═══════════════════════════════════════════════════════
// SAVE
// ═══════════════════════════════════════════════════════
const pdfOutput = doc.output('arraybuffer');
fs.writeFileSync('/home/user/dns/Inbox-Business-Solutions-Strategic-Brand-Refresh.pdf', Buffer.from(pdfOutput));
console.log('PDF generated successfully!');
console.log('File: /home/user/dns/Inbox-Business-Solutions-Strategic-Brand-Refresh.pdf');
