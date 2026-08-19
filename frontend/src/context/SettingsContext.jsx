import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const parseSocialItem = (val) => {
  if (typeof val === 'string') return { url: val, enabled: true };
  if (val && typeof val === 'object') return { url: val.url || '', enabled: val.enabled !== undefined ? Boolean(val.enabled) : true };
  return { url: '', enabled: true };
};

const defaultSettings = {
  storeName: 'Mojilo',
  logoUrl: '',
  contactEmail: 'support@mojilo.com',
  contactPhone: '+91 98765 43210',
  businessAddress: '123 Fashion Street, Surat, Gujarat, India',
  maintenanceMode: false,
  shippingEnabled: true,
  freeShippingThreshold: 999,
  defaultShippingCharge: 50,
  socialLinks: {
    whatsapp: { url: 'https://whatsapp.com/channel/0029VavFd8G6RGJNAmFON31c', enabled: true },
    facebook: { url: 'https://facebook.com/MojiloMart', enabled: true },
    instagram: { url: 'https://instagram.com/mojilomart', enabled: true },
    pinterest: { url: 'https://in.pinterest.com/mojilomart', enabled: true },
    amazon: { url: 'https://amzn.to/3W21xlC', enabled: true },
    googleMap: { url: 'https://maps.app.goo.gl/wg4HAyaeiJzMcZKA', enabled: true },
    linkedin: { url: 'https://linkedin.com/in/mojilo', enabled: true },
    twitter: { url: 'https://x.com/MojiloMart', enabled: true },
    youtube: { url: '', enabled: true },
  },
};

const SettingsContext = createContext({
  settings: defaultSettings,
  loading: true,
  refreshSettings: () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      const data = res.data?.data || res.data || {};
      if (data && typeof data === 'object') {
        const rawSocial = data.socialLinks || {};
        setSettings({
          storeName: data.storeName || defaultSettings.storeName,
          logoUrl: data.logoUrl || '',
          contactEmail: data.contactEmail || defaultSettings.contactEmail,
          contactPhone: data.contactPhone || defaultSettings.contactPhone,
          businessAddress: data.businessAddress || defaultSettings.businessAddress,
          maintenanceMode: Boolean(data.maintenanceMode),
          shippingEnabled: data.shippingEnabled !== undefined ? Boolean(data.shippingEnabled) : defaultSettings.shippingEnabled,
          freeShippingThreshold: data.freeShippingThreshold !== undefined ? Number(data.freeShippingThreshold) : defaultSettings.freeShippingThreshold,
          defaultShippingCharge: data.defaultShippingCharge !== undefined ? Number(data.defaultShippingCharge) : defaultSettings.defaultShippingCharge,
          socialLinks: {
            whatsapp: parseSocialItem(rawSocial.whatsapp) || defaultSettings.socialLinks.whatsapp,
            facebook: parseSocialItem(rawSocial.facebook) || defaultSettings.socialLinks.facebook,
            instagram: parseSocialItem(rawSocial.instagram) || defaultSettings.socialLinks.instagram,
            pinterest: parseSocialItem(rawSocial.pinterest) || defaultSettings.socialLinks.pinterest,
            amazon: parseSocialItem(rawSocial.amazon) || defaultSettings.socialLinks.amazon,
            googleMap: parseSocialItem(rawSocial.googleMap) || defaultSettings.socialLinks.googleMap,
            linkedin: parseSocialItem(rawSocial.linkedin) || defaultSettings.socialLinks.linkedin,
            twitter: parseSocialItem(rawSocial.twitter) || defaultSettings.socialLinks.twitter,
            youtube: parseSocialItem(rawSocial.youtube) || defaultSettings.socialLinks.youtube,
          },
        });
      }
    } catch (err) {
      console.warn('[SettingsContext] Failed to load settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
