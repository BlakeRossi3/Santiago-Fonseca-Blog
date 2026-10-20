import crypto from 'node:crypto';

export function send(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(data));
}

export function query(req) {
  return new URL(req.url, 'http://localhost').searchParams;
}

// Vercel pre-parses JSON into req.body; the local dev server doesn't, so read the stream then.
export async function readJson(req, limit = 4_500_000) {
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8'));
    if (typeof req.body === 'string') return JSON.parse(req.body);
    return req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Too large'), { status: 413 });
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null');
}

const digest = s => crypto.createHash('sha256').update(String(s)).digest();

export function editingEnabled() {
  return Boolean(process.env.EDIT_CODE);
}

export function codeOk(given) {
  const expected = process.env.EDIT_CODE;
  if (!expected || typeof given !== 'string' || !given) return false;
  return crypto.timingSafeEqual(digest(given), digest(expected));
}

// The browser sends the code URI-encoded so any characters survive the header.
export function requestCode(req) {
  const raw = req.headers['x-edit-code'];
  if (typeof raw !== 'string') return '';
  try { return decodeURIComponent(raw); } catch { return ''; }
}

// Browsers always re-check; only Vercel's edge keeps a short-lived copy (so a burst of
// visitors costs one GitHub read every few seconds, and nobody sees a stale page on reload).
export function edgeCache(seconds, staleSeconds = 0) {
  return {
    'Cache-Control': 'public, no-cache',
    'Vercel-CDN-Cache-Control': `max-age=${seconds}${staleSeconds ? `, stale-while-revalidate=${staleSeconds}` : ''}`,
  };
}

export function methodNotAllowed(res, allowed) {
  send(res, 405, { error: 'Method not allowed' }, { Allow: allowed });
}
