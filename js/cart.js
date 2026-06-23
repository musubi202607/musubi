// =========================
// セッション管理（ここだけローカルOK）
// =========================
const API_URL = "https://musubi-online.musubi-202607.workers.dev";

function getSessionId() {
  let id = localStorage.getItem('sessionId');

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('sessionId', id);
  }

  return id;
}


// =========================
// カート取得（API化）
// =========================
async function getCart() {

  const sessionId = getSessionId();

  const res = await fetch(
    API_URL + '/api/cart/get?sessionId=' + sessionId
  );

  return await res.json();
}


// =========================
// カート追加（API化）
// =========================
async function addToCart(productId, qty = 1) {

  const sessionId = getSessionId();

  await fetch(API_URL + '/api/cart/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId,
      productId,
      qty
    })
  });

  alert('カートへ追加しました');

  updateCartCount();
}


// =========================
// カート件数更新（非同期）
// =========================
async function updateCartCount() {

  const cart = await getCart();

  const count = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const target = document.getElementById('cartCount');

  if (target) {
    target.innerText = count;
  }
}


// =========================
// カート表示
// =========================
async function displayCart() {

  const [productsRes, cart] = await Promise.all([
    fetch(API_URL + "/api/products"),
    getCart()
  ]);

  const products = await productsRes.json();

  const cartItems = document.getElementById('cartItems');

  if (!cartItems) return;

  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <h2>カートは空です</h2>
    `;
    return;
  }

  let total = 0;

  cart.forEach(item => {

    const product = products.find(p => p.id == item.id);
    if (!product) return;

    const subtotal = product.price * item.qty;
    total += subtotal;

    cartItems.innerHTML += `
      <div class="product-card">

        <img src="${product.image}">

        <div class="product-content">

          <h3>${product.name}</h3>

          <p>数量：${item.qty}</p>

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


// =========================
// カート削除（API化）
// =========================
async function clearCart() {

  const sessionId = getSessionId();

  await fetch(
    API_URL + '/api/cart/clear?sessionId=' + sessionId
  );

  updateCartCount();
  location.reload();
}


// =========================
// 注文画面へ
// =========================
async function goOrder() {

  const cart = await getCart();

  if (cart.length === 0) {
    alert('カートが空です');
    return;
  }

  location.href = 'order.html';
}


// =========================
// 初期表示
// =========================
displayCart();
updateCartCount();

async function placeOrder() {

  const sessionId = getSessionId();

  const res = await fetch(API_URL + "/api/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sessionId
    })
  });

  if (!res.ok) {
    alert("注文に失敗しました");
    return;
  }

  const data = await res.json();

  alert("注文完了！注文番号: " + data.orderId);

  location.href = "complete.html";
}