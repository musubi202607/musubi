const CACHE_NAME = "musubi-pwa-v1";

const CACHE_FILES = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/config.js",
  "./manifest.json"
];


// インストール
self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(CACHE_FILES);

      })
  );

});


// 有効化
self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys.map(key => {

            if(key !== CACHE_NAME){

              return caches.delete(key);

            }

          })

        );

      })

  );

});


// 通信処理
self.addEventListener("fetch", event => {


  const url = new URL(event.request.url);


  // APIはキャッシュしない
  if(
    url.hostname.includes("workers.dev") ||
    url.hostname.includes("script.google.com")
  ){

    return;

  }


  event.respondWith(

    caches.match(event.request)
      .then(response => {


        return response || fetch(event.request);


      })

  );


});