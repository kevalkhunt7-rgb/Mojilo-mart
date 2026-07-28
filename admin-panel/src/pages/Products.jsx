import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Plus, Trash2, Edit2, ShoppingBag, Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-react';

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
      const res = await axios.get('/api/products?status=all&limit=1000', { withCredentials: true });
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
      const res = await axios.get('/api/categories', { withCredentials: true });
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
      await axios.delete(`/api/products/${id}`, { withCredentials: true });
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
    <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />
      
      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Catalog Blanks</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Manage your customizable base blanks, prices, and status.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchProducts}
            className="p-2 border border-[#e2e8f0] hover:bg-slate-50 rounded-xl transition-all text-slate-500"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => navigate('/products/add')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors active:scale-98"
          >
            Add New Product
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by product name or brand..."
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
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm">Fetching catalog index...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No products found in the catalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#f1f5f9] text-[11px] font-bold tracking-wider text-[#64748b] uppercase">
                  <th className="py-3 px-6">Image</th>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Base Price</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-3 px-6">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                        {product.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag size={18} className="text-slate-350" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <div>
                        <p className="font-semibold text-slate-900 leading-tight">{product.name || product.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">PID: {product._id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-6 font-medium text-slate-600">
                      {typeof product.category === 'object' ? product.category?.name : 'N/A'}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          Rs. {product.salePrice && Number(product.salePrice) > 0 ? product.salePrice : (product.basePrice || product.price)}
                        </span>
                        {product.salePrice && product.basePrice && Number(product.salePrice) < Number(product.basePrice) && (
                          <span className="text-xs font-medium text-slate-400 line-through">
                            Rs. {product.basePrice}
                          </span>
                        )}
                      </div>
                    </td>
                   
                    <td className="py-3 px-6">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        product.isActive 
                          ? 'bg-green-50 text-green-600 border border-green-100'
                          : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate(`/products/edit/${product._id}`)}
                          className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                          title="Edit Product Details"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(product._id)}
                          className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-colors"
                          title="Disable Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Deactivate Product?</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  This will mark the product as inactive. It will no longer show up for customers on the store, but existing orders remain valid.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-650 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors"
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
