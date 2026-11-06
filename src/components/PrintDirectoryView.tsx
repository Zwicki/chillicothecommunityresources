import React from 'react';
import { Resource, ResourceCategory } from '../types/resource';
import { CATEGORIES, CategoryMeta } from '../data/categories';

interface PrintDirectoryViewProps {
  allResources: Resource[];
  selectedCategoryIds: ResourceCategory[];
  includeCrisisBanner: boolean;
}

export const PrintDirectoryView: React.FC<PrintDirectoryViewProps> = ({
  allResources,
  selectedCategoryIds,
  includeCrisisBanner,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Filter categories to only those selected, in default display order
  const categoriesToRender = CATEGORIES.filter(c => 
    c.id !== 'all' && selectedCategoryIds.includes(c.id as ResourceCategory)
  );

  // Calculate total resources being printed
  const totalPrintedCount = categoriesToRender.reduce((sum, cat) => {
    const count = allResources.filter(r => {
      if (cat.id === 'nonprofits') {
        return r.category === 'nonprofits' || (r.tags && r.tags.includes('nonprofit'));
      }
      return r.category === cat.id;
    }).length;
    return sum + count;
  }, 0);

  return (
    <div className="print-only font-sans text-black bg-white p-0">
      {/* ================= PRINT COVER / HEADER ================= */}
      <div className="border-b-2 border-black pb-3 mb-4 print-avoid-break">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img 
              src="./images/life-recovery-society-logo.png" 
              alt="Life Recovery Society" 
              className="h-20 sm:h-24 w-auto object-contain flex-shrink-0"
            />
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-black leading-tight">
                Chillicothe &amp; Ross County Community Resource Directory
              </h1>
              <p className="text-xs font-bold text-gray-800 mt-0.5">
                Life Recovery Society &bull; Community Resource Network
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                Verified public community resources for clients, families, caseworkers, clinics, and intake desks.
              </p>
            </div>
          </div>
          <div className="text-right text-[10px] font-bold text-gray-700 flex-shrink-0">
            <p>Printed: {currentDate}</p>
            <p>{categoriesToRender.length} Categories &bull; {totalPrintedCount} Listings</p>
          </div>
        </div>

        {/* 24/7 Crisis Hotline Strip */}
        {includeCrisisBanner && (
          <div className="mt-2.5 p-2 border border-black bg-gray-100 rounded text-[10px] font-bold leading-tight">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-gray-600 uppercase text-[9px] block">24/7 Suicide &amp; Crisis:</span>
                <span className="text-black text-xs font-black">Dial 988</span>
              </div>
              <div>
                <span className="text-gray-600 uppercase text-[9px] block">Ross Co 24/7 Crisis Line:</span>
                <span className="text-black text-xs font-black">(740) 773-4357</span>
              </div>
              <div>
                <span className="text-gray-600 uppercase text-[9px] block">Community Info &amp; Referral:</span>
                <span className="text-black text-xs font-black">Dial 2-1-1</span>
              </div>
              <div>
                <span className="text-gray-600 uppercase text-[9px] block">Domestic Violence Shelter:</span>
                <span className="text-black text-xs font-black">(740) 637-1610</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= CATEGORY SECTIONS ================= */}
      {categoriesToRender.map((category: CategoryMeta) => {
        const resources = allResources.filter(r => {
          if (category.id === 'nonprofits') {
            return r.category === 'nonprofits' || (r.tags && r.tags.includes('nonprofit'));
          }
          return r.category === category.id;
        });

        if (resources.length === 0) return null;

        return (
          <div key={category.id} className="mb-6">
            {/* Category Banner */}
            <div className="border-b-2 border-black pb-1 mb-3 pt-2 print-avoid-break">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-black">
                  {category.label}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
                  {resources.length} {resources.length === 1 ? 'Listing' : 'Listings'}
                </span>
              </div>
              <p className="text-[10px] text-gray-600 italic">
                {category.description} &bull; Please call to confirm hours and intake eligibility prior to traveling.
              </p>
            </div>

            {/* Resources 2-Column Clean Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="print-avoid-break border border-gray-300 rounded p-2 text-[10px] leading-snug bg-white"
                >
                  {/* Title & Subcategory */}
                  <div className="flex items-baseline justify-between gap-1 border-b border-gray-200 pb-1 mb-1">
                    <h3 className="font-bold text-xs text-black leading-tight">
                      {res.name}
                    </h3>
                    {res.subcategory && (
                      <span className="text-[9px] font-semibold text-gray-600 uppercase tracking-tight flex-shrink-0">
                        [{res.subcategory}]
                      </span>
                    )}
                  </div>

                  {/* Primary Contact Details */}
                  <div className="space-y-0.5">
                    {res.phone && (
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-black text-[10px]">Phone:</span>
                        <span className="font-bold text-black text-[11px]">{res.phone}</span>
                      </div>
                    )}

                    {res.address && (
                      <div className="flex items-baseline gap-1">
                        <span className="font-semibold text-gray-700">Address:</span>
                        <span className="text-gray-900">{res.address}</span>
                      </div>
                    )}

                    {(res.hours || res.availability) && (
                      <div className="flex items-baseline gap-1">
                        <span className="font-semibold text-gray-700">Hours:</span>
                        <span className="text-gray-900">
                          {res.availability ? `${res.availability} ` : ''}
                          {res.hours ? `(${res.hours})` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description / Bullet Points */}
                  {res.description && (
                    <p className="text-gray-800 mt-1 line-clamp-3">
                      {res.description}
                    </p>
                  )}

                  {res.bulletPoints && res.bulletPoints.length > 0 && (
                    <ul className="mt-1 list-disc list-inside text-gray-800 space-y-0.5">
                      {res.bulletPoints.slice(0, 3).map((b, i) => (
                        <li key={i} className="line-clamp-1">{b}</li>
                      ))}
                    </ul>
                  )}

                  {/* Notes / Eligibility Box */}
                  {res.notes && (
                    <div className="mt-1 p-1 bg-gray-50 border border-gray-200 rounded text-[9px] text-gray-800">
                      <span className="font-bold">Note: </span>
                      <span>{res.notes}</span>
                    </div>
                  )}

                  {/* Web / Email text */}
                  {(res.website || res.email) && (
                    <div className="mt-1 pt-1 border-t border-gray-100 text-[9px] text-gray-600 flex flex-wrap gap-x-2">
                      {res.website && (
                        <span>
                          <strong>Web:</strong> {res.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                        </span>
                      )}
                      {res.email && (
                        <span>
                          <strong>Email:</strong> {res.email}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* ================= PRINT FOOTER ================= */}
      <div className="mt-6 pt-3 border-t border-gray-400 text-center text-[9px] text-gray-600 print-avoid-break">
        <p className="font-semibold">
          Chillicothe &amp; Ross County Community Resource Directory &bull; In Partnership with Life Recovery Society
        </p>
        <p>
          Always call agencies directly prior to traveling to confirm current hours, intake rules, and service availability.
        </p>
      </div>
    </div>
  );
};
