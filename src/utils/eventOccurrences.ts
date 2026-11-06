import { CommunityEvent, RecurrenceFrequency } from '../types/event';

export interface EventOccurrence {
  event: CommunityEvent;
  occurrenceDate: string; // YYYY-MM-DD
  isRecurrenceInstance: boolean;
}

// Add days to a YYYY-MM-DD string
export const addDays = (dateStr: string, days: number): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
};

// Add months to a YYYY-MM-DD string (preserving day where possible)
export const addMonths = (dateStr: string, months: number): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1 + months, day));
  return d.toISOString().split('T')[0];
};

// Formats date or date range for human display
export const formatEventDates = (startDate: string, endDate?: string): string => {
  if (!startDate) return '';
  
  const startParts = startDate.split('-').map(Number);
  const startObj = new Date(startParts[0], startParts[1] - 1, startParts[2]);

  const startFormatted = startObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (!endDate || endDate === startDate) {
    return startFormatted;
  }

  const endParts = endDate.split('-').map(Number);
  const endObj = new Date(endParts[0], endParts[1] - 1, endParts[2]);

  const endFormatted = endObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${startFormatted} – ${endFormatted}`;
};

// Returns all dates an event occurs on within an active date window
export const getEventOccurrences = (
  event: CommunityEvent,
  windowStart: string,
  windowEnd: string
): EventOccurrence[] => {
  const occurrences: EventOccurrence[] = [];
  const baseStart = event.date;
  const baseEnd = event.endDate && event.endDate >= baseStart ? event.endDate : baseStart;
  const recurrence: RecurrenceFrequency = event.recurrence || 'none';

  // Case 1: Non-repeating multi-day or single-day event
  if (recurrence === 'none') {
    let curr = baseStart;
    while (curr <= baseEnd) {
      if (curr >= windowStart && curr <= windowEnd) {
        occurrences.push({
          event,
          occurrenceDate: curr,
          isRecurrenceInstance: curr !== baseStart,
        });
      }
      curr = addDays(curr, 1);
    }
    return occurrences;
  }

  // Case 2: Repeating events
  const recurrenceLimit = event.recurrenceEnd || addMonths(baseStart, 6); // Max 6 months if not specified
  const effectiveEnd = recurrenceLimit < windowEnd ? recurrenceLimit : windowEnd;

  let currentInstanceStart = baseStart;
  const multiDayDuration = Math.max(0, Math.round((new Date(baseEnd).getTime() - new Date(baseStart).getTime()) / (1000 * 60 * 60 * 24)));
  let safetyCounter = 0;

  while (currentInstanceStart <= effectiveEnd && safetyCounter < 100) {
    safetyCounter++;
    
    // Add all days for this instance if multi-day
    for (let dayOffset = 0; dayOffset <= multiDayDuration; dayOffset++) {
      const occurrenceDay = addDays(currentInstanceStart, dayOffset);
      if (occurrenceDay >= windowStart && occurrenceDay <= windowEnd) {
        occurrences.push({
          event,
          occurrenceDate: occurrenceDay,
          isRecurrenceInstance: currentInstanceStart !== baseStart || dayOffset > 0,
        });
      }
    }

    // Advance to next recurring instance
    if (recurrence === 'daily') {
      currentInstanceStart = addDays(currentInstanceStart, 1);
    } else if (recurrence === 'weekly') {
      currentInstanceStart = addDays(currentInstanceStart, 7);
    } else if (recurrence === 'biweekly') {
      currentInstanceStart = addDays(currentInstanceStart, 14);
    } else if (recurrence === 'monthly') {
      currentInstanceStart = addMonths(currentInstanceStart, 1);
    } else {
      break;
    }
  }

  return occurrences;
};
