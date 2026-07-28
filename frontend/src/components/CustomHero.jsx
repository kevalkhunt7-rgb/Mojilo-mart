import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCustomizerStore } from '../store/useCustomizerStore';

// Image asset imports
import CoustomImg1 from '../assets/CoustomImg1.png';
import CoustomImg2 from '../assets/CoustomImg2.png';
import CoustomImg3 from '../assets/CoustomImg3.png';
import CoustomImg4 from '../assets/CoustomImg4.png';
import CoustomImg5 from '../assets/sports-jersy.png'
import CoustomTshirt1 from '../assets/CoustomTshirt1.png';
import CoustomTshirt2 from '../assets/CoustomTshirt2.png';
import CoustomTshirt3 from '../assets/CoustomTshirt3.png';
import CoustomTshirt4 from '../assets/CoustomTshirt4.png';

const apparelDatabase = {
  'half-sleeve': { id: 'half-sleeve', name: 'Half Sleeve', modelImage: CoustomImg1, flatImage: CoustomTshirt1 },
  'long-sleeve': { id: 'long-sleeve', name: 'Long Sleeve', modelImage: CoustomImg2, flatImage: CoustomTshirt2 },
  'hoodie': { id: 'hoodie', name: 'Hoodie', modelImage: CoustomImg3, flatImage: CoustomTshirt3 },
  'oversized': { id: 'oversized', name: 'Oversized', modelImage: CoustomImg4, flatImage: CoustomTshirt4 },
  'sports-jersey': { id: 'sports-jersey', name: 'Sports Jersey', modelImage: CoustomImg5, flatImage: CoustomTshirt1 },
};

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

const CustomHero = () => {
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
    <>
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
      `}</style>

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
                    {selected && <Check key={item.id} className="cs-badge-pop w-2.5 h-2.5" strokeWidth={4} />}
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
    </>
  );
};

export default CustomHero;