let currentReservation = null;
let reservationCache = [];

// =========================
// 起動
// =========================
window.onload = function(){

  const productArea =
    document.getElementById(
      'productArea'
    );

  if(productArea){

    productArea.style.display =
      'none';

  }

  loadReservations();

  loadBbqOptions();

  renderCart();

};

// =========================
// 本日の予約一覧
// =========================
async function loadReservations(){

  try{

    const response =
      await fetch(
        API_URL +
        '?mode=reservations'
      );

    const data =
      await response.json();

    reservationCache = data;

    renderReservationList(data);

  }catch(error){

    console.error(error);

    alert(
      '予約一覧取得エラー'
    );

  }

}

// =========================
// 予約一覧表示
// =========================
function renderReservationList(data){

  const target =
    document.getElementById(
      'reservationList'
    );

  if(!target){
    return;
  }

  target.innerHTML = '';

  if(!data || data.length === 0){

    target.innerHTML = `

      <div class="product-card">

        <div class="product-content">

          <h3>
            本日の予約はありません
          </h3>

        </div>

      </div>

    `;

    return;

  }

  data.slice(0,2).forEach(item => {

    const isSelected =

      currentReservation &&

      currentReservation.reservationNo ===
      item.reservationNo;

    const isCheckedIn =

      item.status ===
      '来店済';

    target.innerHTML += `

      <div class="product-card">

        <div class="product-content">

          <h3>
            ${item.customerName}
          </h3>

          <p>
            予約番号：
            ${item.reservationNo}
          </p>

          <p>
            ${item.people}名
          </p>

          <p>
            ${item.plan}
          </p>

          <p>
            状態：
            ${item.status || '未'}
          </p>

          <p>
            会計：
            ${item.paid || '未'}
          </p>

          <button
            class="btn btn-order"
            onclick="selectReservation('${item.reservationNo}')"
          >

            選択

          </button>

          <button
            class="btn btn-checkin"
            onclick="checkInReservation('${item.reservationNo}')"
            ${isCheckedIn ? 'disabled' : ''}
          >

            受付

          </button>

        </div>

      </div>

    `;

  });

}

// =========================
// 予約選択
// =========================
async function selectReservation(no){

  await searchReservationByNo(no);

}

// =========================
// 来店受付
// =========================
async function checkInReservation(no){

  if(
    !confirm(
      '来店受付しますか？'
    )
  ){
    return;
  }

  try{

    const response =
      await fetch(

        API_URL +
        '?mode=checkin&no=' +
        encodeURIComponent(no)

      );

    const result =
      await response.json();

    if(result.success){

      alert(
        '受付完了'
      );

      await loadReservations();

      if(
        currentReservation &&
        currentReservation.reservationNo === no
      ){

        await searchReservationByNo(no);

      }

    }else{

      alert(
        result.message ||
        '受付エラー'
      );

    }

  }catch(error){

    console.error(error);

    alert(
      '通信エラー'
    );

  }

}

// =========================
// 予約取得
// =========================
async function searchReservationByNo(no){

  try{

    const response =
      await fetch(

        API_URL +
        '?mode=reservation&no=' +
        encodeURIComponent(no)

      );

    const data =
      await response.json();

    if(!data){

      alert(
        '予約が見つかりません'
      );

      return;

    }

    displayReservation(data);

  }catch(error){

    console.error(error);

    alert(
      '検索エラー'
    );

  }

}

// =========================
// 予約表示
// =========================
async function displayReservation(data){

  currentReservation = data;

  const history =
    await loadOrderHistory(
      data.reservationNo
    );

  let historyHtml = '';

  if(
    history.items &&
    history.items.length > 0
  ){

    history.items.forEach(item => {

      historyHtml += `

        <tr>

          <td>
            ${item.itemName}
          </td>

          <td>
            ${item.qty}
          </td>

          <td>
            ¥${Number(
              item.amount
            ).toLocaleString()}
          </td>

        </tr>

      `;

    });

  }else{

    historyHtml = `

      <tr>

        <td colspan="3">

          追加注文なし

        </td>

      </tr>

    `;

  }

  const bbqPrice =
    Number(data.price || 0);

  const optionTotal =
    Number(history.total || 0);

  const grandTotal =
    bbqPrice + optionTotal;

  const current =
    document.getElementById(
      'currentReservation'
    );

  if(current){

    current.innerHTML = `

      <div class="reservation-card">

        <h2>
          ${data.customerName}
        </h2>

        <p>
          予約番号：
          ${data.reservationNo}
        </p>

        <p>
          人数：
          ${data.people}名
        </p>

        <p>
          プラン：
          ${data.plan}
        </p>

        <p>
          状態：
          ${data.status}
        </p>

        <hr>

        <h3>
          BBQ予約
        </h3>

        <p>

          ¥${bbqPrice.toLocaleString()}

        </p>

        <h3>
          追加注文履歴
        </h3>

        <table
          style="
            width:100%;
            border-collapse:collapse;
          "
        >

          <tr>

            <th>
              商品
            </th>

            <th>
              数量
            </th>

            <th>
              金額
            </th>

          </tr>

          ${historyHtml}

        </table>

        <hr>

        <p>

          追加合計：
          ¥${optionTotal.toLocaleString()}

        </p>

        <h2>

          総合計：
          ¥${grandTotal.toLocaleString()}

        </h2>

      </div>

    `;

  }

  renderReservationList(
  reservationCache
);

renderCart();

const productArea =
  document.getElementById(
    'productArea'
  );

if(productArea){

  productArea.style.display =
    'block';

 }
}

// =========================
// BBQ商品読込
// =========================
async function loadBbqOptions(){

try{

const response =
  await fetch(
    API_URL +
    '?mode=products'
  );

const products =
  await response.json();

const optionGrid =
  document.getElementById(
    'optionGrid'
  );

const drinkGrid =
  document.getElementById(
    'drinkGrid'
  );

if(
  !optionGrid ||
  !drinkGrid
){
  return;
}

optionGrid.innerHTML = '';

drinkGrid.innerHTML = '';

products
  .sort(
    (a,b)=>
      Number(a.sort || 9999) -
      Number(b.sort || 9999)
  )
  .forEach(product=>{

    if(
      product.type !== 'bbq-option'
      &&
      product.type !== 'drink'
    ){
      return;
    }

    const card = `

<div class="product-card">

  <img
    src="${product.image}"
    alt="${product.name}"
  >

  <div class="product-content">

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

    <button
      onclick="
        addBbqOption(
          ${product.id},
          '${product.name}',
          ${product.price}
        )
      "
    >
      追加
    </button>

  </div>

</div>

`;

    if(
      product.type ===
      'bbq-option'
    ){

      optionGrid.innerHTML +=
        card;

    }

    if(
      product.type ===
      'drink'
    ){

      drinkGrid.innerHTML +=
        card;

    }

  });

}catch(error){

console.error(error);

alert(
  '商品取得エラー'
);

}

}// =========================
// カート追加
// =========================
function addBbqOption(
  id,
  name,
  price
){

  if(!currentReservation){

    alert(
      '予約を選択してください'
    );

    return;

  }

  if(
    currentReservation.status !==
    '来店済'
  ){

    alert(
      '来店受付後に追加注文できます'
    );

    return;

  }

  const cartKey =
    'bbqOptionCart_' +
    currentReservation.reservationNo;

  let cart =
    JSON.parse(
      localStorage.getItem(
        cartKey
      )
    ) || [];

  const existing =
    cart.find(
      item =>
        item.id == id
    );

  if(existing){

    existing.qty++;

  }else{

    cart.push({

      id:id,
      name:name,
      price:price,
      qty:1

    });

  }

  localStorage.setItem(
    cartKey,
    JSON.stringify(cart)
  );

  renderCart();

}

// =========================
// 数量変更
// =========================
function changeCartQty(
  id,
  diff
){

  if(!currentReservation){
    return;
  }

  const cartKey =
    'bbqOptionCart_' +
    currentReservation.reservationNo;

  let cart =
    JSON.parse(
      localStorage.getItem(
        cartKey
      )
    ) || [];

  const item =
    cart.find(
      p =>
        String(p.id) ===
        String(id)
    );

  if(!item){
    return;
  }

  item.qty += diff;

  if(item.qty <= 0){

    cart =
      cart.filter(
        p =>
          String(p.id) !==
          String(id)
      );

  }

  localStorage.setItem(
    cartKey,
    JSON.stringify(cart)
  );

  renderCart();

}

// =========================
// カート表示
// =========================
function renderCart(){

  const target =
    document.getElementById(
      'cartArea'
    );

  if(!target){
    return;
  }

  if(!currentReservation){

    target.innerHTML = `

      <div class="product-card">

        <div class="product-content">

          <h3>
            予約を選択してください
          </h3>

        </div>

      </div>

    `;

    return;

  }

  const cartKey =
    'bbqOptionCart_' +
    currentReservation.reservationNo;

  const cart =
    JSON.parse(
      localStorage.getItem(
        cartKey
      )
    ) || [];

  let total = 0;

  target.innerHTML = '';

  if(cart.length === 0){

    target.innerHTML = `

      <div class="product-card">

        <div class="product-content">

          <h3>
            カートは空です
          </h3>

        </div>

      </div>

    `;

    return;

  }

  cart.forEach(item => {

    const subtotal =
      Number(item.price) *
      Number(item.qty);

    total += subtotal;

    target.innerHTML += `

      <div class="product-card">

        <div class="product-content">

          <h3>
            ${item.name}
          </h3>

          <div>

            <button
              onclick="changeCartQty('${item.id}',-1)"
            >
              －
            </button>

            ${item.qty}

            <button
              onclick="changeCartQty('${item.id}',1)"
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

    <h2>

      合計
      ¥${total.toLocaleString()}

    </h2>

  `;

}

// =========================
// カートクリア
// =========================
function clearCart(){

  if(!currentReservation){
    return;
  }

  localStorage.removeItem(

    'bbqOptionCart_' +
    currentReservation.reservationNo

  );

  renderCart();

}

// =========================
// 店舗追加注文送信
// =========================
async function sendTabletOrder(){

if(!currentReservation){

alert(
  '予約を選択してください'
);

return;

}

if(
currentReservation.status !==
'来店済'
){

alert(
  '来店受付後に注文できます'
);

return;

}

const cartKey =
'bbqOptionCart_' +
currentReservation.reservationNo;

const cart =
JSON.parse(
localStorage.getItem(
cartKey
)
) || [];

if(cart.length === 0){

alert(
  '商品がありません'
);

return;

}

try{

const params =
  new URLSearchParams({

    mode:
      'saveBbqOption',

    reservationNo:
      currentReservation.reservationNo,

    orderDate:
      currentReservation.useDate,

    customerName:
      currentReservation.customerName,

    customerTel:
      currentReservation.customerTel,

    items:
      JSON.stringify(cart),

    memo:''

  });

const response =
  await fetch(

    API_URL +
    '?' +
    params.toString()

  );

const result =
  await response.json();

if(result.success){

  alert(
    '追加注文完了'
  );

  clearCart();

  await searchReservationByNo(
    currentReservation.reservationNo
  );

}else{

  alert(
    result.message ||
    '送信エラー'
  );

}

}catch(error){

console.error(error);

alert(
  '通信エラー'
);

}

}

async function loadOrderHistory(
  reservationNo
) {

  const response =
    await fetch(

      API_URL +
      '?mode=orderhistory&no=' +
      encodeURIComponent(
        reservationNo
      )

    );

  return await response.json();

}