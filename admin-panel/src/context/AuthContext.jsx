import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

let checkAuthPromise = null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    if (checkAuthPromise) {
      return checkAuthPromise;
    }

    checkAuthPromise = (async () => {
      try {
        // 1. Try to refresh access token
        const refreshRes = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const token = refreshRes.data?.data?.accessToken;

        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // 2. Fetch user profile
          const profileRes = await axios.get('/api/users/profile');
          const profileUser = profileRes.data?.data;

          if (profileUser && profileUser.role !== 'admin') {
            try {
              await axios.post('/api/auth/logout', {}, { withCredentials: true });
            } catch (logoutErr) {
              console.error('Failed to logout non-admin user during checkAuth', logoutErr);
            }
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
          } else {
            setUser(profileUser || null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
        checkAuthPromise = null;
      }
    })();

    return checkAuthPromise;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
      const token = res.data?.data?.accessToken;
      const loggedInUser = res.data?.data?.user;

      if (token) {
        if (loggedInUser && loggedInUser.role !== 'admin') {
          try {
            await axios.post('/api/auth/logout', {}, { withCredentials: true });
          } catch (logoutErr) {
            console.error('Failed to logout non-admin user', logoutErr);
          }
          return { success: false, message: 'Access denied: Admin role required' };
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(loggedInUser);
        return { success: true };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
