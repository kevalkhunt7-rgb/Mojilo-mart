import React, { useState, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';

import ProductCard from "../components/ProductCard";
import OffersSlideImg1 from '../assets/OffersSlideImg1.png';
import OffersSlideImg2 from '../assets/OffersSlideImg2.png';
import OffersSlideImg3 from '../assets/OffersSlideImg3.png';
import OffersSlideImg4 from '../assets/OffersSlideImg4.png';

// ==========================================
// 1. MAIN HERO SLIDER COMPONENT
// ==========================================
const NewOffers = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      titleLine1: "T-Shirt",
      titleHighlight: "Printing",
      titleLine2: "Made Simple",
      titleLine3: "For Everyone",
      description: "A True Masterpiece of Creativity and Comfort! Express yourself with bold customized graphics.",
      tshirtBgImage: OffersSlideImg2,
      manImage: OffersSlideImg1,
      satisfactionRate: "90%"
    },
    {
      titleLine1: "Custom",
      titleHighlight: "Hoodies",
      titleLine2: "Crafted Daily",
      titleLine3: "For Creators",
      description: "Step up your premium streetwear game. Our heavy-blend customized hoodies offer maximum insulation without compromising on vibrant graphic precision.",
      tshirtBgImage: OffersSlideImg4,
      manImage: OffersSlideImg3,
      satisfactionRate: "95%"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="w-full bg-[#E5D5C5] relative overflow-hidden font-sans flex items-center justify-center p-4 sm:p-12 md:p-20 group/slider">
      
      {/* Abstract Background Line Vector Effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100,200 C300,100 500,600 900,400 C1200,250 1300,700 1600,600" stroke="#8C5A23" strokeWidth="1.5" />
          <path d="M-120,230 C280,130 480,630 880,430 C1180,280 1280,730 1580,630" stroke="#8C5A23" strokeWidth="1.5" />
          <path d="M-140,260 C260,160 460,660 860,460 C1160,310 1260,760 1560,660" stroke="#8C5A23" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Slider Viewport Window */}
      <div className="max-w-7xl w-full relative z-10 overflow-hidden">
        <div 
          className="flex transition-transform duration-700 ease-in-out" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 items-center">
              
              {/* Left Content Column */}
              <div className="lg:col-span-6 flex flex-col justify-center space-y-4 sm:space-y-6 text-[#1A1A1A] order-2 lg:order-1">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">
                  {slide.titleLine1} <span className="text-[#C58228] relative inline-block">
                    {slide.titleHighlight}
                  </span>
                  <br />
                  {slide.titleLine2}
                  <br />
                  {slide.titleLine3}
                </h1>
                
                <p className="hidden sm:block text-sm sm:text-base text-gray-700 font-medium leading-relaxed max-w-xl">
                  {slide.description}
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 sm:pt-4">
                  <button onClick={() => navigate('/custom')} className="bg-[#BD7A22] hover:bg-[#A3661B] text-white font-bold py-3 px-8 rounded-md transition shadow-md text-sm sm:text-base cursor-pointer">
                    Get Started
                  </button>
                </div>
              </div>

              {/* Right Graphics/Mockup Column */}
              <div className="lg:col-span-6 relative flex justify-center items-center h-[260px] xs:h-[320px] sm:h-[450px] md:h-[550px] order-1 lg:order-2">
                <div className="absolute left-0 top-6 sm:top-10 w-28 sm:w-48 md:w-72 transform z-10 filter drop-shadow-2xl">
                  <img 
                    src={slide.tshirtBgImage} 
                    alt="Product Mockup" 
                    className="w-full object-contain rounded-xl"
                    style={{ mixBlendMode: 'multiply' }} 
                  />
                </div>

                <div className="absolute right-4 bottom-0 h-[90%] w-[65%] sm:w-[70%] md:w-[65%] z-20 overflow-hidden rounded-b-2xl flex items-end">
                  <img 
                    src={slide.manImage} 
                    alt="Model Showcase" 
                    className="w-full h-full object-cover object-top filter drop-shadow-2xl"
                  />
                </div>

                {/* UI Badges */}
                <div className="hidden sm:flex absolute right-[32%] top-16 bg-[#BD7A22] p-2.5 rounded-lg shadow-lg transform rotate-12 z-10 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Customer Satisfaction Analytics Box */}
                <div className="absolute right-0 top-4 sm:top-20 bg-white rounded-xl p-2 sm:p-4 shadow-xl z-30 flex flex-col items-center space-y-1 sm:space-y-2 text-center w-16 sm:w-24 md:w-28 border border-gray-100">
                  <div className="relative w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-gray-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-amber-500" strokeDasharray="90, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span className="absolute text-[8px] sm:text-[10px] md:text-xs font-black text-gray-800">{slide.satisfactionRate}</span>
                  </div>
                  <span className="text-[7px] sm:text-[9px] md:text-[10px] font-bold text-gray-700 leading-tight">Customer Satisfaction</span>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slider Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-1 sm:left-6 z-40 p-1.5 sm:p-2 bg-[#BD7A22]/80 hover:bg-[#BD7A22] text-white rounded-full shadow-lg transition opacity-100 sm:opacity-0 sm:group-hover/slider:opacity-100 focus:opacity-100 cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} className="sm:hidden" />
        <ChevronLeft size={24} className="hidden sm:block" />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-1 sm:right-6 z-40 p-1.5 sm:p-2 bg-[#BD7A22]/80 hover:bg-[#BD7A22] text-white rounded-full shadow-lg transition opacity-100 sm:opacity-0 sm:group-hover/slider:opacity-100 focus:opacity-100 cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight size={18} className="sm:hidden" />
        <ChevronRight size={24} className="hidden sm:block" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-3 sm:bottom-4 flex gap-2 z-40">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 ${currentSlide === i ? 'w-6 bg-[#BD7A22]' : 'w-2 bg-[#1A1A1A]/30'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};


// ==========================================
// 2. GENDER FILTER SECTION COMPONENT
// ==========================================
const CategoryFilter = ({ activeCategory, setActiveCategory }) => {
  const categories = ['Men', 'Women', 'Unisex'];

  return (
    <section className="w-full bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-4 sm:py-6 px-4 sm:px-12 md:px-20">

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#1A1A1A]">
            New Offers For
          </h2>

          <div className="flex items-center gap-1 bg-[#E7E3DF] p-1 rounded-md">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-md transition cursor-pointer ${
                  activeCategory === category
                    ? 'bg-[#BD7A22] text-white'
                    : 'text-black hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <Link to="/collection">
          <button className="w-full sm:w-auto text-center px-4 py-2 rounded-lg bg-[#F5F5F5] font-semibold hover:bg-gray-200 transition cursor-pointer text-sm">
            View All
          </button>
        </Link>
      </div>
    </section>
  );
};


// ==========================================
// 3. MASTER WRAPPER (Filtered by Gender)
// ==========================================
const FeaturedSectionWrapper = () => {
  const [activeCategory, setActiveCategory] = useState('Men');
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDbProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/products');
        
        // Safely extract product array regardless of wrapper structure
        if (response.data && response.data.success) {
          const extractedProducts = 
            response.data.data?.products || 
            (Array.isArray(response.data.data) ? response.data.data : []);
          setProductsList(extractedProducts);
        } else if (Array.isArray(response.data)) {
          setProductsList(response.data);
        } else {
          setProductsList([]);
        }
      } catch (err) {
        console.error("API products list load error:", err);
        setProductsList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDbProducts();
  }, []);

  // Ensure productsList is strictly an array before filtering
  const safeProductsList = Array.isArray(productsList) ? productsList : [];

  // Filter products by gender (or fallback category if gender isn't explicit)
  const filteredProducts = safeProductsList.filter((product) => {
    if (!product) return false;

    // Check product.gender, product.targetGender, or nested category object
    const rawGender = 
      product.gender || 
      product.targetGender || 
      (typeof product.category === 'object' ? product.category?.name : product.category) || 
      '';

    const genderVal = String(rawGender).toLowerCase().trim();
    const activeLower = activeCategory.toLowerCase();

    if (activeLower === 'men') {
      return genderVal.includes('man') || genderVal.includes('men') || genderVal === 'male' || genderVal.includes('unisex');
    }
    if (activeLower === 'women') {
      return genderVal.includes('woman') || genderVal.includes('women') || genderVal === 'female' || genderVal.includes('unisex');
    }
    if (activeLower === 'sports') {
      return genderVal.includes('sport') || genderVal.includes('jersey') || genderVal.includes('activewear');
    }

    return genderVal.includes(activeLower);
  });

  return (
    <div className="w-full bg-white">

      {/* Hero Slider */}
      <NewOffers />

      {/* Gap */}
      <div className="h-4 sm:h-6 bg-white"></div>

      {/* Category/Gender Filter */}
      <CategoryFilter
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Product Grid */}
      <section className="w-full bg-white pb-10 sm:pb-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-12 md:px-20 pt-4 sm:pt-0">

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#BD7A22]" />
              <p className="text-xs font-semibold text-gray-500">Loading products from database...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {filteredProducts.map((product) => {
                  const firstImage = Array.isArray(product.images) && product.images.length > 0
                    ? (typeof product.images[0] === 'object' ? product.images[0]?.url : product.images[0])
                    : null;

                  const adaptedProduct = {
                    ...product,
                    id: product._id || product.id,
                    title: product.name || product.title,
                    price: product.salePrice && Number(product.salePrice) > 0 ? product.salePrice : (product.price || product.basePrice),
                    image: product.image || firstImage
                  };

                  return (
                    <ProductCard
                      key={product._id || product.id}
                      product={adaptedProduct}
                    />
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16 text-gray-400 font-medium bg-gray-50/50 rounded-2xl border border-gray-100">
                  No products found for this section.
                </div>
              )}
            </>
          )}

        </div>
      </section>

    </div>
  );
};

export default FeaturedSectionWrapper;