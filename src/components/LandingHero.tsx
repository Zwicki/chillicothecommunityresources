import React from 'react';
import { Search, MapPin, Sparkles, Heart, Utensils, Home, Shield, PhoneCall, Printer } from 'lucide-react';
import { ResourceCategory } from '../types/resource';

interface LandingHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCategory: (category: ResourceCategory) => void;
  totalResourcesCount: number;
  onOpenPrintModal: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  searchQuery,
  onSearchChange,
  onSelectCategory,
  totalResourcesCount,
  onOpenPrintModal,
}) => {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800 shadow-xl">
      {/* Background Image of Historic Downtown Chillicothe - increased visibility to showcase city buildings */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transform motion-safe:transition-transform duration-1000 opacity-80"
        style={{
          backgroundImage: `url('./images/historic-chillicothe.jpg')`,
        }}
      />

      {/* Soft Vignette & Balanced Contrast Gradient (allows buildings to be clearly seen) */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/30" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Content Container */}
      <div className="relative max-w-5xl mx-auto px-4 py-14 sm:py-18 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Life Recovery Society Presenter Badge with Large High-Contrast Phoenix Logo */}
        <div className="flex flex-col items-center mb-6">
          <a
            href="https://liferecoverysociety.org"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit Life Recovery Society (liferecoverysociety.org)"
            className="p-3 sm:p-4 rounded-3xl bg-slate-950/75 border border-amber-500/50 backdrop-blur-md shadow-2xl flex flex-col items-center group transition-all hover:border-amber-400 hover:shadow-amber-500/20 mb-3.5 cursor-pointer"
          >
            <img 
              src="./images/life-recovery-society-logo.png" 
              alt="Life Recovery Society" 
              className="h-36 sm:h-48 md:h-56 w-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.95)] transform group-hover:scale-105 transition-transform duration-300"
            />
          </a>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-slate-950/90 text-amber-300 border border-amber-500/60 shadow-xl backdrop-blur-md drop-shadow-md">
            <a 
              href="https://liferecoverysociety.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline hover:text-amber-200 transition-colors cursor-pointer"
              title="Visit Life Recovery Society website"
            >
              Life Recovery Society
            </a>
            <span className="text-slate-400">&bull;</span>
            <span className="text-emerald-300 flex items-center gap-1 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 inline" />
              First Capital of Ohio &bull; Ross County Hub
            </span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl drop-shadow-[0_3px_10px_rgba(0,0,0,0.85)]">
          Find Help, Hope &amp; Support in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">Ross County</span>
        </h1>

        {/* Hero Description */}
        <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-100 max-w-2xl leading-relaxed font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          A free, comprehensive directory connecting neighbors, families, and case workers with food pantries, addiction recovery, sober living homes, mental health counseling, emergency shelters, and essential community services.
        </p>

        {/* Search Bar on Hero */}
        <div className="mt-8 w-full max-w-2xl relative shadow-2xl">
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-emerald-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search services, keywords, addresses (e.g., 'sober living', 'food pantry', 'IOP', 'shelter')..."
              className="block w-full pl-12 pr-4 py-4 text-sm sm:text-base bg-white/95 text-slate-900 rounded-2xl shadow-2xl border-2 border-emerald-500/80 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all font-medium placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Quick Emergency & Common Needs Shortcut Chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-white text-[11px] font-bold uppercase tracking-wider mr-1 drop-shadow-md">
            Immediate Needs:
          </span>

          <button
            onClick={() => onSelectCategory('crisis')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 text-rose-200 border border-rose-500/70 hover:bg-rose-950 transition-colors shadow-md backdrop-blur-md font-semibold"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            <span>24/7 Crisis &amp; 988</span>
          </button>

          <button
            onClick={() => onSelectCategory('food')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 text-amber-200 border border-amber-500/70 hover:bg-amber-950 transition-colors shadow-md backdrop-blur-md font-semibold"
          >
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            <span>Free Meals &amp; Pantries</span>
          </button>

          <button
            onClick={() => onSelectCategory('sober-living')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 text-teal-200 border border-teal-500/70 hover:bg-teal-950 transition-colors shadow-md backdrop-blur-md font-semibold"
          >
            <Home className="w-3.5 h-3.5 text-teal-400" />
            <span>Sober Living Residences</span>
          </button>

          <button
            onClick={() => onSelectCategory('recovery')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 text-emerald-200 border border-emerald-500/70 hover:bg-emerald-950 transition-colors shadow-md backdrop-blur-md font-semibold"
          >
            <Heart className="w-3.5 h-3.5 text-emerald-400" />
            <span>Addiction Recovery / MAT</span>
          </button>

          <button
            onClick={onOpenPrintModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-slate-100 border border-slate-500/80 hover:bg-slate-800 transition-colors shadow-md backdrop-blur-md font-semibold"
            title="Print custom resource directory handout"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Print Directory</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="mt-10 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full max-w-3xl backdrop-blur-md bg-slate-950/60 py-4 px-6 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md">{totalResourcesCount}</span>
            <span className="text-xs text-slate-200 mt-0.5 font-medium">Vetted Resources</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 drop-shadow-md">14</span>
            <span className="text-xs text-slate-200 mt-0.5 font-medium">Sober Living Houses</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 drop-shadow-md">21</span>
            <span className="text-xs text-slate-200 mt-0.5 font-medium">24/7 Blessing Boxes</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 drop-shadow-md">100%</span>
            <span className="text-xs text-slate-200 mt-0.5 font-medium">Free Public Directory</span>
          </div>
        </div>

      </div>
    </section>
  );
};
