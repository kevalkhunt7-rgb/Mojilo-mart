import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Shirt, 
  Recycle, 
  ShieldCheck, 
  Truck, 
  HeartHandshake, 
  Palette, 
  CheckCircle2, 
  ArrowRight, 
  Award,
  Users,
  Smile,
  Layers
} from 'lucide-react';
import ContactUsImg1 from '../assets/ContactUsImg1.png';
import heroimg from '../assets/heroimg.png';
import categoryimg1 from '../assets/categoryimg1.png';
import { useSettings } from '../context/SettingsContext';

const AboutUs = () => {
  const { settings } = useSettings();

  const storeName = settings?.storeName || 'Mojilo';

  const stats = [
    { label: 'Happy Customers', value: '50K+', icon: Smile, description: 'Over 50,000 satisfied style enthusiasts across India.' },
    { label: 'Custom Products Printed', value: '100K+', icon: Shirt, description: 'Unique custom apparel designs created & delivered.' },
    { label: 'Quality Guarantee', value: '99.8%', icon: Award, description: 'Top-tier fabric & long-lasting vibrant prints.' },
    { label: 'Customer Satisfaction', value: '4.9 ★', icon: Users, description: 'Based on genuine verified buyer reviews.' },
  ];

  const coreValues = [
    {
      icon: Sparkles,
      title: 'Uncompromised Quality',
      description: 'We source ultra-soft, breathable, premium cotton blends designed for maximum comfort and durability wash after wash.',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      icon: Palette,
      title: 'Limitless Customization',
      description: 'Our intuitive 3D design studio empowers you to print your imagination onto t-shirts, oversized tees, hoodies, and jerseys.',
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    {
      icon: Recycle,
      title: 'Sustainable Fashion',
      description: 'Eco-conscious inks, zero-waste print-on-demand technology, and responsible manufacturing practices for a cleaner planet.',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      icon: ShieldCheck,
      title: 'Customer First Approach',
      description: 'Hassle-free returns, responsive customer care, and quick resolution to make every shopping experience seamless.',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Choose or Design',
      desc: 'Pick from our curated trendy collections or launch our custom studio to bring your own vision to life.',
      icon: Layers
    },
    {
      step: '02',
      title: 'Precision Crafting',
      desc: 'Using state-of-the-art direct-to-garment & sublimation techniques for vibrant, non-fading colors.',
      icon: Palette
    },
    {
      step: '03',
      title: 'Rigorous Quality Check',
      desc: 'Every garment undergoes a detailed multi-point inspection to ensure perfect stitching and texture.',
      icon: CheckCircle2
    },
    {
      step: '04',
      title: 'Express Delivery',
      desc: 'Carefully packaged and dispatched straight to your doorstep with real-time order tracking.',
      icon: Truck
    }
  ];

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
    <div className="w-full bg-white font-sans antialiased text-gray-800 selection:bg-amber-200">
      
      {/* ── 1. HERO SECTION ── */}
      <div 
        className="relative w-full bg-cover bg-center flex items-center justify-center py-20 md:py-28 px-4"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('${ContactUsImg1}')`,
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-4xl mx-auto text-center text-white space-y-4 relative z-10">
          <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs sm:text-sm font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full backdrop-blur-md">
            Our Story & Craftsmanship
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Redefining Fashion, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
              One Custom Garment at a Time
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-200 font-light max-w-2xl mx-auto leading-relaxed pt-2">
            At {storeName}, fashion isn't just about clothing — it's about freedom, individuality, and wearing your confidence effortlessly.
          </p>
        </div>
      </div>

      {/* ── 2. BRAND STORY SECTION ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Image Gallery Card */}
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-amber-50">
              <img 
                src={heroimg} 
                alt={`${storeName} Showcase`} 
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            {/* Secondary Floating Image */}
            <div className="hidden sm:block absolute -bottom-8 -right-8 w-48 lg:w-56 rounded-xl overflow-hidden shadow-2xl border-4 border-white z-20">
              <img 
                src={categoryimg1} 
                alt="Apparel Craftsmanship" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Decorative Accent Card */}
            <div className="absolute -top-6 -left-6 bg-amber-600 text-white p-4 sm:p-5 rounded-2xl shadow-xl z-20 max-w-[200px]">
              <p className="text-2xl sm:text-3xl font-black">100%</p>
              <p className="text-xs font-medium text-amber-100">Original Prints & Premium Fabrics</p>
            </div>
          </div>

          {/* Right Column: Story Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
              <HeartHandshake className="w-4 h-4" /> Welcome to {storeName}
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              We started with a vision: to make self-expression wearable.
            </h2>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Founded with a passion for modern aesthetics and custom streetwear, {storeName} brings together superior craftsmanship, trendsetting silhouettes, and custom printing technology.
            </p>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Whether you are looking for classic graphic tees, relaxed oversized hoodies, or customizing your custom team apparel, we provide tailored precision using eco-friendly materials that look great and feel amazing.
            </p>

            {/* Bullet Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                'Premium Ring-Spun Cotton',
                'HD Fade-Resistant Printing',
                'Ergonomic Streetwear Fits',
                'Fast Nationwide Dispatch'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="text-sm font-semibold text-gray-800">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link 
                to="/collection" 
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#965a1d] to-[#63390f] hover:from-[#824e19] hover:to-[#54300c] text-white font-semibold text-sm rounded-xl shadow-md transition-all duration-200 hover:shadow-lg active:scale-95"
              >
                Explore Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/custom" 
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-50 hover:bg-amber-100 text-[#7a4918] font-semibold text-sm rounded-xl border border-amber-200 transition-all duration-200"
              >
                Custom Design Studio <Palette className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>
      </div>

      {/* ── 3. KEY STATS SECTION ── */}
      <div className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h3 className="text-amber-400 font-bold text-xs uppercase tracking-widest">Our Impact in Numbers</h3>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Trusted by thousands of fashion-forward minds</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 text-center hover:border-amber-500/50 transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-amber-300 mb-1">{stat.value}</div>
                  <div className="text-sm font-bold text-white mb-1">{stat.label}</div>
                  <div className="text-xs text-slate-400 font-light leading-relaxed">{stat.description}</div>
                </div>
              );
            })}
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
              Stay connected with {storeName} for new product drops, style inspiration, behind-the-scenes content, and direct updates.
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


      {/* ── 4. CORE VALUES SECTION ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-amber-700 font-bold text-xs uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
            What Drives Us
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
            Built on Quality, Fueled by Creativity
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Every piece we craft is a testament to our core pillars of excellence, innovation, and sustainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div 
                key={index} 
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${value.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{value.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. CREATIVE WORKFLOW TIMELINE ── */}
      <div className="bg-amber-50/50 border-y border-amber-100/80 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-amber-800 font-bold text-xs uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-md">
              Seamless Crafting Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
              How We Turn Concepts Into Reality
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              From the initial design stroke to final delivery, quality control is woven into every step.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {workflowSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={idx} className="relative bg-white p-6 rounded-2xl border border-gray-100 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-amber-600/30 font-mono">{step.step}</span>
                      <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center">
                        <StepIcon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

     
      {/* ── 7. CALL TO ACTION BANNER ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#5c3a1a] via-[#855323] to-[#b8732a] text-white p-8 sm:p-12 md:p-16 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Upgrade Your Style Statement?
            </h2>
            <p className="text-amber-100/90 text-sm sm:text-base font-light leading-relaxed">
              Explore our latest ready-to-wear drops or build your own bespoke apparel in our interactive studio today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link
              to="/collection"
              className="px-7 py-3.5 bg-white text-amber-950 font-bold text-sm rounded-xl shadow-lg hover:bg-amber-50 transition-colors text-center active:scale-95"
            >
              Shop New Arrivals
            </Link>
            <Link
              to="/contact-us"
              className="px-7 py-3.5 bg-amber-900/40 hover:bg-amber-900/60 border border-amber-300/40 text-white font-semibold text-sm rounded-xl transition-colors text-center"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutUs;
