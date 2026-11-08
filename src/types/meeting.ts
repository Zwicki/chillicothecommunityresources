export type FellowshipType = 
  | 'AA'
  | 'NA'
  | 'Celebrate Recovery'
  | 'Faith-based Recovery Support Group'
  | 'Faith-based'
  | 'SMART Recovery'
  | 'Al-Anon'
  | 'Other';

export type FellowshipFilter = 
  | 'all'
  | 'aa'
  | 'na'
  | 'celebrate recovery'
  | 'cr'
  | 'faith-based'
  | 'faith'
  | 'smart'
  | 'other';

export interface RecoveryMeeting {
  id: string;
  name: string;
  day: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  time: string; // 24-hour HH:MM or 12-hour
  endTime?: string;
  timeFormatted?: string; // Formatted 12-hour e.g. "7:00 PM"
  durationMinutes?: number;
  fellowship: string; // 'AA' | 'NA' | 'Celebrate Recovery' | 'Faith-based' | 'SMART Recovery' | etc.
  types?: string[]; // Meeting format codes e.g. ['O', 'D', 'W', 'M', '12']
  location?: string;
  locationName?: string;
  formattedAddress?: string;
  formatted_address?: string; // Compatibility
  city?: string;
  state?: string;
  postalCode?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  distanceMiles?: number;
  attendanceOption?: 'in_person' | 'online' | 'hybrid';
  conferenceUrl?: string; // Virtual meeting link (Zoom, etc.)
  conference_url?: string;
  notes?: string;
  source?: string;
}

export interface MeetingProposal {
  id: string;
  name?: string;
  fellowship?: string;
  day?: number;
  time?: string;
  locationName?: string;
  address?: string;
  city?: string;
  state?: string;
  conferenceUrl?: string;
  notes?: string;
  userId?: string;
  userEmail?: string;
  proposedMeeting?: any;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface MeetingFlag {
  id: string;
  meetingId: string;
  meetingName: string;
  reason: 'closed' | 'wrong_time' | 'wrong_location' | 'defunct' | 'inappropriate' | 'format_change' | 'other';
  details: string;
  userId?: string;
  userEmail?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  submittedAt?: string;
  createdAt: string;
  resolvedAt?: string;
  reviewedBy?: string;
}
