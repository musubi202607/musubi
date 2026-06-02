function getCart() {

  return JSON.parse(
    localStorage.getItem('cart')
  ) || [];

}

function saveCart(cart) {

  localStorage.setItem(
    'cart',
    JSON.stringify(cart)
  );

  updateCartCount();

}

function addToCart(
  productId,
  qty = 1
){

  const cart = getCart();

  const existing =
    cart.find(
      item => item.id === productId
    );

  if(existing){

    existing.qty += qty;

  } else {

    cart.push({
      id: productId,
      qty: qty
    });

  }

  saveCart(cart);

  alert('カートへ追加しました');

}

function updateCartCount() {

  const cart = getCart();

  const count =
    cart.reduce(
      (sum,item) =>
        sum + item.qty,
      0
    );

  const target =
    document.getElementById(
      'cartCount'
    );

  if(target){

    target.innerText = count;

  }

}

async function displayCart() {

  const response =
    await fetch(
      API_URL + '?mode=products'
    );

  const products =
    await response.json();

  const cart =
    getCart();

  const cartItems =
    document.getElementById(
      'cartItems'
    );

  if(!cartItems) return;

  cartItems.innerHTML = '';

  if(cart.length === 0){

    cartItems.innerHTML = `

      <h2>

        カートは空です

      </h2>

    `;

    return;

  }

  let total = 0;

  cart.forEach(item => {

    const product =
      products.find(
        p => p.id == item.id
      );

    if(!product) return;

    const subtotal =
      product.price * item.qty;

    total += subtotal;

    cartItems.innerHTML += `

      <div class="product-card">

        <img src="${product.image}">

        <div class="product-content">

          <h3>
            ${product.name}
          </h3>

          <p>
            数量：${item.qty}
          </p>

          <div class="price">

            ¥${subtotal.toLocaleString()}

          </div>

        </div>

      </div>

    `;

  });

  cartItems.innerHTML += `

    <h2 style="margin-top:20px;">

      合計 ¥${total.toLocaleString()}

    </h2>

  `;

}

function clearCart(){

  localStorage.removeItem(
    'cart'
  );

  updateCartCount();

  location.reload();

}

function goOrder(){

  const cart =
    getCart();

  if(cart.length === 0){

    alert(
      'カートが空です'
    );

    return;

  }

  location.href =
    'order.html';

}

displayCart();

updateCartCount();