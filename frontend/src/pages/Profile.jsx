import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import  CartItem3DViewer  from '../components/CartItem3DViewer'; // Ensure correct relative path
import {
  User, Heart, ShoppingBag,Maximize2, MapPin, CreditCard,
  LogOut, CheckCircle, Camera, Menu, X, ChevronRight
} from 'lucide-react';
import OrderHistoryTab from '../components/OrderList';

/* ── Animation styles ─────────────────────────────────────────────────────── */
const styles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmerPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.7; }
  }

  .anim-fadeUp    { animation: fadeUp    0.45s cubic-bezier(.22,.68,0,1.1) both; }
  .anim-fadeIn    { animation: fadeIn    0.35s ease both; }
  .anim-slideLeft { animation: slideInLeft 0.4s cubic-bezier(.22,.68,0,1.1) both; }
  .anim-scaleIn   { animation: scaleIn   0.4s cubic-bezier(.22,.68,0,1.1) both; }

  .delay-100 { animation-delay: .10s; }
  .delay-150 { animation-delay: .15s; }
  .delay-200 { animation-delay: .20s; }
  .delay-250 { animation-delay: .25s; }
  .delay-300 { animation-delay: .30s; }
  .delay-400 { animation-delay: .40s; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition-duration: .01ms !important; }
  }
`;

/* ── Shared input class ───────────────────────────────────────────────────── */
const inputCls =
  'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A47A46]/20 focus:border-[#A47A46] transition-all text-sm';

/* ── Sidebar nav items ────────────────────────────────────────────────────── */
const sidebarItems = [
  { id: 'My Profile', label: 'My Profile', icon: User },
  { id: 'My Orders', label: 'My Orders', icon: ShoppingBag },
  { id: 'My Wishlist', label: 'My Wishlist', icon: Heart },
  { id: 'Address Book', label: 'Address Book', icon: MapPin },
  { id: 'Payment Methods', label: 'Payment Methods', icon: CreditCard },
];

/* ════════════════════════════════════════════════════════════════════════════ */
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('My Profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);   // mobile drawer
  const [contentKey, setContentKey] = useState(0);       // re-trigger content anim
  const { user, logout } = useAuth();
  const { orders: userOrders, getUserOrders } = useOrders();
  const { wishlist } = useWishlist();
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);
const [selected3DItem, setSelected3DItem] = useState(null);
  useEffect(() => {
    if (activeTab === 'My Orders') {
      getUserOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    const key = user?.email ? `profile_img_${user.email}` : 'profile_image';
    const saved = localStorage.getItem(key);
    if (saved) setProfileImage(saved);
  }, [user?.email]);

  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || 'User',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    address: 'Kingston, 5236, United State',
    phone: '+1 234 567 8900',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(p => ({ ...p, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      const key = user?.email ? `profile_img_${user.email}` : 'profile_image';
      localStorage.setItem(key, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success('Profile saved successfully!');
  };

  const formatDate = (ds) =>
    new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const switchTab = (id) => {
    setActiveTab(id);
    setContentKey(k => k + 1);
    setSidebarOpen(false);
  };

  /* ── Tab content renderer ─────────────────────────────────────────────── */
  const renderContent = () => {
    switch (activeTab) {

      /* ─── My Profile ─────────────────────────────────────────────────── */
      case 'My Profile':
        return (
          <div className="space-y-6">
            <div className="anim-fadeUp">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Account Settings</h1>
              <p className="text-sm text-gray-500">Manage your account details and preferences</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

              {/* Avatar card */}
              <div className="anim-fadeUp delay-100 flex flex-col sm:flex-row sm:items-center gap-5 p-5 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="group relative w-20 h-20 rounded-full overflow-hidden cursor-pointer shadow-lg transition-transform hover:scale-105 select-none flex-shrink-0 self-center sm:self-auto"
                >
                  {profileImage
                    ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-[#A47A46] to-amber-600 flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  }
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">{user?.name || 'User'}</h3>
                  <p className="text-gray-500 text-sm">{user?.email || 'user@email.com'}</p>
                  <button type="button" onClick={() => fileInputRef.current.click()}
                    className="text-xs font-semibold text-[#A47A46] hover:text-amber-700 mt-1 underline underline-offset-2">
                    Change photo
                  </button>
                </div>
              </div>

              {/* Personal info */}
              <div className="anim-fadeUp delay-150 bg-white p-5 sm:p-7 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-5">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'First Name', name: 'firstName', type: 'text' },
                    { label: 'Last Name', name: 'lastName', type: 'text' },
                    { label: 'Phone', name: 'phone', type: 'tel' },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                      <input type={f.type} name={f.name} value={profileData[f.name]} onChange={handleProfileChange} className={inputCls} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" value={profileData.email} readOnly className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`} />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="anim-fadeUp delay-200 bg-white p-5 sm:p-7 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-5">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input type="password" name="currentPassword" placeholder="••••••••" value={profileData.currentPassword} onChange={handleProfileChange} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input type="password" name="newPassword" placeholder="••••••••" value={profileData.newPassword} onChange={handleProfileChange} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <input type="password" name="confirmPassword" placeholder="••••••••" value={profileData.confirmPassword} onChange={handleProfileChange} className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="anim-fadeUp delay-250 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
                <button type="button" onClick={logout}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm text-gray-500 hover:text-red-600 font-medium transition-colors rounded-xl hover:bg-red-50">
                  <LogOut size={16} /> Log Out
                </button>
                <button type="submit"
                  className="px-7 py-3 bg-gradient-to-r from-[#A47A46] to-amber-600 hover:from-[#8e673e] hover:to-amber-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        );

      /* ─── My Orders ──────────────────────────────────────────────────── */
case 'My Orders':
  return (
    <div className="space-y-5 relative">
      <OrderHistoryTab 
        userOrders={userOrders} 
        CartItem3DViewer={CartItem3DViewer} 
      />
    </div>
  );
      /* ─── My Wishlist ─────────────────────────────────────────────────── */
      case 'My Wishlist':
        return (
          <div className="space-y-5">
            <div className="anim-fadeUp">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">My Wishlist</h1>
              <p className="text-sm text-gray-500">Items you've saved for later</p>
            </div>

            {wishlist.length === 0 ? (
              <div className="anim-scaleIn flex flex-col items-center justify-center py-16 sm:py-24 bg-white rounded-2xl border border-gray-100 shadow-sm text-center px-4">
                <Heart size={56} className="text-gray-200 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Nothing saved yet</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs">Tap the heart on any product to save it here.</p>
                <button onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-gradient-to-r from-[#A47A46] to-amber-600 hover:from-[#8e673e] hover:to-amber-700 text-white font-semibold rounded-xl shadow-md transition-all text-sm">
                  Explore Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {wishlist.map((item, i) => (
                  <div key={item.id} className="anim-scaleIn hover:scale-[1.02] transition-transform"
                    style={{ animationDelay: `${i * 0.05}s` }}>
                    <ProductCard product={item} isWishlistItem />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      /* ─── Address Book ────────────────────────────────────────────────── */
      case 'Address Book':
        return (
          <div className="space-y-5">
            <div className="anim-fadeUp">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Address Book</h1>
              <p className="text-sm text-gray-500">Manage your shipping addresses</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="anim-fadeUp delay-100 bg-gradient-to-br from-[#A47A46]/5 to-amber-50 p-5 sm:p-6 rounded-2xl border-2 border-[#A47A46]/30 relative">
                <span className="absolute top-4 right-4 bg-[#A47A46] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Default
                </span>
                <h3 className="text-base font-semibold text-gray-900 mb-3">{profileData.firstName} {profileData.lastName}</h3>
                <p className="text-sm text-gray-600 mb-1">{profileData.address}</p>
                <p className="text-sm text-gray-600 mb-3">Kingston, 5236, United State</p>
                <p className="text-sm text-gray-700 font-medium">{profileData.phone}</p>
                <div className="flex gap-3 mt-5">
                  <button className="px-4 py-2 text-[#A47A46] font-semibold text-sm hover:bg-[#A47A46]/10 rounded-lg transition-colors">Edit</button>
                  <button className="px-4 py-2 text-gray-500 font-semibold text-sm hover:bg-gray-100 rounded-lg transition-colors">Delete</button>
                </div>
              </div>

              <div className="anim-fadeUp delay-200 bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#A47A46] hover:bg-[#A47A46]/5 transition-all min-h-[180px]">
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-gray-400">+</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Add New Address</h3>
                <p className="text-gray-400 text-sm">Add a shipping address</p>
              </div>
            </div>
          </div>
        );

      /* ─── Payment Methods ─────────────────────────────────────────────── */
      case 'Payment Methods':
        return (
          <div className="space-y-5">
            <div className="anim-fadeUp">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Payment Methods</h1>
              <p className="text-sm text-gray-500">Manage your saved payment options</p>
            </div>

            <div className="space-y-4 max-w-sm sm:max-w-none">
              {/* Card */}
              <div className="anim-scaleIn delay-100 bg-gradient-to-br from-gray-800 to-gray-900 p-5 sm:p-6 rounded-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
                <div className="flex justify-between items-start mb-7">
                  <CreditCard size={22} className="opacity-70" />
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Default</span>
                </div>
                <p className="text-lg sm:text-xl tracking-widest font-medium mb-6">•••• •••• •••• 4242</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Card Holder</p>
                    <p className="font-medium text-sm">{profileData.firstName} {profileData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Expires</p>
                    <p className="font-medium text-sm">12/29</p>
                  </div>
                </div>
              </div>

              {/* Add new */}
              <div className="anim-fadeUp delay-200 bg-white p-5 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#A47A46] hover:bg-[#A47A46]/5 transition-all">
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-gray-400">+</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Add Payment Method</h3>
                <p className="text-gray-400 text-sm">Credit or debit card</p>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{styles}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/20 to-gray-100 font-sans antialiased">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-6 sm:py-10">

          {/* ── Mobile tab bar (xs–md) ──────────────────────────────────── */}
          <div className="lg:hidden mb-4">
            {/* Hamburger header */}
            <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#A47A46]/30 flex-shrink-0">
                  {profileImage
                    ? <img src={profileImage} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-[#A47A46] to-amber-600 flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activeTab}</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* ── Mobile drawer overlay ───────────────────────────────────── */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm anim-fadeIn" onClick={() => setSidebarOpen(false)} />
              {/* Drawer */}
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl anim-slideLeft flex flex-col">
                {/* Header */}
                <div className="p-5 bg-gradient-to-br from-[#A47A46] to-amber-600 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold uppercase tracking-widest opacity-70">Menu</span>
                    <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0">
                      {profileImage
                        ? <img src={profileImage} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-lg font-bold">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-white/70 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                  {sidebarItems.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => switchTab(id)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all
                        ${activeTab === id
                          ? 'bg-[#A47A46]/10 text-[#A47A46] font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
                    >
                      <span className="flex items-center gap-3"><Icon size={18} />{label}</span>
                      {activeTab === id && <ChevronRight size={14} className="text-[#A47A46]" />}
                    </button>
                  ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-gray-100">
                  <button onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 font-medium transition-colors">
                    <LogOut size={18} /> Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Desktop two-column layout ───────────────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

            {/* Sidebar (lg+) */}
            <aside className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
              <div className="sticky top-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden anim-slideLeft">
                {/* User info */}
                <div className="p-6 bg-gradient-to-br from-[#A47A46] to-amber-600 text-white text-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 mx-auto mb-3 shadow-md">
                    {profileImage
                      ? <img src={profileImage} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    }
                  </div>
                  <h2 className="font-bold text-base leading-tight">{user?.name || 'User'}</h2>
                  <p className="text-white/70 text-xs mt-1 break-all">{user?.email}</p>
                </div>

                {/* Nav */}
                <nav className="p-3 space-y-1">
                  {sidebarItems.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => switchTab(id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all
                        ${activeTab === id
                          ? 'bg-gradient-to-r from-[#A47A46]/10 to-amber-100 text-[#A47A46] font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
                    >
                      <Icon size={18} />{label}
                    </button>
                  ))}
                </nav>

                <div className="p-3 border-t border-gray-100">
                  <button onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 font-medium transition-colors">
                    <LogOut size={18} /> Log Out
                  </button>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <main key={contentKey} className="flex-1 min-w-0">
              {renderContent()}
            </main>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProfilePage;