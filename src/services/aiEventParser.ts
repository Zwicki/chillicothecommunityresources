import { EventCategory } from '../types/event';

export interface ParsedEventData {
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  location?: string;
  selectedCategories: EventCategory[];
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
}

const GEMINI_CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
];

/**
 * Normalizes Facebook and web URLs for cleaner scraping
 */
export function cleanEventUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  try {
    const parsed = new URL(url);
    // Remove Facebook tracking query params
    const trackingParams = ['fbclid', 'ti', 'acontext', 'ref', 'source', 'sfnsn', 'mibextid'];
    trackingParams.forEach(p => parsed.searchParams.delete(p));
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Fetches page content using a CORS-friendly proxy reader (Jina Reader)
 */
async function fetchPageContent(targetUrl: string): Promise<{ text: string; imageUrl?: string }> {
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
    const isLoginWall = /Log in to Facebook|You must log in to continue|Log In or Sign Up/i.test(text.slice(0, 500));
    if (isLoginWall) {
      throw new Error('FACEBOOK_LOGIN_WALL');
    }

    // Try finding OpenGraph image in markdown/headers
    let imageUrl: string | undefined;
    const imgMatch = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+(?:jpg|jpeg|png|webp)[^\s)]*)\)/i) 
      || text.match(/(https?:\/\/[^\s"']+(?:fbcdn\.net|cdninstagram|cloudfront)[^\s"']+(?:jpg|jpeg|png|webp)[^\s"']*)/i);
    if (imgMatch) {
      imageUrl = imgMatch[1];
    }

    return { text: text.slice(0, 10000), imageUrl };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.message === 'FACEBOOK_LOGIN_WALL') {
      throw err;
    }
    console.warn('[AI Event Parser] Reader fetch notice:', err);
    throw err;
  }
}

/**
 * Call Gemini AI with candidate model cascade
 */
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  let lastError: any = null;

  for (const model of GEMINI_CANDIDATE_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
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
      console.warn(`[AI Event Parser] Model ${model} cascade error:`, err?.message || err);
      // Try next candidate model
    }
  }

  throw lastError || new Error('All Gemini candidate models failed.');
}

/**
 * Fallback regex/heuristic parser if Gemini API is unreachable or blocked
 */
function heuristicParse(text: string, sourceUrl?: string, scrapedImage?: string): ParsedEventData {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const title = lines.find(l => l.length > 5 && !l.startsWith('http') && !l.startsWith('Title:'))?.replace(/^#+\s*/, '') || 'Community Event';

  // Heuristic date matching
  let date = new Date().toISOString().split('T')[0];
  const dateMatch = text.match(/\b(202[4-9]-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))\b/)
    || text.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(202[4-9])?\b/i);

  if (dateMatch) {
    if (dateMatch[1] && dateMatch[1].includes('-')) {
      date = dateMatch[1];
    }
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

  // Categories
  const lower = text.toLowerCase();
  const selectedCategories: EventCategory[] = [];
  if (lower.includes('recover') || lower.includes('sober') || lower.includes('12-step') || lower.includes('aa') || lower.includes('na')) selectedCategories.push('Recovery');
  if (lower.includes('mental') || lower.includes('counsel') || lower.includes('therapy') || lower.includes('wellness')) selectedCategories.push('Mental Health');
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
    description: text.slice(0, 500).trim(),
    imageUrl: scrapedImage || '',
    linkUrl: sourceUrl || '',
    linkLabel: sourceUrl?.includes('facebook.com') ? 'Facebook Event' : 'Event Page'
  };
}

/**
 * Main export: Parse an event from a pasted URL or pasted raw flyer text using AI
 */
export async function parseEventWithAI(params: {
  url?: string;
  rawText?: string;
  customApiKey?: string;
}): Promise<ParsedEventData> {
  const { url, rawText, customApiKey } = params;

  let contentToParse = (rawText || '').trim();
  let scrapedImage: string | undefined;

  // 1. If URL is provided, fetch via proxy reader
  if (url && url.trim()) {
    try {
      const fetched = await fetchPageContent(url.trim());
      contentToParse = `${contentToParse}\n\nURL Source: ${url}\n${fetched.text}`.trim();
      if (fetched.imageUrl) {
        scrapedImage = fetched.imageUrl;
      }
    } catch (err: any) {
      if (err.message === 'FACEBOOK_LOGIN_WALL') {
        throw new Error('FACEBOOK_LOGIN_WALL');
      }
      // If fetching fails but user provided raw text, proceed with raw text
      if (!contentToParse) {
        throw new Error(`Could not read webpage content from link. Please copy and paste the event text description directly.`);
      }
    }
  }

  if (!contentToParse) {
    throw new Error('Please provide either a valid event link or paste event text.');
  }

  // 2. Identify Gemini API Key
  const apiKey = customApiKey 
    || import.meta.env.VITE_GEMINI_API_KEY 
    || localStorage.getItem('ccr_gemini_api_key') 
    || '';

  // 3. If no API key or network restricted, use heuristic fallback
  if (!apiKey) {
    console.info('[AI Event Parser] No Gemini API key found, using heuristic extraction.');
    return heuristicParse(contentToParse, url, scrapedImage);
  }

  // 4. Build prompt for Gemini
  const todayIso = new Date().toISOString().split('T')[0];
  const prompt = `You are an expert AI event information extractor for a community calendar in Ross County / Chillicothe, Ohio.
Extract the event details from the text below into strict, valid JSON matching this schema:
{
  "title": "Clear concise event title",
  "date": "YYYY-MM-DD (must be a valid date; if relative like 'this Friday' or 'Nov 21', calculate relative to today: ${todayIso})",
  "endDate": "YYYY-MM-DD or empty string if single day",
  "time": "Time string e.g. '6:00 PM' or '10:00 AM - 2:00 PM' or empty string",
  "location": "Facility name and street address in Chillicothe / Ross County (e.g. 'Yoctangee Park, Chillicothe, OH' or 'Brookside Church, 2215 W 4th St')",
  "selectedCategories": ["Array from only: Recovery, Mental Health, Food, Health, Housing, Community, Family"],
  "description": "Comprehensive, clean, helpful event description summary. Include special details like free admission, food served, contact info, or speakers.",
  "imageUrl": "Direct URL to flyer/cover image if present in the text, else empty string",
  "linkUrl": "${url || ''}",
  "linkLabel": "${url?.includes('facebook.com') ? 'Facebook Event' : 'Event Page'}"
}

Input Text:
${contentToParse}

Respond ONLY with valid JSON. Do not include markdown code block backticks if possible, or use standard json.`;

  try {
    const aiJsonStr = await callGemini(prompt, apiKey);
    const cleanedJsonStr = aiJsonStr.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanedJsonStr);

    return {
      title: parsed.title || 'Community Event',
      date: parsed.date || todayIso,
      endDate: parsed.endDate || undefined,
      time: parsed.time || undefined,
      location: parsed.location || 'Chillicothe, OH',
      selectedCategories: Array.isArray(parsed.selectedCategories) && parsed.selectedCategories.length > 0 
        ? parsed.selectedCategories.filter((c: string) => ['Recovery', 'Mental Health', 'Food', 'Health', 'Housing', 'Community', 'Family'].includes(c))
        : ['Community'],
      description: parsed.description || contentToParse.slice(0, 400),
      imageUrl: parsed.imageUrl || scrapedImage || undefined,
      linkUrl: parsed.linkUrl || url || undefined,
      linkLabel: parsed.linkLabel || (url?.includes('facebook.com') ? 'Facebook Event' : 'Event Page'),
    };
  } catch (aiErr) {
    console.warn('[AI Event Parser] Gemini AI parsing error, falling back to heuristic parser:', aiErr);
    return heuristicParse(contentToParse, url, scrapedImage);
  }
}
