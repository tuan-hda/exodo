const CACHE_NAME = 'exodo-shell-v2'
const APP_SHELL = ['/', '/manifest.webmanifest', '/icon.svg', '/icons/icon-192.svg', '/icons/icon-512.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const requestUrl = new URL(request.url)
  const cacheableAsset = ['font', 'image', 'script', 'style'].includes(request.destination)
  const isSameOrigin = requestUrl.origin === self.location.origin
  if (request.method !== 'GET' || !isSameOrigin || !cacheableAsset) {
    if (request.mode !== 'navigate' || !isSameOrigin) return
    event.respondWith(fetch(request).catch(() => caches.match('/').then((cached) => cached ?? Response.error())))
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })
    }),
  )
})
