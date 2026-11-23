const CACHE='onepiece-app-v43-20261123';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'])));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(x=>x.startsWith('onepiece-app-')&&x!==CACHE).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==self.location.origin||e.request.method!=='GET')return;if(/prix_cardmarket\.json|cards_by_id\.json/.test(u.pathname))return;
if(e.request.mode==='navigate')e.respondWith(fetch(e.request).catch(()=>caches.match('./index.html')));
else if(/\.(?:png|webmanifest|js)$/.test(u.pathname))e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)))});
