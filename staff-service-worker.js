const CACHE_NAME = "musubi-staff-v1";

const FILES = [

  "staff.html",

  "staff-order.html",
  "staff-bbq.html",
  "bbq-option.html",

  "payment-waiting.html",

  "css/style.css",

  "js/config.js",
  "js/staff-auth.js",

  "js/staff-order.js",
  "js/bbq.js",
  "js/bbq-tablet.js",
 
];


self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches.open(CACHE_NAME)
      .then(
        cache =>
          cache.addAll(FILES)
      )

    );

  }
);


self.addEventListener(
  "fetch",
  event => {

    event.respondWith(

      caches.match(event.request)
      .then(

        cached =>

          cached ||
          fetch(event.request)

      )

    );

  }
);


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

                return caches.delete(key);

              }

            }

          )

        )

      )

    );

  }
);
