/**
 * Facebook & Social Sharing utilities for Community Events
 */

export function getEventShareUrl(eventId: string): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.origin);
  url.searchParams.set('event', eventId);
  return url.toString();
}

export function shareEventToFacebook(event: {
  id: string;
  title: string;
  location?: string;
  date?: string;
}): void {
  const shareUrl = getEventShareUrl(event.id);
  const quote = `Join us in Ross County for: ${event.title}${event.date ? ` on ${event.date}` : ''}!`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(quote)}`;

  // Open Facebook share dialog centered popup
  const width = 620;
  const height = 550;
  const left = window.screenLeft + (window.outerWidth - width) / 2;
  const top = window.screenTop + (window.outerHeight - height) / 2;

  window.open(
    fbUrl,
    'facebook-share-dialog',
    `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,status=no,location=yes,resizable=yes,scrollbars=yes`
  );
}

export async function copyEventLinkToClipboard(eventId: string): Promise<boolean> {
  const shareUrl = getEventShareUrl(eventId);
  try {
    await navigator.clipboard.writeText(shareUrl);
    return true;
  } catch (err) {
    console.warn('Failed to copy event link to clipboard:', err);
    return false;
  }
}
