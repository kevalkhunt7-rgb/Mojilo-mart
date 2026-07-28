import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Plus, Undo2, Calendar, CheckCircle2, AlertTriangle, ArrowRightLeft, DollarSign } from 'lucide-react';

const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    orderId: '',
    amount: '',
  });

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/refunds', { withCredentials: true });
      setRefunds(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load refund transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.orderId || !formData.amount) {
      return toast.warning('Order ID and Amount are required');
    }

    try {
      // Calls POST /api/refunds to trigger a Razorpay refund
      await axios.post('/api/refunds', {
        orderId: formData.orderId,
        amount: Number(formData.amount)
      }, { withCredentials: true });

      toast.success('Refund request dispatched successfully!');
      setIsModalOpen(false);
      setFormData({ orderId: '', amount: '' });
      fetchRefunds();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch refund');
    }
  };

  const handleUpdateStatus = async (refundId, currentStatus) => {
    // Cycle status: pending -> processed -> failed -> pending
    let nextStatus = 'processed';
    if (currentStatus === 'pending') nextStatus = 'processed';
    else if (currentStatus === 'processed') nextStatus = 'failed';
    else if (currentStatus === 'failed') nextStatus = 'pending';

    try {
      await axios.patch(`/api/refunds/${refundId}`, { status: nextStatus }, { withCredentials: true });
      toast.success(`Refund status updated to ${nextStatus}`);
      fetchRefunds();
    } catch (err) {
      toast.error('Failed to change status');
    }
  };

  // Filter Logic
  const filteredRefunds = refunds.filter((r) => {
    const matchesSearch = 
      r.razorpayRefundId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.order?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.order?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.order?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />

      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Refunds Dashboard</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Manage transaction cancellations, customer reimbursement claims, and statuses.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 active:scale-98"
        >
          <Undo2 size={15} /> Trigger Refund
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
            placeholder="Search Refund ID, Order ID, Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm outline-none transition-all duration-150 focus:border-[#4f46e5] focus:bg-white focus:ring-2 focus:ring-[#4f46e5]/10"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs px-3 py-2 outline-none text-[#475569] font-medium"
          >
            <option value="all">All Refund Statuses</option>
            <option value="pending">Pending</option>
            <option value="processed">Processed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm">Accessing refund accounts...</p>
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No refund records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#f1f5f9] text-[11px] font-bold tracking-wider text-[#64748b] uppercase">
                  <th className="py-3 px-6">Refund Reference ID</th>
                  <th className="py-3 px-6">Linked Details</th>
                  <th className="py-3 px-6">Amount Refunded</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Request Date</th>
                  <th className="py-3 px-6 text-center">Cycle Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
                {filteredRefunds.map((r) => (
                  <tr key={r._id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-4 px-6 space-y-1 font-mono text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] select-none">RP_RFD:</span> {r.razorpayRefundId}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        DB_ID: {r._id}
                      </div>
                    </td>
                    <td className="py-4 px-6 space-y-1">
                      <div>
                        <p className="font-semibold text-slate-900 leading-tight">{r.order?.user?.name || 'Deleted User'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{r.order?.user?.email}</p>
                      </div>
                      <div className="font-mono text-[10px] text-[#4f46e5]">
                        <span className="text-slate-400">ORD:</span> {r.order?._id || r.order}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      Rs. {r.amount}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        r.status === 'processed' 
                          ? 'bg-green-50 text-green-600 border border-green-100'
                          : r.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {r.status === 'processed' ? 'Processed' : r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleUpdateStatus(r._id, r.status)}
                        className="p-1.5 rounded-lg border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                        title="Cycle Status (Mock override)"
                      >
                        <ArrowRightLeft size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trigger Refund Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <Undo2 size={18} className="text-rose-600" />
                <h3 className="font-bold text-lg text-[#0f172a]">Trigger Gateway Refund</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Database Order ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 64b85c13e512401f8087ab9e"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-mono text-slate-800 focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Refund Amount (Rs.)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 499"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none text-sm font-medium text-slate-800 focus:border-rose-500"
                />
              </div>

              <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex gap-2 text-rose-700 text-xs">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p>
                  <strong>Caution:</strong> This will initiate a live transaction refund to the customer's original payment method via Razorpay. This action cannot be reversed.
                </p>
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-650 text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
                >
                  Initiate Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Refunds;
