import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Plus, Trash2, Edit2, Percent, Tag, Calendar, ShoppingBag } from 'lucide-react';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '0',
    maxDiscountAmount: '0',
    usageLimit: '100',
    expiresAt: '',
    isActive: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/coupons', { withCredentials: true });
      setCoupons(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch coupons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      value: Number(formData.value),
      minOrderAmount: Number(formData.minOrderAmount || 0),
      maxDiscountAmount: Number(formData.maxDiscountAmount || 0),
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : 0,
      expiresAt: formData.expiresAt ? formData.expiresAt : null,
    };

    try {
      if (editingCoupon) {
        await axios.patch(`/api/coupons/${editingCoupon._id}`, payload, { withCredentials: true });
        toast.success('Coupon updated successfully!');
      } else {
        await axios.post('/api/coupons', payload, { withCredentials: true });
        toast.success('Coupon created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleToggleStatus = async (couponId, currentStatus) => {
    try {
      await axios.patch(`/api/coupons/${couponId}`, { isActive: !currentStatus }, { withCredentials: true });
      toast.success('Coupon status updated');
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to update coupon status');
    }
  };

  const handleDelete = async (couponId) => {
    try {
      await axios.delete(`/api/coupons/${couponId}`, { withCredentials: true });
      toast.success('Coupon deleted successfully!');
      setConfirmDeleteId(null);
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);

    // Format date to local YYYY-MM-DD
    const expiryDate = coupon.expiresAt
      ? new Date(coupon.expiresAt).toISOString().split('T')[0]
      : '';

    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: String(coupon.minOrderAmount || 0),
      maxDiscountAmount: String(coupon.maxDiscountAmount || 0),
      usageLimit: coupon.usageLimit && coupon.usageLimit > 0 ? String(coupon.usageLimit) : '',
      expiresAt: expiryDate,
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      minOrderAmount: '0',
      maxDiscountAmount: '0',
      usageLimit: '',
      expiresAt: '',
      isActive: true,
    });
  };

  // Filter Logic
  const filteredCoupons = coupons.filter(c =>
    c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />

      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Promo & Coupon Codes</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Create and manage customized checkout discount codes.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 active:scale-98"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by coupon code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm outline-none transition-all duration-150 focus:border-[#4f46e5] focus:bg-white focus:ring-2 focus:ring-[#4f46e5]/10"
          />
        </div>
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-slate-400 shadow-sm">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
          <p className="text-sm">Loading promo codes...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-slate-400 shadow-sm">
          <p className="text-sm">No coupons found. Create your first discount campaign!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((c) => {
            const isExpired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
            return (
              <div
                key={c._id}
                className={`bg-white border rounded-2xl p-6 relative overflow-hidden transition-all shadow-sm ${!c.isActive
                    ? 'border-slate-200 opacity-70'
                    : isExpired
                      ? 'border-amber-200 bg-amber-50/10'
                      : 'border-indigo-100 hover:border-indigo-300 hover:shadow-md'
                  }`}
              >
                {/* Coupon Tag Aesthetic */}
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                  <div className={`text-[10px] font-bold text-center py-1.5 uppercase tracking-wider text-white rotate-45 translate-x-4 translate-y-3 w-[80px] shadow-sm ${!c.isActive
                      ? 'bg-slate-400'
                      : isExpired
                        ? 'bg-amber-500'
                        : 'bg-indigo-600'
                    }`}>
                    {c.type === 'percentage' ? `${c.value}%` : 'FLAT'}
                  </div>
                </div>

                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
                  {/* Code */}
                  <div className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-indigo-100">
                      <Tag size={15} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg tracking-tight font-mono transition-colors duration-200 group-hover:text-indigo-600">
                        {c.code}
                      </h3>
                      <p className="text-[10px] text-slate-400 -mt-0.5 uppercase font-medium">
                        {c.type === 'percentage' ? `${c.value}% Percentage discount` : `Rs. ${c.value} Flat discount`}
                      </p>
                    </div>
                  </div>

                  {/* Coupon Stats */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#f8fafc] p-3 rounded-xl border border-slate-100 transition-all duration-300 hover:border-indigo-200 hover:bg-white hover:shadow-sm">
                    <div>
                      <p className="text-slate-400 text-[10px]">Min. Order Amount</p>
                      <p className="font-semibold text-slate-700 mt-0.5">Rs. {c.minOrderAmount || 0}</p>
                    </div>
                    {c.type === 'percentage' && (
                      <div>
                        <p className="text-slate-400 text-[10px]">Max Discount Cap</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{c.maxDiscountAmount ? `Rs. ${c.maxDiscountAmount}` : 'No Limit'}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-400 text-[10px]">Redemption Ratio</p>
                      <p className="font-semibold text-slate-700 mt-0.5 font-mono"> {c.usageLimit && c.usageLimit > 0 ? c.usageLimit : '∞ (Unlimited)'}</p>
                      <p className="font-semibold text-slate-700 mt-0.5 font-mono"> TOTAL USED : {c.usageCount} </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px]">Status</p>
                      <span className={`inline-flex items-center gap-1 font-semibold text-[10px] rounded-md px-1.5 py-0.5 mt-0.5 transition-colors duration-300 ${!c.isActive
                          ? 'text-slate-500 bg-slate-100'
                          : isExpired
                            ? 'text-amber-600 bg-amber-50'
                            : 'text-green-600 bg-green-50'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${!c.isActive ? 'bg-slate-400' : isExpired ? 'bg-amber-500' : 'bg-green-500 animate-pulse'
                          }`} />
                        {!c.isActive ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Expiration Info */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 group/exp">
                    <Calendar size={13} className="text-slate-400 transition-transform duration-300 group-hover/exp:-rotate-6 group-hover/exp:text-indigo-400" />
                    <span>Expires: <strong>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Never (No Expiry)'}</strong></span>
                  </div>

                  {/* Footer actions */}
                  <div className="flex justify-between items-center border-t border-[#f1f5f9] pt-4">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={c.isActive}
                        onChange={() => handleToggleStatus(c._id, c.isActive)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer transition-colors duration-300 ease-in-out peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:shadow-sm after:transition-all after:duration-300 after:ease-in-out peer-checked:bg-indigo-600"></div>
                      <span className="ml-2 text-xs font-semibold text-slate-500 transition-colors duration-200">Toggle Status</span>
                    </label>

                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 hover:-translate-y-0.5 active:scale-90 transition-all duration-200"
                        title="Edit Coupon"
                      >
                        <Edit2 size={13} className="transition-transform duration-200 group-hover:rotate-12" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(c._id)}
                        className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 hover:border-red-200 text-red-500 hover:-translate-y-0.5 hover:rotate-6 active:scale-90 transition-all duration-200"
                        title="Delete Coupon"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-3">
              <h3 className="font-bold text-lg text-[#0f172a]">{editingCoupon ? 'Update Promo Code' : 'Create Promo Code'}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="SUMMER50"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-mono font-bold text-slate-800 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Discount (Rs.)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder={formData.type === 'percentage' ? '15' : '150'}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Expiry Date</label>
                    <span className="text-[10px] text-slate-400 font-medium">Leave empty for No Expiry</span>
                  </div>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Min. Order (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Max Discount (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    disabled={formData.type === 'flat'}
                    value={formData.type === 'flat' ? '0' : formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Usage Limit</label>
                    <span className="text-[10px] text-slate-400 font-medium">Empty = Unlimited</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Unlimited"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800"
                  />
                </div>
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
                  {editingCoupon ? 'Update Campaign' : 'Publish Campaign'}
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
                <Trash2 size={20} className="text-red-650" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Delete Coupon?</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Are you sure you want to delete this coupon? This will permanently disable the discount campaign code from checkouts.
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
};

export default Coupons;
