import React from 'react'
import { Toaster } from 'react-hot-toast'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import NewOffers from './pages/NewOffers'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Collection from './pages/Collection'
import ScrollToTop from './components/ScollToTop'
import ContactUs from './pages/ContactUs'
import Custom from './pages/Custom'
import ProductDetails from './pages/ProductDetails'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import Cart from './pages/Cart'
import CheckOut from './pages/CheckOut'
import NotFound from './pages/NotFound'
import CoustomProductTshirt from './pages/CoustomProductTshirt'
import ProtectedRoute from './components/ProtectedRoute'

// Context Providers
import { WishlistProvider } from './context/WishlistContext'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext' 
import { OrdersProvider } from './context/OrdersContext' 
import { CanvasProvider } from './context/CanvasContext' 

// Redux Imports
import { Provider } from 'react-redux'
import { store } from './store' 

const App = () => {
  return (
    <>
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
          <CartProvider>
            <WishlistProvider>
              <OrdersProvider> 
                <CanvasProvider>
                  
                  <Navbar />
                  <ScrollToTop />
                  
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/new-offers" element={<NewOffers />} />
                    <Route path="/collection" element={<Collection />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="/custom" element={<Custom />} />
                    <Route path="/product-details/:id" element={<ProductDetails />} />
                    <Route path="/my-profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> 
                    <Route path="/my-wishlist" element={<Wishlist />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<CheckOut />} />
                    
                   
                    <Route path="/coustom-product-tshirt/:apparelId" element={<CoustomProductTshirt/>}/>
                    
                    <Route path="/*" element={<NotFound />} />
                  </Routes>
                  
                  <Footer />

                </CanvasProvider>
              </OrdersProvider> 
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </Provider>
    </>
  )
}

export default App;