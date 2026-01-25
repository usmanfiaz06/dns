import type { Invoice } from '../types/invoice';
import { Plus, FileText, Edit2, Copy, Trash2, Download } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';

interface InvoiceListProps {
  invoices: Invoice[];
  onCreateNew: () => void;
  onEdit: (invoice: Invoice) => void;
  onDuplicate: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatCurrency = (amount: number): string => {
  return `PKR ${amount.toLocaleString('en-PK')}`;
};

export function InvoiceList({ invoices, onCreateNew, onEdit, onDuplicate, onDelete }: InvoiceListProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#8BC34A] rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-[2px] bg-white transform rotate-[-45deg]"></div>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">QNS Padel Courts</h1>
                <p className="text-sm text-gray-500">Invoice Generator</p>
              </div>
            </div>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors font-medium"
            >
              <Plus size={20} />
              New Invoice
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {invoices.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No invoices yet</h3>
            <p className="mt-2 text-gray-500">Get started by creating your first invoice.</p>
            <button
              onClick={onCreateNew}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors font-medium"
            >
              <Plus size={20} />
              Create First Invoice
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">All Invoices ({invoices.length})</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#8BC34A]/10 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-[#8BC34A]" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {invoice.clientName || 'Unnamed Client'}
                            </p>
                            <p className="text-xs text-gray-500">{invoice.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.numberOfCourts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.subTotal * invoice.numberOfCourts)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.includeTax ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.includeTax ? 'With Tax' : 'Excl. Tax'}
                        </span>
                        {invoice.includeCivilWork && (
                          <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            + Civil
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => generatePDF(invoice)}
                            className="p-2 text-gray-400 hover:text-[#8BC34A] hover:bg-[#8BC34A]/10 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => onEdit(invoice)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => onDuplicate(invoice)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Duplicate"
                          >
                            <Copy size={18} />
                          </button>
                          <button
                            onClick={() => onDelete(invoice.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
