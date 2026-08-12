import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Trash2, Edit2, ShoppingBag, RefreshCw, AlertCircle } from 'lucide-react';

/**
 * FONTS — shared with Dashboard.jsx. Add once to index.html:
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
 */
const FONT_DISPLAY = "'Manrope', ui-sans-serif, system-ui, sans-serif";
const FONT_BODY = "'Inter', ui-sans-serif, system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Custom Delete Confirm Dialog
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?status=all&limit=50');
      const rawData = res.data?.data;
      const items = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.products)
        ? rawData.products
        : Array.isArray(res.data?.products)
        ? res.data.products
        : [];
      setProducts(items);
    } catch (err) {
      toast.error('Failed to load products list');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted (disabled) successfully!');
      setConfirmDeleteId(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Filter Logic
  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter((p) => {
    if (!p) return false;
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    // Category check (handles category object or ID string)
    const catId = typeof p.category === 'object' ? p.category?._id : p.category;
    const matchesCategory = categoryFilter === 'all' || catId === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 text-[#14162B] dark:text-slate-100" style={{ fontFamily: FONT_BODY }}>
      <ToastContainer />

      {/* Page Header */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-br from-[#312e81] via-[#3730a3] to-[#4338ca] p-5 sm:p-7 rounded-2xl shadow-lg shadow-indigo-900/20">
        <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute right-24 -bottom-20 w-40 h-40 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200 mb-1">Product Catalog</p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>
            Catalog Blanks
          </h1>
          <p className="text-sm text-indigo-200/80 mt-1">
            <span className="font-semibold text-white">{safeProducts.length}</span> product{safeProducts.length === 1 ? '' : 's'} · manage base blanks, prices, and status
          </p>
        </div>
        <div className="relative flex gap-2 shrink-0">
          <button
            onClick={fetchProducts}
            className="p-2.5 border border-white/10 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white backdrop-blur-sm"
            title="Refresh data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => navigate('/products/add')}
            className="flex-1 sm:flex-none justify-center bg-white hover:bg-indigo-50 text-indigo-700 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors active:scale-[0.98]"
          >
            Add New Product
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-[#181B2A] p-4 rounded-xl border border-[#E4E6EE] dark:border-[#272B40] shadow-[0_1px_2px_rgba(20,22,43,0.04)] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8FA3] dark:text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by product name or brand…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F5F6FA] dark:bg-[#0F172A] border border-[#E4E6EE] dark:border-[#272B40] rounded-xl text-sm outline-none text-slate-900 dark:text-white placeholder-[#8A8FA3] focus:border-[#2A3466] dark:focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#F5F6FA] dark:bg-[#0F172A] border border-[#E4E6EE] dark:border-[#272B40] rounded-xl text-xs px-3 py-2.5 outline-none text-[#475569] dark:text-slate-200 font-medium focus:border-[#2A3466] dark:focus:border-indigo-500 transition-colors"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white dark:bg-[#181B2A] rounded-2xl border border-[#E4E6EE] dark:border-[#272B40] shadow-[0_1px_2px_rgba(20,22,43,0.04)] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="relative w-9 h-9 mx-auto mb-3">
              <span className="absolute inset-0 rounded-full border-[3px] border-[#E4E6EE] dark:border-slate-800" />
              <span className="absolute inset-0 rounded-full border-[3px] border-[#2A3466] dark:border-indigo-400 border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-[#8A8FA3] dark:text-slate-400">Fetching catalog index…</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-14 text-center">
            <div className="p-3 rounded-full bg-[#F5F6FA] dark:bg-[#0F172A] text-[#8A8FA3] dark:text-slate-500">
              <ShoppingBag size={18} />
            </div>
            <p className="text-sm text-[#6B7280] dark:text-slate-300 font-medium">No products match this search</p>
            <p className="text-xs text-[#8A8FA3] dark:text-slate-500">Try a different name, brand, or category filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#F5F6FA] dark:bg-[#0F172A] border-b border-[#EEF0F5] dark:border-[#272B40] text-[11px] font-bold tracking-wider text-[#8A8FA3] dark:text-slate-400 uppercase">
                  <th className="py-3 px-6">Image</th>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Base Price</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F5] dark:divide-[#272B40] text-sm text-[#334155] dark:text-slate-300">
                {filteredProducts.map((product) => {
                  const hasSale =
                    product.salePrice &&
                    product.basePrice &&
                    Number(product.salePrice) < Number(product.basePrice);
                  return (
                    <tr key={product._id} className="hover:bg-[#F5F6FA]/70 dark:hover:bg-[#1E2235] transition-colors">
                      <td className="py-3 px-6">
                        <div className="w-10 h-10 rounded-xl bg-[#F5F6FA] dark:bg-[#0F172A] border border-[#EEF0F5] dark:border-[#272B40] flex items-center justify-center overflow-hidden">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag size={16} className="text-[#B7BBC9] dark:text-slate-600" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div>
                          <p className="font-semibold text-[#14162B] dark:text-slate-200 leading-tight">{product.name || product.title}</p>
                          <p className="text-[10px] text-[#8A8FA3] dark:text-slate-500 mt-0.5" style={{ fontFamily: FONT_MONO }}>
                            PID: {product._id?.slice(-10)}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-6 font-medium text-[#6B7280] dark:text-slate-400">
                        {typeof product.category === 'object' ? product.category?.name : 'N/A'}
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#14162B] dark:text-slate-200" style={{ fontFamily: FONT_MONO }}>
                            ₹{hasSale ? product.salePrice : (product.basePrice || product.price)}
                          </span>
                          {hasSale && (
                            <span className="text-xs font-medium text-[#B7BBC9] dark:text-slate-500 line-through" style={{ fontFamily: FONT_MONO }}>
                              ₹{product.basePrice}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            product.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/products/edit/${product._id}`)}
                            className="p-1.5 rounded-lg border border-[#EEF0F5] dark:border-[#272B40] text-[#8A8FA3] dark:text-slate-400 hover:text-[#2A3466] dark:hover:text-white hover:bg-[#F5F6FA] dark:hover:bg-[#212538] transition-colors"
                            title="Edit product details"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(product._id)}
                            className="p-1.5 rounded-lg border border-[#F6D9D9] dark:border-rose-900/40 hover:bg-[#FBEAEA] dark:hover:bg-rose-950/40 text-[#C74B4B] dark:text-rose-400 transition-colors"
                            title="Disable product"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14162B]/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#181B2A] rounded-2xl border border-[#E4E6EE] dark:border-[#272B40] shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FBEAEA] dark:bg-rose-950/50 flex items-center justify-center text-[#C74B4B] dark:text-rose-400 shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-[#14162B] dark:text-white text-sm" style={{ fontFamily: FONT_DISPLAY }}>
                  Deactivate product?
                </h4>
                <p className="text-[#6B7280] dark:text-slate-400 text-xs leading-relaxed">
                  This will mark the product as inactive. It will no longer show up for customers on the store, but existing orders remain valid.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#EEF0F5] dark:border-[#272B40]">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E4E6EE] dark:border-[#272B40] text-[#475569] dark:text-slate-300 hover:bg-[#F5F6FA] dark:hover:bg-[#212538] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C74B4B] text-white hover:bg-[#B33F3F] shadow-sm transition-colors"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;