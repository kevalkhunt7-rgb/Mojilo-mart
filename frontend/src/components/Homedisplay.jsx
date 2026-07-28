import React, { useRef, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, ShoppingCart, Heart, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

// Clean intersection observer hook for cascade animation entries
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function ProductCardSkeleton({ index }) {
  return (
    <div
      className="flex flex-col w-full bg-white rounded-2xl border border-neutral-100 overflow-hidden"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="relative w-full aspect-[4/5] bg-neutral-100 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-2.5 w-16 bg-neutral-100 rounded-full" />
        <div className="h-3.5 w-3/4 bg-neutral-100 rounded-full" />
        <div className="pt-3 border-t border-neutral-100">
          <div className="h-4 w-14 bg-neutral-100 rounded-full" />
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

function ProductCard({ product, index }) {
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [ref, visible] = useReveal();

  const productId = product._id || product.id;
  const isFavorited = isInWishlist(productId);

  const handleNavigate = () => navigate(`/product-details/${productId}`);

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (isFavorited) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuickAdd = async (e) => {
    e.stopPropagation();
    try {
      const defaultColor = product.colors?.[0]
        ? (typeof product.colors[0] === 'object' ? product.colors[0].id : product.colors[0])
        : 'black';
      const defaultSize = product.sizes?.[0] || 'S';

      let selectedVariantId = null;
      if (product.variants && product.variants.length > 0) {
        const found = product.variants.find(v => v.size === defaultSize && v.color === defaultColor);
        selectedVariantId = found?._id;
      }

      await addToCart(productId, selectedVariantId, 1, null);
      toast.success(`${product.name || product.title} added to cart!`);
    } catch (err) {
      toast.error(err.message || 'Failed to add item to cart');
    }
  };

  const displayTitle = product.name || product.title;
  const displayImage = product.images?.[0]?.url || product.images?.[0] || 'https://via.placeholder.com/400x500?text=Product';

  return (
    <div
      ref={ref}
      className="flex flex-col group w-full bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-xs hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 transform-gpu"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.06}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.06}s`,
      }}
    >
      {/* Product Image Frame */}
      <div
        onClick={handleNavigate}
        className="relative w-full aspect-[4/5] bg-neutral-50 cursor-pointer overflow-hidden border-b border-neutral-100"
      >
        <img
          src={displayImage}
          alt={displayTitle}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />

        {/* Subtle darkening on hover for text/button legibility */}
        <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/5 transition-colors duration-500" />

        {/* Dynamic Badges */}
        {product.newArrival && (
          <div className="absolute top-3 left-3 z-10 animate-[fadeIn_0.6s_ease]">
            <span className="bg-[#D4A362] text-white text-[9px] font-bold px-2.5 py-1 rounded-md shadow-xs uppercase tracking-widest">
              New
            </span>
          </div>
        )}

        {/* Premium Desktop Action Overlay Bar */}
        <div className="absolute bottom-0 inset-x-0 hidden md:flex items-center justify-center gap-2 p-4 z-10 bg-gradient-to-t from-neutral-900/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={handleQuickAdd}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-neutral-900 text-neutral-900 hover:text-white rounded-xl font-semibold text-xs tracking-wide shadow-lg transition-all active:scale-95"
          >
            <ShoppingCart size={15} /> Add to Cart
          </button>

          <button
            onClick={handleWishlist}
            className={`p-2.5 rounded-xl shadow-lg transition-all active:scale-90 ${isFavorited
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-white hover:bg-neutral-900 text-neutral-700 hover:text-white'
              }`}
          >
            <Heart size={15} className={isFavorited ? 'fill-current' : ''} />
          </button>

          <button
            onClick={handleNavigate}
            className="p-2.5 bg-white hover:bg-neutral-900 text-neutral-700 hover:text-white rounded-xl shadow-lg transition-all active:scale-90"
          >
            <Eye size={15} />
          </button>
        </div>

        {/* Mobile Quick Action Floating Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 md:hidden z-10">
          <button
            onClick={handleWishlist}
            className={`p-2 rounded-full shadow-md backdrop-blur-md transition-colors active:scale-90 ${isFavorited ? 'bg-white text-red-500' : 'bg-white/80 text-neutral-800'
              }`}
          >
            <Heart size={15} className={isFavorited ? 'fill-current' : ''} />
          </button>
          <button
            onClick={handleQuickAdd}
            className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md text-neutral-800 active:scale-90 transition-transform"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>

      {/* Product Meta Details */}
      <div className="p-4 flex flex-col flex-1 bg-white">
        <div className="flex-1 space-y-1">
          {product.category && (
            <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
              {typeof product.category === 'object' ? product.category.name : product.category}
            </p>
          )}
          <h4
            onClick={handleNavigate}
            className="text-sm font-bold text-neutral-800 tracking-wide cursor-pointer hover:text-[#D4A362] transition-colors line-clamp-1"
          >
            {displayTitle}
          </h4>
        </div>

        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <p className="text-base font-black text-neutral-900">
            {product.currency || '₹'}{product.salePrice && Number(product.salePrice) > 0 ? product.salePrice : (product.price || product.basePrice)}
          </p>
          <span className="text-[11px] font-semibold text-[#D4A362] opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline-flex items-center gap-1">
            View Details <Eye size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HomeDisplay() {
  const [headerRef, headerVisible] = useReveal();
  const [sloganRef, sloganVisible] = useReveal();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        const rawData = res.data?.data;
        const items = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.products)
          ? rawData.products
          : Array.isArray(res.data?.products)
          ? res.data.products
          : [];
        setProducts(items.slice(0, 8));
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="w-full bg-white py-20 px-4 sm:px-6 lg:px-12 xl:px-24">

      {/* Redesigned Minimal & Premium Section Header */}
      {/* Redesigned Minimal & Premium Section Header */}
      <div
        className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-100 pb-8 mb-10 gap-4"
        style={{
          opacity: 1,
          transform: 'none'
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-8 bg-[#D4A362] rounded-full inline-block" />
            <p className="text-[11px] sm:text-xs text-neutral-400 font-bold uppercase tracking-[0.25em]">
              Premium Wardrobe Showcase
            </p>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-neutral-900 uppercase tracking-tight leading-none">
            Featured Masterpieces
          </h2>
        </div>

        <p className="text-sm sm:text-base text-neutral-800 max-w-sm font-light leading-relaxed">
          Discover highly structural, premium custom prints crafted flawlessly with relentless industrial precision.
        </p>
      </div>

      {/* Animated "Featured Products" slogan, sits right before the grid */}
      <div
        ref={sloganRef}
        className="max-w-[1600px] mx-auto flex items-center gap-3 mb-8"
        style={{
          opacity: sloganVisible ? 1 : 0,
          transform: sloganVisible ? 'translateX(0)' : 'translateX(-20px)',
          transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s'
        }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A362] opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4A362]" />
        </span>
        <h3 className="flex items-center gap-2 text-lg md:text-xl font-extrabold text-neutral-900 tracking-wide">
          Featured Products
          <Sparkles size={16} className="text-[#D4A362] animate-pulse" />
        </h3>
        <span className="flex-1 h-px bg-gradient-to-r from-neutral-200 to-transparent" />
      </div>

      {/* Grid Container */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-10">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} index={i} />)
          : products.map((product, index) => (
            <ProductCard key={product._id || product.id} product={product} index={index} />
          ))}
      </div>

      {!loading && products.length === 0 && (
        <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-neutral-400 font-medium tracking-wide">No products to show right now.</p>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}