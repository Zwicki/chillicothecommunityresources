export type ResourceCategory =
  | 'crisis'
  | 'recovery'
  | 'sober-living'
  | 'mental-health'
  | 'food'
  | 'blessing-boxes'
  | 'shelters'
  | 'housing'
  | 'landlords'
  | 'clothing-laundry'
  | 'utilities'
  | 'medical'
  | 'transportation'
  | 'employment-legal'
  | 'nonprofits'
  | 'support-meetings'
  | 'churches';

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  categoryLabel: string;
  subcategory?: string;
  address?: string;
  phone?: string;
  hours?: string;
  availability?: string;
  notes?: string;
  description?: string;
  bulletPoints?: string[];
  website?: string;
  email?: string;
  isEmergency?: boolean;
  tags: string[];
  pastorName?: string;
  denomination?: string;
  serviceTimes?: string;
}

export interface UserFeedback {
  resourceId?: string;
  resourceName?: string;
  feedbackType: 'correction' | 'new_resource';
  name?: string;
  contactEmail?: string;
  suggestedName?: string;
  category?: string;
  address?: string;
  phone?: string;
  hours?: string;
  notes?: string;
  details: string;
  submittedAt: string;
}
