import React from 'react';
import BennerMan from '../assets/BennerMan.png';
import { useNavigate } from 'react-router-dom';

export default function Banner1() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full bg-gradient-to-b from-[#D9A05B] to-[#403121] px-6 py-12 md:py-0 md:px-12 lg:px-24 flex flex-col md:flex-row items-center justify-between md:h-[400px]">
      
      {/* LEFT CONTENT COLUMN */}
      {/* Added text-center and items-center for small screens; md: overrides these for desktop */}
      <div className="w-full md:w-3/5 flex flex-col items-center md:items-start justify-center h-full z-10 space-y-6 text-white text-center md:text-left">
        <div className="relative max-w-xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wide uppercase leading-tight">
            Positive Mind Positive <br className="hidden md:block" />
            Vibes Positive Life
          </h2>
          
          <div className="hidden md:block absolute -bottom-6 right-10 lg:right-20 text-[#F5C451] animate-pulse pointer-events-none">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l2.4 5.3 5.3 2.4-5.3 2.4-2.4 5.3-2.4-5.3-5.3-2.4 5.3-2.4z M19 15l1.2 2.6 2.6 1.2-2.6 1.2-1.2 2.6-1.2-2.6-2.6-1.2 2.6-1.2z" />
            </svg>
          </div>
        </div>

        <p className="text-gray-200 text-sm sm:text-base font-normal tracking-wide">
          T-shirts that keep you moving.
        </p>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
          <button onClick={() => navigate('/collection')} className="bg-black hover:bg-gray-900 text-white font-bold px-8 py-3.5 rounded-lg text-sm transition-colors duration-200 shadow-lg tracking-wide cursor-pointer">
            Shop Now
          </button>
          <button onClick={() => navigate('/contact-us')} className="bg-white hover:bg-gray-100 text-black font-bold px-8 py-3.5 rounded-lg text-sm transition-colors duration-200 shadow-lg tracking-wide cursor-pointer">
            Contact Us
          </button>
        </div>
      </div>

      {/* RIGHT IMAGE COLUMN */}
      <div className="w-full md:w-2/5 h-full relative flex justify-center md:justify-end items-end mt-8 md:mt-0">
        <div className="relative w-full max-w-[360px] md:max-w-[420px] h-[85%] md:h-[95%] flex items-end">
          <img 
            src={BennerMan}
            alt="Fitness model featuring Positive Mind T-shirt" 
            className="w-full md:w-[450px] h-auto md:h-[450px] object-contain object-bottom drop-shadow-[0_20px_20px_rgba(0,0,0,0.4)]"
          />
        </div>
      </div>

    </section>
  );
}