import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const shakeTimeout = useRef(null);

  useEffect(() => {
    if (!loading && user && user.role === 'admin') {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(result.message);
      setShake(true);
      clearTimeout(shakeTimeout.current);
      shakeTimeout.current = setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] relative overflow-hidden px-4">
      {/* Toast configuration for light theme */}
      <ToastContainer theme="light" />

      {/* Premium ambient light backdrop */}
      <div className="absolute inset-0 login-grid pointer-events-none" />
      <div className="absolute inset-0 login-radial-glow pointer-events-none" />

      <div
        className={`relative w-full max-w-md login-card-enter ${shake ? 'login-shake' : ''}`}
      >
        <div className="bg-white/80 backdrop-blur-md border border-[#e4e4e7] rounded-2xl p-8 shadow-premium">
          {/* Subtle status line */}
          <div className="flex items-center gap-2 mb-6 font-mono text-[10px] tracking-widest text-[#71717a] font-medium">
            <span className="status-dot" />
            SECURE ACCESS SYSTEM
          </div>

          <h2 className="text-2xl font-semibold text-[#09090b] mb-1.5 tracking-tight">
            Control Panel
          </h2>
          <p className="text-sm text-[#71717a] mb-7">
            Enter your credentials to access management console
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-medium tracking-wide text-[#4a4a4e] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input w-full px-3.5 py-2.5 bg-white border border-[#e4e4e7] rounded-lg text-[#09090b] text-sm outline-none transition-all duration-200 placeholder-[#a1a1aa]"
                placeholder="name@company.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-medium tracking-wide text-[#4a4a4e]">
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input w-full px-3.5 py-2.5 bg-white border border-[#e4e4e7] rounded-lg text-[#09090b] text-sm outline-none transition-all duration-200 placeholder-[#a1a1aa]"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="login-btn relative w-full overflow-hidden bg-[#09090b] text-white font-medium text-sm py-2.5 rounded-lg transition-all duration-150 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <span className="spinner" />
                    Authenticating...
                  </>
                ) : (
                  'Continue'
                )}
              </span>
            </button>
          </form>
        </div>
      </div>

      <style>{`
        /* Minimal layout grid lines */
        .login-grid {
          background-image:
            linear-gradient(to right, #00000004 1px, transparent 1px),
            linear-gradient(to bottom, #00000004 1px, transparent 1px);
          background-size: 48px 48px;
        }
        /* Soft, high-end studio lighting glow */
        .login-radial-glow {
          background: radial-gradient(circle at 50% -20%, #f4f4f5 0%, #fafafa 70%);
        }

        /* Layered studio shadow effect */
        .shadow-premium {
          box-shadow: 
            0 0 0 1px rgba(0, 0, 0, 0.03),
            0 2px 4px rgba(0, 0, 0, 0.02),
            0 12px 32px rgba(0, 0, 0, 0.04);
        }

        /* Live status indicator pulse */
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #10b981;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          animation: pulse-dot 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-dot {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        /* Smooth smooth entry physics */
        .login-card-enter {
          animation: card-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes card-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Sophisticated subtle focus ring */
        .login-input {
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .login-input:focus {
          border-color: #09090b;
          box-shadow: 0 0 0 3px rgba(9, 9, 11, 0.06);
        }

        /* Elegant dark button shimmer effect */
        .login-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        .login-btn:hover:not(:disabled)::before { transform: translateX(100%); }
        .login-btn:hover:not(:disabled) { background: #18181b; }

        /* Crisp modern white loader */
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Error shake */
        .login-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-3px); }
          40%, 60% { transform: translateX(3px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-card-enter, .status-dot, .login-shake, .spinner { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;