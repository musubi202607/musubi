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
    // =========================
    // 店舗○の商品だけ対象
    //
    // 初期表示：
    // 種類 → ID順
    //
    // G列の既存値は、
    // この画面では初期並びには使用しない
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
    // キッチンカー表示順
    // =========================
    // カー○の商品だけ対象
    //
    // N列「カー表示順」がある場合
    //     → N列順
    //
    // N列が空の場合
    //     → ID順
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
    // 表示
    // =========================

    renderStoreProducts();

    renderKitchenProducts();


  }catch(error){

    console.error(
      "商品取得エラー",
      error
    );


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
// 店舗商品の初期並び
// =========================
// 種類 → ID順
// =========================

function compareStoreProducts(a,b){

  const aType =
    String(
      a.type || ""
    );

  const bType =
    String(
      b.type || ""
    );


  if(aType !== bType){

    return aType.localeCompare(
      bType,
      "ja"
    );

  }


  return (
    Number(a.id) -
    Number(b.id)
  );

}


// =========================
// キッチンカー商品の初期並び
// =========================
// N列「カー表示順」を優先
// N列が空ならID順
// =========================

function compareKitchenProducts(a,b){

  const aSort =
    getKitchenSort(a);

  const bSort =
    getKitchenSort(b);


  if(aSort !== bSort){

    return aSort - bSort;

  }


  return (
    Number(a.id) -
    Number(b.id)
  );

}


// =========================
// キッチンカー表示順取得
// =========================

function getKitchenSort(item){

  const value =
    item.kitchenSort;


  if(
    value !== undefined &&
    value !== null &&
    value !== ""
  ){

    const number =
      Number(value);


    if(!isNaN(number)){

      return number;

    }

  }


  // N列が空の場合
  // IDを仮の表示順として使用

  return Number(
    item.id
  );

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

              onclick="
                moveStoreProduct(
                  ${index},
                  -1
                )
              "

              ${
                index === 0
                  ? "disabled"
                  : ""
              }

            >

              ▲

            </button>


            <button

              onclick="
                moveStoreProduct(
                  ${index},
                  1
                )
              "

              ${
                index ===
                storeProducts.length - 1
                  ? "disabled"
                  : ""
              }

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

        店舗表示対象の商品がありません。

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

              ／

              現在の順：
              ${getKitchenSort(item)}

            </div>

          </div>


          <div class="sort-buttons">

            <button

              onclick="
                moveKitchenProduct(
                  ${index},
                  -1
                )
              "

              ${
                index === 0
                  ? "disabled"
                  : ""
              }

            >

              ▲

            </button>


            <button

              onclick="
                moveKitchenProduct(
                  ${index},
                  1
                )
              "

              ${
                index ===
                kitchenProducts.length - 1
                  ? "disabled"
                  : ""
              }

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

        キッチンカー表示対象の商品がありません。

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
      "現在の店舗表示順を保存しますか？"
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

    // =========================
    // 上から1,2,3...
    // G列「表示順」に保存
    // =========================

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


    // ローカルデータ更新

    storeProducts.forEach(
      (item,index)=>{

        item.sort =
          index + 1;

      }
    );


    alert(
      "店舗表示順を保存しました"
    );


  }catch(error){

    console.error(
      "店舗表示順保存エラー",
      error
    );


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
      "現在のキッチンカー表示順を保存しますか？"
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

    // =========================
    // 上から1,2,3...
    // N列「カー表示順」に保存
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


    // ローカルデータ更新

    kitchenProducts.forEach(
      (item,index)=>{

        item.kitchenSort =
          index + 1;

      }
    );


    alert(
      "キッチンカー表示順を保存しました"
    );


  }catch(error){

    console.error(
      "キッチンカー表示順保存エラー",
      error
    );


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
