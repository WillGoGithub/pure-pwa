const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico',
  '/Content/bootstrap.min.css',
  '/Content/site.min.css',
  '/Content/slot.min.css',
  '/Content/wheel.min.css',
  '/Content/poker.min.css',
  '/Content/Images/bg.png',
  '/Content/Images/side-nav-bg.jpg',
  '/Content/Images/QR.png',
  '/Content/Images/offline.jpg',
  '/Content/Font/material-icons.woff2',
  '/Content/Images/Icons/icon-128x128.png',
  '/Content/Images/Icons/icon-144x144.png',
  '/Content/Images/Icons/icon-152x152.png',
  '/Content/Images/Icons/icon-196x196.png',
  '/Content/Images/Icons/icon-256x256.png',
  '/Content/Images/Icons/icon-512x512.png',
  '/Scripts/modernizr-2.8.3.min.js',
  '/Scripts/jquery-3.3.1.min.js',
  '/Scripts/bootstrap.min.js',
  '/Scripts/install-1.0.0.min.js',
  '/Scripts/app-1.0.1.min.js',
  '/Scripts/slot.min.js',
  '/Scripts/wheel.min.js',
  '/Scripts/poker.min.js',
];

self.addEventListener('install', (evt) => {
  //console.log('[ServiceWorker] Install');
  evt.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      //console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  //console.log('[ServiceWorker] Activate');
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            //console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  // Parse the URL:
  //var requestURL = new URL(e.request.url);

  //if (evt.request.url.includes('/forecast/')) {
  //    console.log('[Service Worker] Fetch (data)', evt.request.url);
  //    evt.respondWith(
  //        caches.open(DATA_CACHE_NAME).then((cache) => {
  //            return fetch(evt.request)
  //                .then((response) => {
  //                    // If the response was good, clone it and store it in the cache.
  //                    if (response.status === 200) {
  //                        cache.put(evt.request.url, response.clone());
  //                    }
  //                    return response;
  //                }).catch((err) => {
  //                    // Network request failed, try to get it from the cache.
  //                    return cache.match(evt.request);
  //                });
  //        }));
  //    return;
  //}

  //if (e.request.method === 'POST') {
  //    return;
  //}

  //console.log(event.request);

  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request).then((response) => {
        return response || fetch(evt.request);
      });
    })
    //caches.match(e.request).then(function (response) {
    //    return response || fetch(e.request);
    //})
  );
});

// 推送通知
self.addEventListener('push', function (evt) {
  //console.log('[Service Worker] Push Received.');
  //console.log('[Service Worker] Push had this data:' + event.data.text());

  RefreshApp();

  //const title = '有新的更新';
  //const options = {
  //    body: 'Yay it works.',
  //    icon: 'images/icon.png',
  //    badge: 'images/badge.png'
  //};

  //event.waitUntil(self.registration.showNotification(title, options));
});

// 使用者點選通知
self.addEventListener('notificationclick', (evt) => {
  console.log('[Service Worker] Notification click Received.');

  evt.notification.close();

  //event.waitUntil(
  //    clients.openWindow('')
  //);
});
