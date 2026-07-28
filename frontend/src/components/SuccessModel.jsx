import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Check,
  Copy,
  Truck,
  Package,
  ShoppingBag,
  ArrowRight,
  Pause,
  Play,
  MapPin,
} from 'lucide-react';

/* ---------------------------------------------------------------------- */
/*  Global keyframes — injected once while the popup is mounted.           */
/*  All motion is wrapped in a reduced-motion guard so it degrades to a    */
/*  plain fade for anyone with that OS preference switched on.             */
/* ---------------------------------------------------------------------- */
const GLOBAL_STYLES = `
@keyframes opp-backdrop-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes opp-card-in {
  0%   { opacity: 0; transform: scale(.85) translateY(18px); }
  60%  { opacity: 1; transform: scale(1.02) translateY(-2px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes opp-ring-pulse {
  0%   { transform: scale(.6); opacity: .55; }
  70%  { opacity: 0; }
  100% { transform: scale(1.9); opacity: 0; }
}
@keyframes opp-check-pop {
  0%   { transform: scale(0); opacity: 0; }
  55%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes opp-draw {
  to { stroke-dashoffset: 0; }
}
@keyframes opp-rise {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes opp-confetti-fall {
  0%   { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(105vh) translateX(var(--drift)) rotate(var(--spin)); opacity: 0; }
}
@keyframes opp-bar-shrink {
  from { width: 100%; }
  to   { width: 0%; }
}
@media (prefers-reduced-motion: reduce) {
  .opp-anim-backdrop, .opp-anim-card, .opp-anim-ring, .opp-anim-check,
  .opp-anim-rise, .opp-confetti-piece, .opp-anim-bar {
    animation: opp-backdrop-in .01s linear forwards !important;
    transform: none !important;
  }
  .opp-anim-check circle, .opp-anim-check path { animation: none !important; stroke-dashoffset: 0 !important; }
}
`;

const CONFETTI_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9'];

function makeConfetti(count = 26) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 6 + Math.random() * 6,
    delay: Math.random() * 0.35,
    duration: 2.6 + Math.random() * 1.6,
    drift: `${(Math.random() - 0.5) * 120}px`,
    spin: `${(Math.random() - 0.5) * 540}deg`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round: Math.random() > 0.5,
  }));
}

const STEPS = ['Placed', 'Processing', 'Shipped', 'Delivered'];

/* ---------------------------------------------------------------------- */
/*  Main component                                                         */
/* ---------------------------------------------------------------------- */
export function OrderPlacedPopup({
  isOpen,
  onClose,
  orderNumber = 'MJ-2K91XQ',
  itemsCount = 3,
  totalAmount = 1499,
  estimatedDelivery,
  currentStep = 0,
  onTrackOrder,
  onContinueShopping,
  autoCloseMs = 8000,
}) {
  const [copied, setCopied] = useState(false);
  const [paused, setPaused] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [openKey, setOpenKey] = useState(0);
  const closeBtnRef = useRef(null);
  const copyTimeout = useRef(null);

  const delivery =
    estimatedDelivery ||
    new Date(Date.now() + 5 * 86400000).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

  // Reset the celebratory bits + focus the dialog every time it opens
  useEffect(() => {
    if (isOpen) {
      setConfetti(makeConfetti());
      setOpenKey((k) => k + 1);
      setPaused(false);
      const t = setTimeout(() => closeBtnRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Escape key closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => () => clearTimeout(copyTimeout.current), []);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — fail silently, button just won't confirm */
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="opp-title"
    >
      <style>{GLOBAL_STYLES}</style>

      {/* Backdrop */}
      <div
        className="opp-anim-backdrop absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        style={{ animation: 'opp-backdrop-in .25s ease-out forwards' }}
        onClick={onClose}
      />

      {/* Confetti layer */}
      <div className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
        {confetti.map((c) => (
          <span
            key={`${openKey}-${c.id}`}
            className="opp-confetti-piece absolute top-0"
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              borderRadius: c.round ? '9999px' : '2px',
              '--drift': c.drift,
              '--spin': c.spin,
              animation: `opp-confetti-fall ${c.duration}s ease-in ${c.delay}s forwards`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="opp-anim-card relative z-[60] w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        style={{ animation: 'opp-card-in .5s cubic-bezier(.22,1,.36,1) forwards' }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Close */}
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
        >
          <X size={15} />
        </button>

        {/* Celebration header */}
        <div className="relative pt-10 pb-6 px-6 flex flex-col items-center bg-gradient-to-b from-indigo-50/70 to-white">
          <div className="relative w-20 h-20 flex items-center justify-center mb-4">
            <span className="opp-anim-ring absolute inset-0 rounded-full border-2 border-emerald-400" style={{ animation: 'opp-ring-pulse 1.8s ease-out .15s infinite' }} />
            <span className="opp-anim-ring absolute inset-0 rounded-full border-2 border-emerald-300" style={{ animation: 'opp-ring-pulse 1.8s ease-out .55s infinite' }} />
            <div
              className="opp-anim-check relative w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
              style={{ animation: 'opp-check-pop .55s cubic-bezier(.22,1.4,.36,1) .1s both' }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4.5 4.5L19 7"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="28"
                  strokeDashoffset="28"
                  style={{ animation: 'opp-draw .45s ease-out .5s forwards' }}
                />
              </svg>
            </div>
          </div>

          <h2 id="opp-title" className="opp-anim-rise text-xl font-bold text-slate-800 tracking-tight" style={{ animation: 'opp-rise .4s ease-out .35s both' }}>
            Order placed successfully!
          </h2>
          <p className="opp-anim-rise text-xs text-slate-500 mt-1 text-center max-w-xs" style={{ animation: 'opp-rise .4s ease-out .45s both' }}>
            We've sent a confirmation to your email. Your items are already being prepped for print.
          </p>

          {/* Order number / copy */}
          <button
            onClick={handleCopy}
            className="opp-anim-rise mt-4 inline-flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group"
            style={{ animation: 'opp-rise .4s ease-out .55s both' }}
            title="Copy order number"
          >
            <span className="font-mono text-xs font-bold text-slate-700 tracking-wide">{orderNumber}</span>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
              {copied ? <Check size={11} /> : <Copy size={11} />}
            </span>
          </button>
          <span className={`text-[10px] font-semibold text-emerald-600 mt-1 transition-all duration-300 ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 h-0'}`}>
            Copied to clipboard
          </span>
        </div>

        {/* Stats */}
        <div className="opp-anim-rise grid grid-cols-3 gap-2 px-6 pt-2" style={{ animation: 'opp-rise .4s ease-out .6s both' }}>
          {[
            { label: 'Items', value: `${itemsCount}`, icon: ShoppingBag },
            { label: 'Total paid', value: `₹${totalAmount.toLocaleString('en-IN')}`, icon: Package },
            { label: 'Arrives by', value: delivery, icon: Truck },
          ].map(({ label, value, icon: Icon }, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100 hover:border-indigo-200 hover:bg-white transition-colors duration-300">
              <Icon size={14} className="mx-auto text-indigo-500 mb-1" />
              <p className="text-[9px] uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
              <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Fulfillment stepper */}
        <div className="opp-anim-rise px-6 pt-5" style={{ animation: 'opp-rise .4s ease-out .68s both' }}>
          <div className="flex items-center">
            {STEPS.map((step, i) => {
              const reached = i <= currentStep;
              const isLast = i === STEPS.length - 1;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 transition-colors duration-500 ${
                        reached
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-slate-200 text-slate-300'
                      } ${i === currentStep ? 'ring-4 ring-indigo-100' : ''}`}
                    >
                      {reached ? <Check size={10} /> : i + 1}
                    </div>
                    <span className={`text-[9px] font-semibold ${reached ? 'text-indigo-600' : 'text-slate-350 text-slate-400'}`}>{step}</span>
                  </div>
                  {!isLast && (
                    <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full overflow-hidden bg-slate-100">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-700 ease-out"
                        style={{ width: i < currentStep ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="opp-anim-rise px-6 pt-5 pb-5 space-y-2" style={{ animation: 'opp-rise .4s ease-out .75s both' }}>
          <button
            onClick={onTrackOrder}
            className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-indigo-600/25 active:scale-[0.98] group"
          >
            <MapPin size={13} />
            Track your order
            <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          <button
            onClick={onContinueShopping}
            className="w-full text-slate-500 hover:text-slate-800 text-xs font-semibold py-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Continue shopping
          </button>
        </div>

        {/* Auto-close bar */}
        {autoCloseMs ? (
          <div className="px-6 pb-4 flex items-center gap-2">
            <button
              onClick={() => setPaused((p) => !p)}
              className="w-5 h-5 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              title={paused ? 'Resume auto-close' : 'Pause auto-close'}
            >
              {paused ? <Play size={9} /> : <Pause size={9} />}
            </button>
            <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
              <div
                key={openKey}
                className="opp-anim-bar h-full bg-indigo-400/70 rounded-full"
                style={{
                  animation: `opp-bar-shrink ${autoCloseMs}ms linear forwards`,
                  animationPlayState: paused ? 'paused' : 'running',
                }}
                onAnimationEnd={() => !paused && onClose?.()}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default OrderPlacedPopup;