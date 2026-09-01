async function loadOrderItems(){

  const sessionId =
    localStorage.getItem("sessionId");

  const cartRes =
    await fetch(
      API_URL +
      "/api/cart/get?sessionId=" +
      sessionId
    );

  const cart =
    await cartRes.json();

  if(!cart.length){

    document.getElementById(
      "orderItems"
    ).innerHTML =
      "<h2>商品がありません</h2>";

    return;

  }

  const productsRes =
    await fetch(
      API_URL +
      "/api/products"
    );

  const products =
    await productsRes.json();

  let html = `
    <table class="order-table">

      <tr>

        <th>商品名</th>
        <th>数量</th>
        <th>金額</th>

      </tr>
  `;

  let total = 0;

  cart.forEach(item => {

    const product =
      products.find(
        p =>
          Number(p.id) ===
          Number(item.id)
      );

    if(!product) return;

    const amount =
      Number(product.price) *
      Number(item.qty);

    total += amount;

    html += `
      <tr>

        <td>
          ${product.name}
        </td>

        <td>
          ${item.qty}
        </td>

        <td>
          ¥${amount.toLocaleString()}
        </td>

      </tr>
    `;

  });

  html += `
    </table>

    <div class="total-area">

      合計：
      ¥${total.toLocaleString()}

    </div>
  `;

  document.getElementById(
    "orderItems"
  ).innerHTML = html;

}

// =========================
// 注文送信
// 商品ID対応版
// =========================
async function sendOrder(){

  const sessionId =
    localStorage.getItem("sessionId");


  console.log(
    "sessionId=",
    sessionId
  );



  const customerName =
    document.getElementById(
      "customerName"
    ).value;


  const customerTel =
    document.getElementById(
      "customerTel"
    ).value;



  const pickupTime =
    document.getElementById(
      "pickupTime"
    ).value;



  if(!pickupTime){

    alert(
      "受取時間を選択してください"
    );

    return;

  }



  const memo =
    document.getElementById(
      "memo"
    ).value;




  // =========================
  // カート取得
  // =========================

  const cartRes =
    await fetch(
      API_URL +
      "/api/cart?sessionId=" +
      sessionId
    );


  const cart =
    await cartRes.json();



  if(
    !cart.length
  ){

    alert(
      "カートが空です"
    );

    return;

  }




  // =========================
  // 商品マスタ取得
  // =========================

  const productsRes =
    await fetch(
      API_URL +
      "/api/products"
    );


  const products =
    await productsRes.json();




  // =========================
  // 注文商品作成
  // 商品ID保持
  // =========================

  const items =

    cart.map(item=>{


      const product =

        products.find(

          p =>

          String(p.id) ===
          String(item.id)

        );



      if(!product){

        return null;

      }



      return {


        // 商品ID
        id:
          item.id,


        // 商品名
        name:
          product.name,


        // 数量
        qty:
          Number(item.qty),


        // 単価
        price:
          Number(product.price)


      };


    })
    .filter(Boolean);




  if(
    !items.length
  ){

    alert(
      "商品情報取得エラー"
    );

    return;

  }




  // =========================
  // 送信データ
  // =========================

  const payload = {


    sessionId,


    customerName,


    customerTel,


    pickupTime,


    memo,


    items


  };



  console.log(
    "ORDER PAYLOAD",
    payload
  );





  // =========================
  // 注文送信
  // =========================

  const res =

    await fetch(

      API_URL +
      "/api/order",

      {

        method:
          "POST",


        headers:{

          "Content-Type":
            "application/json"

        },


        body:
          JSON.stringify(
            payload
          )

      }

    );




  const json =

    await res.json();




  console.log(
    json
  );




  if(
    json.success
  ){


    sessionStorage.setItem(

      "orderNo",

      json.orderNo

    );



    sessionStorage.setItem(

      "pickupTime",

      pickupTime

    );



    alert(
      "注文完了"
    );



    location.href =
      "complete.html";



  }else{


    alert(

      "注文送信エラー"

    );


  }


}
