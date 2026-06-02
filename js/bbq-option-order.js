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

    <a
      href="bbq-option.html"
      class="order-btn"
    >

      商品を選ぶ

    </a>

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

          <div class="qty-area">

  <button
    class="qty-btn"
    onclick="
      changeOrderQty(
        ${item.id},
        -1
      )
    "
  >
    －
  </button>

  <span
    class="qty-value"
  >
    ${item.qty}
  </span>

  <button
    class="qty-btn"
    onclick="
      changeOrderQty(
        ${item.id},
        1
      )
    "
  >
    ＋
  </button>

</div>

          <div class="price">

            ¥${subtotal.toLocaleString()}

          </div>

        </div>

      </div>

    `;

  });

target.innerHTML += `

  <div class="product-card">

    <div class="product-content">

      <h3>

        ${item.name}

      </h3>

      <div class="qty-area">

        <button
          class="qty-btn"
          onclick="
            changeOrderQty(
              ${item.id},
              -1
            )
          "
        >
          －
        </button>

        <span
          class="qty-value"
        >
          ${item.qty}
        </span>

        <button
          class="qty-btn"
          onclick="
            changeOrderQty(
              ${item.id},
              1
            )
          "
        >
          ＋
        </button>

      </div>

      <div class="price">

        ¥${subtotal.toLocaleString()}

      </div>

      <button

        class="clear-btn"

        onclick="
          removeOptionItem(
            ${item.id}
          )
        "

      >

        削除

      </button>

    </div>

  </div>

`;

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

function clearBbqOptionCart(){

  if(
    !confirm(
      '追加注文をすべて削除しますか？'
    )
  ){
    return;
  }

  localStorage.removeItem(
    'bbqOptionCart'
  );

  location.reload();

}

function removeOptionItem(
  id
){

  let cart =
    JSON.parse(
      localStorage.getItem(
        'bbqOptionCart'
      )
    ) || [];

  cart =
    cart.filter(
      item =>
        item.id !== id
    );

  localStorage.setItem(

    'bbqOptionCart',

    JSON.stringify(
      cart
    )

  );

  displayBbqOptionOrder();

}