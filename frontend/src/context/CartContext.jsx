import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../lib/axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Applied Coupon persistent state across route changes
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = sessionStorage.getItem('mojilo_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const saveAppliedCoupon = (couponData) => {
    setAppliedCoupon(couponData);
    if (couponData) {
      sessionStorage.setItem('mojilo_applied_coupon', JSON.stringify(couponData));
    } else {
      sessionStorage.removeItem('mojilo_applied_coupon');
    }
  };

  const removeCoupon = () => {
    saveAppliedCoupon(null);
  };

  const clearCart = () => {
    setCart([]);
    setCartCount(0);
    setTotalAmount(0);
    saveAppliedCoupon(null);
  };

  const applyCoupon = async (code, currentSubtotal) => {
    if (!code || !code.trim()) {
      throw new Error('Please enter a coupon code.');
    }
    const cleanCode = code.trim().toUpperCase();
    const amountToValidate = currentSubtotal ?? totalAmount;

    try {
      const response = await api.post('/coupons/validate', {
        code: cleanCode,
        amount: amountToValidate,
        orderSubtotal: amountToValidate
      });

      const resData = response.data?.data || response.data;
      const disc = Number(resData?.discountAmount ?? resData?.discount ?? 0);

      if (response.data && response.data.success && disc > 0) {
        const couponObj = {
          code: cleanCode,
          discountAmount: disc,
          couponId: resData.couponId
        };
        saveAppliedCoupon(couponObj);
        return { success: true, discountAmount: disc, message: `Coupon applied successfully! Saving ₹${disc}` };
      } else {
        throw new Error(response.data?.message || 'Invalid coupon code or not applicable.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to apply coupon.';
      throw new Error(msg);
    }
  };

  // Initialize or fetch guest sessionId
  useEffect(() => {
    const sessionId = localStorage.getItem('mojilo_sessionId');
    if (!sessionId && !isAuthenticated) {
      const newSessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('mojilo_sessionId', newSessionId);
    }
  }, [isAuthenticated]);

  // Merge standard cart items and custom template cart items into one unified list
  const mergeCartData = (stdCart, customCartData) => {
    const stdItems = (stdCart?.items || []).map(item => ({
      ...item,
      isCustomTemplate: false
    }));

    const customItems = (customCartData?.items || []).map(item => {
      // Safely extract previews and design images
      const custObj = item.customizationId || item.customization || {};
      const previews = custObj.previews || item.previews || {};
      
      let frontPreview = 
        previews.front || 
        custObj.previewUrl || 
        custObj.decalUrl || 
        custObj.designUrl || 
        custObj.image;

      if (!frontPreview || typeof frontPreview !== 'string' || (!frontPreview.startsWith('data:image/') && !frontPreview.startsWith('http://') && !frontPreview.startsWith('https://') && !frontPreview.startsWith('/'))) {
        const bgCanvas = document.createElement("canvas");
        bgCanvas.width = 600;
        bgCanvas.height = 800;
        const ctx = bgCanvas.getContext("2d");
        ctx.fillStyle = item.color || custObj.selectedColor || custObj.color || "#FFFFFF";
        ctx.fillRect(0, 0, 600, 800);
        frontPreview = bgCanvas.toDataURL("image/png");
      }

      return {
        ...item,
        isCustomTemplate: true,
        price: item.totalItemPrice / (item.quantity || 1),
        
        // 1. Snapshot image for standard 2D cart list & thumbnails
        image: frontPreview,
        
        // 2. Attach normalized product structure
        product: {
          name: custObj.clothingType || item.clothingType || 'Custom Jersey',
          images: [{ url: frontPreview }],
          basePrice: item.virtualBasePrice,
        },

        // 3. ⚠️ CRITICAL FIX: Explicitly preserve customization object & previews for 3D Viewer & Order Checkout
        customization: {
          ...custObj,
          color: item.color || custObj.color || '#3B82F6',
          decalUrl: frontPreview,
          previews: {
            front: frontPreview,
            back: previews.back || null,
            left: previews.left || null,
            right: previews.right || null,
          },
          productType: custObj.clothingType || item.clothingType || 'sports-jersey',
        },

        // Top-level fallbacks
        previews: {
          front: frontPreview,
          back: previews.back || null,
          left: previews.left || null,
          right: previews.right || null,
        },
        size: item.size,
        color: item.color,
      };
    });

    const allItems = [...stdItems, ...customItems];
    const total = (stdCart?.totalAmount || 0) + (customCartData?.totalAmount || 0);
    return { items: allItems, totalAmount: total };
  };

  // Sync state helper
  const updateLocalCartState = (cartData) => {
    if (cartData) {
      setCart(cartData.items || []);
      setTotalAmount(cartData.totalAmount || 0);
      const count = (cartData.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    } else {
      setCart([]);
      setTotalAmount(0);
      setCartCount(0);
    }
  };

  // Hydrate cart from API — fetches both standard & custom carts, merges them
  const fetchCart = async () => {
    setLoading(true);
    try {
      const [stdRes, customRes] = await Promise.allSettled([
        api.get('/cart'),
        api.get('/custom-cart'),
      ]);

      const stdCart = stdRes.status === 'fulfilled' && stdRes.value.data?.success
        ? stdRes.value.data.data
        : null;

      const customCartData = customRes.status === 'fulfilled' && customRes.value.data?.success
        ? customRes.value.data.data
        : null;

      updateLocalCartState(mergeCartData(stdCart, customCartData));
    } catch (error) {
      console.error('Failed to load shopping cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hydrate cart when authentication status changes
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  // Handle guest cart merge on successful login
  useEffect(() => {
    const handleCartMerge = async () => {
      if (isAuthenticated) {
        const sessionId = localStorage.getItem('mojilo_sessionId');
        if (sessionId) {
          try {
            const response = await api.post('/cart/merge', { sessionId });
            if (response.data && response.data.success) {
              localStorage.removeItem('mojilo_sessionId');
              await fetchCart(); // re-fetch both carts
            }
          } catch (error) {
            console.error('Failed to merge guest cart:', error);
          }
        }
      }
    };

    handleCartMerge();
  }, [isAuthenticated]);

  // ── Standard DB Product Cart ──────────────────────────────────────────────

  const addToCart = async (productIdOrObject, variantId = null, quantity = 1, customizationData = null) => {
    let pId = null;
    let vId = null;
    let qty = 1;
    let custData = customizationData;
    let colorVal = null;
    let sizeVal = null;

    if (typeof productIdOrObject === 'object' && productIdOrObject !== null) {
      const itemObj = productIdOrObject;
      pId = itemObj._id || itemObj.id || itemObj.productId;
      vId = itemObj.variantId || (typeof itemObj.variant === 'object' ? itemObj.variant?._id : itemObj.variant) || null;
      qty = typeof variantId === 'number' ? variantId : (itemObj.quantity || 1);
      colorVal = typeof itemObj.selectedColor === 'object' ? (itemObj.selectedColor?.name || itemObj.selectedColor?.id) : (itemObj.selectedColor || itemObj.color || null);
      sizeVal = itemObj.selectedSize || itemObj.size || null;
    } else {
      pId = productIdOrObject;
      vId = typeof variantId === 'string' ? variantId : null;
      qty = typeof quantity === 'number' ? quantity : (typeof variantId === 'number' ? variantId : 1);
    }

    if (!pId) {
      throw new Error('Product ID is required');
    }

    try {
      const payload = {
        productId: String(pId),
        quantity: qty
      };
      if (vId) payload.variantId = String(vId);
      if (colorVal) payload.color = String(colorVal);
      if (sizeVal) payload.size = String(sizeVal);
      if (custData) payload.customizationData = custData;

      const response = await api.post('/cart', payload);
      if (response.data && response.data.success) {
        await fetchCart();
      }
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add item to cart';
      throw new Error(msg);
    }
  };

  // ── Custom Template Cart ──────────────────────────────────────────────────

  const addCustomTemplateToCart = async (customizationId, clothingType, size, color, quantity = 1) => {
    try {
      const response = await api.post('/custom-cart', {
        customizationId,
        clothingType,
        size,
        color,
        quantity,
      });
      if (response.data && response.data.success) {
        await fetchCart();
      }
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add custom template to cart';
      throw new Error(msg);
    }
  };

  // ── Shared helpers (route-aware) ──────────────────────────────────────────

  const updateQuantity = async (cartItemId, newQuantity, isCustomTemplate = false) => {
    try {
      const endpoint = isCustomTemplate ? `/custom-cart/${cartItemId}` : `/cart/${cartItemId}`;
      const response = await api.patch(endpoint, { quantity: newQuantity });
      if (response.data && response.data.success) {
        await fetchCart();
      }
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update quantity';
      throw new Error(msg);
    }
  };

  const removeFromCart = async (cartItemId, isCustomTemplate = false) => {
    try {
      const endpoint = isCustomTemplate ? `/custom-cart/${cartItemId}` : `/cart/${cartItemId}`;
      const response = await api.delete(endpoint);
      if (response.data && response.data.success) {
        await fetchCart();
      }
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to remove item';
      throw new Error(msg);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      totalAmount,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      clearCart,
      addToCart,
      addCustomTemplateToCart,
      updateQuantity,
      removeFromCart,
      fetchCart,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);