import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import heroimg1 from '../assets/heroimg.png';
import heroimg2 from '../assets/heroimg2.png';

// Fallback slides in case the database is empty or the API fails
const FALLBACK_SLIDES = [
  {
    badge: "Create your own",
    heading: "Dream Big \n Work Hard \n Stay Focused",
    description: "A True Masterpiece of Creativity and Comfort! Not just another T-shirt — it's a bold expression of individuality and style.",
    image: heroimg1,
    stats: { collections: "4k+", trusted: "9k+" },
    ctaLink: "/collection",
    ctaText: "Shop Now"
  },
  {
    badge: "New Release",
    heading: "Elevate \n Your Daily \n Aesthetics",
    description: "Premium materials engineered for absolute lifestyle execution. Tailored minimalism matching your relentless daily drive.",
    image: heroimg2,
    stats: { collections: "6k+", trusted: "14k+" },
    ctaLink: "/collection",
    ctaText: "Shop Now"
  }
];

// Content Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function HeroSlider({ autoPlayInterval = 6000 }) {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // 1. Fetch dynamic banners created in the Admin Panel
 useEffect(() => {
  const fetchBanners = async () => {
    try {
      const { data: resJson } = await api.get('/banners/active');

      const bannerList = resJson.data || [];

      if (bannerList.length > 0) {
        const mappedSlides = bannerList.map((banner) => ({
          badge: banner.tagline,
          heading: banner.title,
          description: banner.description,
          image: banner.image?.url || heroimg1,
          stats: {
            collections: banner.stat1Number,
            collectionsLabel: banner.stat1Label,
            trusted: banner.stat2Number,
            trustedLabel: banner.stat2Label,
          },
          ctaLink: banner.ctaLink,
          ctaText: banner.ctaText,
        }));

        setSlides(mappedSlides);
      } else {
        setSlides(FALLBACK_SLIDES);
      }
    } catch (error) {
      console.error("Error loading admin banners:", error);
      setSlides(FALLBACK_SLIDES);
    } finally {
      setLoading(false);
    }
  };

  fetchBanners();
}, []);
  // 2. Handle Autoplay Interval
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [slides.length, autoPlayInterval]);

  if (loading) {
    return (
      <div className="w-full h-[500px] md:h-[650px] flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl max-w-[1440px] mx-auto border border-neutral-200/50 shadow-inner">
        <Loader2 className="animate-spin text-[#BC7628] mb-4" size={36} />
        <p className="text-sm text-neutral-500 font-medium tracking-wide">Loading latest collections...</p>
      </div>
    );
  }

  const slide = slides[currentSlide] || FALLBACK_SLIDES[0];

  const renderHeading = (headingText) => {
    if (typeof headingText !== 'string') return headingText;
    return headingText.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < headingText.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <section className="relative w-full bg-white overflow-hidden max-w-[1440px] mx-auto py-4 px-4 sm:px-6 lg:px-8">
      
      {/* ═══════════════════════════════════════
          MOBILE LAYOUT  (< md)
      ════════════════════════════════════════ */}
      <div className="flex flex-col md:hidden bg-neutral-50/60 rounded-3xl border border-neutral-100 overflow-hidden shadow-sm">
        {/* Mobile Graphic Frame */}
        <div className="relative w-full overflow-hidden flex items-center justify-center pt-8" style={{ height: '70vw', minHeight: 260, maxHeight: 380 }}>
          {/* Creative Organic Background Blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] aspect-square rounded-[38%_62%_63%_37%_/_41%_44%_56%_59%] bg-gradient-to-tr from-[#FDF4EB] via-[#F5E6D3] to-[#EAD4BA] opacity-80 blur-xs transition-all duration-700" />
          
          {slide.badge && (
            <div className="absolute top-4 left-4 z-20">
              <span className="bg-[#BC7628]/10 text-[#A0611F] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xs">
                {slide.badge}
              </span>
            </div>
          )}

          {/* Hero image */}
          <AnimatePresence mode="wait">
            <motion.img
              key={`mob-img-${currentSlide}`}
              src={slide.image}
              alt={slide.imageAlt || "Promo"}
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative max-h-[90%] object-contain drop-shadow-2xl z-10"
            />
          </AnimatePresence>
        </div>

        {/* Mobile Content Block */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`mob-text-${currentSlide}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-6 pb-8 pt-2 flex flex-col gap-4"
          >
            <motion.h1 variants={itemVariants} className="text-3xl font-black text-neutral-900 uppercase tracking-tight leading-[1.1]">
              {renderHeading(slide.heading)}
            </motion.h1>

            {slide.description && (
              <motion.p variants={itemVariants} className="text-neutral-500 text-sm font-light leading-relaxed">
                {slide.description}
              </motion.p>
            )}

            <motion.button
              variants={itemVariants}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(slide.ctaLink || '/collection')}
              className="self-start flex items-center gap-2 bg-[#BC7628] hover:bg-[#A0611F] text-white font-semibold px-5 py-3 rounded-xl shadow-md shadow-[#BC7628]/20 text-sm transition-all cursor-pointer"
            >
              {slide.ctaText || 'Shop Now'} <ArrowRight size={14} />
            </motion.button>

            {slide.stats && (
              <motion.div variants={itemVariants} className="flex gap-8 pt-4 mt-2 border-t border-neutral-200/60">
                {slide.stats.collections && (
                  <div>
                    <p className="text-xl font-black text-neutral-900">{slide.stats.collections}</p>
                    <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider mt-0.5">{slide.stats.collectionsLabel || 'Collections'}</p>
                  </div>
                )}
                {slide.stats.trusted && (
                  <div>
                    <p className="text-xl font-black text-neutral-900">{slide.stats.trusted}</p>
                    <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider mt-0.5">{slide.stats.trustedLabel || 'Trusted Units'}</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Mobile Pagination Dots */}
        {slides.length > 1 && (
          <div className="flex gap-2 justify-center pb-6">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === i ? 'w-6 bg-[#BC7628]' : 'w-2 bg-neutral-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════
          DESKTOP LAYOUT  (md+)
      ════════════════════════════════════════ */}
      <div className="hidden md:flex flex-row items-center justify-between px-8 lg:px-16 py-12 min-h-[580px] lg:min-h-[660px] bg-gradient-to-r from-neutral-50/70 to-neutral-50/20 rounded-[32px] border border-neutral-100 shadow-xs relative">
        
        {/* Content Columns Left */}
        <div className="w-[52%] flex flex-col items-start justify-center h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`desk-content-${currentSlide}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-start gap-6"
            >
              {slide.badge && (
                <motion.div variants={itemVariants}>
                  <span className="bg-[#BC7628]/10 text-[#A0611F] text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-xs">
                    {slide.badge}
                  </span>
                </motion.div>
              )}

              <motion.h1
                variants={itemVariants}
                className="text-4xl lg:text-[3.5rem] font-black tracking-tight text-neutral-900 uppercase leading-[1.05] min-h-[140px] lg:min-h-[170px]"
              >
                {renderHeading(slide.heading)}
              </motion.h1>

              {slide.description && (
                <motion.p
                  variants={itemVariants}
                  className="text-neutral-500 text-sm lg:text-base font-light leading-relaxed max-w-md min-h-[70px]"
                >
                  {slide.description}
                </motion.p>
              )}

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(slide.ctaLink || '/collection')}
                className="flex items-center gap-2 bg-[#BC7628] hover:bg-[#A0611F] text-white font-medium px-7 py-3.5 rounded-xl shadow-lg shadow-[#BC7628]/15 hover:shadow-[#BC7628]/25 transition-all cursor-pointer text-sm tracking-wide"
              >
                {slide.ctaText || 'Shop Now'} <ArrowRight size={16} />
              </motion.button>

              {slide.stats && (
                <motion.div
                  variants={itemVariants}
                  className="flex gap-12 pt-6 mt-2 border-t border-neutral-200/70 w-full"
                >
                  {slide.stats.collections && (
                    <div>
                      <p className="text-2xl lg:text-3xl font-black text-neutral-900">{slide.stats.collections}</p>
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mt-1">{slide.stats.collectionsLabel || 'Collections'}</p>
                    </div>
                  )}
                  {slide.stats.trusted && (
                    <div>
                      <p className="text-2xl lg:text-3xl font-black text-neutral-900">{slide.stats.trusted}</p>
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mt-1">{slide.stats.trustedLabel || 'Trusted Units'}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Artful Image Frame Right */}
        <div className="w-[45%] relative flex flex-col justify-center items-center h-full min-h-[400px]">
          
          {/* Asymmetric Organic Dynamic Container */}
          <div className="absolute w-[85%] lg:w-[80%] aspect-square rounded-[42%_58%_70%_30%_/_45%_45%_55%_55%] bg-gradient-to-tr from-[#FDF4EB] via-[#F6EAD9] to-[#ebd2b4] shadow-inner border border-white/40 overflow-visible transition-all duration-1000 ease-in-out scale-105" />

          {/* Foreground Product Display */}
          <div className="relative z-10 w-[75%] lg:w-[70%] aspect-square flex items-center justify-center overflow-visible">
            <AnimatePresence mode="wait">
              <motion.img
                key={`desk-img-${currentSlide}`}
                src={slide.image}
                alt={slide.imageAlt || "Promo Display"}
                initial={{ opacity: 0, scale: 0.88, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -20 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="object-contain w-full h-full drop-shadow-[0_25px_25px_rgba(0,0,0,0.18)] absolute bottom-4"
              />
            </AnimatePresence>
          </div>

          {/* Dynamic Navigation Dots below the Art Container */}
          {slides.length > 1 && (
            <div className="absolute bottom-[-16px] flex gap-2 z-20">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                    currentSlide === i ? 'w-8 bg-[#BC7628]' : 'w-2 bg-neutral-300 hover:bg-neutral-400 hover:w-3'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}