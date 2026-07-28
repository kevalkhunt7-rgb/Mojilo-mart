import React, { useState } from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export function ProductCard({ product, isWishlistItem }) {
  const navigate = useNavigate();
  
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isFavorited = isInWishlist(product?.id || product?._id);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    if (typeof img === 'object' && (img.url || img.secure_url)) return img.url || img.secure_url;
    return null;
  };

  // Primary & Secondary Image Resolution
  const rawImages = Array.isArray(product?.images) && product.images.length > 0 ? product.images : [];
  const resolvedImages = rawImages.map(getImageUrl).filter(Boolean);

  const displayImage = resolvedImages[0] || getImageUrl(product?.image) || getImageUrl(product?.imageUrl) || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600';
  const hoverImage = resolvedImages.length > 1 ? resolvedImages[1] : displayImage;

  const displayTitle = product?.title || product?.name || 'Untitled Product';

  // Format brand safely - ignore MongoDB ObjectIDs or raw hashes
  const rawBrand = product?.brand?.name || (typeof product?.brand === 'string' ? product.brand : '');
  const isBrandValid = rawBrand && rawBrand.length <= 20 && !/^[0-9a-fA-F]{24}$/.test(rawBrand);
  const displayBrand = isBrandValid ? rawBrand : 'MOJILO';

  const getPriceDisplay = () => {
    const basePriceNum = Number(product?.basePrice);
    const salePriceNum = Number(product?.salePrice);
    const priceNum = Number(product?.price);

    let currentPriceVal = null;
    let basePriceVal = null;

    if (!isNaN(salePriceNum) && salePriceNum > 0 && !isNaN(basePriceNum) && basePriceNum > salePriceNum) {
      currentPriceVal = salePriceNum;
      basePriceVal = basePriceNum;
    } else if (!isNaN(priceNum) && priceNum > 0 && !isNaN(basePriceNum) && basePriceNum > priceNum) {
      currentPriceVal = priceNum;
      basePriceVal = basePriceNum;
    } else {
      currentPriceVal = !isNaN(priceNum) && priceNum > 0 ? priceNum : (!isNaN(basePriceNum) && basePriceNum > 0 ? basePriceNum : null);
    }

    const formatVal = (val) => {
      if (val === null || val === undefined || isNaN(val)) return null;
      return `₹ ${typeof val === 'number' ? val.toFixed(2) : val}`;
    };

    return {
      currentPrice: formatVal(currentPriceVal) || (typeof product?.price === 'string' ? product.price : '₹ 0.00'),
      basePriceCut: basePriceVal ? formatVal(basePriceVal) : null,
    };
  };

  const { currentPrice, basePriceCut } = getPriceDisplay();

  const handleNavigateToDetails = () => {
    navigate(`/product-details/${product.id || product._id}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    const id = product.id || product._id;
    if (isWishlistItem || isFavorited) {
      removeFromWishlist(id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    const targetProductId = product._id || product.id;
    if (!targetProductId) {
      toast.error('Product ID missing');
      return;
    }

    const defaultColorObj = product.colors && product.colors.length > 0 
      ? (typeof product.colors[0] === 'object' ? product.colors[0] : { id: product.colors[0], name: product.colors[0] })
      : '';
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : '';
    
    try {
      await addToCart({
        _id: targetProductId,
        selectedColor: defaultColorObj,
        selectedSize: defaultSize
      }, 1);

      toast.success(`"${displayTitle}" added to cart!`);
    } catch (err) {
      toast.error(err.message || 'Failed to add item to cart');
    }
  };

  return (
    <div 
      onClick={handleNavigateToDetails} 
      className="w-full bg-white font-sans select-none group cursor-pointer flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full bg-[#F9F9FA] overflow-hidden rounded-xl">
        
        {(product.tag || product.subCategory) && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-[#A47A46] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">
              {product.tag || product.subCategory}
            </span>
          </div>
        )}

        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-transform"
        >
          {isWishlistItem ? (
            <Trash2 size={15} className="text-gray-700 hover:text-red-500 transition-colors" />
          ) : (
            <Heart
              size={15}
              className={
                isFavorited
                  ? 'fill-red-500 stroke-red-500 transition-all duration-200'
                  : 'text-gray-700 hover:text-red-500 transition-colors'
              }
            />
          )}
        </button>

        {/* Primary Base Image */}
        <img
          src={displayImage}
          alt={displayTitle}
          className="w-full h-full object-cover rounded-lg transition-all duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Secondary Hover Image */}
        {hoverImage !== displayImage && (
          <img
            src={hoverImage}
            alt={`${displayTitle} Hover`}
            className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Desktop Quick Add Button */}
        <div className="absolute inset-x-3 bottom-3 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block z-10">
          <button 
            onClick={handleAddToCart}
            className="w-full bg-black hover:bg-[#A47A46] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
          >
            <ShoppingBag size={14} />
            Quick Add
          </button>
        </div>

        {/* Mobile Quick Add Floating Button (Overlay on Image Bottom Right) */}
        <button 
          onClick={handleAddToCart}
          className="md:hidden absolute bottom-3 right-3 z-10 w-8 h-8 bg-gray-900/90 text-white backdrop-blur-sm rounded-lg flex items-center justify-center transition-transform active:scale-90 shadow-md"
          aria-label="Add to cart"
        >
          <ShoppingBag size={14} />
        </button>
      </div>

      {/* Product Details Section */}
      <div className="pt-3 pb-1 px-0.5 flex flex-col space-y-1 w-full min-w-0">
        <span className="text-[11px] text-gray-400 uppercase tracking-widest font-bold truncate">
          {displayBrand}
        </span>

        <h3 className="text-gray-900 font-medium text-[15px] tracking-tight group-hover:text-[#A47A46] transition-colors duration-200 truncate">
          {displayTitle}
        </h3>

        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
          <span className="text-black font-extrabold text-[15px] tracking-tight">
            {currentPrice}
          </span>
          {basePriceCut && (
            <span className="text-gray-400 font-medium text-[13px] line-through">
              {basePriceCut}
            </span>
          )}
        </div>
      </div>
      
    </div>
  );
}

export default ProductCard;