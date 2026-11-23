const SHELL='onepiece-app-v5-20261123';
const PHOTOS='onepiece-confirmed-photos-v5';
const FILES=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(SHELL).then(cache=>cache.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('onepiece-app-')&&key!==SHELL).map(k=>caches.delete(k))))]))});
const isPhoto=url=>/^https:$/.test(url.protocol)&&/^(en|fr|asia-en)\.onepiece-cardgame\.com$|^one-piece\.cards$|^optcg-api\.arjunbansal-ai\.workers\.dev$|^limitlesstcg\.nyc3\.cdn\.digitaloceanspaces\.com$/.test(url.hostname);
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(event.request.destination==='image'&&isPhoto(url)){
  event.respondWith(caches.open(PHOTOS).then(async cache=>(await cache.match(event.request))||fetch(event.request)));
  return;
 }
 if(url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request).then(r=>{if(r.ok){const copy=r.clone();event.waitUntil(caches.open(SHELL).then(c=>c.put('./index.html',copy)))}return r}).catch(()=>caches.match('./index.html')));return;
 }
 if(/\.(?:png|webmanifest|js)$/.test(url.pathname))event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request)));
});
// Cache ONLY photo URLs that already passed the browser's image onload validation.
self.addEventListener('message',event=>{
 if(event.data?.type!=='CACHE_VALID_IMAGE'||typeof event.data.url!=='string')return;
 try{const url=new URL(event.data.url);if(!isPhoto(url))return;
 event.waitUntil(caches.open(PHOTOS).then(async cache=>{
  const req=new Request(url.href,{mode:'no-cors',credentials:'omit',referrerPolicy:'no-referrer'});
  if(await cache.match(req))return;
  const response=await fetch(req);
  if(response.ok||response.type==='opaque')await cache.put(req,response);
 }).catch(()=>{}))
 }catch{}
});
