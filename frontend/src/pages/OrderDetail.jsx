import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Printer,
  Maximize2,
  FileText,
  Sparkles,
  X,
  ChevronRight,
  ShoppingBag,
  Tag,
  AlertCircle,
  Download,
  Star,
  Edit3,
  Trash2,
  Ban
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import CartItem3DViewer from '../components/CartItem3DViewer';
import WriteReviewModal from '../components/WriteReviewModal';
import CancellationModal from '../components/CancellationModal';

const FULFILLMENT_STEPS = ['pending', 'confirmed', 'printing', 'packed', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected3DItem, setSelected3DItem] = useState(null);
  const [userReviewsMap, setUserReviewsMap] = useState({});
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [reviewModalState, setReviewModalState] = useState({
    isOpen: false,
    product: null,
    orderId: null,
    orderItemId: null,
    existingReview: null
  });

  const fetchUserReviews = async () => {
    try {
      const res = await api.get('/reviews/my');
      if (res.data && res.data.success) {
        const items = res.data.data?.reviews || [];
        const map = {};
        items.forEach(r => {
          const pId = typeof r.product === 'object' ? (r.product._id || r.product.id) : r.product;
          if (pId) map[String(pId)] = r;
        });
        setUserReviewsMap(map);
      }
    } catch (e) {
      console.error('Failed to load user reviews:', e);
    }
  };

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/orders/${id}`);
      if (response.data && response.data.success) {
        setOrder(response.data.data);
      } else {
        setError(response.data?.message || 'Order not found');
      }
    } catch (err) {
      console.error('Failed to load order details:', err);
      setError(err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
      fetchUserReviews();
    }
  }, [id]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.data && res.data.success) {
        toast.success('Review deleted successfully');
        fetchUserReviews();
      }
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF9F6]">
        <div className="w-10 h-10 border-4 border-[#A47A46] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
          {error || "We couldn't find the order you are looking for. It might have been deleted or the link is invalid."}
        </p>
        <button
          onClick={() => navigate('/my-profile')}
          className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to My Orders
        </button>
      </div>
    );
  }

  // Calculate pricing distribution
  const discount = order.discountAmount || order.pricingSummary?.discount || 0;
  const shippingCharges = order.shippingCharges || order.pricingSummary?.shipping || 0;
  const taxAmount = order.taxAmount || order.pricingSummary?.tax || 0;

  const itemsSubtotal = order.items?.reduce((sum, item) => {
    const unitPrice = (item.product?.salePrice && Number(item.product.salePrice) > 0)
      ? Number(item.product.salePrice)
      : (item.price || item.variant?.price || item.product?.basePrice || 0);
    return sum + unitPrice * (item.quantity || 1);
  }, 0) || order.subTotal || 0;

  const customizationTotal = order.items?.reduce((sum, item) => {
    const custCost = item.pricing?.customizationCost || item.customizationCost || 0;
    return sum + (custCost * (item.quantity || 1));
  }, 0) || order.pricingSummary?.customizationCost || 0;

  const grandTotal = order.totalAmount ?? order.grandTotal ?? order.pricingSummary?.grandTotal ?? Math.max(0, itemsSubtotal + customizationTotal + taxAmount + shippingCharges - discount);

  const currentStatus = (order.orderStatus || order.status || 'pending').toLowerCase();
  const currentStepIdx = FULFILLMENT_STEPS.indexOf(currentStatus);

  const orderStatusLower = (order.orderStatus || order.status || '').toLowerCase();
  const paymentStatusLower = (order.paymentStatus || '').toLowerCase();
  const isRefunded = orderStatusLower === 'refunded' || paymentStatusLower === 'refunded' || paymentStatusLower.includes('refund');

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-8 sm:py-12 font-sans antialiased text-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/my-profile" className="hover:text-slate-800 transition-colors">My Account</Link>
            <ChevronRight size={12} />
            <span className="text-slate-800 font-semibold">Order #{order.orderNumber || order._id}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/my-profile')}
              className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Orders
            </button>
            {!['shipped', 'delivered', 'cancelled', 'refunded', 'cancellation_requested'].includes(currentStatus) && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Ban size={14} /> Request Cancellation
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#A47A46] hover:bg-[#8e673e] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} /> Print Invoice
            </button>
          </div>
        </div>

        {/* Refund Success Notice Banner */}
        {isRefunded && (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl mb-8 flex items-start gap-3.5 text-emerald-900 shadow-xs">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-950">Refund Processed Successfully</h4>
              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                Refunded amount will be credited to your account within 5-7 working days.
              </p>
            </div>
          </div>
        )}

        {/* Cancellation Requested Banner */}
        {currentStatus === 'cancellation_requested' && !isRefunded && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl mb-8 flex items-start gap-3 text-amber-900 shadow-xs">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900">Cancellation Request Pending Review</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                You have requested cancellation for this order. Our admin team is currently reviewing your request. If approved and already paid online, your refund will be automatically triggered via Razorpay.
              </p>
            </div>
          </div>
        )}

        {/* Order Info Card Header */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Order #{order.orderNumber || order._id}
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs px-3.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
                  <CheckCircle size={13} /> {order.orderStatus || 'Processing'}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1 rounded-full border uppercase tracking-wider ${
                  order.paymentStatus === 'paid'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <CreditCard size={13} /> {order.paymentStatus || 'Pending'} ({order.paymentMethod || 'Online'})
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Placed on <span className="font-semibold text-slate-700">{formatDate(order.createdAt)}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block mb-0.5 font-medium">Grand Total</span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                ₹{Number(grandTotal).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Fulfillment Tracking Rail */}
          {currentStatus !== 'cancelled' && (
            <div className="pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Fulfillment Status
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {FULFILLMENT_STEPS.map((step, idx) => {
                  const isReached = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;
                  return (
                    <div
                      key={step}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-[#A47A46]/10 border-[#A47A46] text-[#A47A46] font-bold shadow-xs'
                          : isReached
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold'
                          : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {isReached ? <CheckCircle size={14} /> : <Clock size={14} />}
                      </div>
                      <span className="text-[11px] uppercase tracking-wider block font-bold">
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLS: ORDERED PRODUCTS DETAILED LIST */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Package className="text-[#A47A46]" size={20} />
                Ordered Items ({order.items?.length || 0})
              </h3>

              <div className="divide-y divide-slate-100 space-y-6">
                {order.items?.map((item, idx) => {
                  const targetProductId =
                    (item.product && typeof item.product === 'object' ? (item.product._id || item.product.id) : null) ||
                    (typeof item.product === 'string' && item.product !== '[object Object]' ? item.product : null) ||
                    item.productId ||
                    item.customization?.baseTemplateId ||
                    item._id ||
                    item.id;

                  const displayTitle =
                    item.productName ||
                    item.product?.name ||
                    item.product?.title ||
                    item.title ||
                    item.name ||
                    'Custom Garment';

                  const isCustomizationObj = typeof item.customization === 'object' && item.customization !== null;
                  const custObj = isCustomizationObj ? item.customization : {};

                  const itemColor =
                    custObj.selectedColor ||
                    custObj.color ||
                    item.color ||
                    item.selectedColor ||
                    item.variant?.color ||
                    '#3B82F6';

                  const colorName = typeof itemColor === 'object' ? (itemColor.name || itemColor.hex || itemColor.code) : itemColor;

                  // Extract decal image / previews (prioritizing 3D mockup photo if available)
                  let mockupImage =
                    custObj.previews?.mockup ||
                    custObj.mockupUrl ||
                    custObj.mockup ||
                    item.previews?.mockup ||
                    item.mockupUrl ||
                    item.mockup;

                  let frontPreview =
                    mockupImage ||
                    custObj.previewUrl ||
                    custObj.decalUrl ||
                    custObj.designUrl ||
                    custObj.image ||
                    custObj.previews?.front ||
                    item.previews?.front ||
                    item.decalUrl ||
                    item.previewUrl ||
                    item.image ||
                    item.imageUrl;

                  if (!frontPreview && Array.isArray(custObj.layers)) {
                    for (const l of custObj.layers) {
                      const img = l.imageConfig?.originalUrl || l.imageConfig?.processedUrl || l.src || l.url;
                      if (img) { frontPreview = img; break; }
                    }
                  }

                  const displayImage =
                    frontPreview ||
                    item.image ||
                    item.imageUrl ||
                    item.product?.image ||
                    item.product?.imageUrl ||
                    item.product?.images?.[0]?.url ||
                    (typeof item.product?.images?.[0] === 'string' ? item.product?.images?.[0] : null);

                  const displaySize = item.size || item.selectedSize || item.variant?.size || 'Standard';

                  const itemPrice = (item.product?.salePrice && Number(item.product.salePrice) > 0)
                    ? Number(item.product.salePrice)
                    : (item.price || item.variant?.price || item.product?.basePrice || 0);

                  const totalPrice = itemPrice * (item.quantity || 1);

                  const hasLayers = Array.isArray(custObj.layers) && custObj.layers.length > 0;
                  const hasEditableJSON = custObj.editableDesignJSON && typeof custObj.editableDesignJSON === 'object' && Object.keys(custObj.editableDesignJSON).length > 0;
                  const hasCanvasJSON = custObj.canvasJSON && typeof custObj.canvasJSON === 'object' && Object.keys(custObj.canvasJSON).length > 0;

                  const isCustomized = Boolean(
                    item.isCustomized === true ||
                    item.isCustomized === 'true' ||
                    hasLayers ||
                    hasEditableJSON ||
                    hasCanvasJSON ||
                    custObj.isCustomDesign === true ||
                    item.isCustomTemplate ||
                    displayTitle === 'Custom Template Item'
                  );

                  // Extract layer assets uploaded by user
                  const uploadedLayers = (Array.isArray(custObj.layers) ? custObj.layers : []).filter(l => l && (l.src || l.url || l.imageConfig?.originalUrl));

                  const normalized3DItem = {
                    ...item,
                    productName: item.productName || item.product?.name || displayTitle,
                    product: item.product || { name: displayTitle, id: item.productId },
                    clothingType: item.clothingType || custObj.clothingType || displayTitle,
                    productType: item.productType || custObj.baseTemplateId || item.clothingType || displayTitle,
                    color: itemColor,
                    selectedColor: itemColor,
                    customization: isCustomizationObj
                      ? {
                          ...custObj,
                          color: itemColor,
                          selectedColor: itemColor,
                          decalUrl: frontPreview,
                          previewUrl: frontPreview,
                          image: frontPreview,
                          previews: { front: frontPreview, ...(custObj.previews || {}) }
                        }
                      : {
                          color: itemColor,
                          selectedColor: itemColor,
                          decalUrl: frontPreview || item.decalUrl || item.previewUrl || item.image,
                          previewUrl: frontPreview || item.previewUrl || item.decalUrl || item.image,
                          previews: { front: frontPreview || item.decalUrl || item.previewUrl || item.image }
                        }
                  };

                  return (
                    <div key={idx} className="pt-6 first:pt-0">
                      <div className="flex flex-col sm:flex-row items-start gap-5">
                        
                        {/* BIG MOCKUP / DESIGN IMAGE DISPLAY */}
                        <div className="w-full sm:w-44 h-44 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 relative group flex items-center justify-center p-2 shadow-xs">
                          {displayImage ? (
                            <img
                              src={displayImage}
                              alt={displayTitle}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                  e.currentTarget.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}

                          {/* Fallback Silhouette in Item Color */}
                          <div
                            className={`w-full h-full flex flex-col items-center justify-center p-2 rounded-xl relative overflow-hidden ${
                              displayImage ? 'hidden' : 'flex'
                            }`}
                            style={{ backgroundColor: colorName || '#1E3A8A' }}
                          >
                            <svg viewBox="0 0 100 100" className="w-full h-3/4 text-white/90 drop-shadow-md">
                              <path
                                fill="currentColor"
                                d="M30,20 L40,25 Q50,28 60,25 L70,20 L88,35 L76,50 L70,44 L70,82 Q50,85 30,82 L30,44 L24,50 L12,35 Z"
                              />
                            </svg>
                            <span className="text-[10px] text-white font-bold tracking-tight bg-black/30 px-2 py-0.5 rounded mt-1">
                              Custom Model
                            </span>
                          </div>

                          {/* 3D Model Interactive Button Overlay (ONLY for customized items) */}
                          {isCustomized && (
                            <button
                              onClick={() => setSelected3DItem(normalized3DItem)}
                              className="absolute bottom-2 right-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer z-10"
                            >
                              <Maximize2 size={13} />
                              <span>3D View</span>
                            </button>
                          )}


                        </div>

                        {/* PRODUCT & CUSTOMIZATION DETAILS */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="text-base font-bold text-slate-900">
                                {displayTitle}
                              </h4>
                              {isCustomized && (
                                <span className="inline-flex items-center gap-1 bg-[#A47A46]/10 text-[#A47A46] font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-md border border-[#A47A46]/20">
                                  <Sparkles size={11} /> Customized Design
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500">
                              Unit Price: <span className="font-semibold text-slate-700">₹{Number(itemPrice).toFixed(2)}</span>
                            </p>
                          </div>

                          {/* Variant Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg border border-slate-200/50">
                              Quantity: {item.quantity || 1}
                            </span>
                            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg border border-slate-200/50">
                              Size: {displaySize}
                            </span>
                            {colorName && (
                              <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg border border-slate-200/50 flex items-center gap-1.5">
                                Color: <span className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300" style={{ backgroundColor: colorName || '#3B82F6' }}></span> {colorName}
                              </span>
                            )}
                          </div>

                          {/* UPLOADED DESIGNS & LAYERS SECTION (IF CUSTOMIZED) */}
                          {isCustomized && (
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText size={13} /> Customization Artwork & Uploaded Assets
                              </p>

                              {uploadedLayers.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                  {uploadedLayers.map((layer, lIdx) => {
                                    const layerImg = layer.imageConfig?.originalUrl || layer.imageConfig?.processedUrl || layer.src || layer.url;
                                    return (
                                      <div key={lIdx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                                        {layerImg ? (
                                          <img
                                            src={layerImg}
                                            alt={`Layer ${lIdx + 1}`}
                                            className="w-8 h-8 object-contain rounded bg-slate-50 border border-slate-100"
                                          />
                                        ) : (
                                          <FileText size={18} className="text-slate-400" />
                                        )}
                                        <div className="min-w-0">
                                          <p className="text-[10px] font-bold text-slate-700 truncate">
                                            {layer.printAreaName || layer.type || `Layer ${lIdx + 1}`}
                                          </p>
                                          {layerImg && (
                                            <a
                                              href={layerImg}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-[9px] text-[#A47A46] hover:underline font-semibold flex items-center gap-0.5"
                                            >
                                              <Download size={9} /> View High-Res
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">
                                  Custom design decal mapped to garment front/back canvas.
                                </p>
                              )}
                            </div>
                          )}

                          <div className="pt-2 flex justify-between items-center border-t border-slate-50">
                            <span className="text-xs text-slate-400 font-medium">Item Total</span>
                            <span className="text-base font-extrabold text-slate-900 font-mono">
                              ₹{Number(totalPrice).toFixed(2)}
                            </span>
                          </div>

                          {/* REVIEW ACTIONS FOR DELIVERED ORDERS */}
                          {currentStatus === 'delivered' && (
                            <div className="pt-3 flex items-center justify-between border-t border-slate-100 mt-2">
                              {userReviewsMap[targetProductId] || userReviewsMap[String(item._id || item.id)] ? (
                                <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                                  <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                          key={s}
                                          size={13}
                                          className={s <= (userReviewsMap[targetProductId] || userReviewsMap[String(item._id || item.id)]).rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-slate-600 font-semibold text-[11px]">Reviewed ({(userReviewsMap[targetProductId] || userReviewsMap[String(item._id || item.id)]).rating}★)</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setReviewModalState({
                                        isOpen: true,
                                        product: (item.product && typeof item.product === 'object' && (item.product._id || item.product.id))
                                          ? item.product
                                          : { _id: targetProductId, id: targetProductId, name: displayTitle, title: displayTitle },
                                        orderId: order._id,
                                        orderItemId: item._id || item.id,
                                        existingReview: userReviewsMap[targetProductId] || userReviewsMap[String(item._id || item.id)]
                                      })}
                                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <Edit3 size={12} /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReview((userReviewsMap[targetProductId] || userReviewsMap[String(item._id || item.id)])._id || (userReviewsMap[targetProductId] || userReviewsMap[String(item._id || item.id)]).id)}
                                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <Trash2 size={12} /> Delete
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-xs text-slate-500 font-medium">How was your product?</span>
                                  <button
                                    onClick={() => setReviewModalState({
                                      isOpen: true,
                                      product: (item.product && typeof item.product === 'object' && (item.product._id || item.product.id))
                                        ? item.product
                                        : { _id: targetProductId, id: targetProductId, name: displayTitle, title: displayTitle },
                                      orderId: order._id,
                                      orderItemId: item._id || item.id,
                                      existingReview: null
                                    })}
                                    className="px-3.5 py-1.5 bg-[#A47A46] hover:bg-[#8e673e] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Star size={13} className="fill-white" /> Write Review
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COL: SHIPPING DETAILS & PRICE DISTRIBUTION */}
          <div className="space-y-6">
            
            {/* SHIPPING ADDRESS CARD */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="text-[#A47A46]" size={18} />
                Shipping Destination
              </h3>

              {order.shippingAddress ? (
                <div className="space-y-2 text-xs text-slate-600">
                  <p className="font-bold text-sm text-slate-900">
                    {order.shippingAddress.fullName || order.shippingAddress.name || 'Recipient'}
                  </p>
                  <p>{order.shippingAddress.street || order.shippingAddress.addressLine1}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode || order.shippingAddress.postalCode}
                  </p>
                  <p className="font-semibold text-slate-700">{order.shippingAddress.country || 'India'}</p>
                  {order.shippingAddress.phone && (
                    <p className="pt-2 border-t border-slate-100 text-slate-500 font-medium">
                      Phone: <span className="text-slate-800 font-semibold">{order.shippingAddress.phone}</span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No shipping address recorded for this order.</p>
              )}
            </div>

            {/* PRICE DISTRIBUTION BREAKDOWN CARD */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Tag className="text-[#A47A46]" size={18} />
                Price Distribution Summary
              </h3>

              <div className="space-y-3 text-xs border-b border-slate-100 pb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-mono font-semibold text-slate-800">
                    ₹{Number(itemsSubtotal).toFixed(2)}
                  </span>
                </div>

                {customizationTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Customization & Printing Fee</span>
                    <span className="font-mono font-semibold text-slate-800">
                      ₹{Number(customizationTotal).toFixed(2)}
                    </span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon / Discount Applied</span>
                    <span className="font-mono">
                      -₹{Number(discount).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {taxAmount > 0 ? `₹${Number(taxAmount).toFixed(2)}` : 'Included'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {shippingCharges > 0 ? `₹${Number(shippingCharges).toFixed(2)}` : 'FREE'}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <div>
                  <span className="text-sm font-extrabold text-slate-900 block">Total Amount Paid</span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Via {order.paymentMethod || 'Online'}
                  </span>
                </div>
                <span className="text-2xl font-black text-[#A47A46] font-mono">
                  ₹{Number(grandTotal).toFixed(2)}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* FULL-SCREEN 3D MODEL PREVIEW MODAL */}
      {selected3DItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 anim-fadeUp">
          <div className="relative w-full max-w-4xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selected3DItem.productName || selected3DItem.product?.name || '3D Interactive Model'}
                </h3>
                <p className="text-xs text-gray-500">Rotate 360° to inspect garment and print design</p>
              </div>
              <button
                onClick={() => setSelected3DItem(null)}
                className="p-2 rounded-full bg-gray-200/60 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal 3D Body */}
            <div className="flex-1 w-full h-full bg-gray-50 relative">
              <CartItem3DViewer item={selected3DItem} />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-white flex justify-end">
              <button
                onClick={() => setSelected3DItem(null)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded-xl transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WRITE / EDIT REVIEW MODAL */}
      {reviewModalState.isOpen && (
        <WriteReviewModal
          isOpen={reviewModalState.isOpen}
          onClose={() => setReviewModalState({ isOpen: false, product: null, orderId: null, orderItemId: null, existingReview: null })}
          product={reviewModalState.product}
          orderId={reviewModalState.orderId}
          orderItemId={reviewModalState.orderItemId}
          existingReview={reviewModalState.existingReview}
          onSuccess={() => {
            fetchUserReviews();
          }}
        />
      )}

      {/* CANCELLATION REQUEST MODAL */}
      {isCancelModalOpen && (
        <CancellationModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          orderId={order._id}
          orderNumber={order.orderNumber}
          onSuccess={() => {
            fetchOrderDetails();
          }}
        />
      )}

    </div>
  );
}
