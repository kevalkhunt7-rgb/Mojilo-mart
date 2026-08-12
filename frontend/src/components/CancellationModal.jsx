import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';

const REASON_PRESETS = [
  'Changed my mind',
  'Ordered by mistake',
  'Found a better price elsewhere',
  'Delivery estimate is too late',
  'Want to change shipping address or size/color',
  'Other'
];

export default function CancellationModal({ isOpen, onClose, orderId, orderNumber, onSuccess }) {
  const [selectedReason, setSelectedReason] = useState(REASON_PRESETS[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalReason = selectedReason === 'Other' 
      ? customNotes.trim() 
      : customNotes.trim() ? `${selectedReason} - ${customNotes.trim()}` : selectedReason;

    if (!finalReason) {
      toast.error('Please specify a reason for cancellation.');
      return;
    }

    setLoading(true);
    try {
      // Endpoint can be /api/cancellations/request or /api/orders/:id/cancel-request
      const res = await api.post('/cancellations/request', {
        orderId,
        reason: finalReason
      });

      if (res.data && res.data.success) {
        toast.success('Cancellation request submitted successfully!');
        if (onSuccess) onSuccess(res.data.data);
        onClose();
      } else {
        toast.error(res.data?.message || 'Failed to submit cancellation request');
      }
    } catch (err) {
      console.error('Cancellation Request Error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit cancellation request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 font-bold">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Request Order Cancellation</h3>
              <p className="text-xs text-slate-400">Order #{orderNumber || orderId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
              What happens next?
            </p>
            <p className="text-amber-700/90 leading-relaxed">
              Your request will be submitted to our team for review. If approved and already paid online via Razorpay, your refund will be processed automatically back to your original payment method.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Reason for Cancellation <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-[#A47A46] focus:ring-2 focus:ring-[#A47A46]/10 transition-all"
            >
              {REASON_PRESETS.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Additional Comments / Details {selectedReason === 'Other' && <span className="text-rose-500">*</span>}
            </label>
            <textarea
              rows={3}
              required={selectedReason === 'Other'}
              placeholder="Please provide any additional context..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-[#A47A46] focus:ring-2 focus:ring-[#A47A46]/10 transition-all resize-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={14} /> Submit Request
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
