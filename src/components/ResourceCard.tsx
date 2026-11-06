import React from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Globe, 
  Mail, 
  Info, 
  AlertTriangle, 
  ExternalLink, 
  Edit3,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Resource } from '../types/resource';

interface ResourceCardProps {
  resource: Resource;
  onReportInaccuracy: (resource: Resource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onReportInaccuracy,
}) => {
  // Format clean phone for tel link
  const cleanPhone = resource.phone ? resource.phone.replace(/[^0-9+]/g, '') : '';
  const mapsUrl = resource.address 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.address + ', Chillicothe, OH')}`
    : null;

  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
      resource.isEmergency 
        ? 'border-rose-300 ring-1 ring-rose-200 bg-gradient-to-b from-rose-50/30 to-white' 
        : 'border-slate-200/80 hover:border-slate-300'
    }`}>
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider bg-slate-100 text-slate-700">
              {resource.categoryLabel}
            </span>
            {resource.subcategory && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                {resource.subcategory}
              </span>
            )}
          </div>

          {resource.isEmergency && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              24/7 Crisis
            </span>
          )}
        </div>

        {/* Agency / Service Name */}
        <h3 className="text-lg font-bold text-slate-900 leading-snug tracking-tight">
          {resource.name}
        </h3>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {resource.description}
          </p>
        )}

        {/* Bullet Points */}
        {resource.bulletPoints && resource.bulletPoints.length > 0 && (
          <ul className="mt-2.5 space-y-1">
            {resource.bulletPoints.map((bullet, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 leading-snug">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Key Details Grid */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-700">
          
          {/* Address */}
          {resource.address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span>{resource.address}</span>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 ml-2 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Phone */}
          {resource.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              {cleanPhone.length >= 3 ? (
                <a
                  href={`tel:${cleanPhone}`}
                  className="font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                >
                  {resource.phone}
                </a>
              ) : (
                <span className="font-semibold text-slate-800">{resource.phone}</span>
              )}
            </div>
          )}

          {/* Hours & Availability */}
          {(resource.hours || resource.availability) && (
            <div className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                {resource.availability && (
                  <span className="font-semibold text-slate-800 mr-1.5">
                    {resource.availability}
                  </span>
                )}
                {resource.hours && (
                  <span className="text-slate-600">
                    ({resource.hours})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Notes / Eligibility */}
          {resource.notes && (
            <div className="flex items-start gap-2 bg-amber-50/70 text-amber-900 p-2 rounded-lg border border-amber-200/60">
              <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <span className="text-[11px] leading-relaxed">
                <strong>Note:</strong> {resource.notes}
              </span>
            </div>
          )}

          {/* Website / Email */}
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            {resource.website && (
              <a
                href={resource.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                <Globe className="w-3 h-3" />
                <span>Visit Website</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}

            {resource.email && (
              <a
                href={`mailto:${resource.email}`}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:underline"
              >
                <Mail className="w-3 h-3" />
                <span>{resource.email}</span>
              </a>
            )}
          </div>

        </div>
      </div>

      {/* Card Footer: Quick Action & Report Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 no-print">
        {cleanPhone.length >= 3 ? (
          <a
            href={`tel:${cleanPhone}`}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm active:scale-95 flex-1 text-center"
          >
            <Phone className="w-3 h-3" />
            <span>Call Now</span>
          </a>
        ) : (
          <span className="text-[11px] text-slate-400 italic">Direct contact listed above</span>
        )}

        <button
          onClick={() => onReportInaccuracy(resource)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          title="Report outdated hours, phone number, or wrong details"
        >
          <Edit3 className="w-3 h-3 text-slate-400" />
          <span>Report Error</span>
        </button>
      </div>
    </div>
  );
};
