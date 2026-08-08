// =========================
// 表示順管理
// =========================

let products = [];

let fromKitchen = false;


// =========================
// 初期化
// =========================

window.addEventListener(
  "DOMContentLoaded",
  async function(){

    const params =
      new URLSearchParams(
        location.search
      );

    fromKitchen =
      params.get("from") === "kitchen";


    setupPage();

    await loadProducts();

  }
);


// =========================
// 画面設定
// =========================

function setupPage(){

  const backLink =
    document.getElementById(
      "backLink"
    );

  const pageTitle =
    document.getElementById(
      "pageTitle"
    );

  const pageDescription =
    document.getElementById(
      "pageDescription"
    );

  const sortTarget =
    document.getElementById(
      "sortTarget"
    );


  if(fromKitchen){

    pageTitle.textContent =
      "キッチンカー表示順管理";

    pageDescription.textContent =
      "キッチンカー商品の表示順を管理します";

    sortTarget.textContent =
      "キッチンカー表示順";

    backLink.href =
      "kitchen-index.html";

    backLink.textContent =
      "← キッチンカー管理へ戻る";

  }else{

    pageTitle.textContent =
      "店舗表示順管理";

    pageDescription.textContent =
      "店舗商品の表示順を管理します";

    sortTarget.textContent =
      "店舗表示順";

    backLink.href =
      "admin.html";

    backLink.textContent =
      "← 管理画面へ戻る";

  }

}


// =========================
// 商品取得
// =========================

async function loadProducts(){

  const list =
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


    if(!Array.isArray(data)){

      throw new Error(
        "商品データが不正です"
      );

    }


    // =========================
    // 対象商品の抽出
    // =========================

    products =
      data
      .filter(item => {

        if(!item.id){

          return false;

        }


        // -----------------------
        // キッチンカー
        // -----------------------

        if(fromKitchen){

          return item.kitchenCar === "○";

        }


        // -----------------------
        // 店舗
        // -----------------------

        return item.store === "○";

      });


    // =========================
    // 並び順
    // =========================

    products.sort(
      compareProducts
    );


    renderProducts();


  }catch(error){

    console.error(error);

    list.innerHTML = `

      <div class="sort-info">

        商品一覧の取得に失敗しました。

      </div>

    `;

  }

}


// =========================
// 並び順比較
// =========================

function compareProducts(a,b){

  const aSort =
    fromKitchen
      ? Number(a.kitchenSort || 999999)
      : Number(a.sort || 999999);


  const bSort =
    fromKitchen
      ? Number(b.kitchenSort || 999999)
      : Number(b.sort || 999999);


  // 表示順が設定されている場合
  if(aSort !== bSort){

    return aSort - bSort;

  }


  // 表示順が同じ場合
  // ID順
  return Number(a.id) -
         Number(b.id);

}


// =========================
// 商品一覧表示
// =========================

function renderProducts(){

  const list =
    document.getElementById(
      "sortList"
    );


  let html = "";


  products.forEach(
    (item,index)=>{

      html += `

<div
  class="sort-item"
  data-index="${index}"
>

  <div
    class="sort-number"
    id="sortNumber_${index}"
  >
    ${index + 1}
  </div>


  <div class="sort-info-main">

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

    </div>

  </div>


  <div class="sort-buttons">

    <button
      onclick="moveProduct(${index},-1)"
      ${index === 0 ? "disabled" : ""}
    >
      ▲
    </button>

    <button
      onclick="moveProduct(${index},1)"
      ${index === products.length - 1 ? "disabled" : ""}
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

        表示対象の商品がありません。

      </div>

    `;

  }


  list.innerHTML =
    html;

}


// =========================
// 並び替え
// =========================

function moveProduct(
  index,
  direction
){

  const newIndex =
    index + direction;


  if(
    newIndex < 0 ||
    newIndex >= products.length
  ){

    return;

  }


  const temp =
    products[index];


  products[index] =
    products[newIndex];


  products[newIndex] =
    temp;


  renderProducts();

}


// =========================
// 表示順保存
// =========================

async function saveSortOrder(){

  if(!products.length){

    return;

  }


  const button =
    document.getElementById(
      "saveSortButton"
    );


  if(
    !confirm(
      "現在の並び順を保存しますか？"
    )
  ){

    return;

  }


  button.disabled =
    true;

  button.textContent =
    "保存中...";


  try{

    // =========================
    // 上から1,2,3...
    // =========================

    for(
      let i = 0;
      i < products.length;
      i++
    ){

      const item =
        products[i];


      const body = {

        id:
          item.id

      };


      if(fromKitchen){

        body.kitchenSort =
          i + 1;

      }else{

        body.sort =
          i + 1;

      }


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
              JSON.stringify(body)

          }

        );


      const result =
        await res.json();


      if(!res.ok || !result.success){

        throw new Error(
          result.message ||
          "保存失敗"
        );

      }

    }


    // ローカルの商品データも更新

    products.forEach(
      (item,index)=>{

        if(fromKitchen){

          item.kitchenSort =
            index + 1;

        }else{

          item.sort =
            index + 1;

        }

      }
    );


    alert(
      "表示順を保存しました"
    );


    renderProducts();


  }catch(error){

    console.error(error);

    alert(
      "表示順の保存に失敗しました"
    );


  }finally{

    button.disabled =
      false;

    button.textContent =
      "表示順を保存";

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
