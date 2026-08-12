import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Tag, Trash2, ChevronRight } from 'lucide-react';
import api from '../lib/axios';
import CartItem3DViewer from '../components/CartItem3DViewer';

const formatPrice = (val) => {
  const num = Number(val || 0);
  if (isNaN(num)) return '0';
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
};

const getItemPrice = (item) => {
  if (!item) return 0;

  // 1. Direct item unit price stored on cart item (explicit dynamic size price passed during addToCart)
  if (typeof item.price === 'number' && !isNaN(item.price) && item.price > 0) {
    return Math.round(item.price * 100) / 100;
  }

  // 2. Custom template items carry their total calculated unit price in totalItemPrice or product.calculatedPrice
  if (item.isCustomTemplate || item.customizationId || item.customization) {
    if (typeof item.totalItemPrice === 'number' && !isNaN(item.totalItemPrice) && item.totalItemPrice > 0) {
      return Math.round((item.totalItemPrice / (item.quantity || 1)) * 100) / 100;
    }
    if (typeof item.product?.calculatedPrice === 'number' && !isNaN(item.product.calculatedPrice) && item.product.calculatedPrice > 0) {
      return Math.round(item.product.calculatedPrice * 100) / 100;
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

  // 4. Variant price override
  const varPrice = Number(item.variant?.price);
  if (!isNaN(varPrice) && varPrice > 0) return varPrice;

  // 5. Parent product default sale/base price fallbacks
  if (prod && typeof prod === 'object') {
    const sale = Number(prod.salePrice);
    if (!isNaN(sale) && sale > 0) return sale;
    const price = Number(prod.price);
    if (!isNaN(price) && price > 0) return price;
    const base = Number(prod.basePrice);
    if (!isNaN(base) && base > 0) return base;
  }

  return 0;
};

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, fetchCart, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState(appliedCoupon?.code || '');
  const [couponStatus, setCouponStatus] = useState(appliedCoupon ? 'success' : null); // 'success' | 'error' | null
  const [couponMessage, setCouponMessage] = useState(
    appliedCoupon ? `Coupon applied successfully! Saving ₹${appliedCoupon.discountAmount}` : ''
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    if (appliedCoupon) {
      setCouponInput(appliedCoupon.code);
      setCouponStatus('success');
      setCouponMessage(`Coupon applied successfully! Saving ₹${appliedCoupon.discountAmount}`);
    }
  }, [appliedCoupon]);

  const handleQuantityChange = (cartItemId, delta, currentQty, isCustomTemplate = false) => {
    const targetQty = currentQty + delta;
    if (targetQty <= 0) handleRemoveClick(cartItemId, isCustomTemplate);
    else updateQuantity(cartItemId, targetQty, isCustomTemplate);
  };

  const handleRemoveClick = (cartItemId, isCustomTemplate = false) => {
    setSelectedProductId({ id: cartItemId, isCustomTemplate });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProductId) {
      removeFromCart(selectedProductId.id, selectedProductId.isCustomTemplate);
      setSelectedProductId(null);
      setIsModalOpen(false);
    }
  };

  const subtotal = cart.reduce((acc, item) => {
    const itemPrice = getItemPrice(item);
    return acc + itemPrice * (item.quantity || 1);
  }, 0);

  const discount = appliedCoupon?.discountAmount || 0;
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponStatus(null);
    setCouponMessage('');
    if (!couponInput.trim()) return;

    try {
      const res = await applyCoupon(couponInput, subtotal);
      setCouponStatus('success');
      setCouponMessage(res.message);
    } catch (err) {
      setCouponStatus('error');
      setCouponMessage(err.message || 'Failed to apply coupon.');
    }
  };

  /* ── Empty state ─────────────────────────────────────────────────────── */
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/60 font-sans flex flex-col items-center justify-center px-4 py-20 text-center antialiased">
        <div className="bg-white border border-slate-100 rounded-2xl p-10 sm:p-16 shadow-sm max-w-md w-full space-y-5">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-[#a47a4c]" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
          <p className="text-sm text-slate-400">Looks like you haven't added anything yet.</p>
          <button
            onClick={() => navigate('/collection')}
            className="bg-[#a47a4c] hover:bg-[#8e673e] text-white font-semibold text-sm px-8 py-3 rounded-xl transition-all shadow-md w-full cursor-pointer"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  /* ── Main cart ───────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-8 sm:mb-10">
          <span onClick={() => navigate('/')} className="hover:text-slate-700 cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900">Shopping Cart</span>
        </nav>

        <div className="space-y-6">

          {/* ── Table header (md+) ─────────────────────────────────────── */}
          <div className="hidden md:grid grid-cols-[2.5fr_1fr_1fr_1fr] bg-white border border-slate-100 rounded-xl px-6 lg:px-8 py-4 shadow-xs text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <div>Product</div>
            <div>Price</div>
            <div className="text-center">Qty</div>
            <div className="text-right">Subtotal</div>
          </div>

          {/* ── Cart items ─────────────────────────────────────────────── */}
          <div className="space-y-3">
            {cart.map((item) => {
              const uid = item.cartItemId || item.id || item._id;

              // Check if item is a custom 3D apparel template
              const isCustom = item.isCustomTemplate || Boolean(item.customizationId || item.previews);

              // Handle populated database product references vs static properties
              const displayTitle = item.product?.name || item.product?.title || item.title || item.name || item.clothingType;
              const displayImage = item.product?.images?.[0]?.url || item.product?.images?.[0] || item.image || item.images?.[0] || 'https://via.placeholder.com/150';
              const displaySize = item.selectedSize || item.size || item.variant?.size;
              const colorObj = item.selectedColor || item.color || item.variant?.color;
              const displayColorName = typeof colorObj === 'object' ? colorObj?.name : colorObj;
              const itemPrice = getItemPrice(item);
              const originalBasePrice = Number(item.product?.basePrice || item.variant?.basePrice || 0);
              const hasDiscount = originalBasePrice > itemPrice;

              return (
                <div
                  key={uid}
                  className="bg-white border border-slate-100 hover:border-slate-200 rounded-xl shadow-xs hover:shadow-sm transition-all group"
                >
                  {/* Mobile layout */}
                  <div className="flex gap-4 p-4 sm:p-5 md:hidden">
                    {/* Image / 3D Canvas View */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
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

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <h4 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">{displayTitle}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {displaySize && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase border border-slate-200/40">
                            {displaySize}
                          </span>
                        )}
                        {displayColorName && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold capitalize border border-slate-200/40">
                            {displayColorName}
                          </span>
                        )}
                      </div>

                      {/* Price + remove row */}
                      <div className="flex items-center justify-between pt-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">₹{formatPrice(itemPrice)}</span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{formatPrice(originalBasePrice)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveClick(uid, item.isCustomTemplate)}
                          className="text-rose-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Qty + subtotal row */}
                      <div className="flex items-center justify-between pt-1">
                        <QtyControl
                          qty={item.quantity}
                          onDecrease={() => handleQuantityChange(uid, -1, item.quantity, item.isCustomTemplate)}
                          onIncrease={() => handleQuantityChange(uid, +1, item.quantity, item.isCustomTemplate)}
                        />
                        <span className="text-sm font-bold text-slate-900">₹{formatPrice(itemPrice * item.quantity)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-[2.5fr_1fr_1fr_1fr] items-center px-6 lg:px-8 py-5 gap-4">
                    {/* Product */}
                    <div className="flex items-center gap-4">
                      <div className="w-[180px] h-[180px] rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {isCustom ? (
                          <CartItem3DViewer item={item} />
                        ) : (
                          <img src={displayImage} alt={displayTitle} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">{displayTitle}</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {displaySize && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase border border-slate-200/40">
                              Size: {displaySize}
                            </span>
                          )}
                          {displayColorName && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold capitalize border border-slate-200/40">
                              Color: {displayColorName}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveClick(uid, item.isCustomTemplate)}
                          className="text-xs text-rose-400 hover:text-rose-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">₹{formatPrice(itemPrice)}</span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{formatPrice(originalBasePrice)}
                        </span>
                      )}
                    </div>

                    {/* Qty */}
                    <div className="flex justify-center">
                      <QtyControl
                        qty={item.quantity}
                        onDecrease={() => handleQuantityChange(uid, -1, item.quantity, item.isCustomTemplate)}
                        onIncrease={() => handleQuantityChange(uid, +1, item.quantity, item.isCustomTemplate)}
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="text-sm font-bold text-slate-900 text-right">₹{formatPrice(itemPrice * item.quantity)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Action row ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
            <button
              onClick={() => navigate('/collection')}
              className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              ← Return to Shop
            </button>

          </div>

          {/* ── Bottom: Order summary ──────────────────────── */}
          <div className="max-w-xl ml-auto pt-4">

            {/* Order total */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-4 mb-5">
                Order Summary
              </h3>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 bg-emerald-50/60 px-3 py-2.5 rounded-xl border border-emerald-100/50">
                    <span className="text-xs font-bold uppercase tracking-wide">Coupon savings</span>
                    <span className="font-bold">−₹{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold uppercase tracking-widest px-3 py-1 rounded-full">Free</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-lg tracking-tight">₹{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 bg-[#a47a4c] hover:bg-[#8e673e] text-white font-semibold text-sm py-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
              >
                Proceed to Checkout →
              </button>
            </div>

          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove this item?"
        confirmText="Yes, Remove"
        cancelText="Keep Item"
      />
    </div>
  );
};

/* ── Quantity control sub-component ───────────────────────────────────────── */
const QtyControl = ({ qty, onDecrease, onIncrease }) => (
  <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden">
    <button
      type="button"
      onClick={onDecrease}
      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors text-lg leading-none cursor-pointer"
    >
      −
    </button>
    <span className="w-8 text-center text-sm font-bold text-slate-800 tabular-nums select-none">
      {String(qty).padStart(2, '0')}
    </span>
    <button
      type="button"
      onClick={onIncrease}
      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors text-lg leading-none cursor-pointer"
    >
      +
    </button>
  </div>
);

export default CartPage;