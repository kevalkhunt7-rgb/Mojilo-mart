import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function CustomCursor() {
  const location = useLocation();
  const isCustomizerPage = location.pathname.includes('coustom-product-tshirt');

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pingRef = useRef(null);

  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const hoverType = useRef('none');
  const isDown = useRef(false);
  const enabled = useRef(false);

  useEffect(() => {
    if (isCustomizerPage) {
      document.body.classList.remove('pin-thread-active');
      return;
    }

    const finePointer = window.matchMedia('(pointer: fine)');

    const setEnabled = (matches) => {
      enabled.current = matches;
      if (matches && !isCustomizerPage) {
        document.body.classList.add('pin-thread-active');
      } else {
        document.body.classList.remove('pin-thread-active');
      }
    };

    setEnabled(finePointer.matches);

    const handlePointerChange = (e) => setEnabled(e.matches);
    finePointer.addEventListener('change', handlePointerChange);

    const HOVER_SELECTOR = 'a, button, input, select, textarea, [role="button"], .cursor-pointer';

    const updatePosition = (e) => {
      if (!enabled.current) return;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleMouseDown = (e) => {
      if (!enabled.current) return;
      isDown.current = true;
      spawnPing(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      isDown.current = false;
    };

    const handleMouseOver = (e) => {
      if (!enabled.current) return;
      const genericEl = e.target.closest(HOVER_SELECTOR);
      if (genericEl) {
        hoverType.current = 'button';
      } else {
        hoverType.current = 'none';
      }
      applyHoverClasses();
    };

    const applyHoverClasses = () => {
      const type = hoverType.current;
      if (ringRef.current) {
        ringRef.current.classList.toggle('is-hover', type === 'button');
      }
      if (dotRef.current) {
        dotRef.current.classList.toggle('is-active', type !== 'none');
      }
    };

    function spawnPing(x, y) {
      const el = pingRef.current;
      if (!el || !enabled.current) return;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.classList.remove('ping-active');
      void el.offsetWidth;
      el.classList.add('ping-active');
    }

    window.addEventListener('mousemove', updatePosition, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver, { passive: true });

    let raf;
    const loop = () => {
      if (!enabled.current) {
        raf = requestAnimationFrame(loop);
        return;
      }

      const target = mouse.current;
      const r = ring.current;

      const ease = 0.2;
      r.x += (target.x - r.x) * ease;
      r.y += (target.y - r.y) * ease;

      const pinch = isDown.current ? 0.85 : hoverType.current === 'button' ? 1.3 : 1;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%) scale(${
          isDown.current ? 1.4 : hoverType.current !== 'none' ? 0.6 : 1
        })`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${r.x}px, ${r.y}px, 0) translate(-50%, -50%) scale(${pinch})`;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.body.classList.remove('pin-thread-active');
      finePointer.removeEventListener('change', handlePointerChange);
    };
  }, [isCustomizerPage]);

  if (isCustomizerPage) {
    return null;
  }

  return (
    <>
      <style>{`
        body.pin-thread-active, body.pin-thread-active * { cursor: none !important; }
        
        @media (pointer: coarse), (hover: none) {
          body, body * { cursor: auto !important; }
          .pt-dot, .pt-ring, .pt-ping {
            display: none !important;
          }
        }

        .pt-dot, .pt-ring, .pt-ping {
          position: fixed; top: 0; left: 0; pointer-events: none; z-index: 2147483647;
        }
        .pt-dot {
          width: 20px; height: 20px; border-radius: 50%;
          background: #8C6534;
          transition: background-color .2s ease, transform .08s ease-out;
          will-change: transform;
        }
        .pt-ring {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1.5px solid #8C6534;
          transition: transform .05s linear, border-color .2s ease, background-color .2s ease;
          will-change: transform;
        }
        .pt-ring.is-hover {
          border-color: #997241;
          background-color: rgba(153, 114, 65, 0.08);
        }
        .pt-ping {
          width: 24px; height: 24px; border-radius: 50%;
          border: 1.5px solid #997241;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.5);
          pointer-events: none;
        }
        .pt-ping.ping-active {
          animation: ptPingAnim 0.4s ease-out forwards;
        }
        @keyframes ptPingAnim {
          0% { opacity: 0.8; transform: translate(-50%, -50%) scale(0.5); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2.2); }
        }
      `}</style>
      <div ref={dotRef} className="pt-dot" />
      <div ref={ringRef} className="pt-ring" />
      <div ref={pingRef} className="pt-ping" />
    </>
  );
}

export default CustomCursor;
