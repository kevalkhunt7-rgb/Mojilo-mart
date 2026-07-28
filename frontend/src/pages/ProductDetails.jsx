import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';
import { Heart, Plus, Minus, Truck, RotateCcw, Loader2 } from 'lucide-react';

import RelatedProducts from '../components/RelatedProduct';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import api from '../lib/axios';

export default function ProductDetails() {
  const { id } = useParams();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartModalOpen, setIsSizeChartModalOpen] = useState(false);

  const getProductColors = () => {
    let directColors = [];
    if (product && product.colors) {
      if (Array.isArray(product.colors)) {
        directColors = product.colors;
      } else {
        const str = String(product.colors).trim();
        if (str) {
          if (str.startsWith('[')) {
            try {
              const parsed = JSON.parse(str);
              if (Array.isArray(parsed)) directColors = parsed;
            } catch (e) { }
          } else {
            directColors = str.split(',').map(c => c.trim()).filter(Boolean);
          }
        }
      }
    }

    if (directColors.length === 0 && product && product.variants && product.variants.length > 0) {
      const variantColors = new Set();
      product.variants.forEach(variant => {
        if (variant.colors && variant.colors.length > 0) {
          variant.colors.forEach(col => {
            if (col && typeof col === 'object') {
              if (col.value) variantColors.add(col.value);
              else if (col.id) variantColors.add(col.id);
            } else if (typeof col === 'string') {
              variantColors.add(col);
            }
          });
        }
      });
      directColors = Array.from(variantColors);
    }

    return directColors;
  };

  const getProductSizes = () => {
    let directSizes = [];
    if (product && product.sizes) {
      if (Array.isArray(product.sizes)) {
        directSizes = product.sizes;
      } else {
        const str = String(product.sizes).trim();
        if (str) {
          if (str.startsWith('[')) {
            try {
              const parsed = JSON.parse(str);
              if (Array.isArray(parsed)) directSizes = parsed;
            } catch (e) { }
          } else {
            directSizes = str.split(',').map(s => s.trim()).filter(Boolean);
          }
        }
      }
    }

    if (directSizes.length === 0 && product && product.variants && product.variants.length > 0) {
      const variantSizes = new Set();
      product.variants.forEach(variant => {
        if (variant.sizes && variant.sizes.length > 0) {
          variant.sizes.forEach(sz => {
            if (sz) variantSizes.add(sz);
          });
        }
      });
      directSizes = Array.from(variantSizes);
    }

    return directSizes;
  };

  const getColorDisplayName = (colorValue) => {
    if (!colorValue) return '';
    // Handle case where an object color configuration leaks into display utility
    const hex = (typeof colorValue === 'object' ? colorValue.id || '' : colorValue).toLowerCase();
    const map = {
      '#ffffff': 'White',
      '#000000': 'Black',
      '#ff0000': 'Red',
      '#00ff00': 'Green',
      '#0000ff': 'Blue',
      '#ffff00': 'Yellow',
      '#ffa500': 'Orange',
      '#808080': 'Grey',
      '#800000': 'Maroon',
      '#800080': 'Purple',
      '#008080': 'Teal',
      '#000080': 'Navy',
      '#f5f5dc': 'Beige',
      '#e6e6fa': 'Lavender',
      '#ffd700': 'Gold',
      '#c0c0c0': 'Silver',
      '#ffc0cb': 'Pink',
      '#a52a2a': 'Brown'
    };
    return map[hex] || colorValue;
  };

  const isFavorited = product ? isInWishlist(product._id || product.id) : false;

  // Fetch product from live database
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products/${id}`);
        if (response.data && response.data.success) {
          setProduct(response.data.data);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      const initialImage = product.image || (product.images && (product.images[0]?.url || product.images[0])) || '';
      setSelectedImage(initialImage);

      const colorsList = getProductColors();
      const initialColor = colorsList && colorsList[0]
        ? (typeof colorsList[0] === 'object' ? colorsList[0].id : colorsList[0])
        : '';
      setSelectedColor(initialColor);

      const sizesList = getProductSizes();
      setSelectedSize(sizesList && sizesList[0] ? sizesList[0] : '');
      setQuantity(1);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-[#936A3B] mb-2" />
        <p className="text-xs font-semibold text-gray-400">Loading product information...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
        <Link to="/collection" className="text-[#936A3B] underline text-sm">
          Return to Collections
        </Link>
      </div>
    );
  }

  const getColorsList = getProductColors();
  const formattedColors = getColorsList.map((color) => {
    if (typeof color === 'object') return color;
    const isHex = typeof color === 'string' && color.startsWith('#');
    return {
      id: color,
      name: color,
      hex: isHex ? color : (color.toString().toLowerCase() === 'black' ? '#111111' : '#CAB02A')
    };
  });

  const productImages = (product.images || []).map(img => typeof img === 'object' ? img.url : img);
  if (productImages.length === 0 && product.image) {
    productImages.push(product.image);
  }

  const handleQuantityChange = (type) => {
    if (type === 'inc') setQuantity(prev => prev + 1);
    if (type === 'dec' && quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleWishlistToggle = () => {
    if (isFavorited) {
      removeFromWishlist(product._id || product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = async () => {
    const colorsList = getProductColors();
    const sizesList = getProductSizes();

    if (colorsList.length > 0 && !selectedColor) {
      toast.error('Please select a color variant.');
      return;
    }
    if (sizesList.length > 0 && !selectedSize) {
      toast.error('Please select a size variant.');
      return;
    }

    let colorData = selectedColor;
    if (colorsList.length > 0) {
      const foundColor = colorsList.find(c =>
        (typeof c === 'object' && c.id === selectedColor) || c === selectedColor
      );
      if (foundColor) {
        colorData = typeof foundColor === 'object' ? foundColor : { id: foundColor, name: foundColor };
      }
    }

    const colorId = typeof colorData === 'object' ? colorData.id : colorData;
    const variantId = `${product._id || product.id}-${colorId}-${selectedSize}`;

    // Prepare item safely for data transfer
    const itemWithVariants = {
      ...product,
      cartItemId: variantId,
      selectedColor: colorData,
      selectedSize,
      price: (product.salePrice && Number(product.salePrice) > 0) ? Number(product.salePrice) : (product.price || product.basePrice || 0),
      title: product.name || product.title,
      image: selectedImage
    };

    try {
      let selectedVariantId = null;
      if (product.variants && product.variants.length > 0) {
        const found = product.variants.find(v => v.size === selectedSize && v.color === colorId);
        selectedVariantId = found?._id;
      }

      await addToCart(product._id || product.id, selectedVariantId, quantity, null);

      toast.success(`"${displayTitle}" added to cart!`);
    } catch (err) {
      toast.error(err.message || 'Failed to add item to cart');
    }
  };

  const displayTitle = product.name || product.title || 'Product Details';
  const displayPrice = (product.salePrice && Number(product.salePrice) > 0) ? Number(product.salePrice) : (product.price || product.basePrice || 0);
  const basePriceCut = (product.salePrice && Number(product.salePrice) > 0 && product.basePrice && Number(product.basePrice) > Number(product.salePrice)) ? Number(product.basePrice) : null;
  const displayDesc = product.description || 'No description available.';

  // Safeguard against raw object injection from product.category variants
  const safeCategoryName = product.category?.name ||
    (typeof product.category === 'string' ? product.category : '');

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-10 text-slate-800 font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/collection" className="hover:text-slate-800 transition-colors">Collection</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{displayTitle}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* LEFT: Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] w-full rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <img
                src={selectedImage || 'https://via.placeholder.com/600x750?text=Product'}
                alt={displayTitle}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {productImages.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-xl bg-white border overflow-hidden transition-all
                      ${selectedImage === img ? 'border-[#936A3B] ring-2 ring-[#936A3B]/10' : 'border-slate-200 hover:border-slate-400'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details */}
          <div className="space-y-6 lg:py-2">

            {/* Header */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#936A3B]">
                {product.brand?.name || (typeof product.brand === 'string' ? product.brand : '') || 'MOJILO'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {displayTitle}
              </h1>
              <div className="flex items-center space-x-3">
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {product.currency || '₹'}{displayPrice}
                </span>
                {(basePriceCut || product.originalPrice) && (
                  <span className="text-sm font-medium text-slate-400 line-through">
                    ₹{basePriceCut || product.originalPrice}
                  </span>
                )}
              </div>
            </div>

            <hr className="border-slate-200/60" />

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {displayDesc}
              </p>
            </div>

            {/* Configurable Attributes (Color & Size) */}
            <div className="space-y-5 pt-2">

              {/* Colors */}
              {formattedColors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Select Color: <span className="text-slate-800 font-bold capitalize">{getColorDisplayName(selectedColor)}</span>
                  </h3>
                  <div className="flex items-center space-x-3">
                    {formattedColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.id)}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all relative
                          ${selectedColor === color.id ? 'border-[#936A3B] ring-4 ring-[#936A3B]/10 scale-110' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: color.hex }}
                        title={getColorDisplayName(color.name)}
                      >
                        <span className="sr-only">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {getProductSizes().length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Select Size: <span className="text-slate-800 font-bold">{selectedSize}</span>
                    </h3>
                    {product.sizeChart && (
                      <button
                        type="button"
                        onClick={() => setIsSizeChartModalOpen(true)}
                        className="text-[#936A3B] hover:text-[#805B31] text-xs font-bold underline"
                      >
                        Size Guide
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getProductSizes().map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all uppercase
                          ${selectedSize === size
                            ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Print customized design redirect button */}
              {product.isCustomizable && (() => {
                const name = product.name?.toLowerCase() || '';
                const slug = product.slug?.toLowerCase() || '';
                return name.includes('half') || slug.includes('half') ||
                       name.includes('long') || slug.includes('long') ||
                       name.includes('oversized') || slug.includes('oversized') ||
                       name.includes('hoodie') || slug.includes('hoodie') ||
                       name.includes('jersey') || slug.includes('jersey') ||
                       name.includes('crewneck') || slug.includes('crewneck') ||
                       name.includes('tee') || slug.includes('tee');
              })() && (
                <div className="pt-2">
                  <Link
                    to={`/coustom-product-tshirt/${product._id || product.id}`}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-[#936A3B] text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    <span>🎨 Customize This Shirt</span>
                  </Link>
                </div>
              )}

            </div>

            <hr className="border-slate-200/60" />

            {/* Quantity and Actions */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4 pt-2">

              {/* Qty Selector */}
              <div className="flex items-center justify-between border border-slate-200 rounded-xl bg-white p-1 flex-shrink-0">
                <button
                  onClick={() => handleQuantityChange('dec')}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors text-lg font-bold"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-sm tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange('inc')}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors text-lg font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#936A3B] hover:bg-[#805B31] text-white font-bold text-sm py-4 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all tracking-wide uppercase"
              >
                Add to Cart
              </button>

              {/* Wishlist CTA */}
              <button
                onClick={handleWishlistToggle}
                className={`p-4 rounded-xl border flex items-center justify-center transition-all
                  ${isFavorited
                    ? 'border-rose-100 bg-rose-50 text-rose-500'
                    : 'border-slate-200 bg-white text-slate-400 hover:text-rose-500 hover:border-slate-300'}`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Delivery Info Badges */}
            <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-100">
                <Truck className="w-5 h-5 text-[#936A3B]" />
                <span>Free Shipping in India</span>
              </div>
              <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-100">
                <RotateCcw className="w-5 h-5 text-[#936A3B]" />
                <span>7-Day Return Policy</span>
              </div>
            </div>

            {/* Apparel Specifications Grid */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-2 border-slate-100">
                Product Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                {product.sku && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">SKU</span>
                    <span className="text-slate-800 font-bold">{product.sku}</span>
                  </div>
                )}
                {product.gender && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Gender</span>
                    <span className="text-slate-800 font-bold capitalize">{product.gender}</span>
                  </div>
                )}
                {product.material && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Material</span>
                    <span className="text-slate-800 font-bold">{product.material}</span>
                  </div>
                )}
                {product.gsm && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">GSM</span>
                    <span className="text-slate-800 font-bold">{product.gsm} g/m²</span>
                  </div>
                )}
                {product.fit && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Fit</span>
                    <span className="text-slate-800 font-bold">{product.fit}</span>
                  </div>
                )}
                {product.neckType && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Neck Style</span>
                    <span className="text-slate-800 font-bold">{product.neckType}</span>
                  </div>
                )}
                {product.sleeveType && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Sleeve Style</span>
                    <span className="text-slate-800 font-bold">{product.sleeveType}</span>
                  </div>
                )}
                {product.countryOfOrigin && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Origin</span>
                    <span className="text-slate-800 font-bold">{product.countryOfOrigin}</span>
                  </div>
                )}
              </div>

              {/* Shipping & Delivery details */}
              {(product.weight || product.dimensions || product.estimatedDelivery) && (
                <div className="pt-2 text-xs border-t border-slate-100 space-y-2">
                  <p className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Logistics & Shipping</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    {product.weight && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Weight</span>
                        <span className="text-slate-800 font-semibold">{product.weight} g</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Dimensions</span>
                        <span className="text-slate-800 font-semibold">{product.dimensions}</span>
                      </div>
                    )}
                    {product.estimatedDelivery && (
                      <div className="flex justify-between md:col-span-2">
                        <span className="text-slate-400 font-medium">Estimated Delivery</span>
                        <span className="text-slate-800 font-semibold">{product.estimatedDelivery}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Care instructions */}
              {product.careInstructions && (
                <div className="pt-2 text-xs border-t border-slate-100 space-y-1">
                  <p className="font-bold text-slate-900 text-[10px] uppercase tracking-wider">Fabric Care</p>
                  <p className="text-slate-600 italic leading-relaxed">{product.careInstructions}</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {safeCategoryName && (
          <div className="mt-20">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide mb-6">
              You May Also Like
            </h2>
            <RelatedProducts
              category={safeCategoryName}
              currentProductId={product._id || product.id}
            />
          </div>
        )}

      </div>

      {/* Size Chart Modal */}
      {isSizeChartModalOpen && product.sizeChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative animate-in zoom-in-95 duration-150 shadow-2xl">
            <button
              onClick={() => setIsSizeChartModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors font-bold text-lg p-2"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider">Size Guide Chart</h3>
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
              <img
                src={product.sizeChart}
                alt="Size Chart Guide"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}