import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, CreditCard, ExternalLink, Calendar, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/payments', { withCredentials: true });
      setPayments(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch payment history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter Logic
  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      p.razorpayOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.order?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.order?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />

      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Payments Ledger</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Track Razorpay checkouts, transaction states, and gateway reference IDs.</p>
        </div>
        <button 
          onClick={fetchPayments}
          className="p-2 border border-[#e2e8f0] hover:bg-slate-50 rounded-xl transition-all text-slate-500 active:scale-95"
          title="Reload Data"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search Order ID, Payment ID, Customer..."
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
            <option value="all">All Payment States</option>
            <option value="captured">Captured / Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm">Retrieving payments database...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No transaction records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#f1f5f9] text-[11px] font-bold tracking-wider text-[#64748b] uppercase">
                  <th className="py-3 px-6">Gateway Order/Payment ID</th>
                  <th className="py-3 px-6">Customer Details</th>
                  <th className="py-3 px-6">Amount Charged</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Transaction Date</th>
                  <th className="py-3 px-6 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-4 px-6 space-y-1 font-mono text-xs">
                      <div>
                        <span className="text-[#64748b] select-none text-[10px]">RP_ORD:</span> {p.razorpayOrderId}
                      </div>
                      {p.razorpayPaymentId && (
                        <div>
                          <span className="text-[#64748b] select-none text-[10px]">RP_PAY:</span> {p.razorpayPaymentId}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {p.order?.user ? (
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{p.order.user.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{p.order.user.email}</p>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Unknown user</p>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      Rs. {p.amount} <span className="text-[10px] text-slate-400 font-normal">({p.currency || 'INR'})</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        p.status === 'captured' 
                          ? 'bg-green-50 text-green-600 border border-green-100'
                          : p.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                          : p.status === 'refunded'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {p.status === 'captured' ? 'Captured' : p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{new Date(p.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                        title="Inspect Log"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Payment Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-indigo-600" />
                <h3 className="font-bold text-lg text-[#0f172a]">Transaction Details</h3>
              </div>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="bg-[#f8fafc] border border-slate-100 p-4 rounded-xl space-y-2.5 font-mono">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Database ID</span>
                  <span className="text-slate-700 font-semibold">{selectedPayment._id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Razorpay Order ID</span>
                  <span className="text-slate-700 font-semibold">{selectedPayment.razorpayOrderId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Razorpay Payment ID</span>
                  <span className="text-slate-700 font-semibold">{selectedPayment.razorpayPaymentId || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Razorpay Signature</span>
                  <span className="text-slate-700 font-semibold truncate max-w-[200px]">{selectedPayment.razorpaySignature || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Linked Order ID</span>
                  <span className="text-indigo-600 font-semibold select-all">{selectedPayment.order?._id || selectedPayment.order}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Payer Details</p>
                  <p className="font-semibold text-slate-800 mt-1">{selectedPayment.order?.user?.name || 'Deleted User'}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{selectedPayment.order?.user?.email || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Gross Transaction</p>
                  <p className="font-bold text-slate-800 mt-1 text-sm">Rs. {selectedPayment.amount}.00</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{selectedPayment.currency || 'INR'} Currency</p>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
