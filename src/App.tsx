import { useState, useCallback, useEffect } from 'react';
import type { Invoice } from './types/invoice';
import { createNewInvoice, defaultCompanyProfile } from './types/invoice';
import { useFirestoreInvoices, getInvoiceById } from './hooks/useFirestoreInvoices';
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
  const { isAuthenticated, isLoading: authLoading, currentUser, companySettings } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isNewInvoice, setIsNewInvoice] = useState(false);
  const [sharedInvoiceId, setSharedInvoiceId] = useState<string | null>(null);
  const [sharedInvoice, setSharedInvoice] = useState<Invoice | null>(null);
  const [loadingShared, setLoadingShared] = useState(false);

  // Firestore invoices
  const { invoices, loading: invoicesLoading, saveInvoice, deleteInvoice } = useFirestoreInvoices(currentUser?.companyId);

  // Handle hash-based routing for shared links
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/#\/view\/(.+)/);
      if (match) {
        setSharedInvoiceId(match[1]);
      } else {
        setSharedInvoiceId(null);
        setSharedInvoice(null);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Fetch shared invoice from Firestore
  useEffect(() => {
    if (sharedInvoiceId) {
      setLoadingShared(true);
      getInvoiceById(sharedInvoiceId).then((invoice) => {
        setSharedInvoice(invoice);
        setLoadingShared(false);
      });
    }
  }, [sharedInvoiceId]);

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

  const handleDuplicate = useCallback(async (invoice: Invoice) => {
    const duplicated: Invoice = {
      ...JSON.parse(JSON.stringify(invoice)),
      id: uuidv4(),
      clientName: `${invoice.clientName} (Copy)`,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
    await saveInvoice(duplicated);
  }, [saveInvoice]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteInvoice(id);
  }, [deleteInvoice]);

  const handleSave = useCallback(async () => {
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
    }

    await saveInvoice(updated);

    setCurrentInvoice(null);
    setIsNewInvoice(false);
    setCurrentRoute('invoices');
  }, [currentInvoice, isNewInvoice, saveInvoice, companySettings]);

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
    if (loadingShared) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invoice...</p>
          </div>
        </div>
      );
    }
    return <SharedInvoiceView invoice={sharedInvoice} onClose={() => { window.location.hash = ''; setSharedInvoiceId(null); }} />;
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
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
          loading={invoicesLoading}
        />
      ) : currentRoute === 'invoices' ? (
        <InvoiceList
          invoices={invoices}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          loading={invoicesLoading}
        />
      ) : currentRoute === 'settings' ? (
        <CompanySettings />
      ) : currentRoute === 'users' ? (
        <UserManagement />
      ) : null}
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
