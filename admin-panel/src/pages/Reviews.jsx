import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Star, Trash2, Eye, EyeOff, MessageCircle, ShoppingBag, Check } from 'lucide-react';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/reviews', { withCredentials: true });
      setReviews(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleStatus = async (reviewId) => {
    try {
      const res = await axios.patch(`/api/reviews/${reviewId}/status`, {}, { withCredentials: true });
      toast.success(res.data?.message || 'Review status updated');
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update review status');
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      const res = await axios.delete(`/api/reviews/${reviewId}`, { withCredentials: true });
      toast.success(res.data?.message || 'Review deleted successfully');
      setConfirmDeleteId(null);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} fill={i < rating ? 'currentColor' : 'none'} className={i >= rating ? 'text-slate-200' : ''} />
        ))}
      </div>
    );
  };

  // Filter & Search Logic
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch = 
      r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.product?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === 'all' || r.rating === Number(ratingFilter);
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'approved' && r.isActive) || 
      (statusFilter === 'hidden' && !r.isActive);
    
    return matchesSearch && matchesRating && matchesStatus;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />

      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Product Reviews</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Moderate customer feedback and verify product rating distributions.</p>
        </div>
        <div className="text-xs bg-[#eef2ff] text-indigo-600 font-semibold px-3 py-1.5 rounded-full border border-indigo-100">
          Total Feedbacks: {reviews.length}
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
            placeholder="Search reviews by comments, products, names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm outline-none transition-all duration-150 focus:border-[#4f46e5] focus:bg-white focus:ring-2 focus:ring-[#4f46e5]/10"
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs px-3 py-2 outline-none text-[#475569] font-medium"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs px-3 py-2 outline-none text-[#475569] font-medium"
          >
            <option value="all">All Moderation Status</option>
            <option value="approved">Approved & Active</option>
            <option value="hidden">Hidden/Disapproved</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No reviews found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {filteredReviews.map((r) => (
              <div key={r._id} className="p-6 hover:bg-[#fafafa] transition-colors flex flex-col lg:flex-row gap-6 justify-between items-start">
                
                {/* Left side: Review Text, Stars, User */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    {renderStars(r.rating)}
                    <span className="text-[11px] text-slate-400 font-mono">ID: {r._id}</span>
                    {r.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-0.5 bg-green-50 border border-green-100 text-[10px] font-bold text-green-600 px-1.5 py-0.5 rounded-md">
                        <Check size={10} /> Verified Purchase
                      </span>
                    )}
                  </div>
                  
                  <div>
                    {r.title && <h3 className="font-semibold text-slate-900 text-sm">{r.title}</h3>}
                    <p className="text-[#334155] text-xs leading-relaxed mt-1">{r.comment}</p>
                  </div>

                  {/* Attachment Images */}
                  {r.images && r.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {r.images.map((img, idx) => (
                        <div key={idx} className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shadow-sm">
                          <img src={img} alt="review attachment" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 pt-1 text-[11px] text-[#64748b] font-medium">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-[#4f46e5]">
                      {r.user?.name ? r.user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span>By <strong className="text-slate-800">{r.user?.name || 'Deleted User'}</strong></span>
                    <span>&bull;</span>
                    <span>{r.user?.email || 'N/A'}</span>
                    <span>&bull;</span>
                    <span>{new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </div>
                </div>

                {/* Middle: Product info */}
                <div className="flex items-center gap-3 bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-xl w-full lg:w-72">
                  <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {r.product?.images?.[0]?.url ? (
                      <img src={r.product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="text-slate-400" size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{r.product?.name || r.product?.title || 'Unknown Product'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate font-mono">PID: {r.product?._id}</p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex gap-2 shrink-0 self-end lg:self-center">
                  <button
                    onClick={() => handleToggleStatus(r._id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                      r.isActive
                        ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
                    }`}
                    title={r.isActive ? 'Hide Review' : 'Approve Review'}
                  >
                    {r.isActive ? (
                      <>
                        <EyeOff size={14} /> Hide
                      </>
                    ) : (
                      <>
                        <Eye size={14} /> Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(r._id)}
                    className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Delete Review?</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Are you sure you want to permanently delete this customer review from the catalog? This action cannot be undone.
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

export default Reviews;
