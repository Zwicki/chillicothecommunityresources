import React from 'react';
import { 
  AlertCircle, 
  HeartHandshake, 
  Brain, 
  Utensils, 
  Gift, 
  Home, 
  Building2, 
  Key, 
  Shirt, 
  Zap, 
  Stethoscope, 
  Bus, 
  Briefcase, 
  Users,
  Compass,
  Church,
  ChevronLeft,
  Printer,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';
import { CATEGORIES, CategoryMeta } from '../data/categories';
import { ResourceCategory } from '../types/resource';

interface SidebarNavProps {
  activeCategory: ResourceCategory | 'all';
  onSelectCategory: (category: ResourceCategory | 'all') => void;
  onBackToHome: () => void;
  categoryCounts: Record<string, number>;
  onOpenSuggestModal: () => void;
  onOpenPrintModal: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const getCategoryIcon = (iconName: string, className: string = 'w-4 h-4') => {
  switch (iconName) {
    case 'AlertCircle': return <AlertCircle className={className} />;
    case 'HeartHandshake': return <HeartHandshake className={className} />;
    case 'Brain': return <Brain className={className} />;
    case 'Utensils': return <Utensils className={className} />;
    case 'Gift': return <Gift className={className} />;
    case 'Home': return <Home className={className} />;
    case 'Building2': return <Building2 className={className} />;
    case 'Key': return <Key className={className} />;
    case 'Shirt': return <Shirt className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Stethoscope': return <Stethoscope className={className} />;
    case 'Bus': return <Bus className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'Church': return <Church className={className} />;
    case 'Users':
    default:
      return <Users className={className} />;
  }
};

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeCategory,
  onSelectCategory,
  onBackToHome,
  categoryCounts,
  onOpenSuggestModal,
  onOpenPrintModal,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  return (
    <>
      {/* Mobile Toggle Button (Visible only on smaller screens) */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-white border-b border-slate-200 sticky top-12 z-20 shadow-sm no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBackToHome()}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700"
          >
            <ChevronLeft className="w-4 h-4 text-emerald-600" />
            <span>Home</span>
          </button>
          <span className="text-slate-300">|</span>
          <img 
            src="./images/life-recovery-society-logo.png" 
            alt="Life Recovery Society" 
            className="w-6 h-6 object-contain"
          />
          <span className="text-[11px] font-bold text-slate-800">Life Recovery Society</span>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-200"
        >
          <Menu className="w-4 h-4" />
          <span>Categories</span>
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Element */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between
        transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-10 lg:h-[calc(100vh-80px)] lg:sticky lg:top-20
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'}
        no-print
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Sidebar Top: Back to Home & Mobile Close */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                onBackToHome();
                setIsMobileOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-sm w-full justify-center group"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-600 transform group-hover:-translate-x-0.5 transition-transform" />
              <span>&larr; Back to Main Page</span>
            </button>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden ml-2 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Life Recovery Society Brand Header */}
          <a
            href="https://liferecoverysociety.org"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit Life Recovery Society (liferecoverysociety.org)"
            className="px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/60 flex items-center gap-3 hover:from-slate-850 hover:to-slate-750 transition-colors group cursor-pointer"
          >
            <div className="p-1 bg-slate-950/80 rounded-xl border border-amber-500/30 flex-shrink-0 group-hover:border-amber-400 transition-colors">
              <img 
                src="./images/life-recovery-society-logo.png" 
                alt="Life Recovery Society" 
                className="h-14 w-auto object-contain drop-shadow group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200 leading-tight block">
                Life Recovery Society
              </span>
              <span className="text-[11px] text-slate-300 block">
                liferecoverysociety.org &nearr;
              </span>
            </div>
          </a>

          {/* Category List Header */}
          <div className="px-5 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Categories ({CATEGORIES.length - 1})
          </div>

          {/* Navigation Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
            {CATEGORIES.map((cat: CategoryMeta) => {
              const isActive = activeCategory === cat.id;
              const count = categoryCounts[cat.id] ?? 0;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left group ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className={isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-700'}>
                      {getCategoryIcon(cat.iconName, 'w-4 h-4 flex-shrink-0')}
                    </span>
                    <span className="truncate">{cat.label}</span>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold flex-shrink-0 ${
                      isActive
                        ? 'bg-slate-800 text-emerald-300'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer Shortcuts */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
            <button
              onClick={() => {
                onOpenPrintModal();
                setIsMobileOpen(false);
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Guide Handout</span>
            </button>

            <button
              onClick={() => {
                onOpenSuggestModal();
                setIsMobileOpen(false);
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Suggest Missing Service</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};
