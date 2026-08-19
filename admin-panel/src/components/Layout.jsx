import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, NavLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { ShoppingBag, AlertTriangle, Package, AlertCircle, Info } from 'lucide-react';
import logo from "../assets/logo1.png"
import logo2 from "../assets/favicon.png"
/* ============================================================
   DESIGN TOKENS
   ============================================================ */
const tokens = {
  ink: '#29292b',        // sidebar base
  inkRaised: '#1c1e28',  // hovered rows in sidebar
  inkLine: '#2a2c38',    // sidebar hairlines
  accent: '#f0a339',     // amber — active states, focus, CTAs
  accentSoft: 'rgba(240,163,57,0.12)',
  canvas: '#f7f7f5',     // main content background
  surface: '#ffffff',
  line: '#e7e5e0',
  ink900: '#161616',
  ink600: '#5c5c58',
  ink400: '#9a9a94',
};

const darkTokens = {
  ink: '#1e2235',        // dark sidebar base (#282f4f)
  inkRaised: '#0f172a',  // hovered active rows
  inkLine: '#1e293b',    // sidebar hairlines
  accent: '#f59e0b',
  accentSoft: 'rgba(245,158,11,0.14)',
  canvas: '#020617',     // main content background (#020617)
  surface: '#0f172a',
  line: '#1e293b',
  ink900: '#f8fafc',
  ink600: '#cbd5e1',
  ink400: '#94a3b8',
};

const Layout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('admin_theme');
      if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
      return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    return 'light';
  });

  const isDark = theme === 'dark';
  const activeTokens = isDark ? darkTokens : tokens;
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const fetchOrderCount = async () => {
    try {
      const res = await api.get('/orders?limit=1');
      const total = res.data?.data?.pagination?.totalItems ?? res.data?.pagination?.totalItems ?? 0;
      setOrderCount(total);
    } catch (err) {
      console.error('Failed to fetch order count:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchOrderCount();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchOrderCount();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await api.patch(`/notifications/${notification._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error('Failed to mark notification read:', err);
      }
    }
    setNotifOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    localStorage.setItem('admin_theme', theme);
  }, [isDark, theme]);

  const toggleTheme = () => {
    setTheme((prev) => prev === 'dark' ? 'light' : 'dark');
  };

  const getInitials = (name) => {
    if (!name) return 'MA';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const navigationGroups = [
    {
      title: 'Operations',
      items: [
        { name: 'Dashboard', path: '/', icon: <DashboardIcon /> },
        { name: 'Orders', path: '/orders', icon: <OrdersIcon />, badge: orderCount > 0 ? orderCount : undefined },
        { name: 'Products', path: '/products', icon: <ProductsIcon /> },
        { name: 'Categories', path: '/categories', icon: <CategoriesIcon /> },
      ],
    },
    {
      title: 'Design Studio',
      items: [
        { name: 'Banners', path: '/banners', icon: <LayoutsIcon /> },
        { name: 'Custom Designs', path: '/custom-designs', icon: <CustomDesignsIcon /> },
        { name: 'Cliparts', path: '/cliparts', icon: <ClipartsIcon /> },
        { name: 'Apparel Templates', path: '/apparel-templates', icon: <ApparelTemplatesIcon /> },
      ],
    },
    {
      title: 'Customers',
      items: [
        { name: 'Customers', path: '/customers', icon: <CustomersIcon /> },
        { name: 'Reviews', path: '/reviews', icon: <ReviewsIcon /> },
      ],
    },
    {
      title: 'Commerce',
      items: [
        { name: 'Coupons', path: '/coupons', icon: <CouponsIcon /> },
        { name: 'Payments', path: '/payments', icon: <PaymentsIcon /> },
        { name: 'Refunds', path: '/refunds', icon: <RefundsIcon /> },
        { name: 'Cancellation Requests', path: '/cancellation-requests', icon: <CancellationIcon /> },
      ],
    },
    {
      title: 'System',
      items: [
        { name: 'Settings', path: '/settings', icon: <SettingsIcon /> },
      ],
    },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    const cleaned = path.replace('/', '').replace(/-/g, ' ');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  const sidebarWidth = collapsed ? 76 : 252;

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${isDark ? 'dark' : ''}`} style={{ background: activeTokens.canvas, color: activeTokens.ink900, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>

      {/* --- SIDEBAR --- */}
      <aside
        className="flex flex-col fixed inset-y-0 left-0 z-20 transition-[width,background-color] duration-200 ease-out"
        style={{ width: sidebarWidth, background: activeTokens.ink, borderRight: `1px solid ${activeTokens.inkLine}` }}
      >
        {/* Brand Logo Header */}
        <div
          className="h-16 flex items-center px-5 gap-2.5 shrink-0"
          style={{ borderBottom: `1px solid ${activeTokens.inkLine}` }}
        >
         
          {!collapsed ? (
            <Link to="/" className="flex justify-start lg:justify-center" onClick={() => setActiveTab('Home')}>
              <img
                src={logo}
                alt="Mojilo"
                className="h-7 sm:h-8 w-auto transition-all duration-300 hover:opacity-90  drop-shadow-[8px_0_8px_rgba(250,180,90,0.3)] hover:drop-shadow-[0_0_12px_rgba(243,166,56,0.9)]"
              />
            </Link>
          ) : (<img
                src={logo2}
                alt="Mojilo"
                className="h-7 sm:h-8 w-auto transition-all duration-300 hover:opacity-90  drop-shadow-[8px_0_8px_rgba(250,180,90,0.3)] hover:drop-shadow-[0_0_12px_rgba(243,166,56,0.9)]"
              />)}
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6 sidebar-scroll">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!collapsed && (
                <h4
                  className="px-3 mb-1.5 text-[10.5px] font-semibold tracking-[0.08em] uppercase"
                  style={{ color: activeTokens.ink400 }}
                >
                  {group.title}
                </h4>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors duration-100`
                      }
                      style={({ isActive }) => ({
                        color: isActive ? '#ffffff' : '#a7a8b3',
                        background: isActive ? activeTokens.inkRaised : 'transparent',
                      })}
                      title={collapsed ? item.name : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {/* active indicator */}
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-150"
                            style={{
                              height: isActive ? '60%' : '0%',
                              background: activeTokens.accent,
                            }}
                          />
                          <span
                            className="shrink-0 transition-colors duration-100"
                            style={{ color: isActive ? activeTokens.accent : '#75767f' }}
                          >
                            {item.icon}
                          </span>
                          {!collapsed && (
                            <>
                              <span className="truncate">{item.name}</span>
                              {item.badge && (
                                <span
                                  className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none"
                                  style={{
                                    background: isActive ? activeTokens.accentSoft : 'rgba(255,255,255,0.06)',
                                    color: isActive ? activeTokens.accent : '#8c8d97',
                                  }}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="mx-3 mb-2 flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-medium transition-colors"
          style={{ color: '#75767f', border: `1px solid ${activeTokens.inkLine}` }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#75767f')}
        >
          <CollapseIcon flipped={collapsed} />
          {!collapsed && 'Collapse'}
        </button>

        {/* Footer Admin Card */}
        <div className="p-3 shrink-0" style={{ borderTop: `1px solid ${activeTokens.inkLine}` }}>
          <div className="flex items-center gap-3 px-1">
            <div
              className="w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-[11px] shrink-0"
              style={{ background: activeTokens.accent }}
            >
              {getInitials(user?.name)}
            </div>
            {!collapsed && (
              <>
                <div className="flex flex-col min-w-0">
                  <span className="text-[12.5px] font-semibold text-white truncate">{user?.name || 'Mohit Admin'}</span>
                  <span className="text-[11px] truncate" style={{ color: activeTokens.ink400 }}>{user?.email || 'admin@mojilo.com'}</span>
                </div>
                <button
                  onClick={logout}
                  className="ml-auto p-1.5 rounded-md transition-colors shrink-0"
                  style={{ color: activeTokens.ink400 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = activeTokens.ink400; e.currentTarget.style.background = 'transparent'; }}
                  title="Log out"
                >
                  <LogoutIcon />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* --- MAIN PAGE CONTENT WRAPPER --- */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-[padding] duration-200 ease-out"
        style={{ paddingLeft: sidebarWidth }}
      >
        {/* --- NAVBAR --- */}
        <header
          className="h-16  flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm transition-colors duration-200"
          style={{ background: isDark ? 'rgb(30, 34, 53)' : 'rgb(41, 41, 43)', borderBottom: `1px solid ${activeTokens.line}` }}
        >
          {/* Left Breadcrumb Nav */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-medium text-white" >Mojilo</span>
            <span className="text-[11px]" style={{ color: activeTokens.line }}>/</span>
            <span className="text-[14px] font-semibold text-white" >{getPageTitle()}</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-white hover:text-black transition-colors cursor-pointer"

              onMouseEnter={(e) => (e.currentTarget.style.background = activeTokens.canvas)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="p-2 rounded-lg text-white hover:text-black transition-colors relative cursor-pointer"
                onMouseEnter={(e) => (e.currentTarget.style.background = activeTokens.canvas)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                title="Notifications"
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white leading-none flex items-center justify-center min-w-[16px]"
                    style={{ background: '#ef4444', boxShadow: `0 0 0 2px ${activeTokens.surface}` }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl overflow-hidden shadow-2xl z-50 text-left animate-in fade-in zoom-in-95 duration-100"
                  style={{ background: activeTokens.surface, border: `1px solid ${activeTokens.line}` }}
                >
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${activeTokens.line}` }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold" style={{ color: activeTokens.ink900 }}>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-500">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] font-medium text-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearAll}
                          className="text-[11px] font-medium text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="py-1 max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const timeAgo = formatTimeAgo(n.createdAt);
                        return (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors ${
                              !n.isRead ? 'bg-amber-500/5' : ''
                            }`}
                            onMouseEnter={(e) => (e.currentTarget.style.background = activeTokens.canvas)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = !n.isRead ? 'rgba(245,158,11,0.05)' : 'transparent')}
                          >
                            <div className="mt-0.5 shrink-0">
                              {getNotifIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-[12.5px] truncate ${!n.isRead ? 'font-bold' : 'font-medium'}`} style={{ color: activeTokens.ink900 }}>
                                  {n.title}
                                </span>
                                <span className="text-[10px] shrink-0" style={{ color: activeTokens.ink400 }}>
                                  {timeAgo}
                                </span>
                              </div>
                              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                {n.message}
                              </p>
                            </div>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-[11px] transition-opacity hover:opacity-90 cursor-pointer"
                style={{ background: activeTokens.accent }}
              >
                {getInitials(user?.name)}
              </button>
              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden shadow-lg py-1"
                  style={{ background: activeTokens.surface, border: `1px solid ${activeTokens.line}` }}
                >
                  <div className="px-3.5 py-2.5" style={{ borderBottom: `1px solid ${activeTokens.line}` }}>
                    <p className="text-[12.5px] font-semibold truncate" style={{ color: activeTokens.ink900 }}>{user?.name || 'Mohit Admin'}</p>
                    <p className="text-[11px] truncate" style={{ color: activeTokens.ink400 }}>{user?.email || 'admin@mojilo.com'}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3.5 py-2 text-[12.5px] font-medium flex items-center gap-2 transition-colors cursor-pointer"
                    style={{ color: '#ef4444' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogoutIcon /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Viewport Content */}
        <main className="flex-1 p-7">
          <Outlet />
        </main>
      </div>

      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 5px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: ${activeTokens.inkLine}; border-radius: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
};

/* --- SVGs --- */

const LogoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14151c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const CollapseIcon = ({ flipped }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: flipped ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
    <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
  </svg>
);

const DashboardIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

const OrdersIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const ProductsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const CategoriesIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const LayoutsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const CustomDesignsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </svg>
);

const ClipartsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);

const CustomersIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ReviewsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CouponsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 5v2" /><path d="M15 11v2" /><path d="M15 17v2" />
    <path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
  </svg>
);

const PaymentsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const RefundsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M16 3h5v5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 21H3v-5" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 0 0 12 21a9 9 0 0 1 9-8.21z" />
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ApparelTemplatesIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
  </svg>
);

const CancellationIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

const getNotifIcon = (type) => {
  switch (type) {
    case 'order_placed':
      return <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"><ShoppingBag size={14} /></div>;
    case 'cancellation_requested':
      return <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500"><AlertTriangle size={14} /></div>;
    case 'order_update':
      return <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500"><Package size={14} /></div>;
    case 'stock_alert':
      return <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500"><AlertCircle size={14} /></div>;
    default:
      return <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500"><Info size={14} /></div>;
  }
};

export default Layout;