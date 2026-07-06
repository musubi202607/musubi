// =========================
// グローバル変数
// =========================

// 現在受付中の予約
let currentReservation = null;

// =========================
// 現在受付中予約を保存
// =========================
function saveCurrentReservation(){

  if(!currentReservation){
    return;
  }

  localStorage.setItem(

    "currentReservation",

    JSON.stringify(currentReservation)

  );

}

// =========================
// 現在受付中予約を復元
// =========================
function restoreCurrentReservation(){

  const data = localStorage.getItem(

    "currentReservation"

  );

  if(!data){

    return false;

  }

  currentReservation = JSON.parse(data);

  return true;

}

// 本日の予約一覧キャッシュ
let reservationCache = [];

// LocalStorageキー
const STORAGE_KEYS = {

  CURRENT_RESERVATION: "bbqCurrentReservation",

  CART_PREFIX: "bbqOptionCart_"

};

// =========================
// 現在受付中予約 保存
// =========================
function saveCurrentReservation(reservation){

  currentReservation = reservation;

  localStorage.setItem(

    STORAGE_KEYS.CURRENT_RESERVATION,

    JSON.stringify(reservation)

  );

}

// =========================
// 現在受付中予約 読込
// =========================
function restoreCurrentReservation(){

  const json = localStorage.getItem(

    STORAGE_KEYS.CURRENT_RESERVATION

  );

  if(!json){

    currentReservation = null;

    return false;

  }

  try{

    currentReservation = JSON.parse(json);

    return true;

  }catch(e){

    console.error(e);

    currentReservation = null;

    return false;

  }

}

// =========================
// 現在受付中予約 削除
// =========================
function clearCurrentReservation(){

  currentReservation = null;

  localStorage.removeItem(

    STORAGE_KEYS.CURRENT_RESERVATION

  );

}

// =========================
// カートキー取得
// =========================
function getCartKey(){

  if(!currentReservation){

    return null;

  }

  return (

    STORAGE_KEYS.CART_PREFIX +

    currentReservation.reservationNo

  );

}

// =========================
// カート取得
// =========================
function getCart(){

  const cartKey = getCartKey();

  if(!cartKey){

    return [];

  }

  return JSON.parse(

    localStorage.getItem(cartKey)

  ) || [];

}

// =========================
// カート保存
// =========================
function saveCart(cart){

  const cartKey = getCartKey();

  if(!cartKey){

    return;

  }

  localStorage.setItem(

    cartKey,

    JSON.stringify(cart)

  );

}

// =========================
// 起動
// =========================
window.onload = async function(){

  const productArea =
    document.getElementById("productArea");

  if(productArea){

    productArea.style.display = "none";

  }

  // 商品一覧
  await loadBbqOptions();

  // 本日の予約
  await loadReservations();

  // 前回受付中の予約を復元
  if(restoreCurrentReservation()){

    await searchReservationByNo(

      currentReservation.reservationNo

    );

  }else{

    renderCart();

  }

};

// =========================
// 本日の予約取得
// =========================
async function loadReservations(){

  try{

    const response = await fetch(

      API_URL + "?mode=reservations"

    );

    const data = await response.json();

    reservationCache = data || [];

    renderReservationList(reservationCache);

  }catch(error){

    console.error(error);

    alert("予約一覧取得エラー");

  }

}

// =========================
// 本日の予約一覧表示
// =========================
function renderReservationList(data){

  const target =
    document.getElementById(
      "reservationList"
    );

  if(!target)return;

  target.innerHTML="";

  // 未会計だけ表示
  const list = data.filter(item=>{

    return item.paid !== "済";

  });

  if(list.length===0){

    target.innerHTML=`

      <div class="product-card">

        <div class="product-content">

          <h3>

            本日の未会計予約はありません

          </h3>

        </div>

      </div>

    `;

    return;

  }

  list.forEach(item=>{

    const selected =
      currentReservation &&
      currentReservation.reservationNo===item.reservationNo;

    const checked =
      item.status==="来店済";

    target.innerHTML +=`

<div class="reservation-card ${selected?"selected":""}">

<h3>

${item.customerName}

</h3>

<p>

${item.people}名

</p>

<p>

${item.plan}

</p>

<p>

${checked?"🟢受付中":"⚪受付前"}

</p>

<button

class="btn btn-order"

onclick="selectReservation('${item.reservationNo}')"

>

${selected?"選択中":"選択"}

</button>

${
checked

?

""

:

`

<button

class="btn btn-checkin"

onclick="checkInReservation('${item.reservationNo}')"

>

受付開始

</button>

`

}

</div>

`;

  });

}

// =========================
// 予約選択
// =========================
async function selectReservation(no){

  localStorage.setItem(

    "currentReservationNo",

    no

  );

  await searchReservationByNo(no);

}

// =========================
// 予約変更
// =========================
function changeReservation(){

  if(

    !confirm(

      "受付中の予約を変更しますか？"

    )

  ){

    return;

  }

  currentReservation=null;

  localStorage.removeItem(

    "currentReservationNo"

  );

  document.getElementById(

    "currentReservation"

  ).innerHTML=`

<div class="empty-state">

<h3>

予約を選択してください

</h3>

</div>

`;

  document.getElementById(

    "productArea"

  ).style.display="none";

  renderReservationList(

    reservationCache

  );

  renderCart();

}

// =========================
// 予約取得
// =========================
async function searchReservationByNo(no){

  try{

    const response = await fetch(

      API_URL +

      "?mode=reservation&no=" +

      encodeURIComponent(no)

    );

    const data = await response.json();

    if(!data){

      alert("予約が見つかりません");

      return;

    }

    saveCurrentReservation(data);

    await displayReservation(data);

  }catch(error){

    console.error(error);

    alert("予約取得エラー");

  }

}

// =========================
// 来店受付
// =========================
async function checkInReservation(no){

  if(!confirm("来店受付しますか？")){

    return;

  }

  try{

    const response = await fetch(

      API_URL +

      "?mode=checkin&no=" +

      encodeURIComponent(no)

    );

    const result = await response.json();

    if(!result.success){

      alert(result.message || "受付失敗");

      return;

    }

    await loadReservations();

    await searchReservationByNo(no);

    alert("受付完了しました。");

  }catch(error){

    console.error(error);

    alert("通信エラー");

  }

}

// =========================
// 選択中予約表示
// =========================
async function displayReservation(data){

  // 最新情報を保持
  saveCurrentReservation(data);

  // 注文履歴取得
  const history = await loadOrderHistory(
    data.reservationNo
  );

  const bbqPrice =
    Number(data.price || 0);

  const optionTotal =
    Number(history.total || 0);

  const grandTotal =
    bbqPrice + optionTotal;

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
            ¥${Number(item.amount)
              .toLocaleString()}
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

  const target =
    document.getElementById(
      "currentReservation"
    );

  if(!target){

    return;

  }

  const checkedIn =
    data.status === "来店済";

  target.innerHTML = `

<div class="current-header">

  <div>

    <div class="current-status">

      ${
        checkedIn
        ? "受付中"
        : "受付前"
      }

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

onclick="checkInReservation('${data.reservationNo}')"

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

<p>

BBQ予約

¥${bbqPrice.toLocaleString()}

</p>

<p>

追加注文

¥${optionTotal.toLocaleString()}

</p>

<h2>

合計

¥${grandTotal.toLocaleString()}

</h2>

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

    if(checkedIn){

      productArea.style.display =
        "block";

    }else{

      productArea.style.display =
        "none";

    }

  }

}

// =========================
// カート追加
// =========================
function addBbqOption(id,name,price){

  if(!currentReservation){

    alert("予約を選択してください");

    return;

  }

  if(currentReservation.status !== "来店済"){

    alert("来店受付後に追加注文できます");

    return;

  }

  const cart = getCart();

  const existing = cart.find(

    item => String(item.id) === String(id)

  );

  if(existing){

    existing.qty++;

  }else{

    cart.push({

      id:id,

      name:name,

      price:Number(price),

      qty:1

    });

  }

  saveCart(cart);

  renderCart();

}

// =========================
// 数量変更
// =========================
function changeCartQty(id,diff){

  let cart = getCart();

  const item = cart.find(

    p => String(p.id) === String(id)

  );

  if(!item){

    return;

  }

  item.qty += diff;

  if(item.qty <= 0){

    cart = cart.filter(

      p => String(p.id) !== String(id)

    );

  }

  saveCart(cart);

  renderCart();

}

// =========================
// カートクリア
// =========================
function clearCart(){

  if(!currentReservation){

    return;

  }

  if(!confirm("カートを空にしますか？")){

    return;

  }

  localStorage.removeItem(

    getCartKey()

  );

  renderCart();

}

// =========================
// カート表示
// =========================
function renderCart(){

  const target =
    document.getElementById("cartArea");

  if(!target){

    return;

  }

  if(!currentReservation){

    target.innerHTML = `

      <div class="product-card">

        <div class="product-content">

          <h3>予約を選択してください</h3>

        </div>

      </div>

    `;

    return;

  }

  const cart = getCart();

  target.innerHTML = "";

  if(cart.length === 0){

    target.innerHTML = `

      <div class="product-card">

        <div class="product-content">

          <h3>カートは空です</h3>

        </div>

      </div>

    `;

    return;

  }

  let total = 0;

  cart.forEach(item=>{

    const subtotal =
      Number(item.price) *
      Number(item.qty);

    total += subtotal;

    target.innerHTML += `

      <div class="product-card">

        <div class="product-content">

          <h3>${item.name}</h3>

          <div>

            <button
              onclick="changeCartQty('${item.id}',-1)"
            >

              −

            </button>

            <strong>

              ${item.qty}

            </strong>

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

    <div class="cart-summary">

      合計　

      ¥${total.toLocaleString()}

    </div>

  `;

}

// =========================
// 追加注文送信
// =========================
async function sendTabletOrder(){

  if(!currentReservation){

    alert("予約を選択してください");

    return;

  }

  if(currentReservation.status !== "来店済"){

    alert("来店受付後に注文できます");

    return;

  }

  const cart = getCart();

  if(cart.length === 0){

    alert("商品がありません");

    return;

  }

  try{

    const params = new URLSearchParams({

      mode : "saveBbqOption",

      reservationNo :
        currentReservation.reservationNo,

      orderDate :
        currentReservation.useDate,

      customerName :
        currentReservation.customerName,

      memo : "",

      items :
        JSON.stringify(cart)

    });

    const response = await fetch(

      API_URL +
      "?" +
      params.toString()

    );

    const result =
      await response.json();

    if(!result.success){

      alert(

        result.message ||

        "送信失敗"

      );

      return;

    }

    alert("追加注文を登録しました。");

    // カートクリア
    clearCart();

    // 最新予約情報取得
    await searchReservationByNo(

      currentReservation.reservationNo

    );

  }catch(error){

    console.error(error);

    alert("通信エラー");

  }

}

// =========================
// 注文履歴取得
// =========================
async function loadOrderHistory(

  reservationNo

){

  try{

    const response =
      await fetch(

        API_URL +

        "?mode=orderhistory&no=" +

        encodeURIComponent(

          reservationNo

        )

      );

    return await response.json();

  }catch(error){

    console.error(error);

    return {

      total:0,

      items:[]

    };

  }

}

