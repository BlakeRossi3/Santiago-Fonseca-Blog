// Creative portfolio — the whole front end, no framework.
// Content comes from /api/content. "Edit" in the footer asks for the edit code; the server
// checks that code on every save, so the code itself is the only key.

const TYPES = {
  review: { label: 'Film review', path: 'films', nav: 'Films', title: 'Films', intro: "Reviews and notes on what I've been watching.", count: ['review', 'reviews'] },
  story: { label: 'Short story', path: 'stories', nav: 'Stories', title: 'Short stories', intro: 'Fiction, mostly short, occasionally strange.', count: ['story', 'stories'] },
  news: { label: 'News', path: 'news', nav: 'News', title: 'News', intro: 'Updates, announcements and the occasional ramble.', count: ['post', 'posts'] },
};
const ORDER = ['review', 'story', 'news'];
const TYPE_BY_PATH = Object.fromEntries(ORDER.map(t => [TYPES[t].path, t]));
const LABELS = {
  review: { title: 'Film title', summary: 'The short version', body: 'Review', date: 'Watched on', cover: 'Poster' },
  story: { title: 'Story title', summary: 'Teaser', body: 'Story', date: 'Written on', cover: 'Cover image (optional)' },
  news: { title: 'Headline', summary: 'Excerpt (optional; otherwise the start of the post is used)', body: 'Post', date: 'Date', cover: 'Cover image (optional)' },
};
const DEFAULT_SITE = { name: '', tagline: '', intro: '', about: '', photo: '', email: '', links: [] };
const CODE_KEY = 'portfolio-edit-code';
const LANG_KEY = 'portfolio-lang';

// Words visitors see, in both languages. The owner's own writing has optional Spanish versions
// (entry.es, site.es); anything without one falls back to English.
const STR = {
  en: {
    'type.review': 'Film review', 'type.story': 'Short story', 'type.news': 'News',
    'nav.review': 'Films', 'nav.story': 'Stories', 'nav.news': 'News', 'nav.about': 'About',
    'sec.review': 'Films', 'sec.story': 'Short stories', 'sec.news': 'News',
    'intro.review': "Reviews and notes on what I've been watching.",
    'intro.story': 'Fiction, mostly short, occasionally strange.',
    'intro.news': 'Updates, announcements and the occasional ramble.',
    'count.review': ['review', 'reviews'], 'count.story': ['story', 'stories'], 'count.news': ['news post', 'news posts'],
    'cta.review': 'Read the review', 'cta.story': 'Read the story', 'cta.news': 'Read more',
    seeAll: 'See all →', featured: 'Featured', nothingYet: 'Nothing here yet.', addFirst: 'Add the first one',
    nothingPublished: 'Nothing published yet. Check back soon.', all: 'All', newest: 'Newest', topRated: 'Top rated',
    previous: '← Previous', next: 'Next →', more: 'More', directedBy: 'Directed by {x}', watched: 'Watched {x}',
    minRead: '{n} min read', email: 'Email', draft: 'Draft', starsLabel: '{r} out of 5 stars',
    notFound: 'Not found', notFoundTitle: 'Lost the plot.', notFoundText: "That page doesn't exist (or has moved).", goHome: 'Go home',
    editMode: 'Edit mode', unlockPrompt: 'Unlock with the edit code to continue.', unlock: 'Unlock',
    comments: 'Comments', name: 'Name', comment: 'Comment', beKind: 'Be kind. Comments show up right away.',
    post: 'Post comment', postingAs: 'Posting as the <b>author</b>.', author: 'Author', siteTitle: 'Portfolio',
    noComments: 'No comments yet. Start the conversation.', loadingComments: 'Loading comments…',
    commentsClosed: 'Comments are closed.', commentsFailed: "Comments couldn't load.", commentPosted: 'Comment posted',
    commentNeedText: 'Add your name and a comment.', delete: 'Delete', deleteCommentQ: 'Delete this comment?', commentDeleted: 'Comment deleted',
    edit: 'Edit', editing: 'Editing', new: 'New', siteSettings: 'Site settings', lock: 'Lock', cancel: 'Cancel',
    enterCode: 'Enter the edit code to make changes.', editCode: 'Edit code', badCode: "That code didn't work.",
    skip: 'Skip to content', loading: 'Loading…', locked: 'Locked', editOn: 'Edit mode on',
    loadFailTitle: 'Hmm.', loadFailText: "The site couldn't load. Try refreshing.", language: 'Language',
  },
  es: {
    'type.review': 'Reseña de cine', 'type.story': 'Cuento', 'type.news': 'Noticia',
    'nav.review': 'Cine', 'nav.story': 'Cuentos', 'nav.news': 'Noticias', 'nav.about': 'Sobre mí',
    'sec.review': 'Cine', 'sec.story': 'Cuentos', 'sec.news': 'Noticias',
    'intro.review': 'Reseñas y apuntes sobre lo que he estado viendo.',
    'intro.story': 'Ficción, casi siempre breve, a veces extraña.',
    'intro.news': 'Novedades, anuncios y alguna que otra divagación.',
    'count.review': ['reseña', 'reseñas'], 'count.story': ['cuento', 'cuentos'], 'count.news': ['noticia', 'noticias'],
    'cta.review': 'Leer la reseña', 'cta.story': 'Leer el cuento', 'cta.news': 'Leer más',
    seeAll: 'Ver todo →', featured: 'Destacado', nothingYet: 'Todavía no hay nada aquí.', addFirst: 'Añadir el primero',
    nothingPublished: 'Aún no hay nada publicado. Vuelve pronto.', all: 'Todo', newest: 'Más recientes', topRated: 'Mejor valoradas',
    previous: '← Anterior', next: 'Siguiente →', more: 'Más', directedBy: 'Dirigida por {x}', watched: 'Vista el {x}',
    minRead: '{n} min de lectura', email: 'Correo', draft: 'Borrador', starsLabel: '{r} de 5 estrellas',
    notFound: 'No encontrado', notFoundTitle: 'Se perdió la trama.', notFoundText: 'Esa página no existe (o se ha movido).', goHome: 'Volver al inicio',
    editMode: 'Modo edición', unlockPrompt: 'Desbloquea con el código de edición para continuar.', unlock: 'Desbloquear',
    comments: 'Comentarios', name: 'Nombre', comment: 'Comentario', beKind: 'Sé amable. Los comentarios aparecen al instante.',
    post: 'Publicar comentario', postingAs: 'Publicando como <b>autor</b>.', author: 'Autor', siteTitle: 'Portafolio',
    noComments: 'Aún no hay comentarios. Empieza la conversación.', loadingComments: 'Cargando comentarios…',
    commentsClosed: 'Los comentarios están cerrados.', commentsFailed: 'No se pudieron cargar los comentarios.', commentPosted: 'Comentario publicado',
    commentNeedText: 'Escribe tu nombre y un comentario.', delete: 'Eliminar', deleteCommentQ: '¿Eliminar este comentario?', commentDeleted: 'Comentario eliminado',
    edit: 'Editar', editing: 'Editando', new: 'Nuevo', siteSettings: 'Ajustes del sitio', lock: 'Bloquear', cancel: 'Cancelar',
    enterCode: 'Introduce el código de edición para hacer cambios.', editCode: 'Código de edición', badCode: 'Ese código no funcionó.',
    skip: 'Saltar al contenido', loading: 'Cargando…', locked: 'Bloqueado', editOn: 'Modo edición activado',
    loadFailTitle: 'Vaya.', loadFailText: 'No se pudo cargar el sitio. Prueba a recargar.', language: 'Idioma',
  },
};

function initialLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'es') return saved;
  } catch {}
  return /^es\b/i.test(navigator.language || '') ? 'es' : 'en';
}

const state = { content: null, code: readCode(), editing: false, dirty: false, here: '', lang: initialLang() };

function tr(key, vars = {}) {
  const v = STR[state.lang][key] ?? STR.en[key] ?? key;
  return typeof v === 'string' ? v.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '') : v;
}
const locale = () => (state.lang === 'es' ? 'es-ES' : 'en-US');

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const unesc = s => s.replace(/&(amp|lt|gt|quot|#39);/g, (_, k) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[k]);

function readCode() { try { return localStorage.getItem(CODE_KEY); } catch { return null; } }
function rememberCode(c) { try { localStorage.setItem(CODE_KEY, c); } catch {} }
function forgetCode() { try { localStorage.removeItem(CODE_KEY); } catch {} }

// ---------- Server ----------
async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (state.code) headers['x-edit-code'] = encodeURIComponent(state.code);
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw Object.assign(new Error((data && data.error) || `Request failed (${res.status})`), { status: res.status });
  return data;
}

async function loadContent() {
  state.content = normalize(await api(state.editing ? '/api/content?draft=1' : '/api/content'));
}

function normalize(c) {
  c = c && typeof c === 'object' ? c : {};
  const s = { ...DEFAULT_SITE, ...(c.site || {}) };
  s.links = Array.isArray(s.links) ? s.links : [];
  const sections = {};
  for (const t of ORDER) {
    const x = (s.sections && s.sections[t]) || {};
    sections[t] = { title: x.title || '', intro: x.intro || '' };
  }
  s.sections = sections;
  s.comments = s.comments !== false;
  const es = (c.site && c.site.es) || {};
  s.es = {
    tagline: es.tagline || '',
    intro: es.intro || '',
    about: es.about || '',
    sections: Object.fromEntries(ORDER.map(t => {
      const x = (es.sections && es.sections[t]) || {};
      return [t, { title: x.title || '', intro: x.intro || '' }];
    })),
  };
  const entries = (Array.isArray(c.entries) ? c.entries : [])
    .map(e => (e && e.type === 'project' ? { ...e, type: 'news' } : e))
    .filter(e => e && TYPES[e.type])
    .map(e => ({ tags: [], published: true, featured: false, summary: '', body: '', cover: '', date: '', ...e }));
  return { site: s, entries };
}

// Saves a modified copy of all content; on failure nothing changes locally.
async function commit(mutate, okMessage) {
  const before = state.content;
  const draft = structuredClone(before);
  mutate(draft);
  try {
    const res = await api('/api/content', { method: 'PUT', body: draft });
    state.content = normalize(res.content);
    toast(okMessage);
    return true;
  } catch (err) {
    state.content = before;
    if (err.status === 401) {
      toast('The edit code was changed. Unlock again to keep editing.', true);
      lock({ quiet: true });
    } else {
      toast(err.message, true);
    }
    return false;
  }
}

// ---------- Helpers ----------
const siteSections = () => (state.lang === 'es' ? state.content.site.es.sections : state.content.site.sections);
const sectionTitle = t => siteSections()[t].title || tr(`sec.${t}`);
const sectionIntro = t => siteSections()[t].intro || tr(`intro.${t}`);
const siteTitle = () => state.content.site.name || tr('siteTitle');
const siteText = k => (state.lang === 'es' && state.content.site.es[k]) || state.content.site[k];
const typeLabel = t => tr(`type.${t}`);
const byDate = (a, b) => (b.date || '').localeCompare(a.date || '');
// The Spanish version of an entry, field by field, falling back to English.
const localize = e => (state.lang === 'es' && e.es
  ? { ...e, title: e.es.title || e.title, summary: e.es.summary || e.summary, body: e.es.body || e.body }
  : e);
const visible = () => state.content.entries.filter(e => state.editing || e.published !== false).sort(byDate).map(localize);
const ofType = t => visible().filter(e => e.type === t);
const urlOf = e => `/${TYPES[e.type].path}/${encodeURIComponent(e.slug)}`;
const today = () => new Date().toISOString().slice(0, 10);

function fmtDate(d, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!d) return '';
  const t = new Date(d + 'T00:00:00');
  return isNaN(t) ? '' : t.toLocaleDateString(locale(), opts);
}
const wordCount = s => (String(s || '').match(/[\p{L}\p{N}'’-]+/gu) || []).length;
const readTime = s => tr('minRead', { n: Math.max(1, Math.round(wordCount(s) / 230)) });

function stars(r) {
  r = Number(r) || 0;
  return r > 0 ? `<span class="stars" style="--r:${r}" role="img" aria-label="${tr('starsLabel', { r })}"></span>` : '';
}
const draftBadge = e => (e.published === false ? `<span class="badge">${tr('draft')}</span>` : '');

function slugify(s) {
  return String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'untitled';
}
function uniqueSlug(base, type, id) {
  const taken = new Set(state.content.entries.filter(e => e.type === type && e.id !== id).map(e => e.slug));
  let slug = base, n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const parseTags = s => [...new Set(String(s).split(',').map(t => t.trim()).filter(Boolean))].slice(0, 12);

function safeHref(u) {
  u = String(u || '').trim();
  return /^(https?:\/\/|mailto:|\/|#)/i.test(u) && !/^\/\//.test(u) ? u : '';
}

// ---------- Markdown (small, safe subset) ----------
// Every line is its own paragraph, which is how most people paste prose.
function inline(s) {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, url) => {
      const href = safeHref(unesc(url));
      if (!href) return text;
      const ext = /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${esc(href)}"${ext}>${text}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s](?:[^*]*[^*\s])?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/(^|[^\w])_([^_\s](?:[^_]*[^_\s])?)_(?!\w)/g, '$1<em>$2</em>');
}
const inlineText = s => inline(esc(s));

function md(src) {
  const lines = String(src || '').replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  for (let i = 0; i < lines.length;) {
    const t = lines[i].trim();
    let m;
    if (!t) { i++; continue; }
    if (/^(\*\s*\*\s*\*|-{3,}|_{3,}|#\s*#\s*#|⁂)$/.test(t)) { out.push('<hr>'); i++; continue; }
    if ((m = t.match(/^(#{1,3})\s+(.+)$/))) { const l = m[1].length + 1; out.push(`<h${l}>${inlineText(m[2])}</h${l}>`); i++; continue; }
    if ((m = t.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/))) {
      const src = safeHref(m[2]);
      if (src) out.push(`<figure><img src="${esc(src)}" alt="${esc(m[1])}" loading="lazy">${m[1] ? `<figcaption>${esc(m[1])}</figcaption>` : ''}</figure>`);
      i++; continue;
    }
    const group = re => { const items = []; while (i < lines.length && re.test(lines[i].trim())) items.push(lines[i++].trim().replace(re, '')); return items; };
    if (/^>/.test(t)) { out.push(`<blockquote>${group(/^>\s?/).filter(Boolean).map(p => `<p>${inlineText(p)}</p>`).join('')}</blockquote>`); continue; }
    if (/^[-*•]\s+/.test(t)) { out.push(`<ul>${group(/^[-*•]\s+/).map(li => `<li>${inlineText(li)}</li>`).join('')}</ul>`); continue; }
    if (/^\d+[.)]\s+/.test(t)) { out.push(`<ol>${group(/^\d+[.)]\s+/).map(li => `<li>${inlineText(li)}</li>`).join('')}</ol>`); continue; }
    out.push(`<p>${inlineText(t)}</p>`);
    i++;
  }
  return out.join('\n');
}
const firstLine = s => (String(s || '').split('\n').map(l => l.trim()).find(l => l && !/^(#|>|!\[|\*\s*\*|-{3})/.test(l)) || '')
  .replace(/[*_`]/g, '');

// ---------- Pieces ----------
function media(e, { big = false } = {}) {
  if (e.cover) return `<img src="${esc(e.cover)}" alt="" loading="${big ? 'eager' : 'lazy'}">`;
  const sub = e.type === 'review' ? [e.year, e.director].filter(Boolean).join(' · ') : typeLabel(e.type);
  return `<div class="ph"><div class="ph-title">${esc(e.title)}</div>${sub ? `<div class="ph-sub">${esc(sub)}</div>` : ''}</div>`;
}

function posterCard(e) {
  return `<a class="poster-card" href="${urlOf(e)}">
    <div class="poster">${draftBadge(e)}${media(e)}</div>
    <h3>${esc(e.title)}</h3>
    <div class="card-meta">${e.year ? `<span>${esc(e.year)}</span>` : ''}${stars(e.rating)}</div>
  </a>`;
}

function storyRow(e) {
  return `<a class="story-row" href="${urlOf(e)}">
    <span class="story-date">${fmtDate(e.date)}</span>
    <div><h3>${esc(e.title)} ${draftBadge(e)}</h3>${e.summary ? `<p>${inlineText(e.summary)}</p>` : ''}</div>
    <span class="story-time">${readTime(e.body)}</span>
  </a>`;
}

// The opening of a post as plain text, for excerpts.
function excerpt(body, max = 240) {
  const text = String(body || '').split('\n').map(l => l.trim())
    .filter(l => l && !/^(#|>|!\[|\*\s*\*|-{3}|[-*•]\s|\d+[.)]\s)/.test(l))
    .join(' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '');
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '…' : text;
}

const longDate = d => fmtDate(d, { month: 'long', day: 'numeric', year: 'numeric' });

function newsCard(e) {
  const blurb = e.summary ? inlineText(e.summary) : esc(excerpt(e.body));
  return `<a class="news-card${e.cover ? ' has-cover' : ''}" href="${urlOf(e)}">
    ${e.cover ? `<div class="news-cover">${media(e)}</div>` : ''}
    <div class="news-body">
      <p class="eyebrow">${e.date ? `<span>${longDate(e.date)}</span><span aria-hidden="true">·</span>` : ''}<span>${readTime(e.body)}</span> ${draftBadge(e)}</p>
      <h3>${esc(e.title)}</h3>
      ${blurb ? `<p class="news-excerpt">${blurb}</p>` : ''}
      <span class="read-more">${tr('cta.news')} →</span>
    </div>
  </a>`;
}

const CARD = { review: posterCard, story: storyRow, news: newsCard };
const WRAP = { review: 'posters', story: 'story-list', news: 'news-list' };
const grid = (type, list) => `<div class="${WRAP[type]}">${list.map(CARD[type]).join('')}</div>`;

function featuredCard(e) {
  const art = e.cover || e.type === 'review'
    ? media(e, { big: true })
    : `<div class="featured-quote"><span>${esc(firstLine(e.body) || e.summary)}</span></div>`;
  const cta = tr(`cta.${e.type}`);
  return `<a class="featured" href="${urlOf(e)}">
    <div class="featured-media">${art}</div>
    <div class="featured-body">
      <p class="eyebrow">${tr('featured')} · ${typeLabel(e.type)} ${draftBadge(e)}</p>
      <h2>${esc(e.title)}</h2>
      ${e.type === 'review' && e.rating ? stars(e.rating) : ''}
      ${e.summary ? `<p>${inlineText(e.summary)}</p>` : ''}
      <span class="read-more">${cta} →</span>
    </div>
  </a>`;
}

function emptyState(type) {
  const add = state.editing ? `<br><a class="btn btn-primary" href="/edit/new/${type}">${tr('addFirst')}</a>` : '';
  return `<div class="empty">${tr('nothingYet')}${add}</div>`;
}

// ---------- Views ----------
function homeView() {
  const s = state.content.site;
  const all = visible();
  const featured = all.find(e => e.featured);
  const rest = all.filter(e => e !== featured);
  const limits = { review: 6, story: 4, news: 3 };
  const stats = ORDER.map(t => {
    const n = ofType(t).length;
    return n ? `<a href="/${TYPES[t].path}"><b>${n}</b>${tr(`count.${t}`)[n === 1 ? 0 : 1]}</a>` : '';
  }).join('');

  const sections = ORDER.map(t => {
    const list = rest.filter(e => e.type === t).slice(0, limits[t]);
    if (!list.length && !state.editing) return '';
    return `<section class="sec">
      <div class="sec-head"><h2>${esc(sectionTitle(t))}</h2><a class="more" href="/${TYPES[t].path}">${tr('seeAll')}</a></div>
      ${list.length ? grid(t, list) : emptyState(t)}
    </section>`;
  }).join('');

  return {
    title: '',
    html: `<div class="view">
      <section class="hero">
        <h1 class="hero-title">${inlineText(siteText('tagline') || siteTitle())}</h1>
        ${siteText('intro') ? `<p class="hero-intro">${inlineText(siteText('intro'))}</p>` : ''}
        ${stats ? `<div class="hero-stats">${stats}</div>` : ''}
      </section>
      ${featured ? featuredCard(featured) : ''}
      ${sections || (all.length ? '' : `<p class="empty">${tr('nothingPublished')}</p>`)}
    </div>`,
  };
}

function listView(type) {
  const params = new URLSearchParams(location.search);
  const tag = params.get('tag');
  const sort = params.get('sort');
  let list = ofType(type);
  const tags = [...new Set(list.flatMap(e => e.tags || []))].sort((a, b) => a.localeCompare(b));
  if (tag) list = list.filter(e => (e.tags || []).includes(tag));
  if (type === 'review' && sort === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0) || byDate(a, b));

  const q = o => {
    const p = new URLSearchParams();
    if (o.tag) p.set('tag', o.tag);
    if (o.sort) p.set('sort', o.sort);
    const s = p.toString();
    return `/${TYPES[type].path}${s ? '?' + s : ''}`;
  };
  const chips = tags.length || type === 'review' ? `<div class="filters">
      ${tags.length ? `<a class="chip" href="${esc(q({ sort }))}" aria-current="${!tag}">${tr('all')}</a>` : ''}
      ${tags.map(t => `<a class="chip" href="${esc(q({ tag: t, sort }))}" aria-current="${t === tag}">${esc(t)}</a>`).join('')}
      ${type === 'review' && list.length > 1 ? `<span class="spacer"></span>
        <a class="chip" href="${esc(q({ tag }))}" aria-current="${sort !== 'rating'}">${tr('newest')}</a>
        <a class="chip" href="${esc(q({ tag, sort: 'rating' }))}" aria-current="${sort === 'rating'}">${tr('topRated')}</a>` : ''}
    </div>` : '';

  return {
    title: sectionTitle(type),
    html: `<div class="view">
      <header class="page-head">
        <h1>${esc(sectionTitle(type))}</h1>
        <p>${inlineText(sectionIntro(type))}</p>
      </header>
      ${chips}
      ${list.length ? grid(type, list) : emptyState(type)}
    </div>`,
  };
}

function entryTools(e) {
  if (!state.editing) return '';
  return `<div class="entry-tools">
    <a class="btn btn-sm" href="/edit/${encodeURIComponent(e.id)}">Edit</a>
    <button class="btn btn-sm btn-danger" type="button" data-delete="${esc(e.id)}">Delete</button>
  </div>`;
}

function tagRow(e) {
  if (!e.tags || !e.tags.length) return '';
  return `<div class="tag-row">${e.tags.map(t => `<a class="chip" href="/${TYPES[e.type].path}?tag=${esc(encodeURIComponent(t))}">${esc(t)}</a>`).join('')}</div>`;
}

function entryNav(e) {
  const list = ofType(e.type);
  const i = list.findIndex(x => x.id === e.id);
  const newer = list[i - 1], older = list[i + 1];
  if (!newer && !older) return '';
  return `<nav class="entry-nav" aria-label="${tr('more')}">
    ${older ? `<a href="${urlOf(older)}"><span class="eyebrow">${tr('previous')}</span><strong>${esc(older.title)}</strong></a>` : ''}
    ${newer ? `<a class="next" href="${urlOf(newer)}"><span class="eyebrow">${tr('next')}</span><strong>${esc(newer.title)}</strong></a>` : ''}
  </nav>`;
}

function entryView(type, slug) {
  const e = ofType(type).find(x => x.slug === slug);
  if (!e) return notFoundView();
  const eyebrow = extra => `<p class="eyebrow"><a href="/${TYPES[type].path}">${typeLabel(type)}</a>${extra || ''} ${draftBadge(e)}</p>`;
  const lede = e.summary ? `<p class="lede">${inlineText(e.summary)}</p>` : '';
  let html;

  if (type === 'review') {
    const meta = [e.year && esc(e.year), e.director && tr('directedBy', { x: esc(e.director) }), e.date && tr('watched', { x: fmtDate(e.date) })].filter(Boolean);
    html = `<article class="entry view">
      ${entryTools(e)}
      <div class="review-layout">
        <div class="poster-wrap"><div class="poster">${media(e, { big: true })}</div></div>
        <div>
          ${eyebrow()}
          <h1>${esc(e.title)}</h1>
          ${meta.length ? `<div class="entry-meta">${meta.map(m => `<span>${m}</span>`).join('')}</div>` : ''}
          ${e.rating ? `<div class="entry-rating">${stars(e.rating)}<span>${e.rating} / 5</span></div>` : ''}
          ${lede}
          <div class="prose">${md(e.body)}</div>
          ${tagRow(e)}
          ${commentsBlock(e)}
        </div>
      </div>
      ${entryNav(e)}
    </article>`;
  } else if (type === 'story') {
    html = `<article class="entry view">
      <div class="reading">
        ${entryTools(e)}
        ${eyebrow(`<span aria-hidden="true">·</span><span>${readTime(e.body)}</span>`)}
        <h1>${esc(e.title)}</h1>
        ${e.date ? `<div class="entry-meta"><span>${fmtDate(e.date, { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>` : ''}
        ${lede}
        ${e.cover ? `<div class="entry-cover">${media(e, { big: true })}</div>` : ''}
        <div class="prose story-prose">${md(e.body)}</div>
        ${tagRow(e)}
        ${commentsBlock(e)}
        ${entryNav(e)}
      </div>
    </article>`;
  } else {
    html = `<article class="entry view">
      <div class="reading">
        ${entryTools(e)}
        ${eyebrow(`<span aria-hidden="true">·</span><span>${readTime(e.body)}</span>`)}
        <h1>${esc(e.title)}</h1>
        ${e.date ? `<div class="entry-meta"><span>${longDate(e.date)}</span></div>` : ''}
        ${lede}
        ${e.cover ? `<div class="entry-cover">${media(e, { big: true })}</div>` : ''}
        <div class="prose">${md(e.body)}</div>
        ${tagRow(e)}
        ${commentsBlock(e)}
        ${entryNav(e)}
      </div>
    </article>`;
  }
  return { title: e.title, html, mount: () => { wireDelete(); mountComments(e); } };
}

// ---------- Comments ----------
const NAME_KEY = 'portfolio-commenter';
function commentsBlock(e) {
  const open = state.content.site.comments || state.editing;
  let savedName = '';
  try { savedName = localStorage.getItem(NAME_KEY) || ''; } catch {}
  const form = open ? `<form class="comment-form" data-comment-form novalidate>
      ${state.editing
        ? `<p class="hint">${tr('postingAs')}</p>`
        : `<label class="field"><span class="label">${tr('name')}</span><input class="input" name="name" maxlength="60" autocomplete="name" value="${esc(savedName)}" required></label>`}
      <label class="field"><span class="label">${tr('comment')}</span><textarea class="input" name="text" rows="4" maxlength="2000" required></textarea></label>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="comment-actions">
        <span class="hint">${state.editing ? '' : tr('beKind')}</span>
        <button class="btn btn-primary btn-sm" type="submit">${tr('post')}</button>
      </div>
    </form>` : `<p class="hint">${tr('commentsClosed')}</p>`;
  return `<section class="comments" id="comments" data-comments="${esc(e.id)}">
    <h2>${tr('comments')} <span data-comment-count></span></h2>
    <div class="comment-list" data-comment-list><p class="hint">${tr('loadingComments')}</p></div>
    ${form}
  </section>`;
}

function commentHtml(c) {
  const del = state.editing ? `<button class="btn btn-ghost btn-sm" type="button" data-delete-comment="${esc(c.id)}">${tr('delete')}</button>` : '';
  const when = new Date(c.date);
  const date = isNaN(when) ? '' : when.toLocaleDateString(locale(), { month: 'short', day: 'numeric', year: 'numeric' });
  return `<article class="comment${c.owner ? ' is-owner' : ''}" data-comment="${esc(c.id)}">
    <header>${c.owner ? `<span class="badge">${tr('author')}</span>` : `<strong>${esc(c.name)}</strong>`}<time datetime="${esc(c.date)}">${date}</time>${del}</header>
    <div class="comment-text">${String(c.text).split('\n').filter(l => l.trim()).map(l => `<p>${esc(l)}</p>`).join('')}</div>
  </article>`;
}

async function mountComments(e) {
  const box = $(`[data-comments="${CSS.escape(e.id)}"]`);
  if (!box) return;
  const list = $('[data-comment-list]', box);
  const count = $('[data-comment-count]', box);
  const form = $('[data-comment-form]', box);
  let token = '';
  let comments = [];
  const draw = () => {
    count.textContent = comments.length ? String(comments.length) : '';
    list.innerHTML = comments.length ? comments.map(commentHtml).join('') : `<p class="hint">${tr('noComments')}</p>`;
  };

  try {
    const res = await api(`/api/comments?entry=${encodeURIComponent(e.id)}${state.editing ? '&fresh=1' : ''}`);
    if (!box.isConnected) return;
    comments = res.comments;
    token = res.token;
    draw();
  } catch {
    if (box.isConnected) list.innerHTML = `<p class="hint">${tr('commentsFailed')}</p>`;
  }

  list.addEventListener('click', async ev => {
    const btn = ev.target.closest('[data-delete-comment]');
    if (!btn || !confirm(tr('deleteCommentQ'))) return;
    btn.disabled = true;
    try {
      await api(`/api/comments?entry=${encodeURIComponent(e.id)}&comment=${encodeURIComponent(btn.dataset.deleteComment)}`, { method: 'DELETE' });
      comments = comments.filter(c => c.id !== btn.dataset.deleteComment);
      draw();
      toast(tr('commentDeleted'));
    } catch (err) { toast(err.message, true); btn.disabled = false; }
  });

  if (!form) return;
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    const f = form.elements;
    const name = f.name ? f.name.value.trim() : '';
    const text = f.text.value.trim();
    if ((f.name && !name) || !text) { toast(tr('commentNeedText'), true); return; }
    const btn = $('[type=submit]', form);
    btn.disabled = true;
    try {
      const res = await api('/api/comments', { method: 'POST', body: { entry: e.id, name, text, token, website: f.website.value, lang: state.lang } });
      if (res.comment) { comments.push(res.comment); draw(); }
      f.text.value = '';
      if (name) { try { localStorage.setItem(NAME_KEY, name); } catch {} }
      toast(tr('commentPosted'));
    } catch (err) { toast(err.message, true); }
    btn.disabled = false;
  });
}

function aboutView() {
  const s = state.content.site;
  const links = [
    ...(s.email ? [{ label: tr('email'), url: `mailto:${s.email}`, show: s.email }] : []),
    ...s.links.map(l => ({ ...l, show: l.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') })),
  ].filter(l => safeHref(l.url));
  return {
    title: tr('nav.about'),
    html: `<div class="about view ${s.photo ? '' : 'no-photo'}">
      ${s.photo ? `<div class="about-photo"><img src="${esc(s.photo)}" alt=""></div>` : ''}
      <div>
        <h1>${tr('nav.about')}</h1>
        <div class="prose">${md(siteText('about')) || `<p>${tr('nothingYet')}</p>`}</div>
        ${links.length ? `<div class="about-links">${links.map(l => `<a href="${esc(l.url)}"${/^https?:/.test(l.url) ? ' target="_blank" rel="noopener"' : ''}>${esc(l.label)}<span>${esc(l.show)}</span></a>`).join('')}</div>` : ''}
      </div>
    </div>`,
  };
}

function notFoundView() {
  return { title: tr('notFound'), html: `<div class="notfound view"><h1>${tr('notFoundTitle')}</h1><p>${tr('notFoundText')}</p><p><a class="btn" href="/">${tr('goHome')}</a></p></div>` };
}

function lockedView() {
  return {
    title: tr('editMode'),
    html: `<div class="notfound view"><h1>${tr('editMode')}</h1><p>${tr('unlockPrompt')}</p><p><button class="btn btn-primary" type="button" data-unlock>${tr('unlock')}</button></p></div>`,
    mount: () => openUnlock(),
  };
}

// ---------- Editor ----------
function blankEntry(type) {
  return { id: newId(), type, title: '', slug: '', date: today(), published: true, featured: false, cover: '', summary: '', body: '', tags: [], year: '', director: '', rating: 0 };
}

const imageField = (name, value, label, extraClass = '') => `
  <div class="field">
    <span class="label" data-cover-label>${esc(label)}</span>
    <div class="dropzone ${extraClass}" role="button" tabindex="0" data-zone="${name}" aria-label="Upload ${esc(label)}">
      <span class="zone-text">Click or drop an image</span>
      <button type="button" class="btn btn-sm zone-remove" data-remove>Remove</button>
      <input type="file" accept="image/*" hidden>
    </div>
    <input type="hidden" name="${name}" value="${esc(value)}">
  </div>`;

function editorView({ id, type }) {
  if (!state.editing) return lockedView();
  const existing = id ? state.content.entries.find(e => e.id === id) : null;
  if (id && !existing) return notFoundView();
  const e = { ...blankEntry(type || 'review'), ...(existing ? structuredClone(existing) : {}) };
  const L = LABELS[e.type];
  const es = e.es || {};
  const cancel = existing ? urlOf(existing) : `/${TYPES[e.type].path}`;

  return {
    title: existing ? `Edit: ${e.title}` : `New ${TYPES[e.type].label.toLowerCase()}`,
    html: `<form class="editor view" id="editor" autocomplete="off" novalidate>
      <div class="editor-top">
        <p class="eyebrow">${existing ? 'Editing' : 'New'} · <span data-type-label>${TYPES[e.type].label}</span></p>
        <div class="editor-actions">
          <a class="btn btn-ghost" href="${cancel}">Cancel</a>
          <button class="btn btn-primary" type="submit">${existing ? 'Save changes' : 'Publish'}</button>
        </div>
      </div>
      <div class="editor-grid">
        <div>
          <div class="tabs lang-tabs" role="tablist" aria-label="Language">
            <button class="tab" type="button" role="tab" data-edit-lang="en" aria-selected="true">English</button>
            <button class="tab" type="button" role="tab" data-edit-lang="es" aria-selected="false">Español${es.title || es.summary || es.body ? ' ✓' : ''}</button>
          </div>
          <div data-pane="en">
            <input class="input title-input" name="title" value="${esc(e.title)}" placeholder="${L.title}" aria-label="Title" maxlength="200">
            <label class="field">
              <span class="label" data-l="summary">${L.summary}</span>
              <textarea class="input" name="summary" rows="2" maxlength="600">${esc(e.summary)}</textarea>
            </label>
          </div>
          <div data-pane="es" hidden>
            <p class="hint lang-hint">Optional Spanish version, shown when visitors switch to ES. Anything left blank shows the English text.</p>
            <input class="input title-input" name="title_es" value="${esc(es.title)}" placeholder="Título en español" aria-label="Spanish title" maxlength="200">
            <label class="field">
              <span class="label" data-l="summary">${L.summary}</span>
              <textarea class="input" name="summary_es" rows="2" maxlength="600">${esc(es.summary)}</textarea>
            </label>
          </div>
          <div class="field">
            <div class="body-head">
              <span class="label" data-l="body">${L.body}</span>
              <div class="tabs" role="tablist">
                <button class="tab" type="button" role="tab" data-tab="write" aria-selected="true">Write</button>
                <button class="tab" type="button" role="tab" data-tab="preview" aria-selected="false">Preview</button>
              </div>
            </div>
            <div data-write>
              <div class="toolbar" role="toolbar" aria-label="Formatting">
                <button type="button" data-tool="bold" title="Bold"><b>B</b></button>
                <button type="button" data-tool="italic" title="Italic"><i>I</i></button>
                <button type="button" data-tool="heading" title="Heading">H</button>
                <button type="button" data-tool="quote" title="Quote">“ ”</button>
                <button type="button" data-tool="list" title="List">• List</button>
                <button type="button" data-tool="break" title="Scene break">⁂</button>
                <span class="sep"></span>
                <button type="button" data-tool="link" title="Link">Link</button>
                <button type="button" data-tool="image" title="Insert image">Image</button>
                <input type="file" accept="image/*" hidden data-body-image>
              </div>
              <textarea class="input body-input" name="body" aria-label="Body" data-pane="en">${esc(e.body)}</textarea>
              <textarea class="input body-input" name="body_es" aria-label="Spanish body" data-pane="es" hidden>${esc(es.body)}</textarea>
            </div>
            <div class="prose preview" data-preview hidden></div>
            <p class="hint">Each line is a paragraph. <code>**bold**</code> <code>*italic*</code> <code># Heading</code> <code>&gt; quote</code> <code>* * *</code> scene break. <kbd>Ctrl/⌘ S</kbd> saves.</p>
          </div>
        </div>

        <aside class="aside">
          <div class="panel">
            <div class="field">
              <span class="label">Visibility</span>
              <div class="segmented">
                <label><input type="radio" name="status" value="published" ${e.published !== false ? 'checked' : ''}><span>Published</span></label>
                <label><input type="radio" name="status" value="draft" ${e.published === false ? 'checked' : ''}><span>Draft</span></label>
              </div>
            </div>
            <label class="check field"><input type="checkbox" name="featured" ${e.featured ? 'checked' : ''}> Feature on the home page</label>
            <div>
              <label class="field"><span class="label">Type</span>
                <select class="input" name="type">${ORDER.map(t => `<option value="${t}" ${t === e.type ? 'selected' : ''}>${TYPES[t].label}</option>`).join('')}</select>
              </label>
              <label class="field"><span class="label" data-l="date">${L.date}</span><input class="input" type="date" name="date" value="${esc(e.date)}"></label>
            </div>
          </div>

          <div class="panel">${imageField('cover', e.cover, L.cover, e.type === 'review' ? 'is-poster' : '')}</div>

          <div class="panel" data-for="review">
            <p class="panel-title">Film details</p>
            <div class="row2">
              <label class="field"><span class="label">Year</span><input class="input" name="year" inputmode="numeric" maxlength="10" value="${esc(e.year)}" placeholder="1984"></label>
              <label class="field"><span class="label">Director</span><input class="input" name="director" maxlength="120" value="${esc(e.director)}"></label>
            </div>
            <label class="field"><span class="label">Rating</span>
              <input type="range" name="rating" min="0" max="5" step="0.5" value="${Number(e.rating) || 0}">
              <span class="rating-out" data-rating-out></span>
            </label>
          </div>

          <div class="panel">
            <label class="field"><span class="label">Tags</span><input class="input" name="tags" value="${esc((e.tags || []).join(', '))}" placeholder="Drama, Horror"></label>
            <p class="hint">Separate with commas. Visitors can filter by tag.</p>
          </div>

          ${existing ? `<button class="btn btn-danger" type="button" data-delete="${esc(e.id)}">Delete this ${TYPES[e.type].label.toLowerCase()}</button>` : ''}
        </aside>
      </div>
    </form>`,
    mount: () => mountEditor(e, existing),
  };
}

function autosize(ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 2 + 'px';
}

function edit(ta, fn) {
  const { selectionStart: a, selectionEnd: b, value } = ta;
  const [text, selA, selB] = fn(value.slice(a, b), value, a, b);
  ta.focus();
  ta.setRangeText(text, a, b, 'end');
  if (selA !== undefined) ta.setSelectionRange(a + selA, a + selB);
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}
const wrapSel = (ta, mark, placeholder) => edit(ta, sel => {
  const t = sel || placeholder;
  return [mark + t + mark, mark.length, mark.length + t.length];
});
const lineStart = (value, a) => a === 0 || value[a - 1] === '\n' ? '' : '\n';
const prefixSel = (ta, prefix, placeholder) => edit(ta, (sel, value, a) => {
  const lines = (sel || placeholder).split('\n').map(l => prefix + l.replace(/^(#+\s|>\s?|[-*]\s)/, '')).join('\n');
  const lead = lineStart(value, a);
  return [lead + lines, lead.length, lead.length + lines.length];
});

function mountEditor(entry, existing) {
  const form = $('#editor');
  const f = form.elements;
  const body = f.body;
  let editLang = 'en';
  const cur = () => (editLang === 'es' ? f.body_es : body);

  form.addEventListener('input', () => { state.dirty = true; });
  form.addEventListener('change', () => { state.dirty = true; });

  const setType = () => {
    const t = f.type.value;
    const L = LABELS[t];
    $('[data-type-label]', form).textContent = TYPES[t].label;
    f.title.placeholder = L.title;
    for (const k of ['summary', 'body', 'date']) $$(`[data-l="${k}"]`, form).forEach(el => { el.textContent = L[k]; });
    $('[data-cover-label]', form).textContent = L.cover;
    $('[data-zone="cover"]', form).classList.toggle('is-poster', t === 'review');
    $$('[data-for]', form).forEach(p => { p.hidden = p.dataset.for !== t; });
  };
  f.type.addEventListener('change', setType);
  setType();

  requestAnimationFrame(() => autosize(body));
  for (const ta of [body, f.body_es]) ta.addEventListener('input', () => autosize(ta));

  const out = $('[data-rating-out]', form);
  const showRating = () => {
    const r = Number(f.rating.value);
    out.innerHTML = r ? `${stars(r)}<span>${r} / 5</span>` : '<span>No rating</span>';
  };
  f.rating.addEventListener('input', showRating);
  showRating();

  // Write / Preview
  const write = $('[data-write]', form), preview = $('[data-preview]', form);
  const showPreview = () => {
    preview.innerHTML = md(cur().value) || '<p class="hint">Nothing written yet.</p>';
    preview.classList.toggle('story-prose', f.type.value === 'story');
  };
  $$('[data-tab]', form).forEach(tab => tab.addEventListener('click', () => {
    const show = tab.dataset.tab === 'preview';
    $$('[data-tab]', form).forEach(x => x.setAttribute('aria-selected', String(x === tab)));
    write.hidden = show;
    preview.hidden = !show;
    if (show) showPreview();
  }));

  // English / Español versions
  $$('[data-edit-lang]', form).forEach(tab => tab.addEventListener('click', () => {
    editLang = tab.dataset.editLang;
    $$('[data-edit-lang]', form).forEach(x => x.setAttribute('aria-selected', String(x === tab)));
    $$('[data-pane]', form).forEach(el => { el.hidden = el.dataset.pane !== editLang; });
    if (!preview.hidden) showPreview();
    requestAnimationFrame(() => autosize(cur()));
  }));

  // Formatting toolbar
  const bodyImage = $('[data-body-image]', form);
  const tools = {
    bold: () => wrapSel(cur(), '**', 'bold text'),
    italic: () => wrapSel(cur(), '*', 'italic text'),
    heading: () => prefixSel(cur(), '## ', 'Heading'),
    quote: () => prefixSel(cur(), '> ', 'Quote'),
    list: () => prefixSel(cur(), '- ', 'List item'),
    break: () => edit(cur(), (sel, value, a) => [lineStart(value, a) + '* * *\n']),
    link: () => {
      const url = prompt('Link to (https://…)');
      if (!url) return;
      edit(cur(), sel => { const t = sel || 'link text'; return [`[${t}](${url.trim()})`, 1, 1 + t.length]; });
    },
    image: () => bodyImage.click(),
  };
  $$('[data-tool]', form).forEach(b => b.addEventListener('click', () => tools[b.dataset.tool]()));
  bodyImage.addEventListener('change', async () => {
    const file = bodyImage.files[0];
    bodyImage.value = '';
    if (!file) return;
    toast('Uploading image…');
    try {
      const url = await uploadImage(file);
      edit(cur(), (sel, value, a) => [`${lineStart(value, a)}![](${url})\n`]);
      toast('Image added');
    } catch (err) { toast(err.message, true); }
  });

  wireImageField($('[data-zone="cover"]', form), f.cover);
  wireDelete();

  const save = async () => {
    const title = f.title.value.trim();
    if (!title) {
      toast('Give it an English title first.', true);
      $('[data-edit-lang="en"]', form).click();
      f.title.focus();
      return;
    }
    const type = f.type.value;
    const next = {
      id: entry.id,
      type,
      title,
      slug: uniqueSlug((existing && existing.slug) || slugify(title), type, entry.id),
      date: f.date.value || today(),
      published: f.status.value !== 'draft',
      featured: f.featured.checked,
      cover: f.cover.value,
      summary: f.summary.value.trim(),
      body: body.value.replace(/\s+$/, ''),
      tags: parseTags(f.tags.value),
      es: { title: f.title_es.value.trim(), summary: f.summary_es.value.trim(), body: f.body_es.value.replace(/\s+$/, '') },
    };
    if (type === 'review') Object.assign(next, { year: f.year.value.trim(), director: f.director.value.trim(), rating: Number(f.rating.value) || 0 });

    const btn = $('[type=submit]', form);
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Saving…';
    const ok = await commit(c => {
      if (next.featured) c.entries.forEach(x => { x.featured = false; });
      const i = c.entries.findIndex(x => x.id === next.id);
      if (i >= 0) c.entries[i] = next; else c.entries.push(next);
    }, next.published ? 'Saved' : 'Saved as draft');
    btn.disabled = false;
    btn.textContent = label;
    if (ok) {
      state.dirty = false;
      go(urlOf(next));
    }
  };
  form.addEventListener('submit', ev => { ev.preventDefault(); save(); });
  form.addEventListener('keydown', ev => {
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 's') { ev.preventDefault(); save(); }
  });
  if (!existing) f.title.focus();
}

function wireDelete() {
  $$('[data-delete]').forEach(btn => btn.addEventListener('click', async () => {
    const e = state.content.entries.find(x => x.id === btn.dataset.delete);
    if (!e || !confirm(`Delete “${e.title}”? This can't be undone from here.`)) return;
    btn.disabled = true;
    const ok = await commit(c => { c.entries = c.entries.filter(x => x.id !== e.id); }, 'Deleted');
    btn.disabled = false;
    if (ok) { state.dirty = false; go(`/${TYPES[e.type].path}`, { replace: true }); }
  }));
}

// ---------- Images ----------
async function shrink(file, max = 2000) {
  if (file.type === 'image/gif' && file.size < 3e6) return file; // keep small GIFs animated
  let bmp;
  try { bmp = await createImageBitmap(file); } catch { throw new Error("Couldn't read that image. Try a JPG or PNG."); }
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.size < 1.5e6 && /^image\/(jpeg|webp|png)$/.test(file.type)) return file;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0d0c0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error("Couldn't process that image."))), 'image/jpeg', 0.86));
}

const toBase64 = blob => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(',')[1]);
  r.onerror = () => reject(new Error("Couldn't read that image."));
  r.readAsDataURL(blob);
});

async function uploadImage(file) {
  if (!file.type.startsWith('image/')) throw new Error("That file isn't an image.");
  const blob = await shrink(file);
  const res = await api('/api/upload', { method: 'POST', body: { type: blob.type, data: await toBase64(blob) } });
  return res.url;
}

function wireImageField(zone, input) {
  const file = $('input[type=file]', zone);
  const show = () => {
    $('img', zone)?.remove();
    zone.classList.toggle('has-img', Boolean(input.value));
    if (input.value) zone.insertAdjacentHTML('afterbegin', `<img src="${esc(input.value)}" alt="">`);
  };
  const upload = async f => {
    zone.classList.add('busy');
    try {
      input.value = await uploadImage(f);
      state.dirty = true;
      show();
    } catch (err) { toast(err.message, true); }
    zone.classList.remove('busy');
  };
  zone.addEventListener('click', ev => {
    if (ev.target.closest('[data-remove]')) { input.value = ''; state.dirty = true; show(); return; }
    if (ev.target !== file) file.click();
  });
  zone.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); file.click(); } });
  file.addEventListener('change', () => { if (file.files[0]) upload(file.files[0]); file.value = ''; });
  zone.addEventListener('dragover', ev => { ev.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
  zone.addEventListener('drop', ev => {
    ev.preventDefault();
    zone.classList.remove('drag');
    const f = ev.dataTransfer.files[0];
    if (f) upload(f);
  });
  show();
}

// ---------- Site settings ----------
const linkRow = (l = { label: '', url: '' }) => `<div class="link-row">
  <input class="input" data-link-label placeholder="Label (e.g. Letterboxd)" value="${esc(l.label)}" maxlength="60">
  <input class="input" data-link-url placeholder="https://" value="${esc(l.url)}">
  <button class="btn btn-ghost btn-sm" type="button" data-remove-link aria-label="Remove link">✕</button>
</div>`;

function settingsView() {
  if (!state.editing) return lockedView();
  const s = state.content.site;
  return {
    title: 'Site settings',
    html: `<form class="editor view" id="settings" autocomplete="off" novalidate>
      <div class="editor-top">
        <div><p class="eyebrow">Edit mode</p><h1 style="font-size:48px;margin-top:10px">Site settings</h1></div>
        <div class="editor-actions">
          <a class="btn btn-ghost" href="/">Cancel</a>
          <button class="btn btn-primary" type="submit">Save settings</button>
        </div>
      </div>
      <div class="settings-grid">
        <div class="panel">
          <p class="panel-title">Home page</p>
          <label class="field"><span class="label">Site title (optional)</span><input class="input" name="name" value="${esc(s.name)}" placeholder="Portfolio" maxlength="80">
            <span class="hint">Shown in the header and browser tab. Leave blank for "Portfolio" / "Portafolio".</span></label>
          <label class="field"><span class="label">Headline</span><input class="input" name="tagline" value="${esc(s.tagline)}" maxlength="200">
            <span class="hint">Wrap words in *asterisks* to highlight them.</span></label>
          <label class="field"><span class="label">Intro</span><textarea class="input" name="intro" rows="3" maxlength="1000">${esc(s.intro)}</textarea></label>
          <label class="check field"><input type="checkbox" name="comments" ${s.comments ? 'checked' : ''}> Let visitors comment on posts</label>
        </div>
        <div class="panel">
          <p class="panel-title">About page</p>
          ${imageField('photo', s.photo, 'Photo', 'is-poster')}
          <label class="field"><span class="label">Email (optional)</span><input class="input" name="email" type="email" value="${esc(s.email)}" maxlength="200"></label>
        </div>
        <div class="panel span">
          <label class="field"><span class="label">About you</span><textarea class="input" name="about" rows="8" style="font-family:var(--font-read);font-size:17px;line-height:1.7">${esc(s.about)}</textarea></label>
        </div>
        <div class="panel span">
          <p class="panel-title">En español <span class="hint" style="font-weight:400">(optional, shown when visitors switch to ES; blank fields show the English text)</span></p>
          <div class="settings-grid">
            <div>
              <label class="field"><span class="label">Headline (ES)</span><input class="input" name="tagline_es" value="${esc(s.es.tagline)}" maxlength="200"></label>
              <label class="field"><span class="label">Intro (ES)</span><textarea class="input" name="intro_es" rows="3" maxlength="1000">${esc(s.es.intro)}</textarea></label>
            </div>
            <label class="field"><span class="label">About you (ES)</span><textarea class="input" name="about_es" rows="6" style="font-family:var(--font-read);font-size:17px;line-height:1.7">${esc(s.es.about)}</textarea></label>
          </div>
          <div class="settings-grid" style="margin-top:8px">
            ${ORDER.map(t => `<div>
              <label class="field"><span class="label">${STR.es[`nav.${t}`]} title (ES)</span><input class="input" name="sec-title-es-${t}" value="${esc(s.es.sections[t].title)}" placeholder="${esc(STR.es[`sec.${t}`])}" maxlength="80"></label>
              <label class="field"><span class="label">${STR.es[`nav.${t}`]} intro (ES)</span><textarea class="input" name="sec-intro-es-${t}" rows="2" placeholder="${esc(STR.es[`intro.${t}`])}" maxlength="600">${esc(s.es.sections[t].intro)}</textarea></label>
            </div>`).join('')}
          </div>
        </div>
        <div class="panel span">
          <p class="panel-title">Links</p>
          <div class="link-rows" data-links>${s.links.map(linkRow).join('')}</div>
          <button class="btn btn-sm" type="button" data-add-link>+ Add link</button>
        </div>
        <div class="panel span">
          <p class="panel-title">Section names</p>
          <div class="settings-grid">
            ${ORDER.map(t => `<div>
              <label class="field"><span class="label">${TYPES[t].nav} title</span><input class="input" name="sec-title-${t}" value="${esc(s.sections[t].title)}" placeholder="${esc(TYPES[t].title)}" maxlength="80"></label>
              <label class="field"><span class="label">${TYPES[t].nav} intro</span><textarea class="input" name="sec-intro-${t}" rows="2" placeholder="${esc(TYPES[t].intro)}" maxlength="600">${esc(s.sections[t].intro)}</textarea></label>
            </div>`).join('')}
          </div>
        </div>
        <div class="panel span">
          <p class="panel-title">Backup</p>
          <p class="hint" style="margin-bottom:14px">Every save is already kept in the site's history on GitHub. You can also download a copy of everything.</p>
          <button class="btn btn-sm" type="button" data-backup>Download backup</button>
        </div>
      </div>
    </form>`,
    mount: mountSettings,
  };
}

function mountSettings() {
  const form = $('#settings');
  const f = form.elements;
  const links = $('[data-links]', form);
  form.addEventListener('input', () => { state.dirty = true; });
  wireImageField($('[data-zone="photo"]', form), f.photo);
  $('[data-add-link]', form).addEventListener('click', () => {
    links.insertAdjacentHTML('beforeend', linkRow());
    links.lastElementChild.querySelector('input').focus();
  });
  links.addEventListener('click', ev => {
    const rm = ev.target.closest('[data-remove-link]');
    if (rm) { rm.parentElement.remove(); state.dirty = true; }
  });
  $('[data-backup]', form).addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state.content, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `portfolio-backup-${today()}.json` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  const save = async () => {
    const site = {
      name: f.name.value.trim(),
      comments: f.comments.checked,
      tagline: f.tagline.value.trim(),
      intro: f.intro.value.trim(),
      about: f.about.value.replace(/\s+$/, ''),
      photo: f.photo.value,
      email: f.email.value.trim(),
      links: $$('.link-row', links).map(r => ({ label: $('[data-link-label]', r).value.trim(), url: $('[data-link-url]', r).value.trim() }))
        .map(l => ({ ...l, url: l.url && !/^[a-z]+:/i.test(l.url) ? 'https://' + l.url : l.url }))
        .filter(l => l.label && safeHref(l.url)),
      sections: Object.fromEntries(ORDER.map(t => [t, { title: f[`sec-title-${t}`].value.trim(), intro: f[`sec-intro-${t}`].value.trim() }])),
      es: {
        tagline: f.tagline_es.value.trim(),
        intro: f.intro_es.value.trim(),
        about: f.about_es.value.replace(/\s+$/, ''),
        sections: Object.fromEntries(ORDER.map(t => [t, { title: f[`sec-title-es-${t}`].value.trim(), intro: f[`sec-intro-es-${t}`].value.trim() }])),
      },
    };
    const btn = $('[type=submit]', form);
    btn.disabled = true;
    const ok = await commit(c => { c.site = site; }, 'Settings saved');
    btn.disabled = false;
    if (ok) { state.dirty = false; render(); }
  };
  form.addEventListener('submit', ev => { ev.preventDefault(); save(); });
  form.addEventListener('keydown', ev => {
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 's') { ev.preventDefault(); save(); }
  });
}

// ---------- Edit mode ----------
const dialog = $('#unlock');

function openUnlock() {
  if (state.editing || dialog.open) return;
  $('[data-error]', dialog).textContent = '';
  dialog.querySelector('form').reset();
  dialog.showModal();
  dialog.querySelector('input').focus();
}

dialog.querySelector('form').addEventListener('submit', async ev => {
  ev.preventDefault();
  const input = dialog.querySelector('input');
  const btn = dialog.querySelector('[type=submit]');
  const code = input.value;
  btn.disabled = true;
  try {
    const res = await api('/api/auth', { method: 'POST', body: { code } });
    state.code = code;
    state.editing = true;
    rememberCode(code);
    await loadContent();
    dialog.close();
    if (location.pathname === '/edit') history.replaceState(null, '', '/');
    render();
    toast(res && res.warning ? res.warning : tr('editOn'), Boolean(res && res.warning));
  } catch (err) {
    $('[data-error]', dialog).textContent = err.status === 401 ? tr('badCode') : err.message;
    input.select();
  }
  btn.disabled = false;
});
$('[data-cancel]', dialog).addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  if (!state.editing && /^\/(edit|settings)(\/|$)/.test(location.pathname)) go('/', { replace: true });
});

function lock({ quiet = false } = {}) {
  forgetCode();
  state.code = null;
  state.editing = false;
  state.dirty = false;
  if (/^\/(edit|settings)(\/|$)/.test(location.pathname)) history.replaceState(null, '', '/');
  render();
  if (!quiet) toast(tr('locked'));
  loadContent().then(render).catch(() => {});
}

// ---------- Router & chrome ----------
function route() {
  const parts = location.pathname.split('/').filter(Boolean).map(p => { try { return decodeURIComponent(p); } catch { return p; } });
  const [a, b, c] = parts;
  if (!a) return { view: 'home' };
  if (a === 'about' && !b) return { view: 'about' };
  if (a === 'settings' && !b) return { view: 'settings' };
  if (a === 'edit') {
    if (!b) return { view: 'unlock' };
    if (b === 'new') return { view: 'editor', type: TYPES[c] ? c : 'review' };
    return { view: 'editor', id: b };
  }
  const type = TYPE_BY_PATH[a];
  if (type && !b) return { view: 'list', type };
  if (type && b && !c) return { view: 'entry', type, slug: b };
  return { view: '404' };
}

function render() {
  const r = route();
  state.here = location.pathname + location.search;
  renderChrome(r);
  const views = {
    home: homeView,
    list: () => listView(r.type),
    entry: () => entryView(r.type, r.slug),
    about: aboutView,
    editor: () => editorView(r),
    settings: settingsView,
    unlock: () => (state.editing ? homeView() : lockedView()),
    404: notFoundView,
  };
  const v = (views[r.view] || notFoundView)();
  $('#main').innerHTML = v.html;
  const name = siteTitle();
  document.title = v.title ? `${v.title} — ${name}` : name;
  if (v.mount) v.mount();
}

function renderChrome(r) {
  const s = state.content.site;
  document.body.classList.toggle('editing', state.editing);
  $('[data-brand]').textContent = siteTitle();
  const current = r.view === 'about' ? 'about' : r.type ? TYPES[r.type].path : '';
  document.documentElement.lang = state.lang;
  $$('[data-i18n]').forEach(el => { el.textContent = tr(el.dataset.i18n); });
  $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
  $('[data-lang-switch]').setAttribute('aria-label', tr('language'));
  $('[data-nav]').innerHTML = [...ORDER.map(t => [TYPES[t].path, tr(`nav.${t}`)]), ['about', tr('nav.about')]]
    .map(([p, label]) => `<a href="/${p}"${p === current && r.view !== 'editor' ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  $('[data-copy]').textContent = `© ${new Date().getFullYear()} ${siteTitle()}`;
  $('[data-footer-links]').innerHTML = s.links.filter(l => safeHref(l.url))
    .map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('');
  $('[data-editbar]').hidden = !state.editing;
  $('.newmenu').open = false;
}

function confirmLeave() {
  if (!state.dirty) return true;
  if (!confirm('You have unsaved changes. Leave without saving?')) return false;
  state.dirty = false;
  return true;
}

function go(href, { replace = false } = {}) {
  if (!confirmLeave()) return;
  history[replace ? 'replaceState' : 'pushState'](null, '', href);
  render();
  window.scrollTo(0, 0);
  $('#main').focus({ preventScroll: true });
}

function setLang(lang) {
  if (lang === state.lang || !STR[lang]) return;
  state.lang = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch {}
  if (state.dirty) { renderChrome(route()); return; } // don't wipe an open editor
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
}

document.addEventListener('click', ev => {
  const langBtn = ev.target.closest('[data-lang]');
  if (langBtn) { setLang(langBtn.dataset.lang); return; }
  if (ev.target.closest('[data-unlock]')) { openUnlock(); return; }
  if (ev.target.closest('[data-lock]')) { if (confirmLeave()) lock(); return; }
  const a = ev.target.closest('a');
  if (!a || a.target || a.hasAttribute('download') || ev.defaultPrevented || ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  ev.preventDefault();
  if (url.pathname + url.search === state.here && !url.hash) return;
  const keepScroll = url.pathname === location.pathname; // filter chips
  if (!confirmLeave()) return;
  history.pushState(null, '', url.pathname + url.search);
  render();
  if (!keepScroll) { window.scrollTo(0, 0); $('#main').focus({ preventScroll: true }); }
});

window.addEventListener('popstate', () => {
  if (state.dirty && !confirm('You have unsaved changes. Leave without saving?')) {
    history.pushState(null, '', state.here);
    return;
  }
  state.dirty = false;
  render();
});
window.addEventListener('beforeunload', ev => {
  if (state.dirty) { ev.preventDefault(); ev.returnValue = ''; }
});
document.addEventListener('click', ev => {
  const menu = $('.newmenu');
  if (menu.open && !menu.contains(ev.target)) menu.open = false;
});

// ---------- Toast ----------
let toastTimer;
function toast(msg, isError = false) {
  const el = $('.toast');
  el.textContent = msg;
  el.classList.toggle('error', isError);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), isError ? Math.max(5000, msg.length * 70) : 2200);
}

// ---------- Boot ----------
(async function boot() {
  document.documentElement.lang = state.lang;
  $$('[data-i18n]').forEach(el => { el.textContent = tr(el.dataset.i18n); });
  if (state.code) {
    try {
      const res = await api('/api/auth', { method: 'POST', body: { code: state.code } });
      state.editing = true;
      if (res && res.warning) setTimeout(() => toast(res.warning, true), 600);
    } catch (err) {
      if (err.status === 401 || err.status === 503) { forgetCode(); state.code = null; }
    }
  }
  try {
    await loadContent();
  } catch {
    $('#main').innerHTML = `<div class="notfound"><h1>${tr('loadFailTitle')}</h1><p>${tr('loadFailText')}</p></div>`;
    return;
  }
  render();
})();
