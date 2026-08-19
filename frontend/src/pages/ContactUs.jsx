import React from 'react';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import ContactUsImg1 from '../assets/ContactUsImg1.png';
import LogoForContactUs from '../assets/LogoForContactUs.png';
import { useSettings } from '../context/SettingsContext';

const ContactUs = () => {
  const { settings } = useSettings();

  const getSocial = (item, defaultUrl) => {
    if (!item) return { url: defaultUrl || '#', enabled: true };
    if (typeof item === 'string') return { url: item || defaultUrl || '#', enabled: true };
    return { url: item.url || defaultUrl || '#', enabled: item.enabled !== false };
  };

  const socialApps = [
    {
      key: 'whatsapp',
      name: 'WhatsApp Channel',
      handle: 'Chat & Exclusive Drops',
      data: getSocial(settings?.socialLinks?.whatsapp, 'https://whatsapp.com/channel/0029VavFd8G6RGJNAmFON31c'),
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
      badge: 'Direct Chat',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      )
    },
    {
      key: 'facebook',
      name: 'Facebook',
      handle: 'facebook.com/MojiloMart',
      data: getSocial(settings?.socialLinks?.facebook, 'https://facebook.com/MojiloMart'),
      bg: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
      badge: 'Community',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      )
    },
    {
      key: 'instagram',
      name: 'Instagram',
      handle: 'instagram.com/mojilomart',
      data: getSocial(settings?.socialLinks?.instagram, 'https://instagram.com/mojilomart'),
      bg: 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100',
      badge: 'Visual Lookbook',
      icon: (
        <svg className="w-6 h-6 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    },
    {
      key: 'pinterest',
      name: 'Pinterest',
      handle: 'in.pinterest.com/mojilomart',
      data: getSocial(settings?.socialLinks?.pinterest, 'https://in.pinterest.com/mojilomart'),
      bg: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
      badge: 'Style Inspo',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.065-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
        </svg>
      )
    },
    {
      key: 'amazon',
      name: 'Amazon Storefront',
      handle: 'Official Mojilo Apparel',
      data: getSocial(settings?.socialLinks?.amazon, 'https://amzn.to/3W21xlC'),
      bg: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
      badge: 'Shop Online',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M13.62 13.43c-.48-.68-.82-1.63-.82-2.84 0-1.74.88-3.08 2.13-3.08 1.07 0 1.63.85 1.63 2.05 0 2.22-1.23 3.87-2.94 3.87zm4.33 3.65c-1.36 1.05-3.08 1.55-4.87 1.55-4.52 0-7.2-2.83-7.2-7.07 0-4.32 3.13-7.39 7.74-7.39 3.86 0 6.07 2.14 6.07 4.96 0 3.32-2.34 5.75-5.4 5.75-.98 0-1.75-.38-2.12-.99l-.58 2.07c-.4 1.34-1.36 3.01-1.92 4.01h2.72c.48-.75 1.05-1.85 1.4-2.89.85.74 2.05 1.15 3.17 1.15 1.76 0 3.18-.72 4.14-1.77l.72.62zm-6.1-1.72c.11.23.27.42.48.56.28.18.61.27.97.27.79 0 1.53-.4 2.12-1.12.63-.78 1.03-1.81 1.03-2.92 0-1.14-.54-1.85-1.42-1.85-.75 0-1.44.47-2.02 1.25-.63.84-1.02 1.94-1.02 2.92 0 .32.06.6.17.82zM2.5 20.5c6.2 3.1 14.8 2.8 20-1.8-1.1-.3-2.2-.6-3.3-.8-4.4 3.8-11.8 4.1-16.7 1.6z"/>
        </svg>
      )
    },
    {
      key: 'googleMap',
      name: 'Google Map Location',
      handle: 'Visit Our Physical Studio',
      data: getSocial(settings?.socialLinks?.googleMap, 'https://maps.app.goo.gl/wg4HAyaeiJzMcZKA'),
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      badge: 'Location',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      )
    },
    {
      key: 'linkedin',
      name: 'LinkedIn',
      handle: 'linkedin.com/in/mojilo',
      data: getSocial(settings?.socialLinks?.linkedin, 'https://linkedin.com/in/mojilo'),
      bg: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
      badge: 'Professional Network',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
        </svg>
      )
    },
    {
      key: 'twitter',
      name: 'X (Twitter)',
      handle: 'x.com/MojiloMart',
      data: getSocial(settings?.socialLinks?.twitter, 'https://x.com/MojiloMart'),
      bg: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200',
      badge: 'Live Updates',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      key: 'youtube',
      name: 'YouTube',
      handle: 'Watch Our Craft Videos',
      data: getSocial(settings?.socialLinks?.youtube, ''),
      bg: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      badge: 'Video Content',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.387.508 9.387.508s7.517 0 9.387-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    }
  ].filter(app => app.data.enabled && app.data.url && app.data.url !== '#');

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:-mt-24 relative z-10 mb-12 md:mb-20">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-100">

          {/* ── Left Column: Info ── */}
          <div className="w-full md:w-[45%] bg-gradient-to-b from-[#5c3a1a] to-[#b8732a] p-7 sm:p-9 md:p-10 flex flex-col justify-between text-white gap-8">
            <div className="space-y-6">
              {/* Logo */}
              <img
                src={settings?.logoUrl || LogoForContactUs}
                alt={settings?.storeName || "Mojilo Logo"}
                className="w-28 sm:w-32 h-auto max-h-12 object-contain"
                onError={(e) => { e.target.src = LogoForContactUs; }}
              />

              <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed font-light max-w-xs">
                We are committed to processing your information in order to contact you and talk about your order.
              </p>

              {/* Contact Details */}
              <ul className="space-y-5">
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-200/90 shrink-0 mt-0.5" />
                  <a
                    href={`mailto:${settings?.contactEmail || 'support@mojilo.com'}`}
                    className="text-sm tracking-wide hover:underline text-amber-50 break-all"
                  >
                    {settings?.contactEmail || 'support@mojilo.com'}
                  </a>
                </li>

                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-200/90 shrink-0 mt-0.5" />
                  <address className="text-sm tracking-wide text-amber-50 leading-snug not-italic">
                    {settings?.businessAddress || '123 Fashion Street, Surat, Gujarat, India'}
                  </address>
                </li>

                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-200/90 shrink-0 mt-0.5" />
                  <a
                    href={`tel:${settings?.contactPhone || '+91 98765 43210'}`}
                    className="text-sm tracking-wide hover:underline text-amber-50"
                  >
                    {settings?.contactPhone || '+91 98765 43210'}
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
       {/* ── 6. SOCIAL MEDIA APPS SHOWCASE SECTION ── */}
            {socialApps.length > 0 && (
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-b border-gray-100">
                <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                  <span className="text-amber-700 font-bold text-xs uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                    Connect With Us
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
                    Join Our Community Across Platforms
                  </h2>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Stay connected with Mojilo for new product drops, style inspiration, behind-the-scenes content, and direct updates.
                  </p>
                </div>
      
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {socialApps.map((app) => (
                    <a
                      key={app.key}
                      href={app.data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 overflow-hidden"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${app.bg}`}>
                            {app.icon}
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200/80">
                            {app.badge}
                          </span>
                        </div>
      
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                          {app.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium truncate mt-1">
                          {app.handle}
                        </p>
                      </div>
      
                      <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                        <span>Connect Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
      

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