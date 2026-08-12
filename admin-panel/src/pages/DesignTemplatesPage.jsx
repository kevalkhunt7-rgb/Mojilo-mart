import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Plus, Layers, Eye, RefreshCw, Upload } from 'lucide-react';

export default function DesignTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesign, setSelectedDesign] = useState(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // Query admin designs to use as canvas templates
      const res = await api.get('/designs');
      setTemplates(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load canvas templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filter Logic
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = 
      template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.product?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />
      
      {/* Top Header Row */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Design Studio Templates</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pre-made print specifications and vector layouts for the custom canvas.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchTemplates}
            className="p-2 border border-[#e2e8f0] hover:bg-slate-50 rounded-xl transition-all text-slate-500 animate-none"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => toast.info('To create a new template, save a customization on a product canvas as an admin.')}
            className="flex items-center gap-1.5 bg-[#4F39F6] hover:bg-[#3f2bdb] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-98"
          >
            <Plus size={16} /> New Template
          </button>
        </div>
      </div>

      {/* Search Bar Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search templates by title or base products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f8fafc] text-sm text-slate-700 placeholder-slate-400 rounded-xl border border-slate-200/80 pl-11 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Gallery Grid Display */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-slate-400 shadow-sm">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
          <p className="text-sm">Retrieving canvas templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-slate-400 shadow-sm">
          <p className="text-sm">No templates saved. Save your first canvas design to register a template!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div 
              key={template._id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Container with 4:3 Aspect Ratio */}
              <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden flex items-center justify-center p-6 border-b">
                {template.previewImage?.url ? (
                  <img 
                    src={template.previewImage.url} 
                    alt={template.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-[1.03] transition-transform duration-500 ease-out drop-shadow-md"
                    loading="lazy"
                  />
                ) : (
                  <Layers size={48} className="text-slate-300" />
                )}
                <div className="absolute top-3 right-3 bg-white/95 border border-slate-100 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 shadow-sm flex items-center gap-1">
                  <Layers size={11} className="text-indigo-500" />
                  <span>{template.customizations?.length || 0} Layers</span>
                </div>
              </div>

              {/* Information Row Body */}
              <div className="p-4 space-y-3.5">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 tracking-tight group-hover:text-[#4F39F6] transition-colors truncate">
                    {template.name}
                  </h3>
                  <p className="text-xs text-slate-450 mt-0.5 truncate text-slate-400">
                    Base: {template.product?.name || template.product?.title || 'Unknown Product'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F1F3F5] text-slate-500 uppercase">
                    Template Design
                  </span>
                  
                  <button
                    onClick={() => setSelectedDesign(template)}
                    className="flex items-center gap-1 text-[11px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-600 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-indigo-100"
                  >
                    <Eye size={12} /> Inspect Layers
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Spec Modal */}
      {selectedDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-indigo-600" />
                <h3 className="font-bold text-base text-[#0f172a]">Inspect Template Specifications</h3>
              </div>
              <button 
                onClick={() => setSelectedDesign(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="bg-[#f8fafc] border border-slate-100 p-4 rounded-xl space-y-2 font-mono">
                <div className="flex justify-between border-b pb-1.5 border-slate-200/50">
                  <span className="text-slate-455 text-slate-400">Template ID</span>
                  <span className="text-slate-800 font-semibold">{selectedDesign._id}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-slate-200/50">
                  <span className="text-slate-455 text-slate-400">Template Title</span>
                  <span className="text-slate-800 font-semibold">{selectedDesign.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455 text-slate-400">Target Product</span>
                  <span className="text-slate-800 font-semibold">{selectedDesign.product?.name || selectedDesign.product?.title}</span>
                </div>
              </div>

              {/* Layer details */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <h4 className="font-bold text-slate-700 text-xs">Layers Details:</h4>
                {selectedDesign.customizations?.map((cust, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-150 p-3 rounded-lg space-y-2">
                    <p className="font-bold text-[10px] text-indigo-600 uppercase">Area: {cust.printArea?.name || 'General'}</p>
                    
                    {cust.textLayers?.map((t, tIdx) => (
                      <div key={tIdx} className="bg-white border p-2 rounded text-[10px] font-mono space-y-0.5 text-slate-600">
                        <div className="font-semibold text-slate-800">Text: "{t.text}"</div>
                        <div>Font: {t.fontFamily} | Size: {t.fontSize}px</div>
                        <div>Color: <span style={{ color: t.color }} className="font-bold">{t.color}</span></div>
                      </div>
                    ))}
                    
                    {cust.imageLayers?.map((img, iIdx) => (
                      <div key={iIdx} className="bg-white border p-2 rounded text-[10px] font-mono space-y-0.5 text-slate-600">
                        <div className="font-semibold text-slate-800">Image Layer</div>
                        <div className="truncate">Source: {img.url}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setSelectedDesign(null)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}