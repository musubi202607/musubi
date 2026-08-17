// ==================================================
// dashboard.js Ver2
// ==================================================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    loadDashboard();

  }
);

// =========================
// ダッシュボード取得
// =========================

async function loadDashboard(){

  const token =
    localStorage.getItem(
      "adminToken"
    );

  try{

    const response =
      await fetch(

        API_URL +
        "/api/dashboard",

        {

          headers:{

            Authorization:
              "Bearer " + token

          }

        }

      );

    if(!response.ok){

      alert(
        "認証エラーです。"
      );

      location.href =
        "login.html";

      return;

    }

    const data =
      await response.json();

    updateSummaryCards(
      data
    );

    updateSalesCards(
      data
    );

    updateAnalysisCards(
      data
    );

    updateTopProducts(
      data.topProducts || []
    );

    updateCategorySales(
      data.categorySales || []
    );

  }catch(error){

    console.error(
      "Dashboard Error",
      error
    );

    alert(
      "ダッシュボードの取得に失敗しました。"
    );

  }

}

// =========================
// 売上カード
// =========================

function updateSalesCards(
  data
){

  setYen(

    "bbqSales",

    data.bbqSales

  );

  setYen(

    "optionSales",

    data.optionSales

  );

  setYen(

    "onigiriSales",

    data.onigiriSales

  );

  setYen(

    "kitchenSales",

    data.kitchenSales

  );

  setYen(

    "totalSales",

    data.totalSales

  );

  setYen(

    "todaySales",

    data.todaySales

  );

  setYen(

    "monthSales",

    data.monthSales

  );

}

// =========================
// 人気商品TOP5
// =========================

function updateTopProducts(
  products
){

  const tbody =
    document.getElementById(
      "topProductsTable"
    );

  if(!tbody){

    return;

  }

  tbody.innerHTML = "";

  if(
    !Array.isArray(products) ||
    products.length === 0
  ){

    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          データがありません
        </td>
      </tr>
    `;

    return;

  }

  products.forEach(
    (item,index)=>{

      tbody.innerHTML += `
        <tr>

          <td>

            ${index + 1}

          </td>

          <td>

            ${escapeHtml(
              item.name
            )}

          </td>

          <td>

            ${escapeHtml(
              item.category || "その他"
            )}

          </td>

          <td>

            ${Number(
              item.qty || 0
            ).toLocaleString()}個

          </td>

          <td>

            ${formatYen(
              item.sales || 0
            )}

          </td>

        </tr>
      `;

    }

  );

}

// =========================
// カテゴリ別売上
// =========================

function updateCategorySales(
  categories
){

  const tbody =
    document.getElementById(
      "categorySalesTable"
    );

  if(!tbody){

    return;

  }

  tbody.innerHTML = "";

  if(
    !Array.isArray(categories) ||
    categories.length === 0
  ){

    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          データがありません
        </td>
      </tr>
    `;

    return;

  }

  const totalSales =
    categories.reduce(
      (sum,item)=>
        sum +
        Number(item.amount || 0),
      0
    );

  categories.forEach(item=>{

    const amount =
      Number(
        item.amount || 0
      );

    const ratio =
      totalSales > 0
      ? amount / totalSales * 100
      : 0;

    tbody.innerHTML += `
      <tr>

        <td>

          ${escapeHtml(
            item.category
          )}

        </td>

        <td>

          ${formatYen(
            amount
          )}

        </td>

        <td>

          ${ratio.toFixed(1)}%

        </td>

        <td>

          <div class="ratio-bar">

            <div
              class="ratio-fill"
              style="width:${ratio.toFixed(1)}%;"
            ></div>

          </div>

        </td>

      </tr>
    `;

  });

}

// =========================
// 共通関数
// =========================

// 値表示
function setValue(
  id,
  value
){

  const el =
    document.getElementById(id);

  if(!el){
    return;
  }

  el.innerText =
    value ?? 0;

}

// 金額表示
function setYen(
  id,
  value
){

  const el =
    document.getElementById(id);

  if(!el){
    return;
  }

  el.innerText =
    formatYen(value);

}

// =========================
// 金額フォーマット
// =========================

function formatYen(
  value
){

  return (
    "¥" +
    Number(
      value || 0
    ).toLocaleString()
  );

}

// =========================
// HTMLエスケープ
// =========================

function escapeHtml(
  value
){

  return String(
    value ?? ""
  )

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

// =========================
// パーセント表示
// =========================

function formatPercent(
  value
){

  return (
    Number(
      value || 0
    ).toFixed(1)
    + "%"
  );

}
