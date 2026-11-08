import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, MapPin, Heart, Utensils, Home, PhoneCall, Printer, X, ArrowRight, Phone, Compass, Church } from 'lucide-react';
import { Resource, ResourceCategory } from '../types/resource';

interface LandingHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPerformSearch: (query?: string) => void;
  onSelectCategory: (category: ResourceCategory) => void;
  totalResourcesCount: number;
  onOpenPrintModal: () => void;
  allResources?: Resource[];
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  searchQuery,
  onSearchChange,
  onPerformSearch,
  onSelectCategory,
  totalResourcesCount,
  onOpenPrintModal,
  allResources,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFocused(false);
    onPerformSearch();
  };

  // Live preview matching for dropdown suggestions
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const previewMatches = useMemo(() => {
    if (!trimmedQuery || !allResources) return [];
    return allResources.filter(res => {
      const inName = res.name.toLowerCase().includes(trimmedQuery);
      const inCategory = res.categoryLabel.toLowerCase().includes(trimmedQuery) || (res.subcategory && res.subcategory.toLowerCase().includes(trimmedQuery));
      const inAddress = res.address ? res.address.toLowerCase().includes(trimmedQuery) : false;
      const inDesc = res.description ? res.description.toLowerCase().includes(trimmedQuery) : false;
      const inTags = res.tags ? res.tags.some(t => t.toLowerCase().includes(trimmedQuery)) : false;
      return inName || inCategory || inAddress || inDesc || inTags;
    });
  }, [trimmedQuery, allResources]);

  const showDropdown = isFocused && trimmedQuery.length >= 1;

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800 shadow-xl">
      {/* Background Image of Historic Downtown Chillicothe - high visibility */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transform motion-safe:transition-transform duration-1000 opacity-80"
        style={{
          backgroundImage: `url('./images/historic-chillicothe.jpg')`,
        }}
      />

      {/* Soft Vignette & Balanced Contrast Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/30" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Content Container */}
      <div className="relative max-w-5xl mx-auto px-4 py-14 sm:py-18 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Life Recovery Society Presenter Badge */}
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

        {/* Interactive Search Bar on Hero */}
        <div ref={containerRef} className="mt-8 w-full max-w-2xl relative z-30">
          <form 
            onSubmit={handleFormSubmit}
            className="relative flex items-center shadow-2xl rounded-2xl bg-white text-slate-900 border-2 border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/30 transition-all overflow-hidden"
          >
            <div className="pl-4 flex items-center pointer-events-none text-emerald-600">
              <Search className="h-5 w-5" />
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsFocused(false);
              }}
              placeholder="Search services, keywords, addresses (e.g., 'sober living', 'food pantry', 'IOP', 'shelter')..."
              className="block w-full pl-3 pr-2 py-3.5 sm:py-4 text-sm sm:text-base bg-white text-slate-900 focus:outline-none font-medium placeholder:text-slate-500"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  setIsFocused(true);
                }}
                className="p-1.5 mr-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="mr-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md active:scale-95 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Search</span>
            </button>
          </form>

          {/* Live Quick Results Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-left z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-700">
                  {previewMatches.length > 0 ? `Matching Resources (${previewMatches.length})` : 'No matching resources found'}
                </span>
                <span className="text-[11px] text-slate-400">Press Enter to view in directory</span>
              </div>

              {previewMatches.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {previewMatches.slice(0, 4).map((res) => (
                    <div
                      key={res.id}
                      onClick={() => {
                        setIsFocused(false);
                        onPerformSearch(res.name);
                      }}
                      className="p-3 hover:bg-emerald-50/70 transition-colors cursor-pointer group flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                            {res.name}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {res.categoryLabel}
                          </span>
                        </div>
                        {res.address && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span>{res.address}</span>
                          </p>
                        )}
                      </div>

                      {res.phone && (
                        <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 flex-shrink-0 pt-0.5">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{res.phone}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  No directory listings match "{searchQuery}". Press Enter or click Search to explore all resources.
                </div>
              )}

              <div
                onClick={() => {
                  setIsFocused(false);
                  onPerformSearch();
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>View all matching results in Directory</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Emergency & Common Needs Shortcut Chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-white text-[11px] font-bold uppercase tracking-wider mr-1 drop-shadow-md">
            Immediate Needs:
          </span>

          <button
            onClick={() => onSelectCategory('crisis')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 text-rose-200 border border-rose-500/70 hover:bg-rose-950 transition-colors shadow-md backdrop-blur-md font-semibold cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            <span>24/7 Crisis &amp; 988</span>
          </button>

          <button
            onClick={() => onSelectCategory('food')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 text-amber-200 border border-amber-500/70 hover:bg-amber-950 transition-colors shadow-md backdrop-blur-md font-semibold cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            <span>Free Meals &amp; Pantries</span>
          </button>

          <button
            onClick={() => onSelectCategory('sober-living')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 text-teal-200 border border-teal-500/70 hover:bg-teal-950 transition-colors shadow-md backdrop-blur-md font-semibold cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-teal-400" />
            <span>Sober Living Residences</span>
          </button>

          <button
            onClick={() => onSelectCategory('recovery')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 text-emerald-200 border border-emerald-500/70 hover:bg-emerald-950 transition-colors shadow-md backdrop-blur-md font-semibold cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-emerald-400" />
            <span>Addiction Recovery / MAT</span>
          </button>

          <button
            onClick={() => onSelectCategory('support-meetings')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 text-indigo-200 border border-indigo-500/70 hover:bg-indigo-950 transition-colors shadow-md backdrop-blur-md font-semibold cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Support Meetings (AA &amp; NA)</span>
          </button>

          <button
            onClick={() => onSelectCategory('churches')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 text-amber-200 border border-amber-500/70 hover:bg-amber-950 transition-colors shadow-md backdrop-blur-md font-semibold cursor-pointer"
          >
            <Church className="w-3.5 h-3.5 text-amber-400" />
            <span>Churches &amp; Faith</span>
          </button>

          <button
            onClick={onOpenPrintModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-slate-100 border border-slate-500/80 hover:bg-slate-800 transition-colors shadow-md backdrop-blur-md font-semibold cursor-pointer"
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
