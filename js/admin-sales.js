// ==================================================
// admin-sales.js
// 売上確認 Ver.2.1
// ==================================================

let currentTab = "store";


// ==================================================
// 初期化
// ==================================================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    setThisMonth();

    showSalesTab(
      "store"
    );

  }
);


// ==================================================
// タブ切替
// ==================================================

function showSalesTab(
  tab
) {

  currentTab = tab;

  document
    .querySelectorAll(
      ".tab-content"
    )
    .forEach(
      el => {

        el.classList.remove(
          "active"
        );

      }
    );

  document
    .querySelectorAll(
      ".tab-btn"
    )
    .forEach(
      el => {

        el.classList.remove(
          "active"
        );

      }
    );


  // =========================
  // 店舗
  // =========================

  if (tab === "store") {

    const storeTab =
      document.getElementById(
        "storeTab"
      );

    const tabStore =
      document.getElementById(
        "tabStore"
      );

    if (storeTab) {

      storeTab.classList.add(
        "active"
      );

    }

    if (tabStore) {

      tabStore.classList.add(
        "active"
      );

    }

  }


  // =========================
  // キッチンカー
  // =========================

  if (tab === "kitchen") {

    const kitchenTab =
      document.getElementById(
        "kitchenTab"
      );

    const tabKitchen =
      document.getElementById(
        "tabKitchen"
      );

    if (kitchenTab) {

      kitchenTab.classList.add(
        "active"
      );

    }

    if (tabKitchen) {

      tabKitchen.classList.add(
        "active"
      );

    }

  }


  // =========================
  // 総合
  // =========================

  if (tab === "total") {

    const totalTab =
      document.getElementById(
        "totalTab"
      );

    const tabTotal =
      document.getElementById(
        "tabTotal"
      );

    if (totalTab) {

      totalTab.classList.add(
        "active"
      );

    }

    if (tabTotal) {

      tabTotal.classList.add(
        "active"
      );

    }

  }


  // =========================
  // 売上取得
  // =========================

  if (
    tab === "kitchen" ||
    tab === "total"
  ) {

    loadSales();

  }

}


// ==================================================
// 日付フォーマット
// ==================================================

function formatDate(
  date
) {

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


// ==================================================
// 当日
// ==================================================

function setToday() {

  const today =
    new Date();

  const startDate =
    document.getElementById(
      "startDate"
    );

  const endDate =
    document.getElementById(
      "endDate"
    );

  if (startDate) {

    startDate.value =
      formatDate(
        today
      );

  }

  if (endDate) {

    endDate.value =
      formatDate(
        today
      );

  }

  loadSales();

}


// ==================================================
// 当月
// ==================================================

function setThisMonth() {

  const today =
    new Date();

  const start =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );


  const startDate =
    document.getElementById(
      "startDate"
    );

  const endDate =
    document.getElementById(
      "endDate"
    );


  if (startDate) {

    startDate.value =
      formatDate(
        start
      );

  }

  if (endDate) {

    endDate.value =
      formatDate(
        today
      );

  }

  loadSales();

}


// ==================================================
// 前月
// ==================================================

function setLastMonth() {

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


  const startDate =
    document.getElementById(
      "startDate"
    );

  const endDate =
    document.getElementById(
      "endDate"
    );


  if (startDate) {

    startDate.value =
      formatDate(
        start
      );

  }

  if (endDate) {

    endDate.value =
      formatDate(
        end
      );

  }

  loadSales();

}


// ==================================================
// 売上API共通取得
// ==================================================

async function fetchSales(
  startDate,
  endDate
) {

  const token =
    localStorage.getItem(
      "adminToken"
    );


  if (!token) {

    throw new Error(
      "管理者認証トークンがありません"
    );

  }


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
            token

        },

        body:
          JSON.stringify({

            startDate,
            endDate

          })

      }

    );


  // =========================
  // レスポンス本文取得
  // =========================

  const text =
    await res.text();


  console.log(
    "SALES API STATUS =",
    res.status
  );

  console.log(
    "SALES API RAW =",
    text
  );


  // =========================
  // JSON解析
  // =========================

  let data;

  try {

    data =
      JSON.parse(
        text
      );

  } catch (error) {

    throw new Error(
      "APIレスポンスがJSONではありません: " +
      text.substring(
        0,
        300
      )
    );

  }


  // =========================
  // HTTPエラー
  // =========================

  if (!res.ok) {

    throw new Error(

      data.message ||
      data.error ||
      (
        "売上APIエラー HTTP " +
        res.status
      )

    );

  }


  // =========================
  // success:false
  // =========================

  if (
    data.success === false
  ) {

    throw new Error(

      data.message ||
      "売上取得に失敗しました"

    );

  }


  // =========================
  // データ構造確認
  // =========================

  if (
    !data.store ||
    !data.kitchen ||
    !data.total
  ) {

    console.error(
      "想定外の売上データ:",
      data
    );

    throw new Error(
      "売上データの形式が正しくありません"
    );

  }


  return data;

}


// ==================================================
// 売上集計
// ==================================================

async function loadSales() {

  const loading =
    document.getElementById(
      "salesLoading"
    );


  if (loading) {

    loading.classList.add(
      "show"
    );

  }


  try {

    const startDate =
      document
        .getElementById(
          "startDate"
        )
        ?.value || "";


    const endDate =
      document
        .getElementById(
          "endDate"
        )
        ?.value || "";


    // =========================
    // 日付確認
    // =========================

    if (
      !startDate ||
      !endDate
    ) {

      alert(
        "期間を指定してください"
      );

      return;

    }


    // =========================
    // API取得
    // =========================

    const data =
      await fetchSales(
        startDate,
        endDate
      );


    console.log(
      "売上集計結果:",
      data
    );


    // =========================
    // 安全なデフォルト値
    // =========================

    const store =
      data.store || {

        onigiriSales: 0,
        bbqSales: 0,
        optionSales: 0,
        totalSales: 0,
        products: []

      };


    const kitchen =
      data.kitchen || {

        totalSales: 0,
        products: []

      };


    const total =
      data.total || {

        totalSales: 0

      };


    // =========================
    // 店舗
    // =========================

    setSalesText(
      "onigiriSales",
      store.onigiriSales
    );


    setSalesText(
      "bbqSales",
      store.bbqSales
    );


    setSalesText(
      "optionSales",
      store.optionSales
    );


    setSalesText(
      "storeTotalSales",
      store.totalSales
    );


    displayProductSales(

      "storeProductSales",

      store.products || []

    );


    // =========================
    // キッチンカー
    // =========================

    setSalesText(
      "kitchenTotalSales",
      kitchen.totalSales
    );


    displayProductSales(

      "kitchenProductSales",

      kitchen.products || []

    );


    // =========================
    // 総合
    // =========================

    setSalesText(
      "totalStoreSales",
      store.totalSales
    );


    setSalesText(
      "totalKitchenSales",
      kitchen.totalSales
    );


    setSalesText(
      "grandTotalSales",
      total.totalSales
    );


    displayProductSales(

      "totalProductSales",

      mergeProducts(

        store.products || [],

        kitchen.products || []

      )

    );


  }
  catch (e) {

    console.error(
      "売上集計エラー",
      e
    );


    alert(
      "売上取得中にエラーが発生しました\n\n" +
      e.message
    );

  }
  finally {

    if (loading) {

      loading.classList.remove(
        "show"
      );

    }

  }

}


// ==================================================
// 売上表示共通
// ==================================================

function setSalesText(
  elementId,
  value
) {

  const element =
    document.getElementById(
      elementId
    );


  if (!element) {

    return;

  }


  element.innerText =

    "¥" +

    Number(
      value || 0
    )
      .toLocaleString();

}


// ==================================================
// 店舗売上取得
// ==================================================

async function loadStoreSales(

  startDate,
  endDate

) {

  try {

    const data =
      await fetchSales(
        startDate,
        endDate
      );


    const store =
      data.store || {

        onigiriSales: 0,
        bbqSales: 0,
        optionSales: 0,
        totalSales: 0,
        products: []

      };


    setSalesText(
      "onigiriSales",
      store.onigiriSales
    );


    setSalesText(
      "bbqSales",
      store.bbqSales
    );


    setSalesText(
      "optionSales",
      store.optionSales
    );


    setSalesText(
      "storeTotalSales",
      store.totalSales
    );


    displayProductSales(

      "storeProductSales",

      store.products || []

    );


    return {

      total:
        Number(
          store.totalSales || 0
        ),

      products:
        store.products || []

    };


  }
  catch (e) {

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


// ==================================================
// キッチンカー売上取得
// ==================================================

async function loadKitchenSales(

  startDate,
  endDate

) {

  try {

    const data =
      await fetchSales(
        startDate,
        endDate
      );


    const kitchen =
      data.kitchen || {

        totalSales: 0,
        products: []

      };


    const total =
      Number(
        kitchen.totalSales || 0
      );


    setSalesText(
      "kitchenTotalSales",
      total
    );


    displayProductSales(

      "kitchenProductSales",

      kitchen.products || []

    );


    updateTotalSales(
      total
    );


    return {

      total,

      products:
        kitchen.products || []

    };


  }
  catch (e) {

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


// ==================================================
// 総合売上更新
// ==================================================

function updateTotalSales(
  kitchenTotal
) {

  const storeElement =
    document.getElementById(
      "storeTotalSales"
    );


  let storeTotal = 0;


  if (storeElement) {

    storeTotal =
      Number(

        storeElement
          .innerText
          .replace(
            /[^0-9]/g,
            ""
          )

      ) || 0;

  }


  setSalesText(
    "totalStoreSales",
    storeTotal
  );


  setSalesText(
    "totalKitchenSales",
    kitchenTotal
  );


  setSalesText(

    "grandTotalSales",

    storeTotal +
    Number(
      kitchenTotal || 0
    )

  );

}


// ==================================================
// 商品別売上表示
// ==================================================

function displayProductSales(

  targetId,
  products

) {

  const area =
    document.getElementById(
      targetId
    );


  if (!area) {

    return;

  }


  area.innerHTML = "";


  if (
    !products ||
    !Array.isArray(products) ||
    products.length === 0
  ) {

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
            ).toLocaleString()}
          </td>

        </tr>
        `;

    }
  );

}


// ==================================================
// HTMLエスケープ
// ==================================================

function escapeHtml(
  value
) {

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


// ==================================================
// キッチンカー商品別表示
// ==================================================

function displayKitchenProducts(

  products

) {

  displayProductSales(

    "kitchenProductSales",

    products

  );

}


// ==================================================
// 総合商品集計
// ==================================================

function mergeProducts(

  storeProducts,
  kitchenProducts

) {

  const result = {};


  [

    ...(Array.isArray(
      storeProducts
    )
      ? storeProducts
      : []),

    ...(Array.isArray(
      kitchenProducts
    )
      ? kitchenProducts
      : [])

  ]
    .forEach(
      item => {

        const name =
          item.name || "";


        if (
          !result[name]
        ) {

          result[name] = {

            name,

            qty: 0,

            amount: 0

          };

        }


        result[name].qty +=

          Number(
            item.qty || 0
          );


        result[name].amount +=

          Number(
            item.amount || 0
          );

      }
    );


  return Object.values(
    result
  );

}


// ==================================================
// CSV出力
// ==================================================

async function downloadSalesCSV() {

  const startDate =
    document
      .getElementById(
        "startDate"
      )
      ?.value || "";


  const endDate =
    document
      .getElementById(
        "endDate"
      )
      ?.value || "";


  if (
    !startDate ||
    !endDate
  ) {

    alert(
      "期間を指定してください"
    );

    return;

  }


  const token =
    localStorage.getItem(
      "adminToken"
    );


  if (!token) {

    alert(
      "管理者認証がありません"
    );

    return;

  }


  try {

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


    const text =
      await res.text();


    console.log(
      "SALES CSV STATUS =",
      res.status
    );

    console.log(
      "SALES CSV RAW =",
      text
    );


    let data;


    try {

      data =
        JSON.parse(
          text
        );

    }
    catch (e) {

      throw new Error(
        "CSV APIのレスポンスがJSONではありません"
      );

    }


    if (!res.ok) {

      throw new Error(

        data.message ||
        data.error ||
        (
          "CSV APIエラー HTTP " +
          res.status
        )

      );

    }


    if (
      !data.success
    ) {

      alert(
        data.message ||
        "CSV作成失敗"
      );

      return;

    }


    if (
      !Array.isArray(
        data.csv
      )
    ) {

      throw new Error(
        "CSVデータが正しくありません"
      );

    }


    const csv =

      data.csv
        .map(
          row =>

            row
              .map(
                value =>

                  `"${String(
                    value ?? ""
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


    document.body.appendChild(
      a
    );


    a.click();


    a.remove();


    URL.revokeObjectURL(
      url
    );


  }
  catch (e) {

    console.error(
      "CSV出力エラー",
      e
    );


    alert(
      "CSV作成中にエラーが発生しました\n\n" +
      e.message
    );

  }

}
