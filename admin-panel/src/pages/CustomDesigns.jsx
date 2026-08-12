import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Eye, Download, Calendar, User, Layers, Plus, FolderPlus, Palette, Type, RefreshCw, Upload, Link2, FileImage, Trash2, AlertCircle, Edit, Wand2, Sparkles, Scissors } from 'lucide-react';

// Helper to convert base64 Data URL to Blob
const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Canvas Edge-Connected Flood-Fill Background Removal
const removeBackgroundFromImage = (img) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = img.width || img.naturalWidth;
  const height = img.height || img.naturalHeight;
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const colorDistance = (r1, g1, b1, r2, g2, b2) => {
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
  };

  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1]
  ];

  let bgR = 255, bgG = 255, bgB = 255;
  for (const [cx, cy] of corners) {
    const idx = (cy * width + cx) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    if (a > 200) {
      bgR = r;
      bgG = g;
      bgB = b;
      break;
    }
  }

  const tolerance = 45;
  const visited = new Uint8Array(width * height);
  const queue = [];

  const checkAndEnqueue = (x, y) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    const pIdx = idx * 4;
    const r = data[pIdx];
    const g = data[pIdx + 1];
    const b = data[pIdx + 2];
    const a = data[pIdx + 3];

    if (a === 0 || colorDistance(r, g, b, bgR, bgG, bgB) <= tolerance) {
      visited[idx] = 1;
      queue.push(idx);
    }
  };

  for (let x = 0; x < width; x++) {
    checkAndEnqueue(x, 0);
    checkAndEnqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    checkAndEnqueue(0, y);
    checkAndEnqueue(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const currIdx = queue[head++];
    const x = currIdx % width;
    const y = Math.floor(currIdx / width);

    data[currIdx * 4 + 3] = 0;

    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx]) {
          const npIdx = nIdx * 4;
          const nr = data[npIdx];
          const ng = data[npIdx + 1];
          const nb = data[npIdx + 2];
          const na = data[npIdx + 3];

          if (na > 0 && colorDistance(nr, ng, nb, bgR, bgG, bgB) <= tolerance) {
            visited[nIdx] = 1;
            queue.push(nIdx);
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
};

const CustomDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Add Design Form/Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDesignId, setEditingDesignId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  
  // DUAL-UPLOAD CONTROL: 'local' or 'url'
  const [uploadMethod, setUploadMethod] = useState('local'); 
  const [localFile, setLocalFile] = useState(null);
  const [localFilePreview, setLocalFilePreview] = useState('');

  const [newDesign, setNewDesign] = useState({
    name: '',
    productId: '',
    previewUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
  });

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingDesignId(null);
    setNewDesign({
      name: '',
      productId: products[0]?._id || '',
      previewUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    });
    setLocalFile(null);
    setLocalFilePreview('');
  };

  const handleEditClick = (design) => {
    setEditingDesignId(design._id);
    
    setNewDesign({
      name: design.name || '',
      productId: design.product?._id || design.product || '',
      previewUrl: design.previewImage?.url || ''
    });
    
    setUploadMethod(design.previewImage?.url ? 'url' : 'local');
    setLocalFile(null);
    setLocalFilePreview('');
    setIsAddModalOpen(true);
  };

  const fetchDesignsAndProducts = async () => {
    setLoading(true);
    try {
      const [designsRes, productsRes] = await Promise.all([
        api.get('/designs'),
        api.get('/products?status=all&limit=1000')
      ]);
      setDesigns(Array.isArray(designsRes.data?.data) ? designsRes.data.data : []);
      const rawProds = productsRes.data?.data;
      const prods = Array.isArray(rawProds)
        ? rawProds
        : Array.isArray(rawProds?.products)
        ? rawProds.products
        : Array.isArray(productsRes.data?.products)
        ? productsRes.data.products
        : [];
      setProducts(prods);
      
      if (prods.length > 0) {
        setNewDesign(prev => ({ ...prev, productId: prods[0]._id }));
      }
    } catch (err) {
      toast.error('Failed to load custom designs or products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignsAndProducts();
  }, []);

  // Handle local system file picking
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validExtensions = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
      if (!validExtensions.includes(file.type) && !file.name.endsWith('.svg') && !file.name.endsWith('.webp')) {
        return toast.error('Unsupported file format! Please upload PNG, JPG, WEBP, or SVG.');
      }
      
      setLocalFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler for Removing Image Background
  const handleRemoveBackground = async () => {
    const currentSource = uploadMethod === 'local' ? localFilePreview : newDesign.previewUrl;

    if (!currentSource) {
      return toast.warning('Please select a local file or enter an image URL first');
    }

    setIsRemovingBg(true);

    try {
      let imageSrcToLoad = currentSource;

      if (uploadMethod === 'url' && !currentSource.startsWith('data:')) {
        try {
          const response = await fetch(currentSource);
          const blob = await response.blob();
          imageSrcToLoad = URL.createObjectURL(blob);
        } catch (fetchErr) {
          console.warn('Direct fetch failed, falling back to direct URL load:', fetchErr);
        }
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const cleanedDataUrl = removeBackgroundFromImage(img);

          if (uploadMethod === 'local') {
            setLocalFilePreview(cleanedDataUrl);
            const blob = dataURLtoBlob(cleanedDataUrl);
            const fileName = localFile ? localFile.name.replace(/\.[^/.]+$/, '') + '-nobg.png' : 'design-nobg.png';
            const file = new File([blob], fileName, { type: 'image/png' });
            setLocalFile(file);
          } else {
            setNewDesign(prev => ({ ...prev, previewUrl: cleanedDataUrl }));
          }

          toast.success('Background removed successfully!');
        } catch (err) {
          console.error('Error removing background:', err);
          toast.error('Failed to remove background from image. (CORS restricted URL)');
        } finally {
          setIsRemovingBg(false);
        }
      };

      img.onerror = () => {
        toast.error('Failed to load image for background removal. Check the URL or upload locally.');
        setIsRemovingBg(false);
      };

      img.src = imageSrcToLoad;
    } catch (err) {
      console.error('Background removal failed:', err);
      toast.error('Failed to process image');
      setIsRemovingBg(false);
    }
  };

  const handleAddDesignSubmit = async (e) => {
    e.preventDefault();
    const targetProductId = newDesign.productId || products[0]?._id;
    if (!newDesign.name || !targetProductId) {
      return toast.warning('Design name is required');
    }
    if (uploadMethod === 'local' && !localFile && !editingDesignId) {
      return toast.warning('Please select a local layout file to upload');
    }
    if (uploadMethod === 'url' && !newDesign.previewUrl) {
      return toast.warning('Please input a valid graphic target URL link');
    }

    let finalPreviewUrl = newDesign.previewUrl;
    if (uploadMethod === 'url' && finalPreviewUrl) {
      if (finalPreviewUrl.includes('imgurl=')) {
        try {
          const urlObj = new URL(finalPreviewUrl);
          const imgUrlParam = urlObj.searchParams.get('imgurl');
          if (imgUrlParam) {
            finalPreviewUrl = decodeURIComponent(imgUrlParam);
          }
        } catch (err) {
          console.error('Failed to parse Google image url', err);
        }
      }
    }

    setSubmitting(true);
    try {
      const printAreasRes = await api.get(`/designs/print-areas/${targetProductId}`);
      let printAreas = printAreasRes.data?.data || [];
      let printAreaId;

      if (printAreas.length === 0) {
        const newPrintAreaRes = await api.post('/designs/print-areas', {
          product: targetProductId,
          name: 'Front Printable Area',
          width: 300,
          height: 400
        });
        printAreaId = newPrintAreaRes.data?.data?._id;
      } else {
        printAreaId = printAreas[0]._id;
      }

      const customizations = [{
        printAreaId,
        backgroundColor: '#ffffff',
        textLayers: [],
        imageLayers: []
      }];

      if (editingDesignId) {
        if (uploadMethod === 'local' && localFile) {
          const formData = new FormData();
          formData.append('image', localFile);
          formData.append('name', newDesign.name);
          formData.append('productId', targetProductId);
          formData.append('customizations', JSON.stringify(customizations));

          await api.patch(`/designs/${editingDesignId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          await api.patch(`/designs/${editingDesignId}`, {
            name: newDesign.name,
            productId: targetProductId,
            previewImage: uploadMethod === 'url' ? {
              url: finalPreviewUrl,
              publicId: `admin_custom_design_${Date.now()}`
            } : undefined,
            customizations
          });
        }
        toast.success('Custom design updated successfully!');
      } else {
        if (uploadMethod === 'local') {
          const formData = new FormData();
          formData.append('image', localFile);
          formData.append('name', newDesign.name);
          formData.append('productId', targetProductId);
          formData.append('customizations', JSON.stringify(customizations));

          await api.post('/designs/save', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          await api.post('/designs/save', {
            name: newDesign.name,
            productId: targetProductId,
            previewImage: {
              url: finalPreviewUrl,
              publicId: `admin_custom_design_${Date.now()}`
            },
            customizations
          });
        }
        toast.success('Custom design added successfully!');
      }

      setIsAddModalOpen(false);
      setEditingDesignId(null);
      setNewDesign(prev => ({ ...prev, name: '' }));
      setLocalFile(null);
      setLocalFilePreview('');
      fetchDesignsAndProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save custom design');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/designs/${id}`);
      toast.success('Custom design deleted successfully!');
      setConfirmDeleteId(null);
      fetchDesignsAndProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete custom design');
    }
  };

  const filteredDesigns = designs.filter((d) => {
    return d.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           d.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />

      {/* Page Header */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-br from-[#312e81] via-[#3730a3] to-[#4338ca] p-5 sm:p-7 rounded-2xl shadow-lg shadow-indigo-900/20">
        <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute right-24 -bottom-20 w-40 h-40 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200 mb-1">Design Studio Assets</p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Custom Studio Designs
          </h1>
          <p className="text-sm text-indigo-200/80 mt-1">
            Inspect user-generated product designs, text coordinates, and layer assets.
          </p>
        </div>

        <div className="relative flex gap-2 shrink-0">
          <button 
            onClick={fetchDesignsAndProducts}
            className="p-2.5 border border-white/10 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white backdrop-blur-sm cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors active:scale-[0.98] flex-1 sm:flex-none cursor-pointer"
          >
            <Plus size={16} /> Add Custom Design
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by design name, creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Designs Grid layout blocks */}
      {loading ? (
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500 shadow-sm">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
          <p className="text-sm">Fetching custom designs from workspace...</p>
        </div>
      ) : filteredDesigns.length === 0 ? (
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500 shadow-sm">
          <p className="text-sm">No custom user designs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDesigns.map((d) => (
            <div 
              key={d._id} 
              className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 aspect-square relative flex items-center justify-center p-4">
                {d.previewImage?.url ? (
                  <img 
                    src={d.previewImage.url} 
                    alt={d.name} 
                    className="max-h-full max-w-full object-contain drop-shadow-md"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                ) : (
                  <Layers size={48} className="text-slate-300 dark:text-slate-600" />
                )}
                <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-800/95 border border-slate-100 dark:border-slate-700 rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  <Layers size={11} className="text-indigo-500" />
                  <span>{d.customizations?.length || 0} Layers</span>
                </div>
              </div>

              <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate" title={d.name}>{d.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <User size={12} className="text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="truncate">{d.user?.name || 'Guest Creator'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-3.5 text-[11px] text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{d.createdAt ? new Date(d.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' }) : 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDesign(d)}
                      className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-100 dark:border-indigo-800/50 text-indigo-650 dark:text-indigo-400 font-bold px-2 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                      title="Inspect Layers"
                    >
                      <Eye size={12} /> Inspect
                    </button>
                    <button
                      onClick={() => handleEditClick(d)}
                      className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-100 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 font-bold px-2 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                      title="Edit Design Details"
                    >
                      <Edit size={12} /> Edit
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(d._id)}
                      className="flex items-center gap-1 bg-red-50 dark:bg-rose-950/40 hover:bg-red-100 dark:hover:bg-rose-900/60 border border-red-100 dark:border-rose-800/50 text-red-600 dark:text-rose-400 font-bold px-2 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                      title="Delete Custom Design"
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

      {/* Inspect Layers Modal Overlay */}
      {selectedDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Inspect Custom Design Layers</h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedDesign(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-semibold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side: Mockup Preview */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Design Mockup Preview</span>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl aspect-square flex items-center justify-center p-4 relative">
                  {selectedDesign.previewImage?.url ? (
                    <img 
                      src={selectedDesign.previewImage.url} 
                      alt={selectedDesign.name} 
                      className="max-h-full max-w-full object-contain drop-shadow-md" 
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                  ) : (
                    <Layers size={48} className="text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              </div>

              {/* Right Side: Layers Metadata */}
              <div className="space-y-4">
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Design Info</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{selectedDesign.name}</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Creator: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedDesign.user?.name || 'Guest Creator'}</span></p>
                  <p className="text-slate-500 dark:text-slate-400">Date Added: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedDesign.createdAt ? new Date(selectedDesign.createdAt).toLocaleString() : 'N/A'}</span></p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Customization Layers ({selectedDesign.customizations?.length || 0})</span>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {selectedDesign.customizations?.length === 0 ? (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">No customization layers registered</p>
                    ) : (
                      selectedDesign.customizations?.map((cust, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase border-b pb-1.5 border-slate-200 dark:border-slate-800">
                            <span>Area: {cust.printArea?.name || 'General'}</span>
                            <span className="flex items-center gap-1.5">
                              Canvas BG: 
                              <span 
                                className="w-3.5 h-3.5 rounded-full border border-slate-350 dark:border-slate-600 shrink-0" 
                                style={{ backgroundColor: cust.backgroundColor || '#ffffff' }}
                              />
                              {cust.backgroundColor}
                            </span>
                          </div>

                          {/* Text Layers */}
                          {cust.textLayers?.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Text Layers ({cust.textLayers.length})</span>
                              {cust.textLayers.map((tl, tIdx) => (
                                <div key={tIdx} className="bg-white dark:bg-[#0f172a] border border-slate-150 dark:border-slate-800 p-2.5 rounded-lg space-y-1.5 text-xs">
                                  <p className="font-bold text-slate-800 dark:text-slate-200">"{tl.text}"</p>
                                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                    <span>Font: {tl.fontFamily}</span>
                                    <span>Size: {tl.fontSize}px</span>
                                    <span className="flex items-center gap-1">
                                      Color: 
                                      <span 
                                        className="w-2.5 h-2.5 rounded-full border shrink-0" 
                                        style={{ backgroundColor: tl.color || '#000000' }}
                                      />
                                      {tl.color}
                                    </span>
                                    <span>Pos: ({Math.round(tl.x)}, {Math.round(tl.y)})</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Image Layers */}
                          {cust.imageLayers?.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Image Layers ({cust.imageLayers.length})</span>
                              {cust.imageLayers.map((il, iIdx) => (
                                <div key={iIdx} className="bg-white dark:bg-[#0f172a] border border-slate-150 dark:border-slate-800 p-2 rounded-lg flex gap-2 items-center text-xs">
                                  {il.url && (
                                    <img 
                                      src={il.url} 
                                      alt="Image layer" 
                                      crossOrigin="anonymous"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5-11 11"/></svg>';
                                      }}
                                      className="w-10 h-10 object-contain border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 shrink-0" 
                                    />
                                  )}
                                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                    <span>Scale: {il.scaleX?.toFixed(1) || 1}x</span>
                                    <span>Rotation: {il.rotation || 0}°</span>
                                    <span>Pos: ({Math.round(il.x)}, {Math.round(il.y)})</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedDesign(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-rose-950/60 flex items-center justify-center text-red-600 dark:text-rose-400 shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Delete Custom Design?</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  This will permanently delete this design along with its linked customizations, text coordinates, and layer coordinates. This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Custom Design Modal Overlay */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm p-4">
          <form onSubmit={handleAddDesignSubmit} className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {editingDesignId ? 'Edit Custom Studio Design' : 'Publish Custom Admin Design'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-semibold cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Design Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Corporate Summer Print T-Shirt"
                  value={newDesign.name}
                  onChange={(e) => setNewDesign({ ...newDesign, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              {/* DUAL ARTWORK SELECTOR METHOD BUTTONS */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Design Preview Resource Strategy</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('local')}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${uploadMethod === 'local' ? 'bg-white dark:bg-slate-800 shadow-xs text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    <Upload size={13} /> Local File (.png, .jpg, .svg, .webp)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${uploadMethod === 'url' ? 'bg-white dark:bg-slate-800 shadow-xs text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    <Link2 size={13} /> Image Layout URL Link
                  </button>
                </div>
              </div>

              {/* DYNAMIC FORM SEGMENT */}
              {uploadMethod === 'local' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Choose Graphic File</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 rounded-xl py-5 cursor-pointer text-center group transition-all">
                    <FileImage size={22} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 mb-1" />
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                      {localFile ? `Selected: ${localFile.name}` : 'Click to browse your device directories'}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Supports PNG, JPG, JPEG, WEBP, and vector SVG files</span>
                    <input type="file" accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Design Preview Image URL</label>
                  <input
                    type="text"
                    required={uploadMethod === 'url'}
                    placeholder="https://example.com/assets/design-render.png"
                    value={newDesign.previewUrl}
                    onChange={(e) => setNewDesign({ ...newDesign, previewUrl: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* DYNAMIC LIVE IMAGE PREVIEW CARD */}
              {(uploadMethod === 'local' ? localFilePreview : newDesign.previewUrl) && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Design Asset Preview</label>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                      {uploadMethod === 'local' ? 'Local Upload' : 'URL Link Asset'}
                    </span>
                  </div>
                  <div className="relative aspect-video w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-3 shadow-inner group">
                    <div 
                      className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
                        backgroundSize: '12px 12px'
                      }}
                    />
                    <img
                      src={uploadMethod === 'local' ? localFilePreview : newDesign.previewUrl}
                      alt="Design Asset Preview"
                      className="max-h-full max-w-full object-contain relative z-10 drop-shadow-md transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        e.target.style.display = 'block';
                      }}
                    />
                    {uploadMethod === 'local' && localFilePreview && (
                      <button
                        type="button"
                        onClick={() => { setLocalFile(null); setLocalFilePreview(''); }}
                        className="absolute top-2 right-2 z-20 bg-rose-500 hover:bg-rose-600 text-white rounded-lg p-1 text-[10px] font-bold shadow-xs px-2 cursor-pointer"
                      >
                        Clear File
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* REMOVE BACKGROUND BUTTON FIELD */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Scissors size={12} className="text-indigo-600 dark:text-indigo-400" /> Background Removal Tool
                </label>
                <button
                  type="button"
                  onClick={handleRemoveBackground}
                  disabled={isRemovingBg || (uploadMethod === 'local' ? !localFilePreview : !newDesign.previewUrl)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800/50 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isRemovingBg ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Removing Background...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                      <span>Remove Background</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (editingDesignId ? 'Saving...' : 'Publishing...') : (editingDesignId ? 'Save Changes' : 'Publish Design')}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CustomDesigns;