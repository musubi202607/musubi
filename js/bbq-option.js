let currentReservation = null;
let bbqCart = [];

// =========================
// 初期化
// =========================
window.addEventListener("DOMContentLoaded", async () => {

  document.getElementById("productArea").style.display = "none";

  await loadReservations();
  await loadBbqOptions();
  renderCart();

});

// =========================
// 本日の予約一覧取得
// =========================
async function loadReservations() {

  try {

    const res =
      await fetch(API_URL + "/api/reservations/today");

//console.log("status", res.status);

    const data =
      await res.json();
      
//console.log("Array?", Array.isArray(data));
//console.log("Length=", data.length);
//console.log(JSON.stringify(data));
//console.log(data);

    const target =
      document.getElementById("reservationList");

    target.innerHTML = "";

    if (!data.length) {

      target.innerHTML =
        "<p>本日の予約はありません</p>";

      return;

    }

    data.forEach(r => {

//console.log("予約", r);

      target.innerHTML += `

      <div class="product-card">

        <div class="product-content">

          <h3>${r.customerName}</h3>

          <p>${r.useDate}</p>

          <p>${r.plan}</p>

          <button
            onclick="selectReservation(
              '${r.reservationNo}',
              '${r.customerName}',
              '${r.useDate}'
            )"
          >
            この予約を選択
          </button>

        </div>

      </div>

      `;

    });

  } catch (e) {

    console.error(e);

    alert("予約取得エラー");

  }

}

// =========================
// 予約選択
// =========================
function selectReservation(

  reservationNo,
  customerName,
  useDate

){

  currentReservation = {

    reservationNo,
    customerName,
    useDate

  };

  document.getElementById(
    "currentReservation"
  ).innerHTML = `

  <div class="product-card">

    <div class="product-content">

      <h2>

        選択中予約

      </h2>

      <p>

        予約番号：
        ${reservationNo}

      </p>

      <p>

        氏名：
        ${customerName}

      </p>

      <p>

        利用日：
        ${useDate}

      </p>

    </div>

  </div>

  `;

  document.getElementById(
    "productArea"
  ).style.display = "block";

}

// =========================
// BBQ商品取得
// =========================
async function loadBbqOptions(){

  try{

    const response =
      await fetch(
        API_URL + "/api/products"
      );

    const products =
      await response.json();

    const optionGrid =
      document.getElementById(
        "optionGrid"
      );

    const drinkGrid =
      document.getElementById(
        "drinkGrid"
      );

    optionGrid.innerHTML = "";
    drinkGrid.innerHTML = "";

    products
      .sort(
        (a,b)=>
          Number(a.sort)-Number(b.sort)
      )
      .forEach(product=>{

        if(
          product.type !== "bbq-option" &&
          product.type !== "drink"
        ){
          return;
        }

        const card = `

<div class="product-card">

<img
src="${product.image}"
>

<div class="product-content">

<h3>

${product.name}

</h3>

<p>

${product.description}

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

        if(product.type==="bbq-option"){

          optionGrid.innerHTML += card;

        }

        if(product.type==="drink"){

          drinkGrid.innerHTML += card;

        }

      });

  }catch(e){

    console.error(e);

    alert("商品取得エラー");

  }

}

// =========================
// 数量変更
// =========================
function changeQty(id, diff){

  const target =
    document.getElementById(
      "qty-" + id
    );

  if(!target) return;

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

  const qty =
    Number(
      document.getElementById(
        "qty-" + id
      ).innerText
    );

  const existing =
    bbqCart.find(
      p=>String(p.id)===String(id)
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

  target.innerHTML = "";

  let total = 0;

  if(bbqCart.length===0){

    target.innerHTML =
      "<p>商品がありません</p>";

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

<p>

数量：
${item.qty}

</p>

<div class="price">

¥${subtotal.toLocaleString()}

</div>

<div style="margin-top:10px;">

<button

onclick="changeOrderQty(

'${item.id}',

-1

)"

>

－

</button>

<button

onclick="changeOrderQty(

'${item.id}',

1

)"

>

＋

</button>

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
// カート内数量変更
// =========================
function changeOrderQty(

  id,
  diff

){

  const item =
    bbqCart.find(
      p=>String(p.id)===String(id)
    );

  if(!item) return;

  item.qty += diff;

  if(item.qty<=0){

    bbqCart =
      bbqCart.filter(
        p=>String(p.id)!==String(id)
      );

  }

  renderCart();

}

// =========================
// カートサマリー
// =========================
function updateCartSummary(){

  let qty = 0;
  let total = 0;

  bbqCart.forEach(item=>{

    qty += Number(item.qty);

    total +=
      Number(item.qty) *
      Number(item.price);

  });

  const target =
    document.getElementById(
      "cartSummary"
    );

  if(!target) return;

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

  bbqCart = [];

  renderCart();

}

// =========================
// 注文送信
// =========================
async function sendBbqOptionOrder(){

  if(!currentReservation){

    alert("予約を選択してください");

    return;

  }

  if(bbqCart.length===0){

    alert("商品を追加してください");

    return;

  }

  try{
    
    console.log("① fetch開始");
    
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
    
    console.log("② fetch終了", res.status);
    
    const text = await res.text();

    console.log(text);

    return;


//const result = await res.json();
    
//テスト用
//console.log("status =", res.status);
//console.log("result =", result);
    
    if(result.success){

      alert("追加注文を受け付けました");

      bbqCart = [];

      renderCart();

    }else{

      alert(
        result.message ||
        "送信エラー"
      );

    }

  }catch(e){

    console.error("通信エラー", e);

    alert(e.message);

  }

}

// =========================
// 初期表示
// =========================
window.addEventListener(

  "DOMContentLoaded",

  ()=>{

    loadReservations();

    loadBbqOptions();

    renderCart();

  }

);