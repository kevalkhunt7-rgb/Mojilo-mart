import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Mojilo Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/" className="block px-4 py-2 rounded hover:bg-gray-800">
            Dashboard
          </Link>
          <Link
            to="/products" className="block px-4 py-2 rounded hover:bg-gray-800">
            Products
          </Link>
          <Link
            to="/layout" className="block px-4 py-2 rounded hover:bg-gray-800">
            Layout CMS
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className="mb-2 text-sm text-gray-400">
            Logged in as {user?.name}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
