// =========================
// 店舗情報取得
// =========================
async function loadShopSettings(){

  const res =

    await fetch(

      API_URL +

      "/api/shop-settings"

    );

  const shop =

    await res.json();

  document.getElementById(

    "shopName"

  ).textContent =

    shop.shopName;

  document.getElementById(

    "phone"

  ).textContent =

    shop.phone;

  document.getElementById(

    "address"

  ).textContent =

    shop.address;

  document.getElementById(

    "businessHours"

  ).textContent =

    shop.businessHours;

  document.getElementById(

    "holidayText"

  ).textContent =

    shop.holidayText;

    document.getElementById(

    "topImage"

  ).src =

    shop.topImage;

  document.getElementById(

    "shopImage1"

  ).src =

    shop.shopImage1;

  document.getElementById(

    "shopImage2"

  ).src =

    shop.shopImage2;

  document.getElementById(

    "shopImage3"

  ).src =

    shop.shopImage3;
    
    document.getElementById(

    "instagram"

  ).href =

    shop.instagram;

  document.getElementById(

    "line"

  ).href =

    shop.line;

  document.getElementById(

    "googleMap"

  ).href =

    shop.googleMap;
  
  document.getElementById(

    "notice1"

  ).textContent =

    shop.notice1;

  document.getElementById(

    "notice2"

  ).textContent =

    shop.notice2;

  document.getElementById(

    "notice3"

  ).textContent =

  shop.notice3;

  document.getElementById(
    "footerShopName"
  ).textContent =
    shop.shopName;

  document.getElementById(
    "footerPhone"
  ).textContent =
    shop.phone;

  document.getElementById(
    "footerBusinessHours"
  ).textContent =
    shop.businessHours;

  document.getElementById(
    "footerHolidayText"
  ).textContent =
    shop.holidayText;

}

// =========================
// 次回・次々回店休日取得
// =========================
async function loadNextHoliday(){

  try{

    const res =
      await fetch(

        API_URL +
        "/api/store-business-calendar"

      );


    const holidays =
      await res.json();



    const today =
      new Date();


    const todayText =

      today.getFullYear() +
      "-" +
      String(
        today.getMonth()+1
      ).padStart(2,"0") +
      "-" +
      String(
        today.getDate()
      ).padStart(2,"0");



    const nextHolidays =

      holidays

        .filter(item=>{

          return (

            item.status === "店休日" &&

            item.date > todayText

          );

        })

        .sort((a,b)=>{

          return (
            a.date.localeCompare(
              b.date
            )
          );

        })

        .slice(0,2);



    const texts =
      nextHolidays.map(item=>{

        const parts =
          item.date.split("-");


        return (

          Number(parts[1]) +
          "月" +
          Number(parts[2]) +
          "日"

        );

      });



    let holidayText = "";



    if(texts.length >= 1){

      holidayText +=

        "次回店休日：" +
        texts[0];

    }


    if(texts.length >= 2){

      holidayText +=

        "<br>次々回店休日：" +
        texts[1];

    }



    const holiday =
      document.getElementById(
        "holidayText"
      );


    if(holiday){

      holiday.innerHTML =
        holidayText;

    }



    const footerHoliday =
      document.getElementById(
        "footerHolidayText"
      );


    if(footerHoliday){

      footerHoliday.innerHTML =
        holidayText;

    }



  }catch(error){

    console.error(
      "店休日取得エラー",
      error
    );

  }

}

// =========================
// 商品一覧表示
// =========================
async function loadProducts(){

  const products =
    await loadProductsCache();

  const onigiri =
    products.filter(
      p =>
        p.type ===
        "onigiri"
    );

  const grid =
    document.getElementById(
      "productGrid"
    );

  if(!grid){
    return;
  }

  grid.innerHTML = "";

  onigiri.forEach(product=>{

    grid.innerHTML += `

<div class="product-card">

<img

src="${product.image}"

alt="${product.name}"

>

<div class="product-content">

<h3>

${product.name}

</h3>

<p>

${product.description}

</p>

<div class="price">

¥${Number(product.price).toLocaleString()}

</div>

<div class="qty-area">

<button

class="qty-btn"

onclick="changeQty(${product.id},-1)"

>

－

</button>

<span

id="qty-${product.id}"

class="qty-value"

>

1

</span>

<button

class="qty-btn"

onclick="changeQty(${product.id},1)"

>

＋

</button>

</div>

<button

onclick="addToCartQty(${product.id})"

>

カートへ追加

</button>

</div>

</div>

`;

  });

}

// =========================
// 数量変更
// =========================
function changeQty(

  productId,
  diff

){

  const target =
    document.getElementById(
      "qty-" +
      productId
    );

  if(!target){
    return;
  }

  let qty =
    Number(
      target.innerText
    );

  qty += diff;

  if(qty < 1){

    qty = 1;

  }

  target.innerText =
    qty;

}


// =========================
// カート追加
// =========================
async function addToCartQty(

  productId

){

  const qty =
    Number(

      document.getElementById(

        "qty-" +
        productId

      ).innerText

    );

  await addToCart(

    productId,
    qty

  );

  document.getElementById(

    "qty-" +
    productId

  ).innerText = 1;

}

async function updateCartCount() {

  const cart = await getCart();

  const cartCount = document.getElementById("cartCount");

  if (!cartCount) return;

  const count = cart.reduce(
    (sum, item) => sum + Number(item.qty),
    0
  );

  cartCount.innerText = count;
}

// =========================
// 初期表示
// =========================
window.addEventListener("DOMContentLoaded", async () => {
  await loadShopSettings();
  await loadNextHoliday();
  await loadProducts();
  await updateCartCount(); // ← await必須
});