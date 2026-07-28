import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCustomizerStore } from '../store/useCustomizerStore';
import api from '../lib/axios';

// Image asset imports
import CoustomImg1 from '../assets/CoustomImg1.png';
import CoustomImg2 from '../assets/CoustomImg2.png';
import CoustomImg3 from '../assets/CoustomImg3.png';
import CoustomImg4 from '../assets/CoustomImg4.png';
import CoustomTshirt1 from '../assets/CoustomTshirt1.png';
import CoustomTshirt2 from '../assets/CoustomTshirt2.png';
import CoustomTshirt3 from '../assets/CoustomTshirt3.png';
import CoustomTshirt4 from '../assets/CoustomTshirt4.png';
import BannerImage from '../assets/CoustomBennerImg1.png';
import CoustomImg5 from '../assets/sports-jersy.png'

import CoustomProduct from '../components/CoustomProduct';

const apparelDatabase = {
  'half-sleeve': { id: 'half-sleeve', name: 'Half Sleeve', modelImage: CoustomImg1, flatImage: CoustomTshirt1 },
  'long-sleeve': { id: 'long-sleeve', name: 'Long Sleeve', modelImage: CoustomImg2, flatImage: CoustomTshirt2 },
  'hoodie': { id: 'hoodie', name: 'Hoodie', modelImage: CoustomImg3, flatImage: CoustomTshirt3 },
  'oversized': { id: 'oversized', name: 'Oversized', modelImage: CoustomImg4, flatImage: CoustomTshirt4 },
  'sports-jersey': { id: 'sports-jersey', name: 'Sports Jersey', modelImage: CoustomImg5, flatImage: CoustomTshirt1 },
};

// collectionsData removed for dynamic data

/* ── Scroll-reveal hook: fade + rise + soften-in from blur ── */
function useFadeInUp(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { el.style.opacity = '1'; return; }
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px) scale(0.98)';
    el.style.filter = 'blur(6px)';
    el.style.transition = `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, filter 0.7s ease ${delay}ms`;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) scale(1)';
        el.style.filter = 'blur(0px)';
        io.disconnect();
      }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return ref;
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
const Coustom = () => {
  const currentProduct = useCustomizerStore((state) => state.currentProduct);
  const setCurrentProduct = useCustomizerStore((state) => state.setCurrentProduct);
  const [isAnimating, setIsAnimating] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const navigate = useNavigate();
  const stageRef = useRef(null);

  const handleApparelSwitch = (id) => {
    if (id === currentProduct) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentProduct(id);
      setIsAnimating(false);
    }, 280);
  };

  const handleStageMove = useCallback((e) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - py) * 10,
      ry: (px - 0.5) * 14,
      gx: px * 100,
      gy: py * 100,
    });
  }, []);

  const handleStageLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 });
  }, []);

  const activeProduct = apparelDatabase[currentProduct];

  const refHeading = useFadeInUp(0);
  const refSub = useFadeInUp(80);
  const refBody = useFadeInUp(160);
  const refBtn = useFadeInUp(240);
  const refModel = useFadeInUp(120);
  const refRack = useFadeInUp(200);

  return (
    <div className="w-full min-h-screen bg-stone-50 font-sans text-stone-800 antialiased selection:bg-amber-100 flex flex-col items-center overflow-x-hidden">
      <style>{`
        @keyframes cs-blobFloat {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(24px, -18px) scale(1.08); }
          66%  { transform: translate(-18px, 14px) scale(0.95); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes cs-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes cs-riseIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cs-popIn {
          0%   { opacity: 0; transform: scale(0.4) rotate(-20deg); }
          60%  { opacity: 1; transform: scale(1.15) rotate(4deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes cs-shine {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes cs-sparklePulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.25); }
        }
        @keyframes cs-badgeIn {
          from { opacity: 0; transform: translateY(8px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cs-blob { animation: cs-blobFloat 14s ease-in-out infinite; }
        .cs-blob-2 { animation-duration: 18s; animation-direction: reverse; }
        .cs-bob { animation: cs-bob 5s ease-in-out infinite; }
        .cs-rack-item { opacity: 0; animation: cs-riseIn 0.6s cubic-bezier(.16,1,.3,1) forwards; }
        .cs-badge-pop { animation: cs-popIn 0.45s cubic-bezier(.34,1.56,.64,1) both; }
        .cs-name-badge { animation: cs-badgeIn 0.4s cubic-bezier(.16,1,.3,1) both; }
        .cs-sparkle { animation: cs-sparklePulse 2.2s ease-in-out infinite; }
        .cs-shine-text {
          background-image: linear-gradient(110deg, #92400e 30%, #fbbf24 45%, #92400e 60%);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: cs-shine 4.5s linear infinite;
        }
        .cs-cta { position: relative; overflow: hidden; }
        .cs-cta::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%);
          transform: translateX(-120%);
          transition: transform 0.7s ease;
        }
        .cs-cta:hover::after { transform: translateX(120%); }
        @media (prefers-reduced-motion: reduce) {
          .cs-blob, .cs-bob, .cs-rack-item, .cs-badge-pop, .cs-name-badge, .cs-sparkle, .cs-shine-text, .cs-cta::after {
            animation: none !important; transition: none !important;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* ── Hero ── */}
      <main className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-10 lg:pb-20
                       grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">

        {/* ambient background blobs */}
        <div className="pointer-events-none absolute -top-10 left-1/4 w-72 h-72 rounded-full bg-amber-300/20 blur-3xl cs-blob" />
        <div className="pointer-events-none absolute top-1/3 right-0 w-80 h-80 rounded-full bg-stone-400/10 blur-3xl cs-blob cs-blob-2" />

        {/* LEFT: copy */}
        <div className="order-1 lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left gap-4 sm:gap-5 relative z-10">
          <div ref={refHeading} className="space-y-1">
            <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-amber-700 uppercase flex items-center justify-center lg:justify-start gap-1.5">
              <Sparkles className="w-3 h-3 cs-sparkle" /> Print. Wear. Inspire.
            </p>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-stone-900 leading-[1.08]">
              Choose Your<br />
              <span ref={refSub} className="cs-shine-text">
                Own Design.
              </span>
            </h2>
          </div>

          <p ref={refBody} className="hidden lg:block text-stone-500 text-sm sm:text-base leading-relaxed max-w-sm lg:max-w-xs">
            Turn your ideas into reality with high-quality garments and professional printing. Create custom pieces that reflect your vision.
          </p>

          <div ref={refBtn} className="w-full sm:w-auto">
            <button
              onClick={() => navigate('/collection')}
              className="cs-cta group w-full sm:w-auto flex items-center justify-center gap-2.5
                         bg-stone-900 hover:bg-amber-800 text-white
                         text-xs font-bold tracking-[0.14em] uppercase
                         px-6 py-3.5 sm:py-4 rounded-xl shadow-lg
                         transition-all duration-300 ease-out
                         hover:shadow-amber-900/30 hover:shadow-xl hover:-translate-y-0.5
                         active:scale-95"
            >
              <span>View Collections</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-400" />
            </button>
          </div>
        </div>

        {/* MIDDLE: model preview — cursor-tilt showroom stage */}
        <div
          ref={(node) => { refModel.current = node; stageRef.current = node; }}
          onClick={() => navigate(`/coustom-product-tshirt/${currentProduct}`)}
          onMouseMove={handleStageMove}
          onMouseLeave={handleStageLeave}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.35s cubic-bezier(.16,1,.3,1)',
          }}
          className="order-2 lg:col-span-5 w-full cursor-pointer z-10
                     relative overflow-hidden rounded-2xl sm:rounded-3xl
                     bg-stone-100/70 border border-stone-200/60
                     shadow-sm hover:shadow-2xl hover:shadow-amber-900/10
                     transition-shadow duration-500 ease-out
                     hover:border-amber-400/40
                     aspect-[4/5] sm:aspect-[3/4] lg:h-[540px] lg:aspect-auto
                     flex justify-center items-center group"
        >
          {/* cursor-follow spotlight */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(300px circle at ${tilt.gx}% ${tilt.gy}%, rgba(251,191,36,0.16), transparent 70%)`,
            }}
          />

          <div
            className={`cs-bob w-full h-full flex items-center justify-center p-6 sm:p-10 lg:p-12
                        transition-all duration-300 ease-out
                        ${isAnimating
                ? 'opacity-0 scale-90 translate-y-6 blur-sm'
                : 'opacity-100 scale-100 translate-y-0 blur-none'}`}
          >
            <img
              src={activeProduct.modelImage}
              alt={activeProduct.name}
              className="max-h-full max-w-full object-contain mix-blend-darken
                         select-none pointer-events-none drop-shadow-lg
                         transition-all duration-300"
            />
          </div>

          {/* hover CTA pill */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-stone-900/90 backdrop-blur-sm text-white
                            text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase
                            px-4 py-2.5 rounded-xl shadow-xl
                            opacity-0 group-hover:opacity-100
                            translate-y-3 group-hover:translate-y-0 scale-95 group-hover:scale-100
                            transition-all duration-300 flex items-center gap-2">
              Customize This Item
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>

          {/* name badge */}
          <div key={activeProduct.id} className={`cs-name-badge absolute bottom-3 left-3 sm:bottom-5 sm:left-5
                           bg-white/90 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2
                           rounded-lg border border-stone-200/40 shadow-sm z-10
                           transition-all duration-300
                           ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            <span className="text-[9px] sm:text-[11px] font-bold tracking-wider text-amber-900 uppercase">
              {activeProduct.name}
            </span>
          </div>
        </div>

        {/* RIGHT: selection rack */}
        <div
          ref={refRack}
          className="order-3 lg:col-span-3 w-full z-10
                     flex flex-row lg:flex-col gap-3
                     overflow-x-auto lg:overflow-y-auto
                     lg:h-[540px]
                     pb-2 lg:pb-0 px-0.5 lg:px-0
                     snap-x snap-mandatory lg:snap-none
                     scrollbar-none"
        >
          {Object.values(apparelDatabase).map((item, i) => {
            const selected = item.id === currentProduct;
            return (
              <button
                key={item.id}
                onClick={() => handleApparelSwitch(item.id)}
                style={{ animationDelay: `${i * 70}ms` }}
                className={`cs-rack-item flex-row items-center justify-between
                             p-3 sm:p-3.5 rounded-xl cursor-pointer
                             transition-all duration-300 ease-out
                             border text-left shrink-0 relative overflow-hidden
                             w-[200px] xs:w-[230px] sm:w-[260px] lg:w-full
                             snap-start
                             outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50
                             active:scale-95
                             flex
                             ${selected
                    ? 'bg-[#1e1410] border-[#1e1410] shadow-xl text-white scale-[1.02]'
                    : 'bg-white hover:bg-stone-50 border-stone-200/70 text-stone-800 hover:border-amber-200 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.015]'
                  }`}
              >
                <div className="flex-1 min-w-0 pr-2 space-y-0.5">
                  <p className={`text-[8px] sm:text-[9px] font-semibold tracking-widest uppercase truncate flex items-center gap-1
                                 ${selected ? 'text-amber-400' : 'text-stone-400'}`}>
                    Apparel
                    {selected && <Check key={item.id} className="w-2.5 h-2.5 cs-badge-pop" strokeWidth={4} />}
                  </p>
                  <h4 className="text-xs sm:text-sm font-bold tracking-wide truncate leading-snug">
                    {item.name}
                  </h4>
                </div>

                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden
                                 flex items-center justify-center shrink-0
                                 border transition-all duration-300
                                 ${selected ? 'bg-white border-white/20 scale-105' : 'bg-stone-50 border-stone-200/30 shadow-inner group-hover:scale-105'}`}>
                  <img
                    src={item.flatImage}
                    alt={item.name}
                    className={`w-full h-full object-cover select-none pointer-events-none transition-all duration-500
                                ${selected ? 'mix-blend-normal' : 'mix-blend-darken'}`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* ── Divider ── */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <hr className="border-stone-200/60" />
      </div>

      <CustomShowcase />

      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <hr className="border-stone-200/60" />
      </div>

      <CustomBanner />
    </div>
  );
};

/* ══════════════════════════════════════════
   TEMPLATE SHOWCASE
══════════════════════════════════════════ */
const CustomShowcase = () => {
  const titleRef = useFadeInUp(0);
  const navigate = useNavigate();
  const currentProduct = useCustomizerStore((state) => state.currentProduct);

  const [dbCliparts, setDbCliparts] = useState([]);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenItem, setFullscreenItem] = useState(null);
  const [activeList, setActiveList] = useState(null);
  
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const clipartRes = await api.get('/cliparts');
        const clipartsData = clipartRes.data?.data || [];
        if (active) setDbCliparts(clipartsData);
      } catch (err) {
        console.error('Failed to fetch cliparts:', err);
      }

      try {
        const designsRes = await api.get('/designs/public');
        const designsData = designsRes.data?.data || [];
        if (active) setSavedDesigns(designsData);
      } catch (err) {
        console.error('Failed to fetch public designs:', err);
      }

      if (active) setLoading(false);
    };

    fetchData();
    return () => { active = false; };
  }, []);

  const dbAnimalCliparts = dbCliparts.filter(c => c.category?.toLowerCase() === 'animal');
  const dbOtherCliparts = dbCliparts.filter(c => c.category?.toLowerCase() !== 'animal');

  const popularClipartImages = dbOtherCliparts.slice(0, 3).map(c => c.imageUrl);
  const popularClipartTitles = dbOtherCliparts.slice(0, 3).map(c => c.name);

  const animalClipartImages = dbAnimalCliparts.slice(0, 3).map(c => c.imageUrl);
  const animalClipartTitles = dbAnimalCliparts.slice(0, 3).map(c => c.name);


  const topDesigns = Array.isArray(savedDesigns) ? savedDesigns.slice(0, 3) : [];

  const customDesignImages = topDesigns.map(d => d.previewImage?.url).filter(Boolean);
  const customDesignTitles = topDesigns.map(d => d.name);

  const popularCount = dbOtherCliparts.length;
  const animalCount = dbAnimalCliparts.length;
  const designsCount = savedDesigns.length;

  const totalAssetsCount = popularCount + animalCount + designsCount;

  const dynamicCollections = [
    {
      id: 'popular-cliparts',
      title: 'Popular Cliparts',
      count: `${popularCount} real cliparts`,
      images: popularClipartImages,
      titles: popularClipartTitles,
      allItems: dbOtherCliparts.map(c => ({ url: c.imageUrl, name: c.name }))
    },
    {
      id: 'animal-cliparts',
      title: 'Animals & Cute',
      count: `${animalCount} real cliparts`,
      images: animalClipartImages,
      titles: animalClipartTitles,
      allItems: dbAnimalCliparts.map(c => ({ url: c.imageUrl, name: c.name }))
    },
    {
      id: 'custom-designs',
      title: 'Custom Designs',
      count: `${designsCount} real designs`,
      images: customDesignImages,
      titles: customDesignTitles,
      allItems: Array.isArray(savedDesigns)
        ? savedDesigns.map(d => ({ url: d.previewImage?.url, name: d.name }))
        : []
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
      <div ref={titleRef} className="flex items-end justify-between mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight">
          Free design templates
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-3
                      sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0
                      lg:grid-cols-4">

        {dynamicCollections.map((item, i) => (
          <CollectionCard
            key={item.id}
            item={item}
            delay={i * 90}
            onImageClick={(url, name) => setFullscreenItem({ url, name })}
            onCardClick={() => setActiveList({ title: item.title, items: item.allItems })}
          />
        ))}

        <div
          onClick={() => setActiveList({
            title: 'All Database Resources', items: [
              ...dbOtherCliparts.map(c => ({ url: c.imageUrl, name: c.name })),
              ...dbAnimalCliparts.map(c => ({ url: c.imageUrl, name: c.name })),
              ...savedDesigns.map(d => ({ url: d.previewImage?.url, name: d.name }))
            ]
          })}
          className="group cursor-pointer shrink-0 w-[220px] snap-start
                          sm:w-auto sm:flex sm:flex-col"
        >
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden
                          grid grid-cols-2 gap-2 p-2 bg-[#1e1410]
                          shadow-md border border-stone-900
                          transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-amber-900/10">
            <div className="grid grid-rows-2 gap-2 opacity-20">
              <div className="bg-stone-400 rounded-lg" />
              <div className="bg-stone-400 rounded-lg" />
            </div>
            <div className="bg-stone-400 rounded-lg opacity-20" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 p-4 text-center">
              <span className="text-3xl sm:text-4xl font-black tracking-tight
                               text-amber-400 group-hover:scale-110 transition-transform duration-300">
                +{totalAssetsCount}
              </span>
              <span className="text-[9px] sm:text-xs font-bold tracking-widest uppercase mt-1 text-stone-300">
                Resources
              </span>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 h-[38px] hidden sm:block" aria-hidden="true" />
        </div>
      </div>

      {/* Fullscreen Popup Modal */}
      {fullscreenItem && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md transition-all duration-300 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setFullscreenItem(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-200 outline-none"
            onClick={() => setFullscreenItem(null)}
          >
            <span className="text-xl font-bold block leading-none">✕</span>
          </button>

          <div
            className="relative max-w-4xl w-full flex flex-col items-center gap-4 sm:gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] max-h-[70vh] w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center p-6 shadow-2xl">
              <img
                src={fullscreenItem.url}
                alt={fullscreenItem.name}
                className="max-h-full max-w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] select-none"
              />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-white text-xl sm:text-3xl font-black tracking-tight leading-none">
                {fullscreenItem.name}
              </h3>
              <p className="text-stone-400 text-xs sm:text-sm font-semibold tracking-widest uppercase">
                Real Database Resource
              </p>
            </div>

            <button
              onClick={() => {
                setFullscreenItem(null);
                setActiveList(null);
                navigate(`/coustom-product-tshirt/${currentProduct}`);
              }}
              className="mt-2 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm tracking-wide uppercase px-8 py-3.5 rounded-xl shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all duration-200"
            >
              <span>Customize with this item</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Collection List Modal */}
      {activeList && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setActiveList(null)}
        >
          <div
            className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200/50 dark:border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white">
                  {activeList.title}
                </h3>
                <p className="text-[11px] text-stone-400 font-semibold tracking-wide mt-0.5">
                  Showing {activeList.items.length} items from database
                </p>
              </div>
              <button
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                onClick={() => setActiveList(null)}
              >
                <span className="text-lg font-bold block leading-none">✕</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeList.items.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-stone-400 text-sm font-medium">No items found in this database collection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {activeList.items.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setFullscreenItem(item)}
                      className="group cursor-pointer aspect-square rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-250/20 hover:border-amber-400/50 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-stone-500 dark:text-stone-300 group-hover:text-amber-600 text-center truncate w-full">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const CollectionCard = ({ item, delay, onImageClick, onCardClick }) => {
  const ref = useFadeInUp(delay);
 
  return (
    <div ref={ref} className="group shrink-0 w-[220px] snap-start sm:w-auto flex flex-col">
      <div className="aspect-[4/3] w-full bg-stone-100 rounded-2xl overflow-hidden p-2
                      grid grid-cols-2 gap-2
                      border border-stone-200/30 shadow-sm
                      transition-all duration-300 ease-out
                      group-hover:scale-[1.02] group-hover:shadow-lg group-hover:shadow-stone-200">
        <div className="grid grid-rows-2 gap-2">
          {[0, 1].map(n => (
            <div
              key={n}
              onClick={(e) => {
                if (item.images[n]) {
                  e.stopPropagation();
                  onImageClick(item.images[n], item.titles?.[n] || item.title);
                }
              }}
              className={`bg-stone-200/50 rounded-lg overflow-hidden flex items-center justify-center ${item.images[n] ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
              {item.images[n] ? (
                <img src={item.images[n]} alt="" className="w-full h-full object-cover mix-blend-normal
                                                             transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <span className="text-[9px] text-stone-300 font-bold uppercase tracking-wider">Empty</span>
              )}
            </div>
          ))}
        </div>
        <div
          onClick={(e) => {
            if (item.images[2]) {
              e.stopPropagation();
              onImageClick(item.images[2], item.titles?.[2] || item.title);
            }
          }}
          className={`bg-stone-200/50 rounded-lg overflow-hidden flex items-center justify-center ${item.images[2] ? 'cursor-pointer hover:opacity-80' : ''}`}
        >
          {item.images[2] ? (
            <img src={item.images[2]} alt="" className="w-full h-full object-cover mix-blend-normal
                                                         transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <span className="text-[9px] text-stone-300 font-bold uppercase tracking-wider">Empty</span>
          )}
        </div>
      </div>
      <div className="mt-3 sm:mt-4 px-0.5 cursor-pointer" onClick={onCardClick}>
        <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-tight
                       group-hover:text-amber-800 transition-colors duration-200 flex items-center gap-1">
          {item.title}
          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600" />
        </h3>
        <p className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5 font-semibold tracking-wide">
          {item.count}
        </p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   HERO BANNER
══════════════════════════════════════════ */
const CustomBanner = () => {
  const imgRef = useFadeInUp(0);
  const copyRef = useFadeInUp(100);
 const navigate = useNavigate();
  return (
    <div className="w-full">
      <section className="w-full bg-[#F4F4F4] py-10 sm:py-14 lg:py-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* image */}
          <div ref={imgRef} className="flex justify-center order-2 md:order-1">
            <div className="cs-bob relative w-full max-w-xs sm:max-w-sm md:max-w-none
                            transition-all duration-700 hover:-translate-y-2 hover:drop-shadow-2xl">
              <img
                src={BannerImage}
                alt="Customize your jersey"
                className="w-full h-auto object-contain drop-shadow-md"
              />
            </div>
          </div>

          {/* copy */}
          <div ref={copyRef} className="flex flex-col gap-4 sm:gap-5 order-1 md:order-2
                                         text-center md:text-left items-center md:items-start
                                         max-w-lg mx-auto md:mx-0">
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold
                            tracking-[0.18em] text-amber-700 uppercase
                            bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-full">
              <Sparkles className="w-2.5 h-2.5 cs-sparkle" /> Custom Jerseys
            </div>

            <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold
                            text-[#111111] leading-[1.12] tracking-tight">
              Customize Your Own<br className="hidden sm:block" />
              <span className="cs-shine-text"> Jersey</span> In Every Sport
            </h1>

            <p className="text-sm sm:text-base text-[#666] leading-relaxed font-light max-w-sm md:max-w-none">
              Legends wear their own design. Customize your team's jersey with your
              own colors and logos for a powerhouse look that rules the field.
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Redirecting...");
                navigate('/coustom-product-tshirt/half-sleeve');
              }}
              className="cs-cta group mt-1 relative z-10 pointer-events-auto flex items-center gap-2.5
             bg-[#936A3A] hover:bg-[#6D4F2B] text-white
             font-semibold text-sm sm:text-base
             px-7 py-3 sm:py-3.5 rounded-lg
             shadow-md hover:shadow-xl hover:shadow-amber-900/20
             hover:-translate-y-0.5
             transition-all duration-300 active:scale-95 cursor-pointer"
            >
              Let's Do It
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <CoustomProduct />
    </div>
  );
};

export default Coustom;