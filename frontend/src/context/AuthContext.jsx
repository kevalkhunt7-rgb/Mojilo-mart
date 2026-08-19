import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate user profile if token/session is active
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('mojilo_accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/users/profile');
        if (response.data && response.data.success) {
          setUser(response.data.data);
        } else {
          localStorage.removeItem('mojilo_accessToken');
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
        localStorage.removeItem('mojilo_accessToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Register a new user profile
  const signup = async (name, email, password, phoneNumber = '') => {
    try {
      const response = await api.post('/auth/register', { name, email, password, phoneNumber });
      if (response.data?.data?.accessToken) {
        const { user: userData, accessToken } = response.data.data;
        localStorage.setItem('mojilo_accessToken', accessToken);
        setUser(userData);
      }
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      throw new Error(msg);
    }
  };

  // Verify email address OTP
  const verifyEmailOtp = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-email', { email, otp });
      if (response.data?.data?.accessToken) {
        const { user: userData, accessToken } = response.data.data;
        localStorage.setItem('mojilo_accessToken', accessToken);
        setUser(userData);
      }
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'OTP verification failed';
      throw new Error(msg);
    }
  };

  // Login session
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, accessToken } = response.data.data;
      
      localStorage.setItem('mojilo_accessToken', accessToken);
      setUser(userData);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      throw new Error(msg);
    }
  };

  // Google OAuth session
  const googleLogin = async (idToken) => {
    try {
      const response = await api.post('/auth/google', { idToken });
      const { user: userData, accessToken } = response.data.data;
      
      localStorage.setItem('mojilo_accessToken', accessToken);
      setUser(userData);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Google authentication failed';
      throw new Error(msg);
    }
  };

  // Forgot password OTP request
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send password reset OTP';
      throw new Error(msg);
    }
  };

  // Reset password with OTP
  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { email, otp, newPassword });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Password reset failed';
      throw new Error(msg);
    }
  };

  // Logout session
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('mojilo_accessToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signup, 
      verifyEmailOtp, 
      login, 
      googleLogin,
      forgotPassword,
      resetPassword,
      logout, 
      isAuthenticated: !!user,
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
