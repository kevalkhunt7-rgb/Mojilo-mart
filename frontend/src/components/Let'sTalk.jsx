import React from 'react';

export default function LetsTalk() {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-10 mt-[-65px]">
      {/* Main Card Container */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl overflow-hidden flex flex-col md:flex-row p-3 gap-6">

        {/* Left Section: Contact Information Card */}
        <div className="bg-black text-white rounded-xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-between w-full md:w-[40%] min-h-[500px]">

          {/* Top Info */}
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3 tracking-wide">
              Contact Information
            </h2>
            <p className="text-gray-400 text-sm md:text-base mb-12">
              Say something to start a live chat!
            </p>

            {/* Contact Details List */}
            <div className="space-y-8 relative z-10">
              {/* Phone */}
              <div className="flex items-center gap-5">
                <span className="p-2 bg-neutral-900 rounded-lg text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <span className="text-sm md:text-base font-medium">+91 </span>
              </div>

              {/* Email */}
              <div className="flex items-center gap-5">
                <span className="p-2 bg-neutral-900 rounded-lg text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="text-sm md:text-base font-medium break-all">mojilomart@gmail.com</span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-5">
                <span className="p-2 bg-neutral-900 rounded-lg text-white mt-0.5 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <p className="text-sm md:text-base font-medium leading-relaxed text-gray-200">
                  149, First Floor, Avadh Viceroy, Near D-Mart, Sarthana Jakatnaka, Surat, Gujarat 395006
                </p>
              </div>
            </div>
          </div>

          {/* Social Icons Footer */}
          <div className="flex items-center gap-4 relative z-10 mt-12 md:mt-0">
            {/* Twitter */}
            <a href="#" className="w-9 h-9 flex items-center justify-center bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors">
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="w-9 h-9 flex items-center justify-center bg-white text-black rounded-full hover:bg-gray-100 transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            {/* Facebook */}
            <a href="#" className="w-9 h-9 flex items-center justify-center bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors">
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
          </div>

          {/* Decorative Background Circles */}
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-neutral-800 rounded-full opacity-30 pointer-events-none" />
          <div className="absolute bottom-12 -right-6 w-36 h-36 bg-neutral-700 rounded-full opacity-20 pointer-events-none" />
        </div>

        {/* Right Section: Interactive Form */}
        <div className="flex-1 p-4 md:p-8 flex flex-col justify-between">
          <form className="space-y-10 mt-4">

            {/* Row 1: First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
              <div className="relative z-0 w-full group">
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  className="block py-2 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
                  placeholder=" "
                  required
                />
                <label htmlFor="first_name" className="peer-focus:font-medium absolute text-xs text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-black">
                  First Name
                </label>
              </div>

              <div className="relative z-0 w-full group">
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  className="block py-2 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
                  placeholder=" "
                />
                <label htmlFor="last_name" className="peer-focus:font-medium absolute text-xs text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-black">
                  Last Name
                </label>
              </div>
            </div>

            {/* Row 2: Email & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
              <div className="relative z-0 w-full group">
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="block py-2 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
                  placeholder=" "
                  required
                />
                <label htmlFor="email" className="peer-focus:font-medium absolute text-xs text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-black">
                  Email
                </label>
              </div>

              <div className="relative z-0 w-full group">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  defaultValue="+91 "
                  className="block py-2 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
                  placeholder=" "
                />
                <label htmlFor="phone" className="peer-focus:font-medium absolute text-xs text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-black">
                  Phone Number
                </label>
              </div>
            </div>

            {/* Row 3: Message Textarea */}
            <div className="relative z-0 w-full group pt-4">
              <textarea
                name="message"
                id="message"
                rows="2"
                className="block py-2 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer resize-none"
                placeholder="Write your message.."
                required
              ></textarea>
              <label htmlFor="message" className="peer-focus:font-medium absolute text-xs text-gray-400 duration-300 transform -translate-y-6 scale-75 top-2 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-black">
                Message
              </label>
            </div>

            {/* Form Footer Action */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="bg-black text-white px-10 py-3.5 rounded-lg text-sm font-medium shadow-md hover:bg-neutral-800 transition-all duration-200 tracking-wide active:scale-98 cursor-pointer"
              >
                Send Message
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}