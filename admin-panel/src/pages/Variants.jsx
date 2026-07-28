import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Plus, Trash2, Edit2, Layers, AlertCircle, RefreshCw, ShoppingBag, Settings, Palette, Ruler } from 'lucide-react';

export default function VariantsPage() {
  const [variants, setVariants] = useState([]);
  const [attributesConfig, setAttributesConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Custom Delete Confirm State
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Attribute Manager Modal State
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [newAttrName, setNewAttrName] = useState('Color'); // 'Color' or 'Size'
  const [newValueName, setNewValueName] = useState(''); // e.g. "Crimson Red", "Extra Large"
  const [newValueRaw, setNewValueRaw] = useState(''); // e.g. "#DC2626", "XL"
  const [submittingAttr, setSubmittingAttr] = useState(false);

  // Clothing type for helper suggestions
  const garmentTypes = ['T-Shirt', 'Oversized', 'Hoodie', 'Full-Sleeve', 'Sports Jersey'];
  const [selectedGarment, setSelectedGarment] = useState('T-Shirt');

  const fetchVariants = async () => {
    try {
      const res = await axios.get('/api/variants', { withCredentials: true });
      setVariants(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load variants database');
      console.error(err);
    }
  };

  const fetchAttributes = async () => {
    try {
      const res = await axios.get('/api/variants/attributes', { withCredentials: true });
      setAttributesConfig(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load attributes configuration', err);
    }
  };

  const initPage = async () => {
    setLoading(true);
    await Promise.all([fetchVariants(), fetchAttributes()]);
    setLoading(false);
  };

  useEffect(() => {
    initPage();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/variants/${id}`, { withCredentials: true });
      toast.success('Product variant deleted successfully!');
      setConfirmDeleteId(null);
      fetchVariants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete variant');
    }
  };

  const handleAddAttributeValue = async (e) => {
    e.preventDefault();
    if (!newValueName || !newValueRaw) {
      return toast.warning('Display name and value are required');
    }

    setSubmittingAttr(true);
    try {
      // Append garment type to the name to keep it organized (e.g. "Oversized Coral Orange" or "Hoodie Charcoal")
      const finalName = `${selectedGarment} - ${newValueName}`;

      await axios.post('/api/variants/attributes/values', {
        attributeName: newAttrName,
        name: finalName,
        value: newValueRaw
      }, { withCredentials: true });

      toast.success(`Custom ${newAttrName} option saved successfully!`);
      setNewValueName('');
      setNewValueRaw('');
      fetchAttributes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add option');
    } finally {
      setSubmittingAttr(false);
    }
  };

  const handleDeleteAttributeValue = async (valId) => {
    try {
      await axios.delete(`/api/variants/attributes/values/${valId}`, { withCredentials: true });
      toast.success('Attribute option removed successfully!');
      fetchAttributes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete option');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />
      
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Product Variants</h1>
          <p className="text-sm text-slate-500 mt-1">Manage unique combinations of sizes, colors, and prices.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={initPage}
            className="p-2 border border-[#e2e8f0] hover:bg-slate-50 rounded-xl transition-all text-slate-500"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          
          {/* Manage Attributes button */}
         
          
        </div>
      </div>

      {/* Table Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm">Fetching variants catalog...</p>
          </div>
        ) : variants.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No variants configured. Create one to assign sizes and colors to products!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#f1f5f9] text-[11px] font-bold tracking-wider text-[#64748b] uppercase">
                  <th className="py-3 px-6">Product Title</th>
                  <th className="py-3 px-6">SKU Code</th>
                  <th className="py-3 px-6">Attributes</th>
                  <th className="py-3 px-6">Price</th>
                  <th className="py-3 px-6 text-center">Stock</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
                {variants.map((v) => (
                  <tr key={v._id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          {v.product?.images?.[0]?.url ? (
                            <img src={v.product.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag size={18} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">
                            {v.product?.name || v.product?.title || 'Blank product'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">PID: {v.product?._id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-slate-655">
                      {v.sku}
                    </td>

                    <td className="py-4 px-6">
                      {v.attributes && v.attributes.length > 0 ? (
                        <div className="flex gap-1.5 flex-wrap">
                          {v.attributes.map((attr, index) => {
                            const isColor = attr.attribute?.name?.toLowerCase() === 'color';
                            return (
                              <span key={index} className="inline-flex items-center gap-1.5 text-[10px] bg-slate-50 border border-slate-100 text-slate-605 px-2 py-0.5 rounded font-semibold uppercase">
                                {isColor && attr.value?.value ? (
                                  <span style={{ backgroundColor: attr.value.value }} className="w-2.5 h-2.5 rounded-full border border-slate-200" />
                                ) : null}
                                <span>{attr.attribute?.name}: {attr.value?.name || attr.value?.value}</span>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">No attributes</span>
                      )}
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-800">
                      Rs. {v.price} {v.discount > 0 && <span className="text-[10px] text-red-500 font-normal">(-Rs.{v.discount})</span>}
                    </td>

                    <td className="py-4 px-6 text-center font-bold text-slate-700 font-mono">
                      {v.inventory} units
                    </td>
                    
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => navigate(`/variants/edit/${v._id}`)}
                          className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                          title="Edit Variant"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(v._id)}
                          className="p-1.5 rounded-lg border border-red-100 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Variant"
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

      {/* Attributes Options Manager Overlay Modal */}
      {isAttrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-4xl w-full p-6 space-y-6 animate-in fade-in zoom-in duration-200 flex flex-col md:flex-row gap-6 max-h-[85vh] overflow-y-auto">
            
            {/* Left side: Add form */}
            <form onSubmit={handleAddAttributeValue} className="space-y-4 md:w-1/2">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-[#0f172a] text-sm flex items-center gap-1.5">
                  <Palette size={16} className="text-indigo-650" /> Add Custom Color / Size
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Garment Category</label>
                <div className="grid grid-cols-3 gap-1">
                  {garmentTypes.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGarment(g)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold text-center border transition-all ${
                        selectedGarment === g 
                          ? 'bg-indigo-600 border-indigo-650 text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-655 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Attribute Category Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setNewAttrName('Color'); setNewValueRaw(''); }}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-all ${
                      newAttrName === 'Color' 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-755' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Palette size={14} /> Color Options
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewAttrName('Size'); setNewValueRaw(''); }}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-all ${
                      newAttrName === 'Size' 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-755' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Ruler size={14} /> Size Options
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Option Display Name</label>
                <input
                  type="text"
                  required
                  placeholder={newAttrName === 'Color' ? 'e.g. Coral Orange, Charcoal Black' : 'e.g. Medium, Extra Large'}
                  value={newValueName}
                  onChange={(e) => setNewValueName(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-705 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                  {newAttrName === 'Color' ? 'Color Hex Code / Preview' : 'Raw Size Tag (e.g. S, M, XXL)'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={newAttrName === 'Color' ? '#FF5733' : 'XXL'}
                    value={newValueRaw}
                    onChange={(e) => setNewValueRaw(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-indigo-500 focus:bg-white"
                  />
                  {newAttrName === 'Color' && newValueRaw.startsWith('#') && newValueRaw.length >= 4 && (
                    <span 
                      style={{ backgroundColor: newValueRaw }} 
                      className="w-8 h-8 rounded-xl border border-slate-200 shadow-inner shrink-0" 
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAttrModalOpen(false)}
                  className="w-full py-2 bg-slate-50 text-slate-500 border hover:bg-slate-100 rounded-xl text-xs font-bold transition-all"
                >
                  Close Manager
                </button>
                <button
                  type="submit"
                  disabled={submittingAttr}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-755 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {submittingAttr ? 'Saving...' : 'Add Option'}
                </button>
              </div>
            </form>

            {/* Right side: Current options list */}
            <div className="md:w-1/2 space-y-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 overflow-y-auto max-h-[70vh]">
              <h4 className="font-bold text-slate-755 text-xs tracking-tight border-b pb-2 uppercase text-slate-400">Available Attribute Options</h4>
              
              <div className="space-y-4">
                {attributesConfig.map((attr) => (
                  <div key={attr._id} className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-655 uppercase tracking-wider flex items-center gap-1">
                      {attr.name === 'Color' ? <Palette size={12} className="text-indigo-500" /> : <Ruler size={12} className="text-teal-500" />}
                      {attr.name} Values ({attr.values?.length || 0})
                    </p>
                    
                    <div className="grid grid-cols-1 gap-1.5">
                      {attr.values?.map((val) => (
                        <div key={val._id} className="flex justify-between items-center text-[11px] bg-[#f8fafc] border px-2.5 py-1.5 rounded-lg">
                          <div className="flex items-center gap-2">
                            {attr.name === 'Color' && (
                              <span style={{ backgroundColor: val.value }} className="w-3 h-3 rounded-full border border-slate-200 shadow-inner" />
                            )}
                            <span className="font-semibold text-slate-800">{val.name || val.value}</span>
                            <span className="text-[9px] text-slate-400 font-mono">({val.value})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttributeValue(val._id)}
                            className="text-slate-400 hover:text-red-500 p-0.5 rounded"
                            title="Remove option"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-655 shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Delete Variant?</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Are you sure you want to permanently delete this product variant? This action will remove it from catalog selections.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-655 hover:bg-slate-50 transition-colors"
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
}