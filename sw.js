// Service worker: deja el juego jugable sin conexión una vez instalado.
// scripts/build-web.mjs sustituye la versión por el commit en cada despliegue para invalidar la caché.
const VERSION = "__VERSION__";
const CACHE = `bate-al-cunado-${VERSION}`;
const PRECACHE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "data/niveles.json",
  "data/cambio-climatico.json",
  "images/cunao-barra-normal.webp",
  "images/cunao-barra-lost.webp",
  "images/cunao-barra-win.webp",
  "images/cunao-barra-menu.webp",
  "images/placeholder-terraplanismo.webp",
  "images/placeholder-vacunas-homeopatia.webp",
  "images/placeholder-energia.webp",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("bate-al-cunado-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Red primero para HTML y JSON (contenido nuevo en cuanto haya conexión),
// caché primero para el resto (imágenes, iconos, fuentes).
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;

  const fresh = sameOrigin && (req.mode === "navigate" || url.pathname.endsWith(".json") || url.pathname.endsWith(".html"));
  const save = res => {
    if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  };

  e.respondWith(fresh
    ? fetch(req).then(save).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match("index.html")))
    : caches.match(req).then(r => r || fetch(req).then(save))
  );
});
