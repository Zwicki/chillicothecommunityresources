import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { Resource, UserFeedback } from '../types/resource';

interface FeedbackModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (feedback: UserFeedback) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  resource,
  isOpen,
  onClose,
  onSubmitFeedback,
}) => {
  if (!isOpen || !resource) return null;

  const [issueType, setIssueType] = useState<string>('hours');
  const [details, setDetails] = useState<string>('');
  const [submitterName, setSubmitterName] = useState<string>('');
  const [submitterContact, setSubmitterContact] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    const feedback: UserFeedback = {
      feedbackType: 'correction',
      resourceId: resource.id,
      resourceName: resource.name,
      name: submitterName.trim() || undefined,
      contactEmail: submitterContact.trim() || undefined,
      details: `[Issue Type: ${issueType}] ${details.trim()}`,
      submittedAt: new Date().toISOString()
    };

    onSubmitFeedback(feedback);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setDetails('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Report Inaccurate Information</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900">Thank you for your help!</h4>
            <p className="text-xs text-slate-600 mt-1">
              Your correction for <strong>{resource.name}</strong> has been recorded and will be reviewed by our directory team.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Resource Name
              </label>
              <div className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                {resource.name}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                What information is inaccurate?
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="hours">Outdated or Incorrect Hours</option>
                <option value="phone">Wrong / Disconnected Phone Number</option>
                <option value="address">Wrong Location / Moved Address</option>
                <option value="service">Services or Eligibility Changed</option>
                <option value="closed">Agency / Program is Permanently Closed</option>
                <option value="other">Other Information Needs Update</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correction Details & Correct Info *
              </label>
              <textarea
                required
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please describe what should be updated (e.g. 'New phone number is 740-xxx-xxxx' or 'Hours changed to Tue/Thur only')..."
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="e.g. Case Worker Jane"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Email / Phone (Optional)
                </label>
                <input
                  type="text"
                  value={submitterContact}
                  onChange={(e) => setSubmitterContact(e.target.value)}
                  placeholder="In case we have questions"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Correction</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
