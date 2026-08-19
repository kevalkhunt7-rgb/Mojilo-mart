import React from 'react';
import BennerMan from '../assets/BennerMan.png';
import { useNavigate } from 'react-router-dom';

export default function Banner1() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full bg-gradient-to-b from-[#D9A05B] to-[#403121] px-6 pt-10 pb-0 md:py-0 md:px-12 lg:px-24 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 min-h-[400px]">
      
      {/* LEFT CONTENT COLUMN */}
      <div className="w-full md:w-auto flex flex-col items-center md:items-start justify-center z-10 space-y-4 sm:space-y-6 text-white text-center md:text-left pt-2 md:pt-0">
        <div className="relative max-w-xl">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-wide uppercase leading-tight drop-shadow-md">
            Positive Mind Positive <br className="hidden md:block" />
            Vibes Positive Life
          </h2>
          
          <div className="hidden md:block absolute -bottom-6 right-10 lg:right-20 text-[#F5C451] animate-pulse pointer-events-none">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l2.4 5.3 5.3 2.4-5.3 2.4-2.4 5.3-2.4-5.3-5.3-2.4 5.3-2.4z M19 15l1.2 2.6 2.6 1.2-2.6 1.2-1.2 2.6-1.2-2.6-2.6-1.2 2.6-1.2z" />
            </svg>
          </div>
        </div>

        <p className="text-gray-200 text-xs sm:text-base font-normal tracking-wide">
          T-shirts that keep you moving.
        </p>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 pt-2">
          <button 
            onClick={() => navigate('/collection')} 
            className="bg-black hover:bg-gray-900 text-white font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-xs sm:text-sm transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-lg tracking-wide cursor-pointer"
          >
            Shop Now
          </button>
          <button 
            onClick={() => navigate('/contact-us')} 
            className="bg-white hover:bg-gray-100 text-black font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-xs sm:text-sm transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-lg tracking-wide cursor-pointer"
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* RIGHT IMAGE COLUMN */}
      <div className="w-full md:w-auto relative flex justify-center md:justify-start items-end z-20 mt-4 md:mt-0">
        <div className="relative w-full max-w-[280px] sm:max-w-[360px] md:max-w-[460px] flex items-end">
          <img 
            src={BennerMan}
            alt="Fitness model featuring Positive Mind T-shirt" 
            className="w-full h-auto object-contain object-bottom mt-0 md:-mt-16 mb-0 drop-shadow-[0_15px_15px_rgba(0,0,0,0.4)] transition-transform duration-500 ease-out hover:scale-80"
          />
        </div>
      </div>

    </section>
  );
}