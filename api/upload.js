// POST /api/upload { type, data: base64 } → { url }. Images are shrunk in the browser first,
// so they stay well under Vercel's 4.5 MB request limit.
import crypto from 'node:crypto';
import { send, readJson, codeOk, requestCode, methodNotAllowed } from './_lib/http.js';
import { saveUpload, storageProblem } from './_lib/store.js';

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  if (!codeOk(requestCode(req))) return send(res, 401, { error: 'Wrong edit code.' });
  const problem = storageProblem();
  if (problem) return send(res, 503, { error: problem });
  try {
    const body = await readJson(req);
    const ext = EXT[body && body.type];
    if (!ext || typeof body.data !== 'string') return send(res, 400, { error: 'Only JPG, PNG, WebP or GIF images.' });
    const buffer = Buffer.from(body.data, 'base64');
    if (!buffer.length || buffer.length > 3_300_000) return send(res, 413, { error: 'That image is too big (max ~3 MB).' });
    const name = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    await saveUpload(name, buffer);
    return send(res, 200, { url: `/api/media?f=${name}` });
  } catch (err) {
    console.error(err);
    return send(res, err.status || 500, { error: 'Upload failed.' });
  }
}
