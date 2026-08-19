import React, { useEffect, useRef, useState } from "react";
import { Home, Scissors, Shirt as ShirtIcon, Sparkles } from "lucide-react";
import logo from '../assets/LogoForContactUs.png';

/**
 * MaintenancePage
 * -----------------------------------------------------------------------
 * Dark Mode luxury aesthetic for an apparel / custom tailoring storefront.
 * Features an authentic garment hang-tag card, ambient atelier lighting,
 * and an improved vector t-shirt illustration with precise seamlines.
 */
export default function MaintenancePage({ onBackHome, brandName = "StitchLab" }) {
  const [progress, setProgress] = useState(64);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    if (document.getElementById("maint-fonts")) return;
    const link = document.createElement("link");
    link.id = "maint-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500;1,9..144,600&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    if (mq.matches) {
      setProgress(64);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = (now - start) / 1000;
      const value = 54 + 38 * Math.sin(t / 2.6);
      setProgress(value);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleBackHome = () => {
    if (onBackHome) return onBackHome();
    window.location.href = "/";
  };

  const pct = Math.round(progress);

  return (
    <div className="maint-page relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center px-5 py-16 sm:py-20">
      <style>{CSS}</style>

      {/* Dark fabric weave background & ambient neon glow blobs */}
      <div className="maint-weave absolute inset-0" aria-hidden="true" />
      <div className="blob blob-a" aria-hidden="true" />
      <div className="blob blob-b" aria-hidden="true" />
      <div className="blob blob-c" aria-hidden="true" />

      {/* Floating atelier particles */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
      </div>

      {/* Brand mark */}
      <div
        className="stitch-in relative z-10 mb-8 flex items-center gap-2 text-[13px] tracking-[0.28em] uppercase font-mono-tag"
        style={{ animationDelay: "0.05s", color: "var(--gold)" }}
      >
        <Scissors size={14} strokeWidth={2} />
        <div  className="flex justify-start lg:justify-center" onClick={() => setActiveTab('Home')}>
          <img
            src={logo}
            alt="Mojilo"
            className="h-7 sm:h-8 w-auto transition-opacity duration-200 hover:opacity-80 max-w-[160px] object-contain"
            onError={(e) => { e.target.src = logo; }}
          />
        </div>
        {/* <span>{brandName}</span> */}
         
      </div>

      {/* Hang-tag string + metallic eyelet string loop */}
      <svg
        className="stitch-in relative z-10 -mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
        style={{ animationDelay: "0.15s" }}
        width="46"
        height="34"
        viewBox="0 0 46 34"
        aria-hidden="true"
      >
        <path
          d="M23 32 C23 22, 8 22, 8 12 C8 5, 16 3, 23 8 C30 3, 38 5, 38 12 C38 22, 23 22, 23 32"
          fill="none"
          stroke="var(--tag-edge)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* The hang-tag card */}
      <div
        className="tag-swing stitch-in relative z-10 w-full max-w-[480px]"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="tag-card relative rounded-[28px] px-7 py-10 sm:px-11 sm:py-12 text-center backdrop-blur-md">
          {/* Punched grommet / metallic hole */}
          <div className="tag-hole absolute left-1/2 -top-3.5 -translate-x-1/2" />

          {/* Status Badge */}
          <div
            className="stitch-in inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 mb-8"
            style={{
              animationDelay: "0.3s",
              borderColor: "rgba(255, 255, 255, 0.08)",
              background: "rgba(18, 18, 22, 0.65)",
            }}
          >
            <span className="status-dot" />
            <span
              className="font-mono-tag text-[11px] tracking-[0.18em] uppercase"
              style={{ color: "var(--ink-muted)" }}
            >
              Status &middot; Under Maintenance
            </span>
          </div>

          {/* Improved T-shirt illustration */}
          <div
            className="stitch-in relative mx-auto mb-8 h-[175px] w-[175px] sm:h-[195px] sm:w-[195px]"
            style={{ animationDelay: "0.4s" }}
          >
            <ShirtIllustration />
          </div>

          {/* Heading */}
          <h1
            className="stitch-in font-display text-[2.1rem] leading-[1.12] sm:text-[2.5rem] mb-3"
            style={{ animationDelay: "0.5s", color: "var(--ink)" }}
          >
            We&rsquo;ll Be Back Soon!
          </h1>

          {/* Subtitle */}
          <p
            className="stitch-in mx-auto mb-9 max-w-[360px] text-[14px] sm:text-[15px] leading-relaxed"
            style={{ animationDelay: "0.6s", color: "var(--ink-muted)" }}
          >
            We&rsquo;re currently stitching up new features and refining your custom experience. Our storefront will return shortly.
          </p>

          {/* Progress bar */}
          <div className="stitch-in mb-9" style={{ animationDelay: "0.7s" }}>
            <div className="mb-2.5 flex items-center justify-between px-1">
              <span
                className="font-mono-tag text-[10px] tracking-[0.16em] uppercase"
                style={{ color: "var(--ink-muted)" }}
              >
                Tailoring progress
              </span>
              <span
                className="font-mono-tag text-[11px] font-bold tracking-[0.16em]"
                style={{ color: "var(--gold)" }}
              >
                {pct}%
              </span>
            </div>
            <div className="progress-track relative h-[10px] w-full overflow-hidden rounded-full p-[1.5px]">
              <div
                className="progress-fill h-full rounded-full relative"
                style={{ width: `${pct}%` }}
              >
                <div className="progress-sheen absolute inset-0" />
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            
            className="btn-home stitch-in group relative inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-3.5 text-[14px] font-semibold tracking-wide"
            style={{ animationDelay: "0.8s" }}
          >
            <Home size={16} strokeWidth={2.25} className="btn-home-icon" />
            Come Back Soon..
          </button>
        </div>
      </div>

      {/* Thank you note */}
      <p
        className="stitch-in relative z-10 mt-8 text-[13px] tracking-wide"
        style={{ animationDelay: "0.95s", color: "var(--ink-muted)" }}
      >
        Thank you for your patience <span className="heartbeat inline-block">✨</span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Refined T-Shirt SVG with realistic drape, collar & seam stitching  */
/* ------------------------------------------------------------------ */
function ShirtIllustration() {
  return (
    <div className="shirt-float relative h-full w-full">
      <svg viewBox="0 0 240 240" className="h-full w-full" fill="none" aria-hidden="true">
        <defs>
          {/* Subtle garment gradient */}
          <linearGradient id="garmentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22222B" />
            <stop offset="50%" stopColor="#1B1B22" />
            <stop offset="100%" stopColor="#141418" />
          </linearGradient>

          {/* Neon stitch glow */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#38BDF8" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Ambient shadow underneath garment */}
        <ellipse cx="120" cy="226" rx="60" ry="8" fill="#000000" opacity="0.4" />

        {/* Base T-Shirt Body */}
        <path
          d="M84,38 L100,24 Q120,44 140,24 L156,38 L206,70 L180,102 L164,92 L164,204 Q120,218 76,204 L76,92 L60,102 L34,70 Z"
          fill="url(#garmentGrad)"
          stroke="#2E2E3A"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Animated Neon Stitched Seam */}
        <path
          className="stitch-path"
          d="M84,38 L100,24 Q120,44 140,24 L156,38 L206,70 L180,102 L164,92 L164,204 Q120,218 76,204 L76,92 L60,102 L34,70 Z"
          stroke="var(--neon-thread)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#neonGlow)"
        />

        {/* Sleeve Crease & Seam Accents */}
        <path d="M60,102 L76,92" stroke="#2E2E3A" strokeWidth="2" strokeLinecap="round" />
        <path d="M180,102 L164,92" stroke="#2E2E3A" strokeWidth="2" strokeLinecap="round" />
        <path d="M78,88 L64,48" stroke="#2E2E3A" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        <path d="M162,88 L176,48" stroke="#2E2E3A" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

        {/* Ribbed Crewneck Collar */}
        <path
          d="M100,24 Q120,44 140,24 Q120,34 100,24 Z"
          fill="#16161B"
          stroke="var(--gold)"
          strokeWidth="1.5"
          opacity="0.8"
        />
        <path
          d="M102,28 Q120,47 138,28"
          stroke="var(--gold)"
          strokeWidth="1.5"
          strokeDasharray="2.5 2.5"
          strokeLinecap="round"
        />

        {/* Pocket / Custom Canvas Target */}
        <rect
          x="100"
          y="98"
          width="40"
          height="34"
          rx="6"
          fill="#16161B"
          stroke="var(--thread)"
          strokeWidth="1.8"
          strokeDasharray="4 3"
        />
        <g className="pocket-spark">
          <Sparkles x="112" y="107" width="16" height="16" color="var(--gold)" strokeWidth={2} />
        </g>

        {/* Bottom Hem Stitching */}
        <path
          d="M80,196 Q120,210 160,196"
          stroke="#2E2E3A"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      </svg>

      {/* Gold Snipping Scissors Accent */}
      <div className="scissors-snip absolute -right-1 bottom-3 sm:bottom-5">
        <Scissors size={26} strokeWidth={2} color="var(--gold)" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Background Floating Particles                                      */
/* ------------------------------------------------------------------ */
const PARTICLES = [
  { icon: "shirt", top: "12%", left: "8%", size: 30, duration: 9, delay: 0, rot: -14 },
  { icon: "scissors", top: "72%", left: "9%", size: 24, duration: 10.5, delay: 1.1, rot: 18 },
  { icon: "spool", top: "18%", left: "88%", size: 26, duration: 8.5, delay: 0.5, rot: 0 },
  { icon: "swatch", top: "76%", left: "86%", size: 36, duration: 11, delay: 1.8, rot: 10 },
  { icon: "swatch", top: "46%", left: "4%", size: 20, duration: 7.5, delay: 1.4, rot: -20 },
  { icon: "plus", top: "88%", left: "42%", size: 14, duration: 6, delay: 0.3, rot: 0 },
  { icon: "plus", top: "8%", left: "46%", size: 12, duration: 6.5, delay: 0.9, rot: 0 },
  { icon: "spool", top: "58%", left: "93%", size: 18, duration: 9.5, delay: 2.1, rot: 0 },
  { icon: "shirt", top: "84%", left: "65%", size: 22, duration: 8, delay: 1.6, rot: 16 },
];

function Particle({ icon, top, left, size, duration, delay, rot }) {
  const style = {
    top,
    left,
    width: size,
    height: size,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    "--rot": `${rot}deg`,
  };
  return (
    <div className="particle absolute" style={style}>
      {icon === "shirt" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--neon-thread)" strokeWidth="1.5">
          <path d="M8,4 L9.6,3 Q12,4.6 14.4,3 L16,4 L20,7.4 L17.4,9.6 L16.6,9 L16.6,20.5 Q12,22 7.4,20.5 L7.4,9 L6.6,9.6 L4,7.4 Z" />
        </svg>
      )}
      {icon === "scissors" && <Scissors width="100%" height="100%" color="var(--gold)" strokeWidth={1.5} />}
      {icon === "spool" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
          <path d="M6 8l12 8M6 16l12-8" strokeWidth="1" opacity="0.6" />
        </svg>
      )}
      {icon === "swatch" && (
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="var(--thread)" opacity="0.12" stroke="var(--thread)" strokeWidth="1.4" />
        </svg>
      )}
      {icon === "plus" && (
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--tag-edge)" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dark Theme CSS System                                              */
/* ------------------------------------------------------------------ */
const CSS = `
.maint-page {
  --canvas: #0C0C0F;
  --tag: #17171C;
  --tag-edge: #2E2E38;
  --ink: #F2F1F8;
  --ink-muted: #8E8C9B;
  --thread: #EF4444;
  --neon-thread: #38BDF8;
  --gold: #EAB308;
  --sage: #10B981;
  background: var(--canvas);
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  color: var(--ink);
}

.maint-page .font-display {
  font-family: 'Fraunces', Georgia, serif;
  font-style: italic;
  font-weight: 500;
}
.maint-page .font-mono-tag {
  font-family: 'Space Mono', ui-monospace, monospace;
}

/* Dark cloth weave pattern */
.maint-weave {
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.6;
}

/* Ambient glow orbs */
.blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(100px);
  opacity: 0.18;
  z-index: 0;
  pointer-events: none;
}
.blob-a {
  width: 440px; height: 440px;
  top: -140px; left: -120px;
  background: #38BDF8;
  animation: blob-drift 20s ease-in-out infinite;
}
.blob-b {
  width: 400px; height: 400px;
  bottom: -150px; right: -120px;
  background: #EF4444;
  animation: blob-drift 24s ease-in-out infinite reverse;
}
.blob-c {
  width: 320px; height: 320px;
  top: 40%; left: 50%;
  transform: translate(-50%, -50%);
  background: #EAB308;
  opacity: 0.07;
}

@keyframes blob-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -24px) scale(1.1); }
}

.particle {
  opacity: 0.35;
  animation-name: particle-float;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
@keyframes particle-float {
  0%, 100% { transform: translateY(0) rotate(var(--rot)); }
  50% { transform: translateY(-18px) rotate(calc(var(--rot) + 6deg)); }
}

/* Hang tag card */
.tag-card {
  background: linear-gradient(180deg, #1C1C23 0%, #15151A 100%);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 
    0 35px 70px -20px rgba(0, 0, 0, 0.75),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 1px 0 rgba(255, 255, 255, 0.12) inset;
}

.tag-hole {
  width: 22px; height: 22px;
  border-radius: 9999px;
  background: #0C0C0F;
  border: 2px solid #3F3F4E;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.9) inset, 0 1px 0 rgba(255, 255, 255, 0.1);
}

.tag-swing {
  transform-origin: 50% 0%;
  animation: tag-swing 6.5s ease-in-out infinite;
}
@keyframes tag-swing {
  0%, 100% { transform: rotate(-1.2deg); }
  50% { transform: rotate(1.2deg); }
}

.status-dot {
  width: 8px; height: 8px;
  border-radius: 9999px;
  background: var(--thread);
  animation: pulse-glow 2.2s ease-in-out infinite;
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  50% { box-shadow: 0 0 0 7px rgba(239, 68, 68, 0); }
}

.shirt-float {
  animation: shirt-float 5.5s ease-in-out infinite;
}
@keyframes shirt-float {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
}

.stitch-path {
  stroke-dasharray: 4 3;
  animation: stitch-march 1.8s linear infinite;
}
@keyframes stitch-march {
  to { stroke-dashoffset: -28; }
}

.pocket-spark {
  animation: pocket-blink 2.4s ease-in-out infinite;
  transform-origin: center;
}
@keyframes pocket-blink {
  0%, 100% { opacity: 0.4; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.08); }
}

.scissors-snip {
  animation: snip 2.8s ease-in-out infinite;
  transform-origin: 70% 30%;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
}
@keyframes snip {
  0%, 20%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(-16deg); }
}

/* Progress track */
.progress-track {
  background: #111116;
  border: 1px dashed rgba(255, 255, 255, 0.12);
}
.progress-fill {
  background: linear-gradient(90deg, #38BDF8, #EAB308, #EF4444);
  transition: width 0.35s ease-out;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.35);
}
.progress-sheen {
  background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.7) 50%, transparent 80%);
  background-size: 200% 100%;
  animation: sheen-sweep 2.4s linear infinite;
  mix-blend-mode: overlay;
}
@keyframes sheen-sweep {
  0% { background-position: 150% 0; }
  100% { background-position: -150% 0; }
}

/* Primary Action Button */
.btn-home {
  color: #0C0C0F;
  background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.8) inset;
  transition: transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s ease, filter 0.28s ease;
}
.btn-home:hover {
  background: #FFFFFF;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 12px 28px -8px rgba(56, 189, 248, 0.45);
}
.btn-home:active {
  transform: translateY(0) scale(0.99);
}
.btn-home-icon {
  transition: transform 0.28s ease;
}
.btn-home:hover .btn-home-icon {
  transform: translateX(-2px) rotate(-10deg);
}
.btn-home:focus-visible {
  outline: 2px solid var(--neon-thread);
  outline-offset: 3px;
}

.heartbeat {
  animation: heartbeat 2s ease-in-out infinite;
}
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.stitch-in {
  opacity: 0;
  animation: stitch-in 0.75s cubic-bezier(.22,1,.36,1) forwards;
}
@keyframes stitch-in {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .maint-page *, .maint-page *::before, .maint-page *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
  .stitch-in { opacity: 1; transform: none; }
}
`;