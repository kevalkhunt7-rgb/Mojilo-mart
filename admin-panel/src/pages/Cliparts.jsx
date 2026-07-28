import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Plus, Trash2, Edit2, Image as ImageIcon, Upload, Link2, FileImage, FolderPlus } from 'lucide-react';

const Cliparts = () => {
  const [cliparts, setCliparts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClipart, setEditingClipart] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Dual-Upload Control Strategy States
  const [uploadMethod, setUploadMethod] = useState('local');
  const [localFile, setLocalFile] = useState(null);
  const [localFilePreview, setLocalFilePreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    url: '',
    isActive: true,
  });

  const fetchCliparts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/cliparts', { withCredentials: true });
      setCliparts(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch cliparts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCliparts();
  }, []);

  // Handle local system file picking
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validExtensions = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
      if (!validExtensions.includes(file.type) && !file.name.endsWith('.svg') && !file.name.endsWith('.webp')) {
        return toast.error('Unsupported asset layout format! Please use PNG, JPG, WEBP, or vector SVG.');
      }
      
      setLocalFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadMethod === 'local' && !localFile && !editingClipart) {
      return toast.warning('Please select a local image file asset to upload');
    }
    if (uploadMethod === 'url' && !formData.url) {
      return toast.warning('Please input a target graphic direct URL asset link');
    }

    setSubmitting(true);
    try {
      // Choose request strategy depending on selected file source method
      if (uploadMethod === 'local') {
        const multipartData = new FormData();
        multipartData.append('name', formData.name);
        multipartData.append('category', formData.category);
        multipartData.append('isActive', formData.isActive);
        // Map fallback parameters to satisfy Mongoose requirements on the backend
        multipartData.append('imageUrl', formData.url || 'placeholder_local');
        multipartData.append('publicId', editingClipart?.publicId || `clipart_local_${Date.now()}`);
        if (localFile) {
          multipartData.append('image', localFile); // Map to backend Multer setup key configuration
        }

        if (editingClipart) {
          await axios.patch(`/api/cliparts/${editingClipart._id}`, multipartData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
          });
          toast.success('Clipart updated successfully!');
        } else {
          await axios.post('/api/cliparts', multipartData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
          });
          toast.success('Clipart registered successfully!');
        }
      } else {
        // Standard payload execution mapping strategy
        const jsonPayload = {
          name: formData.name,
          category: formData.category,
          isActive: formData.isActive,
          imageUrl: formData.url,
          publicId: editingClipart?.publicId || `clipart_url_${Date.now()}`
        };

        if (editingClipart) {
          await axios.patch(`/api/cliparts/${editingClipart._id}`, jsonPayload, { withCredentials: true });
          toast.success('Clipart updated successfully!');
        } else {
          await axios.post('/api/cliparts', jsonPayload, { withCredentials: true });
          toast.success('Clipart registered successfully!');
        }
      }

      setIsModalOpen(false);
      resetForm();
      fetchCliparts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register configuration details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (clipartId, currentStatus) => {
    try {
      await axios.patch(`/api/cliparts/${clipartId}`, { isActive: !currentStatus }, { withCredentials: true });
      toast.success('Clipart availability updated');
      fetchCliparts();
    } catch (err) {
      toast.error('Failed to change asset visibility status');
    }
  };

  const handleDelete = async (clipartId) => {
    try {
      await axios.delete(`/api/cliparts/${clipartId}`, { withCredentials: true });
      toast.success('Asset flushed from library registry');
      setConfirmDeleteId(null);
      fetchCliparts();
    } catch (err) {
      toast.error('Failed to purge clipart resource instance');
    }
  };

  const openEditModal = (clipart) => {
    setEditingClipart(clipart);
    setUploadMethod('url'); // When editing, default back to displaying url resource mappings
    setFormData({
      name: clipart.name,
      category: clipart.category || '',
      url: clipart.url || clipart.imageUrl || '',
      isActive: clipart.isActive,
    });
    setLocalFile(null);
    setLocalFilePreview('');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingClipart(null);
    setUploadMethod('local');
    setLocalFile(null);
    setLocalFilePreview('');
    setFormData({
      name: '',
      category: '',
      url: '',
      isActive: true,
    });
  };

  const categories = ['all', ...new Set(cliparts.map(c => c.category).filter(Boolean))];

  const filteredCliparts = cliparts.filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />

      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Cliparts Library</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Upload and organize clipart images for the design studio.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 active:scale-98"
        >
          <Plus size={16} /> Add Clipart
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search cliparts by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm outline-none focus:border-[#4f46e5] focus:bg-white"
          />
        </div>
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs px-3 py-2 outline-none text-[#475569] font-medium"
          >
            <option value="all">All Categories</option>
            {categories.filter(cat => cat !== 'all').map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cliparts Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-slate-400 shadow-sm">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
          <p className="text-sm">Fetching cliparts list...</p>
        </div>
      ) : filteredCliparts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-slate-400 shadow-sm">
          <p className="text-sm">No cliparts found. Start seeding design assets!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredCliparts.map((c) => (
            <div 
              key={c._id} 
              className={`bg-white border rounded-xl overflow-hidden transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${
                c.isActive ? 'border-slate-200' : 'border-red-100 opacity-60'
              }`}
            >
              <div className="bg-slate-50 border-b aspect-square relative flex items-center justify-center p-4">
                {c.url || c.imageUrl ? (
                  <img src={c.url || c.imageUrl} alt={c.name} className="max-h-full max-w-full object-contain drop-shadow" />
                ) : (
                  <ImageIcon size={40} className="text-slate-350" />
                )}
                {!c.isActive && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                    HIDDEN
                  </div>
                )}
              </div>

              <div className="p-3.5 space-y-2">
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs truncate" title={c.name}>{c.name}</h4>
                  <p className="text-[9px] bg-indigo-50 text-indigo-650 px-1.5 py-0.5 rounded inline-block font-semibold mt-0.5 border border-indigo-100 uppercase tracking-wider">
                    {c.category || 'General'}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-[#f1f5f9] pt-2 text-[10px]">
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={c.isActive} 
                      onChange={() => handleToggleStatus(c._id, c.isActive)}
                      className="sr-only peer" 
                    />
                    <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>

                  <div className="flex gap-0.5">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(c._id)}
                      className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal Overlay Panel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-1.5">
                <FolderPlus size={18} className="text-indigo-600" />
                <h3 className="font-bold text-base text-[#0f172a]">
                  {editingClipart ? 'Modify Library Clipart' : 'Register Graphic Clipart Asset'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Asset Identity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Lion Crest, Retro Shield"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Storage Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Animals, Sports, Badges, Badges"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
                />
              </div>

              {/* DUAL ARTWORK STRATEGY SOURCE TOGGLES */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Resource Allocation Mode</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('local')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${uploadMethod === 'local' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Upload size={13} /> Local File (.png, .jpg, .svg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${uploadMethod === 'url' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Link2 size={13} /> Asset Link URL
                  </button>
                </div>
              </div>

              {/* DYNAMIC FORM SEGMENT FIELDS */}
              {uploadMethod === 'local' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Choose Graphic Asset</label>
                  {localFilePreview ? (
                    <div className="relative aspect-square w-32 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 mx-auto">
                      <img src={localFilePreview} alt="Local display workspace render" className="max-h-full object-contain drop-shadow-sm" />
                      <button
                        type="button"
                        onClick={() => { setLocalFile(null); setLocalFilePreview(''); }}
                        className="absolute bottom-1 right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md text-[8px] font-bold shadow-xs px-1.5 py-0.5"
                      >
                        Reset
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-white rounded-xl py-5 cursor-pointer text-center group transition-all">
                      <FileImage size={22} className="text-slate-400 group-hover:text-indigo-500 mb-1" />
                      <span className="text-[11px] text-slate-600 font-semibold">Click to browse user machine files</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">Accepts standard PNG, JPG, WEBP, vectors SVG</span>
                      <input type="file" accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Asset Vector / Image URL Link</label>
                  <input
                    type="url"
                    required={uploadMethod === 'url'}
                    placeholder="https://example.com/assets/badge.svg"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs font-mono text-indigo-600 outline-none focus:border-indigo-500"
                  />
                  {formData.url && (
                    <div className="mt-2 aspect-square w-24 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 mx-auto">
                      <img 
                        src={formData.url} 
                        alt="Dynamic live resource link render target" 
                        className="max-h-full object-contain drop-shadow" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                        onLoad={(e) => { e.target.style.display = 'block'; }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : editingClipart ? 'Save Changes' : 'Register Clipart'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Delete Clipart Asset?</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Are you sure you want to permanently delete this clipart? It will no longer be available in the canvas vector library.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cliparts;