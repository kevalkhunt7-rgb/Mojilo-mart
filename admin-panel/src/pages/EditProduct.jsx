import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  ArrowLeft,
  Upload,
  ShoppingBag,
  X,
  Info,
  Tag,
  Sparkles,
  Plus,
  Check,
  Loader2,
  FileText,
  Trash2
} from 'lucide-react';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableCollections, setAvailableCollections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    basePrice: '',
    salePrice: '',
    category: '',
    gender: 'Unisex',
    status: 'Draft',
    material: '',
    newArrival: false,
    featured: false,
    isActive: true,
    searchTags: '',
    tags: [],
    collections: [],
    colors: [],
    sizes: []
  });

  // Image & File States
  const [existingImages, setExistingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [existingSizeChart, setExistingSizeChart] = useState('');
  const [selectedSizeChart, setSelectedSizeChart] = useState(null);
  const [sizeChartPreview, setSizeChartPreview] = useState('');

  // Local helper states
  const [tempColor, setTempColor] = useState('#4f46e5');
  const [customColorName, setCustomColorName] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');

  const fetchProductAndConfig = async () => {
    setLoading(true);
    try {
      const [productRes, catRes, tagsRes, collectionsRes] = await Promise.all([
        axios.get(`/api/products/id/${id}`, { withCredentials: true }),
        axios.get('/api/categories', { withCredentials: true }),
        axios.get('/api/products/tags', { withCredentials: true }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/products/collections', { withCredentials: true }).catch(() => ({ data: { data: [] } }))
      ]);

      const product = productRes.data?.data;
      if (!product) {
        toast.error('Product not found');
        return navigate('/products');
      }

      const cats = Array.isArray(catRes.data?.data) ? catRes.data.data : Array.isArray(catRes.data) ? catRes.data : [];
      const tags = Array.isArray(tagsRes.data?.data) ? tagsRes.data.data : [];
      const collections = Array.isArray(collectionsRes.data?.data) ? collectionsRes.data.data : [];

      setCategories(cats);
      setAvailableTags(tags);
      setAvailableCollections(collections);

      // Populate form state from product model
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        description: product.description || '',
        basePrice: product.basePrice !== undefined ? String(product.basePrice) : (product.price ? String(product.price) : ''),
        salePrice: product.salePrice !== undefined && product.salePrice !== null ? String(product.salePrice) : '',
        category: product.category?._id || product.category || '',
        gender: product.gender || 'Unisex',
        status: product.status || 'Draft',
        material: product.material || '',
        newArrival: !!product.newArrival,
        featured: !!product.featured,
        isActive: product.isActive !== undefined ? !!product.isActive : true,
        searchTags: Array.isArray(product.searchTags) ? product.searchTags.join(', ') : '',
        tags: Array.isArray(product.tags) ? product.tags.map(t => typeof t === 'object' ? t._id : t) : [],
        collections: Array.isArray(product.collections) ? product.collections.map(c => typeof c === 'object' ? c._id : c) : [],
        colors: Array.isArray(product.colors) ? product.colors : [],
        sizes: Array.isArray(product.sizes) ? product.sizes : []
      });

      setExistingImages(product.images || []);
      setExistingSizeChart(product.sizeChart || '');

    } catch (err) {
      toast.error('Failed to load product details and catalog configuration');
      console.error('Fetch Product error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAndConfig();

    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      if (sizeChartPreview) URL.revokeObjectURL(sizeChartPreview);
    };
  }, [id]);

  // Gallery Image Handlers
  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const totalCount = existingImages.length + selectedImages.length + newFiles.length;

    if (totalCount > 5) {
      toast.warning('You can have a maximum of 5 images in total.');
      const allowedCount = Math.max(0, 5 - (existingImages.length + selectedImages.length));
      const allowedFiles = newFiles.slice(0, allowedCount);
      
      const updatedFiles = [...selectedImages, ...allowedFiles];
      setSelectedImages(updatedFiles);

      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImagePreviews(updatedFiles.map(file => URL.createObjectURL(file)));
    } else {
      const updatedFiles = [...selectedImages, ...newFiles];
      setSelectedImages(updatedFiles);

      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImagePreviews(updatedFiles.map(file => URL.createObjectURL(file)));
    }
    e.target.value = '';
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeNewImage = (indexToRemove) => {
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setSelectedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Size Chart Handlers
  const handleSizeChartChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (sizeChartPreview) URL.revokeObjectURL(sizeChartPreview);
      setSelectedSizeChart(file);
      setSizeChartPreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const removeNewSizeChart = () => {
    if (sizeChartPreview) URL.revokeObjectURL(sizeChartPreview);
    setSelectedSizeChart(null);
    setSizeChartPreview('');
  };

  const removeExistingSizeChart = () => {
    setExistingSizeChart('');
  };

  // Color Swatch Handlers
  const handleAddColor = () => {
    const colorToAdd = customColorName.trim() || tempColor;
    if (!formData.colors.includes(colorToAdd)) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, colorToAdd] }));
      setCustomColorName('');
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== colorToRemove)
    }));
  };

  // Size Handlers
  const toggleSize = (sizeVal) => {
    if (formData.sizes.includes(sizeVal)) {
      setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== sizeVal) }));
    } else {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, sizeVal] }));
    }
  };

  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (trimmed && !formData.sizes.includes(trimmed)) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, trimmed] }));
      setCustomSizeInput('');
    }
  };

  // Tag & Collection Toggles
  const toggleTag = (tagId) => {
    if (formData.tags.includes(tagId)) {
      setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagId) }));
    } else {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagId] }));
    }
  };

  const toggleCollection = (collId) => {
    if (formData.collections.includes(collId)) {
      setFormData(prev => ({ ...prev, collections: prev.collections.filter(c => c !== collId) }));
    } else {
      setFormData(prev => ({ ...prev, collections: [...prev.collections, collId] }));
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return toast.warning('Product Name is required.');
    }
    if (!formData.basePrice || Number(formData.basePrice) < 0) {
      return toast.warning('A valid Base Price is required.');
    }
    if (formData.salePrice !== '' && Number(formData.salePrice) >= Number(formData.basePrice)) {
      return toast.warning('Sale Price must be lower than Base Price.');
    }
    if (!formData.category) {
      return toast.warning('Please select a Category.');
    }
    if (!formData.description.trim()) {
      return toast.warning('Product Description is required.');
    }

    const data = new FormData();
    data.append('name', formData.name.trim());
    if (formData.slug.trim()) data.append('slug', formData.slug.trim());
    if (formData.sku.trim()) data.append('sku', formData.sku.trim());
    data.append('description', formData.description.trim());
    data.append('basePrice', formData.basePrice);
    data.append('salePrice', formData.salePrice !== '' ? formData.salePrice : '');
    data.append('category', formData.category);
    data.append('gender', formData.gender);
    data.append('status', formData.status);
    data.append('material', formData.material.trim());
    data.append('newArrival', String(formData.newArrival));
    data.append('featured', String(formData.featured));
    data.append('isActive', String(formData.isActive));

    // Append JSON formatted fields
    data.append('existingImages', JSON.stringify(existingImages));

    const searchTagsArr = formData.searchTags
      ? formData.searchTags.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    data.append('searchTags', JSON.stringify(searchTagsArr));
    data.append('tags', JSON.stringify(formData.tags));
    data.append('collections', JSON.stringify(formData.collections));
    data.append('colors', JSON.stringify(formData.colors));
    data.append('sizes', JSON.stringify(formData.sizes));

    // Append Size Chart URL/File
    if (selectedSizeChart) {
      data.append('sizeChart', selectedSizeChart);
    } else if (!existingSizeChart) {
      data.append('sizeChart', '');
    }

    // Append New Image Files
    selectedImages.forEach(file => {
      data.append('images', file);
    });

    setSubmitting(true);
    try {
      await axios.patch(`/api/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      toast.success('Product updated successfully!');
      setTimeout(() => navigate('/products'), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
      console.error('Update Product error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
        <p className="text-sm font-semibold">Loading product details...</p>
      </div>
    );
  }

  const standardSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  const totalImagesCount = existingImages.length + selectedImages.length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors border border-slate-200"
            title="Back to Products"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Edit Product</h1>
            <p className="text-xs text-slate-500 font-medium">Update specifications and catalog preferences for {formData.name || 'Product'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
            <span>{submitting ? 'Updating...' : 'Update Product'}</span>
          </button>
        </div>
      </div>

      {/* Main Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Specifications */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-3 border-slate-100 flex items-center gap-2">
              <ShoppingBag size={16} className="text-indigo-600" /> Basic Product Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Heavyweight Oversized Tee"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">SKU Code</label>
                <input
                  type="text"
                  placeholder="e.g. TEE-BLK-001"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Custom Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. classic-heavyweight-oversized-tee"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Product Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Material / Fabric</label>
                <input
                  type="text"
                  placeholder="e.g. 100% Combed Cotton, 240 GSM"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Product Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows="4"
                required
                placeholder="Write detailed bullet points, fit quality, care instructions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-3 border-slate-100 flex items-center gap-2">
              <Info size={16} className="text-indigo-600" /> Pricing Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Base Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 799"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Sale Price (₹) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 599"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Colors & Sizes Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-3 border-slate-100 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" /> Product Attributes (Colors & Sizes)
            </h3>

            {/* Colors */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Available Colors</label>
              <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <input
                  type="color"
                  value={tempColor}
                  onChange={(e) => setTempColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                  title="Pick a color hex"
                />
                <input
                  type="text"
                  placeholder="Color name or Hex code (e.g. Black / #000000)"
                  value={customColorName}
                  onChange={(e) => setCustomColorName(e.target.value)}
                  className="flex-1 min-w-[200px] bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Plus size={14} /> Add Color
                </button>
              </div>

              {formData.colors.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.colors.map((color) => {
                    const isHex = color.startsWith('#');
                    return (
                      <div key={color} className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800">
                        {isHex && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block"
                            style={{ backgroundColor: color }}
                          />
                        )}
                        <span>{color}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(color)}
                          className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sizes */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Available Sizes</label>
              
              <div className="flex flex-wrap gap-2">
                {standardSizes.map((sz) => {
                  const isSelected = formData.sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 max-w-sm pt-1">
                <input
                  type="text"
                  placeholder="Custom Size (e.g. 40, Free Size)"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  className="flex-1 bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium outline-none focus:bg-white focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Tags & Collections */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-3 border-slate-100 flex items-center gap-2">
              <Tag size={16} className="text-indigo-600" /> Tags, Collections & Search Index
            </h3>

            {/* Tags */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Select Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((t) => {
                    const isSelected = formData.tags.includes(t._id);
                    return (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => toggleTag(t._id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Collections */}
            {availableCollections.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Assign to Collections</label>
                <div className="flex flex-wrap gap-2">
                  {availableCollections.map((c) => {
                    const isSelected = formData.collections.includes(c._id);
                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => toggleCollection(c._id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Search Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Search Keywords / Search Tags</label>
              <input
                type="text"
                placeholder="Comma separated keywords e.g. tshirt, cotton, oversized, summer"
                value={formData.searchTags}
                onChange={(e) => setFormData({ ...formData, searchTags: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
              <p className="text-[11px] text-slate-400 font-medium">Improves internal search relevance for customers</p>
            </div>
          </div>

        </div>

        {/* Right Sidebar (1 Col) */}
        <div className="space-y-6">

          {/* Visibility Badges Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-3 border-slate-100">Visibility & Status</h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-800">Active Status</p>
                  <p className="text-[11px] text-slate-500 font-medium">Visible to customers in store</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-800">New Arrival</p>
                  <p className="text-[11px] text-slate-500 font-medium">Mark product with New badge</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.newArrival}
                  onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-800">Featured Product</p>
                  <p className="text-[11px] text-slate-500 font-medium">Highlight on homepage & featured lists</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>

          {/* Product Images Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Product Gallery</h3>
              <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                {totalImagesCount} / 5
              </span>
            </div>

            {totalImagesCount < 5 ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-300 transition-colors relative group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="text-slate-400 group-hover:text-indigo-600 mb-2 transition-colors" size={24} />
                <p className="text-xs text-slate-600 font-bold">Upload Product Images</p>
                <p className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG or WEBP (Max 5 images)</p>
              </div>
            ) : (
              <div className="text-center p-3 border border-dashed border-amber-200 bg-amber-50 rounded-xl text-xs text-amber-700 font-medium">
                Maximum limit of 5 images reached.
              </div>
            )}

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Images</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {existingImages.map((img, idx) => (
                    <div key={img._id || idx} className="aspect-square bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative shadow-sm group">
                      <img src={img.url || img} alt="Existing product image" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-transform active:scale-90 shadow"
                        title="Remove image"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Newly Selected Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">New Uploads</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="aspect-square bg-slate-50 rounded-xl border border-indigo-200 overflow-hidden relative shadow-sm group">
                      <img src={src} alt="New upload preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-transform active:scale-90 shadow"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Size Chart Upload Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-3 border-slate-100 flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" /> Size Chart Guide
            </h3>

            {sizeChartPreview ? (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">New Size Chart Selected</p>
                <div className="relative border border-indigo-200 rounded-xl overflow-hidden bg-slate-50 max-h-48 flex items-center justify-center">
                  <img src={sizeChartPreview} alt="Size Chart Preview" className="max-h-48 object-contain" />
                  <button
                    type="button"
                    onClick={removeNewSizeChart}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-all shadow"
                    title="Remove Size Chart"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : existingSizeChart ? (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Size Chart</p>
                <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 max-h-48 flex items-center justify-center">
                  <img src={existingSizeChart} alt="Current Size Chart" className="max-h-48 object-contain" />
                  <button
                    type="button"
                    onClick={removeExistingSizeChart}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-all shadow"
                    title="Delete Size Chart"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-5 bg-slate-50 cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-300 transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSizeChartChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="text-slate-400 mb-1.5" size={20} />
                <p className="text-xs text-slate-600 font-bold">Upload Size Chart</p>
                <p className="text-[10px] text-slate-400">Image of measurements guide</p>
              </div>
            )}
          </div>

        </div>

      </form>
    </div>
  );
}