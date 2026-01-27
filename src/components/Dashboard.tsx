import { FileText, FilePlus, TrendingUp, Eye, Clock } from 'lucide-react';
import type { Invoice } from '../types/invoice';

interface DashboardProps {
  invoices: Invoice[];
  onCreateNew: () => void;
  onEditInvoice: (invoice: Invoice) => void;
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

export default function Dashboard({ invoices, onCreateNew, onEditInvoice }: DashboardProps) {
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.subTotal * inv.numberOfCourts, 0);
  const totalViews = invoices.reduce((sum, inv) => sum + (inv.shareLinks?.[0]?.views?.length || 0), 0);
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.modifiedAt || b.createdAt).getTime() - new Date(a.modifiedAt || a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      label: 'Total Invoices',
      value: invoices.length.toString(),
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'Total Value',
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
      iconBg: 'bg-green-100',
    },
    {
      label: 'Total Views',
      value: totalViews.toString(),
      icon: Eye,
      color: 'bg-purple-50 text-purple-600',
      iconBg: 'bg-purple-100',
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your invoices and activity</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <FilePlus size={18} />
          New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                  <Icon size={20} className={stat.color.split(' ')[1]} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
          <button
            onClick={() => {/* handled by parent navigation */}}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View All
          </button>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">No invoices yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first invoice to get started</p>
            <button
              onClick={onCreateNew}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentInvoices.map(invoice => (
              <button
                key={invoice.id}
                onClick={() => onEditInvoice(invoice)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{invoice.clientName || 'Untitled'}</p>
                  <p className="text-sm text-gray-500 truncate">{invoice.description} · {invoice.numberOfCourts} court{invoice.numberOfCourts > 1 ? 's' : ''}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-gray-900">{formatCurrency(invoice.subTotal * invoice.numberOfCourts)}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                    <Clock size={12} />
                    {getTimeAgo(invoice.modifiedAt || invoice.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
