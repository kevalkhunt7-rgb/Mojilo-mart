import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { ChevronRight, CheckCircle } from 'lucide-react';
import CartItem3DViewer from '../components/CartItem3DViewer';
import OrderPlacedPopup from '../components/SuccessModel';
import api from '../lib/axios';

const inputClass =
  'w-full bg-slate-50/60 border border-slate-200 focus:bg-white rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-[#a47a4c] focus:ring-4 focus:ring-[#a47a4c]/5 transition-all placeholder-slate-300';

const labelClass = 'block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2';

const getItemPrice = (item) => {
  if (!item) return 0;

  // 1. Custom template items carry their total calculated unit price in item.price or totalItemPrice
  if (item.isCustomTemplate || item.customizationId || item.customization) {
    if (typeof item.price === 'number' && !isNaN(item.price) && item.price > 0) {
      return item.price;
    }
    if (typeof item.totalItemPrice === 'number' && !isNaN(item.totalItemPrice) && item.totalItemPrice > 0) {
      return item.totalItemPrice / (item.quantity || 1);
    }
  }

  // 2. Direct unit price on cart item
  if (typeof item.price === 'number' && !isNaN(item.price) && item.price > 0) {
    return item.price;
  }

  // 3. Standard database product pricing
  const prod = item.product;
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
  const { cart, setCart, appliedCoupon, removeCoupon, clearCart } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addOrder } = useOrders();

  const [formData, setFormData] = useState({
    firstName: '',
    companyName: '',
    streetAddress: '',
    apartment: '',
    townCity: '',
    state: 'Karnataka',
    postalCode: '560001',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState({ orderNumber: '', itemsCount: 0, totalAmount: 0 });
  const [modalMessage, setModalMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: false }));
  };

  const subtotal = (cart || []).reduce((acc, item) => {
    return acc + getItemPrice(item) * (item?.quantity || 1);
  }, 0);

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);

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
    if (!formData.phone.trim()) errors.phone = true;
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
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

      const orderPayload = {
        items: mappedItems,
        paymentMethod: paymentMethod === 'bank' ? 'Online' : 'COD',
        couponCode: appliedCoupon?.code || null,
        shippingAddress: {
          name: formData.firstName,
          street: formData.apartment ? `${formData.streetAddress}, ${formData.apartment}` : formData.streetAddress,
          city: formData.townCity,
          state: formData.state,
          zipCode: formData.postalCode,
          phone: formData.phone,
          country: 'India'
        },
        billingAddress: {
          name: formData.firstName,
          street: formData.apartment ? `${formData.streetAddress}, ${formData.apartment}` : formData.streetAddress,
          city: formData.townCity,
          state: formData.state,
          zipCode: formData.postalCode,
          phone: formData.phone,
          country: 'India'
        }
      };

      const res = await addOrder(orderPayload);

      // Safe extraction of returned order object (addOrder returns { order: {...}, invoiceNumber: ... })
      const orderObj = res?.order || res?.data?.order || (res?._id ? res : (res?.data?.[0] || res?.data || res || {}));
      const targetOrderId = orderObj?._id || orderObj?.id;
      const orderRef = orderObj?.orderNumber || targetOrderId || 'N/A';

      if (!targetOrderId) {
        throw new Error('Order creation failed: missing order ID');
      }

      if (paymentMethod === 'bank') {
        try {
          const payRes = await api.post('/payments/create-order', {
            orderId: targetOrderId,
            amount: grandTotal
          });

          const payData = payRes.data?.data || payRes.data || {};
          const razorpayKey = payData.key || import.meta.env.VITE_RAZORPAY_KEY_ID ;

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
            if (clearCart) clearCart();
            navigate('/my-profile');
            return;
          }

          const options = {
            key: razorpayKey,
            amount: payData.amount,
            currency: payData.currency || 'INR',
            name: 'MOJILO Store',
            description: `Payment for Order #${orderRef}`,
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
                await api.post('/payments/verify-signature', {
                  orderId: targetOrderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                });

                toast.success('Online payment successful!');
                setPlacedOrderInfo({
                  orderNumber: orderRef,
                  itemsCount: mappedItems.length,
                  totalAmount: grandTotal
                });
                if (clearCart) clearCart();
                setModalMessage(
                  `Payment verified & order placed successfully! Order Reference ID: ${orderRef}`
                );
                setShowSuccessModal(true);
              } catch (vErr) {
                toast.error(vErr.response?.data?.message || 'Payment verification failed.');
              }
            },
            modal: {
              ondismiss: function () {
                toast.error('Payment cancelled. Your order remains pending in Order History.');
                if (clearCart) clearCart();
                navigate('/my-profile');
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        } catch (payErr) {
          console.error('Razorpay Order Creation Error:', payErr);
          toast.error(payErr.response?.data?.message || 'Failed to initialize online payment.');
          if (clearCart) clearCart();
          navigate('/my-profile');
          return;
        }
      }

      setModalMessage(
        `Your order has been placed successfully! Order Reference ID: ${orderRef}`
      );
      setPlacedOrderInfo({
        orderNumber: orderRef,
        itemsCount: mappedItems.length,
        totalAmount: grandTotal
      });
      
      if (clearCart) clearCart();
      setShowSuccessModal(true);
      if (setCart) setCart([]);
    } catch (err) {
      console.error('Checkout Error:', err);
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans text-slate-800 antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">

        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-8 sm:mb-10 border-b border-slate-100 pb-4 sm:pb-5">
          {[
            { label: 'My Account', path: '/my-profile' },
            { label: 'Products', path: '/collection' },
            { label: 'View Cart', path: '/my-cart' },
          ].map(({ label, path }) => (
            <React.Fragment key={path}>
              <span onClick={() => navigate(path)} className="hover:text-slate-700 cursor-pointer transition-colors">{label}</span>
              <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
            </React.Fragment>
          ))}
          <span className="text-slate-900">Checkout</span>
        </nav>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 lg:gap-10 items-start">

          {/* ── LEFT: Billing details ─────────────────────────────────── */}
          <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm space-y-5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Billing Details</h2>

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
                className={`${inputClass} ${fieldErrors.firstName ? 'border-rose-300 focus:border-rose-400' : ''}`}
              />
              {fieldErrors.firstName && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium">Name is required.</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Company Name <span className="text-slate-300 normal-case tracking-normal font-normal">(optional)</span></label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className={inputClass}
              />
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
                className={`${inputClass} ${fieldErrors.streetAddress ? 'border-rose-300 focus:border-rose-400' : ''}`}
              />
              {fieldErrors.streetAddress && (
                <p className="text-xs text-rose-500 font-medium">Street address is required.</p>
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
                className={`${inputClass} ${fieldErrors.townCity ? 'border-rose-300 focus:border-rose-400' : ''}`}
              />
              {fieldErrors.townCity && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium">Town / City is required.</p>
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
                  className={`${inputClass} ${fieldErrors.postalCode ? 'border-rose-300 focus:border-rose-400' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className={`${inputClass} ${fieldErrors.phone ? 'border-rose-300 focus:border-rose-400' : ''}`}
              />
              {fieldErrors.phone && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium">Phone number is required.</p>
              )}
            </div>

            <div className="lg:hidden pt-2">
              <PlaceOrderBtn isProcessing={isProcessing} disabled={!cart || cart.length === 0} />
            </div>
          </div>

          {/* ── RIGHT: Order summary ──────────────────────────────────── */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-sm space-y-5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-wide">Order Summary</h3>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto -mx-1 px-1">
              {!cart || cart.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">No items in cart.</p>
              ) : (
                cart.map((item) => {
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
                    <div key={uid} className="flex items-center gap-3 sm:gap-4 py-3.5 first:pt-0 last:pb-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
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

            <div className="border-t border-slate-100 pt-4 space-y-3 text-sm font-medium">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="text-slate-900 font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 bg-emerald-50/60 px-3 py-2 rounded-xl border border-emerald-100/50">
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Coupon ({appliedCoupon?.code})
                  </span>
                  <span className="font-bold">−₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="text-emerald-600 text-[10px] bg-emerald-50 font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md">Free</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-base font-bold text-slate-900">
                <span>Total</span>
                <span className="text-xl font-black tracking-tight text-[#a47a4c]">₹{grandTotal.toFixed(2)}</span>
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
                  ],
                },
                { value: 'cod', label: 'Cash on Delivery', badges: [] },
              ].map(({ value, label, badges }) => (
                <label
                  key={value}
                  className={`flex items-center justify-between border p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all
                    ${paymentMethod === value
                      ? 'border-[#a47a4c] bg-amber-50/30'
                      : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={() => setPaymentMethod(value)}
                      className="accent-[#a47a4c] w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-slate-800">{label}</span>
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
    className="w-full bg-[#a47a4c] hover:bg-[#8e673e] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm py-4 rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
  >
    {isProcessing ? 'Processing…' : 'Place Order'}
  </button>
);

export default Checkout;