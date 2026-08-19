import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft, Image, Type, Link, BarChart3, Tag } from 'lucide-react';

export default function CreateBanner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    tagline: 'LIMITED DROP',
    title: '',
    description: '',
    ctaText: 'Shop Now',
    ctaLink: '/collection',
    stat1Number: '2k+',
    stat1Label: 'Collections',
    stat2Number: '5k+',
    stat2Label: 'Items trusted to deliver',
    isActive: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      return toast.warning('Banner main heading title and description copy text are required.');
    }
    if (!imageFile) {
      return toast.warning('Please upload a hero banner display image.');
    }

    // Initialize clean multi-part form data instance
    const data = new FormData();
    data.append('image', imageFile); // 'image' fields match upload.single('image') on the backend routes
    
    // Bind accompanying copy text configuration metrics
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      setLoading(true);
      await api.post('/banners', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Hero slider banner deployed successfully!');
      setTimeout(() => navigate('/banners'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create promotional slider asset.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-12 px-4 sm:px-0">
      <ToastContainer />

      {/* Admin Action Header Bar */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 shadow-sm transition-colors">
        <button 
          onClick={() => navigate('/banners')}
          type="button"
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all active:scale-95"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] dark:text-slate-100 tracking-tight">Create Hero Slider Banner</h1>
          <p className="text-xs text-[#64748b] dark:text-slate-400 mt-0.5">Configure copy headings, actions links, image parameters, and home stats showcases.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Content Options Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Typography Copy Management */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b pb-2 border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
              <Type size={16} className="text-indigo-500 dark:text-indigo-400" /> Layout Typography Content
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#475569] dark:text-slate-400 uppercase tracking-wider">Top Tagline Label</label>
              <input
                type="text"
                name="tagline"
                placeholder="e.g. LIMITED DROP, EXCLUSIVE"
                value={formData.tagline}
                onChange={handleInputChange}
                className="w-full bg-[#f8fafc] dark:bg-slate-800/60 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none text-sm font-semibold text-amber-700 dark:text-amber-400 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#475569] dark:text-slate-400 uppercase tracking-wider">Main Heading Title</label>
              <textarea
                name="title"
                required
                rows={2}
                placeholder="e.g. BOLD INTENTIONS TIMELESS EXECUTION"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-[#f8fafc] dark:bg-slate-800/60 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none text-base font-extrabold tracking-tight text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 uppercase placeholder:normal-case"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#475569] dark:text-slate-400 uppercase tracking-wider">Sub-description Copy Text</label>
              <textarea
                name="description"
                required
                rows={3}
                placeholder="Exclusively tailored silhouettes dropping for a brief window..."
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-[#f8fafc] dark:bg-slate-800/60 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Section 2: Traffic Target Navigation Targets */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b pb-2 border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
              <Link size={16} className="text-indigo-500 dark:text-indigo-400" /> Interaction Target Link
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] dark:text-slate-400 uppercase tracking-wider">Action Button Text</label>
                <input
                  type="text"
                  name="ctaText"
                  placeholder="e.g. Shop Now"
                  value={formData.ctaText}
                  onChange={handleInputChange}
                  className="w-full bg-[#f8fafc] dark:bg-slate-800/60 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none text-sm font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] dark:text-slate-400 uppercase tracking-wider">Target Destination Route Url</label>
                <input
                  type="text"
                  name="ctaLink"
                  placeholder="e.g. /shop, /collections/streetwear"
                  value={formData.ctaLink}
                  onChange={handleInputChange}
                  className="w-full bg-[#f8fafc] dark:bg-slate-800/60 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none text-sm font-mono text-indigo-600 dark:text-indigo-400 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Performance/Analytics Highlights Row overlays */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b pb-2 border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
              <BarChart3 size={16} className="text-indigo-500 dark:text-indigo-400" /> Bottom Stat Matrix Display
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 rounded-xl space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stat Metric 1 Number</label>
                  <input
                    type="text"
                    name="stat1Number"
                    value={formData.stat1Number}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 outline-none text-sm font-black text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stat Metric 1 Label</label>
                  <input
                    type="text"
                    name="stat1Label"
                    value={formData.stat1Label}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold text-slate-600 dark:text-slate-300 focus:border-indigo-500 dark:focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stat Metric 2 Number</label>
                  <input
                    type="text"
                    name="stat2Number"
                    value={formData.stat2Number}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 outline-none text-sm font-black text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stat Metric 2 Label</label>
                  <input
                    type="text"
                    name="stat2Label"
                    value={formData.stat2Label}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold text-slate-600 dark:text-slate-300 focus:border-indigo-500 dark:focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Asset Upload Column */}
        <div className="space-y-6">
          
          {/* Media Graphic Cover Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b pb-2 border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
              <Image size={16} className="text-indigo-500 dark:text-indigo-400" /> Hero Feature Image
            </h3>
            
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center">
                  <img src={imagePreview} alt="Preview asset layout" className="object-cover max-h-full max-w-full rounded-lg" />
                  <label className="absolute bottom-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer backdrop-blur-xs transition-colors shadow-sm">
                    Replace Image
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-400 bg-[#f8fafc] dark:bg-slate-800/40 rounded-xl cursor-pointer transition-colors group p-4 text-center">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                    <Image size={24} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3 block">Upload Banner Image</span>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 block">Supports Transparent PNGs, WebP or JPEGs</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Visibility Controls and Submission Forms */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b pb-2 border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
              <Tag size={16} className="text-indigo-500 dark:text-indigo-400" /> Catalog Settings
            </h3>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Publish Immediately</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Make active in hero pipeline carousel</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-98"
              >
                {loading ? 'Publishing Slider...' : 'Deploy Banner Slide'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/banners')}
                className="w-full py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold transition-colors text-center"
              >
                Cancel
              </button>
            </div>
          </div>

        </div>

      </form>
    </div>
  );
}