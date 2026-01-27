import ExcelJS from "exceljs";

const workbook = new ExcelJS.Workbook();
workbook.creator = "Adeel Ahmed - Miradore";
workbook.created = new Date();

const ws = workbook.addWorksheet("Event Budget", {
  properties: { tabColor: { argb: "FF1A237E" } },
  pageSetup: {
    paperSize: 9,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    margins: { left: 0.4, right: 0.4, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
  },
});

// ── Color palette ──
const navy = "FF1A237E";
const darkNavy = "FF0D1642";
const gold = "FFD4AF37";
const lightGold = "FFFFF8E7";
const white = "FFFFFFFF";
const lightGray = "FFF5F5F5";
const medGray = "FFE0E0E0";
const darkText = "FF212121";
const catBg = "FF283593";
const catText = "FFFFD54F";

// ── Column widths ──
ws.columns = [
  { key: "A", width: 5 },    // #
  { key: "B", width: 28 },   // Element / Item
  { key: "C", width: 40 },   // Specifications / Scope
  { key: "D", width: 22 },   // Qty / Size
  { key: "E", width: 18 },   // Unit Rate (SAR)
  { key: "F", width: 18 },   // Total (SAR)
];

// ── Utility functions ──
function styleCell(cell, { font, fill, alignment, border, numFmt } = {}) {
  if (font) cell.font = font;
  if (fill) cell.fill = fill;
  if (alignment) cell.alignment = alignment;
  if (border) cell.border = border;
  if (numFmt) cell.numFmt = numFmt;
}

function solidFill(color) {
  return { type: "pattern", pattern: "solid", fgColor: { argb: color } };
}

function thinBorder(color = "FFD0D0D0") {
  const side = { style: "thin", color: { argb: color } };
  return { top: side, bottom: side, left: side, right: side };
}

function medBorder(color = "FF9E9E9E") {
  const side = { style: "medium", color: { argb: color } };
  return { top: side, bottom: side, left: side, right: side };
}

// ═══════════════════════════════════════════════════════════════
// TITLE SECTION
// ═══════════════════════════════════════════════════════════════

// Row 1: Main title bar
ws.mergeCells("A1:F1");
const titleCell = ws.getCell("A1");
titleCell.value = "COMMERCIAL PROPOSAL";
styleCell(titleCell, {
  font: { name: "Calibri", size: 22, bold: true, color: { argb: white } },
  fill: solidFill(darkNavy),
  alignment: { horizontal: "center", vertical: "middle" },
});
ws.getRow(1).height = 50;

// Row 2: Subtitle bar
ws.mergeCells("A2:F2");
const subtitleCell = ws.getCell("A2");
subtitleCell.value = "CLOCK TOWER EVENT";
styleCell(subtitleCell, {
  font: { name: "Calibri", size: 16, bold: true, color: { argb: gold } },
  fill: solidFill(navy),
  alignment: { horizontal: "center", vertical: "middle" },
});
ws.getRow(2).height = 38;

// Row 3: Separator
ws.mergeCells("A3:F3");
const sepCell = ws.getCell("A3");
sepCell.value = "";
styleCell(sepCell, { fill: solidFill(gold) });
ws.getRow(3).height = 4;

// Row 4: Info bar
ws.mergeCells("A4:C4");
const infoLeft = ws.getCell("A4");
infoLeft.value = "  Prepared by: ADEEL AHMED";
styleCell(infoLeft, {
  font: { name: "Calibri", size: 10, italic: true, color: { argb: "FF616161" } },
  fill: solidFill(lightGray),
  alignment: { horizontal: "left", vertical: "middle" },
});
ws.mergeCells("D4:F4");
const infoRight = ws.getCell("D4");
infoRight.value = "Company: MIRADORE  ";
styleCell(infoRight, {
  font: { name: "Calibri", size: 10, italic: true, color: { argb: "FF616161" } },
  fill: solidFill(lightGray),
  alignment: { horizontal: "right", vertical: "middle" },
});
ws.getRow(4).height = 24;

// Row 5: Spacer
ws.getRow(5).height = 10;

// ═══════════════════════════════════════════════════════════════
// TABLE HEADER
// ═══════════════════════════════════════════════════════════════

const headerRow = ws.getRow(6);
const headers = ["#", "ELEMENT / ITEM", "SPECIFICATIONS / SCOPE", "QTY / SIZE", "UNIT RATE (SAR)", "TOTAL (SAR)"];
headers.forEach((h, i) => {
  const cell = headerRow.getCell(i + 1);
  cell.value = h;
  styleCell(cell, {
    font: { name: "Calibri", size: 11, bold: true, color: { argb: white } },
    fill: solidFill(navy),
    alignment: { horizontal: i >= 4 ? "right" : (i === 0 ? "center" : "left"), vertical: "middle", wrapText: true },
    border: medBorder(navy),
  });
});
headerRow.height = 32;

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════

const categories = [
  {
    name: "LED SCREENS & MEDIA",
    icon: "🖥",
    items: [
      ["Center LED Screen", "High-brightness LED screen, installation & operation", "10m × 4m (40 sqm)", "400 / sqm", 16000],
      ["Side LED Screens", "Supporting LED screens (left & right)", "2 × (3m × 4m) = 24 sqm", "400 / sqm", 9600],
      ["Media Server", "Playback server, redundancy & tech support", "1", "Lump Sum", 6000],
    ],
  },
  {
    name: "STAGE & FLOORING",
    icon: "🎭",
    items: [
      ["Main Stage Structure", "Heavy-duty modular stage", "16m × 4m × 1.1m", "180 / sqm", 11520],
      ["Stage Carpet", "Premium carpet finish", "Lump Sum", "—", 4000],
    ],
  },
  {
    name: "SOUND SYSTEM",
    icon: "🔊",
    items: [
      ["Line Array System", "Full PA system with tuning & operation", "—", "Lump Sum", 15000],
      ["Subwoofers", "Low-frequency reinforcement", "6", "Included", null],
      ["High Speakers", "Main speakers", "12", "Included", null],
      ["Stage Monitors", "Speaker foldback", "4", "Included", null],
      ["Microphones", "Wired & wireless (incl. SM58)", "—", "Included", null],
    ],
  },
  {
    name: "LIGHTING SYSTEM",
    icon: "💡",
    items: [
      ["Truss Structure", "T-Truss with rigging", "2", "Included", 8000],
      ["Stage & Ambient Lights", "Stage wash + city colors", "6", "Included", 5000],
    ],
  },
  {
    name: "VIP HOSPITALITY",
    icon: "🥂",
    items: [
      ["Guest Hospitality", "VIP catering, service coordination", "—", "Lump Sum", 8000],
    ],
  },
  {
    name: "PHOTO & MEDIA",
    icon: "📸",
    items: [
      ["Branded Photo Wall", "Logo wall with lighting & carpet", "6m × 2.4m", "Lump Sum", 9500],
      ["Instant Photography", "Photographer, editor & instant prints", "50 prints", "Lump Sum", 4000],
    ],
  },
  {
    name: "FURNITURE & SEATING",
    icon: "🪑",
    items: [
      ["VIP Sofas", "Premium sofas", "50 units", "200 / unit", 10000],
      ["Balcony Hospitality Tables", "High tables with service", "20 tables", "1,000 / table", 20000],
    ],
  },
  {
    name: "EVENT STAFFING",
    icon: "👥",
    items: [
      ["Ushers", "Professional guest management staff", "10", "450 / person", 4500],
    ],
  },
  {
    name: "BADGING & ACCESS",
    icon: "🏷",
    items: [
      ["VIP Badges", "Printed badges with holders", "50", "30 / badge", 1500],
    ],
  },
];

let rowNum = 7;
let itemCounter = 1;
let alternateRow = false;

categories.forEach((cat) => {
  // Category header row
  ws.mergeCells(`A${rowNum}:F${rowNum}`);
  const catCell = ws.getCell(`A${rowNum}`);
  catCell.value = `  ${cat.icon}  ${cat.name}`;
  styleCell(catCell, {
    font: { name: "Calibri", size: 12, bold: true, color: { argb: catText } },
    fill: solidFill(catBg),
    alignment: { horizontal: "left", vertical: "middle" },
    border: medBorder(catBg),
  });
  ws.getRow(rowNum).height = 30;
  rowNum++;
  alternateRow = false;

  // Items
  cat.items.forEach((item) => {
    const row = ws.getRow(rowNum);
    const bgColor = alternateRow ? lightGray : white;

    const values = [itemCounter, item[0], item[1], item[2], item[3], item[4]];
    values.forEach((val, i) => {
      const cell = row.getCell(i + 1);

      if (i === 5 && val !== null) {
        cell.value = val;
        cell.numFmt = '#,##0';
      } else if (i === 5 && val === null) {
        cell.value = "—";
      } else {
        cell.value = val;
      }

      const isNum = i >= 4;
      styleCell(cell, {
        font: {
          name: "Calibri",
          size: 10.5,
          color: { argb: darkText },
          bold: i === 1,
        },
        fill: solidFill(bgColor),
        alignment: {
          horizontal: isNum ? "right" : (i === 0 ? "center" : "left"),
          vertical: "middle",
          wrapText: true,
        },
        border: thinBorder(),
      });
    });
    row.height = 24;
    rowNum++;
    itemCounter++;
    alternateRow = !alternateRow;
  });
});

// ═══════════════════════════════════════════════════════════════
// SUBTOTAL / COMMISSION / TOTAL
// ═══════════════════════════════════════════════════════════════

// Spacer row
ws.getRow(rowNum).height = 6;
rowNum++;

// Subtotal line
const subtotal = 150213 - 19593; // 130,620
ws.mergeCells(`A${rowNum}:E${rowNum}`);
const subCell = ws.getCell(`A${rowNum}`);
subCell.value = "SUBTOTAL";
styleCell(subCell, {
  font: { name: "Calibri", size: 11, bold: true, color: { argb: darkText } },
  fill: solidFill(medGray),
  alignment: { horizontal: "right", vertical: "middle" },
  border: medBorder("FF9E9E9E"),
});
const subValCell = ws.getCell(`F${rowNum}`);
subValCell.value = subtotal;
subValCell.numFmt = '#,##0';
styleCell(subValCell, {
  font: { name: "Calibri", size: 11, bold: true, color: { argb: darkText } },
  fill: solidFill(medGray),
  alignment: { horizontal: "right", vertical: "middle" },
  border: medBorder("FF9E9E9E"),
});
ws.getRow(rowNum).height = 30;
rowNum++;

// Agency Commission row
ws.mergeCells(`A${rowNum}:E${rowNum}`);
const commCell = ws.getCell(`A${rowNum}`);
commCell.value = "AGENCY COMMISSION";
styleCell(commCell, {
  font: { name: "Calibri", size: 11, bold: false, color: { argb: "FF424242" } },
  fill: solidFill(lightGold),
  alignment: { horizontal: "right", vertical: "middle" },
  border: thinBorder(),
});
const commValCell = ws.getCell(`F${rowNum}`);
commValCell.value = 19593;
commValCell.numFmt = '#,##0';
styleCell(commValCell, {
  font: { name: "Calibri", size: 11, bold: false, color: { argb: "FF424242" } },
  fill: solidFill(lightGold),
  alignment: { horizontal: "right", vertical: "middle" },
  border: thinBorder(),
});
ws.getRow(rowNum).height = 28;
rowNum++;

// Gold separator
ws.mergeCells(`A${rowNum}:F${rowNum}`);
ws.getCell(`A${rowNum}`).value = "";
styleCell(ws.getCell(`A${rowNum}`), { fill: solidFill(gold) });
ws.getRow(rowNum).height = 3;
rowNum++;

// TOTAL row
ws.mergeCells(`A${rowNum}:E${rowNum}`);
const totalLabelCell = ws.getCell(`A${rowNum}`);
totalLabelCell.value = "TOTAL PROJECT COST";
styleCell(totalLabelCell, {
  font: { name: "Calibri", size: 14, bold: true, color: { argb: white } },
  fill: solidFill(darkNavy),
  alignment: { horizontal: "right", vertical: "middle" },
  border: medBorder(darkNavy),
});
const totalValCell = ws.getCell(`F${rowNum}`);
totalValCell.value = 150213;
totalValCell.numFmt = '"SAR " #,##0';
styleCell(totalValCell, {
  font: { name: "Calibri", size: 14, bold: true, color: { argb: gold } },
  fill: solidFill(darkNavy),
  alignment: { horizontal: "right", vertical: "middle" },
  border: medBorder(darkNavy),
});
ws.getRow(rowNum).height = 42;
rowNum++;

// ═══════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════

rowNum++;
ws.mergeCells(`A${rowNum}:F${rowNum}`);
const footerCell = ws.getCell(`A${rowNum}`);
footerCell.value = "All prices are in Saudi Riyal (SAR). This proposal is valid for 30 days from the date of issue.";
styleCell(footerCell, {
  font: { name: "Calibri", size: 9, italic: true, color: { argb: "FF9E9E9E" } },
  alignment: { horizontal: "center", vertical: "middle" },
});
ws.getRow(rowNum).height = 22;

// ═══════════════════════════════════════════════════════════════
// Print setup
// ═══════════════════════════════════════════════════════════════
ws.views = [{ state: "frozen", ySplit: 6 }]; // Freeze header

// Write file
const outputPath = "/home/user/dns/Clock_Tower_Event_Proposal.xlsx";
await workbook.xlsx.writeFile(outputPath);
console.log(`Excel file generated: ${outputPath}`);
