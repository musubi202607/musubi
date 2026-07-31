const CACHE_NAME =
  "musubi-staff-v1";


const CACHE_FILES = [

  "staff.html",

  "staff-order.html",

  "staff-bbq.html",

  "bbq-option.html",

  "payment-waiting.html",

  "staff-reservations.html",

  "staff-reservation-detail.html",

  "css/style.css",

  "js/config.js",

  "js/staff-auth.js",

  "js/staff-order.js",

  "js/bbq-tablet.js",

  "icon.png"

];


// =========================
// install
// =========================

self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches.open(
        CACHE_NAME
      )
      .then(
        cache =>
          cache.addAll(
            CACHE_FILES
          )
      )

    );

  }
);


// =========================
// activate
// =========================

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches.keys()
      .then(
        keys =>

          Promise.all(

            keys.map(

              key => {

                if(
                  key !== CACHE_NAME
                ){

                  return caches.delete(
                    key
                  );

                }

              }

            )

          )

      )

    );

  }
);


// =========================
// fetch
// =========================

self.addEventListener(
  "fetch",
  event => {


    const request =
      event.request;


    // APIはキャッシュしない
    if(
      request.url.includes(
        "/api/"
      )
    ){

      return;

    }


    event.respondWith(

      fetch(request)

      .catch(

        () =>

        caches.match(
          request
        )

      )

    );


  }
);