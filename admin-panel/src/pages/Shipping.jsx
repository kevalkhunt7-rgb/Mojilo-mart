import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Plus, Trash2, Edit2, Truck, Clock, MapPin, DollarSign } from 'lucide-react';

const Shipping = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    minOrderAmount: '0',
    deliveryTimeEstimated: '',
    isActive: true,
  });

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shipping/methods');
      setMethods(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch shipping methods');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      cost: Number(formData.cost),
      minOrderAmount: Number(formData.minOrderAmount),
    };

    try {
      if (editingMethod) {
        await api.patch(`/shipping/methods/${editingMethod._id}`, payload);
        toast.success('Shipping method updated successfully!');
      } else {
        await api.post('/shipping/methods', payload);
        toast.success('Shipping method created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchMethods();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save shipping method');
    }
  };

  const handleToggleStatus = async (methodId, currentStatus) => {
    try {
      await api.patch(`/shipping/methods/${methodId}`, { isActive: !currentStatus });
      toast.success('Shipping method status updated');
      fetchMethods();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (methodId) => {
    try {
      await api.delete(`/shipping/methods/${methodId}`);
      toast.success('Shipping method deleted successfully!');
      setConfirmDeleteId(null);
      fetchMethods();
    } catch (err) {
      toast.error('Failed to delete shipping method');
    }
  };

  const openEditModal = (method) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      cost: String(method.cost),
      minOrderAmount: String(method.minOrderAmount || 0),
      deliveryTimeEstimated: method.deliveryTimeEstimated,
      isActive: method.isActive,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingMethod(null);
    setFormData({
      name: '',
      cost: '',
      minOrderAmount: '0',
      deliveryTimeEstimated: '',
      isActive: true,
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />

      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Shipping Methods</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Configure fulfillment rules, shipping options, and handling fees.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 active:scale-98"
        >
          <Plus size={16} /> Add Method
        </button>
      </div>

      {/* Shipping Methods Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm">Loading shipping configuration...</p>
          </div>
        ) : methods.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No shipping rates configured. Add one to offer options at checkout!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#f1f5f9] text-[11px] font-bold tracking-wider text-[#64748b] uppercase">
                  <th className="py-3 px-6">Method Name</th>
                  <th className="py-3 px-6">Shipping Fee</th>
                  <th className="py-3 px-6">Min Order Limit</th>
                  <th className="py-3 px-6">Delivery Timing</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
                {methods.map((m) => (
                  <tr key={m._id} className={`hover:bg-[#fafafa] transition-colors ${!m.isActive ? 'opacity-70' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                          <Truck size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{m._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {m.cost === 0 ? (
                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 text-xs">FREE</span>
                      ) : (
                        `Rs. ${m.cost}`
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {m.minOrderAmount > 0 ? `For orders &ge; Rs. ${m.minOrderAmount}` : 'No Minimum'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <Clock size={13} className="text-slate-400" />
                        <span>{m.deliveryTimeEstimated}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        m.isActive 
                          ? 'bg-green-50 text-green-600 border border-green-100'
                          : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={m.isActive} 
                            onChange={() => handleToggleStatus(m._id, m.isActive)}
                            className="sr-only peer" 
                          />
                          <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                        
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                          title="Edit Shipping Method"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(m._id)}
                          className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-colors"
                          title="Delete Shipping Method"
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

      {/* Add / Edit Shipping Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-3">
              <h3 className="font-bold text-lg text-[#0f172a]">{editingMethod ? 'Update Shipping Method' : 'Create Shipping Method'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Method Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Express Courier, Next-Day Air"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Rate Cost (Rs.)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="99"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Min. Order Limit (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 999 to get free shipping"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Estimated Delivery Time</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2-3 business days, Overnight Delivery"
                  value={formData.deliveryTimeEstimated}
                  onChange={(e) => setFormData({ ...formData, deliveryTimeEstimated: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  {editingMethod ? 'Update Option' : 'Register Option'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <AlertCircle size={20} className="text-red-650" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Delete Shipping Method?</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Are you sure you want to delete this shipping method? This will remove it from the selectable delivery options.
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
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipping;
