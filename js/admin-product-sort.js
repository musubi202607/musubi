// =========================
// 商品表示順管理
// 店舗 ＋ キッチンカー
// =========================

let products = [];
let storeProducts = [];
let kitchenProducts = [];


// =========================
// 初期化
// =========================

window.addEventListener(
  "DOMContentLoaded",
  async function(){

    await loadProducts();

  }
);


// =========================
// 商品取得
// =========================

async function loadProducts(){

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


    if(!Array.isArray(data)){

      throw new Error(
        "商品データが不正です"
      );

    }


    products =
      data.filter(
        item => item.id
      );


    // =========================
    // 店舗表示順
    // 店舗○を上位
    // その中で種類 → ID順
    // =========================

    storeProducts =
      products
      .filter(
        item =>
          item.store === "○"
      )
      .sort(
        compareStoreProducts
      );


    // =========================
    // 店舗×の商品
    // =========================

    const storeDisabled =
      products
      .filter(
        item =>
          item.store !== "○"
      )
      .sort(
        compareStoreProducts
      );


    storeProducts =
      storeProducts.concat(
        storeDisabled
      );


    // =========================
    // キッチンカー表示順
    // カー○を上位
    // =========================

    kitchenProducts =
      products
      .filter(
        item =>
          item.kitchenCar === "○"
      )
      .sort(
        compareKitchenProducts
      );


    // =========================
    // カー×の商品
    // =========================

    const kitchenDisabled =
      products
      .filter(
        item =>
          item.kitchenCar !== "○"
      )
      .sort(
        compareKitchenProducts
      );


    kitchenProducts =
      kitchenProducts.concat(
        kitchenDisabled
      );


    renderStoreProducts();
    renderKitchenProducts();


  }catch(error){

    console.error(error);


    const storeList =
      document.getElementById(
        "storeSortList"
      );

    const kitchenList =
      document.getElementById(
        "kitchenSortList"
      );


    if(storeList){

      storeList.innerHTML = `

        <div class="sort-info">

          商品一覧の取得に失敗しました。

        </div>

      `;

    }


    if(kitchenList){

      kitchenList.innerHTML = `

        <div class="sort-info">

          商品一覧の取得に失敗しました。

        </div>

      `;

    }

  }

}


// =========================
// 店舗商品の比較
// =========================

function compareStoreProducts(a,b){

  const aType =
    String(a.type || "");

  const bType =
    String(b.type || "");


  if(aType !== bType){

    return aType.localeCompare(
      bType,
      "ja"
    );

  }


  return Number(a.id) -
    Number(b.id);

}


// =========================
// キッチンカー商品の比較
// =========================

function compareKitchenProducts(a,b){

  return Number(a.id) -
    Number(b.id);

}


// =========================
// 店舗表示
// =========================

function renderStoreProducts(){

  const list =
    document.getElementById(
      "storeSortList"
    );


  if(!list){

    return;

  }


  let html = "";


  storeProducts.forEach(
    (item,index)=>{

      const enabled =
        item.store === "○";


      html += `

        <div class="sort-item">

          <div class="sort-number">

            ${index + 1}

          </div>

          <div class="sort-info">

            <div class="sort-name">

              ${escapeHtml(
                item.name || ""
              )}

            </div>

            <div class="sort-detail">

              ID：
              ${item.id}

              ／

              ${escapeHtml(
                item.type || ""
              )}

              ／

              店舗：
              ${item.store || "×"}

            </div>

          </div>

          <div class="sort-buttons">

            <button
              onclick="moveStoreProduct(
                ${index},
                -1
              )"
              ${index === 0 ? "disabled" : ""}
            >
              ▲
            </button>

            <button
              onclick="moveStoreProduct(
                ${index},
                1
              )"
              ${index === storeProducts.length - 1 ? "disabled" : ""}
            >
              ▼
            </button>

          </div>

        </div>

      `;

    }
  );


  if(!html){

    html = `

      <div class="sort-info">

        商品がありません。

      </div>

    `;

  }


  list.innerHTML =
    html;

}


// =========================
// キッチンカー表示
// =========================

function renderKitchenProducts(){

  const list =
    document.getElementById(
      "kitchenSortList"
    );


  if(!list){

    return;

  }


  let html = "";


  kitchenProducts.forEach(
    (item,index)=>{

      html += `

        <div class="sort-item">

          <div class="sort-number">

            ${index + 1}

          </div>

          <div class="sort-info">

            <div class="sort-name">

              ${escapeHtml(
                item.name || ""
              )}

            </div>

            <div class="sort-detail">

              ID：
              ${item.id}

              ／

              ${escapeHtml(
                item.type || ""
              )}

              ／

              カー：
              ${item.kitchenCar || "×"}

            </div>

          </div>

          <div class="sort-buttons">

            <button
              onclick="moveKitchenProduct(
                ${index},
                -1
              )"
              ${index === 0 ? "disabled" : ""}
            >
              ▲
            </button>

            <button
              onclick="moveKitchenProduct(
                ${index},
                1
              )"
              ${index === kitchenProducts.length - 1 ? "disabled" : ""}
            >
              ▼
            </button>

          </div>

        </div>

      `;

    }
  );


  if(!html){

    html = `

      <div class="sort-info">

        商品がありません。

      </div>

    `;

  }


  list.innerHTML =
    html;

}


// =========================
// 店舗並び替え
// =========================

function moveStoreProduct(
  index,
  direction
){

  const newIndex =
    index + direction;


  if(
    newIndex < 0 ||
    newIndex >= storeProducts.length
  ){

    return;

  }


  const temp =
    storeProducts[index];


  storeProducts[index] =
    storeProducts[newIndex];


  storeProducts[newIndex] =
    temp;


  renderStoreProducts();

}


// =========================
// キッチンカー並び替え
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
// 店舗表示順保存
// =========================

async function saveStoreSortOrder(){

  if(!storeProducts.length){

    return;

  }


  if(
    !confirm(
      "店舗表示順を保存しますか？"
    )
  ){

    return;

  }


  const button =
    document.getElementById(
      "saveStoreSortButton"
    );


  if(button){

    button.disabled =
      true;

    button.textContent =
      "保存中...";

  }


  try{

    for(
      let i = 0;
      i < storeProducts.length;
      i++
    ){

      const item =
        storeProducts[i];


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

                sort:
                  i + 1

              })

          }

        );


      const result =
        await res.json();


      if(
        !res.ok ||
        !result.success
      ){

        throw new Error(
          result.message ||
          "保存失敗"
        );

      }

    }


    alert(
      "店舗表示順を保存しました"
    );


  }catch(error){

    console.error(error);


    alert(
      "店舗表示順の保存に失敗しました"
    );


  }finally{

    if(button){

      button.disabled =
        false;

      button.textContent =
        "店舗表示順を保存";

    }

  }

}


// =========================
// キッチンカー表示順保存
// =========================

async function saveKitchenSortOrder(){

  if(!kitchenProducts.length){

    return;

  }


  if(
    !confirm(
      "キッチンカー表示順を保存しますか？"
    )
  ){

    return;

  }


  const button =
    document.getElementById(
      "saveKitchenSortButton"
    );


  if(button){

    button.disabled =
      true;

    button.textContent =
      "保存中...";

  }


  try{

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


      const result =
        await res.json();


      if(
        !res.ok ||
        !result.success
      ){

        throw new Error(
          result.message ||
          "保存失敗"
        );

      }

    }


    alert(
      "キッチンカー表示順を保存しました"
    );


  }catch(error){

    console.error(error);


    alert(
      "キッチンカー表示順の保存に失敗しました"
    );


  }finally{

    if(button){

      button.disabled =
        false;

      button.textContent =
        "キッチンカー表示順を保存";

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
