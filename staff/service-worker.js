const CACHE_NAME =
  "musubi-staff-v1";


// =========================
// Install
// =========================
self.addEventListener(
  "install",
  event => {

    self.skipWaiting();

  }
);


// =========================
// Activate
// =========================
self.addEventListener(
  "activate",
  event => {

    self.clients.claim();

  }
);


// =========================
// Fetch
// =========================
self.addEventListener(
  "fetch",
  event => {


    const url =
      new URL(
        event.request.url
      );


    // APIは常に最新
    if(
      url.hostname.includes(
        "workers.dev"
      )
    ){

      return;

    }


    // HTMLも最新取得
    if(
      event.request.headers
      .get("accept")
      ?.includes("text/html")
    ){

      event.respondWith(

        fetch(
          event.request
        )

      );

      return;

    }


  }
);