async function loadOrder() {

  const response = await fetch('data/products.json');
  const products = await response.json();

  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  const orderItems = document.getElementById('orderItems');

  let total = 0;

  orderItems.innerHTML = '';

  cart.forEach(item => {

    const product = products.find(
      p => p.id === item.id
    );

    if (!product) return;

    total += product.price * item.qty;

    orderItems.innerHTML += `
      <div class="product-card">

        <img src="${product.image}" alt="${product.name}">

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

  orderItems.innerHTML += `
    <h2 style="margin-top:20px;">
      合計 ¥${total.toLocaleString()}
    </h2>
  `;
}

async function sendOrder() {

  const name =
    document.getElementById('customerName').value.trim();

  const tel =
    document.getElementById('customerTel').value.trim();

  const memo =
    document.getElementById('memo').value.trim();

  if (!name) {
    alert('お名前を入力してください');
    return;
  }

  if (!tel) {
    alert('電話番号を入力してください');
    return;
  }

  const response = await fetch('data/products.json');
  const products = await response.json();

  const cart =
    JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    alert('カートが空です');
    return;
  }

  let orderText = '';
  let total = 0;

  cart.forEach(item => {

    const product = products.find(
      p => p.id === item.id
    );

    if (!product) return;

    const subtotal =
      product.price * item.qty;

    total += subtotal;

    orderText +=
      `${product.name} × ${item.qty} = ¥${subtotal.toLocaleString()}\n`;

  });

  orderText +=
    `\n------------------\n`;

  orderText +=
    `合計金額：¥${total.toLocaleString()}\n`;

  if (memo) {

    orderText +=
      `\n備考：${memo}`;
  }

  const formUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLSfW6b_V0k1mxets8qiIom_Dkru81Vx9V3PpU7F9FUDF92600A/formResponse';

  const formData = new FormData();

  formData.append(
    'entry.1710034436',
    name
  );

  formData.append(
    'entry.1139535215',
    tel
  );

  formData.append(
    'entry.827273850',
    orderText
  );

  await fetch(formUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  });

  alert('ご注文ありがとうございました');

  localStorage.removeItem('cart');

  location.href = 'index.html';
}

loadOrder();