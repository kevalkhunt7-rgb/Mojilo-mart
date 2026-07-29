import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import api from '../lib/axios';

/* ── Animations ───────────────────────────────────────────────────────────── */
const styles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
  }

  .anim-fadeUp  { animation: fadeUp  0.45s cubic-bezier(.22,.68,0,1.1) both; }
  .anim-fadeIn  { animation: fadeIn  0.35s ease both; }
  .anim-scaleIn { animation: scaleIn 0.4s  cubic-bezier(.22,.68,0,1.1) both; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; }
  }
`;

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [modalTarget, setModalTarget]   = useState({ type: null, id: null });

  const [databaseProducts, setDatabaseProducts] = useState([]);

  useEffect(() => {
    const fetchDbProducts = async () => {
      try {
        const response = await api.get('/products');
        const rawData = response.data?.data;
        const items = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.products)
          ? rawData.products
          : Array.isArray(response.data?.products)
          ? response.data.products
          : [];
        setDatabaseProducts(items);
      } catch (err) {
        console.error('Failed to fetch products for Wishlist page:', err);
        setDatabaseProducts([]);
      }
    };
    fetchDbProducts();
  }, []);

  const wishlistIds = new Set(wishlist.map(w => String(w._id || w.id)));
  const availableDbProducts = databaseProducts.filter(p => !wishlistIds.has(String(p._id || p.id)));
  const justForYouProducts = (availableDbProducts.length > 0 ? availableDbProducts : databaseProducts).slice(0, 4);

  const handleRequestRemoveItem = (id) => {
    setModalTarget({ type: 'SINGLE_REMOVE', id });
    setIsModalOpen(true);
  };

  const handleMoveAllToBag = async () => {
    if (!wishlist.length) return;
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    try {
      for (const product of wishlist) {
        const defaultSize    = product.sizes?.[0] || 'S';
        const defaultColorObj = product.colors?.[0] || 'olive';
        const colorObj = typeof defaultColorObj === 'object'
          ? defaultColorObj
          : { id: defaultColorObj, name: defaultColorObj };
        const colorId    = typeof colorObj === 'object' ? colorObj.id : colorObj;
        const cartItemId = `${product.id}-${colorId}-${defaultSize}`;
        await addToCart({ ...product, cartItemId, selectedSize: defaultSize, selectedColor: colorObj }, 1);
      }
      clearWishlist();
    } catch (err) {
      toast.error(err.message || 'Failed to add items to cart');
    }
  };

  const handleAddToCartSingle = async (product) => {
    try {
      await addToCart(product, 1);
    } catch (err) {
      toast.error(err.message || 'Failed to add item to cart');
    }
  };

  const handleConfirmAction = () => {
    if (modalTarget.type === 'SINGLE_REMOVE' && modalTarget.id) {
      removeFromWishlist(modalTarget.id);
    }
    setModalTarget({ type: null, id: null });
  };

  return (
    <>
      <style>{styles}</style>

      <div className="min-h-screen bg-white text-black font-sans antialiased">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">

          {/* ── WISHLIST SECTION ────────────────────────────────────────── */}
          <section className="mb-14 sm:mb-20">

            {/* Section header */}
            <div className="anim-fadeUp flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <span className="w-4 sm:w-5 h-8 sm:h-9 bg-[#8b5a2b] rounded-sm block flex-shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold tracking-wide text-black flex items-center gap-2">
                  <Heart size={16} className="text-[#8b5a2b]" />
                  Wishlist
                  <span className="text-sm font-normal text-gray-400">({wishlist.length})</span>
                </h2>
              </div>

              {wishlist.length > 0 && (
                <button
                  onClick={handleMoveAllToBag}
                  className="flex items-center gap-2 border border-gray-300 hover:border-black hover:bg-black hover:text-white text-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded transition-all duration-200 font-medium text-black cursor-pointer"
                >
                  <ShoppingBag size={14} />
                  <span>Move All to Bag</span>
                </button>
              )}
            </div>

            {/* Empty state */}
            {wishlist.length === 0 ? (
              <div className="anim-scaleIn flex flex-col items-center justify-center text-center py-16 sm:py-24 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 px-4">
                <Heart size={48} className="text-gray-200 mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Browse the shop and tap the heart icon on items you love.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                {wishlist.map((item, i) => (
                  <div
                    key={item.id}
                    className="anim-fadeUp"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <ProductCard
                      product={item}
                      isWishlistItem={true}
                      onRemove={handleRequestRemoveItem}
                      onAddToCart={handleAddToCartSingle}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── JUST FOR YOU SECTION ────────────────────────────────────── */}
          <section>

            {/* Section header */}
            <div className="anim-fadeUp flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <span className="w-4 sm:w-5 h-8 sm:h-9 bg-[#8b5a2b] rounded-sm block flex-shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold tracking-wide text-black flex items-center gap-2">
                  <Sparkles size={15} className="text-[#8b5a2b]" />
                  Just For You
                </h2>
              </div>
              <button 
                onClick={() => navigate('/collection')}
                className="border border-gray-300 hover:border-black hover:bg-black hover:text-white text-sm px-5 sm:px-8 py-2.5 sm:py-3 rounded transition-all duration-200 font-medium text-black cursor-pointer"
              >
                See All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {justForYouProducts.map((item, i) => {
                const adaptedProduct = {
                  ...item,
                  id: item._id || item.id,
                  title: item.name || item.title,
                  image: item.image || (item.images && (item.images[0]?.url || item.images[0])),
                  price: (item.salePrice && Number(item.salePrice) > 0) ? Number(item.salePrice) : (item.price || item.basePrice || 0),
                  originalPrice: (item.salePrice && Number(item.salePrice) > 0 && item.basePrice && Number(item.basePrice) > Number(item.salePrice)) ? Number(item.basePrice) : null
                };

                return (
                  <div
                    key={item._id || item.id}
                    className="anim-fadeUp"
                    style={{ animationDelay: `${0.1 + i * 0.06}s` }}
                  >
                    <ProductCard
                      product={adaptedProduct}
                      isWishlistItem={false}
                      onAddToCart={handleAddToCartSingle}
                    />
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAction}
        title="Remove this item from your wishlist?"
        confirmText="Yes, Remove"
        cancelText="Keep Item"
      />
    </>
  );
};

export default WishlistPage;