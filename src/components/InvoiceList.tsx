import { FilePlus, FileText, Download, Copy, Trash2, Eye, Clock, Edit3, Link, Check, Search } from 'lucide-react';
import { useState } from 'react';
import type { Invoice } from '../types/invoice';
import { generatePDF } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';

interface InvoiceListProps {
  invoices: Invoice[];
  onCreateNew: () => void;
  onEdit: (invoice: Invoice) => void;
  onDuplicate: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function InvoiceList({ invoices, onCreateNew, onEdit, onDuplicate, onDelete }: InvoiceListProps) {
  const { companySettings } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleDownload = (invoice: Invoice) => {
    if (companySettings) {
      const merged = {
        ...invoice,
        companyProfile: {
          ...invoice.companyProfile,
          logoData: companySettings.logoData || invoice.companyProfile?.logoData || '',
          companyName: companySettings.name || invoice.companyProfile?.companyName || 'QNS',
          tagline: companySettings.tagline || invoice.companyProfile?.tagline || 'Padel Courts',
          byLine: companySettings.byLine || invoice.companyProfile?.byLine || '',
          aboutTitle: companySettings.aboutTitle || invoice.companyProfile?.aboutTitle || '',
          aboutText: companySettings.aboutText || invoice.companyProfile?.aboutText || '',
          introImage: companySettings.introImage || invoice.companyProfile?.introImage || '',
          features: companySettings.features?.length ? companySettings.features : invoice.companyProfile?.features || [],
        },
      };
      generatePDF(merged);
    } else {
      generatePDF(invoice);
    }
  };

  const handleCopyLink = (invoice: Invoice) => {
    const link = `${window.location.origin}${window.location.pathname}#/view/${invoice.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(invoice.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filtered = invoices.filter(inv =>
    inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
    inv.description.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) =>
    new Date(b.modifiedAt || b.createdAt).getTime() - new Date(a.modifiedAt || a.createdAt).getTime()
  );

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">{invoices.length} total invoice{invoices.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <FilePlus size={18} />
          New Invoice
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search invoices..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Invoice Cards */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">
            {search ? 'No invoices match your search' : 'No invoices yet'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {search ? 'Try a different search term' : 'Create your first invoice to get started'}
          </p>
          {!search && (
            <button
              onClick={onCreateNew}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(invoice => (
            <div
              key={invoice.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 p-5">
                {/* Icon */}
                <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-green-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(invoice)}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{invoice.clientName || 'Untitled'}</h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md shrink-0">
                      {invoice.numberOfCourts} court{invoice.numberOfCourts > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{invoice.description} · {invoice.courtSize}</p>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Created {formatDate(invoice.createdAt)}
                    </span>
                    {invoice.modifiedAt && invoice.modifiedAt !== invoice.createdAt && (
                      <span>Modified {getTimeAgo(invoice.modifiedAt)}</span>
                    )}
                    {invoice.shareLinks?.[0]?.views && invoice.shareLinks[0].views.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {invoice.shareLinks[0].views.length} view{invoice.shareLinks[0].views.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">{formatCurrency(invoice.subTotal * invoice.numberOfCourts)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(invoice.date)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => handleCopyLink(invoice)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                    title="Copy link"
                  >
                    {copiedId === invoice.id ? <Check size={16} className="text-green-500" /> : <Link size={16} />}
                  </button>
                  <button
                    onClick={() => handleDownload(invoice)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Download PDF"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(invoice)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => onDuplicate(invoice)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    title="Duplicate"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete invoice for "${invoice.clientName}"?`)) onDelete(invoice.id); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
