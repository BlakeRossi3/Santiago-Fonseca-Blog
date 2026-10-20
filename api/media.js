// GET /api/media?f=<name> serves an uploaded image. Names are unique, so it caches forever.
import { send, query, methodNotAllowed } from './_lib/http.js';
import { readUpload } from './_lib/store.js';

const TYPES = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, 'GET');
  const name = query(req).get('f') || '';
  const m = name.match(/^[a-z0-9]+-[a-f0-9]+\.(jpg|png|webp|gif)$/);
  if (!m) return send(res, 400, { error: 'Bad file name.' });
  try {
    const file = await readUpload(name);
    if (!file) return send(res, 404, { error: 'Not found.' });
    res.statusCode = 200;
    res.setHeader('Content-Type', TYPES[m[1]]);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.end(file);
  } catch (err) {
    console.error(err);
    send(res, 500, { error: 'Could not load image.' });
  }
}
