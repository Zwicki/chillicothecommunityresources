import React, { useState } from 'react';
import { X, Send, Compass } from 'lucide-react';
import { FellowshipType } from '../types/meeting';
import { proposeMeeting } from '../services/pushRecoveryApi';

interface MeetingProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail?: string;
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

export const MeetingProposalModal: React.FC<MeetingProposalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userEmail
}) => {
  const [name, setName] = useState('');
  const [fellowship, setFellowship] = useState<FellowshipType>('AA');
  const [day, setDay] = useState<number>(new Date().getDay());
  const [time, setTime] = useState('19:00');
  const [locationName, setLocationName] = useState('');
  const [formattedAddress, setFormattedAddress] = useState('');
  const [attendanceOption, setAttendanceOption] = useState<'in_person' | 'online' | 'hybrid'>('in_person');
  const [conferenceUrl, setConferenceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [contactEmail, setContactEmail] = useState(userEmail || '');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !locationName.trim()) return;

    setSubmitting(true);
    try {
      // Calculate friendly time string (e.g. 7:00 pm)
      const [hStr, mStr] = time.split(':');
      const hour = parseInt(hStr, 10);
      const ampm = hour >= 12 ? 'pm' : 'am';
      const h12 = hour % 12 || 12;
      const timeFormatted = `${h12}:${mStr} ${ampm}`;

      await proposeMeeting({
        name: name.trim(),
        fellowship,
        day,
        time,
        locationName: locationName.trim(),
        formattedAddress: formattedAddress.trim() || 'Chillicothe, OH',
        attendanceOption,
        conferenceUrl: conferenceUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        userEmail: contactEmail.trim() || undefined
      });

      setSuccessMsg('Thank you! Your meeting suggestion has been submitted for review.');
      setTimeout(() => {
        setSuccessMsg('');
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error submitting proposal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Suggest a Support Meeting</h3>
              <p className="text-xs text-gray-500">Help keep Ross County recovery meetings accurate and accessible</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-gray-900 mb-1">Proposal Submitted!</p>
            <p className="text-sm text-gray-600">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Meeting Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hope & Serenity Big Book Study"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Fellowship *
                </label>
                <select
                  value={fellowship}
                  onChange={(e) => setFellowship(e.target.value as FellowshipType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="AA">Alcoholics Anonymous (AA)</option>
                  <option value="NA">Narcotics Anonymous (NA)</option>
                  <option value="Celebrate Recovery">Celebrate Recovery</option>
                  <option value="Faith-based Recovery Support Group">Faith-Based Recovery</option>
                  <option value="SMART Recovery">SMART Recovery</option>
                  <option value="Al-Anon">Al-Anon Family Groups</option>
                  <option value="Other">Other Community Support Group</option>
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
                  Attendance Type
                </label>
                <select
                  value={attendanceOption}
                  onChange={(e) => setAttendanceOption(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="in_person">In Person</option>
                  <option value="online">Online / Zoom</option>
                  <option value="hybrid">Hybrid (Both)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Facility / Church / Venue Name *
              </label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Chillicothe Alano Club or Brookside Church"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Street Address & City
              </label>
              <input
                type="text"
                value={formattedAddress}
                onChange={(e) => setFormattedAddress(e.target.value)}
                placeholder="e.g. 291 S Paint St, Chillicothe, OH 45601"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {attendanceOption !== 'in_person' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Online / Zoom Link
                </label>
                <input
                  type="url"
                  value={conferenceUrl}
                  onChange={(e) => setConferenceUrl(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Notes / Special Details (optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Free dinner before meeting; entrance around back; wheelchair accessible"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Your Email (optional, for verification)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="youremail@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Suggestion'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
