// Where content lives.
//  - On Vercel (GITHUB_TOKEN set): content/site.json and content/uploads/* in the GitHub repo,
//    read and written through the GitHub API, so every save is a commit.
//  - Locally (npm run dev): the same files on disk.
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT_FILE = 'content/site.json';
const UPLOAD_DIR = 'content/uploads';

const token = () => process.env.GITHUB_TOKEN;
const branch = () => process.env.GITHUB_BRANCH || 'main';
function repo() {
  if (process.env.GITHUB_REPO) return process.env.GITHUB_REPO;
  const owner = process.env.VERCEL_GIT_REPO_OWNER;
  const slug = process.env.VERCEL_GIT_REPO_SLUG;
  return owner && slug ? `${owner}/${slug}` : null;
}

export const usingGitHub = () => Boolean(token() && repo());

// Why saving can't work right now, or null if it can.
export function storageProblem() {
  if (usingGitHub()) return null;
  if (process.env.VERCEL) {
    return 'Saving is not set up yet. Add a GITHUB_TOKEN environment variable in Vercel (see README).';
  }
  return null;
}

async function gh(file, { method = 'GET', body, raw = false } = {}) {
  const ref = method === 'GET' ? `?ref=${encodeURIComponent(branch())}` : '';
  return fetch(`https://api.github.com/repos/${repo()}/contents/${file}${ref}`, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: raw ? 'application/vnd.github.raw' : 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'creative-portfolio',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function ghSha(file) {
  const res = await gh(file);
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
  return (await res.json()).sha;
}

async function ghPut(file, buffer, message, { isNew = false } = {}) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const sha = isNew ? undefined : await ghSha(file);
    const res = await gh(file, {
      method: 'PUT',
      body: { message, content: buffer.toString('base64'), branch: branch(), ...(sha ? { sha } : {}) },
    });
    if (res.ok) return;
    // 409/422 = the file changed underneath us; fetch the new sha and try once more.
    if ((res.status === 409 || res.status === 422) && attempt === 0) { isNew = false; continue; }
    const detail = await res.text().catch(() => '');
    throw new Error(`GitHub save failed (${res.status}) ${detail.slice(0, 200)}`);
  }
}

async function bundledContent() {
  return JSON.parse(await fs.readFile(path.join(ROOT, CONTENT_FILE), 'utf8'));
}

export async function readContent() {
  if (usingGitHub()) {
    const res = await gh(CONTENT_FILE, { raw: true });
    if (res.ok) return JSON.parse(await res.text());
    if (res.status !== 404) throw new Error(`GitHub read failed (${res.status})`);
  }
  return bundledContent();
}

export async function writeContent(data) {
  const text = JSON.stringify(data, null, 2) + '\n';
  if (usingGitHub()) return ghPut(CONTENT_FILE, Buffer.from(text), 'Update site content');
  const file = path.join(ROOT, CONTENT_FILE);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file + '.tmp', text);
  await fs.rename(file + '.tmp', file);
}

export async function saveUpload(name, buffer) {
  if (usingGitHub()) return ghPut(`${UPLOAD_DIR}/${name}`, buffer, `Upload ${name}`, { isNew: true });
  const dir = path.join(ROOT, UPLOAD_DIR);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buffer);
}

export async function readUpload(name) {
  if (usingGitHub()) {
    const res = await gh(`${UPLOAD_DIR}/${name}`, { raw: true });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
    return Buffer.from(await res.arrayBuffer());
  }
  try {
    return await fs.readFile(path.join(ROOT, UPLOAD_DIR, name));
  } catch {
    return null;
  }
}
