import { useState, useCallback } from 'react';
import type { Invoice } from './types/invoice';
import { createNewInvoice } from './types/invoice';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Layout, { type Route } from './components/Layout';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceWizard from './components/InvoiceWizard';
import CompanySettings from './components/CompanySettings';
import UserManagement from './components/UserManagement';
import { v4 as uuidv4 } from 'uuid';

function AppContent() {
  const { isAuthenticated, currentUser } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isNewInvoice, setIsNewInvoice] = useState(false);

  // Per-user invoice storage key
  const storageKey = currentUser ? `qns-invoices-${currentUser.companyId}` : 'qns-invoices';
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>(storageKey, []);

  const handleCreateNew = useCallback(() => {
    const invoice = createNewInvoice();
    setCurrentInvoice(invoice);
    setIsNewInvoice(true);
    setCurrentRoute('new-invoice');
  }, []);

  const handleEdit = useCallback((invoice: Invoice) => {
    setCurrentInvoice({ ...invoice });
    setIsNewInvoice(false);
    setCurrentRoute('edit-invoice');
  }, []);

  const handleDuplicate = useCallback((invoice: Invoice) => {
    const duplicated: Invoice = {
      ...JSON.parse(JSON.stringify(invoice)),
      id: uuidv4(),
      clientName: `${invoice.clientName} (Copy)`,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
    setInvoices(prev => [...prev, duplicated]);
  }, [setInvoices]);

  const handleDelete = useCallback((id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  }, [setInvoices]);

  const handleSave = useCallback(() => {
    if (!currentInvoice) return;
    const now = new Date().toISOString();
    const updated = { ...currentInvoice, modifiedAt: now };

    if (isNewInvoice) {
      updated.createdAt = now;
      setInvoices(prev => [...prev, updated]);
    } else {
      setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
    }

    setCurrentInvoice(null);
    setIsNewInvoice(false);
    setCurrentRoute('invoices');
  }, [currentInvoice, isNewInvoice, setInvoices]);

  const handleBack = useCallback(() => {
    setCurrentInvoice(null);
    setIsNewInvoice(false);
    setCurrentRoute('invoices');
  }, []);

  const handleInvoiceChange = useCallback((invoice: Invoice) => {
    setCurrentInvoice(invoice);
  }, []);

  const handleNavigate = useCallback((route: Route) => {
    if (route === 'new-invoice') {
      handleCreateNew();
    } else {
      setCurrentRoute(route);
      if (route !== 'edit-invoice') {
        setCurrentInvoice(null);
        setIsNewInvoice(false);
      }
    }
  }, [handleCreateNew]);

  // Auth screens (no layout)
  if (!isAuthenticated) {
    if (authView === 'signup') {
      return <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToSignup={() => setAuthView('signup')} />;
  }

  // Invoice wizard (full screen, no sidebar)
  if ((currentRoute === 'new-invoice' || currentRoute === 'edit-invoice') && currentInvoice) {
    return (
      <InvoiceWizard
        invoice={currentInvoice}
        onChange={handleInvoiceChange}
        onSave={handleSave}
        onBack={handleBack}
        isNew={isNewInvoice}
      />
    );
  }

  // Dashboard layout with sidebar
  return (
    <Layout currentRoute={currentRoute} onNavigate={handleNavigate}>
      {currentRoute === 'dashboard' && (
        <Dashboard
          invoices={invoices}
          onCreateNew={handleCreateNew}
          onEditInvoice={handleEdit}
        />
      )}
      {currentRoute === 'invoices' && (
        <InvoiceList
          invoices={invoices}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      )}
      {currentRoute === 'settings' && <CompanySettings />}
      {currentRoute === 'users' && <UserManagement />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
