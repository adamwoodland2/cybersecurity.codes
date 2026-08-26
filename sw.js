/* cybersecurity.codes — service worker.
   The whole site is static and the codes are computed client-side from the UTC
   date, so once the shell is cached the app works fully offline — including the
   midnight rollover.

   Bump CACHE on every deploy that changes any precached file, otherwise the old
   shell keeps serving from cache. */

"use strict";

const CACHE = "gcca-v2";

const PRECACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/favicon.svg",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Network-first: navigations should pick up a redeploy immediately, and fall
// back to the cached shell when the link is down.
async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request) || await cache.match("/index.html");
    if (cached) return cached;
    throw err;
  }
}

// Stale-while-revalidate for assets: instant paint, updated in the background.
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((fresh) => {
      if (fresh && fresh.ok) cache.put(request, fresh.clone());
      return fresh;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Leave cross-origin requests (Google Fonts) to the browser: the site's CSP
  // sets connect-src 'self', so a fetch() from here could not reach them anyway.
  // Offline, VT323 simply falls back to Courier New.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    request.mode === "navigate" ? networkFirst(request) : staleWhileRevalidate(request)
  );
});
