import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { ChevronRight, CheckCircle, Tag, Sparkles, Loader2, MapPin, Phone } from 'lucide-react';
import CartItem3DViewer from '../components/CartItem3DViewer';
import OrderPlacedPopup from '../components/SuccessModel';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import api from '../lib/axios';
import { isValidPhone, sanitizePhoneInput } from '../utils/validation';

const inputClass =
  'w-full bg-slate-50/60 border border-slate-200 focus:bg-white rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-[#a47a4c] focus:ring-4 focus:ring-[#a47a4c]/5 transition-all duration-200 placeholder-slate-300';

const labelClass = 'block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2';

// Global keyframes — injected once, scoped by class names below.
const CheckoutAnimationStyles = () => (
  <style>{`
    @keyframes co-fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes co-popIn {
      0%   { opacity: 0; transform: scale(0.4); }
      65%  { opacity: 1; transform: scale(1.18); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes co-shake {
      10%, 90% { transform: translateX(-1px); }
      20%, 80% { transform: translateX(2px); }
      30%, 50%, 70% { transform: translateX(-4px); }
      40%, 60% { transform: translateX(4px); }
    }
    @keyframes co-slideFadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes co-priceFlash {
      0%   { background-color: rgba(16, 185, 129, 0.16); }
      100% { background-color: rgba(16, 185, 129, 0); }
    }
    @keyframes co-shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .co-fade-up { animation: co-fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
    .co-pop-in { animation: co-popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
    .co-shake { animation: co-shake 0.4s ease-in-out; }
    .co-slide-fade-in { animation: co-slideFadeIn 0.3s ease-out both; }
    .co-price-flash { animation: co-priceFlash 1.1s ease-out; border-radius: 6px; }
    .co-shimmer-btn {
      background-image: linear-gradient(110deg, #a47a4c 40%, #c99b6a 50%, #a47a4c 60%);
      background-size: 200% 100%;
      animation: co-shimmer 1.8s linear infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .co-fade-up, .co-pop-in, .co-shake, .co-slide-fade-in, .co-price-flash, .co-shimmer-btn {
        animation: none !important;
      }
    }
  `}</style>
);

const getItemPrice = (item) => {
  if (!item) return 0;

  // 1. Direct unit price on cart item (dynamically passed size price)
  if (typeof item.price === 'number' && !isNaN(item.price) && item.price > 0) {
    return item.price;
  }

  // 2. Custom template items
  if (item.isCustomTemplate || item.customizationId || item.customization) {
    if (typeof item.totalItemPrice === 'number' && !isNaN(item.totalItemPrice) && item.totalItemPrice > 0) {
      return item.totalItemPrice / (item.quantity || 1);
    }
  }

  // 3. Match size-specific price in product.sizes array if available
  const prod = item.product;
  if (prod && typeof prod === 'object' && item.size && Array.isArray(prod.sizes)) {
    const matchedSize = prod.sizes.find((s) => (typeof s === 'object' ? s.size : s) === item.size);
    if (matchedSize && typeof matchedSize === 'object' && matchedSize.price != null && matchedSize.price !== '') {
      const szPrice = Number(matchedSize.price);
      if (!isNaN(szPrice) && szPrice > 0) return szPrice;
    }
  }

  // 4. Standard database product pricing
  if (prod && typeof prod === 'object') {
    const sale = Number(prod.salePrice);
    if (!isNaN(sale) && sale > 0) return sale;
    const price = Number(prod.price);
    if (!isNaN(price) && price > 0) return price;
    const base = Number(prod.basePrice);
    if (!isNaN(base) && base > 0) return base;
  }

  const itemSale = Number(item.salePrice);
  if (!isNaN(itemSale) && itemSale > 0) return itemSale;
  const varPrice = Number(item.variant?.price);
  if (!isNaN(varPrice) && varPrice > 0) return varPrice;

  return Number(item.price || 0);
};

const Checkout = () => {
  const { cart, setCart, appliedCoupon, applyCoupon, removeCoupon, clearCart } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addOrder } = useOrders();

  const [formData, setFormData] = useState({
    firstName: '',
    companyName: '',
    streetAddress: '',
    apartment: '',
    townCity: '',
    state: 'Gujarat',
    postalCode: '395006',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState({ orderNumber: '', itemsCount: 0, totalAmount: 0 });
  const [modalMessage, setModalMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState(appliedCoupon?.code || '');
  const [couponStatus, setCouponStatus] = useState(appliedCoupon ? 'success' : null);
  const [couponMessage, setCouponMessage] = useState(
    appliedCoupon ? `Coupon applied! Saved ₹${appliedCoupon.discountAmount}` : ''
  );
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  // Fetch user saved addresses and prefill default shipping address
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await api.get('/addresses');
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const list = res.data.data;
          setSavedAddresses(list);
          if (list.length > 0) {
            const defaultAddr = list.find(a => a.isDefaultShipping) || list[0];
            if (defaultAddr) {
              selectAddress(defaultAddr);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load saved addresses:', err);
      }
    };
    fetchSavedAddresses();
  }, [isAuthenticated]);

  const selectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setFormData(prev => ({
      ...prev,
      firstName: addr.name || prev.firstName,
      streetAddress: addr.street || prev.streetAddress,
      townCity: addr.city || prev.townCity,
      state: addr.state || prev.state,
      postalCode: addr.zipCode || prev.postalCode,
      phone: addr.phone || prev.phone
    }));
    setFieldErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = name === 'phone' ? sanitizePhoneInput(value) : value;
    setFormData(prev => ({ ...prev, [name]: cleanValue }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: false }));
  };

  // Fetch available coupons
  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      setLoadingCoupons(true);
      try {
        const res = await api.get('/coupons/available');
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setAvailableCoupons(res.data.data);
        }
      } catch (err) {
        console.warn('Could not load available coupons:', err);
      } finally {
        setLoadingCoupons(false);
      }
    };
    fetchAvailableCoupons();
  }, []);

  useEffect(() => {
    if (appliedCoupon) {
      setCouponInput(appliedCoupon.code);
      setCouponStatus('success');
      setCouponMessage(`Coupon applied! Saved ₹${appliedCoupon.discountAmount}`);
    }
  }, [appliedCoupon]);

  const { settings } = useSettings();

  const subtotal = (cart || []).reduce((acc, item) => {
    return acc + getItemPrice(item) * (item?.quantity || 1);
  }, 0);

  const discountAmount = appliedCoupon?.discountAmount || 0;

  const shippingEnabled = settings?.shippingEnabled !== false;
  const freeThreshold = settings?.freeShippingThreshold !== undefined ? Number(settings.freeShippingThreshold) : 999;
  const defaultFee = settings?.defaultShippingCharge !== undefined ? Number(settings.defaultShippingCharge) : 50;

  const isFreeShipping = !shippingEnabled || subtotal >= freeThreshold;
  const shippingCharge = isFreeShipping ? 0 : defaultFee;

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCharge);

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponStatus('error');
      setCouponMessage('Please enter a coupon code.');
      return;
    }

    setCouponStatus(null);
    setCouponMessage('');

    try {
      const res = await applyCoupon(code, subtotal);
      setCouponInput(code);
      setCouponStatus('success');
      setCouponMessage(res.message || `Coupon applied! Saved ₹${res.coupon?.discountAmount || discountAmount}`);
      toast.success(`Coupon ${code} applied successfully!`);
    } catch (err) {
      setCouponStatus('error');
      setCouponMessage(err.message || 'Failed to apply coupon.');
      toast.error(err.message || 'Invalid coupon code.');
    }
  };

  // 1. Define handleCloseModal so clicking the overlay/button never throws ReferenceError
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/my-profile');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }

    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = true;
    if (!formData.streetAddress.trim()) errors.streetAddress = true;
    if (!formData.townCity.trim()) errors.townCity = true;
    if (!formData.postalCode.trim()) errors.postalCode = true;
    if (!formData.phone.trim() || !isValidPhone(formData.phone)) errors.phone = true;

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      if (errors.phone && formData.phone.trim()) {
        toast.error('Please enter a valid 10-digit phone number.');
      } else {
        toast.error('Please fill in all required shipping address fields.');
      }
      return;
    }
    if (!cart || cart.length === 0) return;

    try {
      setIsProcessing(true);

      // Explicitly construct items array with customization & decal metadata
      const mappedItems = cart.map((item) => {
        const custObj = item.customization || item.customizationId || {};
        const frontPreview =
          custObj.decalUrl ||
          custObj.previewUrl ||
          custObj.previews?.front ||
          item.previews?.front ||
          item.image ||
          item.product?.images?.[0]?.url;

        return {
          product: item.product?._id || item.productId || item._id,
          productName: item.product?.name || item.name || 'Sports Jersey',
          quantity: item.quantity || 1,
          price: getItemPrice(item),
          color: item.color || custObj.color || '#6B7280',
          size: item.size || 'M',
          isCustomTemplate: Boolean(item.isCustomTemplate || item.customizationId),
          customization: {
            color: item.color || custObj.color || '#6B7280',
            decalUrl: frontPreview,
            image: frontPreview,
            variant: item.productVariant?.name || custObj.variant || 'Custom Template Design',
            previews: {
              front: frontPreview,
              back: custObj.previews?.back || item.previews?.back || null,
              left: custObj.previews?.left || custObj.previews?.leftSleeve || item.previews?.left || item.previews?.leftSleeve || null,
              right: custObj.previews?.right || custObj.previews?.rightSleeve || item.previews?.right || item.previews?.rightSleeve || null,
            }
          },
          image: frontPreview
        };
      });

      const shippingAddress = {
        name: formData.firstName,
        street: formData.apartment ? `${formData.streetAddress}, ${formData.apartment}` : formData.streetAddress,
        city: formData.townCity,
        state: formData.state,
        zipCode: formData.postalCode,
        phone: formData.phone,
        country: 'India'
      };
      const billingAddress = { ...shippingAddress };

      try {
        const payRes = await api.post('/payments/create-order', {
          amount: grandTotal,
          couponCode: appliedCoupon?.code || null
        });

        const payData = payRes.data?.data || payRes.data || {};
        const razorpayKey = (payData.key || import.meta.env.VITE_RAZORPAY_KEY_ID || '').trim();

        const loadScript = () => {
          return new Promise((resolve) => {
            if (window.Razorpay) { resolve(true); return; }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const isLoaded = await loadScript();
        if (!isLoaded) {
          toast.error('Razorpay SDK failed to load.');
          setIsProcessing(false);
          return;
        }

        const options = {
          key: razorpayKey,
          amount: payData.amount,
          currency: payData.currency || 'INR',
          name: 'MOJILO Store',
          description: 'Payment for Checkout',
          order_id: payData.orderId,
          prefill: {
            name: formData.firstName,
            contact: formData.phone
          },
          theme: {
            color: '#A47A46'
          },
          handler: async function (response) {
            try {
              const verifyRes = await api.post('/payments/verify-signature', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                shippingAddress,
                billingAddress,
                couponCode: appliedCoupon?.code || null
              });

              const resData = verifyRes.data?.data || verifyRes.data || {};
              const orderObj = resData.order || resData;
              const orderRef = orderObj.orderNumber || orderObj._id || 'MOJ-ORDER';

              toast.success('Online payment successful!');
              setPlacedOrderInfo({
                orderNumber: orderRef,
                itemsCount: cart.length,
                totalAmount: grandTotal
              });

              if (clearCart) clearCart();
              if (setCart) setCart([]);

              setModalMessage(
                `Payment verified & order placed successfully! Order Reference ID: ${orderRef}`
              );
              setShowSuccessModal(true);
            } catch (vErr) {
              toast.error(vErr.response?.data?.message || 'Payment verification failed.');
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              toast.error('Payment cancelled. Your order was not placed.');
              setIsProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch (payErr) {
        console.error('Razorpay Order Creation Error:', payErr);
        toast.error(payErr.response?.data?.message || 'Failed to initialize online payment.');
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.error('Checkout Error:', err);
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans text-slate-800 antialiased">
      <CheckoutAnimationStyles />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">

        {/* Breadcrumb */}
        <nav className="co-fade-up flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-8 sm:mb-10 border-b border-slate-100 pb-4 sm:pb-5">
          {[
            { label: 'My Account', path: '/my-profile' },
            { label: 'Products', path: '/collection' },
            { label: 'View Cart', path: '/my-cart' },
          ].map(({ label, path }) => (
            <React.Fragment key={path}>
              <span onClick={() => navigate(path)} className="hover:text-slate-700 cursor-pointer transition-colors duration-200">{label}</span>
              <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
            </React.Fragment>
          ))}
          <span className="text-slate-900">Checkout</span>
        </nav>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 lg:gap-10 items-start">

          {/* ── LEFT: Billing details ─────────────────────────────────── */}
          <div
            className="co-fade-up bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm space-y-5 transition-shadow duration-300 hover:shadow-md"
            style={{ animationDelay: '60ms' }}
          >
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Billing & Shipping Details</h2>

            {/* ── Saved Address Suggestions ────────────────────────────────────── */}
            {savedAddresses.length > 0 && (
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#a47a4c]" />
                    <span>Saved Delivery Addresses</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Click to auto-fill details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr, idx) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <div
                        key={addr._id}
                        onClick={() => selectAddress(addr)}
                        className={`co-fade-up p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer relative flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98] ${
                          isSelected
                            ? 'border-[#a47a4c] bg-amber-50/40 shadow-xs'
                            : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                        }`}
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-slate-900">{addr.name}</span>
                            {addr.isDefaultShipping && (
                              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#a47a4c] text-white">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 font-medium line-clamp-1">{addr.street}</p>
                          <p className="text-[11px] text-slate-500">{addr.city}, {addr.state} - {addr.zipCode}</p>
                          <p className="text-[11px] text-slate-700 font-bold mt-1 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {addr.phone}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="co-pop-in mt-2 text-[11px] font-bold text-[#a47a4c] flex items-center gap-1">
                            <CheckCircle size={12} /> Selected
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className={`${inputClass} ${fieldErrors.firstName ? 'border-rose-300 focus:border-rose-400 co-shake' : ''}`}
              />
              {fieldErrors.firstName && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium co-slide-fade-in">Name is required.</p>
              )}
            </div>



            <div className="space-y-2.5">
              <label className={labelClass}>
                Street Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="streetAddress"
                placeholder="House number and street name"
                value={formData.streetAddress}
                onChange={handleInputChange}
                required
                className={`${inputClass} ${fieldErrors.streetAddress ? 'border-rose-300 focus:border-rose-400 co-shake' : ''}`}
              />
              {fieldErrors.streetAddress && (
                <p className="text-xs text-rose-500 font-medium co-slide-fade-in">Street address is required.</p>
              )}
              <input
                type="text"
                name="apartment"
                placeholder="Apartment, suite, unit, etc. (optional)"
                value={formData.apartment}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Town / City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="townCity"
                value={formData.townCity}
                onChange={handleInputChange}
                required
                className={`${inputClass} ${fieldErrors.townCity ? 'border-rose-300 focus:border-rose-400 co-shake' : ''}`}
              />
              {fieldErrors.townCity && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium co-slide-fade-in">Town / City is required.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Postal Code <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                  className={`${inputClass} ${fieldErrors.postalCode ? 'border-rose-300 focus:border-rose-400 co-shake' : ''}`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass}>
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                {formData.phone ? (
                  <span className={`text-[11px] font-bold flex items-center gap-1 ${
                    isValidPhone(formData.phone) ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {isValidPhone(formData.phone) ? (
                      <>✓ Valid 10-digit mobile</>
                    ) : (
                      <>{formData.phone.length}/10 digits</>
                    )}
                  </span>
                ) : null}
              </div>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 text-xs font-bold border-r border-slate-200 pr-2.5 pointer-events-none select-none">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  name="phone"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => {
                    const cleanValue = sanitizePhoneInput(e.target.value);
                    setFormData(prev => ({ ...prev, phone: cleanValue }));
                    if (cleanValue.length === 10 && isValidPhone(cleanValue)) {
                      setFieldErrors(prev => ({ ...prev, phone: false }));
                    } else if (cleanValue.length > 0 && cleanValue.length < 10) {
                      setFieldErrors(prev => ({ ...prev, phone: true }));
                    } else {
                      setFieldErrors(prev => ({ ...prev, phone: false }));
                    }
                  }}
                  onBlur={() => {
                    if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
                      setFieldErrors(prev => ({ ...prev, phone: true }));
                    }
                  }}
                  required
                  className={`${inputClass} pl-16 ${
                    fieldErrors.phone
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 co-shake'
                      : isValidPhone(formData.phone)
                      ? 'border-emerald-300 focus:border-emerald-400'
                      : ''
                  }`}
                />
              </div>

              {fieldErrors.phone && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium co-slide-fade-in flex items-center gap-1">
                  <span>⚠️</span>
                  <span>
                    {!formData.phone.trim()
                      ? 'Phone number is required to confirm your order.'
                      : formData.phone.length < 10
                      ? `Mobile number must be 10 digits (${formData.phone.length}/10 entered).`
                      : 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.'}
                  </span>
                </p>
              )}
            </div>

            <div className="lg:hidden pt-2">
              <PlaceOrderBtn isProcessing={isProcessing} disabled={!cart || cart.length === 0} />
            </div>
          </div>

          {/* ── RIGHT: Order summary ──────────────────────────────────── */}
          <div
            className="co-fade-up bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-sm space-y-5 transition-shadow duration-300 hover:shadow-md"
            style={{ animationDelay: '140ms' }}
          >
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-wide">Order Summary</h3>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto -mx-1 px-1">
              {!cart || cart.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">No items in cart.</p>
              ) : (
                cart.map((item, idx) => {
                  if (!item) return null;
                  const uid = item.cartItemId || item.id || item._id || Math.random();
                  const displayTitle = item.product?.name || item.product?.title || item.title || item.name;
                  const displayImage = item.product?.images?.[0]?.url || item.product?.images?.[0] || item.image || item.images?.[0] || 'https://via.placeholder.com/150';
                  const displaySize = item.size || item.selectedSize || item.variant?.size;
                  const displayColor = item.color || item.selectedColor || item.variant?.color;
                  const colorName = typeof displayColor === 'object' ? displayColor?.name : displayColor;
                  const itemPrice = getItemPrice(item);
                  const isCustom = item.customization || item.customizationId || item.previews || item.isCustom;

                  return (
                    <div
                      key={uid}
                      className="co-fade-up flex items-center gap-3 sm:gap-4 py-3.5 first:pt-0 last:pb-0 transition-colors duration-200 hover:bg-slate-50/60 rounded-xl px-1 -mx-1"
                      style={{ animationDelay: `${idx * 70}ms` }}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center relative transition-transform duration-300 hover:scale-105">
                        {isCustom ? (
                          <CartItem3DViewer item={item} />
                        ) : (
                          <img
                            src={displayImage}
                            alt={displayTitle}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800 truncate">{displayTitle}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-xs text-slate-400">Qty: {item.quantity || 1}</span>
                          {displaySize && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200/40 font-bold px-1.5 py-0.5 rounded uppercase">
                              {displaySize}
                            </span>
                          )}
                          {colorName && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200/40 font-bold px-1.5 py-0.5 rounded capitalize">
                              {colorName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-sm font-bold text-slate-900 whitespace-nowrap flex-shrink-0">
                        ₹{(itemPrice * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── COUPON CODE & SUGGESTED COUPONS ──────────────── */}
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 space-y-3 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#a47a4c]" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Coupon Code</h4>
                </div>
                {appliedCoupon && (
                  <span className="co-pop-in text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">
                    Applied
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    setCouponStatus(null);
                  }}
                  className={`flex-1 bg-white border rounded-xl px-3.5 py-2 text-xs font-semibold uppercase tracking-wider focus:outline-none transition-all duration-200
                    ${couponStatus === 'error' ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 co-shake' :
                      couponStatus === 'success' ? 'border-emerald-300 focus:border-emerald-400' :
                      'border-slate-200 focus:border-[#a47a4c] focus:ring-3 focus:ring-[#a47a4c]/10'}`}
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponInput('');
                      setCouponStatus(null);
                      setCouponMessage('');
                    }}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs px-3.5 py-2 rounded-xl transition-all duration-200 shrink-0 cursor-pointer active:scale-95"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(couponInput)}
                    className="bg-[#a47a4c] hover:bg-[#8e673e] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all duration-200 shadow-xs shrink-0 cursor-pointer active:scale-95 hover:shadow-md"
                  >
                    Apply
                  </button>
                )}
              </div>

              {couponMessage && (
                <p className={`text-xs font-semibold ${couponStatus === 'error' ? 'co-shake' : 'co-slide-fade-in'} ${couponStatus === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {couponStatus === 'success' ? '✓ ' : '✗ '}{couponMessage}
                </p>
              )}

              {/* Available Coupons Suggestions */}
              {availableCoupons.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60">
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Applicable Coupons
                  </p>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {availableCoupons.map((c, idx) => {
                      const isSelected = appliedCoupon?.code === c.code;
                      const isEligible = !c.minOrderAmount || subtotal >= c.minOrderAmount;
                      const discountDesc = c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`;
                      const minSpendText = c.minOrderAmount > 0 ? `Min. order ₹${c.minOrderAmount}` : 'No min. spend';

                      return (
                        <div
                          key={c._id || c.code}
                          className={`co-fade-up p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-2 text-xs
                            ${isSelected
                              ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-200'
                              : isEligible
                              ? 'bg-white border-amber-200/70 hover:border-[#a47a4c] hover:shadow-xs hover:-translate-y-0.5'
                              : 'bg-slate-50/60 border-slate-200 opacity-60'}`}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-900 font-mono bg-amber-100/70 text-[#7a5933] px-1.5 py-0.5 rounded text-[11px]">
                                {c.code}
                              </span>
                              <span className="font-bold text-emerald-600 text-[11px]">{discountDesc}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{minSpendText}</p>
                          </div>

                          {isSelected ? (
                            <span className="co-pop-in text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Applied
                            </span>
                          ) : isEligible ? (
                            <button
                              type="button"
                              onClick={() => handleApplyCoupon(c.code)}
                              className="bg-[#a47a4c]/10 hover:bg-[#a47a4c] text-[#a47a4c] hover:text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition-all duration-200 shrink-0 cursor-pointer active:scale-95"
                            >
                              Apply
                            </button>
                          ) : (
                            <span className="text-[10px] font-medium text-amber-700/70 italic">
                              Add ₹{(c.minOrderAmount - subtotal).toFixed(0)} more
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3 text-sm font-medium">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="text-slate-900 font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="co-slide-fade-in flex justify-between text-emerald-600 bg-emerald-50/60 px-3 py-2 rounded-xl border border-emerald-100/50">
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Coupon ({appliedCoupon?.code})
                  </span>
                  <span className="font-bold">−₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-500">
                <span>Shipping</span>
                {isFreeShipping ? (
                  <span className="text-emerald-600 text-[10px] bg-emerald-50 border border-emerald-200 font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md">Free</span>
                ) : (
                  <span className="text-slate-900 font-bold">₹{shippingCharge.toFixed(2)}</span>
                )}
              </div>
              {!isFreeShipping && freeThreshold > 0 && (
                <p className="text-[11px] text-amber-800 bg-amber-50/80 px-3 py-1.5 rounded-xl font-medium border border-amber-200/60">
                  💡 Add ₹{(freeThreshold - subtotal).toFixed(2)} more to qualify for <span className="font-bold">FREE Shipping</span>!
                </p>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-base font-bold text-slate-900">
                <span>Total</span>
                <span key={`total-${grandTotal}`} className="co-price-flash text-xl font-black tracking-tight text-[#a47a4c] px-1">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {[
                {
                  value: 'bank',
                  label: 'Online Payment',
                  badges: [
                    { text: 'VISA', bg: 'bg-blue-600' },
                    { text: 'MC', bg: 'bg-red-500' },
                    { text: 'UPI / NetBanking', bg: 'bg-emerald-600' }
                  ],
                },
              ].map(({ value, label, badges }) => (
                <label
                  key={value}
                  className="flex items-center justify-between border p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 border-[#a47a4c] bg-amber-50/30 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value={value}
                      checked={true}
                      readOnly
                      className="accent-[#a47a4c] w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-slate-800">{label}</span>
                    <CheckCircle size={14} className="co-pop-in text-[#a47a4c]" />
                  </div>
                  {badges.length > 0 && (
                    <div className="flex gap-1">
                      {badges.map(b => (
                        <span key={b.text} className={`text-[9px] ${b.bg} text-white px-1.5 py-0.5 rounded font-black tracking-tight`}>
                          {b.text}
                        </span>
                      ))}
                    </div>
                  )}
                </label>
              ))}
            </div>

            <div className="hidden lg:block">
              <PlaceOrderBtn isProcessing={isProcessing} disabled={!cart || cart.length === 0} />
            </div>
          </div>

        </form>
      </div>

      {/* ── Success modal component ───────────────────────────────────────── */}
      <OrderPlacedPopup
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/my-profile');
        }}
        orderNumber={placedOrderInfo.orderNumber || 'MOJ-ORDER'}
        itemsCount={placedOrderInfo.itemsCount || 1}
        totalAmount={placedOrderInfo.totalAmount || grandTotal}
        currentStep={0}
        onTrackOrder={() => {
          setShowSuccessModal(false);
          navigate('/my-profile');
        }}
        onContinueShopping={() => {
          setShowSuccessModal(false);
          navigate('/collection');
        }}
      />
    </div>
  );
};

const PlaceOrderBtn = ({ isProcessing, disabled }) => (
  <button
    type="submit"
    disabled={disabled || isProcessing}
    className={`w-full text-white font-bold text-sm py-4 rounded-xl transition-all duration-200 shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2
      ${disabled || isProcessing
        ? 'bg-slate-300 cursor-not-allowed'
        : 'bg-[#a47a4c] hover:bg-[#8e673e] hover:shadow-lg hover:-translate-y-0.5'}`}
  >
    {isProcessing ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Processing…
      </>
    ) : (
      'Place Order'
    )}
  </button>
);

export default Checkout;