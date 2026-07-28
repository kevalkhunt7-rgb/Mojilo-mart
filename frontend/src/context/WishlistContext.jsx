import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import api from '../lib/axios';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist items from API
  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/wishlist');
      if (response.data && response.data.success) {
        // Backend returns Wishlist object containing products array
        setWishlist(response.data.data?.products || []);
      }
    } catch (error) {
      console.error('Failed to load user wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reload wishlist on authentication changes
  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  // Add item to wishlist
  const addToWishlist = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to your wishlist.');
      return;
    }

    try {
      const response = await api.post('/wishlist', { productId: product._id || product.id });
      if (response.data && response.data.success) {
        await fetchWishlist();
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return;
    try {
      const response = await api.delete(`/wishlist/${productId}`);
      if (response.data && response.data.success) {
        await fetchWishlist();
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item.id) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        loading
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};