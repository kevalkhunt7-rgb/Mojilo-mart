import React from 'react';
import { ArrowRight } from 'lucide-react';
import categoryimg1 from '../assets/categoryimg1.png';
import categoryimg2 from '../assets/categoryimg2.png';
import { useNavigate } from 'react-router-dom';

export default function Category() {
  const navigate = useNavigate();

  return (
    <section className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-8 md:px-12 lg:px-24 flex flex-col items-center overflow-hidden">

      {/* ── HEADING ── */}
      <div className="text-center mb-6 sm:mb-10">
        <p
          data-aos="fade-down"
          data-aos-duration="500"
          data-aos-once="true"
          className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#BC7628] font-semibold mb-1.5"
        >
          Shop by Category
        </p>
        <h2
          data-aos="fade-down"
          data-aos-delay="120"
          data-aos-duration="500"
          data-aos-once="true"
          className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900"
        >
          Find Your Style
        </h2>

        {/* Underline accent — animates in after heading */}
        <div
          data-aos="zoom-in"
          data-aos-delay="240"
          data-aos-duration="500"
          data-aos-once="true"
          className="mx-auto mt-2 h-[2px] w-10 sm:w-14 rounded-full bg-[#BC7628]"
        />
      </div>

      {/* ── CARDS CONTAINER — layout unchanged ── */}
      <div className="relative w-full max-w-3xl flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-[90px] lg:gap-[110px]">

        {/* ── MEN'S CARD ── */}
        <div
          data-aos="fade-right"
          data-aos-delay="180"
          data-aos-duration="700"
          data-aos-easing="ease-out-cubic"
          data-aos-once="true"
          className="
            relative overflow-hidden rounded-xl sm:rounded-2xl group cursor-pointer
            w-full h-48 sm:h-64
            md:w-1/2 md:h-auto md:aspect-[4/5]
          "
          onClick={() => navigate('/collection?Category=man')}
        >
          <img
            src={categoryimg1}
            alt="Men's Collection"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* gradient overlay — animates opacity on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent transition-opacity duration-500 group-hover:from-black/65" />

          {/* Shine sweep on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/6 to-transparent pointer-events-none" />

          {/* Badge */}
          <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 w-[72%] max-w-[210px]">
            <button
              onClick={e => { e.stopPropagation(); navigate('/collection?Category=man'); }}
              className="
                w-full bg-white/95 backdrop-blur-sm text-black font-bold
                py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl
                text-xs sm:text-sm tracking-wide shadow-lg
                transition-all duration-300
                hover:bg-white hover:scale-[1.03] active:scale-95
                cursor-pointer
              "
            >
              Men's Collection
            </button>
          </div>
        </div>

        {/* ── VIEW ALL ── */}
        <div
          data-aos="zoom-in"
          data-aos-delay="350"
          data-aos-duration="550"
          data-aos-easing="ease-out-back"
          data-aos-once="true"
          className="
            flex justify-center w-full
            md:absolute md:w-auto md:top-1/2 md:left-1/2
            md:-translate-x-1/2 md:-translate-y-1/2 md:z-30
          "
        >
          <button
            onClick={() => navigate('/collection')}
            className="
              flex items-center gap-2
              bg-[#BC7628] hover:bg-[#A0611F]
              text-white font-semibold
              px-6 py-3 sm:px-8 sm:py-3.5
              rounded-xl text-sm sm:text-base tracking-wide whitespace-nowrap
              shadow-lg hover:shadow-xl
              transition-all duration-300 hover:scale-[1.05] active:scale-95
              cursor-pointer
            "
          >
            View All
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {/* ── WOMEN'S CARD ── */}
        <div
          data-aos="fade-left"
          data-aos-delay="180"
          data-aos-duration="700"
          data-aos-easing="ease-out-cubic"
          data-aos-once="true"
          className="
            relative overflow-hidden rounded-xl sm:rounded-2xl group cursor-pointer
            w-full h-48 sm:h-64
            md:w-1/2 md:h-auto md:aspect-[4/5]
          "
          onClick={() => navigate('/collection?Category=woman')}
        >
          <img
            src={categoryimg2}
            alt="Women's Collection"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent transition-opacity duration-500 group-hover:from-black/65" />

          {/* Shine sweep on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/6 to-transparent pointer-events-none" />

          <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 w-[72%] max-w-[210px]">
            <button
              onClick={e => { e.stopPropagation(); navigate('/collection?Category=woman'); }}
              className="
                w-full bg-white/95 backdrop-blur-sm text-black font-bold
                py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl
                text-xs sm:text-sm tracking-wide shadow-lg
                transition-all duration-300
                hover:bg-white hover:scale-[1.03] active:scale-95
                cursor-pointer
              "
            >
              Women's Collection
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}