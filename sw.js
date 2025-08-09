// Service Worker for Performance Optimization
const CACHE_NAME = 'radsreview-v1.2';
const STATIC_CACHE = 'radsreview-static-v1.2';
const DYNAMIC_CACHE = 'radsreview-dynamic-v1.2';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/colors.css',
  '/js/main.js',
  '/images/radreview_text.png',
  '/images/radreview_text_dark.PNG',
  '/images/favcon.png',
  '/fonts/inter-v19-cyrillic_latin-regular.woff2',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => 
          key !== STATIC_CACHE && 
          key !== DYNAMIC_CACHE
        ).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Serve from cache
          return response;
        }
        
        // Clone the request for network fetch
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response for caching
          const responseToCache = response.clone();
          
          // Cache dynamic content
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        }).catch(() => {
          // Fallback for offline
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Background sync for improved performance
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Perform background tasks like pre-caching popular resources
  return caches.open(DYNAMIC_CACHE)
    .then(cache => {
      const urlsToCache = [
        '/adrenal_nodules.html',
        '/fleischner.html',
        '/cerebrai.html'
      ];
      
      return Promise.all(
        urlsToCache.map(url => 
          fetch(url).then(response => {
            if (response.status === 200) {
              cache.put(url, response);
            }
          }).catch(() => {
            // Silently fail for background sync
          })
        )
      );
    });
}
