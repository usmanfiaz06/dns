import { useState, useRef } from 'react';
import type { Invoice, QuotationItem, AddOn, PastProject, CompanyProfile, PDFPage } from '../types/invoice';
import {
  ArrowLeft,
  Save,
  FileDown,
  Eye,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Upload,
  Image,
  Building,
  FolderOpen,
  FileText,
  Link,
  X,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { generatePDF, previewPDF } from '../utils/pdfGenerator';

interface InvoiceEditorProps {
  invoice: Invoice;
  onChange: (invoice: Invoice) => void;
  onSave: () => void;
  onBack: () => void;
  isNew: boolean;
}

const formatCurrency = (amount: number): string => {
  return `PKR ${amount.toLocaleString('en-PK')}`;
};

export function InvoiceEditor({ invoice, onChange, onSave, onBack, isNew }: InvoiceEditorProps) {
  const [activeSection, setActiveSection] = useState<string | null>('basic');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const introImageInputRef = useRef<HTMLInputElement>(null);
  const projectImageInputRef = useRef<HTMLInputElement>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const updateInvoice = (updates: Partial<Invoice>) => {
    onChange({ ...invoice, ...updates, updatedAt: new Date().toISOString() });
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // Company Profile handlers
  const updateCompanyProfile = (updates: Partial<CompanyProfile>) => {
    updateInvoice({ companyProfile: { ...invoice.companyProfile, ...updates } });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCompanyProfile({ logoData: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIntroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCompanyProfile({ introImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Past Projects handlers
  const addProject = () => {
    const newProject: PastProject = {
      id: crypto.randomUUID(),
      name: 'New Project',
      description: 'Project description',
      images: [],
      enabled: true
    };
    updateInvoice({ pastProjects: [...(invoice.pastProjects || []), newProject] });
  };

  const updateProject = (id: string, updates: Partial<PastProject>) => {
    const newProjects = (invoice.pastProjects || []).map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    updateInvoice({ pastProjects: newProjects });
  };

  const removeProject = (id: string) => {
    updateInvoice({ pastProjects: (invoice.pastProjects || []).filter(p => p.id !== id) });
  };

  const handleProjectImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedProjectId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const project = (invoice.pastProjects || []).find(p => p.id === selectedProjectId);
        if (project) {
          const newImage = {
            id: crypto.randomUUID(),
            data: reader.result as string,
            caption: ''
          };
          updateProject(selectedProjectId, { images: [...project.images, newImage] });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProjectImage = (projectId: string, imageId: string) => {
    const project = (invoice.pastProjects || []).find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, { images: project.images.filter(img => img.id !== imageId) });
    }
  };

  // PDF Pages handlers
  const updatePDFPage = (id: string, updates: Partial<PDFPage>) => {
    const newPages = (invoice.pdfPages || []).map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    updateInvoice({ pdfPages: newPages });
  };

  const movePDFPage = (id: string, direction: 'up' | 'down') => {
    const pages = [...(invoice.pdfPages || [])].sort((a, b) => a.order - b.order);
    const index = pages.findIndex(p => p.id === id);
    if (direction === 'up' && index > 0) {
      const temp = pages[index].order;
      pages[index].order = pages[index - 1].order;
      pages[index - 1].order = temp;
    } else if (direction === 'down' && index < pages.length - 1) {
      const temp = pages[index].order;
      pages[index].order = pages[index + 1].order;
      pages[index + 1].order = temp;
    }
    updateInvoice({ pdfPages: pages });
  };

  // Quotation Items handlers
  const updateQuotationItem = (id: string, updates: Partial<QuotationItem>) => {
    const newItems = invoice.quotationItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    updateInvoice({ quotationItems: newItems });
  };

  const addQuotationItem = () => {
    const newItem: QuotationItem = {
      id: crypto.randomUUID(),
      name: 'New Item',
      description: ['Description'],
      enabled: true
    };
    updateInvoice({ quotationItems: [...invoice.quotationItems, newItem] });
  };

  const removeQuotationItem = (id: string) => {
    updateInvoice({ quotationItems: invoice.quotationItems.filter(item => item.id !== id) });
  };

  // AddOns handlers
  const updateAddOn = (id: string, updates: Partial<AddOn>) => {
    const newAddOns = invoice.addOns.map(addon =>
      addon.id === id ? { ...addon, ...updates } : addon
    );
    updateInvoice({ addOns: newAddOns });
  };

  const addAddOn = () => {
    const newAddOn: AddOn = {
      id: crypto.randomUUID(),
      name: 'New Add-on',
      quantity: '1',
      price: 0,
      enabled: false
    };
    updateInvoice({ addOns: [...invoice.addOns, newAddOn] });
  };

  const removeAddOn = (id: string) => {
    updateInvoice({ addOns: invoice.addOns.filter(addon => addon.id !== id) });
  };

  // Terms handlers
  const updateTermsAndConditions = (index: number, value: string) => {
    const newTerms = [...invoice.termsAndConditions];
    newTerms[index] = value;
    updateInvoice({ termsAndConditions: newTerms });
  };

  const addTerm = () => {
    updateInvoice({ termsAndConditions: [...invoice.termsAndConditions, 'New term'] });
  };

  const removeTerm = (index: number) => {
    const newTerms = invoice.termsAndConditions.filter((_, i) => i !== index);
    updateInvoice({ termsAndConditions: newTerms });
  };

  // Feature handlers
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...(invoice.companyProfile?.features || [])];
    newFeatures[index] = value;
    updateCompanyProfile({ features: newFeatures });
  };

  const addFeature = () => {
    updateCompanyProfile({ features: [...(invoice.companyProfile?.features || []), 'New feature'] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = (invoice.companyProfile?.features || []).filter((_, i) => i !== index);
    updateCompanyProfile({ features: newFeatures });
  };

  const handlePreview = () => {
    const url = previewPDF(invoice);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  const handleDownload = () => {
    generatePDF(invoice);
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/view/${invoice.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Calculate totals
  const baseTotal = invoice.subTotal * invoice.numberOfCourts;
  const taxAmount = invoice.includeTax ? baseTotal * (invoice.taxPercentage / 100) : 0;
  const civilWorkAmount = invoice.includeCivilWork ? invoice.civilWorkMaxPrice : 0;
  const addOnsTotal = invoice.addOns.filter(a => a.enabled).reduce((sum, a) => sum + a.price, 0);
  const grandTotal = baseTotal + taxAmount + civilWorkAmount + addOnsTotal;

  const sortedPDFPages = [...(invoice.pdfPages || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={logoInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={introImageInputRef}
        onChange={handleIntroImageUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={projectImageInputRef}
        onChange={handleProjectImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isNew ? 'New Invoice' : 'Edit Invoice'}
                </h1>
                <p className="text-sm text-gray-500">
                  {invoice.clientName || 'Unnamed Client'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  copiedLink
                    ? 'text-green-700 bg-green-100'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Link size={18} />
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye size={18} />
                Preview
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FileDown size={18} />
                Export PDF
              </button>
              <button
                onClick={onSave}
                className="flex items-center gap-2 px-4 py-2 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors font-medium"
              >
                <Save size={18} />
                Save
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Sections */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('basic')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-[#8BC34A]" />
                  <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                </div>
                {activeSection === 'basic' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {activeSection === 'basic' && (
                <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                    <input
                      type="text"
                      value={invoice.clientName}
                      onChange={(e) => updateInvoice({ clientName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none transition-all"
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={invoice.date}
                      onChange={(e) => updateInvoice({ date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={invoice.description}
                      onChange={(e) => updateInvoice({ description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none transition-all"
                      placeholder="e.g., Padel court construction without civil work"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Courts</label>
                    <input
                      type="number"
                      min="1"
                      value={invoice.numberOfCourts}
                      onChange={(e) => updateInvoice({ numberOfCourts: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Court Size</label>
                    <input
                      type="text"
                      value={invoice.courtSize}
                      onChange={(e) => updateInvoice({ courtSize: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none transition-all"
                      placeholder="e.g., 10m*20m"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price per Court (PKR)</label>
                    <input
                      type="number"
                      value={invoice.subTotal}
                      onChange={(e) => updateInvoice({ subTotal: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Completion Days</label>
                    <input
                      type="number"
                      min="1"
                      value={invoice.completionDays}
                      onChange={(e) => updateInvoice({ completionDays: parseInt(e.target.value) || 45 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Company Profile */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('company')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Building size={20} className="text-[#8BC34A]" />
                  <h2 className="text-lg font-semibold text-gray-900">Company Profile</h2>
                </div>
                {activeSection === 'company' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {activeSection === 'company' && (
                <div className="px-6 pb-6 space-y-6">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                    <div className="flex items-center gap-4">
                      {invoice.companyProfile?.logoData ? (
                        <div className="relative">
                          <img
                            src={invoice.companyProfile.logoData}
                            alt="Logo"
                            className="w-20 h-20 object-contain border rounded-lg"
                          />
                          <button
                            onClick={() => updateCompanyProfile({ logoData: undefined })}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <Image size={24} className="text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="px-4 py-2 text-sm font-medium text-[#8BC34A] border border-[#8BC34A] rounded-lg hover:bg-[#8BC34A]/10 transition-colors"
                      >
                        <Upload size={16} className="inline mr-2" />
                        Upload Logo
                      </button>
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={invoice.companyProfile?.companyName || ''}
                        onChange={(e) => updateCompanyProfile({ companyName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={invoice.companyProfile?.tagline || ''}
                        onChange={(e) => updateCompanyProfile({ tagline: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">By Line</label>
                      <input
                        type="text"
                        value={invoice.companyProfile?.byLine || ''}
                        onChange={(e) => updateCompanyProfile({ byLine: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Intro Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Introduction Image</label>
                    <div className="flex items-start gap-4">
                      {invoice.companyProfile?.introImage ? (
                        <div className="relative">
                          <img
                            src={invoice.companyProfile.introImage}
                            alt="Intro"
                            className="w-40 h-24 object-cover border rounded-lg"
                          />
                          <button
                            onClick={() => updateCompanyProfile({ introImage: undefined })}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-40 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <Image size={24} className="text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => introImageInputRef.current?.click()}
                        className="px-4 py-2 text-sm font-medium text-[#8BC34A] border border-[#8BC34A] rounded-lg hover:bg-[#8BC34A]/10 transition-colors"
                      >
                        <Upload size={16} className="inline mr-2" />
                        Upload Image
                      </button>
                    </div>
                  </div>

                  {/* About Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">About Title</label>
                    <input
                      type="text"
                      value={invoice.companyProfile?.aboutTitle || ''}
                      onChange={(e) => updateCompanyProfile({ aboutTitle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none mb-3"
                    />
                    <label className="block text-sm font-medium text-gray-700 mb-1">About Text</label>
                    <textarea
                      value={invoice.companyProfile?.aboutText || ''}
                      onChange={(e) => updateCompanyProfile({ aboutText: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Why Choose Us - Features</label>
                    <div className="space-y-2">
                      {(invoice.companyProfile?.features || []).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-[#8BC34A]">•</span>
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#8BC34A] outline-none text-sm"
                          />
                          <button
                            onClick={() => removeFeature(index)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addFeature}
                        className="text-sm text-[#8BC34A] hover:text-[#7CB342] font-medium"
                      >
                        + Add Feature
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Past Projects */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('projects')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen size={20} className="text-[#8BC34A]" />
                  <h2 className="text-lg font-semibold text-gray-900">Past Projects</h2>
                </div>
                {activeSection === 'projects' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {activeSection === 'projects' && (
                <div className="px-6 pb-6 space-y-4">
                  {(invoice.pastProjects || []).map((project) => (
                    <div
                      key={project.id}
                      className={`border rounded-lg p-4 ${project.enabled ? 'border-[#8BC34A] bg-[#8BC34A]/5' : 'border-gray-200 bg-gray-50'}`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={project.enabled}
                          onChange={(e) => updateProject(project.id, { enabled: e.target.checked })}
                          className="mt-1 w-5 h-5 rounded border-gray-300 text-[#8BC34A] focus:ring-[#8BC34A]"
                        />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) => updateProject(project.id, { name: e.target.value })}
                              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none text-sm font-medium"
                              placeholder="Project name"
                            />
                            <button
                              onClick={() => removeProject(project.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <textarea
                            value={project.description}
                            onChange={(e) => updateProject(project.id, { description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none text-sm resize-none"
                            rows={2}
                            placeholder="Project description"
                          />
                          {/* Project Images */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">Project Images (max 3)</label>
                            <div className="flex flex-wrap gap-2">
                              {project.images.map((img) => (
                                <div key={img.id} className="relative">
                                  <img
                                    src={img.data}
                                    alt="Project"
                                    className="w-20 h-16 object-cover border rounded"
                                  />
                                  <button
                                    onClick={() => removeProjectImage(project.id, img.id)}
                                    className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                              {project.images.length < 3 && (
                                <button
                                  onClick={() => {
                                    setSelectedProjectId(project.id);
                                    projectImageInputRef.current?.click();
                                  }}
                                  className="w-20 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-[#8BC34A] hover:text-[#8BC34A] transition-colors"
                                >
                                  <Plus size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addProject}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#8BC34A] hover:text-[#8BC34A] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add Project
                  </button>
                </div>
              )}
            </div>

            {/* PDF Pages Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('pages')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-[#8BC34A]" />
                  <h2 className="text-lg font-semibold text-gray-900">PDF Pages</h2>
                </div>
                {activeSection === 'pages' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {activeSection === 'pages' && (
                <div className="px-6 pb-6 space-y-2">
                  <p className="text-sm text-gray-500 mb-4">Enable/disable pages and adjust their order in the PDF.</p>
                  {sortedPDFPages.map((page, index) => (
                    <div
                      key={page.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg ${page.enabled ? 'border-[#8BC34A] bg-[#8BC34A]/5' : 'border-gray-200'}`}
                    >
                      <GripVertical size={16} className="text-gray-400" />
                      <input
                        type="checkbox"
                        checked={page.enabled}
                        onChange={(e) => updatePDFPage(page.id, { enabled: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-[#8BC34A] focus:ring-[#8BC34A]"
                      />
                      <span className="flex-1 text-sm font-medium text-gray-700">{page.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => movePDFPage(page.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => movePDFPage(page.id, 'down')}
                          disabled={index === sortedPDFPages.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quotation Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('items')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900">Quotation Items</h2>
                {activeSection === 'items' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {activeSection === 'items' && (
                <div className="px-6 pb-6 space-y-4">
                  {invoice.quotationItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 ${item.enabled ? 'border-[#8BC34A] bg-[#8BC34A]/5' : 'border-gray-200 bg-gray-50'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 pt-1">
                          <GripVertical size={16} className="text-gray-400 cursor-move" />
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={(e) => updateQuotationItem(item.id, { enabled: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-[#8BC34A] focus:ring-[#8BC34A]"
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateQuotationItem(item.id, { name: e.target.value })}
                              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none text-sm font-medium"
                              placeholder="Item name"
                            />
                            <button
                              onClick={() => removeQuotationItem(item.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="pl-9 space-y-2">
                            {item.description.map((desc, descIndex) => (
                              <div key={descIndex} className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs">-</span>
                                <input
                                  type="text"
                                  value={desc}
                                  onChange={(e) => {
                                    const newDesc = [...item.description];
                                    newDesc[descIndex] = e.target.value;
                                    updateQuotationItem(item.id, { description: newDesc });
                                  }}
                                  className="flex-1 px-3 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-[#8BC34A] focus:border-transparent outline-none text-sm"
                                  placeholder="Description"
                                />
                                <button
                                  onClick={() => {
                                    const newDesc = item.description.filter((_, i) => i !== descIndex);
                                    updateQuotationItem(item.id, { description: newDesc });
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newDesc = [...item.description, ''];
                                updateQuotationItem(item.id, { description: newDesc });
                              }}
                              className="text-xs text-[#8BC34A] hover:text-[#7CB342] font-medium pl-4"
                            >
                              + Add description line
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addQuotationItem}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#8BC34A] hover:text-[#8BC34A] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add Item
                  </button>
                </div>
              )}
            </div>

            {/* Pricing Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('pricing')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900">Pricing Options</h2>
                {activeSection === 'pricing' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {activeSection === 'pricing' && (
                <div className="px-6 pb-6 space-y-6">
                  {/* Tax */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="includeTax"
                      checked={invoice.includeTax}
                      onChange={(e) => updateInvoice({ includeTax: e.target.checked })}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-[#8BC34A] focus:ring-[#8BC34A]"
                    />
                    <div className="flex-1">
                      <label htmlFor="includeTax" className="block font-medium text-gray-900 cursor-pointer">
                        Include Tax
                      </label>
                      <p className="text-sm text-gray-500">Add tax to the total quotation amount</p>
                      {invoice.includeTax && (
                        <div className="mt-3 flex items-center gap-3">
                          <label className="text-sm text-gray-600">Tax Percentage:</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={invoice.taxPercentage}
                            onChange={(e) => updateInvoice({ taxPercentage: parseFloat(e.target.value) || 0 })}
                            className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#8BC34A] outline-none text-sm"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Civil Work */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="includeCivilWork"
                      checked={invoice.includeCivilWork}
                      onChange={(e) => updateInvoice({ includeCivilWork: e.target.checked })}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-[#8BC34A] focus:ring-[#8BC34A]"
                    />
                    <div className="flex-1">
                      <label htmlFor="includeCivilWork" className="block font-medium text-gray-900 cursor-pointer">
                        Include Civil Work
                      </label>
                      <p className="text-sm text-gray-500">Add civil work charges to the quotation</p>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-gray-600 block mb-1">Min Price (PKR)</label>
                          <input
                            type="number"
                            value={invoice.civilWorkMinPrice}
                            onChange={(e) => updateInvoice({ civilWorkMinPrice: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#8BC34A] outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 block mb-1">Max Price (PKR)</label>
                          <input
                            type="number"
                            value={invoice.civilWorkMaxPrice}
                            onChange={(e) => updateInvoice({ civilWorkMaxPrice: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#8BC34A] outline-none text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add-ons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('addons')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900">Add-ons</h2>
                {activeSection === 'addons' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {activeSection === 'addons' && (
                <div className="px-6 pb-6 space-y-3">
                  {invoice.addOns.map((addon) => (
                    <div
                      key={addon.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg ${addon.enabled ? 'border-[#8BC34A] bg-[#8BC34A]/5' : 'border-gray-200'}`}
                    >
                      <input
                        type="checkbox"
                        checked={addon.enabled}
                        onChange={(e) => updateAddOn(addon.id, { enabled: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-[#8BC34A] focus:ring-[#8BC34A]"
                      />
                      <input
                        type="text"
                        value={addon.name}
                        onChange={(e) => updateAddOn(addon.id, { name: e.target.value })}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#8BC34A] outline-none text-sm"
                        placeholder="Add-on name"
                      />
                      <input
                        type="text"
                        value={addon.quantity}
                        onChange={(e) => updateAddOn(addon.id, { quantity: e.target.value })}
                        className="w-32 px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#8BC34A] outline-none text-sm"
                        placeholder="Qty"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">PKR</span>
                        <input
                          type="number"
                          value={addon.price}
                          onChange={(e) => updateAddOn(addon.id, { price: parseInt(e.target.value) || 0 })}
                          className="w-28 px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#8BC34A] outline-none text-sm"
                        />
                      </div>
                      <button
                        onClick={() => removeAddOn(addon.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addAddOn}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#8BC34A] hover:text-[#8BC34A] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add Add-on
                  </button>
                </div>
              )}
            </div>

            {/* Payment Structure */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('payment')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900">Payment Structure</h2>
                {activeSection === 'payment' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {activeSection === 'payment' && (
                <div className="px-6 pb-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Advance (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={invoice.paymentStructure.advance}
                        onChange={(e) => updateInvoice({
                          paymentStructure: { ...invoice.paymentStructure, advance: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">On Delivery (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={invoice.paymentStructure.onDelivery}
                        onChange={(e) => updateInvoice({
                          paymentStructure: { ...invoice.paymentStructure, onDelivery: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">On Completion (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={invoice.paymentStructure.onCompletion}
                        onChange={(e) => updateInvoice({
                          paymentStructure: { ...invoice.paymentStructure, onCompletion: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Total: {invoice.paymentStructure.advance + invoice.paymentStructure.onDelivery + invoice.paymentStructure.onCompletion}%
                    {(invoice.paymentStructure.advance + invoice.paymentStructure.onDelivery + invoice.paymentStructure.onCompletion) !== 100 && (
                      <span className="text-red-500 ml-2">(Should equal 100%)</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection('terms')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900">Terms & Conditions</h2>
                {activeSection === 'terms' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {activeSection === 'terms' && (
                <div className="px-6 pb-6 space-y-3">
                  {invoice.termsAndConditions.map((term, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-6">{index + 1}.</span>
                      <input
                        type="text"
                        value={term}
                        onChange={(e) => updateTermsAndConditions(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent outline-none text-sm"
                      />
                      <button
                        onClick={() => removeTerm(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addTerm}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#8BC34A] hover:text-[#8BC34A] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add Term
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Client</span>
                  <span className="font-medium text-gray-900">{invoice.clientName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Courts</span>
                  <span className="font-medium text-gray-900">{invoice.numberOfCourts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Items</span>
                  <span className="font-medium text-gray-900">
                    {invoice.quotationItems.filter(i => i.enabled).length} / {invoice.quotationItems.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">PDF Pages</span>
                  <span className="font-medium text-gray-900">
                    {(invoice.pdfPages || []).filter(p => p.enabled).length} enabled
                  </span>
                </div>

                <hr className="my-4" />

                <div className="flex justify-between">
                  <span className="text-gray-500">Base Total</span>
                  <span className="font-medium text-gray-900">{formatCurrency(baseTotal)}</span>
                </div>

                {invoice.includeTax && (
                  <div className="flex justify-between text-blue-600">
                    <span>Tax ({invoice.taxPercentage}%)</span>
                    <span className="font-medium">+ {formatCurrency(taxAmount)}</span>
                  </div>
                )}

                {invoice.includeCivilWork && (
                  <div className="flex justify-between text-green-600">
                    <span>Civil Work</span>
                    <span className="font-medium">+ {formatCurrency(civilWorkAmount)}</span>
                  </div>
                )}

                {addOnsTotal > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>Add-ons</span>
                    <span className="font-medium">+ {formatCurrency(addOnsTotal)}</span>
                  </div>
                )}

                <hr className="my-4" />

                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-900">Grand Total</span>
                  <span className="font-bold text-[#8BC34A]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCopyLink}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    copiedLink
                      ? 'text-green-700 bg-green-100'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Link size={18} />
                  {copiedLink ? 'Link Copied!' : 'Copy Share Link'}
                </button>
                <button
                  onClick={handlePreview}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye size={18} />
                  Preview PDF
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors font-medium"
                >
                  <FileDown size={18} />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">PDF Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={previewUrl}
                className="w-full h-full rounded-lg border"
                title="PDF Preview"
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload();
                  setShowPreview(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors font-medium"
              >
                <FileDown size={18} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
