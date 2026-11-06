import React from 'react';
import { Search, PlusCircle, Printer, Inbox, X, Sparkles, MapPin, ArrowRight, ChevronLeft, Calendar, LogOut, User, ShieldCheck } from 'lucide-react';
import { AuthUser } from '../types/auth';

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
  onOpenAddResource?: () => void;
  onOpenSubmissions: () => void;
  submissionsCount: number;
  currentUser: AuthUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
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
  onOpenAddResource,
  onOpenSubmissions,
  submissionsCount,
  currentUser,
  onOpenLogin,
  onLogout,
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
              {currentUser ? (
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  title={`Signed in as ${currentUser.name}. Click to Sign Out`}
                >
                  <LogOut className="w-4 h-4 text-slate-600" />
                </button>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                  title="Sign In with Google"
                >
                  <User className="w-4 h-4 text-emerald-700" />
                </button>
              )}

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

            {/* + Add Event Button (Logged-in vs Sign In Required) */}
            {onOpenAddEvent && (
              currentUser ? (
                <button
                  onClick={onOpenAddEvent}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all shadow-xs cursor-pointer"
                  title="Post upcoming community event or announcement"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+ Add Event</span>
                </button>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer"
                  title="Sign in with Google to post an event"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>+ Add Event</span>
                </button>
              )
            )}

            {/* Super User + Add Resource Button */}
            {currentUser?.isSuperUser && onOpenAddResource && (
              <button
                onClick={onOpenAddResource}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all shadow-xs cursor-pointer"
                title="Super User: Add a new verified community resource to the directory"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-800" />
                <span>+ Add Resource</span>
              </button>
            )}

            <button
              onClick={onOpenSuggestModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Suggest Service</span>
            </button>

            {submissionsCount > 0 && currentUser?.isSuperUser && (
              <button
                onClick={onOpenSubmissions}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors shadow-sm"
                title="View community submissions (Super User)"
              >
                <Inbox className="w-3.5 h-3.5 text-amber-600" />
                <span>Inbox ({submissionsCount})</span>
              </button>
            )}

            {/* User Profile / Google Sign-In Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
                  {currentUser.picture ? (
                    <img 
                      src={currentUser.picture} 
                      alt={currentUser.name} 
                      className="w-6 h-6 rounded-full object-cover border border-slate-300" 
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[120px]">
                        {currentUser.name}
                      </span>
                      {currentUser.isSuperUser && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                          <ShieldCheck className="w-2.5 h-2.5 text-amber-700 inline" />
                          Super User
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1 max-w-[130px]">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-xs hover:border-slate-400 cursor-pointer"
                title="Sign in with your Google account"
              >
                {/* Google G Icon */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
