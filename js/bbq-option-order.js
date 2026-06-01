async function displayBbqOptionOrder(){

  const cart =
    JSON.parse(
      localStorage.getItem(
        'bbqOptionCart'
      )
    ) || [];

  const target =
    document.getElementById(
      'orderItems'
    );

  if(cart.length === 0){

    target.innerHTML = `

      <h2>

        商品がありません

      </h2>

    `;

    return;

  }

  let total = 0;

  target.innerHTML = '';

  cart.forEach(item => {

    const subtotal =
      item.price *
      item.qty;

    total += subtotal;

    target.innerHTML += `

      <div class="product-card">

        <div class="product-content">

          <h3>

            ${item.name}

          </h3>

          <p>

            数量：
            ${item.qty}

          </p>

          <div class="price">

            ¥${subtotal.toLocaleString()}

          </div>

        </div>

      </div>

    `;

  });

  target.innerHTML += `

    <h2>

      合計
      ¥${total.toLocaleString()}

    </h2>

  `;

}

async function sendBbqOptionOrder(){

  const cart =
    JSON.parse(
      localStorage.getItem(
        'bbqOptionCart'
      )
    ) || [];

  if(cart.length === 0){

    alert(
      '商品がありません'
    );

    return;

  }

  const bbqDate =
    document
      .getElementById(
        'bbqDate'
      )
      .value;

  const customerName =
    document
      .getElementById(
        'customerName'
      )
      .value
      .trim();

  const customerTel =
    document
      .getElementById(
        'customerTel'
      )
      .value
      .trim();

  const memo =
    document
      .getElementById(
        'memo'
      )
      .value;

  if(
    !bbqDate ||
    !customerName ||
    !customerTel
  ){

    alert(
      '必須項目を入力してください'
    );

    return;

  }

  const orderData = {

    orderType:
      'BBQ_OPTION',

    orderDate:
      bbqDate,

    items:
      cart,

    customerName:
      customerName,

    customerTel:
      customerTel,

    memo:
      memo

  };

  try{

    const response =
      await fetch(
        API_URL,
        {

          method:'POST',

          body:
            JSON.stringify(
              orderData
            )

        }
      );

    const result =
      await response.json();

    if(result.success){

      alert(
        '追加注文を受け付けました'
      );

      localStorage.removeItem(
        'bbqOptionCart'
      );

      location.href =
        'index.html';

    }else{

      alert(
        '送信エラー'
      );

    }

  }catch(error){

    console.error(
      error
    );

    alert(
      '通信エラー'
    );

  }

}

displayBbqOptionOrder();