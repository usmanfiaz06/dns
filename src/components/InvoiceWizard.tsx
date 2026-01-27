import { useState, useCallback } from 'react';
import {
  ArrowLeft, ArrowRight, Save, Download, Eye,
  Plus, Trash2, ChevronUp, ChevronDown, Upload, X, Check, Link
} from 'lucide-react';
import type { Invoice, QuotationItem, AddOn, PastProject, ProjectImage } from '../types/invoice';
import { defaultCompanyProfile } from '../types/invoice';
import { useAuth } from '../context/AuthContext';
import { generatePDF, previewPDF } from '../utils/pdfGenerator';
import { v4 as uuidv4 } from 'uuid';

interface InvoiceWizardProps {
  invoice: Invoice;
  onChange: (invoice: Invoice) => void;
  onSave: () => void;
  onBack: () => void;
  isNew: boolean;
}

const STEPS = [
  { id: 'cover', label: 'Cover Page', shortLabel: 'Cover' },
  { id: 'basic', label: 'Basic Info', shortLabel: 'Info' },
  { id: 'projects', label: 'Past Projects', shortLabel: 'Projects' },
  { id: 'quotation', label: 'Quotation Items', shortLabel: 'Items' },
  { id: 'pricing', label: 'Pricing & Add-ons', shortLabel: 'Pricing' },
  { id: 'terms', label: 'Terms & Payment', shortLabel: 'Terms' },
  { id: 'pages', label: 'PDF Pages', shortLabel: 'Pages' },
  { id: 'review', label: 'Review & Export', shortLabel: 'Review' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

export default function InvoiceWizard({ invoice, onChange, onSave, onBack, isNew }: InvoiceWizardProps) {
  const { companySettings } = useAuth();
  const [currentStep, setCurrentStep] = useState<StepId>('cover');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const update = useCallback((partial: Partial<Invoice>) => {
    onChange({ ...invoice, ...partial });
  }, [invoice, onChange]);

  const goNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].id);
    }
  };

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id);
    }
  };

  const handlePreview = () => {
    const invoiceWithCompany = applyCompanySettings(invoice);
    const url = previewPDF(invoiceWithCompany);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  const handleExport = () => {
    const invoiceWithCompany = applyCompanySettings(invoice);
    generatePDF(invoiceWithCompany);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}${window.location.pathname}#/view/${invoice.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const applyCompanySettings = (inv: Invoice): Invoice => {
    if (!companySettings) return inv;
    return {
      ...inv,
      companyProfile: {
        ...defaultCompanyProfile,
        ...inv.companyProfile,
        logoData: companySettings.logoData || inv.companyProfile?.logoData || '',
        companyName: companySettings.name || inv.companyProfile?.companyName || 'QNS',
        tagline: companySettings.tagline || inv.companyProfile?.tagline || 'Padel Courts',
        byLine: companySettings.byLine || inv.companyProfile?.byLine || '',
        aboutTitle: companySettings.aboutTitle || inv.companyProfile?.aboutTitle || '',
        aboutText: companySettings.aboutText || inv.companyProfile?.aboutText || '',
        introImage: companySettings.introImage || inv.companyProfile?.introImage || '',
        features: companySettings.features?.length ? companySettings.features : inv.companyProfile?.features || [],
      },
    };
  };

  const handleImageUpload = (callback: (data: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">
              {isNew ? 'New Invoice' : `Edit: ${invoice.clientName || 'Untitled'}`}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Link size={14} />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
          <button
            onClick={handlePreview}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            Export
          </button>
          <button
            onClick={onSave}
            className="px-4 py-1.5 text-sm rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium flex items-center gap-1.5 transition-colors"
          >
            <Save size={14} />
            Save
          </button>
        </div>
      </div>

      {/* Step Timeline */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto max-w-5xl mx-auto">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className="flex items-center gap-2 shrink-0"
              >
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${
                  isActive
                    ? 'bg-green-50 text-green-700 font-medium'
                    : isCompleted
                      ? 'text-green-600'
                      : 'text-gray-400 hover:text-gray-600'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                    isActive
                      ? 'bg-green-500 text-white'
                      : isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? <Check size={12} /> : index + 1}
                  </div>
                  <span className="hidden sm:inline">{step.shortLabel}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-6 h-0.5 shrink-0 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {currentStep === 'cover' && <CoverStep invoice={invoice} update={update} companySettings={companySettings} />}
          {currentStep === 'basic' && <BasicInfoStep invoice={invoice} update={update} />}
          {currentStep === 'projects' && <ProjectsStep invoice={invoice} update={update} onImageUpload={handleImageUpload} />}
          {currentStep === 'quotation' && <QuotationStep invoice={invoice} update={update} />}
          {currentStep === 'pricing' && <PricingStep invoice={invoice} update={update} />}
          {currentStep === 'terms' && <TermsStep invoice={invoice} update={update} />}
          {currentStep === 'pages' && <PagesStep invoice={invoice} update={update} />}
          {currentStep === 'review' && <ReviewStep invoice={invoice} onPreview={handlePreview} onExport={handleExport} onSave={onSave} />}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <button
          onClick={goPrev}
          disabled={currentStepIndex === 0}
          className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} />
          Previous
        </button>
        <span className="text-sm text-gray-400">
          Step {currentStepIndex + 1} of {STEPS.length}
        </span>
        <button
          onClick={currentStepIndex === STEPS.length - 1 ? onSave : goNext}
          className={`px-4 py-2 text-sm rounded-xl font-medium flex items-center gap-2 transition-colors ${
            currentStepIndex === STEPS.length - 1
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-900 hover:bg-gray-800 text-white'
          }`}
        >
          {currentStepIndex === STEPS.length - 1 ? (
            <>
              <Save size={16} />
              Save Invoice
            </>
          ) : (
            <>
              Next
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">PDF Preview</h3>
              <div className="flex items-center gap-2">
                <button onClick={handleExport} className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-1.5">
                  <Download size={14} /> Download
                </button>
                <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <iframe src={previewUrl} className="w-full h-full rounded-lg border" title="PDF Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ STEP COMPONENTS ============ */

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
      {description && <p className="text-sm text-gray-500 mb-5">{description}</p>}
      {!description && <div className="mb-5" />}
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder, ...props }: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; [key: string]: unknown;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        {...props}
      />
    </div>
  );
}

/* ---- Cover Step ---- */
function CoverStep({ invoice, update, companySettings }: {
  invoice: Invoice; update: (p: Partial<Invoice>) => void; companySettings: ReturnType<typeof useAuth>['companySettings'];
}) {
  const profile = invoice.companyProfile || defaultCompanyProfile;
  const logoSrc = companySettings?.logoData || profile.logoData;

  return (
    <>
      <SectionCard title="Cover Page" description="This information appears on the cover page of your PDF quotation.">
        <div className="space-y-4">
          {/* Cover Preview */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 text-center border border-green-100">
            {logoSrc ? (
              <img src={logoSrc} alt="Logo" className="w-20 h-20 mx-auto mb-4 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 bg-green-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">Q</span>
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-900">{companySettings?.name || profile.companyName || 'QNS'}</h3>
            <p className="text-gray-500">{companySettings?.tagline || profile.tagline || 'Padel Courts'}</p>
            <p className="text-sm text-gray-400 mt-1">{companySettings?.byLine || profile.byLine}</p>
            <div className="mt-6 bg-white/70 rounded-xl p-4 max-w-sm mx-auto">
              <p className="text-sm text-gray-500">Prepared for</p>
              <p className="text-xl font-bold text-gray-900">{invoice.clientName || 'Client Name'}</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">Company details can be changed in Settings. This preview shows how your cover page will look.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Client Name" value={invoice.clientName} onChange={v => update({ clientName: v })} placeholder="Enter client name" />
            <InputField label="Date" value={invoice.date} onChange={v => update({ date: v })} type="date" />
          </div>
        </div>
      </SectionCard>
    </>
  );
}

/* ---- Basic Info Step ---- */
function BasicInfoStep({ invoice, update }: { invoice: Invoice; update: (p: Partial<Invoice>) => void }) {
  return (
    <SectionCard title="Basic Information" description="Core details about this quotation.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Client Name" value={invoice.clientName} onChange={v => update({ clientName: v })} placeholder="Client name" />
        <InputField label="Date" value={invoice.date} onChange={v => update({ date: v })} type="date" />
        <div className="sm:col-span-2">
          <InputField label="Description" value={invoice.description} onChange={v => update({ description: v })} placeholder="e.g., Standard Padel Court" />
        </div>
        <InputField label="Number of Courts" value={invoice.numberOfCourts} onChange={v => update({ numberOfCourts: parseInt(v) || 1 })} type="number" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Court Size</label>
          <select
            value={invoice.courtSize}
            onChange={e => update({ courtSize: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="20x10">20x10</option>
            <option value="20x10 Panoramic">20x10 Panoramic</option>
          </select>
        </div>
        <InputField label="Base Price per Court (PKR)" value={invoice.subTotal} onChange={v => update({ subTotal: parseInt(v) || 0 })} type="number" />
        <InputField label="Completion Days" value={invoice.completionDays || ''} onChange={v => update({ completionDays: parseInt(v) || 0 })} type="number" />
      </div>
    </SectionCard>
  );
}

/* ---- Projects Step ---- */
function ProjectsStep({ invoice, update, onImageUpload }: {
  invoice: Invoice; update: (p: Partial<Invoice>) => void;
  onImageUpload: (cb: (data: string) => void) => void;
}) {
  const projects = invoice.pastProjects || [];

  const addProject = () => {
    update({
      pastProjects: [...projects, {
        id: uuidv4(),
        name: '',
        description: '',
        images: [],
        enabled: true,
      }],
    });
  };

  const updateProject = (index: number, partial: Partial<PastProject>) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], ...partial };
    update({ pastProjects: updated });
  };

  const removeProject = (index: number) => {
    update({ pastProjects: projects.filter((_, i) => i !== index) });
  };

  const addProjectImage = (projIndex: number) => {
    const proj = projects[projIndex];
    if (proj.images.length >= 3) return;
    onImageUpload((data) => {
      const updated = [...projects];
      updated[projIndex] = {
        ...updated[projIndex],
        images: [...updated[projIndex].images, { id: uuidv4(), data, caption: '' }],
      };
      update({ pastProjects: updated });
    });
  };

  const removeProjectImage = (projIndex: number, imgIndex: number) => {
    const updated = [...projects];
    updated[projIndex] = {
      ...updated[projIndex],
      images: updated[projIndex].images.filter((_, i) => i !== imgIndex),
    };
    update({ pastProjects: updated });
  };

  return (
    <SectionCard title="Past Projects" description="Showcase your previous work. Each project gets its own page in the PDF with larger images.">
      <div className="space-y-6">
        {projects.map((project, index) => (
          <div key={project.id} className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-400">#{index + 1}</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.enabled}
                    onChange={e => updateProject(index, { enabled: e.target.checked })}
                    className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-600">Include in PDF</span>
                </label>
              </div>
              <button onClick={() => removeProject(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <InputField label="Project Name" value={project.name} onChange={v => updateProject(index, { name: v })} placeholder="e.g., The Courtside Club" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={project.description}
                  onChange={e => updateProject(index, { description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Brief description of the project..."
                />
              </div>
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Images (max 3)</label>
                <div className="flex gap-3 flex-wrap">
                  {project.images.map((img: ProjectImage, imgIndex: number) => (
                    <div key={img.id} className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={img.data} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeProjectImage(index, imgIndex)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {project.images.length < 3 && (
                    <button
                      onClick={() => addProjectImage(index)}
                      className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors"
                    >
                      <Upload size={20} />
                      <span className="text-xs mt-1">Add</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addProject}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>
    </SectionCard>
  );
}

/* ---- Quotation Step ---- */
function QuotationStep({ invoice, update }: { invoice: Invoice; update: (p: Partial<Invoice>) => void }) {
  const items = invoice.quotationItems;

  const addItem = () => {
    update({
      quotationItems: [...items, {
        id: uuidv4(),
        name: 'New Item',
        description: [''],
        enabled: true,
      }],
    });
  };

  const updateItem = (index: number, partial: Partial<QuotationItem>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...partial };
    update({ quotationItems: updated });
  };

  const removeItem = (index: number) => {
    update({ quotationItems: items.filter((_, i) => i !== index) });
  };

  const addDescription = (index: number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], description: [...updated[index].description, ''] };
    update({ quotationItems: updated });
  };

  const updateDescription = (itemIndex: number, descIndex: number, value: string) => {
    const updated = [...items];
    const descs = [...updated[itemIndex].description];
    descs[descIndex] = value;
    updated[itemIndex] = { ...updated[itemIndex], description: descs };
    update({ quotationItems: updated });
  };

  const removeDescription = (itemIndex: number, descIndex: number) => {
    const updated = [...items];
    updated[itemIndex] = {
      ...updated[itemIndex],
      description: updated[itemIndex].description.filter((_, i) => i !== descIndex),
    };
    update({ quotationItems: updated });
  };

  return (
    <SectionCard title="Quotation Items" description="Materials and items included in this quotation.">
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className={`border rounded-xl p-4 transition-colors ${item.enabled ? 'border-gray-200' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={e => updateItem(index, { enabled: e.target.checked })}
                className="w-4 h-4 text-green-500 rounded"
              />
              <input
                value={item.name}
                onChange={e => updateItem(index, { name: e.target.value })}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Item name"
              />
              <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="space-y-2 ml-7">
              {item.description.map((desc, descIndex) => (
                <div key={descIndex} className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">•</span>
                  <input
                    value={desc}
                    onChange={e => updateDescription(index, descIndex, e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Description point"
                  />
                  {item.description.length > 1 && (
                    <button onClick={() => removeDescription(index, descIndex)} className="text-gray-300 hover:text-red-400">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addDescription(index)}
                className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1 ml-3"
              >
                <Plus size={12} /> Add Point
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addItem}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus size={18} /> Add Item
        </button>
      </div>
    </SectionCard>
  );
}

/* ---- Pricing Step ---- */
function PricingStep({ invoice, update }: { invoice: Invoice; update: (p: Partial<Invoice>) => void }) {
  const addOns = invoice.addOns;

  const addAddon = () => {
    update({
      addOns: [...addOns, { id: uuidv4(), name: '', quantity: '1', price: 0, enabled: true }],
    });
  };

  const updateAddon = (index: number, partial: Partial<AddOn>) => {
    const updated = [...addOns];
    updated[index] = { ...updated[index], ...partial };
    update({ addOns: updated });
  };

  const removeAddon = (index: number) => {
    update({ addOns: addOns.filter((_, i) => i !== index) });
  };

  const baseCost = invoice.subTotal * invoice.numberOfCourts;
  const taxAmount = invoice.includeTax ? baseCost * (invoice.taxPercentage / 100) : 0;
  const civilWork = invoice.includeCivilWork ? invoice.civilWorkMaxPrice : 0;
  const addOnTotal = addOns.filter(a => a.enabled).reduce((sum, a) => sum + a.price, 0);
  const grandTotal = baseCost + taxAmount + civilWork + addOnTotal;

  return (
    <>
      <SectionCard title="Pricing" description="Configure tax and civil work options.">
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Include Tax</p>
              <p className="text-sm text-gray-500">Add tax percentage to the total</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={invoice.includeTax}
                onChange={e => update({ includeTax: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
          {invoice.includeTax && (
            <InputField label="Tax Percentage" value={invoice.taxPercentage} onChange={v => update({ taxPercentage: parseFloat(v) || 0 })} type="number" />
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Include Civil Work</p>
              <p className="text-sm text-gray-500">Add civil work costs</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={invoice.includeCivilWork}
                onChange={e => update({ includeCivilWork: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
          {invoice.includeCivilWork && (
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Min Price (PKR)" value={invoice.civilWorkMinPrice} onChange={v => update({ civilWorkMinPrice: parseInt(v) || 0 })} type="number" />
              <InputField label="Max Price (PKR)" value={invoice.civilWorkMaxPrice} onChange={v => update({ civilWorkMaxPrice: parseInt(v) || 0 })} type="number" />
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Add-ons" description="Additional items to include in the quotation.">
        <div className="space-y-3">
          {addOns.map((addon, index) => (
            <div key={addon.id} className={`flex items-center gap-3 p-3 border rounded-xl ${addon.enabled ? 'border-gray-200' : 'border-gray-100 opacity-50'}`}>
              <input
                type="checkbox"
                checked={addon.enabled}
                onChange={e => updateAddon(index, { enabled: e.target.checked })}
                className="w-4 h-4 text-green-500 rounded"
              />
              <input
                value={addon.name}
                onChange={e => updateAddon(index, { name: e.target.value })}
                className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-sm"
                placeholder="Name"
              />
              <input
                value={addon.quantity}
                onChange={e => updateAddon(index, { quantity: e.target.value })}
                className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm"
                placeholder="Qty"
              />
              <input
                type="number"
                value={addon.price}
                onChange={e => updateAddon(index, { price: parseInt(e.target.value) || 0 })}
                className="w-28 px-2 py-1 border border-gray-200 rounded-lg text-sm"
                placeholder="Price"
              />
              <button onClick={() => removeAddon(index)} className="text-gray-400 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button onClick={addAddon} className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
            <Plus size={14} /> Add Add-on
          </button>
        </div>
      </SectionCard>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Cost Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Base ({invoice.numberOfCourts} court{invoice.numberOfCourts > 1 ? 's' : ''})</span><span className="font-medium">PKR {baseCost.toLocaleString()}</span></div>
          {invoice.includeTax && <div className="flex justify-between"><span className="text-gray-500">Tax ({invoice.taxPercentage}%)</span><span className="font-medium">PKR {taxAmount.toLocaleString()}</span></div>}
          {invoice.includeCivilWork && <div className="flex justify-between"><span className="text-gray-500">Civil Work</span><span className="font-medium">PKR {civilWork.toLocaleString()}</span></div>}
          {addOnTotal > 0 && <div className="flex justify-between"><span className="text-gray-500">Add-ons</span><span className="font-medium">PKR {addOnTotal.toLocaleString()}</span></div>}
          <div className="border-t pt-2 flex justify-between"><span className="font-semibold text-gray-900">Grand Total</span><span className="font-bold text-green-600 text-base">PKR {grandTotal.toLocaleString()}</span></div>
        </div>
      </div>
    </>
  );
}

/* ---- Terms Step ---- */
function TermsStep({ invoice, update }: { invoice: Invoice; update: (p: Partial<Invoice>) => void }) {
  const terms = invoice.termsAndConditions;
  const ps = invoice.paymentStructure;

  return (
    <>
      <SectionCard title="Payment Structure" description="Define the payment milestones.">
        <div className="grid grid-cols-3 gap-4">
          <InputField label="Advance %" value={ps.advance} onChange={v => update({ paymentStructure: { ...ps, advance: parseInt(v) || 0 } })} type="number" />
          <InputField label="On Delivery %" value={ps.onDelivery} onChange={v => update({ paymentStructure: { ...ps, onDelivery: parseInt(v) || 0 } })} type="number" />
          <InputField label="On Completion %" value={ps.onCompletion} onChange={v => update({ paymentStructure: { ...ps, onCompletion: parseInt(v) || 0 } })} type="number" />
        </div>
        {(ps.advance + ps.onDelivery + ps.onCompletion) !== 100 && (
          <p className="text-red-500 text-sm mt-3">Payment percentages must add up to 100% (currently {ps.advance + ps.onDelivery + ps.onCompletion}%)</p>
        )}
      </SectionCard>

      <SectionCard title="Terms & Conditions" description="Terms shown on the quotation PDF.">
        <div className="space-y-2">
          {terms.map((term, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-gray-400 text-xs mt-2.5">{index + 1}.</span>
              <textarea
                value={term}
                onChange={e => {
                  const updated = [...terms];
                  updated[index] = e.target.value;
                  update({ termsAndConditions: updated });
                }}
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
              <button
                onClick={() => update({ termsAndConditions: terms.filter((_, i) => i !== index) })}
                className="text-gray-300 hover:text-red-400 mt-2"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => update({ termsAndConditions: [...terms, ''] })}
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
          >
            <Plus size={14} /> Add Term
          </button>
        </div>
      </SectionCard>
    </>
  );
}

/* ---- Pages Step ---- */
function PagesStep({ invoice, update }: { invoice: Invoice; update: (p: Partial<Invoice>) => void }) {
  const pages = invoice.pdfPages || [];

  const togglePage = (index: number) => {
    const updated = [...pages];
    updated[index] = { ...updated[index], enabled: !updated[index].enabled };
    update({ pdfPages: updated });
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    const updated = [...pages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    const temp = updated[index].order;
    updated[index] = { ...updated[index], order: updated[targetIndex].order };
    updated[targetIndex] = { ...updated[targetIndex], order: temp };
    updated.sort((a, b) => a.order - b.order);
    update({ pdfPages: updated });
  };

  return (
    <SectionCard title="PDF Pages" description="Control which pages appear in the PDF and their order.">
      <div className="space-y-2">
        {[...pages].sort((a, b) => a.order - b.order).map((page, index) => (
          <div key={page.id} className={`flex items-center gap-4 p-4 border rounded-xl transition-colors ${page.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
            <input
              type="checkbox"
              checked={page.enabled}
              onChange={() => togglePage(pages.findIndex(p => p.id === page.id))}
              className="w-4 h-4 text-green-500 rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{page.name}</p>
              <p className="text-xs text-gray-400 capitalize">{page.type} page</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => movePage(pages.findIndex(p => p.id === page.id), 'up')}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => movePage(pages.findIndex(p => p.id === page.id), 'down')}
                disabled={index === pages.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ---- Review Step ---- */
function ReviewStep({ invoice, onPreview, onExport, onSave }: {
  invoice: Invoice; onPreview: () => void; onExport: () => void; onSave: () => void;
}) {
  const baseCost = invoice.subTotal * invoice.numberOfCourts;
  const taxAmount = invoice.includeTax ? baseCost * (invoice.taxPercentage / 100) : 0;
  const civilWork = invoice.includeCivilWork ? invoice.civilWorkMaxPrice : 0;
  const addOnTotal = invoice.addOns.filter(a => a.enabled).reduce((sum, a) => sum + a.price, 0);
  const grandTotal = baseCost + taxAmount + civilWork + addOnTotal;
  const enabledPages = (invoice.pdfPages || []).filter(p => p.enabled).length;
  const enabledItems = invoice.quotationItems.filter(i => i.enabled).length;
  const enabledProjects = (invoice.pastProjects || []).filter(p => p.enabled).length;

  return (
    <>
      <SectionCard title="Review & Export" description="Review your invoice before saving or exporting.">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 mb-1">Client</p>
            <p className="font-semibold text-gray-900">{invoice.clientName || 'Not set'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 mb-1">Courts</p>
            <p className="font-semibold text-gray-900">{invoice.numberOfCourts} × {invoice.courtSize}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 mb-1">Items</p>
            <p className="font-semibold text-gray-900">{enabledItems} of {invoice.quotationItems.length}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 mb-1">PDF Pages</p>
            <p className="font-semibold text-gray-900">{enabledPages} + {enabledProjects} project page{enabledProjects !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 col-span-2">
            <p className="text-green-600 mb-1">Grand Total</p>
            <p className="font-bold text-green-700 text-xl">PKR {grandTotal.toLocaleString()}</p>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={onPreview}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Eye size={18} />
          Preview PDF
        </button>
        <button
          onClick={onExport}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Download size={18} />
          Download PDF
        </button>
        <button
          onClick={onSave}
          className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Save size={18} />
          Save Invoice
        </button>
      </div>
    </>
  );
}
