async function loadBbqOptions(){

  const response =
    await fetch(
      API_URL +
      '?mode=products'
    );

  const products =
    await response.json();

  const bbqOptions =
    products.filter(
      p =>
        p.type ===
        'bbq-option'
    );

  const grid =
    document.getElementById(
      'productGrid'
    );

  grid.innerHTML = '';

  bbqOptions.forEach(
    product => {

      grid.innerHTML += `

        <div class="product-card">

          <img
            src="${product.image}"
            alt="${product.name}"
          >

          <div
            class="product-content"
          >

            <h3>

              ${product.name}

            </h3>

            <p>

              ${product.description}

            </p>

            <div class="price">

              ¥${Number(
                product.price
              ).toLocaleString()}

            </div>

           <div class="qty-area">

  <button
    class="qty-btn"
    onclick="
      changeBbqQty(
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
      changeBbqQty(
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
    addBbqOption(
      ${product.id},
      '${product.name}',
      ${product.price}
    )
  "

>

  カートへ追加

</button>

          </div>

        </div>

      `;

    }
  );

}

function addBbqOption(
  id,
  name,
  price
){

  const cart =
    JSON.parse(
      localStorage.getItem(
        'bbqOptionCart'
      )
    ) || [];

  const existing =
    cart.find(
      item =>
        item.id === id
    );

  const qty = Number(
  document.getElementById(
    `qty-${id}`
  ).innerText
);

if(existing){

  existing.qty += qty;

}else{

  cart.push({

    id:id,

    name:name,

    price:price,

    qty:qty

  });

}

  localStorage.setItem(

    'bbqOptionCart',

    JSON.stringify(
      cart
    )

  );

  alert(
    '追加しました'
  );

}

loadBbqOptions();

function changeBbqQty(
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

function changeOrderQty(
  id,
  diff
){

  let cart =
    JSON.parse(
      localStorage.getItem(
        'bbqOptionCart'
      )
    ) || [];

  const item =
    cart.find(
      p => String(p.id) === String(id)
    );

  if(!item){
    return;
  }

  item.qty =
    Number(item.qty) + diff;

  if(
    item.qty <= 0
  ){

    cart =
      cart.filter(
        p =>
          String(p.id) !== String(id)
      );

  }

  localStorage.setItem(

    'bbqOptionCart',

    JSON.stringify(cart)

  );

  displayBbqOptionOrder();

}