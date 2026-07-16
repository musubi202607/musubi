let currentReservation = null;

let reservationCache = [];

let bbqCart = [];

const RESERVATION_KEY =
  "bbqCurrentReservation";


// =========================
// 起動
// =========================
window.addEventListener(
  "DOMContentLoaded",
  async () => {

    const productArea =
      document.getElementById(
        "productArea"
      );

    if(productArea){

      productArea.style.display =
        "none";

    }

    // 商品一覧
    await loadBbqOptions();

    // 本日の予約
    await loadReservations();

    // 前回選択中の予約を復元
    const savedNo =
      localStorage.getItem(
        RESERVATION_KEY
      );

    if(savedNo){

      await searchReservation(savedNo);

    }else{

      renderCart();

    }

  }
);


// =========================
// 選択中予約保存
// =========================
function saveReservation(reservation){

  currentReservation =
    reservation;

  localStorage.setItem(

    RESERVATION_KEY,

    reservation.reservationNo

  );

}


// =========================
// 選択解除
// =========================
function clearReservation(){

  currentReservation = null;

  bbqCart = [];

  localStorage.removeItem(
    RESERVATION_KEY
  );

  const current =
    document.getElementById(
      "currentReservation"
    );

  if(current){

    current.innerHTML = `

      <div class="empty-state">

        <h2>

          予約を選択してください

        </h2>

        <p>

          左の一覧から予約を選択します。

        </p>

      </div>

    `;

  }

  const productArea =
    document.getElementById(
      "productArea"
    );

  if(productArea){

    productArea.style.display =
      "none";

  }

  renderReservationList(
    reservationCache
  );

  renderCart();

}


// =========================
// カートキー
// =========================
function getCartKey(){

  if(!currentReservation){

    return null;

  }

  return (

    "bbqOptionCart_" +

    currentReservation.reservationNo

  );

}


// =========================
// カート読込
// =========================
function loadCart(){

  const key =
    getCartKey();

  if(!key){

    bbqCart = [];

    return;

  }

  bbqCart = JSON.parse(

    localStorage.getItem(key)

  ) || [];

}


// =========================
// カート保存
// =========================
function saveCart(){

  const key =
    getCartKey();

  if(!key){

    return;

  }

  localStorage.setItem(

    key,

    JSON.stringify(bbqCart)

  );

}

// =========================
// 本日の予約取得
// =========================
async function loadReservations(){

  try{

    const res =
      await fetch(
        API_URL +
        "/api/reservations/today"
      );

    const data =
      await res.json();

    reservationCache =

      Array.isArray(data)
      ? data
      : [];

    renderReservationList(
      reservationCache
    );

  }catch(error){

    console.error(error);

    alert("予約取得エラー");

  }

}


// =========================
// 予約一覧表示
// =========================
function renderReservationList(list){

  const target =
    document.getElementById(
      "reservationList"
    );

  if(!target){

    return;

  }

  target.innerHTML = "";

  if(!list.length){

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

  list.forEach(item=>{

    // 会計済は一覧に出さない
    if(item.paid === "済"){

      return;

    }

    const selected =

      currentReservation &&

      currentReservation.reservationNo ===
      item.reservationNo;

    const checkedIn =

      item.status === "来店済";

    target.innerHTML += `

<div class="product-card ${selected ? "selected" : ""}">

<div class="product-content">

<h3>

${item.customerName}

</h3>

<p>

${item.useDate}

</p>

<p>

${item.people}名

</p>

<p>

${item.plan}

</p>

<p>

状態：
${item.status || "未"}

</p>

<p>

会計：
${item.paid || "未"}

</p>

<button

class="btn btn-order"

onclick="searchReservation(

'${item.reservationNo}'

)"

>

${selected ? "選択中" : "この予約を選択"}

</button>

</div>

</div>

`;

  });

}


// =========================
// 予約検索
// =========================
async function searchReservation(

  reservationNo

){

  try{

    const res =
      await fetch(

        API_URL +

        "/api/bbq/detail?reservationNo=" +

        encodeURIComponent(
          reservationNo
        )

      );

    const data =
      await res.json();

    if(!data){

      alert("予約が見つかりません");

      return;

    }

    displayReservation(data);

  }catch(error){

    console.error(error);

    alert("予約取得エラー");

  }

}

// =========================
// 選択中予約表示
// =========================
async function displayReservation(data){

  saveReservation(data);

  loadCart();

  const history =
    await loadOrderHistory(
      data.reservationNo
    );

const bbqTotal =
  Number(data.total || 0);

const optionTotal =
  Number(history.total || 0);

const grandTotal =
  bbqTotal + optionTotal;
  
  let historyHtml = "";

  if(
    history.items &&
    history.items.length
  ){

    history.items.forEach(item=>{

      historyHtml += `

<tr>

<td>${item.itemName}</td>

<td>${item.qty}</td>

<td>

¥${Number(item.amount).toLocaleString()}

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

  const checkedIn =

    data.status === "来店済";

  const target =
    document.getElementById(
      "currentReservation"
    );

  target.innerHTML = `

<div class="current-header">

<div>

<div class="current-status">

${checkedIn ? "受付中" : "受付前"}

</div>

</div>

<button

class="btn btn-clear"

onclick="changeReservation()"

>

予約変更

</button>

</div>

<div class="current-name">

${data.customerName} 様

</div>

<div class="current-info">

予約番号：
${data.reservationNo}

</div>

<div class="current-info">

利用日：
${data.useDate}

</div>

<div class="current-info">

人数：
${data.people}名

</div>

<div class="current-info">

プラン：
${data.plan}

</div>

<div class="current-info">

状態：
${data.status}

</div>

${
checkedIn

?

""

:

`

<button

class="btn btn-checkin"

onclick="checkInReservation(

'${data.reservationNo}'

)"

>

受付開始

</button>

`

}

<hr style="margin:20px 0;">

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

<th>商品</th>

<th>数量</th>

<th>金額</th>

</tr>

${historyHtml}

</table>

<div class="current-total">

<h3>

ご利用料金

</h3>

<div class="total-row">

<span>

BBQ予約

（${data.people}名 × ¥${bbqTotal.toLocaleString()}）

</span>

<span>

¥${Number(data.total).toLocaleString()}

</span>

</div>

<div class="total-row">

<span>

追加注文

</span>

<span>

¥${optionTotal.toLocaleString()}

</span>

</div>

<hr>

<div class="total-grand">

<span>

合計

</span>

<span>

¥${grandTotal.toLocaleString()}

</span>

</div>

</div>

`;

  renderReservationList(
    reservationCache
  );

  renderCart();

  const productArea =
    document.getElementById(
      "productArea"
    );

  if(productArea){

    productArea.style.display =

      checkedIn

      ? "block"

      : "none";

  }

}


// =========================
// 予約変更
// =========================
function changeReservation(){

  if(

    !confirm(

      "現在の予約選択を解除しますか？"

    )

  ){

    return;

  }

  clearReservation();

}


// =========================
// 来店受付
// =========================
async function checkInReservation(

  reservationNo

){

  if(

    !confirm(

      "来店受付を開始しますか？"

    )

  ){

    return;

  }

  try{

    const res =
      await fetch(

        API_URL +

        "/api/bbq/checkin",

        {

          method:"POST",

          headers:{

            "Content-Type":

            "application/json"

          },

          body:JSON.stringify({

            reservationNo

          })

        }

      );

    const result =
      await res.json();

    if(result.success){

      await loadReservations();

      await searchReservation(
        reservationNo
      );

      alert("受付開始しました");

    }else{

      alert(

        result.message ||

        "受付エラー"

      );

    }

  }catch(error){

    console.error(error);

    alert("通信エラー");

  }

}

// =========================
// BBQ商品取得
// =========================
async function loadBbqOptions(){

  try{

    const res =
      await fetch(
        API_URL +
        "/api/products"
      );

    const products =
      await res.json();

    const optionGrid =
      document.getElementById(
        "optionGrid"
      );

    const drinkGrid =
      document.getElementById(
        "drinkGrid"
      );

    if(
      !optionGrid ||
      !drinkGrid
    ){
      return;
    }

    optionGrid.innerHTML = "";
    drinkGrid.innerHTML = "";

    products

      .sort(
        (a,b)=>
          Number(a.sort || 9999) -
          Number(b.sort || 9999)
      )

      .forEach(product=>{

        if(

          product.type !== "bbq-option"

          &&

          product.type !== "drink"

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

${product.description || ""}

</p>

<div class="price">

¥${Number(product.price).toLocaleString()}

</div>

<div class="qty-area">

<button

class="qty-btn"

onclick="changeQty(${product.id},-1)"

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

onclick="changeQty(${product.id},1)"

>

＋

</button>

</div>

<button

class="btn btn-order"

onclick="addToCart(

${product.id},

'${product.name}',

${product.price}

)"

>

カートへ追加

</button>

</div>

</div>

`;

        if(
          product.type ===
          "bbq-option"
        ){

          optionGrid.innerHTML +=
            card;

        }

        if(
          product.type ===
          "drink"
        ){

          drinkGrid.innerHTML +=
            card;

        }

      });

  }catch(error){

    console.error(error);

    alert("商品取得エラー");

  }

}


// =========================
// 商品数量変更
// =========================
function changeQty(

  id,
  diff

){

  const target =
    document.getElementById(
      "qty-" + id
    );

  if(!target){

    return;

  }

  let qty =
    Number(target.innerText);

  qty += diff;

  if(qty < 1){

    qty = 1;

  }

  target.innerText = qty;

}

// =========================
// カート追加
// =========================
function addToCart(

  id,
  name,
  price

){

  if(!currentReservation){

    alert("予約を選択してください");

    return;

  }

  if(

    currentReservation.status !==
    "来店済"

  ){

    alert("受付開始後に追加注文できます");

    return;

  }

  const qty =
    Number(

      document.getElementById(
        "qty-" + id
      ).innerText

    );

  const existing =
    bbqCart.find(

      item=>

      String(item.id) ===
      String(id)

    );

  if(existing){

    existing.qty += qty;

  }else{

    bbqCart.push({

      id,
      name,
      price:Number(price),
      qty

    });

  }

  saveCart();

  renderCart();

}


// =========================
// カート内数量変更
// =========================
function changeOrderQty(

  id,
  diff

){

  const item =
    bbqCart.find(

      p=>

      String(p.id) ===
      String(id)

    );

  if(!item){

    return;

  }

  item.qty += diff;

  if(item.qty <= 0){

    bbqCart =
      bbqCart.filter(

        p=>

        String(p.id) !==
        String(id)

      );

  }

  saveCart();

  renderCart();

}


// =========================
// カート表示
// =========================
function renderCart(){

  const target =
    document.getElementById(
      "cartArea"
    );

  if(!target){

    return;

  }

  target.innerHTML = "";

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

    updateCartSummary();

    return;

  }

  let total = 0;

  if(bbqCart.length === 0){

    target.innerHTML = `

<div class="product-card">

<div class="product-content">

<h3>

商品がありません

</h3>

</div>

</div>

`;

    updateCartSummary();

    return;

  }

  bbqCart.forEach(item=>{

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

<div class="qty-area">

<button

class="qty-btn"

onclick="changeOrderQty(

'${item.id}',

-1

)"

>

－

</button>

<span class="qty-value">

${item.qty}

</span>

<button

class="qty-btn"

onclick="changeOrderQty(

'${item.id}',

1

)"

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

<h2 style="margin-top:20px;">

合計

¥${total.toLocaleString()}

</h2>

`;

  updateCartSummary();

}


// =========================
// カートサマリー
// =========================
function updateCartSummary(){

  const target =
    document.getElementById(
      "cartSummary"
    );

  if(!target){

    return;

  }

  let qty = 0;

  let total = 0;

  bbqCart.forEach(item=>{

    qty +=
      Number(item.qty);

    total +=

      Number(item.qty) *

      Number(item.price);

  });

  target.innerHTML = `

カート

${qty}点

／

¥${total.toLocaleString()}

`;

}


// =========================
// カートクリア
// =========================
function clearCart(){

  if(!currentReservation){

    return;

  }

  if(

    !confirm(

      "カートを空にしますか？"

    )

  ){

    return;

  }

  bbqCart = [];

  saveCart();

  renderCart();

}

// =========================
// 追加注文送信
// =========================
async function sendBbqOptionOrder(){

  if(!currentReservation){

    alert("予約を選択してください");

    return;

  }

  if(

    currentReservation.status !==
    "来店済"

  ){

    alert("受付開始後に追加注文できます");

    return;

  }

  if(bbqCart.length === 0){

    alert("商品を追加してください");

    return;

  }

  try{

    const res =
      await fetch(

        API_URL +
        "/api/bbq/addOrder",

        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({

            reservationNo:
              currentReservation.reservationNo,

            useDate:
              currentReservation.useDate,

            customerName:
              currentReservation.customerName,

            customerTel:
              currentReservation.customerTel,

            memo:"",

            items:bbqCart

          })

        }

      );

    const result =
      await res.json();

    if(result.success){

      alert("追加注文を受け付けました");

      // カート削除
      bbqCart = [];

      saveCart();

      renderCart();

      // 最新情報取得
      await searchReservation(

        currentReservation.reservationNo

      );

    }else{

      alert(

        result.message ||

        "送信エラー"

      );

    }

  }catch(error){

    console.error(error);

    alert("通信エラー");

  }

}


// =========================
// 追加注文履歴取得
// =========================
async function loadOrderHistory(

  reservationNo

){

  try{

    const res =
      await fetch(

        API_URL +

        "/api/bbq/history?reservationNo=" +

        encodeURIComponent(

          reservationNo

        )

      );

    return await res.json();

  }catch(error){

    console.error(error);

    return{

      items:[],

      total:0

    };

  }

}