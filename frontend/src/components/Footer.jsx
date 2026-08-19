import React from 'react';
import Logo from '../assets/Logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const getSocial = (item) => {
    if (!item) return { url: '#', enabled: true };
    if (typeof item === 'string') return { url: item || '#', enabled: true };
    return { url: item.url || '#', enabled: item.enabled !== false };
  };

  const whatsapp = getSocial(settings?.socialLinks?.whatsapp);
  const facebook = getSocial(settings?.socialLinks?.facebook);
  const instagram = getSocial(settings?.socialLinks?.instagram);
  const pinterest = getSocial(settings?.socialLinks?.pinterest);
  const amazon = getSocial(settings?.socialLinks?.amazon);
  const googleMap = getSocial(settings?.socialLinks?.googleMap);
  const linkedin = getSocial(settings?.socialLinks?.linkedin);
  const twitter = getSocial(settings?.socialLinks?.twitter);
  const youtube = getSocial(settings?.socialLinks?.youtube);

  return (
    <footer className="w-full bg-white text-gray-500 font-sans pt-16 pb-8 px-6 md:px-12 lg:px-20">
      {/* Top Section: Navigation Link Columns */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 xl:gap-12 mb-16">
        
        {/* Column 1: Brand / Contact Details */}
        <div className="flex flex-col space-y-4">
          {/* Brand Logo with exact styling and register mark */}
          <img
            src={settings?.logoUrl || Logo}
            alt={settings?.storeName || "Mojilo Logo"}
            className="w-32 h-auto object-contain max-h-12"
            onError={(e) => { e.target.src = Logo; }}
          />
          
          <div className="space-y-3 text-[14px] text-gray-500 leading-normal">
            <p className="cursor-pointer hover:text-black transition-colors">{settings?.contactEmail || "support@mojilo.com"}</p>
            <p className="font-extrabold text-black text-base pt-1">{settings?.contactPhone || "+91 98765 43210"}</p>
            <p className="pt-2 text-gray-400 font-light max-w-[240px] leading-relaxed">
              {settings?.businessAddress || "123 Fashion Street, Surat, Gujarat, India"}
            </p>
          </div>
        </div>

        {/* Column 2: Information Links */}
        <div>
          <h4 className="text-black font-bold text-[16px] tracking-wide mb-5">Information</h4>
          <ul className="space-y-3.5 text-[14px] text-gray-400 font-medium">
            <li className="hover:text-black transition-colors"><Link to="/about-us">About us</Link></li>
            <li className="hover:text-black transition-colors"><Link to="/contact-us">Contact Us</Link></li>
          </ul>
        </div>

        {/* Column 3: Services Links */}
        <div>
          <h4 className="text-black font-bold text-[16px] tracking-wide mb-5">Services</h4>
          <ul className="space-y-3.5 text-[14px] text-gray-400 font-medium">
            <li className="hover:text-black transition-colors"><a href="#">Printing Services</a></li>
            <li className="hover:text-black transition-colors"><a href="#">Digital Scanning</a></li>
            <li className="hover:text-black transition-colors"><a href="#">Design Services</a></li>
            <li className="hover:text-black transition-colors"><a href="#">Copying Services</a></li>
            <li className="hover:text-black transition-colors"><a href="#">Print on Demand</a></li>
          </ul>
        </div>

        {/* Column 4: Useful Links */}
        <div>
          <h4 className="text-black font-bold text-[16px] tracking-wide mb-5">Useful links</h4>
          <ul className="space-y-3.5 text-[14px] text-gray-400 font-medium">
            <li className="hover:text-black transition-colors"><Link to="/my-profile">My Account</Link></li>
            <li className="hover:text-black transition-colors"><Link to="/about-us">Print Provider</Link></li>
            <li className="hover:text-black transition-colors"><Link to="/custom">Custom Products</Link></li>
            <li className="hover:text-black transition-colors"><Link to="/coustom-product-tshirt/half-sleeve">Make your own shirt</Link></li>
          </ul>
        </div>

      </div>

      {/* Bottom Section: Copyright, Seamless Payment Gateways, and Social Handles */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100 text-[14px] text-gray-400 font-medium">
        
        {/* Left Aspect: Copyright statement */}
        <div className="order-3 md:order-1 text-center md:text-left text-gray-400/90">
          © 2026 Mojilomart. All rights reserved.
        </div>

        {/* Center Aspect: Unified Payment Method Cards */}
        <div className="order-1 md:order-2 flex flex-wrap items-center justify-center gap-2">
          {/* AMEX */}
          <div className="h-6 w-10 bg-[#0070CD] rounded flex items-center justify-center text-white font-black text-[9px] tracking-tighter select-none shadow-sm">AMEX</div>
          
          {/* Apple Pay */}
          <div className="h-6 w-10 bg-black rounded flex items-center justify-center text-white font-semibold text-[10px] tracking-tight select-none shadow-sm"> Pay</div>
          
          {/* G Pay */}
          <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center text-[#4285F4] font-bold text-[10px] tracking-tight select-none shadow-sm">G Pay</div>
          
          {/* Mastercard */}
          <div className="h-6 w-10 bg-[#1A1F71] rounded relative flex items-center justify-center overflow-hidden shadow-sm">
            <div className="absolute left-2.5 w-3.5 h-3.5 bg-[#FF5F00] rounded-full opacity-90"></div>
            <div className="absolute right-2.5 w-3.5 h-3.5 bg-[#F79E1B] rounded-full opacity-90"></div>
          </div>
          
          {/* Shop Pay */}
          <div className="h-6 w-10 bg-[#5625F2] rounded flex items-center justify-center text-white font-black italic text-[9px] tracking-tighter select-none shadow-sm">shop</div>
          
          {/* VISA */}
          <div className="h-6 w-10 bg-[#1A1F71] rounded flex items-center justify-center text-white font-black italic text-[10px] tracking-wide select-none shadow-sm">VISA</div>
        </div>

        {/* Right Aspect: Minimalist SVG Social Icons */}
        <div className="order-2 md:order-3 flex flex-wrap items-center justify-center gap-5 text-gray-400">
          {/* WhatsApp */}
          {whatsapp.enabled && (
            <a 
              href={whatsapp.url} 
              target={whatsapp.url !== '#' ? "_blank" : "_self"} 
              rel="noopener noreferrer" 
              aria-label="WhatsApp"
              className="hover:text-emerald-500 transition-colors"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </a>
          )}
          {/* Facebook */}
          {facebook.enabled && (
            <a 
              href={facebook.url} 
              target={facebook.url !== '#' ? "_blank" : "_self"} 
              rel="noopener noreferrer" 
              aria-label="Facebook"
              className="hover:text-blue-600 transition-colors"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
          )}
          {/* Instagram */}
          {instagram.enabled && (
            <a 
              href={instagram.url} 
              target={instagram.url !== '#' ? "_blank" : "_self"} 
              rel="noopener noreferrer" 
              aria-label="Instagram"
              className="hover:text-pink-600 transition-colors"
            >
              <svg className="w-[18px] h-[18px] fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          )}
          {/* Pinterest */}
          {pinterest.enabled && (
            <a 
              href={pinterest.url} 
              target={pinterest.url !== '#' ? "_blank" : "_self"} 
              rel="noopener noreferrer" 
              aria-label="Pinterest"
              className="hover:text-red-600 transition-colors"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.065-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
              </svg>
            </a>
          )}
          {/* Amazon */}
          {amazon.enabled && (
            <a 
              href={amazon.url} 
              target={amazon.url !== '#' ? "_blank" : "_self"} 
              rel="noopener noreferrer" 
              aria-label="Amazon"
              className="hover:text-amber-600 transition-colors"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M13.62 13.43c-.48-.68-.82-1.63-.82-2.84 0-1.74.88-3.08 2.13-3.08 1.07 0 1.63.85 1.63 2.05 0 2.22-1.23 3.87-2.94 3.87zm4.33 3.65c-1.36 1.05-3.08 1.55-4.87 1.55-4.52 0-7.2-2.83-7.2-7.07 0-4.32 3.13-7.39 7.74-7.39 3.86 0 6.07 2.14 6.07 4.96 0 3.32-2.34 5.75-5.4 5.75-.98 0-1.75-.38-2.12-.99l-.58 2.07c-.4 1.34-1.36 3.01-1.92 4.01h2.72c.48-.75 1.05-1.85 1.4-2.89.85.74 2.05 1.15 3.17 1.15 1.76 0 3.18-.72 4.14-1.77l.72.62zm-6.1-1.72c.11.23.27.42.48.56.28.18.61.27.97.27.79 0 1.53-.4 2.12-1.12.63-.78 1.03-1.81 1.03-2.92 0-1.14-.54-1.85-1.42-1.85-.75 0-1.44.47-2.02 1.25-.63.84-1.02 1.94-1.02 2.92 0 .32.06.6.17.82zM2.5 20.5c6.2 3.1 14.8 2.8 20-1.8-1.1-.3-2.2-.6-3.3-.8-4.4 3.8-11.8 4.1-16.7 1.6z"/>
              </svg>
            </a>
          )}
          {/* Google Map */}
          {googleMap.enabled && (
            <a 
              href={googleMap.url} 
              target={googleMap.url !== '#' ? "_blank" : "_self"} 
              rel="noopener noreferrer" 
              aria-label="Google Map Location"
              className="hover:text-emerald-600 transition-colors"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </a>
          )}
          {/* LinkedIn */}
          {linkedin.enabled && (
            <a 
              href={linkedin.url} 
              target={linkedin.url !== '#' ? "_blank" : "_self"} 
              rel="noopener noreferrer" 
              aria-label="LinkedIn"
              className="hover:text-blue-700 transition-colors"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>
          )}
          {/* Twitter / X */}
          {twitter.enabled && (
            <a 
              href={twitter.url} 
              target={twitter.url !== '#' ? "_blank" : "_self"} 
              rel="noopener noreferrer" 
              aria-label="Twitter X"
              className="hover:text-black transition-colors"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          )}
          {/* YouTube */}
          {youtube.enabled && (
            <a 
              href={youtube.url} 
              target={youtube.url !== '#' ? "_blank" : "_self"} 
              rel="noopener noreferrer" 
              aria-label="YouTube"
              className="hover:text-red-600 transition-colors"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.387.508 9.387.508s7.517 0 9.387-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          )}
        </div>

      </div>
    </footer>
  );
}