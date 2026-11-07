import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  PlusCircle, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Maximize2, 
  CalendarDays, 
  ListFilter,
  Copy,
  Repeat,
  Columns,
  CalendarCheck,
  Check,
  Filter,
  Download,
  Upload,
  X
} from 'lucide-react';
import { CommunityEvent, EventCategory, getEventCategories } from '../types/event';
import { getEventOccurrences, formatEventDates } from '../utils/eventOccurrences';
import { AuthUser } from '../types/auth';

interface CommunityCalendarProps {
  events: CommunityEvent[];
  onAddEvent: () => void;
  onEditEvent: (event: CommunityEvent) => void;
  onCopyEvent: (event: CommunityEvent) => void;
  onDeleteEvent: (id: string) => void;
  onViewFlyer: (event: CommunityEvent) => void;
  currentUser: AuthUser | null;
  onOpenLogin: () => void;
  onImportEvents?: (events: CommunityEvent[]) => void;
}

type CalendarViewMode = 'month' | 'week' | 'day' | 'list';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ALL_FILTER_CATEGORIES: EventCategory[] = [
  'Recovery',
  'Mental Health',
  'Food',
  'Health',
  'Housing',
  'Community',
  'Family',
];

export const CommunityCalendar: React.FC<CommunityCalendarProps> = ({
  events,
  onAddEvent,
  onEditEvent,
  onCopyEvent,
  onDeleteEvent,
  onViewFlyer,
  currentUser,
  onOpenLogin,
  onImportEvents,
}) => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // Active date cursor
  const [currentDate, setCurrentDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleExportEvents = () => {
    if (!currentUser?.isSuperUser) {
      alert('Exporting community events is restricted to Super User administrator account (rfannin25@gmail.com).');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chillicothe-community-events-${todayString}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    try {
      navigator.clipboard.writeText(JSON.stringify(events, null, 2));
      alert('Success! Downloaded events backup JSON file and copied your events data to the clipboard. You can paste it directly to sync with GitHub!');
    } catch {
      alert('Success! Downloaded events backup JSON file.');
    }
  };

  const handleProcessImport = () => {
    if (!currentUser?.isSuperUser) {
      setImportError('Importing community events is restricted to Super User administrator account (rfannin25@gmail.com).');
      return;
    }
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText.trim());
      if (!Array.isArray(parsed)) {
        setImportError('Invalid format: Expected a JSON array of events.');
        return;
      }
      if (onImportEvents) {
        onImportEvents(parsed);
      }
      setIsImportModalOpen(false);
      setImportJsonText('');
      alert(`Successfully imported ${parsed.length} community events!`);
    } catch (e: any) {
      setImportError(`Failed to parse JSON: ${e.message}`);
    }
  };
  
  // View mode: month | week | day | list
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Multi-select category filters: empty array = ALL categories
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDateString = currentDate.toISOString().split('T')[0];

  // Toggle category filter
  const handleToggleCategoryFilter = (cat: EventCategory) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleClearCategoryFilter = () => {
    setSelectedCategories([]);
  };

  // Filter events based on selected categories
  const filteredEvents = useMemo(() => {
    if (selectedCategories.length === 0) return events;
    return events.filter(evt => {
      const cats = getEventCategories(evt);
      return cats.some(c => selectedCategories.includes(c));
    });
  }, [events, selectedCategories]);

  // Navigation handlers based on current viewMode
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
      setSelectedDayString(null);
    } else if (viewMode === 'week') {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    } else if (viewMode === 'day') {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      setCurrentDate(prev);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
      setSelectedDayString(null);
    } else if (viewMode === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    } else if (viewMode === 'day') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    setSelectedDayString(todayString);
  };

  // Build month calendar matrix
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(currentYear, currentMonth - 1, d);
      days.push({
        date: prevDate,
        dateString: prevDate.toISOString().split('T')[0],
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const thisDate = new Date(currentYear, currentMonth, d);
      days.push({
        date: thisDate,
        dateString: thisDate.toISOString().split('T')[0],
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Next month filler days (to complete 35 or 42 grid cells)
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(currentYear, currentMonth + 1, d);
      days.push({
        date: nextDate,
        dateString: nextDate.toISOString().split('T')[0],
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Build week view days (Sunday through Saturday for the active week)
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay();
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - dayOfWeek);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      week.push({
        date: day,
        dateString: day.toISOString().split('T')[0],
        dayName: DAYS_OF_WEEK[i],
        dayNumber: day.getDate(),
        monthName: MONTH_NAMES[day.getMonth()],
      });
    }
    return week;
  }, [currentDate]);

  // Window bounds for calculating occurrences
  const windowStart = useMemo(() => {
    if (viewMode === 'week') return weekDays[0].dateString;
    if (viewMode === 'day') return currentDateString;
    return calendarDays[0]?.dateString || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  }, [viewMode, weekDays, currentDateString, calendarDays, currentYear, currentMonth]);

  const windowEnd = useMemo(() => {
    if (viewMode === 'week') return weekDays[6].dateString;
    if (viewMode === 'day') return currentDateString;
    return calendarDays[calendarDays.length - 1]?.dateString || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-31`;
  }, [viewMode, weekDays, currentDateString, calendarDays, currentYear, currentMonth]);

  // Map filtered events to dateString for instant lookup across occurrences
  const eventsByDate = useMemo(() => {
    const map: Record<string, CommunityEvent[]> = {};
    filteredEvents.forEach(evt => {
      const occurrences = getEventOccurrences(evt, windowStart, windowEnd);
      occurrences.forEach(occ => {
        if (!map[occ.occurrenceDate]) map[occ.occurrenceDate] = [];
        if (!map[occ.occurrenceDate].some(e => e.id === evt.id)) {
          map[occ.occurrenceDate].push(evt);
        }
      });
    });
    return map;
  }, [filteredEvents, windowStart, windowEnd]);

  // Events filtered by selected date or month
  const activeMonthEvents = useMemo(() => {
    if (selectedDayString) {
      return eventsByDate[selectedDayString] || [];
    }
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const monthEventsSet = new Set<string>();
    const list: CommunityEvent[] = [];

    for (let d = 1; d <= 31; d++) {
      const dayStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
      const dayEvts = eventsByDate[dayStr] || [];
      dayEvts.forEach(evt => {
        if (!monthEventsSet.has(evt.id)) {
          monthEventsSet.add(evt.id);
          list.push(evt);
        }
      });
    }

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [eventsByDate, selectedDayString, currentYear, currentMonth]);

  // Events for day view
  const activeDayEvents = useMemo(() => {
    return eventsByDate[currentDateString] || [];
  }, [eventsByDate, currentDateString]);

  // Sorted list of all upcoming events (for list view)
  const allUpcomingEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredEvents]);

  // Helper for category styling
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

  // Header display string depending on mode
  const headerDateLabel = useMemo(() => {
    if (viewMode === 'month') {
      return `${MONTH_NAMES[currentMonth]} ${currentYear}`;
    }
    if (viewMode === 'week') {
      const start = weekDays[0];
      const end = weekDays[6];
      if (start.date.getMonth() === end.date.getMonth()) {
        return `${start.monthName} ${start.dayNumber} – ${end.dayNumber}, ${end.date.getFullYear()}`;
      }
      return `${start.monthName} ${start.dayNumber} – ${end.monthName} ${end.dayNumber}, ${end.date.getFullYear()}`;
    }
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return `Upcoming Community Events (${filteredEvents.length})`;
  }, [viewMode, currentMonth, currentYear, weekDays, currentDate, filteredEvents.length]);

  return (
    <section className="py-12 sm:py-16 bg-slate-100/70 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title & Add Event CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 mb-2">
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span>Community Calendar &bull; Ross County, OH</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Upcoming Community Events &amp; Announcements
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Find free food distributions, recovery rallies, mental health workshops, and support gatherings across Chillicothe and Ross County.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {currentUser?.isSuperUser && (
              <>
                <button
                  onClick={handleExportEvents}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all shadow-xs cursor-pointer"
                  title="Export events to JSON file or clipboard to sync with GitHub/production (Super User Only)"
                >
                  <Download className="w-3.5 h-3.5 text-amber-700" />
                  <span>Export Events ({events.length})</span>
                </button>

                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all shadow-xs cursor-pointer"
                  title="Import events from JSON (Super User Only)"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-700" />
                  <span>Import Events</span>
                </button>
              </>
            )}

            {currentUser ? (
              <button
                onClick={onAddEvent}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Post Community Event</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-all shadow-xs cursor-pointer"
                title="Sign in with Google to post an event"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Sign In to Post Event</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= CONTROLS ROW: VIEWS & CATEGORY FILTERS ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 mb-6 shadow-xs flex flex-col gap-3">
          
          {/* Top Row: Navigation Controls & 4 View Selectors */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {headerDateLabel}
              </h3>

              {viewMode !== 'list' && (
                <>
                  <button
                    onClick={handleGoToday}
                    className="px-2 py-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Today
                  </button>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={handlePrev}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Previous"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Next"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* 4 View Modes: Month / Week / Day / List */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs self-start sm:self-auto font-bold">
              <button
                onClick={() => setViewMode('month')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Month</span>
              </button>

              <button
                onClick={() => setViewMode('week')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Week</span>
              </button>

              <button
                onClick={() => setViewMode('day')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Day</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>List ({filteredEvents.length})</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Multi-Select Category Filters */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Filter Categories:</span>
            </span>

            {/* "All Categories" Reset Button */}
            <button
              onClick={handleClearCategoryFilter}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedCategories.length === 0
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories ({events.length})
            </button>

            {/* Category Toggle Pills */}
            {ALL_FILTER_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              const matchingCount = events.filter(e => getEventCategories(e).includes(cat)).length;

              return (
                <button
                  key={cat}
                  onClick={() => handleToggleCategoryFilter(cat)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-slate-800 text-emerald-300' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {matchingCount}
                  </span>
                </button>
              );
            })}

            {selectedCategories.length > 0 && (
              <button
                onClick={handleClearCategoryFilter}
                className="text-xs text-rose-600 hover:underline font-bold ml-1"
              >
                Reset Filter
              </button>
            )}
          </div>

        </div>

        {/* ================= VIEW 1: MONTH VIEW ================= */}
        {viewMode === 'month' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Calendar Grid Box (Left 7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
              
              {/* Day of week headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="text-[11px] font-extrabold text-slate-400 uppercase py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Cells Matrix */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((d, index) => {
                  const dayEvents = eventsByDate[d.dateString] || [];
                  const isToday = d.dateString === todayString;
                  const isSelected = d.dateString === selectedDayString;
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedDayString(d.dateString === selectedDayString ? null : d.dateString)}
                      className={`min-h-[64px] sm:min-h-[72px] p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all group ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                          : isToday
                          ? 'border-amber-400 bg-amber-50/40'
                          : d.isCurrentMonth
                          ? 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                          : 'border-transparent text-slate-300 bg-slate-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-bold ${
                          isSelected 
                            ? 'text-emerald-800 font-extrabold' 
                            : isToday 
                            ? 'text-amber-800 font-extrabold px-1.5 py-0.2 rounded-full bg-amber-200' 
                            : d.isCurrentMonth 
                            ? 'text-slate-800' 
                            : 'text-slate-400'
                        }`}>
                          {d.dayNumber}
                        </span>

                        {hasEvents && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Event previews in calendar cell */}
                      <div className="mt-1 space-y-0.5 w-full overflow-hidden">
                        {dayEvents.slice(0, 2).map((evt) => (
                          <div
                            key={evt.id}
                            className="text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-600 text-white truncate leading-tight shadow-2xs flex items-center gap-0.5"
                            title={evt.title}
                          >
                            {evt.recurrence && evt.recurrence !== 'none' && (
                              <Repeat className="w-2 h-2 flex-shrink-0" />
                            )}
                            <span className="truncate">{evt.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] font-bold text-slate-500 text-center leading-tight">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Has Event</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Today</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Repeat className="w-3 h-3 text-purple-600" />
                    <span>Repeating Event</span>
                  </span>
                </div>

                {selectedDayString && (
                  <button
                    onClick={() => setSelectedDayString(null)}
                    className="text-emerald-700 hover:underline font-bold"
                  >
                    Clear Filter (Show All Month)
                  </button>
                )}
              </div>
            </div>

            {/* Event Detail List (Right 5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedDayString ? (
                      <span>Events on {new Date(selectedDayString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    ) : (
                      <span>Events in {MONTH_NAMES[currentMonth]} {currentYear}</span>
                    )}
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {activeMonthEvents.length} {activeMonthEvents.length === 1 ? 'Event' : 'Events'}
                  </span>
                </div>

                {activeMonthEvents.length > 0 ? (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {activeMonthEvents.map((evt) => (
                      <EventCard
                        key={evt.id}
                        event={evt}
                        onEdit={onEditEvent}
                        onCopy={onCopyEvent}
                        onDelete={onDeleteEvent}
                        onViewFlyer={onViewFlyer}
                        getCategoryBadgeClass={getCategoryBadgeClass}
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No events found matching this filter</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Try selecting a different category or click below to post a new event.
                    </p>
                    <button
                      onClick={onAddEvent}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Post Announcement</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ================= VIEW 2: WEEK VIEW ================= */}
        {viewMode === 'week' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {weekDays.map((day) => {
                const dayEvents = eventsByDate[day.dateString] || [];
                const isToday = day.dateString === todayString;

                return (
                  <div
                    key={day.dateString}
                    className={`rounded-xl border p-3 flex flex-col justify-between min-h-[220px] ${
                      isToday
                        ? 'border-amber-400 bg-amber-50/30'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      {/* Day Header */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                        <div>
                          <span className="text-xs font-extrabold text-slate-500 uppercase block">
                            {day.dayName}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {day.monthName.slice(0, 3)}
                          </span>
                        </div>
                        <span className={`text-base font-black px-2 py-0.5 rounded-lg ${
                          isToday ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {day.dayNumber}
                        </span>
                      </div>

                      {/* Day Events List */}
                      <div className="space-y-2">
                        {dayEvents.map((evt) => (
                          <div
                            key={evt.id}
                            className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
                            onClick={() => {
                              setCurrentDate(day.date);
                              setViewMode('day');
                            }}
                          >
                            <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 mb-0.5">
                              {evt.time && <span>{evt.time}</span>}
                            </div>
                            <h5 className="text-xs font-bold text-slate-900 leading-tight line-clamp-2">
                              {evt.title}
                            </h5>
                          </div>
                        ))}

                        {dayEvents.length === 0 && (
                          <span className="text-[11px] text-slate-400 italic block text-center pt-6">
                            No events
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentDate(day.date);
                        setViewMode('day');
                      }}
                      className="mt-3 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 text-center w-full block hover:underline pt-2 border-t border-slate-200/60"
                    >
                      View Day
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= VIEW 3: DAY VIEW ================= */}
        {viewMode === 'day' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Focused Day Schedule
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {headerDateLabel}
                </h3>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                {activeDayEvents.length} {activeDayEvents.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>

            {activeDayEvents.length > 0 ? (
              <div className="space-y-5">
                {activeDayEvents.map((evt) => (
                  <EventCard
                    key={evt.id}
                    event={evt}
                    onEdit={onEditEvent}
                    onCopy={onCopyEvent}
                    onDelete={onDeleteEvent}
                    onViewFlyer={onViewFlyer}
                    getCategoryBadgeClass={getCategoryBadgeClass}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-900">No events scheduled for this day</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  There are no community events matching your category filter on this date.
                </p>
                <button
                  onClick={currentUser ? onAddEvent : onOpenLogin}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{currentUser ? 'Post Event for this Date' : 'Sign In to Post Event'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 4: FULL UPCOMING LIST ================= */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allUpcomingEvents.length > 0 ? (
              allUpcomingEvents.map((evt) => (
                <EventCard
                  key={evt.id}
                  event={evt}
                  onEdit={onEditEvent}
                  onCopy={onCopyEvent}
                  onDelete={onDeleteEvent}
                  onViewFlyer={onViewFlyer}
                  getCategoryBadgeClass={getCategoryBadgeClass}
                  currentUser={currentUser}
                />
              ))
            ) : (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200">
                <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-900">No community events match this filter</h4>
                <p className="text-xs text-slate-500 mt-1">Try resetting the category filter or post a new announcement.</p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={handleClearCategoryFilter}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                  >
                    Reset Filter
                  </button>
                  <button
                    onClick={onAddEvent}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post Community Event</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Import Events Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">Import Community Events JSON</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste your exported events JSON array below to sync or restore events in this environment:
              </p>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {importError}
                </div>
              )}

              <textarea
                value={importJsonText}
                onChange={e => setImportJsonText(e.target.value)}
                placeholder="Paste events JSON array here (starts with [ and ends with ])..."
                rows={8}
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessImport}
                  disabled={!importJsonText.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  Import Events
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

interface EventCardProps {
  event: CommunityEvent;
  onEdit: (event: CommunityEvent) => void;
  onCopy: (event: CommunityEvent) => void;
  onDelete: (id: string) => void;
  onViewFlyer: (event: CommunityEvent) => void;
  getCategoryBadgeClass: (category: string) => string;
  currentUser: AuthUser | null;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onCopy,
  onDelete,
  onViewFlyer,
  getCategoryBadgeClass,
  currentUser,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const isLongDescription = (event.description?.length || 0) > 130 || event.description?.includes('\n');
  const formattedDates = formatEventDates(event.date, event.endDate);
  const isMultiDay = Boolean(event.endDate && event.endDate !== event.date);
  const isRepeating = Boolean(event.recurrence && event.recurrence !== 'none');
  const categories = getEventCategories(event);

  const getRecurrenceLabel = (rec?: string) => {
    switch (rec) {
      case 'daily': return 'Repeats Daily';
      case 'weekly': return 'Repeats Weekly';
      case 'biweekly': return 'Repeats Bi-weekly';
      case 'monthly': return 'Repeats Monthly';
      default: return 'Repeating';
    }
  };

  const mapsUrl = event.location 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      <div>
        {/* Flyer / JPG Image Preview Banner (if uploaded) */}
        {event.imageUrl && (
          <div className="relative h-44 w-full bg-slate-900 overflow-hidden group cursor-pointer" onClick={() => onViewFlyer(event)}>
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-black/60 backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>View Full Details &amp; Flyer</span>
              </span>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-5">
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-1.5 mb-2.5 flex-wrap">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-900 text-white uppercase tracking-wider">
              {formattedDates}
            </span>

            <div className="flex items-center gap-1 flex-wrap">
              {isMultiDay && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                  Multi-Day
                </span>
              )}

              {isRepeating && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
                  <Repeat className="w-2.5 h-2.5" />
                  <span>{getRecurrenceLabel(event.recurrence)}</span>
                </span>
              )}

              {/* Multi-Category Badges */}
              {categories.map((cat) => (
                <span
                  key={cat}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(cat)}`}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Event Title */}
          <h4 className="text-base font-bold text-slate-900 leading-snug tracking-tight mb-2">
            {event.title}
          </h4>

          {/* Time & Location Details */}
          <div className="space-y-1.5 text-xs text-slate-600 mb-3">
            {event.time && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold text-slate-800">{event.time}</span>
              </div>
            )}

            {event.location && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span>{event.location}</span>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 ml-2 text-[10px] font-bold text-emerald-700 hover:underline"
                    >
                      <span>Map</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description Text */}
          <div className="mt-2.5">
            <p className={`text-xs text-slate-600 leading-relaxed ${isExpanded ? 'whitespace-pre-line text-slate-800' : 'line-clamp-3'}`}>
              {event.description}
            </p>
            {isLongDescription && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{isExpanded ? 'Show less' : 'Show more...'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <span className="text-slate-300">&bull;</span>

                <button
                  type="button"
                  onClick={() => onViewFlyer(event)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Full Details &amp; Flyer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Weblink Button */}
        {event.linkUrl ? (
          <a
            href={event.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
          >
            <span>{event.linkLabel || 'Event Website'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-[11px] text-slate-400 italic">Community Announcement</span>
        )}

        {/* Administrator Actions - Strictly limited to logged in users */}
        {currentUser && (
          <div className="flex items-center gap-1">
            {/* Copy Button */}
            <button
              onClick={() => onCopy(event)}
              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Copy / Duplicate this announcement"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Edit Button */}
            <button
              onClick={() => onEdit(event)}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Edit Announcement"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {/* Delete Button */}
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
                  onDelete(event.id);
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Delete Announcement"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
