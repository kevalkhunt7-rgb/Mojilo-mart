import React from 'react';
import Benner3img1 from '../assets/Benner3img1.png';
import { useNavigate } from 'react-router-dom';

export default function Banner3() {
  const navigate = useNavigate();
  return (
    <section className="relative w-full bg-[#b88242] overflow-hidden py-16 px-6 md:px-12 lg:px-20 min-h-[400px] flex items-center mt-10">
      
      {/* Background Decorative Abstract Circles - Kept same as original */}
      <div className="absolute top-0 left-0 w-[40%] h-full bg-[#cd9653] rounded-r-full opacity-40 pointer-events-none -translate-x-1/4 transform scale-110" />
      <div className="absolute top-12 left-[35%] w-32 h-32 bg-[#cd9653] rounded-full opacity-30 pointer-events-none hidden md:block" />
      <div className="absolute bottom-4 right-[15%] w-48 h-48 bg-[#cd9653] rounded-full opacity-20 pointer-events-none hidden lg:block" />
      <div className="absolute bottom-12 right-[32%] w-6 h-6 bg-[#e9bc84] rounded-full opacity-40 pointer-events-none hidden lg:block" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Content */}
        {/* Added text-center items-center for mobile centering, md:text-left for desktop */}
        <div className="text-white max-w-xl text-center md:text-left flex flex-col items-center md:items-start">
          <h2 className="text-4xl md:text-5xl lg:text-[54px] font-bold leading-tight tracking-tight mb-4">
            Enjoy up your day <br className="hidden md:block" />
            in the best T-shirts
          </h2>
          <p className="text-base md:text-lg text-amber-100/90 font-light mb-8">
            T-shirts that keep you moving.
          </p>
          
          {/* Action Buttons: Added justify-center for mobile */}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button onClick={() => navigate('/collection')} className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-amber-50 transition-colors shadow-sm text-sm md:text-base cursor-pointer">
              Shop Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button onClick={() => navigate('/custom')} className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-amber-50 transition-colors shadow-sm text-sm md:text-base cursor-pointer">
              Your design
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Side: Graphic Collage */}
        {/* Added flex justify-center for mobile to keep the image centered */}
        <div className="relative w-full h-[250px] md:h-[300px] flex items-center justify-center lg:justify-end">
          <div className="relative w-full max-w-[450px] flex justify-center transition-transform hover:scale-105 duration-300">
            <img 
              src={Benner3img1} 
              alt="Featured Fight Club White Hoodie" 
              className="w-full h-auto max-h-[300px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>

      </div>
    </section>
  );
}