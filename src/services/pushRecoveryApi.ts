import { RecoveryMeeting, MeetingProposal, MeetingFlag, FellowshipFilter } from '../types/meeting';
import { EMBEDDED_RECOVERY_MEETINGS } from '../data/embeddedMeetingsSeed';
import { calculateDistanceInMiles, CHILLICOTHE_COORDINATES } from '../utils/geolocation';

const API_BASE_URL = (import.meta.env.VITE_PUSH_RECOVERY_API_URL || '').replace(/\/+$/, '');

const STORAGE_KEYS = {
  CUSTOM_MEETINGS: 'ccr_custom_recovery_meetings',
  PROPOSALS: 'ccr_meeting_proposals',
  FLAGS: 'ccr_meeting_flags',
  DELETED_MEETING_IDS: 'ccr_deleted_meeting_ids'
};

function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving ${key} to localStorage:`, e);
  }
}

/**
 * Fetch recovery meetings from PUSH for Recovery backend, or fallback seamlessly to
 * embedded Ross County seeds + local custom meetings.
 */
export async function fetchMeetings(params?: {
  fellowship?: FellowshipFilter;
  lat?: number;
  lng?: number;
  radius?: number;
}): Promise<RecoveryMeeting[]> {
  const { fellowship = 'all', lat = CHILLICOTHE_COORDINATES.latitude, lng = CHILLICOTHE_COORDINATES.longitude, radius = 50 } = params || {};

  // Try live API if configured
  if (API_BASE_URL) {
    try {
      const url = new URL(`${API_BASE_URL}/api/meetings/directory`);
      if (fellowship !== 'all') url.searchParams.set('fellowship', fellowship);
      if (lat) url.searchParams.set('lat', lat.toString());
      if (lng) url.searchParams.set('lng', lng.toString());
      if (radius) url.searchParams.set('radius', radius.toString());

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout
      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const liveMeetings = data.meetings || (Array.isArray(data) ? data : []);
        if (liveMeetings.length > 0) {
          // Merge with any local custom additions
          return mergeWithLocalCustom(liveMeetings, fellowship, lat, lng, radius);
        }
      }
    } catch (e) {
      console.info('[PUSH for Recovery API] Network fallback to embedded seed:', e);
    }
  }

  // Fallback to embedded seed
  return getFallbackMeetings(fellowship, lat, lng, radius);
}

function getFallbackMeetings(
  fellowship: FellowshipFilter,
  userLat?: number,
  userLng?: number,
  maxRadius = 50
): RecoveryMeeting[] {
  const localCustom = getStorageItem<RecoveryMeeting[]>(STORAGE_KEYS.CUSTOM_MEETINGS, []);
  const deletedIds = new Set(getStorageItem<string[]>(STORAGE_KEYS.DELETED_MEETING_IDS, []));

  const all = [...localCustom, ...EMBEDDED_RECOVERY_MEETINGS].filter(m => !deletedIds.has(m.id));

  return filterAndSortMeetings(all, fellowship, userLat, userLng, maxRadius);
}

function mergeWithLocalCustom(
  liveMeetings: RecoveryMeeting[],
  fellowship: FellowshipFilter,
  userLat?: number,
  userLng?: number,
  maxRadius = 50
): RecoveryMeeting[] {
  const localCustom = getStorageItem<RecoveryMeeting[]>(STORAGE_KEYS.CUSTOM_MEETINGS, []);
  const deletedIds = new Set(getStorageItem<string[]>(STORAGE_KEYS.DELETED_MEETING_IDS, []));

  const liveIds = new Set(liveMeetings.map(m => m.id));
  const uniqueLocal = localCustom.filter(m => !liveIds.has(m.id));

  const combined = [...uniqueLocal, ...liveMeetings].filter(m => !deletedIds.has(m.id));
  return filterAndSortMeetings(combined, fellowship, userLat, userLng, maxRadius);
}

function filterAndSortMeetings(
  meetings: RecoveryMeeting[],
  fellowship: FellowshipFilter,
  userLat?: number,
  userLng?: number,
  maxRadius = 50
): RecoveryMeeting[] {
  let filtered = meetings;

  // Filter by fellowship
  if (fellowship !== 'all') {
    filtered = filtered.filter(m => {
      const f = (m.fellowship || '').toLowerCase();
      if (fellowship === 'aa') return f === 'aa' || !f;
      if (fellowship === 'na') return f === 'na';
      if (fellowship === 'celebrate recovery') return f.includes('celebrate');
      if (fellowship === 'faith-based') return f.includes('faith');
      if (fellowship === 'smart') return f.includes('smart');
      if (fellowship === 'other') return f !== 'aa' && f !== 'na';
      return true;
    });
  }

  // Calculate distance if GPS available
  const withDistance = filtered.map(m => {
    let distance: number | undefined;
    if (userLat != null && userLng != null && m.latitude && m.longitude) {
      distance = calculateDistanceInMiles(userLat, userLng, m.latitude, m.longitude);
    }
    return {
      ...m,
      distance
    };
  });

  // Filter by max radius if distance calculated
  const withinRadius = withDistance.filter(m => {
    if (m.distance == null) return true;
    return m.distance <= maxRadius;
  });

  // Sort: meetings with known distance first (ascending), then fallback
  withinRadius.sort((a, b) => {
    if (a.distance != null && b.distance != null) {
      return a.distance - b.distance;
    }
    if (a.distance != null) return -1;
    if (b.distance != null) return 1;
    return a.day - b.day;
  });

  return withinRadius;
}

/**
 * Submit a meeting proposal (any user)
 */
export async function proposeMeeting(proposalData: {
  name: string;
  day: number;
  time: string;
  fellowship: string;
  types?: string[];
  locationName: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  attendanceOption?: 'in_person' | 'online' | 'hybrid';
  conferenceUrl?: string;
  notes?: string;
  userEmail?: string;
}): Promise<{ success: boolean; message: string; proposal?: MeetingProposal }> {
  const proposal: MeetingProposal = {
    id: `prop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: proposalData.userEmail || 'community_member',
    userEmail: proposalData.userEmail,
    proposedMeeting: {
      ...proposalData,
      attendanceOption: proposalData.attendanceOption || 'in_person',
      source: 'user_submitted'
    },
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Save locally
  const currentProposals = getStorageItem<MeetingProposal[]>(STORAGE_KEYS.PROPOSALS, []);
  currentProposals.unshift(proposal);
  setStorageItem(STORAGE_KEYS.PROPOSALS, currentProposals);

  // If live API configured, push to PUSH for Recovery server
  if (API_BASE_URL) {
    try {
      await fetch(`${API_BASE_URL}/api/meetings/propose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal)
      });
    } catch (e) {
      console.warn('[PUSH for Recovery API] Could not push proposal online; saved locally:', e);
    }
  }

  return {
    success: true,
    message: 'Thank you! Your meeting suggestion has been submitted for review.',
    proposal
  };
}

/**
 * Report an error with an existing meeting (any user)
 */
export async function reportMeetingError(flagData: {
  meetingId: string;
  meetingName: string;
  reason: 'wrong_time' | 'wrong_location' | 'defunct' | 'inappropriate' | 'other';
  details: string;
  userEmail?: string;
}): Promise<{ success: boolean; message: string; flag?: MeetingFlag }> {
  const flag: MeetingFlag = {
    id: `flag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    meetingId: flagData.meetingId,
    meetingName: flagData.meetingName,
    userId: flagData.userEmail || 'community_member',
    userEmail: flagData.userEmail,
    reason: flagData.reason,
    details: flagData.details,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Save locally
  const currentFlags = getStorageItem<MeetingFlag[]>(STORAGE_KEYS.FLAGS, []);
  currentFlags.unshift(flag);
  setStorageItem(STORAGE_KEYS.FLAGS, currentFlags);

  // If live API configured, send to server
  if (API_BASE_URL) {
    try {
      await fetch(`${API_BASE_URL}/api/meetings/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flag)
      });
    } catch (e) {
      console.warn('[PUSH for Recovery API] Could not push flag online; saved locally:', e);
    }
  }

  return {
    success: true,
    message: 'Thank you! Your report has been submitted to administrators for review.',
    flag
  };
}

/**
 * Super User (`rfannin25@gmail.com`): Add a new support meeting directly
 */
export function addDirectMeeting(meetingData: Omit<RecoveryMeeting, 'id'>): RecoveryMeeting {
  const newMeeting: RecoveryMeeting = {
    ...meetingData,
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    source: 'user_submitted'
  };

  const currentMeetings = getStorageItem<RecoveryMeeting[]>(STORAGE_KEYS.CUSTOM_MEETINGS, []);
  currentMeetings.unshift(newMeeting);
  setStorageItem(STORAGE_KEYS.CUSTOM_MEETINGS, currentMeetings);

  // Also push to API if connected
  if (API_BASE_URL) {
    fetch(`${API_BASE_URL}/api/meetings/propose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newMeeting,
        status: 'approved',
        reviewerEmail: 'rfannin25@gmail.com'
      })
    }).catch(e => console.warn('Could not sync meeting with PUSH API:', e));
  }

  return newMeeting;
}

/**
 * Super User: Delete a meeting
 */
export function deleteMeeting(meetingId: string): void {
  // Remove from custom if it exists there
  const custom = getStorageItem<RecoveryMeeting[]>(STORAGE_KEYS.CUSTOM_MEETINGS, []);
  const filteredCustom = custom.filter(m => m.id !== meetingId);
  setStorageItem(STORAGE_KEYS.CUSTOM_MEETINGS, filteredCustom);

  // Add to deletedIds set so embedded meetings can also be hidden
  const deletedIds = getStorageItem<string[]>(STORAGE_KEYS.DELETED_MEETING_IDS, []);
  if (!deletedIds.includes(meetingId)) {
    deletedIds.push(meetingId);
    setStorageItem(STORAGE_KEYS.DELETED_MEETING_IDS, deletedIds);
  }
}

/**
 * Super User: Get moderation queue (proposals and flags)
 */
export async function getModerationQueue(): Promise<{
  proposals: MeetingProposal[];
  flags: MeetingFlag[];
}> {
  let proposals = getStorageItem<MeetingProposal[]>(STORAGE_KEYS.PROPOSALS, []);
  let flags = getStorageItem<MeetingFlag[]>(STORAGE_KEYS.FLAGS, []);

  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/meetings/moderation-queue`);
      if (res.ok) {
        const data = await res.json();
        if (data.proposals) proposals = data.proposals;
        if (data.flags) flags = data.flags;
      }
    } catch (e) {
      console.info('Could not reach remote moderation queue, using local queue');
    }
  }

  return { proposals, flags };
}

/**
 * Super User: Approve or reject proposal
 */
export function moderateProposal(
  proposalId: string,
  action: 'approve' | 'reject',
  reviewerEmail = 'rfannin25@gmail.com'
): void {
  const proposals = getStorageItem<MeetingProposal[]>(STORAGE_KEYS.PROPOSALS, []);
  const idx = proposals.findIndex(p => p.id === proposalId);
  if (idx !== -1) {
    proposals[idx].status = action === 'approve' ? 'approved' : 'rejected';
    proposals[idx].reviewedAt = new Date().toISOString();
    proposals[idx].reviewedBy = reviewerEmail;
    setStorageItem(STORAGE_KEYS.PROPOSALS, proposals);

    if (action === 'approve') {
      const p = proposals[idx];
      const m = p.proposedMeeting;
      if (m) {
        addDirectMeeting({
          name: m.name,
          day: m.day,
          time: m.time,
          endTime: m.endTime,
          timeFormatted: m.timeFormatted || m.time,
          fellowship: m.fellowship,
          types: m.types || ['O'],
          locationName: m.locationName || 'Meeting Venue',
          formattedAddress: m.formattedAddress || '',
          city: m.city || 'Chillicothe',
          state: m.state || 'OH',
          postalCode: m.postalCode || '45601',
          latitude: m.latitude || CHILLICOTHE_COORDINATES.latitude,
          longitude: m.longitude || CHILLICOTHE_COORDINATES.longitude,
          attendanceOption: m.attendanceOption || 'in_person',
          conferenceUrl: m.conferenceUrl,
          notes: m.notes,
          source: 'user_submitted'
        });
      }
    }
  }
}

/**
 * Super User: Resolve or dismiss error flag
 */
export function resolveFlag(
  flagId: string,
  reviewerEmail = 'rfannin25@gmail.com'
): void {
  const flags = getStorageItem<MeetingFlag[]>(STORAGE_KEYS.FLAGS, []);
  const idx = flags.findIndex(f => f.id === flagId);
  if (idx !== -1) {
    flags[idx].status = 'resolved';
    flags[idx].resolvedAt = new Date().toISOString();
    flags[idx].reviewedBy = reviewerEmail;
    setStorageItem(STORAGE_KEYS.FLAGS, flags);
  }
}
