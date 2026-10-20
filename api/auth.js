// POST /api/auth { code } → 200 if it's the edit code. Nothing is stored server-side;
// the browser keeps the code and sends it with every save, where it's checked again.
import { send, readJson, codeOk, editingEnabled, methodNotAllowed } from './_lib/http.js';
import { storageProblem } from './_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  if (!editingEnabled()) {
    return send(res, 503, { error: 'Editing is turned off. Set EDIT_CODE in Vercel (see README).' });
  }
  let body;
  try { body = await readJson(req, 10_000); } catch { body = null; }
  if (!codeOk(body && body.code)) return send(res, 401, { error: "That code didn't work." });
  return send(res, 200, { ok: true, warning: storageProblem() }, { 'Cache-Control': 'no-store' });
}
