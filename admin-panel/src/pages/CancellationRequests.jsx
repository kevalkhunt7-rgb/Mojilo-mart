import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Search,
  Ban,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  RotateCcw,
  Check,
  X,
  ChevronRight
} from 'lucide-react';

const CancellationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [approveModal, setApproveModal] = useState({ isOpen: false, request: null, notes: '' });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, request: null, notes: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cancellations', {
        params: { status: statusFilter !== 'all' ? statusFilter : undefined }
      });
      setRequests(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load cancellation requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleApprove = async () => {
    if (!approveModal.request) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/cancellations/${approveModal.request._id}/approve`, {
        adminNotes: approveModal.notes
      });

      const message = res.data?.message || 'Cancellation request approved successfully';
      toast.success(message);
      setApproveModal({ isOpen: false, request: null, notes: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve cancellation request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.request) return;
    setActionLoading(true);
    try {
      await api.patch(`/cancellations/${rejectModal.request._id}/reject`, {
        adminNotes: rejectModal.notes
      });

      toast.success('Cancellation request rejected.');
      setRejectModal({ isOpen: false, request: null, notes: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject cancellation request');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter Search
  const filteredRequests = requests.filter((r) => {
    const s = searchTerm.toLowerCase();
    const orderNumber = r.order?.orderNumber?.toLowerCase() || '';
    const orderId = r.order?._id?.toString().toLowerCase() || '';
    const userName = r.user?.name?.toLowerCase() || r.order?.user?.name?.toLowerCase() || '';
    const userEmail = r.user?.email?.toLowerCase() || r.order?.user?.email?.toLowerCase() || '';
    const reason = r.reason?.toLowerCase() || '';

    const matchesSearch = orderNumber.includes(s) || orderId.includes(s) || userName.includes(s) || userEmail.includes(s) || reason.includes(s);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />

      {/* Page Header */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-5 sm:p-7 rounded-2xl shadow-lg shadow-indigo-950/20">
        <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute right-24 -bottom-20 w-40 h-40 rounded-full bg-white/5" />

        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200 mb-1">Order Operations</p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Ban className="text-rose-400" size={24} /> Cancellation Requests
          </h1>
          <p className="text-sm text-indigo-200/80 mt-1">
            Review customer order cancellation claims, approve refunds via Razorpay API, or reject requests.
          </p>
        </div>

        <div className="relative flex items-center gap-3 shrink-0">
          <button
            onClick={fetchRequests}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl backdrop-blur-md border border-white/15 transition-all cursor-pointer"
          >
            <RotateCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#181B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#272B40] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</p>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#181B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#272B40] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved & Refunded</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{approvedCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#181B2A] p-5 rounded-2xl border border-slate-200 dark:border-[#272B40] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected Requests</p>
            <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{rejectedCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 flex items-center justify-center">
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-[#181B2A] p-4 rounded-xl border border-slate-200 dark:border-[#272B40] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="relative w-full md:w-96">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search Order #, Customer Name, Email, Reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#272B40] rounded-xl text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E2235] text-slate-900 dark:text-white placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1E2235]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#181B2A] rounded-2xl border border-slate-200 dark:border-[#272B40] shadow-sm overflow-hidden transition-colors">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-medium">Fetching cancellation requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Ban size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No cancellation requests found.</p>
            <p className="text-xs text-slate-400 mt-1">There are no matching cancellation requests in the system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#272B40] text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  <th className="py-3.5 px-6">Order Details</th>
                  <th className="py-3.5 px-6">Customer Info</th>
                  <th className="py-3.5 px-6">Reason for Cancellation</th>
                  <th className="py-3.5 px-6">Payment Method & Status</th>
                  <th className="py-3.5 px-6">Date Requested</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#272B40] text-sm text-slate-700 dark:text-slate-300">
                {filteredRequests.map((r) => {
                  const order = r.order || {};
                  const user = r.user || order.user || {};
                  const isPaidOnline = order.paymentMethod === 'Online' || order.paymentStatus === 'paid';

                  return (
                    <tr key={r._id} className="hover:bg-slate-50/80 dark:hover:bg-[#1E2235] transition-colors">
                      
                      {/* Order Details */}
                      <td className="py-4 px-6 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                          #{order.orderNumber || order._id || 'N/A'}
                        </div>
                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                          ₹{order.totalAmount ?? order.grandTotal ?? 0}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-6 space-y-0.5">
                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{user.name || 'Anonymous Customer'}</p>
                        <p className="text-xs text-slate-400">{user.email || 'No email'}</p>
                        {user.phone && <p className="text-[11px] text-slate-500 font-mono">{user.phone}</p>}
                      </td>

                      {/* Cancellation Reason */}
                      <td className="py-4 px-6 max-w-xs whitespace-normal">
                        <div className="bg-slate-50 dark:bg-[#0F172A] p-2.5 rounded-xl border border-slate-200/60 dark:border-[#272B40] text-xs font-medium text-slate-800 dark:text-slate-200">
                          {r.reason}
                        </div>
                        {r.adminNotes && (
                          <p className="text-[10px] text-slate-400 italic mt-1">
                            <strong>Admin Note:</strong> {r.adminNotes}
                          </p>
                        )}
                      </td>

                      {/* Payment Details */}
                      <td className="py-4 px-6 space-y-1">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isPaidOnline 
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}>
                          <CreditCard size={12} /> {order.paymentMethod || 'Online'} ({order.paymentStatus || 'Pending'})
                        </span>
                        {isPaidOnline && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Eligible for Auto Razorpay Refund
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{new Date(r.createdAt).toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                          r.status === 'approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                            : r.status === 'pending'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                        }`}>
                          {r.status === 'pending' && <Clock size={12} />}
                          {r.status === 'approved' && <CheckCircle2 size={12} />}
                          {r.status === 'rejected' && <XCircle size={12} />}
                          {r.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        {r.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setApproveModal({ isOpen: true, request: r, notes: '' })}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Approve & Refund"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => setRejectModal({ isOpen: true, request: r, notes: '' })}
                              className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                              title="Reject Request"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No action required</span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* APPROVE CONFIRMATION MODAL */}
      {approveModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#181B2A] rounded-2xl border border-slate-200 dark:border-[#272B40] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-[#272B40] pb-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={20} />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Approve Order Cancellation</h3>
              </div>
              <button
                onClick={() => setApproveModal({ isOpen: false, request: null, notes: '' })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-semibold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                Are you sure you want to approve cancellation for Order <strong className="font-mono text-slate-900 dark:text-white">#{approveModal.request?.order?.orderNumber || approveModal.request?.order?._id}</strong>?
              </p>

              {(approveModal.request?.order?.paymentMethod === 'Online' || approveModal.request?.order?.paymentStatus === 'paid') ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CreditCard size={14} /> Automatic Razorpay Refund Notice
                  </p>
                  <p>
                    This order was paid online (₹{approveModal.request?.order?.totalAmount}). Approving will automatically invoke the **Razorpay Refund API** and refund the payment to the customer's payment method.
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
                  <p className="font-bold">Unpaid Order</p>
                  <p>Order status will be set to cancelled directly.</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Admin Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Approved and refunded as requested"
                  value={approveModal.notes}
                  onChange={(e) => setApproveModal({ ...approveModal, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#272B40] rounded-xl px-3 py-2 text-xs outline-none text-slate-900 dark:text-white focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#272B40]">
              <button
                type="button"
                onClick={() => setApproveModal({ isOpen: false, request: null, notes: '' })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Approval & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#181B2A] rounded-2xl border border-slate-200 dark:border-[#272B40] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-[#272B40] pb-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <XCircle size={20} />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Reject Cancellation Request</h3>
              </div>
              <button
                onClick={() => setRejectModal({ isOpen: false, request: null, notes: '' })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-semibold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                Reject cancellation request for Order <strong className="font-mono text-slate-900 dark:text-white">#{rejectModal.request?.order?.orderNumber || rejectModal.request?.order?._id}</strong>? The order status will revert to its previous fulfillment state.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Reason for Rejection <span className="text-rose-500">*</span></label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Order has already entered printing phase and cannot be cancelled."
                  value={rejectModal.notes}
                  onChange={(e) => setRejectModal({ ...rejectModal, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#272B40] rounded-xl px-3 py-2 text-xs outline-none text-slate-900 dark:text-white focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#272B40]">
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, request: null, notes: '' })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CancellationRequests;
