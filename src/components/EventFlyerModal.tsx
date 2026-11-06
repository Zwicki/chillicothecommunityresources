import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface EventFlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export const EventFlyerModal: React.FC<EventFlyerModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print">
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div 
          className="relative max-w-4xl w-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-3 sm:p-4 bg-slate-900 flex items-center justify-between border-b border-slate-800">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate pr-4">
              {title}
            </h4>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full Image */}
          <div className="p-2 sm:p-4 flex items-center justify-center bg-black">
            <img
              src={imageUrl}
              alt={title}
              className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
