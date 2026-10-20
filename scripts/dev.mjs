// Local preview: serves public/ and runs the api/ functions the way Vercel does.
//   npm run dev            → http://localhost:3000  (edit code "letmein" unless EDIT_CODE is set)
import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

process.env.EDIT_CODE ||= 'letmein';
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC = path.resolve('public');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8',
};

async function serveStatic(pathname, res) {
  let file = path.join(PUBLIC, decodeURIComponent(pathname));
  if (!file.startsWith(PUBLIC)) file = PUBLIC;
  try {
    if ((await fs.stat(file)).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      return res.end(await fs.readFile(file));
    }
  } catch {}
  // Single-page app: every other path gets index.html (same as the rewrite in vercel.json).
  res.writeHead(200, { 'Content-Type': MIME['.html'] });
  res.end(await fs.readFile(path.join(PUBLIC, 'index.html')));
}

http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  try {
    const m = pathname.match(/^\/api\/([a-z]+)\/?$/);
    if (m) {
      const mod = await import(pathToFileURL(path.resolve('api', `${m[1]}.js`)).href).catch(() => null);
      if (!mod) { res.writeHead(404); return res.end('Not found'); }
      return await mod.default(req, res);
    }
    await serveStatic(pathname, res);
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end('Server error');
  }
}).listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}  (edit code: ${process.env.EDIT_CODE})`);
});
