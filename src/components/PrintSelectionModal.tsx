import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  CheckSquare, 
  Square, 
  Sparkles, 
  FileText, 
  Heart, 
  Utensils, 
  Home, 
  ShieldAlert, 
  Check, 
  HelpCircle 
} from 'lucide-react';
import { CATEGORIES, CategoryMeta } from '../data/categories';
import { ResourceCategory } from '../types/resource';

interface PrintSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryCounts: Record<string, number>;
  onConfirmPrint: (selectedCategories: ResourceCategory[], includeCrisis: boolean) => void;
}

export const PrintSelectionModal: React.FC<PrintSelectionModalProps> = ({
  isOpen,
  onClose,
  categoryCounts,
  onConfirmPrint,
}) => {
  const visibleCategories = CATEGORIES.filter(c => c.id !== 'all') as CategoryMeta[];
  const allCategoryIds = visibleCategories.map(c => c.id as ResourceCategory);

  // State of selected categories (default to all selected)
  const [selected, setSelected] = useState<ResourceCategory[]>(allCategoryIds);
  const [includeCrisisBanner, setIncludeCrisisBanner] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleToggleCategory = (id: ResourceCategory) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSelectAll = () => {
    setSelected(allCategoryIds);
  };

  const handleDeselectAll = () => {
    setSelected([]);
  };

  const handleSelectBasicNeeds = () => {
    const basic: ResourceCategory[] = ['food', 'blessing-boxes', 'shelters', 'housing', 'clothing-laundry', 'utilities'];
    setSelected(basic);
  };

  const handleSelectRecoveryMentalHealth = () => {
    const rec: ResourceCategory[] = ['crisis', 'recovery', 'sober-living', 'mental-health', 'medical'];
    setSelected(rec);
  };

  // Calculate selected resources count
  const totalSelectedResources = selected.reduce((sum, catId) => {
    return sum + (categoryCounts[catId] || 0);
  }, 0);

  // Estimate pages: roughly 6-8 resources per double-column printed page
  const estimatedPages = Math.max(1, Math.ceil(totalSelectedResources / 7));

  const handlePrint = () => {
    if (selected.length === 0) return;
    onConfirmPrint(selected, includeCrisisBanner);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div 
          className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-200 flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md flex-shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  Print Directory of Services
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select which categories to include in your customized printable handout.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Selection Toolbar */}
          <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Quick Select:
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 rounded-md font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Select All ({visibleCategories.length})
              </button>
              <button
                type="button"
                onClick={handleSelectBasicNeeds}
                className="px-2.5 py-1 rounded-md font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 transition-colors"
              >
                Basic Needs (Food/Shelter/Utils)
              </button>
              <button
                type="button"
                onClick={handleSelectRecoveryMentalHealth}
                className="px-2.5 py-1 rounded-md font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/60 transition-colors"
              >
                Recovery &amp; Mental Health
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="px-2 py-1 rounded-md font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="text-xs font-bold text-slate-700">
              <span className="text-emerald-700">{selected.length}</span> of {visibleCategories.length} selected
            </div>
          </div>

          {/* Category Checkboxes List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {visibleCategories.map((cat) => {
                const isSelected = selected.includes(cat.id as ResourceCategory);
                const count = categoryCounts[cat.id] || 0;

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleToggleCategory(cat.id as ResourceCategory)}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 text-slate-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    <div className="pt-0.5 flex-shrink-0">
                      {isSelected ? (
                        <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded border-2 border-slate-300 bg-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 leading-snug">
                          {cat.label}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Options & Print Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Crisis Banner Option */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 self-start sm:self-auto">
              <input
                type="checkbox"
                checked={includeCrisisBanner}
                onChange={(e) => setIncludeCrisisBanner(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="font-medium">
                Include 24/7 Crisis Hotline Box on page 1
              </span>
            </label>

            {/* Print Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={selected.length === 0}
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
                <span>
                  Print Handout ({totalSelectedResources} Listings &bull; ~{estimatedPages} {estimatedPages === 1 ? 'Page' : 'Pages'})
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
