import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle2, Send } from 'lucide-react';
import { UserFeedback } from '../types/resource';
import { CATEGORIES } from '../data/categories';

interface SuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuggestion: (feedback: UserFeedback) => void;
}

export const SuggestModal: React.FC<SuggestModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuggestion,
}) => {
  if (!isOpen) return null;

  const [suggestedName, setSuggestedName] = useState('');
  const [category, setCategory] = useState('food');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('');
  const [details, setDetails] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterContact, setSubmitterContact] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestedName.trim() || !details.trim()) return;

    const feedback: UserFeedback = {
      feedbackType: 'new_resource',
      suggestedName: suggestedName.trim(),
      category,
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      hours: hours.trim() || undefined,
      details: details.trim(),
      name: submitterName.trim() || undefined,
      contactEmail: submitterContact.trim() || undefined,
      submittedAt: new Date().toISOString()
    };

    onSubmitSuggestion(feedback);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setSuggestedName('');
      setAddress('');
      setPhone('');
      setHours('');
      setDetails('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">Suggest a Community Resource</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-emerald-200 hover:text-white rounded-lg p-1 hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900">Thank you for contributing!</h4>
            <p className="text-xs text-slate-600 mt-1">
              <strong>{suggestedName}</strong> has been submitted. Our team will verify and add it to the directory.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organization / Service Name *
              </label>
              <input
                required
                type="text"
                value={suggestedName}
                onChange={(e) => setSuggestedName(e.target.value)}
                placeholder="e.g. Hope Food Pantry or New Life Counseling"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 740-xxx-xxxx"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operating Hours / Schedule
                </label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="e.g. Mon-Fri 9am-4pm"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Street Address / Location
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 123 Main St., Chillicothe, OH 45601"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brief Description of Services Provided *
              </label>
              <textarea
                required
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="What assistance do they offer? Who is eligible? Any costs or voucher requirements?"
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
                  placeholder="Your name"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Contact Email (Optional)
                </label>
                <input
                  type="text"
                  value={submitterContact}
                  onChange={(e) => setSubmitterContact(e.target.value)}
                  placeholder="In case we verify details"
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
                <span>Submit Resource</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
