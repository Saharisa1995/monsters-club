var CACHE_NAME = "monsters-club-v1";
var CORE_ASSETS = [
  "./index.html",
  "./app.js",
  "./config.js",
  "./manifest.json"
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
      return Promise.all(keys.filter(function(k){ return k!==CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event){
  var url = event.request.url;
  // Never cache Supabase API calls -- always go to network for live data
  if(url.indexOf("supabase.co") !== -1){
    event.respondWith(fetch(event.request).catch(function(){
      return new Response(JSON.stringify({error:"offline"}), {headers:{"Content-Type":"application/json"}});
    }));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(cached){
      return cached || fetch(event.request).then(function(res){
        var resClone = res.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, resClone); });
        return res;
      }).catch(function(){ return cached; });
    })
  );
});
