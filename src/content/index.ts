import type { MessageType } from '../shared/types';

function runtimeOk(): boolean {
  try {
    return !!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
  } catch {
    return false;
  }
}

if (!runtimeOk()) {
  console.warn('[VicPic] Extension context unavailable, content script dormant');
  throw new Error('[VicPic] dormant');
}

// ── state ──────────────────────────────────────────────────────────────────────
let originEl: HTMLElement | null = null;
let originX = 0;
let originY = 0;
let savedThisGesture = false;
let glowEl: HTMLDivElement | null = null;
let toastEl: HTMLDivElement | null = null;
let contextInvalidated = false;
let originHasImage = false;

// ── styles ─────────────────────────────────────────────────────────────────────
const styleEl = document.createElement('style');
styleEl.textContent = `
  .vp-glow{position:fixed;pointer-events:none;z-index:2147483647;border-radius:6px;
    border:2px solid rgba(0,212,255,0.9);
    box-shadow:0 0 16px rgba(0,212,255,0.8),0 0 40px rgba(0,212,255,0.3);
    animation:vp-pulse 1.1s ease-in-out infinite;}
  @keyframes vp-pulse{
    0%,100%{border-color:rgba(0,212,255,0.9);box-shadow:0 0 16px rgba(0,212,255,0.8),0 0 40px rgba(0,212,255,0.3)}
    50%{border-color:rgba(191,0,255,0.95);box-shadow:0 0 22px rgba(191,0,255,0.9),0 0 50px rgba(191,0,255,0.4)}}
  .vp-corner{position:absolute;width:9px;height:9px;border-style:solid;border-color:rgba(0,212,255,0.9)}
  .vp-corner.tl{top:-1px;left:-1px;border-width:2px 0 0 2px}
  .vp-corner.tr{top:-1px;right:-1px;border-width:2px 2px 0 0}
  .vp-corner.bl{bottom:-1px;left:-1px;border-width:0 0 2px 2px}
  .vp-corner.br{bottom:-1px;right:-1px;border-width:0 2px 2px 0}
  .vp-label{position:absolute;top:-18px;left:50%;transform:translateX(-50%);
    background:linear-gradient(90deg,#00d4ff,#bf00ff);
    color:#fff;font:700 9px/1 monospace;letter-spacing:2px;
    padding:2px 8px;border-radius:3px;white-space:nowrap;}
  .vp-toast{position:fixed;bottom:20px;right:20px;z-index:2147483647;
    display:flex;align-items:center;gap:11px;padding:12px 18px;
    background:linear-gradient(135deg,rgba(4,10,20,0.97),rgba(10,24,50,0.97));
    border:1px solid rgba(0,212,255,0.45);border-radius:12px;
    box-shadow:0 0 24px rgba(0,212,255,0.2),0 6px 28px rgba(0,0,0,0.6);
    font-family:system-ui,sans-serif;color:#fff;max-width:290px;overflow:hidden;
    animation:vp-tin .35s cubic-bezier(.175,.885,.32,1.275);}
  .vp-toast.out{animation:vp-tout .25s ease-in forwards}
  @keyframes vp-tin{0%{transform:translateX(110%) scale(.85);opacity:0}100%{transform:none;opacity:1}}
  @keyframes vp-tout{0%{transform:none;opacity:1}100%{transform:translateX(110%) scale(.9);opacity:0}}
  .vp-toast-bar{position:absolute;bottom:0;left:0;height:2px;width:100%;
    background:linear-gradient(90deg,#00d4ff,#bf00ff);animation:vp-tbar 2.6s linear forwards;}
  @keyframes vp-tbar{0%{width:100%}100%{width:0}}
  .vp-toast-title{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
    background:linear-gradient(90deg,#00d4ff,#bf00ff);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
  .vp-toast-sub{font-size:10px;color:rgba(255,255,255,0.45);margin-top:2px;word-break:break-all}
`;
(document.head || document.documentElement).appendChild(styleEl);

// ═══════════════════════════════════════════════════════════════════════════════
// LISTENERS
// ═══════════════════════════════════════════════════════════════════════════════

window.addEventListener('mousedown', (e: MouseEvent) => {
  if (e.button !== 0) return;
  originEl = e.target as HTMLElement;
  originX = e.clientX;
  originY = e.clientY;
  savedThisGesture = false;

  originHasImage = isDirectImageTarget(originEl);
}, true);

window.addEventListener('mousemove', (e: MouseEvent) => {
  if (e.buttons !== 1 || !originEl || savedThisGesture || contextInvalidated) return;
  if (!originHasImage) return;

  const dx = e.clientX - originX;
  const dy = e.clientY - originY;
  if (dx * dx + dy * dy < 25) return;

  const sel = window.getSelection();
  if (sel && sel.type === 'Range') return;

  const url = scanPoint(originX, originY) ?? scanElement(originEl);
  if (url) saveOnce(url, originEl);
}, true);

window.addEventListener('dragstart', (e: DragEvent) => {
  if (savedThisGesture || contextInvalidated) return;
  const target = e.target as HTMLElement;
  let url: string | null = null;
  if (e.dataTransfer) url = fromDataTransfer(e.dataTransfer);
  if (!url) url = scanPoint(e.clientX, e.clientY) ?? scanElement(target);
  if (url) saveOnce(url, target);
}, true);

window.addEventListener('mouseup', () => {
  setTimeout(() => { originEl = null; savedThisGesture = false; originHasImage = false; }, 500);
  glowOff();
}, true);

window.addEventListener('dragend', () => {
  setTimeout(() => { originEl = null; savedThisGesture = false; }, 500);
  glowOff();
}, true);


function scanPoint(x: number, y: number): string | null {
  let els: Element[];
  try {
    els = document.elementsFromPoint(x, y);
  } catch {
    const s = document.elementFromPoint(x, y);
    els = s ? [s] : [];
  }
  for (const el of els) {
    const url = scanElement(el as HTMLElement);
    if (url) return url;
  }
  return null;
}

function scanElement(el: HTMLElement): string | null {
  let node: HTMLElement | null = el;
  for (let i = 0; i < 8 && node; i++) {
    if (node instanceof HTMLImageElement) {
      const u = bestSrc(node);
      if (u) return u;
    }
    const img = node.querySelector<HTMLImageElement>('img');
    if (img) {
      const u = bestSrc(img);
      if (u) return u;
    }
    const bg = bgImgUrl(node);
    if (bg) return bg;
    for (const attr of ['data-src', 'data-original', 'data-lazy', 'data-url', 'data-image', 'data-full']) {
      const v = node.getAttribute(attr);
      if (v && isImgUrl(v)) return abs(v);
    }
    node = node.parentElement;
  }
  return null;
}

function saveOnce(url: string, el: HTMLElement) {
  if (savedThisGesture || contextInvalidated) return;
  if (!runtimeOk()) { contextInvalidated = true; return; }

  savedThisGesture = true;
  glowOn(el.getBoundingClientRect());

  const msg: MessageType = {
    type: 'SAVE_IMAGE',
    payload: {
      imageUrl: url,
      pageUrl: window.location.href,
      pageTitle: document.title || window.location.hostname,
      timestamp: Date.now(),
      domain: window.location.hostname.replace(/^www\./, ''),
      faviconUrl: getFavicon(),
    },
  };

  sendWithRetry(msg, 3);
}

async function sendWithRetry(msg: MessageType, attemptsLeft: number): Promise<void> {
  if (!runtimeOk()) {
    contextInvalidated = true;
    return;
  }

  try {
    const res = await chrome.runtime.sendMessage(msg);

    if (res && typeof res.saved === 'boolean') {
      const imageUrl = (msg as Extract<MessageType, { type: 'SAVE_IMAGE' }>).payload.imageUrl;
      showToast(imageUrl, res.saved);
    } else if (res?.error && attemptsLeft > 1) {
      setTimeout(() => sendWithRetry(msg, attemptsLeft - 1), 300);
    }

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);

    if (
      errMsg.includes('Extension context invalidated') ||
      errMsg.includes('Cannot read properties of undefined')
    ) {
      contextInvalidated = true;
      return;
    }

    if (attemptsLeft > 1 && (
      errMsg.includes('Could not establish connection') ||
      errMsg.includes('Receiving end does not exist') ||
      errMsg.includes('message port closed')
    )) {
      setTimeout(() => sendWithRetry(msg, attemptsLeft - 1), 400);
      return;
    }

    if (attemptsLeft === 1) {
      console.warn('[VicPic] sendMessage failed:', errMsg);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function bestSrc(img: HTMLImageElement): string | null {
  const candidates = [
    img.currentSrc,
    img.src,
    img.getAttribute('data-src'),
    img.getAttribute('data-original'),
    img.getAttribute('data-lazy'),
    img.getAttribute('data-full'),
    ...parseSrcset(img.srcset),
  ];
  for (const u of candidates) {
    if (u && isImgUrl(u)) return abs(u);
  }
  return null;
}

function parseSrcset(srcset: string): string[] {
  if (!srcset) return [];
  const parsed = srcset.split(',').map(s => {
    const parts = s.trim().split(/\s+/);
    return { url: parts[0], w: parseFloat(parts[1]) || 0 };
  });
  parsed.sort((a, b) => b.w - a.w);
  return parsed.map(p => p.url).filter(Boolean);
}

function bgImgUrl(el: HTMLElement): string | null {
  try {
    const bg = getComputedStyle(el).backgroundImage;
    if (!bg || bg === 'none') return null;
    const m = bg.match(/url\(["']?([^"')]+)["']?\)/);
    const u = m?.[1];
    if (u && isImgUrl(u)) return abs(u);
  } catch { /* cross-origin */ }
  return null;
}

function fromDataTransfer(dt: DataTransfer): string | null {
  for (const f of Array.from(dt.files)) {
    if (f.type.startsWith('image/')) return URL.createObjectURL(f);
  }
  const uriList = dt.getData('text/uri-list');
  if (uriList) {
    for (const line of uriList.split(/\r?\n/)) {
      const u = line.trim();
      if (u && !u.startsWith('#')) return u;
    }
  }
  const plain = dt.getData('text/plain');
  if (plain && isImgUrl(plain)) return abs(plain);
  return null;
}

function isImgUrl(url: string): boolean {
  if (!url || url.startsWith('data:')) return false;
  if (url.startsWith('blob:')) return true;
  if (/\.(jpe?g|png|gif|webp|svg|avif|bmp|tiff?|ico)(\?|#|$)/i.test(url)) return true;
  const CDN = /twimg\.com|cdninstagram\.com|fbcdn\.net|pinimg\.com|imgur\.com|staticflickr\.com|googleusercontent\.com|tumblr\.com|redd\.it|unsplash\.com|giphy\.com|cloudinary\.com|imgix\.net|imagekit\.io|akamaized\.net|githubusercontent\.com/i;
  if (CDN.test(url)) return true;
  if (/[?&](format|fmt|type)=(jpe?g|png|webp|gif|avif)/i.test(url)) return true;
  if (/\/(photos?|images?|img|media|pics?|pictures?|thumb(nail)?|avatar|banner|poster)\//i.test(url)) return true;
  return false;
}

function abs(url: string): string {
  if (!url || url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:')) return url;
  try { return new URL(url, location.href).href; } catch { return url; }
}

function getFavicon(): string {
  return document.querySelector<HTMLLinkElement>('link[rel*="icon"]')?.href
    ?? `${location.origin}/favicon.ico`;
}

function isDirectImageTarget(el: HTMLElement): boolean {

  if (el instanceof HTMLImageElement) return !!bestSrc(el);

  if (bgImgUrl(el)) return true;

  const img = el.querySelector<HTMLImageElement>('img');
  if (img) {
    const elRect = el.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    const elArea = elRect.width * elRect.height;
    const imgArea = imgRect.width * imgRect.height;
    if (elArea > 0 && imgArea / elArea > 0.5) return !!bestSrc(img);
  }

  // Check image-hinting data attributes on the element itself only
  for (const attr of ['data-src', 'data-original', 'data-lazy', 'data-url', 'data-image', 'data-full']) {
    const v = el.getAttribute(attr);
    if (v && isImgUrl(v)) return true;
  }

  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOW
// ═══════════════════════════════════════════════════════════════════════════════
function glowOn(rect: DOMRect) {
  glowOff();
  if (!rect || rect.width < 8 || rect.height < 8) return;
  glowEl = document.createElement('div');
  glowEl.className = 'vp-glow';
  glowEl.style.cssText = `top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px`;
  for (const c of ['tl', 'tr', 'bl', 'br']) {
    const d = document.createElement('div');
    d.className = `vp-corner ${c}`;
    glowEl.appendChild(d);
  }
  const label = document.createElement('div');
  label.className = 'vp-label';
  label.textContent = 'VICPIC';
  glowEl.appendChild(label);
  (document.body ?? document.documentElement).appendChild(glowEl);
}

function glowOff() { glowEl?.remove(); glowEl = null; }

// ═══════════════════════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════════════════════
function showToast(url: string, isNew: boolean) {
  toastEl?.remove();
  const short = url.length > 52 ? url.slice(0, 50) + '…' : url;
  const t = document.createElement('div');
  t.className = 'vp-toast';
  t.innerHTML = `
    <div style="flex-shrink:0;width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(0,212,255,.15),rgba(191,0,255,.15));border:1px solid rgba(0,212,255,.4)">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </div>
    <div style="min-width:0">
      <div class="vp-toast-title">${isNew ? 'Saved to VicPic' : 'Already saved'}</div>
      <div class="vp-toast-sub">${short}</div>
    </div>
    <div class="vp-toast-bar"></div>`;
  (document.body ?? document.documentElement).appendChild(t);
  toastEl = t;
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 260); }, 2600);
}