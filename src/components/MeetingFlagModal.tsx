import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { RecoveryMeeting } from '../types/meeting';
import { reportMeetingError } from '../services/pushRecoveryApi';

interface MeetingFlagModalProps {
  meeting: RecoveryMeeting | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail?: string;
}

export const MeetingFlagModal: React.FC<MeetingFlagModalProps> = ({
  meeting,
  isOpen,
  onClose,
  onSuccess,
  userEmail
}) => {
  const [reason, setReason] = useState<'wrong_time' | 'wrong_location' | 'defunct' | 'inappropriate' | 'other'>('wrong_time');
  const [details, setDetails] = useState('');
  const [contactEmail, setContactEmail] = useState(userEmail || '');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !meeting) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reportMeetingError({
        meetingId: meeting.id,
        meetingName: meeting.name,
        reason,
        details: details.trim(),
        userEmail: contactEmail.trim() || undefined
      });

      setSuccessMsg('Thank you. We have received your update and will verify it shortly.');
      setTimeout(() => {
        setSuccessMsg('');
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error reporting meeting flag:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Report an Update or Error</h3>
              <p className="text-xs text-gray-500">Notice incorrect time, address, or canceled meeting?</p>
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
          <div className="py-10 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Report Sent</p>
            <p className="text-xs text-gray-600">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                {meeting.fellowship}
              </span>
              <h4 className="text-sm font-bold text-gray-900">{meeting.name}</h4>
              <p className="text-xs text-gray-600 mt-0.5">{meeting.locationName || meeting.formattedAddress}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                What is the issue? *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="wrong_time">Incorrect time or day</option>
                <option value="wrong_location">Incorrect address or facility name</option>
                <option value="defunct">Meeting no longer meets / permanently canceled</option>
                <option value="inappropriate">Inaccurate or inappropriate listing</option>
                <option value="other">Other detail needs updating</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Please describe the correct information *
              </label>
              <textarea
                required
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g. This meeting now starts at 7:30 PM, or meets in the annex building downstairs..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Your Email (optional)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="youremail@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
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
                className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
