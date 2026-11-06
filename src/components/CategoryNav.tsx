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
  Users 
} from 'lucide-react';
import { CATEGORIES, CategoryMeta } from '../data/categories';
import { ResourceCategory } from '../types/resource';

interface CategoryNavProps {
  activeCategory: ResourceCategory | 'all';
  onSelectCategory: (category: ResourceCategory | 'all') => void;
  categoryCounts: Record<string, number>;
}

// Icon mapper helper
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
    case 'Users':
    default:
      return <Users className={className} />;
  }
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <nav className="bg-slate-50 border-b border-slate-200 sticky top-[49px] z-30 py-3 px-4 sm:px-6 lg:px-8 no-print backdrop-blur-md bg-slate-50/95">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300">
          {CATEGORIES.map((cat: CategoryMeta) => {
            const isActive = activeCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex-shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
                  isActive
                    ? 'bg-slate-900 text-white ring-2 ring-slate-900 shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                  {getCategoryIcon(cat.iconName, 'w-3.5 h-3.5')}
                </span>
                <span>{cat.shortLabel}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
