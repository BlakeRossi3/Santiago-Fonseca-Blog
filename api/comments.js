// GET    /api/comments?entry=<id>                 comments on one entry, plus a form token
// POST   /api/comments { entry, name, text, token } add a comment (anyone; with the edit code it's posted as the author)
// DELETE /api/comments?entry=<id>&comment=<id>     remove a comment (needs the edit code)
//
// Spam guards: a hidden "website" field bots fill in, a signed token that must be at least
// a few seconds old (bots post instantly), and a per-visitor rate limit.
import crypto from 'node:crypto';
import { send, query, readJson, codeOk, requestCode, methodNotAllowed, edgeCache } from './_lib/http.js';
import { readContent, readComments, updateComments, storageProblem } from './_lib/store.js';
import { cleanContent } from './_lib/schema.js';

const ID = /^[\w-]{1,40}$/;
const MIN_AGE = 3_000;
const MAX_AGE = 24 * 60 * 60_000;

const secret = () => process.env.COMMENT_SECRET || process.env.EDIT_CODE || process.env.GITHUB_TOKEN || 'dev-secret';
const sign = t => crypto.createHmac('sha256', secret()).update(String(t)).digest('hex').slice(0, 32);
const makeToken = () => { const t = Date.now(); return `${t}.${sign(t)}`; };
function tokenOk(token) {
  const [t, sig] = String(token || '').split('.');
  if (!t || !sig || sig.length !== 32 || sign(t) !== sig) return 'bad';
  const age = Date.now() - Number(t);
  if (age < MIN_AGE) return 'fast';
  if (age > MAX_AGE) return 'old';
  return 'ok';
}

// Best effort: serverless instances come and go, but this stops one visitor flooding a warm instance.
const recent = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter(t => now - t < 10 * 60_000);
  if (hits.length >= 5) return true;
  hits.push(now);
  if (recent.size > 5000) recent.clear();
  recent.set(ip, hits);
  return false;
}

const MESSAGES = {
  en: {
    unknown: 'Unknown post.', unavailable: 'Comments are not available right now.',
    fast: 'That was quick! Wait a moment and try again.', stale: 'This page has been open a while. Refresh and try again.',
    flood: "You're commenting a lot. Try again in a few minutes.", closed: 'Comments are turned off.',
    empty: 'Add your name and a comment.', busy: 'Busy right now. Try again.', failed: 'Something went wrong. Try again.',
  },
  es: {
    unknown: 'Publicación desconocida.', unavailable: 'Los comentarios no están disponibles ahora mismo.',
    fast: '¡Qué rápido! Espera un momento e inténtalo de nuevo.', stale: 'Esta página lleva tiempo abierta. Recarga e inténtalo de nuevo.',
    flood: 'Estás comentando mucho. Inténtalo de nuevo en unos minutos.', closed: 'Los comentarios están desactivados.',
    empty: 'Escribe tu nombre y un comentario.', busy: 'Hay mucho movimiento ahora. Inténtalo de nuevo.', failed: 'Algo salió mal. Inténtalo de nuevo.',
  },
};

const clean = (v, max) => String(v ?? '')
  .replace(/\r\n?/g, '\n')
  .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim()
  .slice(0, max);
const publicComment = c => ({ id: c.id, name: c.owner === true ? '' : c.name, text: c.text, date: c.date, owner: c.owner === true });

export default async function handler(req, res) {
  const q = query(req);
  let m = MESSAGES.en;
  try {
    if (req.method === 'GET') {
      const entry = q.get('entry') || '';
      if (!ID.test(entry)) return send(res, 400, { error: 'Unknown post.' });
      const comments = (await readComments(entry)).map(publicComment);
      return send(res, 200, { comments, token: makeToken() }, q.get('fresh') ? { 'Cache-Control': 'no-store' } : edgeCache(5));
    }

    if (req.method === 'POST') {
      const body = (await readJson(req, 20_000)) || {};
      m = MESSAGES[body.lang] || MESSAGES.en;
      if (storageProblem()) return send(res, 503, { error: m.unavailable });
      const owner = codeOk(requestCode(req));
      if (!owner) {
        if (body.website) return send(res, 200, { ok: true }); // honeypot: let the bot think it worked
        const tk = tokenOk(body.token);
        if (tk === 'fast') return send(res, 400, { error: m.fast });
        if (tk !== 'ok') return send(res, 400, { error: m.stale });
        const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
        if (rateLimited(ip)) return send(res, 429, { error: m.flood });
      }

      const entryId = String(body.entry || '');
      if (!ID.test(entryId)) return send(res, 400, { error: m.unknown });
      const content = cleanContent(await readContent());
      if (!content.site.comments && !owner) return send(res, 403, { error: m.closed });
      const entry = content.entries.find(e => e.id === entryId && (e.published || owner));
      if (!entry) return send(res, 404, { error: m.unknown });

      const name = owner ? '' : clean(body.name, 60);
      const text = clean(body.text, 2000);
      if ((!owner && !name) || !text) return send(res, 400, { error: m.empty });

      const comment = {
        id: crypto.randomBytes(6).toString('hex'),
        name,
        text,
        date: new Date().toISOString(),
        ...(owner ? { owner: true } : {}),
      };
      await updateComments(entryId, list => [...list, comment].slice(-1000), `Comment on "${entry.title}"`);
      return send(res, 200, { comment: publicComment(comment) }, { 'Cache-Control': 'no-store' });
    }

    if (req.method === 'DELETE') {
      if (!codeOk(requestCode(req))) return send(res, 401, { error: 'Wrong edit code.' });
      const problem = storageProblem();
      if (problem) return send(res, 503, { error: problem });
      const entry = q.get('entry') || '';
      const id = q.get('comment') || '';
      if (!ID.test(entry) || !ID.test(id)) return send(res, 400, { error: 'Unknown comment.' });
      await updateComments(entry, list => list.filter(c => c.id !== id), 'Remove comment');
      return send(res, 200, { ok: true }, { 'Cache-Control': 'no-store' });
    }

    return methodNotAllowed(res, 'GET, POST, DELETE');
  } catch (err) {
    console.error(err);
    return send(res, err.status || 500, { error: err.status === 503 ? m.busy : m.failed });
  }
}
