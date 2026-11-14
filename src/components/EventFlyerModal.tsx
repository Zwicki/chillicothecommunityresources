import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Maximize2, 
  Copy, 
  Edit3, 
  Repeat,
  Image as ImageIcon,
  Share2,
  Check,
  Link as LinkIcon
} from 'lucide-react';
import { CommunityEvent, getEventCategories } from '../types/event';
import { formatEventDates } from '../utils/eventOccurrences';
import { AuthUser } from '../types/auth';
import { shareEventToFacebook, copyEventLinkToClipboard } from '../utils/facebookShare';

interface EventFlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CommunityEvent | null;
  onEdit?: (event: CommunityEvent) => void;
  onCopy?: (event: CommunityEvent) => void;
  currentUser?: AuthUser | null;
}

export const EventFlyerModal: React.FC<EventFlyerModalProps> = ({
  isOpen,
  onClose,
  event,
  onEdit,
  onCopy,
  currentUser,
}) => {
  if (!isOpen || !event) return null;

  const [hasCopied, setHasCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [event?.id, event?.imageUrl]);

  const hasValidImage = Boolean(event.imageUrl && !imageError);

  const handleCopyLink = async () => {
    if (!event) return;
    const ok = await copyEventLinkToClipboard(event.id);
    if (ok) {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const categories = getEventCategories(event);
  const formattedDates = formatEventDates(event.date, event.endDate);
  const isMultiDay = Boolean(event.endDate && event.endDate !== event.date);
  const isRepeating = Boolean(event.recurrence && event.recurrence !== 'none');

  const mapsUrl = event.location 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
    : null;

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Recovery': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Mental Health': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Food': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Health': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Housing': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Family': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRecurrenceLabel = (rec?: string) => {
    switch (rec) {
      case 'daily': return 'Repeats Daily';
      case 'weekly': return 'Repeats Weekly';
      case 'biweekly': return 'Repeats Bi-weekly';
      case 'monthly': return 'Repeats Monthly';
      default: return 'Repeating';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div 
          className={`relative w-full ${hasValidImage ? 'max-w-5xl' : 'max-w-2xl'} bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 text-left animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar */}
          <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0 pr-4">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 uppercase tracking-wider">
                Event Announcement
              </span>
              <h3 className="text-sm font-bold truncate text-slate-100">
                {event.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Main Content */}
          <div className="overflow-y-auto flex-1">
            <div className={`grid grid-cols-1 ${hasValidImage ? 'md:grid-cols-12' : ''}`}>
              
              {/* Left Column: Event Flyer / Image Preview */}
              {hasValidImage && (
                <div className="md:col-span-6 bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 border-b md:border-b-0 md:border-r border-slate-800 relative group min-h-[320px]">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    onError={() => setImageError(true)}
                    className="max-h-[65vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl transition-transform duration-300"
                  />
                  <a
                    href={event.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer shadow-md"
                    title="Open original flyer in a new tab"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Full Size Flyer</span>
                  </a>
                </div>
              )}

              {/* Right Column: Full Event Information & Description */}
              <div className={`${hasValidImage ? 'md:col-span-6' : 'w-full'} p-6 sm:p-8 flex flex-col justify-between bg-white`}>
                <div className="space-y-5">
                  
                  {/* Badges Bar */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-slate-950 text-white">
                      {formattedDates}
                    </span>

                    {isMultiDay && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                        Multi-Day Event
                      </span>
                    )}

                    {isRepeating && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        <span>{getRecurrenceLabel(event.recurrence)}</span>
                      </span>
                    )}

                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getCategoryBadgeClass(cat)}`}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {event.title}
                  </h2>

                  {/* Logistics Card (Date, Time, Location) */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-4 space-y-3">
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800 font-semibold">
                      <CalendarIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{formattedDates}</span>
                    </div>

                    {event.time && (
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800 font-semibold">
                        <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{event.time}</span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="font-medium">{event.location}</span>
                          {mapsUrl && (
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 ml-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
                            >
                              <span>Open in Maps</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Full Description Details */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Event Details &amp; Description
                    </h4>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto">
                      {event.description}
                    </div>
                  </div>

                </div>

                {/* Footer Controls */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Share to Facebook */}
                    <button
                      type="button"
                      onClick={() => shareEventToFacebook(event)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] shadow-sm transition-all active:scale-95 cursor-pointer"
                      title="Share this event on Facebook"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>Share to Facebook</span>
                    </button>

                    {/* Copy Direct Link */}
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
                      title="Copy link to this event"
                    >
                      {hasCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    {event.linkUrl && (
                      <a
                        href={event.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all shadow-xs active:scale-95 cursor-pointer"
                      >
                        <span>{event.linkLabel || 'Event Link'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Admin Edit/Copy */}
                    {currentUser && onCopy && (
                      <button
                        onClick={() => {
                          onCopy(event);
                          onClose();
                        }}
                        className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                        title="Duplicate announcement"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}

                    {currentUser && onEdit && (
                      <button
                        onClick={() => {
                          onEdit(event);
                          onClose();
                        }}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                        title="Edit announcement"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
