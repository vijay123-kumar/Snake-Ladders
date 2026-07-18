// Snake & Ladder — service worker
// Bump CACHE_NAME whenever you ship new static assets so old caches are cleared.
var CACHE_NAME = "snake-ladder-v1";
var CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(CORE_ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// Cache-first for same-origin static assets; network passthrough for everything
// else (fonts, Firebase, confetti) so online multiplayer always gets live data.
self.addEventListener("fetch", function(event){
  var url = new URL(event.request.url);
  if(url.origin !== location.origin) return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      return cached || fetch(event.request).then(function(response){
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        return response;
      }).catch(function(){ return cached; });
    })
  );
});
