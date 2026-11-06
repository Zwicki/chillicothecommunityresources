import React from 'react';

interface PrintHeaderProps {
  activeCategoryLabel: string;
  totalCount: number;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({
  activeCategoryLabel,
  totalCount,
}) => {
  return (
    <div className="print-only mb-6 border-b-2 border-black pb-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-black">
            Chillicothe & Ross County Community Resources
          </h1>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">
            Category: {activeCategoryLabel} ({totalCount} Listings)
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            Provided as a free public community resource guide for residents and case managers.
          </p>
        </div>
        <div className="text-right text-xs">
          <p className="font-bold">Printed: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Emergency Strip */}
      <div className="mt-3 p-2 border border-black bg-gray-100 flex justify-between text-xs font-bold">
        <span>24/7 Suicide & Crisis: Dial 988</span>
        <span>Ross County Crisis: (740) 773-4357</span>
        <span>Community Help: Dial 211</span>
        <span>Domestic Violence: (740) 637-1610</span>
      </div>
    </div>
  );
};
