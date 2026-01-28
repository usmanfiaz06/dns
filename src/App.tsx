import { useState, useCallback, useEffect } from 'react';
import type { Invoice } from './types/invoice';
import { createNewInvoice, defaultCompanyProfile } from './types/invoice';
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
import SharedInvoiceView from './components/SharedInvoiceView';
import { v4 as uuidv4 } from 'uuid';

function AppContent() {
  const { isAuthenticated, currentUser, companySettings } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isNewInvoice, setIsNewInvoice] = useState(false);
  const [sharedInvoiceId, setSharedInvoiceId] = useState<string | null>(null);

  // Per-user invoice storage key
  const storageKey = currentUser ? `qns-invoices-${currentUser.companyId}` : 'qns-invoices';
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>(storageKey, []);

  // Handle hash-based routing for shared links
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/#\/view\/(.+)/);
      if (match) {
        setSharedInvoiceId(match[1]);
      } else {
        setSharedInvoiceId(null);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

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

    // Embed company settings into invoice for shared link support
    if (companySettings) {
      updated.companyProfile = {
        ...defaultCompanyProfile,
        ...updated.companyProfile,
        logoData: companySettings.logoData || updated.companyProfile?.logoData || '',
        companyName: companySettings.name || updated.companyProfile?.companyName || 'QNS',
        tagline: companySettings.tagline || updated.companyProfile?.tagline || 'Padel Courts',
        byLine: companySettings.byLine || updated.companyProfile?.byLine || '',
        aboutTitle: companySettings.aboutTitle || updated.companyProfile?.aboutTitle || '',
        aboutText: companySettings.aboutText || updated.companyProfile?.aboutText || '',
        introImage: companySettings.introImage || updated.companyProfile?.introImage || '',
        features: companySettings.features?.length ? companySettings.features : updated.companyProfile?.features || [],
      };
    }

    if (isNewInvoice) {
      updated.createdAt = now;
      setInvoices(prev => [...prev, updated]);
    } else {
      setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
    }

    setCurrentInvoice(null);
    setIsNewInvoice(false);
    setCurrentRoute('invoices');
  }, [currentInvoice, isNewInvoice, setInvoices, companySettings]);

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

  // Shared invoice view (public, no auth needed)
  if (sharedInvoiceId) {
    // Search all localStorage keys for the invoice
    const invoice = findInvoiceById(sharedInvoiceId);
    return <SharedInvoiceView invoice={invoice} onClose={() => { window.location.hash = ''; setSharedInvoiceId(null); }} />;
  }

  // Auth screens (no layout)
  if (!isAuthenticated) {
    if (authView === 'signup') {
      return <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToSignup={() => setAuthView('signup')} />;
  }

  // All views now inside Layout (sidebar always visible)
  return (
    <Layout currentRoute={currentRoute} onNavigate={handleNavigate}>
      {(currentRoute === 'new-invoice' || currentRoute === 'edit-invoice') && currentInvoice ? (
        <InvoiceWizard
          invoice={currentInvoice}
          onChange={handleInvoiceChange}
          onSave={handleSave}
          onBack={handleBack}
          isNew={isNewInvoice}
        />
      ) : currentRoute === 'dashboard' ? (
        <Dashboard
          invoices={invoices}
          onCreateNew={handleCreateNew}
          onEditInvoice={handleEdit}
          onDuplicate={handleDuplicate}
        />
      ) : currentRoute === 'invoices' ? (
        <InvoiceList
          invoices={invoices}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      ) : currentRoute === 'settings' ? (
        <CompanySettings />
      ) : currentRoute === 'users' ? (
        <UserManagement />
      ) : null}
    </Layout>
  );
}

// Search all localStorage for an invoice by ID
function findInvoiceById(id: string): Invoice | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('qns-invoices')) {
        const invoices: Invoice[] = JSON.parse(localStorage.getItem(key) || '[]');
        const found = invoices.find(inv => inv.id === id);
        if (found) return found;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
