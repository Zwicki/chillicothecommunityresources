import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, PlusCircle, CheckCircle2, Trash2, Check, Clock, AlertTriangle } from 'lucide-react';
import { RecoveryMeeting, MeetingProposal, MeetingFlag, FellowshipType } from '../types/meeting';
import {
  addDirectMeeting,
  getModerationQueue,
  moderateProposal,
  resolveFlag
} from '../services/pushRecoveryApi';

interface MeetingAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshMeetings: () => void;
}

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const MeetingAdminModal: React.FC<MeetingAdminModalProps> = ({
  isOpen,
  onClose,
  onRefreshMeetings
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'proposals' | 'flags'>('add');
  const [proposals, setProposals] = useState<MeetingProposal[]>([]);
  const [flags, setFlags] = useState<MeetingFlag[]>([]);

  // Add Meeting Form State
  const [name, setName] = useState('');
  const [fellowship, setFellowship] = useState<FellowshipType>('Celebrate Recovery');
  const [day, setDay] = useState<number>(0);
  const [time, setTime] = useState('19:00');
  const [locationName, setLocationName] = useState('');
  const [formattedAddress, setFormattedAddress] = useState('');
  const [attendanceOption, setAttendanceOption] = useState<'in_person' | 'online' | 'hybrid'>('in_person');
  const [conferenceUrl, setConferenceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const loadQueue = async () => {
    try {
      const q = await getModerationQueue();
      setProposals(q.proposals || []);
      setFlags(q.flags || []);
    } catch (e) {
      console.warn('Error loading queue:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadQueue();
      setSuccessNotice('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !locationName.trim()) return;

    const [hStr, mStr] = time.split(':');
    const hour = parseInt(hStr, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const h12 = hour % 12 || 12;
    const timeFormatted = `${h12}:${mStr} ${ampm}`;

    addDirectMeeting({
      name: name.trim(),
      day,
      time,
      timeFormatted,
      fellowship,
      types: ['O', 'D'],
      locationName: locationName.trim(),
      formattedAddress: formattedAddress.trim() || 'Chillicothe, OH',
      city: 'Chillicothe',
      state: 'OH',
      postalCode: '45601',
      latitude: 39.3331,
      longitude: -82.9824,
      attendanceOption,
      conferenceUrl: conferenceUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      source: 'user_submitted'
    });

    setSuccessNotice(`Meeting "${name}" added to the directory!`);
    setName('');
    setLocationName('');
    setFormattedAddress('');
    setConferenceUrl('');
    setNotes('');
    onRefreshMeetings();

    setTimeout(() => {
      setSuccessNotice('');
    }, 2500);
  };

  const handleModerateProposal = (id: string, action: 'approve' | 'reject') => {
    moderateProposal(id, action);
    loadQueue();
    onRefreshMeetings();
  };

  const handleResolveFlag = (id: string) => {
    resolveFlag(id);
    loadQueue();
  };

  const pendingProposals = proposals.filter((p) => p.status === 'pending');
  const pendingFlags = flags.filter((f) => f.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-900">Support Meetings Administrator</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
                  Super User
                </span>
              </div>
              <p className="text-xs text-gray-500">Add non-AA/NA meetings, moderate community proposals, and review flags</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 mt-4 flex-shrink-0">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center space-x-1.5 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'add'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Meeting</span>
          </button>

          <button
            onClick={() => setActiveTab('proposals')}
            className={`flex items-center space-x-1.5 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'proposals'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Suggested Meetings</span>
            {pendingProposals.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-600 text-white font-bold">
                {pendingProposals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('flags')}
            className={`flex items-center space-x-1.5 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'flags'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Error Reports</span>
            {pendingFlags.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-600 text-white font-bold">
                {pendingFlags.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab contents */}
        <div className="overflow-y-auto flex-1 mt-4 pr-1">
          {activeTab === 'add' && (
            <form onSubmit={handleAddDirect} className="space-y-4">
              {successNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Meeting Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Celebrate Recovery at Brookside"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Fellowship / Category *
                  </label>
                  <select
                    value={fellowship}
                    onChange={(e) => setFellowship(e.target.value as FellowshipType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Celebrate Recovery">Celebrate Recovery</option>
                    <option value="Faith-based Recovery Support Group">Faith-Based Recovery</option>
                    <option value="AA">Alcoholics Anonymous (AA)</option>
                    <option value="NA">Narcotics Anonymous (NA)</option>
                    <option value="SMART Recovery">SMART Recovery</option>
                    <option value="Al-Anon">Al-Anon Family Groups</option>
                    <option value="Other">Other Community Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Day of Week *
                  </label>
                  <select
                    value={day}
                    onChange={(e) => setDay(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {DAYS.map((d, idx) => (
                      <option key={d} value={idx}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Meeting Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Attendance Option
                  </label>
                  <select
                    value={attendanceOption}
                    onChange={(e) => setAttendanceOption(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="in_person">In Person</option>
                    <option value="online">Online / Virtual</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Venue / Church Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Open Door Church"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formattedAddress}
                    onChange={(e) => setFormattedAddress(e.target.value)}
                    placeholder="e.g. 75 N Paint St, Chillicothe, OH 45601"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Website or Zoom Link (optional)
                </label>
                <input
                  type="url"
                  value={conferenceUrl}
                  onChange={(e) => setConferenceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Notes & Details (Meal times, childcare, formats)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Free dinner served at 5:30 PM. Men's and Women's open share groups."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Meeting Directly</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'proposals' && (
            <div className="space-y-3">
              {pendingProposals.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                  <p className="text-sm">No pending user suggestions at this time.</p>
                </div>
              ) : (
                pendingProposals.map((prop) => {
                  const m = prop.proposedMeeting;
                  return (
                    <div
                      key={prop.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            {m.fellowship || prop.fellowship}
                          </span>
                          <span className="text-xs text-gray-500">
                            {DAYS[m.day]} at {m.timeFormatted || m.time}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">{m.name}</h4>
                        <p className="text-xs text-gray-600">{m.locationName} - {m.formattedAddress}</p>
                        {m.notes && <p className="text-xs text-gray-500 italic">"{m.notes}"</p>}
                        {prop.userEmail && (
                          <p className="text-[11px] text-gray-400">Submitted by: {prop.userEmail}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleModerateProposal(prop.id, 'approve')}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center space-x-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleModerateProposal(prop.id, 'reject')}
                          className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300 transition-colors flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'flags' && (
            <div className="space-y-3">
              {pendingFlags.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                  <p className="text-sm">No outstanding error reports.</p>
                </div>
              ) : (
                pendingFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                          {flag.reason.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(flag.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">{flag.meetingName}</h4>
                      <p className="text-xs text-gray-700">{flag.details}</p>
                      {flag.userEmail && (
                        <p className="text-[11px] text-gray-400">Reported by: {flag.userEmail}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleResolveFlag(flag.id)}
                      className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-semibold hover:bg-gray-900 transition-colors flex items-center space-x-1 flex-shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
