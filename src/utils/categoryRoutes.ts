import { ResourceCategory } from '../types/resource';

// Mapping from canonical category ID to preferred URL slug
export const CATEGORY_TO_SLUG: Record<ResourceCategory | 'all', string> = {
  all: 'all',
  food: 'foodbanks',
  recovery: 'recovery',
  'sober-living': 'sober-living',
  'mental-health': 'mental-health',
  crisis: 'crisis',
  'blessing-boxes': 'blessing-boxes',
  shelters: 'shelters',
  housing: 'housing',
  landlords: 'landlords',
  'clothing-laundry': 'clothing-laundry',
  utilities: 'utilities',
  medical: 'medical',
  transportation: 'transportation',
  'employment-legal': 'employment-legal',
  nonprofits: 'nonprofits',
  'support-meetings': 'support-meetings',
  churches: 'churches'
};

// Friendly aliases so links like /food, /foodbanks, /food-pantries, /mentalhealth all resolve seamlessly
export const SLUG_TO_CATEGORY: Record<string, ResourceCategory | 'all'> = {
  // All / directory
  all: 'all',
  directory: 'all',
  resources: 'all',

  // Food
  food: 'food',
  foodbanks: 'food',
  'food-banks': 'food',
  'food-pantries': 'food',
  foodpantries: 'food',
  meals: 'food',

  // Recovery
  recovery: 'recovery',
  addiction: 'recovery',
  treatment: 'recovery',
  mat: 'recovery',

  // Sober Living
  'sober-living': 'sober-living',
  soberliving: 'sober-living',
  'recovery-housing': 'sober-living',

  // Mental Health
  'mental-health': 'mental-health',
  mentalhealth: 'mental-health',
  counseling: 'mental-health',
  therapy: 'mental-health',

  // Crisis
  crisis: 'crisis',
  emergency: 'crisis',
  '988': 'crisis',
  hotlines: 'crisis',

  // Blessing Boxes
  'blessing-boxes': 'blessing-boxes',
  blessingboxes: 'blessing-boxes',

  // Shelters
  shelters: 'shelters',
  shelter: 'shelters',
  homeless: 'shelters',

  // Housing
  housing: 'housing',
  apartments: 'housing',

  // Landlords
  landlords: 'landlords',
  landlord: 'landlords',

  // Clothing & Laundry
  'clothing-laundry': 'clothing-laundry',
  clothing: 'clothing-laundry',
  laundry: 'clothing-laundry',
  showers: 'clothing-laundry',

  // Utilities
  utilities: 'utilities',
  utility: 'utilities',
  heap: 'utilities',

  // Medical
  medical: 'medical',
  dental: 'medical',
  clinics: 'medical',
  health: 'medical',

  // Transportation
  transportation: 'transportation',
  transit: 'transportation',
  bus: 'transportation',

  // Employment & Legal
  'employment-legal': 'employment-legal',
  employment: 'employment-legal',
  jobs: 'employment-legal',
  legal: 'employment-legal',

  // Nonprofits
  nonprofits: 'nonprofits',
  charity: 'nonprofits',
  community: 'nonprofits',

  // Support Meetings
  'support-meetings': 'support-meetings',
  meetings: 'support-meetings',
  support: 'support-meetings',
  aa: 'support-meetings',
  na: 'support-meetings',
  '12-step': 'support-meetings',

  // Churches
  churches: 'churches',
  church: 'churches',
  faith: 'churches',
  worship: 'churches',
  ministry: 'churches'
};

/**
 * Given a URL pathname (e.g. "/foodbanks", "/mental-health", or "/"),
 * determine if it corresponds to a category and view.
 */
export function parseRouteFromPath(pathname: string): {
  view: 'landing' | 'directory';
  category: ResourceCategory | 'all';
} {
  const cleanPath = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();

  if (!cleanPath || cleanPath === 'landing') {
    return { view: 'landing', category: 'all' };
  }

  const matchedCategory = SLUG_TO_CATEGORY[cleanPath];
  if (matchedCategory) {
    return { view: 'directory', category: matchedCategory };
  }

  // Fallback: stay on landing
  return { view: 'landing', category: 'all' };
}

/**
 * Return the URL path for a given category and view.
 */
export function getPathForCategory(category: ResourceCategory | 'all', view: 'landing' | 'directory'): string {
  if (view === 'landing') {
    return '/';
  }
  const slug = CATEGORY_TO_SLUG[category] || category;
  return `/${slug}`;
}
