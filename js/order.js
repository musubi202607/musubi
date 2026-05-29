async function loadOrder() {

  const response =
    await fetch(
      API_URL + '?mode=products'
    );

  const products =
    await response.json();

  const cart =
    JSON.parse(
      localStorage.getItem('cart')
    ) || [];

  const orderItems =
    document.getElementById(
      'orderItems'
    );

  let total = 0;

  orderItems.innerHTML = '';

  let orderText = '';

  cart.forEach(item => {

    const product =
      products.find(
        p => p.id == item.id
      );

    if(!product) return;

    const subtotal =
      product.price * item.qty;

    total += subtotal;

    orderText +=
      `${product.name} × ${item.qty}\n`;

    orderItems.innerHTML += `

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
            ¥${subtotal}
          </div>

        </div>

      </div>

    `;
  });

  orderItems.innerHTML += `

    <h2>
      合計 ¥${total.toLocaleString()}
    </h2>

  `;
}

async function sendOrder(){

  const name =
    document.getElementById(
      'customerName'
    ).value;

  const tel =
    document.getElementById(
      'customerTel'
    ).value;

  const response =
    await fetch(
      API_URL + '?mode=products'
    );

  const products =
    await response.json();

  const cart =
    JSON.parse(
      localStorage.getItem('cart')
    ) || [];

  let total = 0;

  let orderText = '';

  cart.forEach(item => {

    const product =
      products.find(
        p => p.id == item.id
      );

    if(!product) return;

    const subtotal =
      product.price * item.qty;

    total += subtotal;

    orderText +=
      `${product.name} × ${item.qty}\n`;

  });

  orderText +=
`\n合計金額：¥${total}`;

  await fetch(API_URL, {

    method: 'POST',

    headers: {
      'Content-Type':
        'application/json'
    },

    body: JSON.stringify({

      pickupDate: '',

      name,

      tel,

      orderText,

      total

    })

  });

  alert(
    '注文ありがとうございました'
  );

  localStorage.removeItem(
    'cart'
  );

  location.href =
    'index.html';
}

loadOrder();