import { EventCategory, RecurrenceFrequency } from '../types/event';

export interface ParsedEventData {
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  location?: string;
  selectedCategories: EventCategory[];
  recurrence?: RecurrenceFrequency;
  recurrenceEnd?: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
}

const GEMINI_CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-flash-lite-latest',
];

/**
 * Normalizes Facebook and web URLs for cleaner scraping
 */
export function cleanEventUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  try {
    const parsed = new URL(url);
    const trackingParams = ['fbclid', 'ti', 'acontext', 'ref', 'source', 'sfnsn', 'mibextid', 'rdid'];
    trackingParams.forEach(p => parsed.searchParams.delete(p));
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Checks if scraped text or url is just a Facebook login wall / bot-blocker
 */
function isFacebookLoginWall(text: string): boolean {
  return /Log into Facebook|Log in to Facebook|facebook\.com\/login|Final URL: https?:\/\/[^\s]*facebook\.com\/login|Email or mobile number.*Password|Explore the things you love/i.test(text);
}

/**
 * Fetches page content using a CORS-friendly proxy reader (Jina Reader)
 */
async function fetchPageContent(targetUrl: string): Promise<{ text: string; imageUrl?: string; isLoginWall: boolean }> {
  const cleanUrl = cleanEventUrl(targetUrl);
  const readerUrl = `https://r.jina.ai/${cleanUrl}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(readerUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'text/plain, text/markdown',
        'X-No-Cache': 'true',
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Proxy responded with status ${res.status}`);
    }

    const text = await res.text();

    // Check if Facebook blocked or redirected to login wall
    if (isFacebookLoginWall(text)) {
      return { text: '', imageUrl: undefined, isLoginWall: true };
    }

    // Try finding OpenGraph image in markdown/headers
    let imageUrl: string | undefined;
    const imgMatch = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+(?:jpg|jpeg|png|webp)[^\s)]*)\)/i) 
      || text.match(/(https?:\/\/[^\s"']+(?:fbcdn\.net|cdninstagram|cloudfront)[^\s"']+(?:jpg|jpeg|png|webp)[^\s"']*)/i);
    if (imgMatch) {
      imageUrl = imgMatch[1];
    }

    return { text: text.slice(0, 10000), imageUrl, isLoginWall: false };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[AI Event Parser] Reader fetch notice:', err);
    throw err;
  }
}

/**
 * Call Gemini AI with candidate model cascade supporting multimodal image vision
 */
async function callGemini(params: {
  prompt: string;
  apiKey: string;
  imageBase64?: string;
}): Promise<string> {
  const { prompt, apiKey, imageBase64 } = params;
  let lastError: any = null;

  // Prepare parts: text prompt + optional image for Gemini Vision
  const parts: any[] = [{ text: prompt }];

  if (imageBase64 && imageBase64.trim()) {
    let cleanBase64 = imageBase64.trim();
    let mimeType = 'image/jpeg';

    const dataUrlMatch = cleanBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
      cleanBase64 = dataUrlMatch[2];
    }

    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: cleanBase64
      }
    });
  }

  for (const model of GEMINI_CANDIDATE_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          }
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Model ${model} returned ${res.status}`);
      }

      const data = await res.json();
      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidate) {
        return candidate;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[AI Event Parser] Model ${model} cascade notice:`, err?.message || err);
      // Try next candidate model
    }
  }

  throw lastError || new Error('All Gemini candidate models failed.');
}

/**
 * Fallback regex/heuristic parser if Gemini API is unreachable or offline
 */
function heuristicParse(text: string, sourceUrl?: string, scrapedImage?: string): ParsedEventData {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const title = lines.find(l => l.length > 5 && !l.startsWith('http') && !l.startsWith('Title:'))?.replace(/^#+\s*/, '') || 'Community Event';

  // Heuristic date matching
  let date = new Date().toISOString().split('T')[0];
  const dateMatch = text.match(/\b(202[4-9]-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))\b/)
    || text.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(202[4-9])?\b/i);

  if (dateMatch && dateMatch[1] && dateMatch[1].includes('-')) {
    date = dateMatch[1];
  }

  // Time matching
  let time = '';
  const timeMatch = text.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*(?:-\s*\d{1,2}(?::\d{2})?\s*(?:am|pm))?)\b/i);
  if (timeMatch) {
    time = timeMatch[1];
  }

  // Location matching
  let location = 'Chillicothe, OH';
  const locMatch = text.match(/(?:at|location|venue):\s*([^\n\r]+)/i)
    || text.match(/\b([A-Z0-9][a-zA-Z0-9\s,.'-]{3,40}(?:Park|Center|Church|Hall|Street|St|Ave|Road|Rd|Blvd|Auditorium|Fairgrounds))\b/i);
  if (locMatch) {
    location = locMatch[1].trim();
  }

  // Recurrence
  let recurrence: RecurrenceFrequency = 'none';
  const lower = text.toLowerCase();
  if (lower.includes('every monday') || lower.includes('mondays') || lower.includes('every week') || lower.includes('weekly')) recurrence = 'weekly';
  else if (lower.includes('every day') || lower.includes('daily')) recurrence = 'daily';
  else if (lower.includes('bi-weekly') || lower.includes('every other week')) recurrence = 'biweekly';
  else if (lower.includes('monthly') || lower.includes('every month')) recurrence = 'monthly';

  // Categories
  const selectedCategories: EventCategory[] = [];
  if (lower.includes('recover') || lower.includes('sober') || lower.includes('12-step') || lower.includes('aa') || lower.includes('na') || lower.includes('smart recovery')) selectedCategories.push('Recovery');
  if (lower.includes('mental') || lower.includes('counsel') || lower.includes('therapy') || lower.includes('wellness') || lower.includes('support group')) selectedCategories.push('Mental Health');
  if (lower.includes('food') || lower.includes('meal') || lower.includes('pantry') || lower.includes('dinner')) selectedCategories.push('Food');
  if (lower.includes('health') || lower.includes('clinic') || lower.includes('medical') || lower.includes('dental')) selectedCategories.push('Health');
  if (lower.includes('hous') || lower.includes('shelter') || lower.includes('rent')) selectedCategories.push('Housing');
  if (lower.includes('kid') || lower.includes('family') || lower.includes('children') || lower.includes('parent')) selectedCategories.push('Family');
  if (selectedCategories.length === 0) selectedCategories.push('Community');

  return {
    title,
    date,
    time,
    location,
    selectedCategories,
    recurrence,
    description: text.slice(0, 500).trim(),
    imageUrl: scrapedImage || '',
    linkUrl: sourceUrl || '',
    linkLabel: sourceUrl?.includes('facebook.com') ? 'Facebook Event' : 'Event Page'
  };
}

/**
 * Main export: Parse an event from a pasted URL, raw text, and/or flyer image using Gemini Multimodal AI
 */
export async function parseEventWithAI(params: {
  url?: string;
  rawText?: string;
  imageBase64?: string;
  customApiKey?: string;
}): Promise<ParsedEventData> {
  const { url, rawText, imageBase64, customApiKey } = params;

  let contentToParse = (rawText || '').trim();
  let scrapedImage: string | undefined;
  let hasLoginWall = false;

  // 1. If URL is provided, fetch via proxy reader
  if (url && url.trim()) {
    try {
      const fetched = await fetchPageContent(url.trim());
      if (fetched.isLoginWall) {
        hasLoginWall = true;
        // Facebook blocked automated scraping of post text with its login wall.
        // We do NOT add the login wall text to contentToParse!
      } else {
        if (fetched.text) {
          contentToParse = `${contentToParse}\n\nWebpage Text:\n${fetched.text}`.trim();
        }
        if (fetched.imageUrl) {
          scrapedImage = fetched.imageUrl;
        }
      }
    } catch {
      // Proxy failed or network restricted; proceed with image/raw text
    }
  }

  // If we have neither text nor an image, guide the user
  if (!contentToParse && !imageBase64) {
    if (hasLoginWall) {
      throw new Error('FACEBOOK_LOGIN_WALL');
    }
    throw new Error('Please provide an event link, flyer image, or paste event description text.');
  }

  // 2. Identify Gemini API Key
  const apiKey = customApiKey 
    || import.meta.env.VITE_GEMINI_API_KEY 
    || localStorage.getItem('ccr_gemini_api_key') 
    || '';

  // 3. Fallback to heuristic parser if no API key is available
  if (!apiKey) {
    console.info('[AI Event Parser] No Gemini API key found, using heuristic extraction.');
    return heuristicParse(contentToParse, url, scrapedImage || imageBase64);
  }

  // 4. Build Multimodal prompt for Gemini
  const today = new Date();
  const todayIso = today.toISOString().split('T')[0];
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });

  const prompt = `You are an expert AI event extractor for a community calendar in Ross County / Chillicothe, Ohio.
Extract all event and meeting details from the attached flyer image and/or text into strict, valid JSON.

Today is ${dayOfWeek}, ${todayIso}.

Schema:
{
  "title": "Clear concise event title (e.g., 'The Light House Men\\'s Meeting Group')",
  "date": "YYYY-MM-DD (must be a valid date; if it says e.g. 'Mondays', calculate the NEXT upcoming Monday date relative to today ${todayIso})",
  "endDate": "YYYY-MM-DD or empty string if single day or ongoing",
  "time": "Time string e.g. '5:00 PM - 6:00 PM' or '10:00 AM - 1:00 PM'",
  "location": "Facility name and full street address in Chillicothe / Ross County (e.g. 'The Light House, 291 S Paint St, Chillicothe, OH 45601')",
  "selectedCategories": ["Array from ONLY: Recovery, Mental Health, Food, Health, Housing, Community, Family"],
  "recurrence": "none, daily, weekly, biweekly, or monthly (if the flyer or text says e.g. 'Every Monday' or 'Mondays', set to 'weekly'; if it repeats monthly set to 'monthly', else 'none')",
  "description": "Comprehensive, clean, inviting event description detailing the organization, purpose, who is welcome, and what to expect."
}

Additional context:
- Event Link URL: ${url || 'None'}
- Text provided:
${contentToParse || 'Please extract all details directly from the attached flyer image.'}

Respond ONLY with valid JSON. Do not include markdown code block backticks if possible.`;

  try {
    const aiJsonStr = await callGemini({
      prompt,
      apiKey,
      imageBase64: imageBase64 || (scrapedImage?.startsWith('data:') ? scrapedImage : undefined)
    });

    const cleanedJsonStr = aiJsonStr.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    let parsed: any;
    try {
      parsed = JSON.parse(cleanedJsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed = parsed[0];
      }
    } catch {
      // If parsing fails, try finding JSON block
      const match = cleanedJsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse Gemini JSON response');
      }
    }

    const validCategories: EventCategory[] = ['Recovery', 'Mental Health', 'Food', 'Health', 'Housing', 'Community', 'Family'];
    const selectedCategories: EventCategory[] = Array.isArray(parsed.selectedCategories)
      ? parsed.selectedCategories.filter((c: any) => validCategories.includes(c))
      : ['Community'];

    const validRecurrences: RecurrenceFrequency[] = ['none', 'daily', 'weekly', 'biweekly', 'monthly'];
    const recurrence: RecurrenceFrequency = validRecurrences.includes(parsed.recurrence)
      ? parsed.recurrence
      : 'none';

    return {
      title: parsed.title || 'Community Event',
      date: parsed.date || todayIso,
      endDate: parsed.endDate || undefined,
      time: parsed.time || undefined,
      location: parsed.location || 'Chillicothe, OH',
      selectedCategories: selectedCategories.length > 0 ? selectedCategories : ['Community'],
      recurrence,
      description: parsed.description || contentToParse.slice(0, 400),
      imageUrl: imageBase64 || scrapedImage || parsed.imageUrl || undefined,
      linkUrl: parsed.linkUrl || url || undefined,
      linkLabel: parsed.linkLabel || (url?.includes('facebook.com') ? 'Facebook Event' : 'Event Page'),
    };
  } catch (aiErr) {
    console.warn('[AI Event Parser] Gemini AI parsing error, falling back to heuristic parser:', aiErr);
    return heuristicParse(contentToParse, url, scrapedImage || imageBase64);
  }
}
