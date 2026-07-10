let staffProducts = [];

let staffCart = {};


// =========================
// 初期化
// =========================

window.onload = async function(){

  await loadStaffProducts();

};



// =========================
// 商品取得
// =========================

async function loadStaffProducts(){

  try{


    const res =
      await fetch(
        API_URL + "/api/products"
      );


    const data =
      await res.json();


    console.log(data);


    staffProducts =
      data.filter(item =>
        item.id &&
        (
          item.type === "onigiri" ||
          item.type === "drink"
        )
        &&
        item.status !== "停止"
      );



    renderProducts();



  }catch(e){

    console.error(e);

    document.getElementById(
      "productList"
    ).innerHTML =
      "商品取得エラー";

  }

}



// =========================
// 商品表示
// =========================

function renderProducts(){


  let html = "";


  staffProducts.forEach(item=>{


    staffCart[item.id] =
      staffCart[item.id] || 0;



    html += `


<div class="staff-product">


<div class="staff-product-name">

${item.name}

</div>



<div class="staff-product-price">

${Number(item.price || 0)}
円

</div>



<div class="qty-area">


<button

class="qty-btn"

onclick="changeQty(
${item.id},
-1
)"

>

−

</button>



<span

class="qty-number"

id="qty_${item.id}"

>

${staffCart[item.id]}

</span>



<button

class="qty-btn"

onclick="changeQty(
${item.id},
1
)"

>

＋

</button>



</div>



</div>


`;



  });



  document.getElementById(
    "productList"
  ).innerHTML = html;



  updateTotal();


}




// =========================
// 数量変更
// =========================

function changeQty(
 id,
 value
){


  staffCart[id] += value;


  if(
    staffCart[id] < 0
  ){

    staffCart[id] = 0;

  }



  document.getElementById(
    "qty_" + id
  ).textContent =
    staffCart[id];



  updateTotal();


}





// =========================
// 合計計算
// =========================

function updateTotal(){


  let total = 0;



  staffProducts.forEach(item=>{


    const qty =
      staffCart[item.id] || 0;


    total +=
      Number(item.price || 0)
      *
      qty;



  });



  document.getElementById(
    "totalPrice"
  ).textContent =
    total;



}



// =========================
// 注文登録
// =========================

async function submitStaffOrder(){



  const items = [];



  staffProducts.forEach(item=>{


    const qty =
      staffCart[item.id] || 0;



    if(qty > 0){


      items.push({

        productId:
          item.id,


        name:
          item.name,


        price:
          Number(item.price || 0),


        quantity:
          qty,


        amount:
          Number(item.price || 0)
          *
          qty


      });


    }



  });





  if(
    items.length === 0
  ){

    alert(
      "商品を選択してください"
    );

    return;

  }





  const body = {


    name:
      document.getElementById(
        "customerName"
      ).value,



    phone:
      document.getElementById(
        "customerPhone"
      ).value,



    pickupTime:
      document.getElementById(
        "pickupTime"
      ).value,



    note:
      document.getElementById(
        "note"
      ).value,



    items



  };





  try{


    const res =
      await fetch(

        API_URL +
        "/api/staff-orders",

        {
          method:"POST",

          headers:{

            "Content-Type":
              "application/json"

          },


          body:
            JSON.stringify(body)

        }

      );




    const result =
      await res.json();




    console.log(result);



    if(
      result.success
    ){


      alert(
        "注文登録しました"
      );


      location.reload();



    }else{


      alert(
        result.message ||
        "登録失敗"
      );


    }



  }catch(e){


    console.error(e);


    alert(
      "通信エラー"
    );


  }



}