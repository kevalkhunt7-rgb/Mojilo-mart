import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import { 
  Building2, 
  Truck, 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  DollarSign,
  Upload,
  Loader2,
  X,
  Share2,
  Globe,
  Link2,
  AtSign
} from 'lucide-react';

function Toast({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl text-sm font-semibold shadow-xl backdrop-blur-sm border transition-all duration-300 flex items-center gap-2
            ${t.type === 'success'
              ? 'bg-emerald-500/95 text-white border-emerald-400'
              : t.type === 'error'
              ? 'bg-red-500/95 text-white border-red-400'
              : 'bg-indigo-500/95 text-white border-indigo-400'}`}
        >
          {t.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Settings Form State
  const [formData, setFormData] = useState({
    // General
    storeName: 'Mojilo',
    logoUrl: '',
    contactEmail: 'support@mojilo.com',
    contactPhone: '+91 98765 43210',
    businessAddress: '123 Fashion Street, Surat, Gujarat, India',
    maintenanceMode: false,
    
    // Shipping
    shippingEnabled: true,
    freeShippingThreshold: 999,
    defaultShippingCharge: 50,

    // Social Links
    socialLinks: {
      whatsapp: { url: 'https://whatsapp.com/channel/0029VavFd8G6RGJNAmFON31c', enabled: true },
      facebook: { url: 'https://facebook.com/MojiloMart', enabled: true },
      instagram: { url: 'https://instagram.com/mojilomart', enabled: true },
      pinterest: { url: 'https://in.pinterest.com/mojilomart', enabled: true },
      amazon: { url: 'https://amzn.to/3W21xlC', enabled: true },
      googleMap: { url: 'https://maps.app.goo.gl/wg4HAyaeiJzMcZKA', enabled: true },
      linkedin: { url: 'https://linkedin.com/in/mojilo', enabled: true },
      twitter: { url: 'https://x.com/MojiloMart', enabled: true },
      youtube: { url: '', enabled: true },
    },
  });

  const [initialData, setInitialData] = useState(null);

  const pushToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  // Fetch Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        const data = res.data?.data || res.data || {};
        
        const parseSocial = (val, defaultUrl = '') => {
          if (typeof val === 'string') return { url: val || defaultUrl, enabled: true };
          if (val && typeof val === 'object') return { url: val.url || defaultUrl, enabled: val.enabled !== undefined ? Boolean(val.enabled) : true };
          return { url: defaultUrl, enabled: true };
        };

        const loadedData = {
          storeName: data.storeName || 'Mojilo',
          logoUrl: data.logoUrl || '',
          contactEmail: data.contactEmail || 'support@mojilo.com',
          contactPhone: data.contactPhone || '+91 98765 43210',
          businessAddress: data.businessAddress || '123 Fashion Street, Surat, Gujarat, India',
          maintenanceMode: Boolean(data.maintenanceMode),
          shippingEnabled: data.shippingEnabled !== undefined ? Boolean(data.shippingEnabled) : true,
          freeShippingThreshold: data.freeShippingThreshold !== undefined ? Number(data.freeShippingThreshold) : 999,
          defaultShippingCharge: data.defaultShippingCharge !== undefined ? Number(data.defaultShippingCharge) : 50,
          socialLinks: {
            whatsapp: parseSocial(data.socialLinks?.whatsapp, 'https://whatsapp.com/channel/0029VavFd8G6RGJNAmFON31c'),
            facebook: parseSocial(data.socialLinks?.facebook, 'https://facebook.com/MojiloMart'),
            instagram: parseSocial(data.socialLinks?.instagram, 'https://instagram.com/mojilomart'),
            pinterest: parseSocial(data.socialLinks?.pinterest, 'https://in.pinterest.com/mojilomart'),
            amazon: parseSocial(data.socialLinks?.amazon, 'https://amzn.to/3W21xlC'),
            googleMap: parseSocial(data.socialLinks?.googleMap, 'https://maps.app.goo.gl/wg4HAyaeiJzMcZKA'),
            linkedin: parseSocial(data.socialLinks?.linkedin, 'https://linkedin.com/in/mojilo'),
            twitter: parseSocial(data.socialLinks?.twitter, 'https://x.com/MojiloMart'),
            youtube: parseSocial(data.socialLinks?.youtube, ''),
          },
        };

        setFormData(loadedData);
        setInitialData(loadedData);
      } catch (err) {
        console.error('Failed to load settings:', err);
        pushToast('Failed to load settings from server', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialUrlChange = (platform, url) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: {
          ...prev.socialLinks[platform],
          url,
        },
      },
    }));
  };

  const handleSocialToggleChange = (platform, enabled) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: {
          ...prev.socialLinks[platform],
          enabled,
        },
      },
    }));
  };

  const handleLogoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const data = new FormData();
      data.append('image', file);

      const res = await api.post('/upload/image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data?.data?.url || res.data?.data?.imageUrl || res.data?.url || res.data?.imageUrl;
      if (uploadedUrl) {
        handleChange('logoUrl', uploadedUrl);
        pushToast('Logo image uploaded successfully!', 'success');
      } else {
        pushToast('Upload finished but image URL was missing', 'error');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      const msg = err.response?.data?.message || 'Failed to upload logo image';
      pushToast(msg, 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      pushToast('Form reset to saved settings', 'info');
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      setSaving(true);
      const res = await api.patch('/settings', formData);
      const updated = res.data?.data || formData;
      
      setFormData((prev) => ({
        ...prev,
        ...updated,
      }));
      setInitialData(formData);
      pushToast('Settings saved successfully!', 'success');
    } catch (err) {
      console.error('Failed to update settings:', err);
      const msg = err.response?.data?.message || 'Failed to update settings';
      pushToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const isDirty = initialData && JSON.stringify(formData) !== JSON.stringify(initialData);

  const tabs = [
    { id: 'general', label: 'General Settings', icon: <Building2 className="h-4 w-4" />, description: 'Store name, logo, contact details, & maintenance' },
    { id: 'shipping', label: 'Shipping Settings', icon: <Truck className="h-4 w-4" />, description: 'Shipping rules, threshold, & default charges' },
    { id: 'social', label: 'Social Media Links', icon: <Share2 className="h-4 w-4" />, description: 'Connect store social handles & footer icons' },
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="lg:col-span-3 h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <Toast toasts={toasts} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Store Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centralized store configuration and business rules control panel
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || saving}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Revert
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isDirty || saving}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Main Settings Layout with Left Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Navigation Sub-Sidebar */}
        <div className="lg:col-span-1 space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Configuration Sections
          </div>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  {tab.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-sm truncate">{tab.label}</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal line-clamp-1 mt-0.5">
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Settings Content Section */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          
          {/* SECTION 1: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-500" /> General Store Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage store identity, branding assets, contact information, and store availability mode.
                </p>
              </div>

              {/* Store Name & Logo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Store className="h-3.5 w-3.5 text-slate-400" /> Store / Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => handleChange('storeName', e.target.value)}
                    placeholder="e.g. Mojilo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-slate-400" /> Store Logo
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed text-xs font-semibold cursor-pointer transition-all ${
                      uploadingLogo 
                        ? 'border-amber-500 bg-amber-500/10 text-amber-500' 
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-500'
                    }`}>
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> Uploading Logo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 text-amber-500" /> Upload Image File
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                        onChange={handleLogoFileUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      value={formData.logoUrl}
                      onChange={(e) => handleChange('logoUrl', e.target.value)}
                      placeholder="Or paste Logo URL"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Preview if URL provided */}
              {formData.logoUrl && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logo Preview:</div>
                    <img
                      src={formData.logoUrl}
                      alt="Store Logo Preview"
                      className="h-10 object-contain rounded bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange('logoUrl', '')}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Remove Logo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Contact Email & Contact Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" /> Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    placeholder="support@mojilo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Business Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Business Address
                </label>
                <textarea
                  rows={3}
                  value={formData.businessAddress}
                  onChange={(e) => handleChange('businessAddress', e.target.value)}
                  placeholder="Enter full store business address"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-none"
                />
              </div>

              {/* Maintenance Mode */}
              <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Maintenance Mode</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Enable maintenance mode to temporarily pause customer orders and show a maintenance banner.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.maintenanceMode}
                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

            </div>
          )}

          {/* SECTION 2: SHIPPING SETTINGS */}
          {activeTab === 'shipping' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-amber-500" /> Shipping Settings & Rules
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Configure delivery options, free shipping order thresholds, and default delivery rates.
                </p>
              </div>

              {/* Enable/Disable Shipping Toggle */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl shrink-0">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Enable Shipping</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Enable or disable order shipping calculations store-wide.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.shippingEnabled}
                    onChange={(e) => handleChange('shippingEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Free Shipping Threshold & Default Shipping Charge */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-slate-400" /> Free Shipping Threshold (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.freeShippingThreshold}
                    onChange={(e) => handleChange('freeShippingThreshold', Number(e.target.value))}
                    disabled={!formData.shippingEnabled}
                    placeholder="999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Orders with subtotal higher than this amount qualify for free shipping.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-slate-400" /> Default Shipping Charge (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.defaultShippingCharge}
                    onChange={(e) => handleChange('defaultShippingCharge', Number(e.target.value))}
                    disabled={!formData.shippingEnabled}
                    placeholder="50"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Standard shipping fee applied to orders below free shipping threshold.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* SECTION 3: SOCIAL MEDIA LINKS */}
          {activeTab === 'social' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-amber-500" /> Social Media Links & Handles
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage external social media URLs displayed in the customer store footer.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* WhatsApp */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      <Globe className="h-3.5 w-3.5 text-emerald-500" /> WhatsApp Channel / Number
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.socialLinks.whatsapp?.enabled ?? true}
                        onChange={(e) => handleSocialToggleChange('whatsapp', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                      />
                      Active
                    </label>
                  </div>
                  <input
                    type="url"
                    value={formData.socialLinks.whatsapp?.url || ''}
                    onChange={(e) => handleSocialUrlChange('whatsapp', e.target.value)}
                    placeholder="https://whatsapp.com/channel/0029VavFd8G6RGJNAmFON31c"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Facebook */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      <Globe className="h-3.5 w-3.5 text-blue-600" /> Facebook Page URL
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.socialLinks.facebook?.enabled ?? true}
                        onChange={(e) => handleSocialToggleChange('facebook', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                      />
                      Active
                    </label>
                  </div>
                  <input
                    type="url"
                    value={formData.socialLinks.facebook?.url || ''}
                    onChange={(e) => handleSocialUrlChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/MojiloMart"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Instagram */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      <Globe className="h-3.5 w-3.5 text-pink-500" /> Instagram Profile URL
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.socialLinks.instagram?.enabled ?? true}
                        onChange={(e) => handleSocialToggleChange('instagram', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                      />
                      Active
                    </label>
                  </div>
                  <input
                    type="url"
                    value={formData.socialLinks.instagram?.url || ''}
                    onChange={(e) => handleSocialUrlChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/mojilomart"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Pinterest */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      <Globe className="h-3.5 w-3.5 text-red-500" /> Pinterest URL
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.socialLinks.pinterest?.enabled ?? true}
                        onChange={(e) => handleSocialToggleChange('pinterest', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                      />
                      Active
                    </label>
                  </div>
                  <input
                    type="url"
                    value={formData.socialLinks.pinterest?.url || ''}
                    onChange={(e) => handleSocialUrlChange('pinterest', e.target.value)}
                    placeholder="https://in.pinterest.com/mojilomart"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Amazon */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      <Globe className="h-3.5 w-3.5 text-amber-600" /> Amazon Storefront URL
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.socialLinks.amazon?.enabled ?? true}
                        onChange={(e) => handleSocialToggleChange('amazon', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                      />
                      Active
                    </label>
                  </div>
                  <input
                    type="url"
                    value={formData.socialLinks.amazon?.url || ''}
                    onChange={(e) => handleSocialUrlChange('amazon', e.target.value)}
                    placeholder="https://amzn.to/3W21xlC"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Google Map */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      <Globe className="h-3.5 w-3.5 text-emerald-600" /> Google Map Location URL
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.socialLinks.googleMap?.enabled ?? true}
                        onChange={(e) => handleSocialToggleChange('googleMap', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                      />
                      Active
                    </label>
                  </div>
                  <input
                    type="url"
                    value={formData.socialLinks.googleMap?.url || ''}
                    onChange={(e) => handleSocialUrlChange('googleMap', e.target.value)}
                    placeholder="https://maps.app.goo.gl/wg4HAyaeiJzMcZKA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50"
                  />
                </div>

                {/* LinkedIn */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      <Globe className="h-3.5 w-3.5 text-blue-700" /> LinkedIn Profile / Page URL
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.socialLinks.linkedin?.enabled ?? true}
                        onChange={(e) => handleSocialToggleChange('linkedin', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                      />
                      Active
                    </label>
                  </div>
                  <input
                    type="url"
                    value={formData.socialLinks.linkedin?.url || ''}
                    onChange={(e) => handleSocialUrlChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/mojilo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Twitter / X */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      <AtSign className="h-3.5 w-3.5 text-sky-500" /> Twitter / X Profile URL
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.socialLinks.twitter?.enabled ?? true}
                        onChange={(e) => handleSocialToggleChange('twitter', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                      />
                      Active
                    </label>
                  </div>
                  <input
                    type="url"
                    value={formData.socialLinks.twitter?.url || ''}
                    onChange={(e) => handleSocialUrlChange('twitter', e.target.value)}
                    placeholder="https://x.com/MojiloMart"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50"
                  />
                </div>

                {/* YouTube */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      <Link2 className="h-3.5 w-3.5 text-red-600" /> YouTube Channel URL
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.socialLinks.youtube?.enabled ?? true}
                        onChange={(e) => handleSocialToggleChange('youtube', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                      />
                      Active
                    </label>
                  </div>
                  <input
                    type="url"
                    value={formData.socialLinks.youtube?.url || ''}
                    onChange={(e) => handleSocialUrlChange('youtube', e.target.value)}
                    placeholder="https://youtube.com/@mojilomart"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50"
                  />
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
