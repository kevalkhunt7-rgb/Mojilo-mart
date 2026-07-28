import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import ContactUsImg1 from '../assets/ContactUsImg1.png';
import LogoForContactUs from '../assets/LogoForContactUs.png';

const ContactUs = () => {
  return (
    <div className="w-full bg-white font-sans antialiased selection:bg-amber-200">

      {/* --- HERO SECTION --- */}
      <div
        className="relative w-full bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url('${ContactUsImg1}')`,
          minHeight: 'clamp(220px, 40vw, 420px)',
        }}
      >
        {/* Subtle dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/30" />
        <h1 className="relative z-10 text-white font-extrabold tracking-wide drop-shadow-md text-center px-4"
          style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}
        >
          Contact Us
        </h1>
      </div>

      {/* --- FLOATING CARD CONTAINER --- */}
      {/* 
        On mobile: card starts flush (no negative margin) so it doesn't clip the hero.
        On md+: card floats up with -mt-24 for the overlap effect.
      */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:-mt-24 relative z-10 mb-12 md:mb-20">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-100">

          {/* ── Left Column: Info ── */}
          <div className="w-full md:w-[45%] bg-gradient-to-b from-[#5c3a1a] to-[#b8732a] p-7 sm:p-9 md:p-10 flex flex-col justify-between text-white gap-8">
            <div className="space-y-6">
              {/* Logo */}
              <img
                src={LogoForContactUs}
                alt="Mojilo Mart Logo"
                className="w-28 sm:w-32 h-auto"
              />

              <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed font-light max-w-xs">
                We are committed to processing your information in order to contact you and talk about your order.
              </p>

              {/* Contact Details */}
              <ul className="space-y-5">
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-200/90 shrink-0 mt-0.5" />
                  <a
                    href="mailto:mojilomart@gmail.com"
                    className="text-sm tracking-wide hover:underline text-amber-50 break-all"
                  >
                    mojilomart@gmail.com
                  </a>
                </li>

                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-200/90 shrink-0 mt-0.5" />
                  <address className="text-sm tracking-wide text-amber-50 leading-snug not-italic">
                    149, First Floor, Avadh Viceroy,<br />
                    Near D-Mart, Sarthana Jakatnaka,<br />
                    Surat, Gujarat – 395006
                  </address>
                </li>

                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-200/90 shrink-0 mt-0.5" />
                  <a
                    href="tel:+91"
                    className="text-sm tracking-wide hover:underline text-amber-50"
                  >
                    +91
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* ── Right Column: Form ── */}
          <div className="w-full md:w-[55%] bg-white p-7 sm:p-9 md:p-12 flex flex-col justify-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Send us a message</h2>
            <p className="text-sm text-gray-400 mb-6">We'll get back to you as soon as possible.</p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">

              {/* Name + Email side-by-side on sm+ */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="sr-only" htmlFor="contact-name">Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Name*"
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-700 transition-colors placeholder-gray-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="sr-only" htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="Email*"
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-700 transition-colors placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="sr-only" htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  type="url"
                  placeholder="Website (optional)"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-700 transition-colors placeholder-gray-400"
                />
              </div>

              <div>
                <label className="sr-only" htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder="Your message…"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-700 transition-colors placeholder-gray-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="cursor-pointer w-full py-3 bg-gradient-to-r from-[#965a1d] to-[#63390f] hover:from-[#824e19] hover:to-[#54300c] text-white text-sm font-semibold rounded-lg shadow-md transition-all duration-200 active:scale-[0.99] tracking-wide"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* --- MAP EMBED SECTION --- */}
      <div className="w-full border-t border-gray-200 overflow-hidden"
        style={{ height: 'clamp(280px, 50vw, 450px)' }}
      >
        <iframe
          title="Avadh Viceroy Location Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1372.008639474116!2d72.90350582153589!3d21.231346170592083!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f084e3b848f%3A0x800f2020787532f0!2sMojilo!5e1!3m2!1sen!2sin!4v1784709131601!5m2!1sen!2sin"
          className="w-full h-full border-0 grayscale-[10%] contrast-[110%]"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

    </div>
  );
};

export default ContactUs;