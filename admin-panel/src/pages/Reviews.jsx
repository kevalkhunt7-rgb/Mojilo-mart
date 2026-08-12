import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Star, Trash2, Eye, EyeOff, MessageCircle, ShoppingBag, Check, ShieldCheck, Image as ImageIcon, X } from 'lucide-react';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: 100,
        sort: 'newest',
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(ratingFilter !== 'all' ? { rating: ratingFilter } : {}),
        ...(statusFilter === 'approved' ? { isApproved: 'true' } : {}),
        ...(statusFilter === 'hidden' ? { isApproved: 'false' } : {})
      });

      const res = await api.get(`/reviews/admin?${params.toString()}`);
      if (res.data && res.data.success) {
        setReviews(res.data.data?.reviews || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [searchTerm, ratingFilter, statusFilter]);

  const handleToggleStatus = async (review) => {
    try {
      const newStatus = !review.isApproved;
      const res = await api.patch(`/reviews/admin/${review._id || review.id}/status`, { isApproved: newStatus });
      toast.success(res.data?.message || `Review ${newStatus ? 'Approved' : 'Hidden'} successfully`);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update review status');
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      const res = await api.delete(`/reviews/admin/${reviewId}`);
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

  return (
   <div className="max-w-[1600px] mx-auto space-y-6">
      <ToastContainer />

      {/* Page Header */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-br from-[#312e81] via-[#3730a3] to-[#4338ca] p-5 sm:p-7 rounded-2xl shadow-lg shadow-indigo-900/20">
        <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute right-24 -bottom-20 w-40 h-40 rounded-full bg-white/5" />
        
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200 mb-1">Feedback & Quality</p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Product Reviews & Ratings
          </h1>
          <p className="text-sm text-indigo-200/80 mt-1">
            Moderate customer feedback, approve/hide reviews, and manage rating assets.
          </p>
        </div>

        <div className="relative shrink-0">
          <div className="inline-flex items-center text-xs bg-white/10 text-white font-bold px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm shadow-sm">
            Total Reviews: {reviews.length}
          </div>
        </div>
      </div>
      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-[#181B2A] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#272B40] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by review text, title, user, product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f8fafc] dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#272B40] text-slate-800 dark:text-slate-200 rounded-xl text-sm outline-none transition-all duration-150 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-[#f8fafc] dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#272B40] rounded-xl text-xs px-3 py-2 outline-none text-[#475569] dark:text-slate-300 font-semibold cursor-pointer"
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
            className="bg-[#f8fafc] dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#272B40] rounded-xl text-xs px-3 py-2 outline-none text-[#475569] dark:text-slate-300 font-semibold cursor-pointer"
          >
            <option value="all">All Moderation Status</option>
            <option value="approved">Approved & Published</option>
            <option value="hidden">Hidden / Disapproved</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white dark:bg-[#181B2A] rounded-2xl border border-[#e2e8f0] dark:border-[#272B40] shadow-sm overflow-hidden transition-colors">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-medium">Loading reviews catalog...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <MessageCircle size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No customer reviews found.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting your filters or search query.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {reviews.map((r) => {
              const reviewImages = r.reviewImages || r.images || [];
              const reviewText = r.text || r.comment;

              return (
                <div key={r._id || r.id} className="p-6 hover:bg-[#fafafa] dark:hover:bg-[#1E2235] transition-colors flex flex-col lg:flex-row gap-6 justify-between items-start border-b border-slate-100 dark:border-[#272B40] last:border-0">
                  
                  {/* Left side: Review Text, Stars, User */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      {renderStars(r.rating)}
                      <span className="text-[11px] text-slate-400 font-mono">ID: {r._id || r.id}</span>
                      {r.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          <ShieldCheck size={11} /> Verified Purchase
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        r.isApproved !== false
                          ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900'
                      }`}>
                        {r.isApproved !== false ? 'Approved' : 'Hidden'}
                      </span>
                    </div>
                    
                    <div>
                      {r.title && <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">{r.title}</h3>}
                      <p className="text-[#334155] dark:text-slate-300 text-xs leading-relaxed">{reviewText}</p>
                    </div>

                    {/* Attachment Images */}
                    {reviewImages.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {reviewImages.map((imgObj, idx) => {
                          const imgUrl = typeof imgObj === 'string' ? imgObj : (imgObj.url || imgObj.secure_url);
                          return (
                            <div
                              key={idx}
                              onClick={() => setPreviewImage(imgUrl)}
                              className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs cursor-pointer hover:border-indigo-500 transition-colors"
                            >
                              <img src={imgUrl} alt="review photo" className="w-full h-full object-cover" />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 pt-1 text-[11px] text-[#64748b] dark:text-slate-400 font-medium">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center font-bold text-[10px] text-indigo-600 dark:text-indigo-300">
                        {r.user?.name ? r.user.name[0].toUpperCase() : 'U'}
                      </div>
                      <span>By <strong className="text-slate-800 dark:text-slate-200">{r.user?.name || 'Customer'}</strong></span>
                      <span>&bull;</span>
                      <span>{r.user?.email || 'N/A'}</span>
                      <span>&bull;</span>
                      <span>{new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                  </div>

                  {/* Middle: Product info */}
                  <div className="flex items-center gap-3 bg-[#f8fafc] dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#272B40] p-3 rounded-xl w-full lg:w-72 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-[#181B2A] border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {r.product?.image || r.product?.images?.[0]?.url || (typeof r.product?.images?.[0] === 'string' ? r.product.images[0] : null) ? (
                        <img src={r.product.image || r.product?.images?.[0]?.url || r.product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="text-slate-400" size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{r.product?.name || r.product?.title || 'Product'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate font-mono">ID: {r.product?._id || r.product?.id}</p>
                    </div>
                  </div>

                  {/* Right: Moderation Actions */}
                  <div className="flex gap-2 shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => handleToggleStatus(r)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer ${
                        r.isApproved !== false
                          ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title={r.isApproved !== false ? 'Hide Review' : 'Approve Review'}
                    >
                      {r.isApproved !== false ? (
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
                      onClick={() => setConfirmDeleteId(r._id || r.id)}
                      className="p-2 rounded-xl border border-red-100 hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                      title="Delete Review"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
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
                  Are you sure you want to permanently delete this customer review? Associated Cloudinary images will also be purged.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-650 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-2xl w-full flex items-center justify-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 font-bold p-2 cursor-pointer"
            >
              <X size={24} />
            </button>
            <img src={previewImage} alt="Review attachment" className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-slate-800" />
          </div>
        </div>
      )}

    </div>
  );
};

export default Reviews;
