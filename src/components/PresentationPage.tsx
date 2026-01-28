import { useState } from 'react';
import { Download, FileText, Presentation } from 'lucide-react';
import { generatePresentationPdf } from '../utils/presentationPdf';

export default function PresentationPage() {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    // Small delay so the UI updates
    await new Promise(r => setTimeout(r, 100));
    try {
      generatePresentationPdf();
    } finally {
      setGenerating(false);
    }
  };

  const slides = [
    { num: 1, title: 'Cover Page', desc: 'Dark premium cover with company branding' },
    { num: 2, title: 'Executive Summary', desc: 'Key stats: 20+ years, 750+ projects, 12-week plan' },
    { num: 3, title: 'Strategic Context', desc: 'Market positioning and strategic objective' },
    { num: 4, title: 'Four Integrated Layers', desc: 'Strategic approach overview with visual cards' },
    { num: 5, title: 'Layer 1: Strategic Positioning', desc: 'Narrative architecture and decision logic' },
    { num: 6, title: 'Layer 2: Brand Refresh', desc: 'Visual, verbal, and governance systems' },
    { num: 7, title: 'Layer 3: Website & Market Assets', desc: 'Enterprise validation interface design' },
    { num: 8, title: 'Layer 4: Authority & Ecosystem', desc: 'LinkedIn and community engagement' },
    { num: 9, title: 'Deliverables Overview', desc: 'Comprehensive deliverables matrix table' },
    { num: 10, title: 'Strategy & Authority Deliverables', desc: 'Positioning, narrative, messaging, LinkedIn' },
    { num: 11, title: 'Website & Branding Deliverables', desc: 'Content, design, identity, guidelines' },
    { num: 12, title: 'Collateral & Community Deliverables', desc: 'Swag, kits, roundtables, playbooks' },
    { num: 13, title: 'Timeline', desc: '12-week Gantt chart with 5 phases' },
    { num: 14, title: 'Outcome', desc: 'Closing slide with key value pillars' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Presentation size={22} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Presentation</h1>
              <p className="text-sm text-gray-500">Inbox Business Solutions — Strategic Brand Refresh</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
        >
          <Download size={18} />
          {generating ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      {/* Slide preview grid */}
      <div className="grid grid-cols-2 gap-4">
        {slides.map(slide => (
          <div
            key={slide.num}
            className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="w-12 h-8 bg-gray-900 rounded flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{String(slide.num).padStart(2, '0')}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-gray-400" />
                <p className="text-sm font-semibold text-gray-900">{slide.title}</p>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{slide.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <p className="text-sm text-amber-800">
          <strong>Format:</strong> Landscape A4 (297×210mm) • 14 slides • McKinsey-grade design with navy/gold color scheme
        </p>
      </div>
    </div>
  );
}
