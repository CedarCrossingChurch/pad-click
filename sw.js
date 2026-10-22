// Keeps the app working when the church Wi-Fi drops.
// The app files and fonts are cached; the song library is cached by the app itself.
// When you change index.html, bump CACHE (v1 -> v2) so every device picks up the new version.
const CACHE = 'padclick-v19';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  // cache: 'reload' skips the browser's own cache so a new version never installs yesterday's page
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('padclick-') && k !== CACHE).map(k => caches.delete(k)))) // keeps saved PDF charts
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname.endsWith('supabase.co')) return; // live data, handled by the app
  const sameSite = url.origin === self.location.origin;
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  const pdfViewer = url.hostname === 'cdn.jsdelivr.net' && url.pathname.startsWith('/npm/pdfjs-dist@'); // PDF chart viewer
  if (!sameSite && !fonts && !pdfViewer) return;

  // Serve the saved copy right away, and refresh it in the background.
  e.respondWith(caches.open(CACHE).then(async cache => {
    const saved = await cache.match(e.request, { ignoreSearch: sameSite });
    const fresh = fetch(e.request).then(res => {
      if (res.ok || res.type === 'opaque') cache.put(e.request, res.clone());
      return res;
    }).catch(() => saved || (e.request.mode === 'navigate' ? cache.match('./index.html') : undefined));
    return saved || fresh;
  }));
});
