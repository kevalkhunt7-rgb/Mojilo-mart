import React from 'react'
import Hero from '../components/Hero'
import CustomHero from '../components/CustomHero'
import Category from '../components/Category'
import HomeDisplay from '../components/Homedisplay'
import Benner1 from '../components/Benner1'
import Benner2 from '../components/Benner2'
import Line from '../components/Line'
import CustomBanner from '../components/CoustomBenner'
import Benner3 from '../components/Benner3'
import LetsTalk from '../components/Let\'sTalk'

const Home = () => {
  return (
    <div className="min-h-screen bg-stone-50/50 text-stone-900 antialiased selection:bg-amber-100 flex flex-col">
      
      {/* ── HERO SECTION ── */}
      {/* Bundled both heroes into a semantic header wrapper with a subtle background transition */}
      <header className="relative w-full bg-gradient-to-b from-white to-stone-50/30 overflow-hidden">
        <Hero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <hr className="border-stone-200/60" />
        </div>
        <CustomHero />
      </header>

      
      <main className="flex-grow overflow-hidden">
        
        {/* Category Browsing */}
        <section className=" py-4  sm:py-8 bg-[#FCFCFC] border-y border-stone-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Category />
          </div>
        </section>

        {/* Featured Showcase */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HomeDisplay />
          </div>
        </section>

        {/* Marketing Banners 1 & 2 */}
        <section className="space-y-8 sm:space-y-12 md:space-y-16 py-8 sm:py-12">
          <div className="max-w-full   ">
            <Benner1 />
          </div>
          <div className="max-w-full  ">
            <Benner2 />
          </div>
        </section>

        {/* Dynamic Divider Line */}
        <div className="py-6">
          <Line />
        </div>

        {/* Custom Studio Banner */}
        <section className="sm:py-16 bg-[#FCFCFC] border-y border-stone-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CustomBanner />
          </div>
        </section>

        {/* Final Promotional Banner */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className=" mx-auto  ">
            <Benner3 />
          </div>
        </section>

        {/* Interactive / Contact Call-To-Action */}
        <section className="-py-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LetsTalk />
          </div>
        </section>
 
      </main>
    </div>
  )
}

export default Home