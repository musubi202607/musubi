const CACHE_NAME =
"kitchen-v1";


const CACHE_FILES = [

"kitchen.html",
"kitchen-manifest.json",
"css/style.css",
"js/config.js",
"js/kitchen.js"

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
.then(cache=>{

return cache.addAll(
CACHE_FILES
);

})

);

});


// =========================
// 有効化
// =========================
self.addEventListener(
"activate",
event=>{

event.waitUntil(

caches.keys()
.then(keys=>{

return Promise.all(

keys.map(key=>{

if(
key!==CACHE_NAME
){

return caches.delete(
key
);

}

})

);

})

);

});


// =========================
// リクエスト
// =========================
self.addEventListener(
"fetch",
event=>{


event.respondWith(

caches.match(
event.request
)
.then(response=>{


return response ||

fetch(
event.request
);


})

);


});
