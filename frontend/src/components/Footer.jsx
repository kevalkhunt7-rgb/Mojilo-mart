import React from 'react';
import Logo from '../assets/Logo.png';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="w-full bg-white text-gray-500 font-sans pt-16 pb-8 px-6 md:px-12 lg:px-20">
      {/* Top Section: Navigation Link Columns */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 xl:gap-12 mb-16">
        
        {/* Column 1: Brand / Contact Details */}
        <div className="flex flex-col space-y-4">
          {/* Brand Logo with exact styling and register mark */}
          <img src={Logo} alt="Mojilomart Logo" className="w-32 h-auto object-contain" />
          
          <div className="space-y-3 text-[14px] text-gray-500 leading-normal">
            <p className="cursor-pointer hover:text-black transition-colors">hello@mojilomart.io</p>
            <p className="font-extrabold text-black text-base pt-1">+02 036 038 3996</p>
            <p className="pt-2 text-gray-400 font-light max-w-[240px] leading-relaxed">
              149, First Floor, Avadh Viceroy, Near D-Mart, Sarthana Jakatnaka, Surat, Gujarat 395006
            </p>
          </div>
        </div>

        {/* Column 2: Information Links */}
        <div>
          <h4 className="text-black font-bold text-[16px] tracking-wide mb-5">Information</h4>
          <ul className="space-y-3.5 text-[14px] text-gray-400 font-medium">
            <li className="hover:text-black transition-colors"><a href="#">About us</a></li>
            <li className="hover:text-black transition-colors"><a href="#">Our Blog</a></li>
            <li className="hover:text-black transition-colors"><a href="#">Start a Return</a></li>
            <li className="hover:text-black transition-colors"><a href="#">Contact Us</a></li>
            <li className="hover:text-black transition-colors"><a href="#">Shipping FAQ</a></li>
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
            <li className="hover:text-black transition-colors"><a href="#">My Account</a></li>
            <li className="hover:text-black transition-colors"><a href="#">Print Provider</a></li>
            <li className="hover:text-black transition-colors"><a href="#">Become a Partner</a></li>
            <li className="hover:text-black transition-colors"><a href="#">Custom Products</a></li>
            <li className="hover:text-black transition-colors"><a href="#">Make your own shirt</a></li>
          </ul>
        </div>

        {/* Column 5: Newsletter Form */}
        <div className="flex flex-col space-y-4">
          <h4 className="text-black font-bold text-[16px] tracking-wide mb-1">Newsletter</h4>
          <p className="text-[14px] text-gray-400 font-medium leading-normal">Subscribe to our newsletter.</p>
          
          <div className="space-y-3 pt-1 max-w-[240px]">
            <input 
              type="email" 
              placeholder="Your email" 
              className="w-full bg-[#f4f4f4] text-gray-700 text-sm px-4 py-3.5 rounded-xl focus:outline-none placeholder-gray-400 font-medium"
            />
            <button className="w-full bg-[#926838] hover:bg-[#7d562b] text-white text-sm font-semibold py-3.5 px-6 rounded-xl transition-colors tracking-wide shadow-sm cursor-pointer">
              Subscribe
            </button>
          </div>
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
        <div className="order-2 md:order-3 flex items-center justify-center gap-6 text-gray-400">
          {/* Twitter / X */}
          <a href="#" className="hover:text-black transition-colors">
            <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          {/* Facebook */}
          <a href="#" className="hover:text-black transition-colors">
            <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
          </a>
          {/* Instagram */}
          <a href="#" className="hover:text-black transition-colors">
            <svg className="w-[18px] h-[18px] fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          {/* YouTube */}
          <a href="#" className="hover:text-black transition-colors">
            <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.387.508 9.387.508s7.517 0 9.387-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>

      </div>
    </footer>
  );
}