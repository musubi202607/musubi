function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(productId) {

  const cart = getCart();

  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: productId,
      qty: 1
    });
  }

  saveCart(cart);

  alert('カートへ追加しました');
}

function updateCartCount() {

  const cart = getCart();

  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  const target = document.getElementById('cartCount');

  if (target) {
    target.innerText = count;
  }
}

updateCartCount();
async function displayCart() {

  const response = await fetch('data/products.json');

  const products = await response.json();

  const cart = getCart();

  const cartItems = document.getElementById('cartItems');

  if (!cartItems) return;

  cartItems.innerHTML = '';

  if (cart.length === 0) {

    cartItems.innerHTML = `
      <p>カートは空です</p>
    `;

    return;
  }

  cart.forEach(item => {

    const product = products.find(p => p.id === item.id);

    if (!product) return;

    cartItems.innerHTML += `
      <div class="product-card">

        <img src="${product.image}">

        <div class="product-content">

          <h3>${product.name}</h3>

          <p>数量：${item.qty}</p>

          <div class="price">
            ¥${product.price * item.qty}
          </div>

        </div>

      </div>
    `;
  });
}

function clearCart() {

  localStorage.removeItem('cart');

  updateCartCount();

  alert('カートを空にしました');

  location.reload();
}

displayCart();
updateCartCount();

displayCart();

window.addEventListener('pageshow', () => {
  updateCartCount();
});