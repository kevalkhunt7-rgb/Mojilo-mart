import React from 'react'
import { Toaster } from 'react-hot-toast'
import { Routes, Route, Outlet } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import NewOffers from './pages/NewOffers'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Collection from './pages/Collection'
import ScrollToTop from './components/ScollToTop'
import ContactUs from './pages/ContactUs'
import AboutUs from './pages/AboutUs'
import Custom from './pages/Custom'
import ProductDetails from './pages/ProductDetails'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import Cart from './pages/Cart'
import CheckOut from './pages/CheckOut'
import OrderDetail from './pages/OrderDetail'
import NotFound from './pages/NotFound'
import CoustomProductTshirt from './pages/CoustomProductTshirt'
import ProtectedRoute from './components/ProtectedRoute'
import CustomCursor from './components/CustomCursor'
import MaintenanceMode from './pages/MaintenanceMode'

// Context Providers
import { WishlistProvider } from './context/WishlistContext'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext' 
import { OrdersProvider } from './context/OrdersContext' 
import { CanvasProvider } from './context/CanvasContext' 
import { SettingsProvider, useSettings } from './context/SettingsContext'

// Redux Imports
import { Provider } from 'react-redux'
import { store } from './store' 

// Main layout that includes Navbar and Footer
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <Outlet /> {/* Child routes render here */}
      <Footer />
      <CustomCursor /> {/* Custom cursor component */}
    </>
  )
}

// Inner routes content that checks maintenance mode
const AppContent = () => {
  const { settings } = useSettings();

  if (settings?.maintenanceMode) {
    return <MaintenanceMode brandName={settings?.storeName || 'Mojilo'} />;
  }

  return (
    <Routes>
      {/* Routes with Navbar & Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/new-offers" element={<NewOffers />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/custom" element={<Custom />} />
        <Route path="/product-details/:id" element={<ProductDetails />} />
        <Route path="/my-profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> 
        <Route path="/order/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/my-wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/*" element={<NotFound />} />
      </Route>

      {/* Route WITHOUT Navbar & Footer */}
      <Route 
        path="/coustom-product-tshirt/:apparelId" 
        element={
          <>
            <ScrollToTop />
            <CoustomProductTshirt />
          </>
        } 
      />
    </Routes>
  );
};

const App = () => {
  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden relative bg-white">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#f1f5f9',
            fontSize: '13px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            duration: 4000,
          },
        }}
      />
      <Provider store={store}>
        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
              <WishlistProvider>
                <OrdersProvider> 
                  <CanvasProvider>
                    <AppContent />
                  </CanvasProvider>
                </OrdersProvider> 
              </WishlistProvider>
            </CartProvider>
          </SettingsProvider>
        </AuthProvider>
      </Provider>
    </div>
  )
}

export default App;