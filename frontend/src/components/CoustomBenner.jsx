import React from 'react';
import CoustomBenner from '../assets/CoustomBenner.png';
import { useNavigate } from 'react-router-dom';

const CustomBanner = () => {
  const navigate = useNavigate();

  return (
    // Outer container: responsive horizontal padding
    <div className="w-full max-w-3xl mx-auto px-4 py-8 md:py-16">
      {/* Card: responsive rounding and padding */}
      <div className="bg-[#f3f0fa] rounded-3xl p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        
        {/* Left Side: Text Content */}
        <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left max-w-lg">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
            Create your unique style
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 font-normal leading-relaxed">
            Free and easy way to bring your ideas to life.
          </p>
          <div className="pt-2">
            <button 
              onClick={() => navigate('/custom')} 
              className="bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-8 rounded-xl transition duration-200 shadow-sm border border-gray-200 cursor-pointer w-full sm:w-auto"
            >
              Explore More
            </button>
          </div>
        </div>

        {/* Right Side: Mockup Image */}
        <div className="flex-1 w-full flex justify-center md:justify-end">
          <div className="relative w-full max-w-[400px] aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            <img
              src={CoustomBenner}
              alt="T-shirt Mockups"
              className="w-full h-full object-cover"
            />
            {/* Optional Overlay */}
            <div className="absolute inset-0 bg-pink-500/10 mix-blend-multiply pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomBanner;