<div class="qty-area">

  <button
    class="qty-btn"
    onclick="
      changeQty(
        ${product.id},
        -1
      )
    "
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
    onclick="
      changeQty(
        ${product.id},
        1
      )
    "
  >
    ＋
  </button>

</div>

<button
  onclick="
    addToCartQty(
      ${product.id}
    )
  "
>
  カートに追加
</button>

function changeQty(
  productId,
  diff
){

  const target =
    document.getElementById(
      `qty-${productId}`
    );

  let qty =
    Number(
      target.innerText
    );

  qty += diff;

  if(
    qty < 1
  ){
    qty = 1;
  }

  target.innerText =
    qty;

}

function addToCartQty(
  productId
){

  const qty =
    Number(
      document.getElementById(
        `qty-${productId}`
      ).innerText
    );

  addToCart(
    productId,
    qty
  );

}