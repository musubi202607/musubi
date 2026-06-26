let bbqCart = [];

// =========================
// 商品ロード（Worker版REST）
// =========================
async function loadBbqOptions() {

  try {

    const response =
      await fetch(
        API_URL + '/api/products'
      );

    const products =
      await response.json();

    const optionGrid =
      document.getElementById('optionGrid');

    const drinkGrid =
      document.getElementById('drinkGrid');

    if (!optionGrid || !drinkGrid) return;

    optionGrid.innerHTML = '';
    drinkGrid.innerHTML = '';

    products
      .sort((a, b) =>
        Number(a.sort || 9999) - Number(b.sort || 9999)
      )
      .forEach(product => {
        
        console.log(product.name, product.type);
        
        if (
          product.type !== 'bbq-option' &&
          product.type !== 'drink'
        ) return;

        const card = `

          <div class="product-card">

            <img
              src="${product.image || ''}"
              alt="${product.name}"
            >

            <div class="product-content">

              <h3>${product.name}</h3>

              <p>${product.description || ''}</p>

              <div class="price">
                ¥${Number(product.price || 0).toLocaleString()}
              </div>

              <div class="qty-area">

                <button
                  class="qty-btn"
                  onclick="changeBbqQty(${product.id}, -1)"
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
                  onclick="changeBbqQty(${product.id}, 1)"
                >
                  ＋
                </button>

              </div>

              <button
                onclick="addBbqOption(
                  ${product.id},
                  '${product.name}',
                  ${product.price || 0}
                )"
              >
                カートへ追加
              </button>

            </div>

          </div>

        `;
        
        console.log(card);

        if (product.type === 'bbq-option') {
          optionGrid.innerHTML += card;
        }

        if (product.type === 'drink') {
          drinkGrid.innerHTML += card;
        }

      });

  } catch (error) {

    console.error(error);
    alert('商品取得エラー');

  }

}

// =========================
// 数量変更
// =========================
function changeBbqQty(id, diff) {

  const target =
    document.getElementById('qty-' + id);

  if (!target) return;

  let qty =
    Number(target.textContent || 1);

  qty += diff;

  if (qty < 1) qty = 1;

  target.textContent = qty;

}

// =========================
// カート追加
// =========================
function addBbqOption(id, name, price) {

  let cart =
    JSON.parse(localStorage.getItem('bbqOptionCart')) || [];

  const qty =
    Number(
      document.getElementById('qty-' + id)?.textContent || 1
    );

  const existing =
    cart.find(item => String(item.id) === String(id));

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id,
      name,
      price,
      qty
    });
  }

  localStorage.setItem(
    'bbqOptionCart',
    JSON.stringify(cart)
  );

  renderCart();

  alert('追加しました');

}

// =========================
// カート表示
// =========================
function renderCart() {

  const cart =
    JSON.parse(localStorage.getItem('bbqOptionCart')) || [];

  const target =
    document.getElementById('cartArea');

  if (!target) return;

  let total = 0;

  target.innerHTML = '';

  if (cart.length === 0) {

    target.innerHTML = `<p>商品がありません</p>`;
    updateCartSummary();
    return;

  }

  cart.forEach(item => {

    const subtotal =
      Number(item.price) * Number(item.qty);

    total += subtotal;

    target.innerHTML += `

      <div class="product-card">

        <div class="product-content">

          <h3>${item.name}</h3>

          <p>数量：${item.qty}</p>

          <div class="price">
            ¥${subtotal.toLocaleString()}
          </div>

          <button onclick="changeOrderQty('${item.id}', -1)">－</button>
          <button onclick="changeOrderQty('${item.id}', 1)">＋</button>

        </div>

      </div>

    `;

  });

  target.innerHTML += `
    <h2>合計 ¥${total.toLocaleString()}</h2>
  `;

  updateCartSummary();

}

// =========================
// サマリー更新
// =========================
function updateCartSummary() {

  const cart =
    JSON.parse(localStorage.getItem('bbqOptionCart')) || [];

  let qty = 0;
  let total = 0;

  cart.forEach(item => {
    qty += Number(item.qty);
    total += Number(item.qty) * Number(item.price);
  });

  const target =
    document.getElementById('cartSummary');

  if (!target) return;

  target.innerHTML = `
    カート ${qty}点 ／ ¥${total.toLocaleString()}
  `;

}

// =========================
// 数量変更（カート内）
// =========================
function changeOrderQty(id, diff) {

  let cart =
    JSON.parse(localStorage.getItem('bbqOptionCart')) || [];

  const item =
    cart.find(p => String(p.id) === String(id));

  if (!item) return;

  item.qty = Number(item.qty) + diff;

  if (item.qty <= 0) {
    cart = cart.filter(p => String(p.id) !== String(id));
  }

  localStorage.setItem(
    'bbqOptionCart',
    JSON.stringify(cart)
  );

  renderCart();

}

// =========================
// クリア
// =========================
function clearCart() {

  localStorage.removeItem('bbqOptionCart');

  renderCart();

}

// =========================
// 初期化
// =========================
window.addEventListener('DOMContentLoaded', () => {
  loadBbqOptions();
  renderCart();
});