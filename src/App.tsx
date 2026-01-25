import { useState, useCallback } from 'react';
import type { Invoice } from './types/invoice';
import { createNewInvoice } from './types/invoice';
import { useLocalStorage } from './hooks/useLocalStorage';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceEditor } from './components/InvoiceEditor';

type View = 'list' | 'editor';

function App() {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('qns-invoices', []);
  const [currentView, setCurrentView] = useState<View>('list');
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isNewInvoice, setIsNewInvoice] = useState(false);

  const handleCreateNew = useCallback(() => {
    const newInvoice = createNewInvoice();
    setCurrentInvoice(newInvoice);
    setIsNewInvoice(true);
    setCurrentView('editor');
  }, []);

  const handleEdit = useCallback((invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setIsNewInvoice(false);
    setCurrentView('editor');
  }, []);

  const handleDuplicate = useCallback((invoice: Invoice) => {
    const duplicated: Invoice = {
      ...JSON.parse(JSON.stringify(invoice)),
      id: crypto.randomUUID(),
      clientName: `${invoice.clientName} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentInvoice(duplicated);
    setIsNewInvoice(true);
    setCurrentView('editor');
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  }, [setInvoices]);

  const handleSave = useCallback(() => {
    if (!currentInvoice) return;

    setInvoices(prev => {
      const exists = prev.find(inv => inv.id === currentInvoice.id);
      if (exists) {
        return prev.map(inv =>
          inv.id === currentInvoice.id
            ? { ...currentInvoice, updatedAt: new Date().toISOString() }
            : inv
        );
      } else {
        return [...prev, currentInvoice];
      }
    });

    setCurrentView('list');
    setCurrentInvoice(null);
    setIsNewInvoice(false);
  }, [currentInvoice, setInvoices]);

  const handleBack = useCallback(() => {
    const hasChanges = currentInvoice && isNewInvoice;
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to go back?');
      if (!confirmed) return;
    }
    setCurrentView('list');
    setCurrentInvoice(null);
    setIsNewInvoice(false);
  }, [currentInvoice, isNewInvoice]);

  const handleInvoiceChange = useCallback((updatedInvoice: Invoice) => {
    setCurrentInvoice(updatedInvoice);
  }, []);

  // Sort invoices by updated date (most recent first)
  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (currentView === 'editor' && currentInvoice) {
    return (
      <InvoiceEditor
        invoice={currentInvoice}
        onChange={handleInvoiceChange}
        onSave={handleSave}
        onBack={handleBack}
        isNew={isNewInvoice}
      />
    );
  }

  return (
    <InvoiceList
      invoices={sortedInvoices}
      onCreateNew={handleCreateNew}
      onEdit={handleEdit}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
    />
  );
}

export default App;
