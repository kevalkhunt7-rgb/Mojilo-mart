import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft, Image, Type, Link, BarChart3, Tag } from 'lucide-react';

export default function EditBanner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    tagline: '',
    title: '',
    description: '',
    ctaText: '',
    ctaLink: '',
    stat1Number: '',
    stat1Label: '',
    stat2Number: '',
    stat2Label: '',
    isActive: true
  });

  // 1. Fetch current slide properties on component initialization
  useEffect(() => {
    const fetchBannerDetails = async () => {
      try {
        setFetching(true);
        const response = await api.get('/banners');
        // Extract array wrappers safely and find the targeted slide match
        const allBanners = response.data.data || response.data;
        const currentBanner = allBanners.find(b => b._id === id);

        if (!currentBanner) {
          toast.error('The requested banner configurations could not be loaded');
          return navigate('/banners');
        }

        setFormData({
          tagline: currentBanner.tagline || '',
          title: currentBanner.title || '',
          description: currentBanner.description || '',
          ctaText: currentBanner.ctaText || '',
          ctaLink: currentBanner.ctaLink || '',
          stat1Number: currentBanner.stat1Number || '',
          stat1Label: currentBanner.stat1Label || '',
          stat2Number: currentBanner.stat2Number || '',
          stat2Label: currentBanner.stat2Label || '',
          isActive: currentBanner.isActive ?? true
        });

        if (currentBanner.image?.url) {
          setImagePreview(currentBanner.image.url);
        }
      } catch (err) {
        toast.error('Failed to parse targeting slider properties data logs');
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchBannerDetails();
  }, [id, navigate]);

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
      return toast.warning('Banner headings layout values are required elements.');
    }

    const data = new FormData();
    // Only append an image file if a new file asset was loaded for replacement
    if (imageFile) {
      data.append('image', imageFile);
    }

    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      setLoading(true);
      await api.patch(`/banners/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Hero slider banner layout changes saved successfully!');
      setTimeout(() => navigate('/banners'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update promotional entry updates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-[1000px] mx-auto p-12 text-center text-sm font-semibold text-slate-400 bg-white border border-slate-200 rounded-2xl">
        Fetching current layout sequence configurations...
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-12 px-4 sm:px-0">
      <ToastContainer />

      {/* Admin Action Bar */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <button 
          onClick={() => navigate('/banners')}
          type="button"
          className="p-2 border rounded-xl hover:bg-slate-50 text-slate-500 transition-all active:scale-95"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">Edit Hero Slider Banner</h1>
          <p className="text-xs text-[#64748b] mt-0.5">Modify text parameters, replace hero showcase banners graphics, and tweak interactive routing routes.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Elements Settings Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Typography Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2 border-slate-100 flex items-center gap-1.5">
              <Type size={16} className="text-indigo-500" /> Layout Typography Content
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Top Tagline Label</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-semibold text-amber-700 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Main Heading Title</label>
              <textarea
                name="title"
                required
                rows={2}
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-base font-extrabold tracking-tight text-slate-800 focus:border-indigo-500 uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Sub-description Copy Text</label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-600 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section 2: Interactive Hyperlinks */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2 border-slate-100 flex items-center gap-1.5">
              <Link size={16} className="text-indigo-500" /> Interaction Target Link
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Action Button Text</label>
                <input
                  type="text"
                  name="ctaText"
                  value={formData.ctaText}
                  onChange={handleInputChange}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-bold text-slate-800 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Target Destination Route Url</label>
                <input
                  type="text"
                  name="ctaLink"
                  value={formData.ctaLink}
                  onChange={handleInputChange}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-mono text-indigo-600 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Stat Badges Matrix */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2 border-slate-100 flex items-center gap-1.5">
              <BarChart3 size={16} className="text-indigo-500" /> Bottom Stat Matrix Display
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stat Metric 1 Number</label>
                  <input
                    type="text"
                    name="stat1Number"
                    value={formData.stat1Number}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none text-sm font-black text-slate-800 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stat Metric 1 Label</label>
                  <input
                    type="text"
                    name="stat1Label"
                    value={formData.stat1Label}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold text-slate-600 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stat Metric 2 Number</label>
                  <input
                    type="text"
                    name="stat2Number"
                    value={formData.stat2Number}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none text-sm font-black text-slate-800 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stat Metric 2 Label</label>
                  <input
                    type="text"
                    name="stat2Label"
                    value={formData.stat2Label}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none text-xs font-semibold text-slate-600 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Status Upload Matrix Column */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2 border-slate-100 flex items-center gap-1.5">
              <Image size={16} className="text-indigo-500" /> Hero Feature Image
            </h3>
            
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 flex items-center justify-center">
                  <img src={imagePreview} alt="Preview display context" className="object-cover max-h-full max-w-full rounded-lg" />
                  <label className="absolute bottom-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer backdrop-blur-xs transition-colors shadow-sm">
                    Replace Graphic
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-slate-200 bg-[#f8fafc] rounded-xl cursor-pointer p-4 text-center">
                  <div className="p-3 bg-white rounded-xl border border-slate-100 text-slate-400">
                    <Image size={24} />
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2 border-slate-100 flex items-center gap-1.5">
              <Tag size={16} className="text-indigo-500" /> Catalog Settings
            </h3>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700">Active Slide State</span>
                <span className="text-[10px] text-slate-400">Present inside carousel line</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-98"
              >
                {loading ? 'Saving Layout changes...' : 'Save Banner Updates'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/banners')}
                className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-colors text-center"
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