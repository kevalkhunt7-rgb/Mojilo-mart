import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import LayoutCMS from './pages/LayoutCMS';
import Layout from './components/Layout';
import Orders from './pages/Orders';
import CategoriesPage from './pages/Categories';
import AddCategory from './pages/AddCategory';
import EditCategory from './pages/EditCategory';
// import VariantsPage from './pages/Variants';
// import EditVariant from './pages/EditVariant';
import DesignTemplatesPage from './pages/DesignTemplatesPage';
import CustomDesigns from './pages/CustomDesigns';
import Cliparts from './pages/Cliparts';
import ApparelTemplates from './pages/ApparelTemplates';


import Customers from './pages/Customers';
import Reviews from './pages/Reviews';
import Coupons from './pages/Coupons';
import Shipping from './pages/Shipping';
import Payments from './pages/Payments';
import Refunds from './pages/Refunds';
import Inventory from './pages/Inventory';
import CreateBanner from './pages/CreateBanner';
import EditBanner from './pages/EditBanner';
import CancellationRequests from './pages/CancellationRequests';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return user && user.role === 'admin' ? children : <Navigate to="/login" />;
};

const PrinterProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        Loading...
      </div>
    );
  }

  return user && user.role === 'printer' ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path='/' element={<Dashboard />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/cancellation-requests' element={<CancellationRequests />} />
            <Route path='/categories' element={<CategoriesPage />} />
            <Route path='/categories/add' element={<AddCategory />} />
            <Route path='/categories/edit/:id' element={<EditCategory />} />
            {/* <Route path='/variants' element={<VariantsPage />} /> */}

            {/* <Route path='/variants/edit/:id' element={<EditVariant />} /> */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/products/edit/:id" element={<EditProduct />} />
            <Route path="/banners" element={<LayoutCMS />} />
            <Route path="/banners/create" element={<CreateBanner />} />
            <Route path="/banners/edit/:id" element={<EditBanner />} />
            <Route path="/custom-designs" element={<CustomDesigns />} />
            <Route path="/cliparts" element={<Cliparts />} />
            <Route path="/apparel-templates" element={<ApparelTemplates />} />

            <Route path="/customers" element={<Customers />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/refunds" element={<Refunds />} />
            <Route path="/inventory" element={<Inventory />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
