export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

export type EventCategory = 
  | 'Recovery'
  | 'Mental Health'
  | 'Food'
  | 'Health'
  | 'Housing'
  | 'Community'
  | 'Family';

export interface CommunityEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (Start Date)
  endDate?: string; // YYYY-MM-DD (Optional End Date for multi-day events)
  time?: string; // e.g. "10:00 AM - 1:00 PM"
  location?: string;
  categories: EventCategory[]; // Supports 1 or more categories
  category?: EventCategory; // Backward compatibility
  description: string;
  imageUrl?: string; // JPG / PNG base64 or external URL
  linkUrl?: string; // External web link
  linkLabel?: string; // Custom button label e.g. "Event Website", "Sign Up"
  recurrence?: RecurrenceFrequency; // 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'
  recurrenceEnd?: string; // YYYY-MM-DD (Optional date when recurrence finishes)
  createdAt: string;
}

export const getEventCategories = (event: CommunityEvent): EventCategory[] => {
  if (Array.isArray(event.categories) && event.categories.length > 0) {
    return event.categories;
  }
  if (event.category) {
    return [event.category];
  }
  return ['Community'];
};
