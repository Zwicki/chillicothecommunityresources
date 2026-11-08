import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  Clock,
  Search,
  ExternalLink,
  AlertTriangle,
  PlusCircle,
  ShieldCheck,
  Navigation,
  Globe,
  Trash2,
  CheckCircle,
  Filter
} from 'lucide-react';
import { RecoveryMeeting, FellowshipFilter } from '../types/meeting';
import { fetchMeetings, deleteMeeting, getModerationQueue } from '../services/pushRecoveryApi';
import { getUserLocation, formatDistance, CHILLICOTHE_COORDINATES, Coordinates } from '../utils/geolocation';
import { MeetingProposalModal } from './MeetingProposalModal';
import { MeetingFlagModal } from './MeetingFlagModal';
import { MeetingAdminModal } from './MeetingAdminModal';

interface SupportMeetingsViewProps {
  isSuperUser: boolean;
  userEmail?: string;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const FELLOWSHIP_OPTIONS: { id: FellowshipFilter; label: string; bg: string; text: string }[] = [
  { id: 'all', label: 'All Fellowships', bg: 'bg-gray-100', text: 'text-gray-800' },
  { id: 'aa', label: 'AA (Alcoholics Anonymous)', bg: 'bg-blue-100', text: 'text-blue-800' },
  { id: 'na', label: 'NA (Narcotics Anonymous)', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  { id: 'celebrate recovery', label: 'Celebrate Recovery', bg: 'bg-purple-100', text: 'text-purple-800' },
  { id: 'faith-based', label: 'Faith-Based Recovery', bg: 'bg-amber-100', text: 'text-amber-800' },
  { id: 'smart', label: 'SMART Recovery', bg: 'bg-teal-100', text: 'text-teal-800' },
  { id: 'other', label: 'Other Support Groups', bg: 'bg-indigo-100', text: 'text-indigo-800' }
];

export const SupportMeetingsView: React.FC<SupportMeetingsViewProps> = ({
  isSuperUser,
  userEmail
}) => {
  const [meetings, setMeetings] = useState<RecoveryMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFellowship, setSelectedFellowship] = useState<FellowshipFilter>('all');
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [maxRadius, setMaxRadius] = useState<number>(35);

  // GPS Location state
  const [userCoords, setUserCoords] = useState<Coordinates>(CHILLICOTHE_COORDINATES);
  const [isUsingLiveGps, setIsUsingLiveGps] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Modals
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [flagMeetingTarget, setFlagMeetingTarget] = useState<RecoveryMeeting | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);

  const todayIndex = new Date().getDay();

  // Load meetings
  const loadMeetingsData = async () => {
    setLoading(true);
    try {
      const data = await fetchMeetings({
        fellowship: selectedFellowship,
        lat: userCoords.latitude,
        lng: userCoords.longitude,
        radius: maxRadius
      });
      setMeetings(data);
    } catch (e) {
      console.error('Error fetching meetings:', e);
    } finally {
      setLoading(false);
    }
  };

  // Check admin moderation queue count
  const checkAdminQueue = async () => {
    if (!isSuperUser) return;
    try {
      const q = await getModerationQueue();
      const pendingCount =
        (q.proposals?.filter((p) => p.status === 'pending').length || 0) +
        (q.flags?.filter((f) => f.status === 'pending').length || 0);
      setPendingQueueCount(pendingCount);
    } catch (e) {
      console.warn('Queue check error:', e);
    }
  };

  useEffect(() => {
    loadMeetingsData();
    checkAdminQueue();
  }, [selectedFellowship, userCoords, maxRadius]);

  // Request browser GPS
  const handleRequestGps = async () => {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const coords = await getUserLocation();
      setUserCoords(coords);
      setIsUsingLiveGps(true);
    } catch (err: any) {
      console.warn('GPS error:', err);
      setGpsError('Could not obtain device location. Using Ross County center.');
      setIsUsingLiveGps(false);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleResetToChillicothe = () => {
    setUserCoords(CHILLICOTHE_COORDINATES);
    setIsUsingLiveGps(false);
    setGpsError(null);
  };

  // Filter meetings by search and day
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      // Day filter
      if (selectedDay !== 'all' && m.day !== selectedDay) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = [
          m.name,
          m.locationName,
          m.location,
          m.formattedAddress,
          m.city,
          m.notes,
          m.fellowship
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [meetings, selectedDay, searchQuery]);

  const handleDeleteMeeting = (meeting: RecoveryMeeting) => {
    if (window.confirm(`Are you sure you want to remove "${meeting.name}" from the support meetings directory?`)) {
      deleteMeeting(meeting.id);
      loadMeetingsData();
    }
  };

  const getFellowshipStyle = (f?: string) => {
    const lower = (f || '').toLowerCase();
    if (lower === 'aa') return { label: 'Alcoholics Anonymous', bg: 'bg-blue-100 text-blue-900 border-blue-200' };
    if (lower === 'na') return { label: 'Narcotics Anonymous', bg: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
    if (lower.includes('celebrate')) return { label: 'Celebrate Recovery', bg: 'bg-purple-100 text-purple-900 border-purple-200' };
    if (lower.includes('faith')) return { label: 'Faith-Based Recovery', bg: 'bg-amber-100 text-amber-900 border-amber-200' };
    if (lower.includes('smart')) return { label: 'SMART Recovery', bg: 'bg-teal-100 text-teal-900 border-teal-200' };
    return { label: f || 'Support Group', bg: 'bg-indigo-100 text-indigo-900 border-indigo-200' };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Location & Admin Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4 text-teal-400" />
              <span>Ross County Recovery Meeting Finder</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Support & 12-Step Meetings
            </h2>
            <p className="text-sm text-indigo-200 max-w-2xl mt-1">
              Find local AA, NA, Celebrate Recovery, and Faith-Based support groups with verified times,
              venues, and live GPS distances across Chillicothe and Ross County.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsProposalModalOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm transition-all border border-white/20 flex items-center space-x-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-teal-300" />
              <span>Suggest a Meeting</span>
            </button>

            {isSuperUser && (
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-md"
              >
                <ShieldCheck className="w-4 h-4 text-amber-950" />
                <span>Admin Console</span>
                {pendingQueueCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-extrabold animate-pulse">
                    {pendingQueueCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* GPS Control bar */}
        <div className="mt-5 pt-4 border-t border-indigo-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${isUsingLiveGps ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-indigo-200'}`}>
              <Navigation className="w-3.5 h-3.5" />
            </div>
            <span>
              {isUsingLiveGps ? (
                <span className="text-emerald-300 font-semibold">Live GPS Active</span>
              ) : (
                <span className="text-indigo-200">
                  Location: <span className="text-white font-medium">Downtown Chillicothe</span>
                </span>
              )}
            </span>

            {isUsingLiveGps ? (
              <button
                onClick={handleResetToChillicothe}
                className="text-xs text-indigo-300 hover:text-white underline ml-2"
              >
                Reset to Chillicothe
              </button>
            ) : (
              <button
                onClick={handleRequestGps}
                disabled={gpsLoading}
                className="px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/30 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50"
              >
                {gpsLoading ? 'Detecting...' : 'Use My GPS'}
              </button>
            )}
          </div>

          {/* Radius selector */}
          <div className="flex items-center space-x-2">
            <span className="text-indigo-300">Radius:</span>
            <div className="inline-flex rounded-lg bg-indigo-950/40 p-0.5 border border-indigo-700/50">
              {[10, 25, 35, 50].map((r) => (
                <button
                  key={r}
                  onClick={() => setMaxRadius(r)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                    maxRadius === r
                      ? 'bg-teal-400 text-indigo-950 font-bold shadow-sm'
                      : 'text-indigo-200 hover:text-white'
                  }`}
                >
                  {r} mi
                </button>
              ))}
            </div>
          </div>
        </div>

        {gpsError && (
          <p className="mt-2 text-xs text-amber-300 bg-amber-900/40 p-2 rounded-lg border border-amber-700/50">
            {gpsError}
          </p>
        )}
      </div>

      {/* Filter Bar: Fellowship Pills */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-4">
        {/* Fellowship chips */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Select Fellowship or Recovery Program</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {FELLOWSHIP_OPTIONS.map((f) => {
              const active = selectedFellowship === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFellowship(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day of Week Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Day of the Week</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors border ${
                selectedDay === 'all'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Days
            </button>
            {DAYS_OF_WEEK.map((dayName, idx) => {
              const isToday = idx === todayIndex;
              const active = selectedDay === idx;
              return (
                <button
                  key={dayName}
                  onClick={() => setSelectedDay(idx)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors border relative ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {dayName}
                  {isToday && (
                    <span
                      className={`ml-1.5 text-[10px] px-1 py-0.2 rounded font-bold uppercase ${
                        active ? 'bg-indigo-800 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetings by keyword, church or facility name, city..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <div>
          Showing <span className="font-bold text-gray-900">{filteredMeetings.length}</span> support meetings
          {selectedDay !== 'all' && (
            <span>
              {' '}on <span className="font-semibold text-indigo-600">{DAYS_OF_WEEK[selectedDay]}s</span>
            </span>
          )}
          {userCoords && <span> sorted by closest distance</span>}
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-indigo-600 hover:underline"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Meeting Cards Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">Loading support meetings directory...</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <Compass className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No meetings found</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-4">
            No meetings matched your current filters. Try expanding the radius or clearing the search.
          </p>
          <button
            onClick={() => {
              setSelectedFellowship('all');
              setSelectedDay('all');
              setSearchQuery('');
              setMaxRadius(50);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeetings.map((meeting) => {
            const fellowshipStyle = getFellowshipStyle(meeting.fellowship);
            const isToday = meeting.day === todayIndex;
            const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${meeting.locationName || ''} ${meeting.formattedAddress || ''}`.trim()
            )}`;

            return (
              <div
                key={meeting.id}
                className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Distance Ribbon / Top header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${fellowshipStyle.bg}`}
                    >
                      {fellowshipStyle.label}
                    </span>

                    {meeting.attendanceOption === 'online' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                        Online / Zoom
                      </span>
                    )}
                    {meeting.attendanceOption === 'hybrid' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                        Hybrid
                      </span>
                    )}
                  </div>

                  {meeting.distance != null && (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100 flex-shrink-0">
                      <MapPin className="w-3 h-3 text-indigo-500" />
                      <span>{formatDistance(meeting.distance)}</span>
                    </span>
                  )}
                </div>

                {/* Day & Time bar */}
                <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-900 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{DAYS_OF_WEEK[meeting.day]}s</span>
                  <span className="text-gray-300">•</span>
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{meeting.timeFormatted || meeting.time}</span>
                  {isToday && (
                    <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-500 text-white uppercase tracking-wider">
                      Today
                    </span>
                  )}
                </div>

                {/* Meeting Name */}
                <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                  {meeting.name}
                </h3>

                {/* Location details */}
                <div className="text-xs text-gray-600 space-y-1 mb-3 flex-1">
                  <div className="font-semibold text-gray-800 flex items-start space-x-1">
                    <span className="text-gray-400">🏛️</span>
                    <span>{meeting.locationName || meeting.location || 'Meeting Venue'}</span>
                  </div>
                  {meeting.formattedAddress && (
                    <div className="text-gray-500 pl-4 text-[11px] leading-relaxed">
                      {meeting.formattedAddress}
                    </div>
                  )}
                </div>

                {/* Notes if available */}
                {meeting.notes && (
                  <div className="bg-amber-50/70 border border-amber-200/70 rounded-lg p-2.5 text-xs text-amber-900 mb-3 leading-relaxed">
                    <p className="font-medium">{meeting.notes}</p>
                  </div>
                )}

                {/* Action footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center space-x-2">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </a>

                    {meeting.conferenceUrl && (
                      <a
                        href={meeting.conferenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setFlagMeetingTarget(meeting)}
                      title="Report an error or updated time for this meeting"
                      className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>

                    {isSuperUser && (
                      <button
                        onClick={() => handleDeleteMeeting(meeting)}
                        title="Delete meeting (Super User)"
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <MeetingProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onSuccess={loadMeetingsData}
        userEmail={userEmail}
      />

      <MeetingFlagModal
        meeting={flagMeetingTarget}
        isOpen={!!flagMeetingTarget}
        onClose={() => setFlagMeetingTarget(null)}
        onSuccess={loadMeetingsData}
        userEmail={userEmail}
      />

      <MeetingAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onRefreshMeetings={() => {
          loadMeetingsData();
          checkAdminQueue();
        }}
      />
    </div>
  );
};
