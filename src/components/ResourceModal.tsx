import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, ShieldCheck, Building2, Tag, Phone, MapPin, Clock, Globe, Mail, FileText, Check } from 'lucide-react';
import { Resource, ResourceCategory } from '../types/resource';
import { CATEGORIES } from '../data/categories';

interface ResourceModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  editingResource?: Resource | null;
  defaultCategory?: ResourceCategory | 'all';
  onClose: () => void;
  onSave: (resource: Resource) => void;
}

const VALID_CATEGORIES = CATEGORIES.filter(c => c.id !== 'all');

export const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  mode,
  editingResource,
  defaultCategory,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<ResourceCategory>('recovery');
  const [subcategory, setSubcategory] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [availability, setAvailability] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [bulletPointsText, setBulletPointsText] = useState<string>('');
  const [tagsText, setTagsText] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && editingResource) {
      setName(editingResource.name || '');
      setCategory(editingResource.category);
      setSubcategory(editingResource.subcategory || '');
      setAddress(editingResource.address || '');
      setPhone(editingResource.phone || '');
      setHours(editingResource.hours || '');
      setAvailability(editingResource.availability || '');
      setWebsite(editingResource.website || '');
      setEmail(editingResource.email || '');
      setDescription(editingResource.description || '');
      setBulletPointsText((editingResource.bulletPoints || []).join('\n'));
      setTagsText((editingResource.tags || []).join(', '));
      setNotes(editingResource.notes || '');
      setIsEmergency(Boolean(editingResource.isEmergency));
    } else {
      // Create mode defaults
      const initialCat: ResourceCategory = (defaultCategory && defaultCategory !== 'all') 
        ? defaultCategory 
        : 'recovery';
      setName('');
      setCategory(initialCat);
      setSubcategory('');
      setAddress('');
      setPhone('');
      setHours('');
      setAvailability('');
      setWebsite('');
      setEmail('');
      setDescription('');
      setBulletPointsText('');
      setTagsText('');
      setNotes('');
      setIsEmergency(false);
    }
    setError(null);
  }, [isOpen, mode, editingResource, defaultCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for this community resource.');
      return;
    }

    const categoryMeta = VALID_CATEGORIES.find(c => c.id === category);
    const categoryLabel = categoryMeta ? categoryMeta.label : 'Community Resource';

    // Parse bullet points
    const bulletPoints = bulletPointsText
      .split('\n')
      .map(line => line.trim().replace(/^[-*•]\s*/, ''))
      .filter(line => line.length > 0);

    // Parse tags
    const tags = tagsText
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    // If tags empty, create default from name & category
    if (tags.length === 0) {
      tags.push(category, ...name.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    }

    const resourceId = (mode === 'edit' && editingResource?.id)
      ? editingResource.id
      : `res-${Date.now()}`;

    const updatedResource: Resource = {
      id: resourceId,
      name: name.trim(),
      category,
      categoryLabel,
      subcategory: subcategory.trim() || undefined,
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      hours: hours.trim() || undefined,
      availability: availability.trim() || undefined,
      notes: notes.trim() || undefined,
      description: description.trim() || undefined,
      bulletPoints: bulletPoints.length > 0 ? bulletPoints : undefined,
      website: website.trim() || undefined,
      email: email.trim() || undefined,
      isEmergency,
      tags
    };

    onSave(updatedResource);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 text-white p-5 flex items-center justify-between border-b border-slate-700/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">
                  {mode === 'edit' ? 'Edit Community Resource' : 'Add New Community Resource'}
                </h3>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  <ShieldCheck className="w-3 h-3 text-slate-950" />
                  Super User
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {mode === 'edit' ? `Updating listing: "${editingResource?.name}"` : 'Publish a new verified service to the Ross County directory'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Resource Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Resource / Organization Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Serenity Wellness LLC"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-semibold text-slate-900"
              required
            />
          </div>

          {/* Category & Subcategory Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Directory Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ResourceCategory)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium text-slate-800"
              >
                {VALID_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Subcategory / Program Type <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
                placeholder="e.g. Outpatient & Counseling, Food Pantry"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium"
              />
            </div>
          </div>

          {/* Physical Address & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Physical Address</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. 637 Central Center, Chillicothe, OH 45601"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Direct Phone Number</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. (740) 773-4357"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>
          </div>

          {/* Hours & Availability / Eligibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Operating Hours</span>
              </label>
              <input
                type="text"
                value={hours}
                onChange={e => setHours(e.target.value)}
                placeholder="e.g. Mon-Fri 8:30 AM - 5:00 PM"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Eligibility / Walk-in Status <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={availability}
                onChange={e => setAvailability(e.target.value)}
                placeholder="e.g. Walk-ins welcome, Medicaid accepted"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>
          </div>

          {/* Website & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Website URL</span>
              </label>
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://example.org"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Contact Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="info@organization.org"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Full Description / Summary of Services</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the mission, intake process, treatment programs, food distribution rules, or counseling options..."
              rows={3}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
            />
          </div>

          {/* Key Services (Bullet Points) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Key Services &amp; Programs <span className="text-slate-400 font-normal">(one per line)</span>
            </label>
            <textarea
              value={bulletPointsText}
              onChange={e => setBulletPointsText(e.target.value)}
              placeholder="Intensive Outpatient Program (IOP)&#10;Individual &amp; Family Counseling&#10;Medication-Assisted Treatment (MAT)"
              rows={3}
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
            />
          </div>

          {/* Search Tags & Keywords */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>Search Tags / Keywords <span className="text-slate-400 font-normal">(comma-separated)</span></span>
            </label>
            <input
              type="text"
              value={tagsText}
              onChange={e => setTagsText(e.target.value)}
              placeholder="recovery, counseling, MAT, outpatient, addiction, mental health"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
            />
          </div>

          {/* Special Notes / Warnings */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Special Notes / Intake Instructions <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Call before arrival; photo ID required at intake"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
            />
          </div>

          {/* 24/7 Crisis / Emergency Flag */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                24/7 Emergency / Crisis Service
              </span>
              <span className="text-[11px] text-slate-500 block">
                Highlights this listing with a crisis badge and prioritizes it in emergency searches.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={e => setIsEmergency(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Footer Save Controls */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{mode === 'edit' ? 'Save Changes' : 'Add Resource to Directory'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
