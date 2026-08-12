// ==================================================
// admin-sales.js
// 売上確認 Ver.2.0
// ==================================================

let currentTab = "store";

// =========================
// 初期化
// =========================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    setThisMonth();

    showSalesTab(
      "store"
    );

  }
);

// =========================
// タブ切替
// =========================

function showSalesTab(
  tab
){

  currentTab = tab;

  document
    .querySelectorAll(
      ".tab-content"
    )
    .forEach(el => {

      el.classList.remove(
        "active"
      );

    });

  document
    .querySelectorAll(
      ".tab-btn"
    )
    .forEach(el => {

      el.classList.remove(
        "active"
      );

    });

  if(tab === "store"){

    document
      .getElementById(
        "storeTab"
      )
      .classList.add(
        "active"
      );

    document
      .getElementById(
        "tabStore"
      )
      .classList.add(
        "active"
      );

  }

  if(tab === "kitchen"){

    document
      .getElementById(
        "kitchenTab"
      )
      .classList.add(
        "active"
      );

    document
      .getElementById(
        "tabKitchen"
      )
      .classList.add(
        "active"
      );

  }

  if(tab === "total"){

    document
      .getElementById(
        "totalTab"
      )
      .classList.add(
        "active"
      );

    document
      .getElementById(
        "tabTotal"
      )
      .classList.add(
        "active"
      );

  }

  // =========================
  // タブ切替時に売上取得
  // =========================

  if(
    tab === "kitchen" ||
    tab === "total"
  ){

    loadSales();

  }

}

// =========================
// 日付フォーマット
// =========================

function formatDate(
  date
){

  const y =
    date.getFullYear();

  const m =
    String(
      date.getMonth() + 1
    )
    .padStart(
      2,
      "0"
    );

  const d =
    String(
      date.getDate()
    )
    .padStart(
      2,
      "0"
    );

  return (
    y +
    "-" +
    m +
    "-" +
    d
  );

}

// =========================
// 当日
// =========================

function setToday(){

  const today =
    new Date();

  document
    .getElementById(
      "startDate"
    )
    .value =
    formatDate(
      today
    );

  document
    .getElementById(
      "endDate"
    )
    .value =
    formatDate(
      today
    );

  loadSales();

}

// =========================
// 当月
// =========================

function setThisMonth(){

  const today =
    new Date();

  const start =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

  document
    .getElementById(
      "startDate"
    )
    .value =
    formatDate(
      start
    );

  document
    .getElementById(
      "endDate"
    )
    .value =
    formatDate(
      today
    );

  loadSales();

}

// =========================
// 前月
// =========================

function setLastMonth(){

  const today =
    new Date();

  const start =
    new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

  const end =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    );

  document
    .getElementById(
      "startDate"
    )
    .value =
    formatDate(
      start
    );

  document
    .getElementById(
      "endDate"
    )
    .value =
    formatDate(
      end
    );

  loadSales();

}

// =========================
// 売上集計
// =========================

async function loadSales(){

  const loading =
    document.getElementById(
      "salesLoading"
    );

  if(loading){

    loading.classList.add(
      "show"
    );

  }

  try{

    const startDate =
      document
        .getElementById(
          "startDate"
        )
        .value;

    const endDate =
      document
        .getElementById(
          "endDate"
        )
        .value;

    if(
      !startDate ||
      !endDate
    ){

      alert(
        "期間を指定してください"
      );

      return;

    }

    // =========================
    // 売上取得
    // =========================

    const res =
      await fetch(

        API_URL +
        "/api/sales",

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              "Bearer " +
              localStorage.getItem(
                "adminToken"
              )

          },

          body:
            JSON.stringify({

              startDate,

              endDate

            })

        }

      );

    // =========================
    // HTTPエラー確認
    // =========================

    if(!res.ok){

      const errorText =
        await res.text();

      console.error(
        "売上APIエラー:",
        res.status,
        errorText
      );

      throw new Error(
        "売上APIエラー: " +
        res.status
      );

    }

    const data =
      await res.json();

    console.log(
      "売上データ:",
      data
    );

    // =========================
    // データ構造確認
    // =========================

    if(
      !data ||
      !data.store ||
      !data.kitchen
    ){

      console.error(
        "売上データ形式エラー:",
        data
      );

      throw new Error(
        "売上データの形式が不正です"
      );

    }

    // =========================
    // 店舗
    // =========================

    document
      .getElementById(
        "onigiriSales"
      )
      .innerText =
        "¥" +
        Number(
          data.store.onigiriSales || 0
        )
        .toLocaleString();

    document
      .getElementById(
        "bbqSales"
      )
      .innerText =
        "¥" +
        Number(
          data.store.bbqSales || 0
        )
        .toLocaleString();

    document
      .getElementById(
        "optionSales"
      )
      .innerText =
        "¥" +
        Number(
          data.store.optionSales || 0
        )
        .toLocaleString();

    document
      .getElementById(
        "storeTotalSales"
      )
      .innerText =
        "¥" +
        Number(
          data.store.totalSales || 0
        )
        .toLocaleString();

    // =========================
    // 店舗 商品別
    // =========================

    displayProductSales(

      "storeProductSales",

      data.store.products || []

    );

    // =========================
    // キッチンカー
    // =========================

    document
      .getElementById(
        "kitchenTotalSales"
      )
      .innerText =
        "¥" +
        Number(
          data.kitchen.totalSales || 0
        )
        .toLocaleString();

    // =========================
    // キッチンカー 商品別
    // =========================

    displayProductSales(

      "kitchenProductSales",

      data.kitchen.products || []

    );

    // =========================
    // 総合
    // =========================

    const storeTotal =
      Number(
        data.store.totalSales || 0
      );

    const kitchenTotal =
      Number(
        data.kitchen.totalSales || 0
      );

    const grandTotal =
      Number(
        data.total?.totalSales ??
        (storeTotal + kitchenTotal)
      );

    document
      .getElementById(
        "totalStoreSales"
      )
      .innerText =
        "¥" +
        storeTotal.toLocaleString();

    document
      .getElementById(
        "totalKitchenSales"
      )
      .innerText =
        "¥" +
        kitchenTotal.toLocaleString();

    document
      .getElementById(
        "grandTotalSales"
      )
      .innerText =
        "¥" +
        grandTotal.toLocaleString();

    // =========================
    // 総合 店舗商品別
    // =========================

    displayProductSales(

      "totalStoreProductSales",

      data.store.products || []

    );

    // =========================
    // 総合 キッチンカー商品別
    // =========================

    displayProductSales(

      "totalKitchenProductSales",

      data.kitchen.products || []

    );

  }
  catch(e){

    console.error(
      "売上集計エラー",
      e
    );

    alert(
      "売上取得中にエラーが発生しました"
    );

  }
  finally{

    if(loading){

      loading.classList.remove(
        "show"
      );

    }

  }

}

// =========================
// 店舗売上取得
// =========================

async function loadStoreSales(
  startDate,
  endDate
){

  try{

    const res =
      await fetch(

        API_URL +
        "/api/sales",

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              "Bearer " +
              localStorage.getItem(
                "adminToken"
              )

          },

          body:
            JSON.stringify({

              startDate,

              endDate

            })

        }

      );

    if(!res.ok){

      throw new Error(
        "売上APIエラー: " +
        res.status
      );

    }

    const data =
      await res.json();

    document
      .getElementById(
        "onigiriSales"
      )
      .innerText =
        "¥" +
        Number(
          data.store?.onigiriSales || 0
        )
        .toLocaleString();

    document
      .getElementById(
        "bbqSales"
      )
      .innerText =
        "¥" +
        Number(
          data.store?.bbqSales || 0
        )
        .toLocaleString();

    document
      .getElementById(
        "optionSales"
      )
      .innerText =
        "¥" +
        Number(
          data.store?.optionSales || 0
        )
        .toLocaleString();

    document
      .getElementById(
        "storeTotalSales"
      )
      .innerText =
        "¥" +
        Number(
          data.store?.totalSales || 0
        )
        .toLocaleString();

    displayProductSales(

      "storeProductSales",

      data.store?.products || []

    );

    return {

      total:
        Number(
          data.store?.totalSales || 0
        ),

      products:
        data.store?.products || []

    };

  }
  catch(e){

    console.error(
      "店舗売上取得エラー",
      e
    );

    return {

      total: 0,

      products: []

    };

  }

}

// =========================
// キッチンカー売上取得
// =========================

async function loadKitchenSales(
  startDate,
  endDate
){

  try{

    const res =
      await fetch(

        API_URL +
        "/api/sales",

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              "Bearer " +
              localStorage.getItem(
                "adminToken"
              )

          },

          body:
            JSON.stringify({

              startDate,

              endDate

            })

        }

      );

    if(!res.ok){

      throw new Error(
        "売上APIエラー: " +
        res.status
      );

    }

    const data =
      await res.json();

    const total =
      Number(
        data.kitchen?.totalSales || 0
      );

    document
      .getElementById(
        "kitchenTotalSales"
      )
      .innerText =
        "¥" +
        total.toLocaleString();

    displayProductSales(

      "kitchenProductSales",

      data.kitchen?.products || []

    );

    updateTotalSales(
      total
    );

    return {

      total,

      products:
        data.kitchen?.products || []

    };

  }
  catch(e){

    console.error(
      "キッチンカー売上取得エラー",
      e
    );

    return {

      total: 0,

      products: []

    };

  }

}

// =========================
// 総合売上更新
// =========================

function updateTotalSales(
  kitchenTotal
){

  const storeElement =
    document.getElementById(
      "storeTotalSales"
    );

  const storeTotal =
    Number(
      storeElement
        ?.innerText
        .replace(
          /[^0-9]/g,
          ""
        )
      || 0
    );

  document
    .getElementById(
      "totalStoreSales"
    )
    .innerText =
      "¥" +
      storeTotal.toLocaleString();

  document
    .getElementById(
      "totalKitchenSales"
    )
    .innerText =
      "¥" +
      Number(
        kitchenTotal
      )
      .toLocaleString();

  document
    .getElementById(
      "grandTotalSales"
    )
    .innerText =
      "¥" +
      (
        storeTotal +
        Number(kitchenTotal)
      )
      .toLocaleString();

}

// =========================
// 商品別売上表示
// =========================

function displayProductSales(
  targetId,
  products
){

  const area =
    document.getElementById(
      targetId
    );

  if(!area){

    console.warn(
      "商品別売上表示先がありません:",
      targetId
    );

    return;

  }

  area.innerHTML = "";

  if(
    !products ||
    products.length === 0
  ){

    area.innerHTML =

      `
      <tr>
        <td colspan="3">
          データがありません
        </td>
      </tr>
      `;

    return;

  }

  products.forEach(
    item => {

      area.innerHTML +=

        `
        <tr>

          <td>
            ${escapeHtml(
              item.name || ""
            )}
          </td>

          <td>
            ${Number(
              item.qty || 0
            )}
            個
          </td>

          <td>
            ¥${Number(
              item.amount || 0
            )
            .toLocaleString()}
          </td>

        </tr>
        `;

    }
  );

}

// =========================
// HTMLエスケープ
// =========================

function escapeHtml(
  value
){

  return String(
    value
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
// キッチンカー商品別表示
// =========================

function displayKitchenProducts(
  products
){

  displayProductSales(

    "kitchenProductSales",

    products

  );

}

// =========================
// 総合商品集計
// =========================

function mergeProducts(
  storeProducts,
  kitchenProducts
){

  const result = {};

  [
    ...(storeProducts || []),
    ...(kitchenProducts || [])
  ]
  .forEach(
    item => {

      if(!result[item.name]){

        result[item.name] = {

          name:
            item.name,

          qty: 0,

          amount: 0

        };

      }

      result[item.name].qty +=
        Number(
          item.qty || 0
        );

      result[item.name].amount +=
        Number(
          item.amount || 0
        );

    }
  );

  return Object.values(
    result
  );

}

// =========================
// CSV出力
// =========================

async function downloadSalesCSV(){

  const startDate =
    document
      .getElementById(
        "startDate"
      )
      .value;

  const endDate =
    document
      .getElementById(
        "endDate"
      )
      .value;

  const token =
    localStorage.getItem(
      "adminToken"
    );

  try{

    const res =
      await fetch(

        API_URL +
        "/api/sales/csv",

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              "Bearer " +
              token

          },

          body:
            JSON.stringify({

              startDate,

              endDate

            })

        }

      );

    if(!res.ok){

      throw new Error(
        "CSV APIエラー: " +
        res.status
      );

    }

    const data =
      await res.json();

    if(
      !data.success
    ){

      alert(
        "CSV作成失敗"
      );

      return;

    }

    const csv =
      data.csv
        .map(
          row =>

            row
              .map(
                value =>

                  `"${String(
                    value
                  )
                  .replace(
                    /"/g,
                    '""'
                  )}"`
              )
              .join(",")
        )
        .join("\n");

    const blob =
      new Blob(

        [
          "\uFEFF" +
          csv
        ],

        {

          type:
            "text/csv;charset=utf-8;"

        }

      );

    const url =
      URL.createObjectURL(
        blob
      );

    const a =
      document.createElement(
        "a"
      );

    a.href =
      url;

    a.download =
      "売上履歴_" +
      startDate +
      "_" +
      endDate +
      ".csv";

    a.click();

    URL.revokeObjectURL(
      url
    );

  }
  catch(e){

    console.error(
      "CSV出力エラー",
      e
    );

    alert(
      "CSV出力中にエラーが発生しました"
    );

  }

}
