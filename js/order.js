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

  const customerName =
    document.getElementById(
      'customerName'
    ).value;

  const customerTel =
    document.getElementById(
      'customerTel'
    ).value;

  const memo =
    document.getElementById(
      'memo'
    )?.value || '';

  const response =
    await fetch(
      API_URL +
      '?mode=products'
    );

  const products =
    await response.json();

  const cart =
    JSON.parse(
      localStorage.getItem(
        'cart'
      )
    ) || [];

  if(cart.length === 0){

    alert(
      '商品がありません'
    );

    return;

  }

  const items = [];

  cart.forEach(item => {

    const product =
      products.find(
        p => p.id == item.id
      );

    if(!product) return;

    items.push({

      id:
        product.id,

      name:
        product.name,

      price:
        product.price,

      qty:
        item.qty

    });

  });

  const orderData = {

    orderType:
      'ONIGIRI',

    pickupDate:
      '',

    items:
      items,

    customerName:
      customerName,

    customerTel:
      customerTel,

    memo:
      memo

  };

  const result =
    await fetch(
      API_URL,
      {

        method:'POST',

        headers:{
          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify(
            orderData
          )

      }
    );

  const json =
    await result.json();

  if(json.success){

    alert(
      '注文ありがとうございました'
    );

    localStorage.removeItem(
      'cart'
    );

    location.href =
      'index.html';

  }else{

    alert(
      '注文送信エラー'
    );

  }

}