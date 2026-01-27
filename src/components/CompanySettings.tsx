import { useState } from 'react';
import { Upload, X, Plus, Trash2, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CompanySettings() {
  const { companySettings, updateCompanySettings } = useAuth();
  const [saved, setSaved] = useState(false);

  if (!companySettings) return null;

  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => updateCompanySettings({ logoData: reader.result as string });
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleIntroImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => updateCompanySettings({ introImage: reader.result as string });
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
          <p className="text-gray-500 mt-1">Manage your company branding used across all PDFs</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Company Logo</h2>
        <p className="text-sm text-gray-500 mb-5">This logo will be used on all PDF exports</p>

        <div className="flex items-center gap-6">
          {companySettings.logoData ? (
            <div className="relative group">
              <img src={companySettings.logoData} alt="Logo" className="w-24 h-24 rounded-2xl object-cover border border-gray-200" />
              <button
                onClick={() => updateCompanySettings({ logoData: '' })}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogoUpload}
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors"
            >
              <Upload size={24} />
              <span className="text-xs mt-1">Upload</span>
            </button>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">Upload your company logo</p>
            <p className="text-xs text-gray-400 mt-1">Recommended: Square image, at least 200x200px</p>
            {companySettings.logoData && (
              <button onClick={handleLogoUpload} className="text-sm text-green-600 hover:text-green-700 mt-2 font-medium">
                Change Logo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Company Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Company Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
            <input
              value={companySettings.name}
              onChange={e => updateCompanySettings({ name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tagline</label>
              <input
                value={companySettings.tagline}
                onChange={e => updateCompanySettings({ tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">By Line</label>
              <input
                value={companySettings.byLine}
                onChange={e => updateCompanySettings({ byLine: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Intro Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Intro Page Content</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">About Title</label>
            <input
              value={companySettings.aboutTitle}
              onChange={e => updateCompanySettings({ aboutTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">About Text</label>
            <textarea
              value={companySettings.aboutText}
              onChange={e => updateCompanySettings({ aboutText: e.target.value })}
              rows={4}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Intro Image</label>
            {companySettings.introImage ? (
              <div className="relative group inline-block">
                <img src={companySettings.introImage} alt="Intro" className="h-32 rounded-xl object-cover border border-gray-200" />
                <button
                  onClick={() => updateCompanySettings({ introImage: '' })}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleIntroImageUpload}
                className="border-2 border-dashed border-gray-300 rounded-xl px-8 py-6 flex flex-col items-center text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors"
              >
                <Upload size={20} />
                <span className="text-xs mt-1">Upload Intro Image</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Key Features</h2>
        <div className="space-y-2">
          {companySettings.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-green-500 text-sm">•</span>
              <input
                value={feature}
                onChange={e => {
                  const updated = [...companySettings.features];
                  updated[index] = e.target.value;
                  updateCompanySettings({ features: updated });
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={() => {
                  updateCompanySettings({ features: companySettings.features.filter((_, i) => i !== index) });
                }}
                className="text-gray-300 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => updateCompanySettings({ features: [...companySettings.features, ''] })}
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
          >
            <Plus size={14} /> Add Feature
          </button>
        </div>
      </div>
    </div>
  );
}
