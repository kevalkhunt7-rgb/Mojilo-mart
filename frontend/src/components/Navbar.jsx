import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Star, ShoppingBag, Menu, X, ArrowRight, LogOut } from 'lucide-react';
import logo from '../assets/Logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen]     = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab]       = useState('Home');
  const [searchQuery, setSearchQuery]   = useState('');
  const [scrolled, setScrolled]         = useState(false);
  const searchInputRef                  = useRef(null);
  const navigate                        = useNavigate();

  const { wishlist }                          = useWishlist();
  const { cartCount }                         = useCart();
  const { user, logout, isAuthenticated }     = useAuth();

  const navLinks = [
    { name: 'Home',       href: '/' },
    { name: 'New Offers', href: '/new-offers' },
    { name: 'Man',        href: '/collection?Gender=Man' },
    { name: 'Woman',      href: '/collection?Gender=Woman' },
    { name: 'Unisex',     href: '/collection?Gender=Unisex' },
    { name: 'Custom',     href: '/custom' },
    { name: 'Contact Us', href: '/contact-us' },
  ];

  const categories = [
    { name: 'Man',    href: '/collection?Gender=Man' },
    { name: 'Woman',  href: '/collection?Gender=Woman' },
    { name: 'Unisex', href: '/collection?Gender=Unisex' },
  ];

  const subCategories = [
    'T-Shirts', 'Oversized T-Shirts', 'Hoodies',
    'Sweatshirts', 'Jerseys', 'Long Sleeve T-Shirts',
  ];

  // ── Scroll shadow ──────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Auto-focus search ──────────────────────────────────────
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current)
      searchInputRef.current.focus();
  }, [isSearchOpen]);

  // ── Lock body scroll when drawer / search open ─────────────
  useEffect(() => {
    document.body.style.overflow = (isMenuOpen || isSearchOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen, isSearchOpen]);

  // ── Sync active tab ────────────────────────────────────────
  useEffect(() => {
    const path     = window.location.pathname;
    const hash     = window.location.hash;
    const gender   = new URLSearchParams(window.location.search).get('Gender');
    const category = new URLSearchParams(window.location.search).get('Category');

    const match    = navLinks.find((l) => {
      if (l.href.startsWith('#')) return l.href === hash;
      
      if (l.href.includes('Gender=')) {
        const u = new URL(l.href, window.location.origin);
        return u.pathname === path && u.searchParams.get('Gender') === gender;
      }

      if (l.href.includes('Category=')) {
        const u = new URL(l.href, window.location.origin);
        return u.pathname === path && u.searchParams.get('Category') === category;
      }

      return l.href === path;
    });

    setActiveTab(match ? match.name : path === '/' ? 'Home' : '');
  }, [window.location.search, window.location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchOpen(false);
    navigate(`/collection?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  const handleCategoryClick = (href) => { setIsSearchOpen(false); navigate(href); setSearchQuery(''); };
  const handleSubCategoryClick = (s)  => { setIsSearchOpen(false); navigate(`/collection?SubCategory=${encodeURIComponent(s)}`); setSearchQuery(''); };
  const handleLogout = () => { logout(); navigate('/'); };

  // ── Shared icon-button style ───────────────────────────────
  const iconBtn = 'relative text-gray-700 hover:text-[#A47A46] transition-colors duration-200 cursor-pointer p-1 rounded-lg hover:bg-amber-50/60';

  return (
    <header
      className={`
        w-full font-sans select-none sticky top-0 z-50 bg-white
        transition-shadow duration-300
        ${scrolled ? 'shadow-[0_2px_16px_rgba(0,0,0,0.08)]' : ''}
      `}
    >

      {/* ── TOP BANNER ─────────────────────────────────────────── */}
      <div className="bg-[#A47A46] text-white text-center py-1.5 text-[9px] sm:text-[10px] font-semibold tracking-[0.18em] uppercase px-4 truncate">
        Express Yourself in Every Outfit
      </div>

      {/* ── MAIN NAVBAR ────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-3 sm:py-3.5 flex items-center justify-between lg:grid lg:grid-cols-3 border-b border-gray-100/80">

        {/* LEFT — hamburger (mobile) | nav links (desktop) */}
        <div className="flex items-center">

          {/* Hamburger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden text-gray-700 hover:text-[#A47A46] p-1 -ml-1 cursor-pointer transition-colors rounded-lg hover:bg-amber-50/60"
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setActiveTab(link.name)}
                className={`
                  relative text-[13px] xl:text-[14px] font-semibold whitespace-nowrap
                  transition-colors duration-200 pb-0.5
                  after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#A47A46]
                  after:transition-all after:duration-300
                  ${activeTab === link.name
                    ? 'text-[#A47A46] after:w-full'
                    : 'text-gray-800 hover:text-[#A47A46] after:w-0 hover:after:w-full'
                  }
                `}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* CENTER — Logo */}
        <Link to="/" className="flex justify-start lg:justify-center" onClick={() => setActiveTab('Home')}>
          <img
            src={logo}
            alt="Mojilo"
            className="h-7 sm:h-8 w-auto transition-opacity duration-200 hover:opacity-80"
          />
        </Link>

        {/* RIGHT — action icons */}
        <div className="flex items-center justify-end gap-1 sm:gap-2">

          <button onClick={() => setIsSearchOpen(true)} className={iconBtn} aria-label="Search">
            <Search size={19} strokeWidth={1.5} />
          </button>

          <button onClick={() => navigate(isAuthenticated ? '/my-profile' : '/login')} className={iconBtn} aria-label="Account">
            <User size={19} strokeWidth={1.5} />
          </button>

          <button onClick={() => navigate('/my-wishlist')} className={iconBtn} aria-label="Wishlist">
            <Star size={19} strokeWidth={1.5} />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#A47A46] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold leading-none">
                {wishlist.length > 9 ? '9+' : wishlist.length}
              </span>
            )}
          </button>

          <button onClick={() => navigate('/cart')} className={iconBtn} aria-label="Cart">
            <ShoppingBag size={19} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#A47A46] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold leading-none">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* Login / Logout — desktop only */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-1.5 ml-2 border border-gray-200 hover:border-[#A47A46] rounded-xl px-4 py-1.5 text-[13px] font-semibold text-gray-800 hover:text-[#A47A46] transition-all duration-200 cursor-pointer"
            >
              <LogOut size={14} />
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="hidden lg:block ml-2 border border-gray-200 hover:border-[#A47A46] rounded-xl px-4 py-1.5 text-[13px] font-semibold text-gray-800 hover:text-[#A47A46] transition-all duration-200 cursor-pointer"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SEARCH OVERLAY
      ══════════════════════════════════════════════════════════ */}
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/40 z-[60]
          transition-opacity duration-300
          ${isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Panel */}
      <div
        className={`
          fixed top-0 left-0 right-0 z-[70]
          transform transition-transform duration-300 ease-out
          ${isSearchOpen ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        <div className="bg-white border-b border-gray-100 shadow-xl px-4 sm:px-8 py-5 max-w-3xl mx-auto sm:mt-4 sm:rounded-b-2xl">

          {/* Input row */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-5">
            <Search size={20} className="text-[#A47A46] shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              className="flex-1 text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </form>

          {/* Categories */}
          <div className="mb-4">
            <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-gray-400 mb-2.5">Shop by category</p>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.href)}
                  className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50 hover:bg-amber-50 rounded-xl text-[13px] font-semibold text-gray-800 hover:text-[#A47A46] border border-gray-100 transition-all cursor-pointer group"
                >
                  {cat.name}
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-[#A47A46] transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Sub-categories */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-gray-400 mb-2.5">Shop by subcategory</p>
            <div className="flex flex-wrap gap-1.5">
              {subCategories.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSubCategoryClick(s)}
                  className="text-[12px] font-semibold bg-gray-50 hover:bg-amber-50 text-gray-700 hover:text-[#A47A46] px-3 py-1.5 rounded-lg border border-gray-100 transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════════════════════ */}
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/40 z-[60] lg:hidden
          transition-opacity duration-300
          ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`
          fixed top-0 left-0 bottom-0 z-[70] lg:hidden
          w-[72vw] max-w-[300px] bg-white
          flex flex-col
          transform transition-transform duration-300 ease-out
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <img src={logo} alt="Mojilo" className="h-6 w-auto" />
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
          {navLinks.map((link, i) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => { setActiveTab(link.name); setIsMenuOpen(false); }}
              style={{ transitionDelay: isMenuOpen ? `${i * 35}ms` : '0ms' }}
              className={`
                flex items-center justify-between
                px-3.5 py-2.5 rounded-xl text-[15px] font-medium
                transition-all duration-200
                ${activeTab === link.name
                  ? 'text-[#A47A46] bg-amber-50 font-bold'
                  : 'text-gray-800 hover:text-[#A47A46] hover:bg-gray-50'
                }
              `}
            >
              <span>{link.name}</span>
              {activeTab === link.name && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#A47A46]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Drawer footer — auth */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-1">
          {!isAuthenticated ? (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#A47A46] transition-colors"
            >
              <User size={18} strokeWidth={1.5} />
              Login to your account
            </Link>
          ) : (
            <>
              <Link
                to="/my-profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#A47A46] transition-colors"
              >
                <User size={18} strokeWidth={1.5} />
                My Profile
              </Link>
              <button
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut size={18} strokeWidth={1.5} />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}