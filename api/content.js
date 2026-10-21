// GET  /api/content          public content (drafts removed), briefly cached at the edge
// GET  /api/content?draft=1  everything, for edit mode (needs the edit code)
// PUT  /api/content          replace all content (needs the edit code)
import { send, query, readJson, codeOk, requestCode, methodNotAllowed, edgeCache } from './_lib/http.js';
import { readContent, writeContent, storageProblem } from './_lib/store.js';
import { cleanContent } from './_lib/schema.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const content = cleanContent(await readContent());
      if (query(req).get('draft') === '1' && codeOk(requestCode(req))) {
        return send(res, 200, content, { 'Cache-Control': 'private, no-store' });
      }
      content.entries = content.entries.filter(e => e.published);
      return send(res, 200, content, edgeCache(5, 60));
    }

    if (req.method === 'PUT') {
      if (!codeOk(requestCode(req))) return send(res, 401, { error: 'Wrong edit code.' });
      const problem = storageProblem();
      if (problem) return send(res, 503, { error: problem });
      const content = cleanContent(await readJson(req));
      await writeContent(content);
      return send(res, 200, { ok: true, content }, { 'Cache-Control': 'no-store' });
    }

    return methodNotAllowed(res, 'GET, PUT');
  } catch (err) {
    console.error(err);
    if (err.status === 413) return send(res, 413, { error: 'That is too much to save at once.' });
    const editor = codeOk(requestCode(req));
    return send(res, err.status || 500, { error: editor && err.expose ? err.message : 'Something went wrong on the server.' });
  }
}
