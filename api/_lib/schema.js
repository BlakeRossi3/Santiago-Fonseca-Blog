// Everything saved goes through cleanContent: known fields only, sane lengths, safe URLs.
export const TYPES = ['review', 'story', 'news'];

const str = (v, max = 500) => (typeof v === 'string' ? v : v == null ? '' : String(v)).slice(0, max);

export function safeUrl(v) {
  const s = str(v, 2000).trim();
  return /^(https?:\/\/|\/api\/media\?f=|mailto:)/i.test(s) ? s : '';
}

// Optional Spanish text; empty fields are dropped so the site falls back to English.
function cleanEs(x, fields) {
  if (!x || typeof x !== 'object') return undefined;
  const out = {};
  for (const [k, max] of fields) {
    const v = str(x[k], max);
    if (v.trim()) out[k] = k === 'body' ? v : v.trim();
  }
  return Object.keys(out).length ? out : undefined;
}

function cleanEntry(e) {
  const type = e.type;
  const id = str(e.id, 40).replace(/[^\w-]/g, '');
  const rating = Math.round(Math.min(5, Math.max(0, Number(e.rating) || 0)) * 2) / 2;
  const out = {
    id,
    type,
    title: str(e.title, 200).trim() || 'Untitled',
    slug: str(e.slug, 80).toLowerCase().replace(/[^a-z0-9-]/g, '') || id,
    date: /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date : '',
    published: e.published !== false,
    featured: e.featured === true,
    cover: safeUrl(e.cover),
    summary: str(e.summary, 600),
    body: str(e.body, 300_000),
    tags: (Array.isArray(e.tags) ? e.tags : []).map(t => str(t, 40).trim()).filter(Boolean).slice(0, 12),
  };
  const es = cleanEs(e.es, [['title', 200], ['summary', 600], ['body', 300_000]]);
  if (es) out.es = es;
  if (type === 'review') {
    out.year = str(e.year, 10).trim();
    out.director = str(e.director, 120).trim();
    out.rating = rating;
  }
  return out;
}

export function cleanContent(input) {
  const src = input && typeof input === 'object' ? input : {};
  const s = src.site && typeof src.site === 'object' ? src.site : {};

  const sections = {};
  for (const t of TYPES) {
    const x = (s.sections && s.sections[t]) || {};
    sections[t] = { title: str(x.title, 80).trim(), intro: str(x.intro, 600) };
  }
  const sEs = s.es && typeof s.es === 'object' ? s.es : {};
  const sectionsEs = {};
  for (const t of TYPES) {
    const x = (sEs.sections && sEs.sections[t]) || {};
    sectionsEs[t] = { title: str(x.title, 80).trim(), intro: str(x.intro, 600) };
  }

  const site = {
    name: str(s.name, 80).trim(),
    tagline: str(s.tagline, 200),
    intro: str(s.intro, 1000),
    about: str(s.about, 20_000),
    photo: safeUrl(s.photo),
    email: str(s.email, 200).trim(),
    links: (Array.isArray(s.links) ? s.links : [])
      .slice(0, 20)
      .map(l => ({ label: str(l && l.label, 60).trim(), url: safeUrl(l && l.url) }))
      .filter(l => l.label && l.url),
    sections,
    comments: s.comments !== false,
    es: { tagline: str(sEs.tagline, 200), intro: str(sEs.intro, 1000), about: str(sEs.about, 20_000), sections: sectionsEs },
  };

  const seen = new Set();
  const entries = (Array.isArray(src.entries) ? src.entries : [])
    .map(e => (e && e.type === 'project' ? { ...e, type: 'news' } : e)) // the old Projects section became News
    .filter(e => e && typeof e === 'object' && TYPES.includes(e.type))
    .slice(0, 2000)
    .map(cleanEntry)
    .filter(e => e.id && !seen.has(e.id) && seen.add(e.id));

  return { site, entries };
}
