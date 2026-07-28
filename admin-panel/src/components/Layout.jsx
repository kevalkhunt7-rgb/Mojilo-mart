import React, { useState } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'MA';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Sidebar navigation structure matching your image
  const navigationGroups = [
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Dashboard', path: '/', icon: <DashboardIcon /> },
        { name: 'Orders', path: '/orders', icon: <OrdersIcon /> },
        { name: 'Products', path: '/products', icon: <ProductsIcon /> },
        { name: 'Categories', path: '/categories', icon: <CategoriesIcon /> },
        { name: 'Variants', path: '/variants', icon: <VariantsIcon /> },
      ],
    },
    {
      title: 'DESIGN STUDIO',
      items: [
        { name: 'Banners', path: '/banners', icon: <LayoutsIcon /> },
        { name: 'Custom Designs', path: '/custom-designs', icon: <CustomDesignsIcon /> },
        { name: 'Cliparts', path: '/cliparts', icon: <ClipartsIcon /> },
        { name: 'Apparel Templates', path: '/apparel-templates', icon: <ApparelTemplatesIcon /> },
      ],
    },
    {
      title: 'CUSTOMERS',
      items: [
        { name: 'Customers', path: '/customers', icon: <CustomersIcon /> },
        { name: 'Reviews', path: '/reviews', icon: <ReviewsIcon /> },
      ],
    },
    {
      title: 'COMMERCE',
      items: [
        { name: 'Coupons', path: '/coupons', icon: <CouponsIcon /> },

        { name: 'Payments', path: '/payments', icon: <PaymentsIcon /> },
        { name: 'Refunds', path: '/refunds', icon: <RefundsIcon /> },
        // { name: 'Inventory', path: '/inventory', icon: <InventoryIcon /> },
      ],
    },
  ];

  // Helper function to check if breadcrumb title should update dynamically
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    const cleaned = path.replace('/', '');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-sans antialiased text-[#1e293b]">
      {/* --- SIDEBAR --- */}
      <aside className="w-[260px] bg-white border-r border-[#e2e8f0] flex flex-col fixed inset-y-0 left-0 z-20">
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#f1f5f9] gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#4f46e5] flex items-center justify-center shadow-sm">
            <LogoIcon />
          </div>
          <span className="font-semibold text-lg tracking-tight text-[#0f172a]">Mojilo</span>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7 scrollbar-thin">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              <h4 className="px-3 text-[10px] font-bold tracking-wider text-[#94a3b8] uppercase">
                {group.title}
              </h4>
              <ul className="space-y-0.5">
                {group.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                          ? 'bg-[#eef2ff] text-[#4f46e5]'
                          : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <span className={isActive ? 'text-[#4f46e5]' : 'text-[#94a3b8]'}>
                              {item.icon}
                            </span>
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#4f46e5]/10 text-[#4f46e5]' : 'bg-[#eef2ff] text-[#4f46e5]'
                                }`}
                            >
                              {item.badge}
                            </span>
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

        {/* Footer Admin Card */}
        <div className="p-4 border-t border-[#f1f5f9] bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-semibold text-xs shadow-inner">
                {getInitials(user?.name)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#0f172a]">{user?.name || 'Mohit Admin'}</span>
                <span className="text-[10px] text-[#64748b] truncate max-w-[120px]">{user?.email || 'admin@mojilo.com'}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN PAGE CONTENT WRAPPER --- */}
      <div className="flex-1 pl-[260px] flex flex-col min-h-screen">
        {/* --- NAVBAR --- */}
        <header className="h-16 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-8 sticky top-0 z-10">
          {/* Left Breadcrumb Nav */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#64748b]">
            <button className="p-1.5 -ml-1.5 rounded-md hover:bg-slate-50 text-slate-400 hover:text-slate-700">
              <MenuIcon />
            </button>
            <span className="text-[#94a3b8] ml-1">Mojilo</span>
            <span className="text-[#94a3b8]">/</span>
            <span className="text-[#0f172a] font-semibold">{getPageTitle()}</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Search Input Bar */}
            <div className="relative w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs outline-none transition-all duration-150 focus:border-[#4f46e5] focus:bg-white focus:ring-2 focus:ring-[#4f46e5]/10 text-[#0f172a] placeholder-[#94a3b8]"
              />
            </div>

            {/* Notification Bell Icon */}
            <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors relative">
              <BellIcon />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border border-white rounded-full" />
            </button>

            {/* Admin Profile Circle */}
            <div className="w-8 h-8 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-semibold text-xs cursor-pointer hover:opacity-90 transition-opacity">
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        {/* Dynamic Viewport Content */}
        <main className="flex-1 p-8 bg-[#f8fafc] overflow-y-auto">
          {/* React Router handles the specific page components here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

/* --- SVGs INLINED FOR ZERO IMPLEMENTATION FOOTPRINT --- */

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const OrdersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const ProductsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const CategoriesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const VariantsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const TemplatesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

const LayoutsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const CustomDesignsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </svg>
);

const ClipartsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const FontsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

const CustomersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ReviewsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CouponsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 5v2" />
    <path d="M15 11v2" />
    <path d="M15 17v2" />
    <path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
  </svg>
);

const ShippingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const PaymentsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const RefundsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M16 3h5v5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 21H3v-5" />
  </svg>
);

const InventoryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MenuIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ApparelTemplatesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
  </svg>
);

export default Layout;