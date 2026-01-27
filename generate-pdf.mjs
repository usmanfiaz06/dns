import PDFDocument from "pdfkit";
import fs from "fs";

// ── A4 dimensions in points (595.28 × 841.89) ──
const doc = new PDFDocument({
  size: "A4",
  margins: { top: 30, bottom: 30, left: 32, right: 32 },
});

const out = fs.createWriteStream("/home/user/dns/Clock_Tower_Event_Quote.pdf");
doc.pipe(out);

// ── Colors ──
const navy = "#1A237E";
const darkNavy = "#0D1642";
const gold = "#D4AF37";
const white = "#FFFFFF";
const lightGray = "#F5F5F5";
const medGray = "#E0E0E0";
const darkText = "#212121";
const catBg = "#283593";
const catText = "#FFD54F";
const lightGold = "#FFF8E7";
const subtleGray = "#9E9E9E";

// ── Page geometry ──
const pageW = 595.28;
const leftM = 32;
const rightM = 32;
const tableW = pageW - leftM - rightM;

// Column widths (total = tableW ≈ 531)
const cols = [26, 120, 155, 80, 72, 78];
const colX = [];
let cx = leftM;
for (const w of cols) { colX.push(cx); cx += w; }

// ── Helper: draw filled rect ──
function rect(x, y, w, h, color) {
  doc.save().rect(x, y, w, h).fill(color).restore();
}

// ── Helper: draw text in cell ──
function cellText(text, x, y, w, h, { font = "Helvetica", size = 8, color = darkText, align = "left", wrap = false } = {}) {
  const textH = wrap ? size * 2.2 : size;
  const topPad = Math.max(0, (h - textH) / 2);
  doc.save()
    .font(font).fontSize(size).fillColor(color)
    .text(text, x + 4, y + topPad, {
      width: w - 8,
      align,
      lineBreak: wrap,
      ellipsis: !wrap,
      height: wrap ? h - 2 : undefined,
    })
    .restore();
}

// ── Helper: measure if text needs wrapping ──
function needsWrap(text, font, size, colWidth) {
  doc.save().font(font).fontSize(size);
  const tw = doc.widthOfString(text);
  doc.restore();
  return tw > (colWidth - 8);
}

// ── Helper: thin border around cell ──
function cellBorder(x, y, w, h, color = "#D0D0D0") {
  doc.save().rect(x, y, w, h).lineWidth(0.3).strokeColor(color).stroke().restore();
}

// ── Helper: draw full-width row bg ──
function rowBg(y, h, color) {
  rect(leftM, y, tableW, h, color);
}

let y = 30;

// ═══════════════════════════════════════════════
// TITLE BAR
// ═══════════════════════════════════════════════
const titleH = 36;
rowBg(y, titleH, darkNavy);
doc.save().font("Helvetica-Bold").fontSize(18).fillColor(white)
  .text("COMMERCIAL PROPOSAL", leftM, y + 9, { width: tableW, align: "center" }).restore();
y += titleH;

// Subtitle
const subH = 26;
rowBg(y, subH, navy);
doc.save().font("Helvetica-Bold").fontSize(13).fillColor(gold)
  .text("CLOCK TOWER EVENT", leftM, y + 7, { width: tableW, align: "center" }).restore();
y += subH;

// Gold line
rowBg(y, 3, gold);
y += 3;

// Info bar
const infoH = 18;
rowBg(y, infoH, lightGray);
doc.save().font("Helvetica-Oblique").fontSize(7.5).fillColor("#616161")
  .text("Prepared by: ADEEL AHMED", leftM + 6, y + 5, { width: tableW / 2, align: "left" })
  .text("Company: MIRADORE", leftM + tableW / 2, y + 5, { width: tableW / 2 - 6, align: "right" })
  .restore();
y += infoH;

y += 6;

// ═══════════════════════════════════════════════
// TABLE HEADER
// ═══════════════════════════════════════════════
const headerH = 22;
rowBg(y, headerH, navy);
const headers = ["#", "ELEMENT / ITEM", "SPECIFICATIONS / SCOPE", "QTY / SIZE", "UNIT RATE\n(SAR)", "TOTAL\n(SAR)"];
const hAligns = ["center", "left", "left", "left", "right", "right"];
headers.forEach((h, i) => {
  cellText(h, colX[i], y, cols[i], headerH, {
    font: "Helvetica-Bold", size: 7, color: white, align: hAligns[i],
  });
});
y += headerH;

// ═══════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════
const categories = [
  {
    name: "LED SCREENS & MEDIA",
    items: [
      ["Center LED Screen", "High-brightness LED screen, installation & operation", "10m × 4m (40 sqm)", "450 / sqm", 18000],
      ["Side LED Screens", "Supporting LED screens (left & right)", "2 × (3m×4m) = 24 sqm", "450 / sqm", 10800],
      ["Media Server", "Playback server, redundancy & tech support", "1", "Lump Sum", 6500],
    ],
  },
  {
    name: "STAGE & FLOORING",
    items: [
      ["Main Stage Structure", "Heavy-duty modular stage", "16m × 4m × 1.1m", "200 / sqm", 12800],
      ["Stage Carpet", "Premium carpet finish", "Lump Sum", "—", 4500],
    ],
  },
  {
    name: "SOUND SYSTEM",
    items: [
      ["Line Array System", "Full PA system with tuning & operation", "—", "Lump Sum", 16500],
      ["Subwoofers", "Low-frequency reinforcement", "6", "Included", null],
      ["High Speakers", "Main speakers", "12", "Included", null],
      ["Stage Monitors", "Speaker foldback", "4", "Included", null],
      ["Microphones", "Wired & wireless (incl. SM58)", "—", "Included", null],
    ],
  },
  {
    name: "LIGHTING SYSTEM",
    items: [
      ["Truss Structure", "T-Truss with rigging", "2", "Included", 8500],
      ["Stage & Ambient Lights", "Stage wash + city colors", "6", "Included", 5500],
    ],
  },
  {
    name: "VIP HOSPITALITY",
    items: [
      ["Guest Hospitality", "VIP catering, service coordination", "—", "Lump Sum", 9000],
    ],
  },
  {
    name: "PHOTO & MEDIA",
    items: [
      ["Branded Photo Wall", "Logo wall with lighting & carpet", "6m × 2.4m", "Lump Sum", 10500],
      ["Instant Photography", "Photographer, editor & instant prints", "50 prints", "Lump Sum", 4500],
    ],
  },
  {
    name: "FURNITURE & SEATING",
    items: [
      ["VIP Sofas", "Premium sofas", "50 units", "220 / unit", 11000],
      ["Balcony Hospitality Tables", "High tables with service", "20 tables", "1,050 / table", 21000],
    ],
  },
  {
    name: "EVENT STAFFING",
    items: [
      ["Ushers", "Professional guest management staff", "10", "500 / person", 5000],
    ],
  },
  {
    name: "BADGING & ACCESS",
    items: [
      ["VIP Badges", "Printed badges with holders", "50", "30 / badge", 1500],
    ],
  },
];

function fmtNum(n) {
  return n.toLocaleString("en-US");
}

let itemNum = 1;
const catH = 20;
const rowHMin = 18;
const rowHWrap = 26; // taller row when text wraps

categories.forEach((cat) => {
  // Category header
  rowBg(y, catH, catBg);
  doc.save().font("Helvetica-Bold").fontSize(8.5).fillColor(catText)
    .text(cat.name, leftM + 8, y + (catH - 8.5) / 2, { width: tableW - 16, align: "left" })
    .restore();
  y += catH;

  let alt = false;
  cat.items.forEach((item) => {
    // Check if specs or qty text needs wrapping
    const specWraps = needsWrap(item[1], "Helvetica", 7, cols[2]);
    const qtyWraps = needsWrap(item[2], "Helvetica", 7.5, cols[3]);
    const rowH = (specWraps || qtyWraps) ? rowHWrap : rowHMin;

    const bg = alt ? lightGray : white;
    rowBg(y, rowH, bg);

    // # column
    cellText(String(itemNum), colX[0], y, cols[0], rowH, { size: 7.5, align: "center" });
    cellBorder(colX[0], y, cols[0], rowH);

    // Element
    cellText(item[0], colX[1], y, cols[1], rowH, { font: "Helvetica-Bold", size: 7.5 });
    cellBorder(colX[1], y, cols[1], rowH);

    // Specs - allow wrap
    cellText(item[1], colX[2], y, cols[2], rowH, { size: 7, color: "#424242", wrap: specWraps });
    cellBorder(colX[2], y, cols[2], rowH);

    // Qty - allow wrap
    cellText(item[2], colX[3], y, cols[3], rowH, { size: 7.5, wrap: qtyWraps });
    cellBorder(colX[3], y, cols[3], rowH);

    // Unit Rate
    cellText(item[3], colX[4], y, cols[4], rowH, { size: 7.5, align: "right" });
    cellBorder(colX[4], y, cols[4], rowH);

    // Total
    const totalStr = item[4] !== null ? fmtNum(item[4]) : "—";
    cellText(totalStr, colX[5], y, cols[5], rowH, { font: item[4] ? "Helvetica-Bold" : "Helvetica", size: 7.5, align: "right" });
    cellBorder(colX[5], y, cols[5], rowH);

    y += rowH;
    itemNum++;
    alt = !alt;
  });
});

// ═══════════════════════════════════════════════
// SUMMARY ROWS
// ═══════════════════════════════════════════════
y += 4;

// Subtotal
const summH = 22;
const labelW = cols[0] + cols[1] + cols[2] + cols[3] + cols[4];
const valW = cols[5];
rowBg(y, summH, medGray);
cellText("SUBTOTAL", leftM, y, labelW, summH, { font: "Helvetica-Bold", size: 9, align: "right" });
cellText(fmtNum(146100), leftM + labelW, y, valW, summH, { font: "Helvetica-Bold", size: 9, align: "right" });
doc.save().rect(leftM, y, tableW, summH).lineWidth(0.5).strokeColor("#9E9E9E").stroke().restore();
y += summH;

// Agency Commission
const commH = 20;
rowBg(y, commH, lightGold);
cellText("AGENCY COMMISSION", leftM, y, labelW, commH, { size: 8.5, color: "#424242", align: "right" });
cellText(fmtNum(18900), leftM + labelW, y, valW, commH, { size: 8.5, color: "#424242", align: "right" });
doc.save().rect(leftM, y, tableW, commH).lineWidth(0.3).strokeColor("#D0D0D0").stroke().restore();
y += commH;

// Gold separator
rowBg(y, 3, gold);
y += 3;

// TOTAL
const totalH = 30;
rowBg(y, totalH, darkNavy);
// Label spans cols 0-4, value in col 5 (wider area for SAR amount)
const totalLabelW = cols[0] + cols[1] + cols[2] + cols[3];
const totalValW = cols[4] + cols[5];
cellText("TOTAL PROJECT COST", leftM, y, totalLabelW, totalH, { font: "Helvetica-Bold", size: 12, color: white, align: "right" });
cellText("SAR " + fmtNum(165000), leftM + totalLabelW, y, totalValW, totalH, { font: "Helvetica-Bold", size: 12, color: gold, align: "right" });
y += totalH;

// ═══════════════════════════════════════════════
// FOOTER NOTE
// ═══════════════════════════════════════════════
y += 10;
doc.save().font("Helvetica-Oblique").fontSize(6.5).fillColor(subtleGray)
  .text("All prices are in Saudi Riyal (SAR). This proposal is valid for 30 days from the date of issue.", leftM, y, { width: tableW, align: "center" })
  .restore();

// ═══════════════════════════════════════════════
doc.end();
out.on("finish", () => {
  console.log("PDF generated: /home/user/dns/Clock_Tower_Event_Quote.pdf");
});
