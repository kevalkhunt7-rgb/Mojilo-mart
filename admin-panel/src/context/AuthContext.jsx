import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

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
        const storedToken = localStorage.getItem('admin_accessToken') || localStorage.getItem('accessToken');
        if (!storedToken) {
          setUser(null);
          setLoading(false);
          return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          // 1. Try fetching profile directly with valid stored token
          const profileRes = await api.get('/users/profile');
          const profileUser = profileRes.data?.data;

          if (profileUser && profileUser.role !== 'admin') {
            try {
              await api.post('/auth/logout');
            } catch (logoutErr) {
              console.error('Failed to logout non-admin user during checkAuth', logoutErr);
            }
            setUser(null);
            localStorage.removeItem('admin_accessToken');
            delete api.defaults.headers.common['Authorization'];
          } else {
            setUser(profileUser || null);
          }
          return;
        } catch (profileErr) {
          // 2. If stored token expired (401), attempt session refresh
          if (profileErr.response?.status === 401) {
            const refreshRes = await api.post('/auth/refresh');
            const token = refreshRes.data?.data?.accessToken;

            if (token) {
              localStorage.setItem('admin_accessToken', token);
              api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              const profileRes = await api.get('/users/profile');
              const profileUser = profileRes.data?.data;

              if (profileUser && profileUser.role !== 'admin') {
                try {
                  await api.post('/auth/logout');
                } catch (logoutErr) {
                  console.error('Failed to logout non-admin user', logoutErr);
                }
                setUser(null);
                localStorage.removeItem('admin_accessToken');
                delete api.defaults.headers.common['Authorization'];
              } else {
                setUser(profileUser || null);
              }
              return;
            }
          }
          throw profileErr;
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('admin_accessToken');
        delete api.defaults.headers.common['Authorization'];
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
      const res = await api.post('/auth/login', { email, password });
      const token = res.data?.data?.accessToken;
      const loggedInUser = res.data?.data?.user;

      if (token) {
        if (loggedInUser && loggedInUser.role !== 'admin') {
          try {
            await api.post('/auth/logout');
          } catch (logoutErr) {
            console.error('Failed to logout non-admin user', logoutErr);
          }
          return { success: false, message: 'Access denied: Admin role required' };
        }
        localStorage.setItem('admin_accessToken', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
      await api.post('/auth/logout');
      setUser(null);
      localStorage.removeItem('admin_accessToken');
      delete api.defaults.headers.common['Authorization'];
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

