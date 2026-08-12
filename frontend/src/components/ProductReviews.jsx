import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle,
  ThumbsUp,
  Filter,
  SlidersHorizontal,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  X,
  ChevronDown,
  Loader2,
  ShieldCheck,
  Edit3,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import WriteReviewModal from './WriteReviewModal';

export default function ProductReviews({ productId, product }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('newest');
  const [ratingFilter, setRatingFilter] = useState('');
  const [imagesOnly, setImagesOnly] = useState(false);

  // Lightbox Modal for customer review images
  const [activeImage, setActiveImage] = useState(null);

  // Review Modal State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const fetchReviews = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 8,
        sort,
        ...(imagesOnly ? { imagesOnly: 'true' } : {}),
        ...(ratingFilter ? { rating: ratingFilter } : {})
      });

      const res = await api.get(`/reviews/product/${productId}?${params.toString()}`);
      if (res.data && res.data.success) {
        setReviews(res.data.data.reviews || []);
        setTotal(res.data.data.total || 0);
        setPage(res.data.data.page || 1);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load product reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserEligibility = async () => {
    setCheckingEligibility(true);
    try {
      const res = await api.get(`/reviews/check-eligibility?productId=${productId}`);
      if (res.data && res.data.success) {
        setEligibility(res.data.data);
      }
    } catch (err) {
      // User likely not logged in or API error
      setEligibility(null);
    } finally {
      setCheckingEligibility(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews(1);
      checkUserEligibility();
    }
  }, [productId, sort, ratingFilter, imagesOnly]);

  const handleWriteReviewClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to write a review.');
      return;
    }

    if (eligibility) {
      if (eligibility.alreadyReviewed) {
        toast.success('You have already reviewed this product. Opening editor...');
        setIsWriteModalOpen(true);
        return;
      }

      if (!eligibility.canReview) {
        toast.error(eligibility.reason || 'Only customers who have purchased this product in a delivered order can write a review.');
        return;
      }
    }

    setIsWriteModalOpen(true);
  };

  const handleDeleteOwnReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.data && res.data.success) {
        toast.success('Review deleted');
        fetchReviews(page);
        checkUserEligibility();
      }
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const formatDate = (ds) => {
    if (!ds) return '';
    return new Date(ds).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Product rating metrics
  const avgRating = product?.rating ?? 5.0;
  const totalCount = product?.reviewsCount ?? total;
  const distribution = product?.ratingDistribution || { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };

  return (
    <section className="mt-16 pt-12 border-t border-slate-200 font-sans text-slate-800">
      
      {/* SECTION HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            Customer Reviews & Ratings
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Verified ratings and feedback from genuine buyers
          </p>
        </div>

        <button
          onClick={handleWriteReviewClick}
          className="px-5 py-2.5 bg-[#A47A46] hover:bg-[#8e673e] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Star size={14} className="fill-white" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* RATING AGGREGATE SUMMARY CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Col 1: Average Score */}
          <div className="text-center md:border-r border-slate-100 md:pr-8">
            <div className="text-5xl font-black text-slate-900 font-mono tracking-tight">
              {Number(avgRating).toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className={`${
                    Math.round(avgRating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 fill-slate-100'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Based on <span className="font-bold text-slate-800">{totalCount}</span> verified reviews
            </p>
          </div>

          {/* Col 2: Breakdown Bars */}
          <div className="md:col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[String(stars)] || 0;
              const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <div className="w-12 flex items-center gap-1 font-bold text-slate-700 shrink-0">
                    <span>{stars}</span>
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                  </div>

                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="w-14 text-right font-mono text-[11px] text-slate-400 shrink-0 font-medium">
                    {count} ({percent}%)
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* FILTER & SORT CONTROLS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs mb-6 flex flex-wrap items-center justify-between gap-4">
        
        {/* Rating filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter size={13} /> Filter:
          </span>
          <button
            onClick={() => setRatingFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              ratingFilter === ''
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map((st) => (
            <button
              key={st}
              onClick={() => setRatingFilter(ratingFilter === String(st) ? '' : String(st))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                ratingFilter === String(st)
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{st}</span>
              <Star size={11} className="fill-current" />
            </button>
          ))}

          <button
            onClick={() => setImagesOnly(!imagesOnly)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              imagesOnly
                ? 'bg-[#A47A46] text-white border-[#A47A46] shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ImageIcon size={13} />
            <span>With Photos Only</span>
          </button>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort By:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#A47A46]/20 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>

      </div>

      {/* REVIEWS FEED LIST */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <Loader2 className="animate-spin h-8 w-8 text-[#A47A46] mx-auto mb-2" />
          <p className="text-xs font-semibold">Loading verified reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 shadow-xs">
          <MessageSquare size={48} className="mx-auto text-slate-200 mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">No Reviews Found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
            {ratingFilter || imagesOnly
              ? 'No reviews match your selected filters. Try clearing the filter.'
              : 'Be the first buyer to share your experience with this product!'}
          </p>
          {(ratingFilter || imagesOnly) && (
            <button
              onClick={() => { setRatingFilter(''); setImagesOnly(false); }}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const userName = rev.user?.name || rev.user?.email?.split('@')[0] || 'Customer';
            const userInitial = userName.charAt(0).toUpperCase();

            return (
              <div
                key={rev._id || rev.id}
                className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs hover:shadow-sm transition-shadow"
              >
                {/* Top Info Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A47A46] to-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs uppercase shrink-0">
                      {userInitial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                            <ShieldCheck size={11} /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Reviewed on {formatDate(rev.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Stars rating */}
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-700 ml-1 font-mono">
                      {rev.rating}.0
                    </span>
                  </div>
                </div>

                {/* Review Headline & Text */}
                {rev.title && (
                  <h4 className="text-sm font-extrabold text-slate-900 mb-1">
                    {rev.title}
                  </h4>
                )}
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mb-3">
                  {rev.text || rev.comment}
                </p>

                {/* Customer Uploaded Photo Gallery */}
                {rev.reviewImages && rev.reviewImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {rev.reviewImages.map((imgObj, imgIdx) => {
                      const imgUrl = typeof imgObj === 'string' ? imgObj : (imgObj.url || imgObj.secure_url);
                      return (
                        <div
                          key={imgIdx}
                          onClick={() => setActiveImage(imgUrl)}
                          className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 cursor-pointer group relative shadow-2xs hover:border-[#A47A46] transition-all"
                        >
                          <img src={imgUrl} alt={`Review photo ${imgIdx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ImageIcon size={14} className="text-white" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => fetchReviews(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchReviews(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* IMAGE LIGHTBOX MODAL */}
      {activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-3xl max-h-[85vh] w-full flex items-center justify-center">
            <button
              onClick={() => setActiveImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 font-bold p-2 cursor-pointer"
            >
              <X size={24} />
            </button>
            <img
              src={activeImage}
              alt="Enlarged review photo"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
          </div>
        </div>
      )}

      {/* WRITE / EDIT REVIEW MODAL */}
      {isWriteModalOpen && (
        <WriteReviewModal
          isOpen={isWriteModalOpen}
          onClose={() => setIsWriteModalOpen(false)}
          product={product || { _id: productId }}
          orderId={eligibility?.eligibleOrder?.orderId}
          orderItemId={eligibility?.eligibleOrder?.orderItemId}
          existingReview={eligibility?.existingReview}
          onSuccess={() => {
            fetchReviews(1);
            checkUserEligibility();
          }}
        />
      )}

    </section>
  );
}
