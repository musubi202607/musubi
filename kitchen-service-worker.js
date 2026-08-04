const CACHE_NAME =
  "musubi-kitchen-v1";


const CACHE_FILES = [

  "./",

  "kitchen-index.html",

  "kitchen.html",

  "css/style.css",

  "js/config.js",

  "js/kitchen.js",

  "kitchen-manifest.json"

];


// =========================
// インストール
// =========================
self.addEventListener(

  "install",

  event=>{

    event.waitUntil(

      caches.open(
        CACHE_NAME
      )
      .then(
        cache=>
          cache.addAll(
            CACHE_FILES
          )
      )

    );

  }

);



// =========================
// 起動
// =========================
self.addEventListener(

  "activate",

  event=>{

    event.waitUntil(

      caches.keys()
      .then(

        keys=>{

          return Promise.all(

            keys.map(

              key=>{

                if(
                  key !== CACHE_NAME
                ){

                  return caches.delete(
                    key
                  );

                }

              }

            )

          );

        }

      )

    );

  }

);



// =========================
// 通信
// =========================
self.addEventListener(

  "fetch",

  event=>{


    event.respondWith(

      fetch(
        event.request
      )
      .catch(

        ()=>{

          return caches.match(
            event.request
          );

        }

      )

    );


  }

);
