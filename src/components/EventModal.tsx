import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Upload, 
  AlertCircle, 
  Check, 
  Trash2,
  Repeat,
  Copy,
  Tag
} from 'lucide-react';
import { CommunityEvent, RecurrenceFrequency, EventCategory, getEventCategories } from '../types/event';
import { addMonths } from '../utils/eventOccurrences';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEvent: (event: CommunityEvent) => void;
  editingEvent?: CommunityEvent | null;
  mode?: 'create' | 'edit' | 'copy';
}

const ALL_CATEGORIES: EventCategory[] = [
  'Recovery',
  'Mental Health',
  'Food',
  'Health',
  'Housing',
  'Community',
  'Family',
];

const RECURRENCE_OPTIONS: Array<{ value: RecurrenceFrequency; label: string }> = [
  { value: 'none', label: 'Does not repeat (One-time event)' },
  { value: 'weekly', label: 'Repeats Weekly (Every week)' },
  { value: 'biweekly', label: 'Repeats Bi-weekly (Every 2 weeks)' },
  { value: 'monthly', label: 'Repeats Monthly (Same day each month)' },
  { value: 'daily', label: 'Repeats Daily' },
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSaveEvent,
  editingEvent,
  mode = 'create',
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>(['Community']);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('Event Website');
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency>('none');
  const [recurrenceEnd, setRecurrenceEnd] = useState('');
  const [error, setError] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-populate if editing or copying
  useEffect(() => {
    if (editingEvent) {
      if (mode === 'copy') {
        setTitle(`${editingEvent.title} (Copy)`);
      } else {
        setTitle(editingEvent.title || '');
      }
      setDate(editingEvent.date || '');
      setEndDate(editingEvent.endDate || '');
      setTime(editingEvent.time || '');
      setLocation(editingEvent.location || '');
      setSelectedCategories(getEventCategories(editingEvent));
      setDescription(editingEvent.description || '');
      setImageUrl(editingEvent.imageUrl || '');
      setLinkUrl(editingEvent.linkUrl || '');
      setLinkLabel(editingEvent.linkLabel || 'Event Website');
      setRecurrence(editingEvent.recurrence || 'none');
      setRecurrenceEnd(editingEvent.recurrenceEnd || '');
    } else {
      // Defaults for new event
      setTitle('');
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setEndDate('');
      setTime('');
      setLocation('');
      setSelectedCategories(['Community']);
      setDescription('');
      setImageUrl('');
      setLinkUrl('');
      setLinkLabel('Event Website');
      setRecurrence('none');
      setRecurrenceEnd('');
    }
    setError('');
  }, [editingEvent, mode, isOpen]);

  const handleToggleCategory = (cat: EventCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) {
        setError('At least one category must be selected.');
        return;
      }
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
      setError('');
    }
  };

  // When user switches recurrence from 'none' to something else, suggest default repeatEnd of 3 months
  const handleRecurrenceChange = (newRec: RecurrenceFrequency) => {
    setRecurrence(newRec);
    if (newRec !== 'none' && !recurrenceEnd) {
      const baseDate = date || new Date().toISOString().split('T')[0];
      setRecurrenceEnd(addMonths(baseDate, 3));
    }
  };

  if (!isOpen) return null;

  // Handle local image file upload (converts to compressed base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setImageUrl(dataUrl);
          setError('');
        } else {
          setImageUrl(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an event title.');
      return;
    }
    if (!date) {
      setError('Please choose a start date.');
      return;
    }
    if (endDate && endDate < date) {
      setError('End date cannot be earlier than the start date.');
      return;
    }
    if (selectedCategories.length === 0) {
      setError('Please select at least one category.');
      return;
    }
    if (recurrence !== 'none' && recurrenceEnd && recurrenceEnd < date) {
      setError('Repeat until date must be after the start date.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide announcement details / description.');
      return;
    }

    let formattedLink = linkUrl.trim();
    if (formattedLink && !formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
      formattedLink = 'https://' + formattedLink;
    }

    // Determine ID: If mode is copy or create, generate brand new ID
    const eventId = mode === 'edit' && editingEvent ? editingEvent.id : `evt-${Date.now()}`;

    const newEvent: CommunityEvent = {
      id: eventId,
      title: title.trim(),
      date,
      endDate: endDate.trim() || undefined,
      time: time.trim() || undefined,
      location: location.trim() || undefined,
      categories: selectedCategories,
      category: selectedCategories[0],
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      linkUrl: formattedLink || undefined,
      linkLabel: linkLabel.trim() || 'Event Website',
      recurrence: recurrence !== 'none' ? recurrence : undefined,
      recurrenceEnd: recurrence !== 'none' && recurrenceEnd ? recurrenceEnd : undefined,
      createdAt: mode === 'edit' && editingEvent ? editingEvent.createdAt : new Date().toISOString(),
    };

    onSaveEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div 
          className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-200 flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
                {mode === 'copy' ? (
                  <Copy className="w-5 h-5 text-white" />
                ) : (
                  <Calendar className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold leading-tight">
                  {mode === 'copy' 
                    ? 'Copy Community Event / Announcement'
                    : mode === 'edit' 
                    ? 'Edit Community Event / Announcement' 
                    : 'Post Community Event / Announcement'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {mode === 'copy'
                    ? 'Duplicate this announcement with new dates or updated details.'
                    : 'Publish upcoming rallies, food drops, mental health workshops, and meetings.'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Event Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ross County Recovery Celebration &amp; Mental Health Workshop"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
              />
            </div>

            {/* Start Date, End Date, Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={date}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="For multi-day"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">For multi-day events</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Time (Optional)
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 10am - 1pm"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Multi-Select Categories Section */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Select Categories * (Choose 1 or more)</span>
                </label>
                <span className="text-[11px] font-bold text-emerald-700">
                  {selectedCategories.length} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {ALL_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => handleToggleCategory(cat)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs ring-2 ring-emerald-500/30'
                          : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded border border-slate-300 bg-white" />
                      )}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                You can tag events with multiple relevant categories (e.g. both Recovery and Mental Health).
              </p>
            </div>

            {/* Repeating Event / Recurrence Configuration */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70">
              <div className="flex items-center gap-2 mb-2">
                <Repeat className="w-4 h-4 text-emerald-600" />
                <label className="text-xs font-bold text-slate-800">
                  Repeat / Recurring Event
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Recurrence Schedule
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) => handleRecurrenceChange(e.target.value as RecurrenceFrequency)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  >
                    {RECURRENCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {recurrence !== 'none' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Repeat Until (End Date)
                    </label>
                    <input
                      type="date"
                      min={date}
                      value={recurrenceEnd}
                      onChange={(e) => setRecurrenceEnd(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Event will automatically repeat across the calendar up to this date.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location / Address
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Yoctangee Park Shelterhouse, Chillicothe, OH 45601"
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Event Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Announcement Details / Description *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the upcoming event, activities, who is invited, if food or transportation is provided, registration instructions, etc."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium leading-relaxed"
              />
            </div>

            {/* Image (JPG / PNG Flyer) Section */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Event Flyer / JPG Image (Optional)</span>
                </label>
                
                <div className="flex items-center text-[11px] font-semibold gap-1">
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    className={`px-2 py-0.5 rounded ${imageTab === 'upload' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Upload JPG/PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`px-2 py-0.5 rounded ${imageTab === 'url' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {imageTab === 'upload' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer transition-colors bg-white flex flex-col items-center justify-center gap-1"
                  >
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">Click to upload JPG / PNG image or flyer</span>
                    <span className="text-[10px] text-slate-400">Supports standard JPG, JPEG, PNG</span>
                  </div>
                </div>
              ) : (
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/flyer.jpg"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              )}

              {/* Image Preview */}
              {imageUrl && (
                <div className="mt-2.5 relative inline-block group">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-28 w-auto max-w-full rounded-lg object-cover border border-slate-300 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md shadow-md hover:bg-rose-700 transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Web Link Section */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Weblink / External Info (Optional)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="e.g. https://www.facebook.com/events/... or organization site"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={linkLabel}
                    onChange={(e) => setLinkLabel(e.target.value)}
                    placeholder="Button label e.g. Register Here"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>
                  {mode === 'copy' 
                    ? 'Publish Copied Event' 
                    : mode === 'edit' 
                    ? 'Save Changes' 
                    : 'Publish Announcement'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
