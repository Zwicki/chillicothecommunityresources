import React from 'react';
import { Search, PlusCircle, Printer, Inbox, X, Sparkles, MapPin, ArrowRight, ChevronLeft, Calendar } from 'lucide-react';

interface HeaderProps {
  currentView: 'landing' | 'directory';
  onGoToLanding: () => void;
  onGoToDirectory: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  filteredCount: number;
  onOpenSuggestModal: () => void;
  onOpenPrintModal: () => void;
  onOpenAddEvent?: () => void;
  onOpenSubmissions: () => void;
  submissionsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onGoToLanding,
  onGoToDirectory,
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount,
  onOpenSuggestModal,
  onOpenPrintModal,
  onOpenAddEvent,
  onOpenSubmissions,
  submissionsCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 no-print sticky top-[41px] z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo / Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Life Recovery Society Logo links to liferecoverysociety.org */}
              <a 
                href="https://liferecoverysociety.org" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Visit Life Recovery Society (liferecoverysociety.org)"
                className="group flex-shrink-0 cursor-pointer"
              >
                <img 
                  src="./images/life-recovery-society-logo.png" 
                  alt="Life Recovery Society" 
                  className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                />
              </a>

              <div className="text-left">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button 
                    onClick={onGoToLanding}
                    className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight hover:text-emerald-700 transition-colors text-left"
                    title="Return to Main Page"
                  >
                    Chillicothe Community Resources
                  </button>
                  <a 
                    href="https://liferecoverysociety.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                    title="Visit Life Recovery Society (liferecoverysociety.org)"
                  >
                    Life Recovery Society
                  </a>
                  <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Ross County, OH
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  Presented by{' '}
                  <a 
                    href="https://liferecoverysociety.org" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-amber-800 hover:text-amber-950 font-semibold underline decoration-amber-300 underline-offset-2 transition-colors"
                    title="Visit liferecoverysociety.org"
                  >
                    Life Recovery Society
                  </a>
                  {' '}&bull; {totalCount} Verified Community Services
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1.5 md:hidden">
              {currentView === 'landing' ? (
                <>
                  <button
                    onClick={onOpenPrintModal}
                    className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    title="Print Directory"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={onGoToDirectory}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg shadow-sm"
                  >
                    Browse All
                  </button>
                </>
              ) : (
                <button
                  onClick={onGoToLanding}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Home
                </button>
              )}
            </div>
          </div>

          {/* Directory Search & Navigation Controls (When in Directory View) */}
          {currentView === 'directory' ? (
            <div className="flex-1 max-w-xl mx-0 md:mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Filter resources by name, keyword, or address..."
                  className="block w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {currentView === 'landing' ? (
              <>
                <button
                  onClick={onOpenPrintModal}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl transition-all border border-slate-300 shadow-xs"
                  title="Print customized community directory handout"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print Directory</span>
                </button>

                <button
                  onClick={onGoToDirectory}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <span>Browse All Resources</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={onGoToLanding}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Main Page</span>
              </button>
            )}

            {onOpenAddEvent && (
              <button
                onClick={onOpenAddEvent}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-xs"
                title="Post upcoming community event or announcement"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Add Event</span>
              </button>
            )}

            <button
              onClick={onOpenSuggestModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Suggest Service</span>
            </button>

            {submissionsCount > 0 && (
              <button
                onClick={onOpenSubmissions}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors shadow-sm"
                title="View community submissions"
              >
                <Inbox className="w-3.5 h-3.5 text-amber-600" />
                <span>Inbox ({submissionsCount})</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
