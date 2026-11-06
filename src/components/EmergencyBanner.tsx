import React from 'react';
import { PhoneCall, ShieldAlert, Heart, LifeBuoy } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  return (
    <div className="bg-rose-900 text-white shadow-lg border-b border-rose-800 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          
          {/* Title & Badge */}
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-400"></span>
            </span>
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-rose-200">
              <ShieldAlert className="w-4 h-4 text-rose-300" />
              <span>Immediate 24/7 Crisis Assistance:</span>
            </div>
          </div>

          {/* Quick Click-to-Call Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            
            {/* 988 */}
            <a 
              href="tel:988" 
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-rose-900 font-extrabold rounded-full hover:bg-rose-50 transition-all shadow-sm active:scale-95"
              title="Call or Text 988 Suicide & Crisis Lifeline"
            >
              <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              <span>Suicide & Crisis: <strong>988</strong></span>
            </a>

            {/* Local 24hr Crisis Line */}
            <a 
              href="tel:7407734357" 
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-800 hover:bg-rose-700 text-rose-100 font-bold rounded-full transition-all border border-rose-700/60 active:scale-95"
              title="Call Ross County Local 24hr Crisis Hotline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-300" />
              <span>Ross Co Crisis: <strong>(740) 773-4357</strong></span>
            </a>

            {/* 211 */}
            <a 
              href="tel:211" 
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-800 hover:bg-rose-700 text-rose-100 font-bold rounded-full transition-all border border-rose-700/60 active:scale-95"
              title="Call 2-1-1 for Community Resources"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-amber-300" />
              <span>Community 2-1-1: <strong>Dial 211</strong></span>
            </a>

            {/* DV Shelter */}
            <a 
              href="tel:7406371610" 
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-800 hover:bg-rose-700 text-rose-100 font-bold rounded-full transition-all border border-rose-700/60 active:scale-95"
              title="Call The Rose House Domestic Violence Shelter"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
              <span>DV Shelter (Rose House): <strong>(740) 637-1610</strong></span>
            </a>

          </div>

        </div>
      </div>
    </div>
  );
};
