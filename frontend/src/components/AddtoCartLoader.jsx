import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Droplet,
  Type,
  Star,
  RotateCcw,
} from "lucide-react";


const LOADING_MESSAGES = [
  "Preparing your design...",
  "Applying customization...",
  "Adding to your cart...",
];

const ORBIT_ITEMS = [
  { Icon: Droplet, color: "#6366F1" },
  { Icon: Type, color: "#000000" },
  { Icon: Star, color: "#6366F1" },
  { swatch: true },
];

const RADIUS = 58;

/* ------------------------------------------------------------------ */
/*  T-shirt icon                                                       */
/* ------------------------------------------------------------------ */

function TShirtIcon({ className }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shirtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EEF0FF" />
        </linearGradient>
      </defs>
      <path
        d="M40 14 L18 30 L30 46 L38 40 V102 Q38 106 42 106 H78 Q82 106 82 102 V40 L90 46 L102 30 L80 14 Q73 22 60 22 Q47 22 40 14 Z"
        fill="url(#shirtGrad)"
        stroke="#000000"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M48 22 Q54 30 60 30 Q66 30 72 22"
        stroke="#6366F1"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Cycling status text                                                */
/* ------------------------------------------------------------------ */

function useMessageCycle(active, custom, interval = 1900) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active || custom) return;
    const id = setInterval(
      () => setIndex((v) => (v + 1) % LOADING_MESSAGES.length),
      interval
    );
    return () => clearInterval(id);
  }, [active, custom]);
  return custom || LOADING_MESSAGES[index];
}

/* ------------------------------------------------------------------ */
/*  Ambient floating particles                                         */
/* ------------------------------------------------------------------ */

function Particles({ count = 8, reduced }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 3 + Math.random() * 4,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
      })),
    [count]
  );

  if (reduced) return null;

  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-indigo-400 bg-opacity-30 blur-sm"
          style={{ left: `${p.left}%`, width: p.size, height: p.size, bottom: -10 }}
          animate={{ y: [0, -140], opacity: [0, 0.8, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Orbiting customization icons                                       */
/* ------------------------------------------------------------------ */

function OrbitRing({ reduced }) {
  return (
    <motion.div
      className="absolute inset-0"
      animate={reduced ? {} : { rotate: 360 }}
      transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
    >
      {ORBIT_ITEMS.map((item, i) => {
        const angle = (360 / ORBIT_ITEMS.length) * i;
        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `rotate(${angle}deg) translate(${RADIUS}px) rotate(${-angle}deg)`,
              marginTop: -14,
              marginLeft: -14,
            }}
          >
            <motion.div
              animate={reduced ? {} : { rotate: -360 }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
              className="w-7 h-7"
            >
              {item.swatch ? (
                <div className="w-7 h-7 rounded-full shadow-md bg-gradient-to-br from-indigo-500 to-green-500 border-2 border-white" />
              ) : (
                <div className="w-7 h-7 rounded-full shadow-md flex items-center justify-center bg-white border border-gray-100">
                  <item.Icon size={14} color={item.color} strokeWidth={2.5} />
                </div>
              )}
            </motion.div>
          </div>
        );
      })}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Processing scene                                                   */
/* ------------------------------------------------------------------ */

function ProcessingScene({ message, reduced }) {
  const text = useMessageCycle(true, message);

  return (
    <>
      <div className="relative w-40 h-40 mx-auto mb-6">
        <Particles reduced={reduced} />
        <OrbitRing reduced={reduced} />
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 600 }}>
          <motion.div
            style={{ transformStyle: "preserve-3d" }}
            animate={
              reduced
                ? { scale: [1, 1.03, 1] }
                : { rotateY: [0, 360], scale: [1, 1.04, 1] }
            }
            transition={{
              rotateY: { duration: 5, repeat: Infinity, ease: "linear" },
              scale: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <TShirtIcon className="w-16 h-16 drop-shadow-lg" />
          </motion.div>
        </div>
      </div>

      <div className="h-6 relative overflow-hidden mb-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={text}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="text-sm font-medium text-black text-center absolute inset-0"
          >
            {text}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="w-40 h-1.5 mx-auto rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          className="h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-300"
          animate={reduced ? { opacity: [0.5, 1, 0.5] } : { x: ["-120%", "340%"] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Success scene: glow -> fly into cart -> checkmark                  */
/* ------------------------------------------------------------------ */

function SuccessScene({ phase }) {
  return (
    <div className="relative w-40 h-28 mx-auto mb-6 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {phase !== "done" ? (
          <motion.div key="flying" className="relative w-full h-full flex items-center justify-center">
            <motion.div
              className="absolute"
              animate={
                phase === "glow"
                  ? {
                      scale: [1, 1.15, 1],
                      filter: [
                        "drop-shadow(0 0 0px #6366F1)",
                        "drop-shadow(0 0 20px #6366F1)",
                        "drop-shadow(0 0 0px #6366F1)",
                      ],
                    }
                  : { x: 70, y: -6, scale: 0.35, opacity: 0, rotate: 20 }
              }
              transition={
                phase === "glow"
                  ? { duration: 0.45 }
                  : { duration: 0.6, ease: "easeIn" }
              }
            >
              <TShirtIcon className="w-16 h-16" />
            </motion.div>

            <motion.div
              className="absolute right-0"
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: phase === "fly" ? 0 : 0.2 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center shadow-lg">
                <ShoppingCart size={22} color="#ffffff" />
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
          >
            <CheckCircle2 size={40} color="#ffffff" strokeWidth={2.5} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Error scene                                                        */
/* ------------------------------------------------------------------ */

function ErrorScene({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5"
      >
        <AlertTriangle size={34} color="#EF4444" strokeWidth={2.2} />
      </motion.div>
      <p className="text-base font-semibold text-black mb-1">Something went wrong</p>
      <p className="text-sm text-gray-500 mb-6 text-center">
        {message || "We couldn't add your design to the cart."}
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-sm font-medium shadow-md"
      >
        <RotateCcw size={15} />
        Try again
      </motion.button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main reusable component                                            */
/* ------------------------------------------------------------------ */

/**
 * AddToCartLoader
 *
 * Props:
 *  - isLoading  boolean  request is in flight
 *  - isSuccess  boolean  request succeeded (drives glow -> fly -> checkmark)
 *  - isError    boolean  request failed
 *  - message    string   optional status/error text override
 *  - onRetry    fn       called when the user taps "Try again" in the error state
 */
export function AddToCartLoader({ isLoading, isSuccess, isError, message, onRetry }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState("processing"); // processing | glow | fly | done
  const timers = useRef([]);
  const prevSuccess = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    if (isSuccess && !prevSuccess.current) {
      clearTimers();
      if (reduced) {
        setPhase("done");
      } else {
        setPhase("glow");
        timers.current.push(setTimeout(() => setPhase("fly"), 500));
        timers.current.push(setTimeout(() => setPhase("done"), 1150));
      }
    }
    if (!isSuccess) setPhase("processing");
    prevSuccess.current = isSuccess;
    return clearTimers;
  }, [isSuccess, reduced, clearTimers]);

  const open = isLoading || isSuccess || isError;

  // Lock page scroll / interaction while the overlay is visible
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="alertdialog"
          aria-live="polite"
          aria-busy={isLoading}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm rounded-3xl bg-white bg-opacity-80 backdrop-blur-xl border border-gray-100 shadow-2xl px-8 py-10"
          >
            {isError ? (
              <ErrorScene message={message} onRetry={onRetry} />
            ) : isSuccess ? (
              <>
                <SuccessScene phase={reduced ? "done" : phase} />
                <AnimatePresence mode="wait">
                  {(phase === "done" || reduced) && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="text-base font-semibold text-black text-center"
                    >
                      Added to Cart!
                    </motion.p>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <ProcessingScene message={message} reduced={reduced} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo page                                                           */
/* ------------------------------------------------------------------ */

export default function Demo() {
  const [state, setState] = useState({ loading: false, success: false, error: false });
  const [forceError, setForceError] = useState(false);
  const minDuration = 2600;

  const handleAddToCart = useCallback(() => {
    if (state.loading) return; // prevent duplicate clicks
    setState({ loading: true, success: false, error: false });
    const start = Date.now();

    // simulate an API call
    setTimeout(() => {
      const elapsed = Date.now() - start;
      const wait = Math.max(0, minDuration - elapsed);
      setTimeout(() => {
        if (forceError) {
          setState({ loading: false, success: false, error: true });
        } else {
          setState((s) => ({ ...s, success: true }));
          setTimeout(() => setState({ loading: false, success: false, error: false }), 2600);
        }
      }, wait);
    }, 0);
  }, [state.loading, forceError]);

  const handleRetry = () => {
    setState({ loading: false, success: false, error: false });
    setTimeout(handleAddToCart, 50);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center mb-6">
            <TShirtIcon className="w-14 h-14" />
          </div>
          <h1 className="text-2xl font-semibold text-black mb-1 tracking-tight">
            Custom Tee — Midnight Indigo
          </h1>
          <p className="text-sm text-gray-500">100% cotton · Front print · Size M</p>
        </div>

        <label className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-4">
          <input
            type="checkbox"
            checked={forceError}
            onChange={(e) => setForceError(e.target.checked)}
          />
          Simulate a failed request
        </label>

        <motion.button
          whileHover={{ scale: state.loading ? 1 : 1.02 }}
          whileTap={{ scale: state.loading ? 1 : 0.98 }}
          disabled={state.loading}
          onClick={handleAddToCart}
          className="w-full py-3.5 rounded-full bg-black text-white text-sm font-semibold shadow-lg disabled:opacity-60"
        >
          {state.loading ? "Adding..." : "Add to Cart — $32.00"}
        </motion.button>
      </div>

      <AddToCartLoader
        isLoading={state.loading}
        isSuccess={state.success}
        isError={state.error}
        message={state.error ? "Your payment gateway timed out." : undefined}
        onRetry={handleRetry}
      />
    </div>
  );
}