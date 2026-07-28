import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft, ShoppingBag, Layers, Plus, Trash2 } from 'lucide-react';

export default function EditVariant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Core administrative states
  const [formData, setFormData] = useState({
    product: '',
    sku: '',
    price: '',
    discount: '0',
    inventory: '10',
  });

  // Dynamic instance array pools for managing variant states locally
  const [variantColors, setVariantColors] = useState([]);
  const [variantSizes, setVariantSizes] = useState([]);

  // Local transient states for newly staged additions
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#6366f1');
  const [newSizeCode, setNewSizeCode] = useState('');

  const fetchVariantAndConfig = async () => {
    setLoading(true);
    try {
      const [variantRes, prodRes] = await Promise.all([
        axios.get(`/api/variants/id/${id}`, { withCredentials: true }),
        axios.get('/api/products?status=all&limit=1000', { withCredentials: true }),
      ]);

      const variant = variantRes.data?.data;
      if (!variant) {
        toast.error('Product variant not found');
        return navigate('/variants');
      }

      const rawProds = prodRes.data?.data;
      const prods = Array.isArray(rawProds)
        ? rawProds
        : Array.isArray(rawProds?.products)
        ? rawProds.products
        : Array.isArray(prodRes.data?.products)
        ? prodRes.data.products
        : [];
      setProducts(prods);

      setFormData({
        product: variant.product?._id || variant.product || '',
        sku: variant.sku || '',
        price: String(variant.price || ''),
        discount: String(variant.discount || 0),
        inventory: String(variant.inventory || 0),
      });

      // Map existing variant configurations into operational application state
      // Adapts smoothly to schema arrays or fallback structural primitives
      setVariantColors(variant.colors || (variant.color ? [variant.color] : []));
      setVariantSizes(variant.sizes || (variant.size ? [variant.size] : []));

    } catch (err) {
      toast.error('Failed to load product variant details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariantAndConfig();
  }, [id]);

  // Color dynamic handlers
  const handleAddColor = () => {
    if (!newColorName.trim()) return toast.warning('Please enter a display name for the color');
    if (!/^#[0-9A-F]{6}$/i.test(newColorHex)) return toast.warning('Please provide a valid 6-character hex string');

    // Prevent literal value duplication
    if (variantColors.some(c => c.value.toLowerCase() === newColorHex.toLowerCase())) {
      return toast.warning('This precise color hex value has already been assigned');
    }

    setVariantColors([...variantColors, { name: newColorName.trim(), value: newColorHex }]);
    setNewColorName('');
  };

  const handleRemoveColor = (indexToRemove) => {
    setVariantColors(variantColors.filter((_, idx) => idx !== indexToRemove));
  };

  const handleInlineColorHexChange = (index, updatedHex) => {
    setVariantColors(prevColors => 
      prevColors.map((color, idx) => 
        idx === index ? { ...color, value: updatedHex } : color
      )
    );
  };

  // Size dynamic handlers
  const handleAddSize = () => {
    const cleanSize = newSizeCode.trim().toUpperCase();
    if (!cleanSize) return toast.warning('Size identification tag code cannot be blank');

    if (variantSizes.includes(cleanSize)) {
      return toast.warning('This size variant has already been loaded into configuration stack');
    }

    setVariantSizes([...variantSizes, cleanSize]);
    setNewSizeCode('');
  };

  const handleRemoveSize = (indexToRemove) => {
    setVariantSizes(variantSizes.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sku || !formData.price) {
      return toast.warning('SKU code and base variant asset values are required');
    }

    const payload = {
      sku: formData.sku,
      price: Number(formData.price),
      discount: Number(formData.discount),
      inventory: Number(formData.inventory),
      colors: variantColors, 
      sizes: variantSizes,  
    };

    try {
      await axios.patch(`/api/variants/${id}`, payload, { withCredentials: true });
      toast.success('Product variant states updated successfully!');
      setTimeout(() => navigate('/variants'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update variant properties');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <span className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Retrieving variant catalog specs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto space-y-6 pb-12">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <button 
          onClick={() => navigate('/variants')}
          type="button"
          className="p-2 border rounded-xl hover:bg-slate-50 text-slate-500 transition-all active:scale-95"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">Modify Variant Stocking Properties</h1>
          <p className="text-xs text-[#64748b] mt-0.5">Configure atomic pricing adjustments, inventory levels, and operational attributes.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm space-y-6">
        
        {/* Core Catalog Specifications */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b pb-2 border-slate-100 flex items-center gap-1.5">
            <ShoppingBag size={16} className="text-indigo-500" /> Catalog Mapping
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Base Product (Locked)</label>
              <select
                disabled
                value={formData.product}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-500 cursor-not-allowed"
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name || p.title}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">SKU Code (Must be unique)</label>
              <input
                type="text"
                required
                placeholder="e.g. MOJ-TEE-BLK-M"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-mono text-slate-800 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Price (Rs.)</label>
              <input
                type="number"
                required
                min="0"
                placeholder="349"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Discount (Rs.)</label>
              <input
                type="number"
                min="0"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Stock Count</label>
              <input
                type="number"
                min="0"
                value={formData.inventory}
                onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Attributes Allocation Engine */}
        <div className="space-y-6 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm border-b pb-2 border-slate-100 flex items-center gap-1.5">
            <Layers size={16} className="text-indigo-500" /> Managed Dimensional Values
          </h3>

          {/* Color Matrix Workspace Section */}
          <div className="space-y-3 bg-[#f8fafc] p-4 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Variant Color States</label>
            
            {/* Staged color dynamic list arrays */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {variantColors.map((color, index) => (
                <div key={index} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-100">
                  <div className="flex items-center gap-2.5 w-full">
                    <div className="relative w-7 h-7 rounded-lg border border-slate-300 overflow-hidden cursor-pointer flex-shrink-0">
                      <input 
                        type="color"
                        value={color.value}
                        onChange={(e) => handleInlineColorHexChange(index, e.target.value)}
                        className="absolute inset-[-4px] w-[200%] h-[200%] cursor-pointer p-0 border-0"
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-semibold text-slate-700 truncate">{color.name}</span>
                      <input 
                        type="text" 
                        value={color.value}
                        onChange={(e) => handleInlineColorHexChange(index, e.target.value)}
                        className="text-[10px] font-mono text-slate-400 uppercase bg-transparent border-0 p-0 focus:ring-0 outline-none h-3.5"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {variantColors.length === 0 && (
                <div className="sm:col-span-2 text-center py-4 text-xs font-medium text-slate-400 italic bg-white/50 border border-dashed rounded-xl">
                  No explicit color profiles are linked onto this specific stock code variant.
                </div>
              )}
            </div>

            {/* Insertion Form controls */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 mt-2">
              <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                <div className="relative w-7 h-7 rounded-lg border border-slate-300 overflow-hidden flex-shrink-0">
                  <input 
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="absolute inset-[-4px] w-[200%] h-[200%] cursor-pointer p-0 border-0"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Hex (e.g., #FFFFFF)"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-full text-xs font-mono px-2 py-1 outline-none text-slate-800 uppercase"
                />
              </div>
              <input
                type="text"
                placeholder="Color Name (e.g., Pearl White)"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="flex-[2] text-xs px-2 py-1 outline-none font-medium text-slate-800 border-t sm:border-t-0 sm:border-l border-slate-200"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="w-full sm:w-auto p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1 text-xs font-bold whitespace-nowrap px-3"
              >
                <Plus size={14} /> Add Color
              </button>
            </div>
          </div>

          {/* Size Dimension Workspace Section */}
          <div className="space-y-3 bg-[#f8fafc] p-4 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Assigned Garment Sizes</label>
            
            {/* Dynamic chips visualization */}
            <div className="flex flex-wrap gap-1.5">
              {variantSizes.map((size, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-700 rounded-lg animate-in scale-in duration-700"
                >
                  {size}
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(index)}
                    className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
              {variantSizes.length === 0 && (
                <div className="w-full text-center py-4 text-xs font-medium text-slate-400 italic bg-white/50 border border-dashed rounded-xl">
                  No dimensional size records are presently assigned.
                </div>
              )}
            </div>

            {/* Insertion block element inputs */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 mt-2 max-w-sm">
              <input
                type="text"
                placeholder="e.g. XL, 2XL, M, 32"
                value={newSizeCode}
                onChange={(e) => setNewSizeCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                className="w-full text-xs px-2 py-1 outline-none font-bold text-slate-800 tracking-wide uppercase"
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1 text-xs font-bold px-3 whitespace-nowrap"
              >
                <Plus size={14} /> Add Size
              </button>
            </div>
          </div>

        </div>

        {/* Global form controls */}
        <div className="flex justify-end gap-3 border-t pt-4 border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/variants')}
            className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-98"
          >
            Update Variant
          </button>
        </div>

      </form>
    </div>
  );
}