# QNS Padel Courts - Invoice Generator

A professional invoice generator application for QNS Padel Courts, built with React, TypeScript, and Tailwind CSS.

## Features

- **Invoice Management**: Create, edit, duplicate, and delete invoices
- **Customizable Quotation Items**: Add/remove items with editable descriptions and toggle visibility
- **Pricing Options**:
  - Toggle tax inclusion with customizable percentage
  - Toggle civil work with min/max price range
  - Add-ons support
- **Payment Structure**: Configurable advance, delivery, and completion percentages
- **Terms & Conditions**: Editable list of terms
- **PDF Export**: Professional multi-page PDF with:
  - Cover page with QNS branding
  - Company introduction
  - Past projects showcase
  - Detailed quotation table
  - Terms and conditions
- **Local Storage**: All invoices are automatically saved locally

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Create New Invoice**: Click "New Invoice" to start a new quotation
2. **Edit Details**: Fill in client name, date, number of courts, and pricing
3. **Customize Items**: Enable/disable quotation items and edit their descriptions
4. **Configure Pricing**: Toggle tax and civil work options as needed
5. **Add Add-ons**: Include additional items like rackets or balls
6. **Edit Terms**: Customize terms and conditions
7. **Preview/Export**: Preview the PDF or export directly

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS
- jsPDF (PDF generation)
- jspdf-autotable (Table formatting in PDF)
- Lucide React (Icons)
- Vite (Build tool)

## Project Structure

```
src/
├── components/
│   ├── InvoiceList.tsx    # Invoice list view with CRUD
│   └── InvoiceEditor.tsx  # Invoice editing interface
├── hooks/
│   └── useLocalStorage.ts # Local storage persistence hook
├── types/
│   └── invoice.ts         # TypeScript types and defaults
├── utils/
│   └── pdfGenerator.ts    # PDF generation logic
├── App.tsx                # Main application component
├── main.tsx               # Entry point
└── index.css              # Global styles with Tailwind
```

## License

Proprietary - QNS Padel Courts by Super Dialer (Pvt. SMC) ltd.
