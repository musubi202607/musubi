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


// =========================
// 初期表示
// =========================
window.addEventListener("DOMContentLoaded", async () => {
  await loadProducts();
  await displayCart(); // ← await必須
});