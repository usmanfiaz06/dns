import { useState } from 'react';
import { Download, FileText, X } from 'lucide-react';
import type { Invoice } from '../types/invoice';
import { generatePDF, previewPDF } from '../utils/pdfGenerator';

interface SharedInvoiceViewProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export default function SharedInvoiceView({ invoice, onClose }: SharedInvoiceViewProps) {
  const [pdfUrl] = useState(() => invoice ? previewPDF(invoice) : '');

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invoice Not Found</h2>
          <p className="text-gray-500 mb-6">This invoice may have been deleted or the link is invalid.</p>
          <button
            onClick={onClose}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">{invoice.clientName || 'Quotation'}</h1>
            <p className="text-xs text-gray-500">QNS Padel Courts Quotation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => generatePDF(invoice)}
            className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Download size={16} />
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 p-4 lg:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl h-[calc(100vh-80px)]">
          <iframe
            src={pdfUrl}
            className="w-full h-full rounded-xl border border-gray-200 shadow-lg bg-white"
            title="Invoice PDF"
          />
        </div>
      </div>
    </div>
  );
}
