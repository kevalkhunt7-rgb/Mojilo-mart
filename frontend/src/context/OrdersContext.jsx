import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../lib/axios';

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch orders from API
  const getUserOrders = async () => {
    if (!isAuthenticated) return [];
    setLoading(true);
    try {
      const response = await api.get('/users/orders');
      if (response.data && response.data.success) {
        const raw = response.data.data;
        const items = Array.isArray(raw) ? raw : (Array.isArray(raw?.orders) ? raw.orders : []);
        setOrders(items);
        return items;
      }
    } catch (error) {
      console.error('Failed to load user orders:', error);
    } finally {
      setLoading(false);
    }
    return [];
  };

  // Trigger loading history on login
  useEffect(() => {
    getUserOrders();
  }, [isAuthenticated]);

  // Place order
  const addOrder = async ({ paymentMethod, couponCode, shippingAddress, billingAddress, shippingMethodId }) => {
    if (!isAuthenticated) {
      throw new Error('User must be logged in to place an order');
    }

    try {
      const response = await api.post('/orders', {
        paymentMethod,
        couponCode,
        shippingAddress,
        billingAddress,
        shippingMethodId
      });

      if (response.data && response.data.success) {
        // Refresh orders list
        await getUserOrders();
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Failed to place order');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to place order';
      throw new Error(msg);
    }
  };

  return (
    <OrdersContext.Provider value={{
      orders,
      getUserOrders,
      addOrder,
      loading
    }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);
