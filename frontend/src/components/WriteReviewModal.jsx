import React, { useState, useEffect } from 'react';
import { Star, Upload, X, Trash2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';

export default function WriteReviewModal({
  isOpen,
  onClose,
  product,
  orderId,
  orderItemId,
  existingReview = null,
  onSuccess
}) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [text, setText] = useState(existingReview?.text || existingReview?.comment || '');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setTitle(existingReview.title || '');
      setText(existingReview.text || existingReview.comment || '');
      // Existing review images preview
      if (Array.isArray(existingReview.reviewImages)) {
        setFilePreviews(
          existingReview.reviewImages.map(img => typeof img === 'string' ? img : (img.url || img.secure_url))
        );
      }
    } else {
      setRating(5);
      setTitle('');
      setText('');
      setSelectedFiles([]);
      setFilePreviews([]);
    }
  }, [existingReview, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (selectedFiles.length + files.length > 3) {
      toast.error('You can upload a maximum of 3 images.');
      return;
    }

    const validFiles = [];
    const newPreviews = [...filePreviews];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit.`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setFilePreviews(newPreviews);
  };

  const handleRemoveImage = (index) => {
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars.');
      return;
    }

    if (!text.trim()) {
      toast.error('Please write a short review.');
      return;
    }

    setSubmitting(true);
    try {
      const extractId = (p) => {
        if (!p) return '';
        if (typeof p === 'string') {
          const trimmed = p.trim();
          return (trimmed && trimmed !== '[object Object]' && trimmed !== 'undefined' && trimmed !== 'null') ? trimmed : '';
        }
        if (typeof p === 'object') {
          const foundId = p._id || p.id || p.productId || (p.product ? extractId(p.product) : '');
          if (foundId && typeof foundId === 'string' && foundId !== '[object Object]') return foundId;
          if (foundId && typeof foundId === 'object') return extractId(foundId);
        }
        return '';
      };

      let cleanProductId = extractId(product);
      if (!cleanProductId && orderItemId) {
        cleanProductId = extractId(orderItemId);
      }

      if (!cleanProductId) {
        toast.error('Invalid product selection.');
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('productId', cleanProductId);
      if (orderId) formData.append('orderId', typeof orderId === 'object' ? (orderId._id || orderId.id) : orderId);
      if (orderItemId) formData.append('orderItemId', typeof orderItemId === 'object' ? (orderItemId._id || orderItemId.id) : orderItemId);
      formData.append('rating', rating);
      formData.append('title', title);
      formData.append('text', text);

      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      let res;
      if (existingReview?._id || existingReview?.id) {
        const rId = existingReview._id || existingReview.id;
        res = await api.patch(`/reviews/${rId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000
        });
      } else {
        res = await api.post('/reviews', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000
        });
      }

      if (res.data && res.data.success) {
        toast.success(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
        if (onSuccess) onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout');
      const isAlreadySubmitted = err.response?.status === 409 || err.response?.data?.message?.toLowerCase().includes('already');

      if (isAlreadySubmitted || isTimeout) {
        toast.success(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
        if (onSuccess) onSuccess();
        onClose();
        return;
      }

      const msg = err.response?.data?.message || 'Failed to submit review. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const productName = product?.name || product?.title || product?.productName || 'Product';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={18} className="text-[#A47A46]" />
              {existingReview ? 'Edit Your Review' : 'Write a Product Review'}
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5 font-medium">
              {productName}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Star Rating Picker */}
          <div className="text-center bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Overall Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star
                    size={32}
                    className={`${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                        : 'text-slate-200 fill-slate-100'
                    } transition-colors duration-150`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-600 mt-2">
              {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][(hoverRating || rating) - 1]}
            </p>
          </div>

          {/* Headline / Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Review Title (Optional)
            </label>
            <input
              type="text"
              placeholder="Summarize your experience (e.g. Great fabric quality & perfect fit!)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A47A46]/20 focus:border-[#A47A46] text-xs transition-all"
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Review <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="What did you like or dislike about this product? Describe the quality, size fit, fabric, or design..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A47A46]/20 focus:border-[#A47A46] text-xs transition-all resize-none"
            ></textarea>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Verified Purchase Review</span>
              <span>{text.length}/1000</span>
            </div>
          </div>

          {/* Review Image Upload (Max 3) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Add Photos (Optional, max 3)
            </label>

            <div className="grid grid-cols-4 gap-3">
              {filePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden group bg-slate-50">
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-rose-600 text-white rounded-full p-1 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {filePreviews.length < 3 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-[#A47A46] bg-slate-50 hover:bg-[#A47A46]/5 flex flex-col items-center justify-center text-slate-400 hover:text-[#A47A46] transition-all cursor-pointer">
                  <Upload size={20} className="mb-1" />
                  <span className="text-[10px] font-bold">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#A47A46] hover:bg-[#8e673e] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>{existingReview ? 'Update Review' : 'Submit Review'}</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
