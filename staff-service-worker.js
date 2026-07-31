const CACHE_NAME =
  "musubi-staff-v1";


const CACHE_FILES = [

  "staff.html",

  "staff-order.html",

  "admin-reservations.html",

  "staff-reservation-detail.html",

  "payment-waiting.html",

  "staff-bbq.html",

  "bbq-option.html",

  "css/style.css",

  "js/config.js",

  "js/staff-auth.js",

  "js/staff-order.js",

  "js/bbq-tablet.js"

];


// インストール
self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(
          CACHE_FILES
        );

      })

    );

  }
);


// 通常取得
self.addEventListener(
  "fetch",
  event => {


    const url =
      new URL(event.request.url);


    // APIはキャッシュしない
    if(
      url.origin !== location.origin
    ){

      return;

    }


    event.respondWith(

      caches.match(
        event.request
      )
      .then(
        cached => {

          return cached ||
          fetch(event.request);

        }

      )

    );


  }
);


// 更新時
self.addEventListener(
  "activate",
  event => {


    event.waitUntil(

      caches.keys()
      .then(keys=>{

        return Promise.all(

          keys.map(key=>{

            if(
              key !== CACHE_NAME
            ){

              return caches.delete(
                key
              );

            }

          })

        );

      })

    );


  }
);