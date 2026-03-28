import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Building2, ShieldCheck, Zap, Key, MapPin } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function LandingPage({ onEnter }) {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  
  useGSAP(() => {
    // Background scaling effect for premium feel
    gsap.from('.bg-video', {
      scale: 1.15,
      duration: 10,
      ease: 'power2.out'
    });

    // Staggered reveal for main text
    gsap.fromTo('.hero-element', 
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2,
        clearProps: 'all'
      }
    );

    // Premium floating card animations
    gsap.to('.floating-card', {
      y: '-=15',
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      stagger: 0.5
    });

    gsap.fromTo('.bottom-feature', 
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power2.out', delay: 1.2, clearProps: 'all' }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-slate-950 overflow-hidden font-outfit text-slate-100 flex items-center">
      
      {/* 1. Background Video with Overlay */}
      <div className="absolute inset-0 z-0 bg-video overflow-hidden">
        {/* Fallback image in case video fails */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
        ></div>
        
        {/* Premium stock video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-with-an-amazing-view-39832-large.mp4" type="video/mp4" />
        </video>

        {/* Gradients to blend video into UI */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
      </div>

      {/* 2. Main Hero Content */}
      <div ref={heroRef} className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center justify-between">
        
        {/* Left Typography Side */}
        <div className="max-w-2xl">
          <div className="hero-element inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md mb-8">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-300 font-medium">RE Dashboard Elite</span>
          </div>
          
          <h1 className="hero-element font-playfair text-5xl md:text-7xl font-medium leading-[1.1] text-white mb-6">
            Curate <br />
            <span className="italic text-slate-400">Extraordinary</span> <br />
            Living.
          </h1>
          
          <p className="hero-element text-base md:text-lg text-slate-400 font-light mb-8 max-w-lg leading-relaxed">
            Experience the zenith of property management. Command your real estate portfolio with absolute precision and unprecedented elegance.
          </p>
          
          <div className="hero-element">
            <button
              onClick={onEnter}
              className="group relative inline-flex items-center gap-4 px-8 py-4 bg-white text-slate-900 rounded-lg overflow-hidden transition-all hover:scale-105 shadow-2xl"
            >
              <div className="absolute inset-0 bg-amber-100 transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100"></div>
              
              <span className="relative z-10 text-xs tracking-[0.15em] uppercase font-semibold">Access Dashboard</span>
              
              <div className="relative z-10 w-7 h-7 rounded-full border border-slate-900 flex items-center justify-center group-hover:border-amber-900 group-hover:text-amber-900 transition-colors">
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </div>

          {/* Moved Bottom Decorative Features inside the Relative Flow to prevent overlapping on small screens */}
          <div className="mt-12 flex flex-wrap gap-8">
            <div className="bottom-feature flex items-center gap-3">
              <div className="w-10 h-10 border border-white/20 flex items-center justify-center rounded-lg bg-white/5 backdrop-blur-md">
                <ShieldCheck size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Security</p>
                <p className="text-sm text-white font-medium">Bank-grade Encrypted</p>
              </div>
            </div>
            <div className="bottom-feature flex items-center gap-3">
              <div className="w-10 h-10 border border-white/20 flex items-center justify-center rounded-lg bg-white/5 backdrop-blur-md">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Performance</p>
                <p className="text-sm text-white font-medium">Lightning Fast Analytics</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right 3D Visuals / Cards */}
        <div className="hidden lg:flex relative w-[450px] h-[500px]" style={{ perspective: '1000px' }}>
          {/* Card 1 */}
          <div className="floating-card absolute top-10 right-0 w-[280px] p-5 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl z-20" style={{ transform: 'rotateY(-15deg) rotateX(5deg)' }}>
            <div className="relative w-full h-32 mb-4 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1600607687920-4e2a043dc13b?auto=format&fit=crop&w=600&q=80" alt="Estate" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Premium</div>
            </div>
            <h3 className="font-playfair text-lg text-white mb-1">Palazzo Penthouse</h3>
            <p className="flex items-center gap-1 text-xs text-slate-400 mb-4"><MapPin size={12}/> Monte Carlo, Monaco</p>
            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <span className="text-slate-300 text-sm">$8,450 / mo</span>
              <Key size={14} className="text-amber-400" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="floating-card absolute bottom-0 left-0 w-[260px] p-4 bg-slate-900/60 backdrop-blur-xl border border-white/5 shadow-2xl z-10" style={{ transform: 'rotateY(-5deg) rotateX(10deg) translateZ(-50px)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                <Building2 size={18} className="text-slate-300" />
              </div>
              <span className="text-xs text-amber-200/70 border border-amber-200/20 px-2 py-1 rounded-full">Overview</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Total Properties</div>
                <div className="text-2xl font-playfair text-white">124</div>
              </div>
              <div className="w-full h-[1px] bg-white/5"></div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Active Leases</div>
                <div className="text-xl font-playfair text-white text-emerald-400">98%</div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
