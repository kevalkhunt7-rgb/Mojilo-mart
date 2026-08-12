import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import LogoForContactUs from '../assets/LogoForContactUs.png';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/validation';

/* ─── Inline keyframe styles ─────────────────────────────────────────────── */
const styles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes pulseRing {
    0%, 100% { opacity: 0.15; transform: scale(1);   }
    50%       { opacity: 0.30; transform: scale(1.08);}
  }
  @keyframes fieldSlide {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .anim-fadeUp   { animation: fadeUp   0.55s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-fadeIn   { animation: fadeIn   0.45s ease both; }
  .anim-slideLeft{ animation: slideInLeft 0.55s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-fieldSlide{ animation: fieldSlide 0.35s ease both; }

  .delay-100 { animation-delay: 0.10s; }
  .delay-200 { animation-delay: 0.20s; }
  .delay-300 { animation-delay: 0.30s; }
  .delay-400 { animation-delay: 0.40s; }
  .delay-500 { animation-delay: 0.50s; }
  .delay-600 { animation-delay: 0.60s; }

  .shimmer-btn {
    background: linear-gradient(
      105deg,
      #a47a4c 0%,
      #c9a06c 40%,
      #a47a4c 60%,
      #8e673e 100%
    );
    background-size: 200% auto;
    transition: background-position 0.4s ease, box-shadow 0.2s ease, transform 0.15s ease;
  }
  .shimmer-btn:hover {
    background-position: right center;
    box-shadow: 0 8px 28px rgba(164,122,76,0.35);
  }
  .shimmer-btn:active { transform: scale(0.985); }

  .pulse-ring {
    animation: pulseRing 3.5s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
`;

const AuthPage = () => {
  const navigate  = useNavigate();
  const { login, signup, verifyEmailOtp, googleLogin, isAuthenticated } = useAuth();

  const [viewMode, setViewMode] = useState('signup'); // 'signup', 'login', 'verify'
  const [error, setError]       = useState('');
  const [formKey, setFormKey]   = useState(0); 
  const [loading, setLoading]   = useState(false);
  const [otpCode, setOtpCode]   = useState('');
  const [authForm, setAuthForm] = useState({ name: '', identifier: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) navigate('/my-profile');
  }, [isAuthenticated, navigate]);

  const switchMode = (mode) => {
    setViewMode(mode);
    setError('');
    setOtpCode('');
    setAuthForm({ name: '', identifier: '', password: '' });
    setFormKey(k => k + 1); 
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailTrimmed = (authForm.identifier || '').trim();
    if (!isValidEmail(emailTrimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    
    try {
      if (viewMode === 'signup') {
        const result = await signup(authForm.name, emailTrimmed, authForm.password);
        toast.success(result.message || 'OTP verification sent to your email.');
        setViewMode('verify');
        setFormKey(k => k + 1);
      } else if (viewMode === 'verify') {
        const result = await verifyEmailOtp(emailTrimmed, otpCode);
        toast.success(result.message || 'Email verified successfully! You can now log in.');
        switchMode('login');
      } else {
        await login(emailTrimmed, authForm.password);
        toast.success('Welcome back to Mojilo!');
        navigate('/my-profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google login failed. Credential not received.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await googleLogin(credentialResponse.credential);
      toast.success('Signed in with Google successfully!');
      navigate('/my-profile');
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful or closed.');
  };

  const inputClass =
    'w-full bg-slate-50/60 border border-slate-200 focus:bg-white rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#a47a4c] focus:ring-4 focus:ring-[#a47a4c]/8 transition-all duration-200';

  return (
    <>
      <style>{styles}</style>

      <div className="min-h-screen bg-[#f6f4f1] font-sans text-slate-800 flex items-center justify-center p-4 sm:p-6 md:p-10 antialiased">

        {/* ── Card ─────────────────────────────────────────────────────────── */}
        <div className="
          anim-fadeUp
          w-full max-w-5xl bg-white
          rounded-2xl sm:rounded-[2rem]
          border border-slate-100
          shadow-[0_32px_80px_rgba(0,0,0,0.07)]
          grid grid-cols-1 lg:grid-cols-12
          overflow-hidden
          min-h-[auto] lg:min-h-[640px]
        ">

          {/* ── LEFT: Brand panel ──────────────────────────────────────────── */}
          <div className="
            lg:col-span-5
            bg-[#0d0d0d] text-white
            p-8 sm:p-10 md:p-12
            flex flex-col justify-between
            relative overflow-hidden
            border-b lg:border-b-0 lg:border-r border-slate-900
            min-h-[220px] sm:min-h-[260px]
          ">

            {/* Ambient orbs */}
            <div className="pulse-ring absolute top-[-60px] right-[-60px] w-72 h-72 rounded-full bg-[#a47a4c] pointer-events-none" />
            <div className="pulse-ring absolute bottom-[-80px] left-[-40px]  w-56 h-56 rounded-full bg-[#a47a4c] pointer-events-none delay-200" style={{ animationDelay:'1.2s' }} />

            {/* Brand content */}
            <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 py-2 lg:py-0 my-auto">
              <div className="anim-slideLeft">
                <img src={LogoForContactUs} alt="Mojilo Mart" className="w-36 sm:w-44 md:w-52 h-auto" />
              </div>
              <div className="anim-slideLeft delay-200 h-[2px] w-12 bg-[#a47a4c]" />
              <p className="anim-slideLeft delay-300 text-[#a47a4c] tracking-[0.4em] text-[10px] sm:text-xs font-bold uppercase">
                Style to Trend
              </p>
            </div>

            {/* Footer tagline */}
            <div className="relative z-10 hidden lg:block pt-8 border-t border-white/10 anim-fadeIn delay-500">
              <p className="text-xs text-slate-500 leading-relaxed">
                Join our collective to discover curated contemporary apparel tailored to your lifestyle.
              </p>
            </div>
          </div>

          {/* ── RIGHT: Form panel ──────────────────────────────────────────── */}
          <div className="
            lg:col-span-7
            flex flex-col justify-center
            p-6 sm:p-10 md:p-12 lg:p-16
            bg-white
          ">
            <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8">

              {/* Header */}
              <div className="anim-fadeUp delay-100 space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {viewMode === 'signup' ? 'Create an account' : viewMode === 'verify' ? 'Verify Email Address' : 'Welcome back'}
                </h2>
                <p className="text-sm text-slate-400 font-medium">
                  {viewMode === 'signup'
                    ? 'Fill in your details to get started.'
                    : viewMode === 'verify'
                    ? 'Enter the 6-digit OTP verification code sent to your email.'
                    : 'Sign in to continue to your account.'}
                </p>
              </div>

              {/* Mode toggle pills */}
              {viewMode !== 'verify' && (
                <div className="anim-fadeUp delay-200 flex bg-slate-100 rounded-xl p-1 gap-1">
                  {['signup', 'login'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => switchMode(mode)}
                      className={`
                        flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-250
                        ${viewMode === mode
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-400 hover:text-slate-600'}
                      `}
                    >
                      {mode === 'signup' ? 'Sign Up' : 'Log In'}
                    </button>
                  ))}
                </div>
              )}

              {/* Form */}
              <form key={formKey} onSubmit={handleFormSubmit} className="space-y-4">

                {error && (
                  <div className="anim-fieldSlide bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                {viewMode === 'signup' && (
                  <div className="anim-fieldSlide space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="John Doe"
                      value={authForm.name}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                )}

                {viewMode !== 'verify' ? (
                  <div className="anim-fieldSlide delay-100 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email</label>
                    <input
                      type="email"
                      name="identifier"
                      required
                      placeholder="name@example.com"
                      value={authForm.identifier}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                ) : (
                  <div className="anim-fieldSlide delay-100 space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verifying Email</label>
                    <input
                      type="text"
                      disabled
                      value={authForm.identifier}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-500 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                )}

                {viewMode === 'verify' && (
                  <div className="anim-fieldSlide space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verification OTP</label>
                    <input
                      type="text"
                      name="otp"
                      required
                      maxLength="6"
                      placeholder="6-digit OTP code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className={inputClass}
                    />
                  </div>
                )}

                {viewMode !== 'verify' && (
                  <div className="anim-fieldSlide delay-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                      {viewMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => toast('OTP-based reset will trigger password recovery.', { icon: '🔑' })}
                          className="text-xs font-bold text-[#a47a4c] hover:text-[#8e673e] transition-colors"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                )}

                {/* CTA buttons */}
                <div className="anim-fieldSlide delay-300 pt-2 space-y-3">
                  <button type="submit" disabled={loading} className="shimmer-btn w-full text-white font-bold text-sm py-4 rounded-xl tracking-wider uppercase disabled:opacity-50">
                    {loading ? 'Processing...' : (viewMode === 'signup' ? 'Create Account' : viewMode === 'verify' ? 'Verify OTP' : 'Sign In')}
                  </button>

                  {viewMode === 'verify' && (
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="w-full bg-white border border-slate-200 hover:bg-slate-50 active:scale-[0.985] text-slate-600 font-bold text-xs sm:text-sm py-3.5 rounded-xl transition-all duration-200 text-center uppercase tracking-wider"
                    >
                      Back to Sign Up
                    </button>
                  )}

                  {viewMode !== 'verify' && (
                    <div className="pt-2 space-y-3">
                      <div className="relative w-full flex items-center justify-center my-1">
                        <div className="border-t border-slate-200 w-full" />
                        <span className="bg-white px-3 text-[11px] uppercase font-bold text-slate-400 shrink-0">OR</span>
                        <div className="border-t border-slate-200 w-full" />
                      </div>
                      <div className="w-full flex justify-center">
                        {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here' ? (
                          <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                            theme="outline"
                            size="large"
                            width="360"
                            text={viewMode === 'signup' ? 'signup_with' : 'signin_with'}
                            shape="rectangular"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => toast('To test Google Login, add your Google OAuth Client ID to VITE_GOOGLE_CLIENT_ID in frontend/.env', { icon: '🔑', duration: 5000 })}
                            className="w-full bg-white border border-slate-200 hover:bg-slate-50 active:scale-[0.985] text-slate-600 font-bold text-xs sm:text-sm py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
                          >
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.772 5.772 0 0 1 8.2 12.74a5.772 5.772 0 0 1 5.79-5.773c1.498 0 2.86.516 3.944 1.516l3.051-3.051C19.102 3.655 16.71 2.7 13.99 2.7 8.528 2.7 4.1 7.128 4.1 12.59c0 5.461 4.428 9.89 9.89 9.89 6.014 0 9.855-4.226 9.855-10.034 0-.629-.055-1.22-.165-1.78l-11.44-.38z"/>
                            </svg>
                            <span className="uppercase tracking-wider">Continue with Google</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </form>

              {/* Footer switch */}
              {viewMode !== 'verify' && (
                <div className="anim-fadeIn delay-400 pt-4 border-t border-slate-100 text-center text-sm font-medium text-slate-400">
                  {viewMode === 'signup' ? (
                    <>
                      Already have an account?{' '}
                      <button type="button" onClick={() => switchMode('login')}
                        className="text-slate-800 hover:text-[#a47a4c] font-bold underline underline-offset-4 ml-1 transition-colors">
                        Log In
                      </button>
                    </>
                  ) : (
                    <>
                      New here?{' '}
                      <button type="button" onClick={() => switchMode('signup')}
                        className="text-slate-800 hover:text-[#a47a4c] font-bold underline underline-offset-4 ml-1 transition-colors">
                        Create Account
                      </button>
                    </>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default AuthPage;