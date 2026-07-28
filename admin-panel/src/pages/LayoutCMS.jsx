import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Plus, Eye, EyeOff, Trash2, Edit2, Sliders, Layers, ArrowUpRight } from 'lucide-react';

export default function Banners() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/banners', { withCredentials: true });
      setBanners(response.data.data || response.data);
    } catch (err) {
      toast.error('Could not populate active catalog banner slides');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const toggleVisibility = async (id, currentStatus) => {
    try {
      await axios.patch(`/api/banners/${id}`, 
        { isActive: !currentStatus },
        { withCredentials: true }
      );
      toast.success('Banner placement visibility updated');
      setBanners(banners.map(b => b._id === id ? { ...b, isActive: !currentStatus } : b));
    } catch (err) {
      toast.error('Failed to shift layout presence targets');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you certain you want to remove this hero slider layout sequence entry?')) return;
    try {
      await axios.delete(`/api/banners/${id}`, { withCredentials: true });
      toast.success('Promotional entry wiped out clean');
      setBanners(banners.filter(b => b._id !== id));
    } catch (err) {
      toast.error('Failed to scrub catalog entry asset');
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-12 px-4 sm:px-0">
      <ToastContainer />

      {/* Main Feature Actions Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] tracking-tight flex items-center gap-2">
            <Sliders size={20} className="text-indigo-600" /> Landing Hero Management
          </h1>
          <p className="text-xs text-[#64748b] mt-0.5">Control home slider banners, marketing hooks, direct traffic destinations, and quick stat counters.</p>
        </div>
        
        <button
          onClick={() => navigate('/banners/create')}
          className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 self-start sm:self-auto"
        >
          <Plus size={16} />
          Add New Banner
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm font-semibold text-slate-400">
          Loading layout presentations...
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="inline-flex p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-100">
            <Layers size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No Hero Banners Formed Yet</h3>
          <button
            onClick={() => navigate('/banners/create')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 mt-1"
          >
            Deploy your first deck banner <Plus size={14} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div 
              key={banner._id} 
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col group ${
                banner.isActive ? 'border-slate-200 hover:shadow-md' : 'border-slate-200 bg-slate-50/50 opacity-75'
              }`}
            >
              {/* Media Container Box with Dynamic String Fallback */}
              <div className="relative aspect-[21/9] w-full bg-slate-100 overflow-hidden border-b flex items-center justify-center min-h-[160px]">
                <img 
                  src={banner.image?.url || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800"} 
                  alt={banner.title} 
                  className="object-cover w-full h-full transition-transform group-hover:scale-102 duration-300"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800";
                  }}
                />
                
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-[10px] font-black tracking-widest px-2 py-1 rounded text-amber-500 uppercase">
                  {banner.tagline || 'PROMOTION'}
                </span>

                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  banner.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Text Layout Metadata Details Area */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-black text-base text-slate-800 tracking-tight leading-snug line-clamp-1 uppercase">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                    {banner.description}
                  </p>
                </div>

                {/* Metrics Highlights Section */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-sm font-black text-slate-800">{banner.stat1Number}</span>
                    <span className="block text-[10px] text-slate-400 font-medium truncate">{banner.stat1Label}</span>
                  </div>
                  <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-sm font-black text-slate-800">{banner.stat2Number}</span>
                    <span className="block text-[10px] text-slate-400 font-medium truncate">{banner.stat2Label}</span>
                  </div>
                </div>

                {/* Target Redirect Preview Row */}
                <div className="flex items-center justify-between text-[11px] bg-slate-50 border px-3 py-2 rounded-xl text-slate-500">
                  <span className="font-semibold text-slate-600">Action: <span className="text-indigo-600 font-bold">{banner.ctaText}</span></span>
                  <span className="font-mono text-slate-400 flex items-center gap-0.5">
                    {banner.ctaLink} <ArrowUpRight size={12} />
                  </span>
                </div>

                {/* VISIBLE CRITICAL CRUD ACTION TASK PANEL BUTTONS ROW */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => toggleVisibility(banner._id, banner.isActive)}
                    className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      banner.isActive 
                        ? 'border-slate-200 text-slate-600 hover:bg-slate-50' 
                        : 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    {banner.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                    {banner.isActive ? 'Hide' : 'Show'}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/banners/edit/${banner._id}`)}
                    className="flex items-center justify-center gap-1 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Edit2 size={14} /> Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(banner._id)}
                    className="flex items-center justify-center gap-1 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}