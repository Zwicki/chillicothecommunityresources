import { 
  AlertCircle, 
  HeartHandshake, 
  Brain, 
  Utensils, 
  Gift, 
  Home, 
  Building2, 
  Key, 
  Shirt, 
  Zap, 
  Stethoscope, 
  Bus, 
  Briefcase, 
  Users,
  Compass,
  Church
} from 'lucide-react';
import { ResourceCategory } from '../types/resource';

export interface CategoryMeta {
  id: ResourceCategory | 'all';
  label: string;
  shortLabel: string;
  iconName: string;
  description: string;
  badgeColor: string;
  borderColor: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'all',
    label: 'All Resources',
    shortLabel: 'All',
    iconName: 'Users',
    description: 'Complete directory of all community programs, shelters, health, and services in Chillicothe & Ross County',
    badgeColor: 'bg-slate-100 text-slate-800',
    borderColor: 'border-slate-300'
  },
  {
    id: 'crisis',
    label: 'Crisis & Emergency Hotlines',
    shortLabel: 'Crisis & 988',
    iconName: 'AlertCircle',
    description: '24/7 emergency hotlines, domestic violence shelters, suicide prevention, and immediate safety interventions',
    badgeColor: 'bg-rose-100 text-rose-800',
    borderColor: 'border-rose-400'
  },
  {
    id: 'recovery',
    label: 'Addiction Recovery & Treatment',
    shortLabel: 'Recovery & MAT',
    iconName: 'HeartHandshake',
    description: 'Medication-Assisted Treatment (MAT), peer support, inpatient rehab, and outpatient substance use recovery programs',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    borderColor: 'border-emerald-400'
  },
  {
    id: 'sober-living',
    label: 'Sober Living & Recovery Housing',
    shortLabel: 'Sober Living',
    iconName: 'Home',
    description: 'Certified alcohol- and drug-free recovery residences, managed transitional houses, and sober living in Ross County',
    badgeColor: 'bg-teal-100 text-teal-800',
    borderColor: 'border-teal-400'
  },
  {
    id: 'mental-health',
    label: 'Mental Health & Counseling',
    shortLabel: 'Mental Health',
    iconName: 'Brain',
    description: 'Outpatient individual/family counseling, psychiatry, specialized child therapy, and psychiatric medication management',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    borderColor: 'border-indigo-400'
  },
  {
    id: 'food',
    label: 'Food Pantries & Free Meals',
    shortLabel: 'Food & Meals',
    iconName: 'Utensils',
    description: 'Emergency grocery pantries, monthly fresh produce distributions, hot daily community dinners, and free breakfast',
    badgeColor: 'bg-amber-100 text-amber-800',
    borderColor: 'border-amber-400'
  },
  {
    id: 'blessing-boxes',
    label: 'Blessing Boxes (24/7 Free Pantries)',
    shortLabel: 'Blessing Boxes',
    iconName: 'Gift',
    description: '21 outdoor 24/7 walk-up mini food pantries and blessing boxes across Ross County with zero paperwork',
    badgeColor: 'bg-teal-100 text-teal-800',
    borderColor: 'border-teal-400'
  },
  {
    id: 'shelters',
    label: 'Homeless Shelters & Emergency Housing',
    shortLabel: 'Shelters',
    iconName: 'Home',
    description: 'Emergency overnight homeless shelters for men, women, children, youth, and families',
    badgeColor: 'bg-orange-100 text-orange-800',
    borderColor: 'border-orange-400'
  },
  {
    id: 'housing',
    label: 'Housing & Apartment Complexes',
    shortLabel: 'Apartments',
    iconName: 'Building2',
    description: 'Income-based, subsidized, senior (55+/62+), disabled, and public housing apartment communities in Ross County',
    badgeColor: 'bg-blue-100 text-blue-800',
    borderColor: 'border-blue-400'
  },
  {
    id: 'landlords',
    label: 'Private Landlords Registry',
    shortLabel: 'Landlords',
    iconName: 'Key',
    description: 'Direct contact numbers for private local landlords and property managers renting homes and apartments in Chillicothe',
    badgeColor: 'bg-cyan-100 text-cyan-800',
    borderColor: 'border-cyan-400'
  },
  {
    id: 'clothing-laundry',
    label: 'Clothing, Laundry & Showers',
    shortLabel: 'Clothing & Hygiene',
    iconName: 'Shirt',
    description: 'Free community laundry nights, clothing closets, vouchers, and walk-in hot shower facilities',
    badgeColor: 'bg-purple-100 text-purple-800',
    borderColor: 'border-purple-400'
  },
  {
    id: 'utilities',
    label: 'Utility Assistance & Financial Aid',
    shortLabel: 'Utilities',
    iconName: 'Zap',
    description: 'HEAP emergency heating/electric payment relief, shut-off prevention, PIPP Plus, and church assistance funds',
    badgeColor: 'bg-yellow-100 text-yellow-900',
    borderColor: 'border-yellow-400'
  },
  {
    id: 'medical',
    label: 'Medical & Dental Free Clinics',
    shortLabel: 'Medical / Dental',
    iconName: 'Stethoscope',
    description: 'Free healthcare clinics for the uninsured, free prescription charitable pharmacy, dental extractions, and Narcan kits',
    badgeColor: 'bg-red-100 text-red-800',
    borderColor: 'border-red-400'
  },
  {
    id: 'transportation',
    label: 'Public Transit & Medical Rides',
    shortLabel: 'Transportation',
    iconName: 'Bus',
    description: 'City bus schedules, Ride Pingo on-demand van transit, Medicaid non-emergency medical transportation, and mobility help',
    badgeColor: 'bg-sky-100 text-sky-800',
    borderColor: 'border-sky-400'
  },
  {
    id: 'employment-legal',
    label: 'Employment & Free Legal Aid',
    shortLabel: 'Jobs & Legal',
    iconName: 'Briefcase',
    description: 'OhioMeansJobs career navigation and free civil legal aid representation (SEOLS) for evictions and benefits',
    badgeColor: 'bg-stone-100 text-stone-800',
    borderColor: 'border-stone-400'
  },
  {
    id: 'nonprofits',
    label: 'Community Nonprofits & Foundations',
    shortLabel: 'Nonprofits',
    iconName: 'Users',
    description: 'Local 501(c)(3) charities, youth mentoring, developmental disabilities, humane society, and community endowments',
    badgeColor: 'bg-lime-100 text-lime-800',
    borderColor: 'border-lime-400'
  },
  {
    id: 'support-meetings',
    label: 'Support Meetings (AA, NA & Recovery)',
    shortLabel: 'Support Meetings',
    iconName: 'Compass',
    description: 'Live GPS directory of AA, NA, Celebrate Recovery, SMART, and faith-based 12-step support meetings across Ross County',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    borderColor: 'border-indigo-400'
  },
  {
    id: 'churches',
    label: 'Churches & Faith Communities',
    shortLabel: 'Churches',
    iconName: 'Church',
    description: 'Comprehensive directory of churches, chapels, and faith communities in Chillicothe and Ross County with pastors and service times',
    badgeColor: 'bg-amber-100 text-amber-900',
    borderColor: 'border-amber-400'
  }
];
