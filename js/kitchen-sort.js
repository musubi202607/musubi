// =========================
// キッチンカー表示順管理
// =========================

let kitchenProducts = [];


// =========================
// 初期化
// =========================
window.addEventListener(
  "DOMContentLoaded",
  () => {

    loadKitchenProducts();

  }
);


// =========================
// 商品取得
// =========================
async function loadKitchenProducts(){

  const area =
    document.getElementById(
      "sortList"
    );

  try{

    const res =
      await fetch(

        API_URL +
        "/api/products",

        {
          headers:{
            Authorization:
              "Bearer " +
              localStorage.getItem(
                "adminToken"
              )
          }
        }

      );


    if(!res.ok){

      throw new Error(
        "商品取得失敗"
      );

    }


    const data =
      await res.json();


    // =========================
    // カー表示 ○ のみ
    // =========================
    kitchenProducts =
      data

      .filter(
        item =>
          item.id &&
          item.kitchenCar === "○"
      )

      .map(item => ({

        ...item,

        // N列が空ならID順
        kitchenSort:
          Number(
            item.kitchenSort
          ) ||
          Number(item.id)

      }));


    // =========================
    // カー表示順で並べる
    // =========================
    kitchenProducts.sort(

      (a,b) =>

        Number(a.kitchenSort) -
        Number(b.kitchenSort)

    );


    renderKitchenProducts();


  }catch(error){

    console.error(error);

    area.innerHTML =

      `<p style="color:red;">
        商品の取得に失敗しました。
      </p>`;

  }

}


// =========================
// 商品一覧表示
// =========================
function renderKitchenProducts(){

  const area =
    document.getElementById(
      "sortList"
    );


  if(
    kitchenProducts.length === 0
  ){

    area.innerHTML =
      "<p>キッチンカー表示の商品がありません。</p>";

    return;

  }


  let html = "";


  kitchenProducts.forEach(

    (item,index) => {

      html += `

<div
  class="kitchen-sort-item"
  data-id="${item.id}"
  style="
    display:flex;
    align-items:center;
    gap:10px;
    background:#fff;
    border:1px solid #ddd;
    border-radius:10px;
    padding:12px;
    margin-bottom:10px;
  "
>

  <div
    style="
      width:35px;
      text-align:center;
      font-size:20px;
      font-weight:bold;
    "
  >
    ${index + 1}
  </div>


  <div
    style="
      flex:1;
      min-width:0;
    "
  >

    <div
      style="
        font-weight:bold;
        font-size:17px;
      "
    >
      ${escapeHtml(item.name || "")}
    </div>

    <div
      style="
        font-size:13px;
        color:#666;
        margin-top:4px;
      "
    >
      カー価格：
      ${Number(item.kitchenPrice || 0)}円
    </div>

    <div
      style="
        font-size:12px;
        color:#999;
        margin-top:2px;
      "
    >
      ID：${item.id}
    </div>

  </div>


  <div
    style="
      display:flex;
      flex-direction:column;
      gap:5px;
    "
  >

    <button
      type="button"
      onclick="moveKitchenProduct(${index},-1)"
      ${index === 0 ? "disabled" : ""}
      style="
        width:45px;
        height:40px;
        font-size:20px;
      "
    >
      ↑
    </button>

    <button
      type="button"
      onclick="moveKitchenProduct(${index},1)"
      ${index === kitchenProducts.length - 1 ? "disabled" : ""}
      style="
        width:45px;
        height:40px;
        font-size:20px;
      "
    >
      ↓
    </button>

  </div>

</div>

`;

    }

  );


  area.innerHTML = html;

}


// =========================
// 商品並び替え
// =========================
function moveKitchenProduct(
  index,
  direction
){

  const newIndex =
    index + direction;


  if(
    newIndex < 0 ||
    newIndex >= kitchenProducts.length
  ){

    return;

  }


  const temp =
    kitchenProducts[index];


  kitchenProducts[index] =
    kitchenProducts[newIndex];


  kitchenProducts[newIndex] =
    temp;


  renderKitchenProducts();

}


// =========================
// 保存
// =========================
async function saveKitchenSort(){

  if(
    kitchenProducts.length === 0
  ){

    return;

  }


  const button =
    document.getElementById(
      "saveButton"
    );


  if(button){

    button.disabled = true;

    button.textContent =
      "保存中...";

  }


  try{

    // =========================
    // 現在の並び順をN列へ保存
    // =========================
    for(
      let i = 0;
      i < kitchenProducts.length;
      i++
    ){

      const item =
        kitchenProducts[i];


      const res =
        await fetch(

          API_URL +
          "/api/products/update",

          {

            method:"POST",

            headers:{

              "Content-Type":
                "application/json",

              Authorization:
                "Bearer " +
                localStorage.getItem(
                  "adminToken"
                )

            },

            body:
              JSON.stringify({

                id:
                  item.id,

                kitchenSort:
                  i + 1

              })

            }

        );


      if(!res.ok){

        throw new Error(
          "保存失敗"
        );

      }


      const result =
        await res.json();


      if(!result.success){

        throw new Error(
          result.message ||
          "保存失敗"
        );

      }

    }


    // =========================
    // 保存後
    // =========================
    kitchenProducts.forEach(

      (item,index) => {

        item.kitchenSort =
          index + 1;

      }

    );


    renderKitchenProducts();


    alert(
      "表示順を保存しました"
    );


  }catch(error){

    console.error(error);

    alert(
      "表示順の保存に失敗しました"
    );


  }finally{

    if(button){

      button.disabled = false;

      button.textContent =
        "💾 順番を保存";

    }

  }

}


// =========================
// HTMLエスケープ
// =========================
function escapeHtml(value){

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}
