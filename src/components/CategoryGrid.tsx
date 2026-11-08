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
  ArrowRight,
  Sparkles,
  Printer
} from 'lucide-react';
import { CATEGORIES, CategoryMeta } from '../data/categories';
import { ResourceCategory } from '../types/resource';

interface CategoryGridProps {
  onSelectCategory: (category: ResourceCategory) => void;
  categoryCounts: Record<string, number>;
  onOpenPrintModal: () => void;
}

const getCategoryIcon = (iconName: string, className: string = 'w-6 h-6') => {
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

// Custom color styling presets for the large landing page buttons
const CATEGORY_STYLES: Record<string, { bg: string; border: string; iconBg: string; text: string; hoverBorder: string }> = {
  'crisis': {
    bg: 'bg-rose-50/60',
    border: 'border-rose-200',
    hoverBorder: 'hover:border-rose-400 hover:shadow-rose-100',
    iconBg: 'bg-rose-600 text-white',
    text: 'text-rose-950'
  },
  'recovery': {
    bg: 'bg-emerald-50/60',
    border: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400 hover:shadow-emerald-100',
    iconBg: 'bg-emerald-600 text-white',
    text: 'text-emerald-950'
  },
  'sober-living': {
    bg: 'bg-teal-50/60',
    border: 'border-teal-200',
    hoverBorder: 'hover:border-teal-400 hover:shadow-teal-100',
    iconBg: 'bg-teal-600 text-white',
    text: 'text-teal-950'
  },
  'mental-health': {
    bg: 'bg-indigo-50/60',
    border: 'border-indigo-200',
    hoverBorder: 'hover:border-indigo-400 hover:shadow-indigo-100',
    iconBg: 'bg-indigo-600 text-white',
    text: 'text-indigo-950'
  },
  'food': {
    bg: 'bg-amber-50/60',
    border: 'border-amber-200',
    hoverBorder: 'hover:border-amber-400 hover:shadow-amber-100',
    iconBg: 'bg-amber-600 text-white',
    text: 'text-amber-950'
  },
  'blessing-boxes': {
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400 hover:shadow-emerald-100',
    iconBg: 'bg-teal-700 text-white',
    text: 'text-teal-950'
  },
  'shelters': {
    bg: 'bg-orange-50/60',
    border: 'border-orange-200',
    hoverBorder: 'hover:border-orange-400 hover:shadow-orange-100',
    iconBg: 'bg-orange-600 text-white',
    text: 'text-orange-950'
  },
  'housing': {
    bg: 'bg-blue-50/60',
    border: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400 hover:shadow-blue-100',
    iconBg: 'bg-blue-600 text-white',
    text: 'text-blue-950'
  },
  'landlords': {
    bg: 'bg-cyan-50/60',
    border: 'border-cyan-200',
    hoverBorder: 'hover:border-cyan-400 hover:shadow-cyan-100',
    iconBg: 'bg-cyan-700 text-white',
    text: 'text-cyan-950'
  },
  'clothing-laundry': {
    bg: 'bg-purple-50/60',
    border: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400 hover:shadow-purple-100',
    iconBg: 'bg-purple-600 text-white',
    text: 'text-purple-950'
  },
  'utilities': {
    bg: 'bg-yellow-50/60',
    border: 'border-yellow-200',
    hoverBorder: 'hover:border-yellow-400 hover:shadow-yellow-100',
    iconBg: 'bg-amber-600 text-white',
    text: 'text-yellow-950'
  },
  'medical': {
    bg: 'bg-red-50/60',
    border: 'border-red-200',
    hoverBorder: 'hover:border-red-400 hover:shadow-red-100',
    iconBg: 'bg-red-600 text-white',
    text: 'text-red-950'
  },
  'transportation': {
    bg: 'bg-sky-50/60',
    border: 'border-sky-200',
    hoverBorder: 'hover:border-sky-400 hover:shadow-sky-100',
    iconBg: 'bg-sky-600 text-white',
    text: 'text-sky-950'
  },
  'employment-legal': {
    bg: 'bg-stone-50/60',
    border: 'border-stone-200',
    hoverBorder: 'hover:border-stone-400 hover:shadow-stone-100',
    iconBg: 'bg-stone-700 text-white',
    text: 'text-stone-950'
  },
  'nonprofits': {
    bg: 'bg-lime-50/60',
    border: 'border-lime-200',
    hoverBorder: 'hover:border-lime-400 hover:shadow-lime-100',
    iconBg: 'bg-emerald-700 text-white',
    text: 'text-emerald-950'
  },
  'support-meetings': {
    bg: 'bg-indigo-50/60',
    border: 'border-indigo-200',
    hoverBorder: 'hover:border-indigo-400 hover:shadow-indigo-100',
    iconBg: 'bg-indigo-600 text-white',
    text: 'text-indigo-950'
  },
  'churches': {
    bg: 'bg-amber-50/60',
    border: 'border-amber-200',
    hoverBorder: 'hover:border-amber-400 hover:shadow-amber-100',
    iconBg: 'bg-amber-700 text-white',
    text: 'text-amber-950'
  }
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  categoryCounts,
  onOpenPrintModal,
}) => {
  const visibleCategories = CATEGORIES.filter(c => c.id !== 'all');

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Browse By Community Need</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Services Available in Ross County
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          Choose a category below to browse verified phone numbers, walk-in hours, physical addresses, and service requirements.
        </p>

        {/* Print Handout Banner Callout */}
        <div className="mt-5 inline-flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenPrintModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-800 border-2 border-slate-300 hover:border-slate-800 hover:bg-slate-50 shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>Print Directory Handout (Select Categories)</span>
          </button>
        </div>
      </div>

      {/* Large Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleCategories.map((cat: CategoryMeta) => {
          const count = categoryCounts[cat.id] ?? 0;
          const style = CATEGORY_STYLES[cat.id] || {
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            hoverBorder: 'hover:border-slate-400',
            iconBg: 'bg-slate-800 text-white',
            text: 'text-slate-900'
          };

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as ResourceCategory)}
              className={`group text-left p-6 rounded-2xl border-2 ${style.border} ${style.bg} ${style.hoverBorder} hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 flex flex-col justify-between active:scale-[0.98] cursor-pointer`}
            >
              <div>
                {/* Top Row: Icon & Count Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${style.iconBg} group-hover:scale-110 transition-transform`}>
                    {getCategoryIcon(cat.iconName, 'w-6 h-6')}
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/90 text-slate-800 border border-slate-200 shadow-sm">
                    {count} {count === 1 ? 'Resource' : 'Resources'}
                  </span>
                </div>

                {/* Title */}
                <h3 className={`text-lg font-bold ${style.text} leading-snug group-hover:text-emerald-800 transition-colors`}>
                  {cat.label}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Bottom Action Affordance */}
              <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-emerald-700">
                <span>View Directory</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
