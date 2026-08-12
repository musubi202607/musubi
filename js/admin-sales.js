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

    showSalesTab("store");

    // ページ表示直後のGAS/Worker初回接続が
    // 不安定になる場合があるため少し待ってから集計
    setTimeout(() => {
      setThisMonth();
    }, 500);

  }
);
// =========================
// タブ切替
// =========================

function showSalesTab(
  tab
) {

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
  // タブ切替時に再集計
  // =========================

  if (
    tab === "kitchen" ||
    tab === "total"
  ) {

    loadSales();

  }

}

// =========================
// 日付フォーマット
// =========================

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

// =========================
// 当日
// =========================

function setToday() {

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

function setThisMonth() {

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
        .value;

    const endDate =
      document
        .getElementById(
          "endDate"
        )
        .value;

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
    // 売上API
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
    // レスポンス確認
    // =========================

    const responseText =
      await res.text();

    console.log(
      "売上API status:",
      res.status
    );

    console.log(
      "売上API response:",
      responseText
    );

    if (!res.ok) {

      console.error(
        "売上APIエラー:",
        res.status,
        responseText
      );

      throw new Error(
        "売上APIエラー: " +
        res.status +
        " " +
        responseText
      );

    }

    let data;

    try {

      data =
        JSON.parse(
          responseText
        );

    } catch (jsonError) {

      console.error(
        "売上API JSON解析エラー:",
        jsonError
      );

      console.error(
        "受信内容:",
        responseText
      );

      throw new Error(
        "売上APIから正しいJSONが返っていません"
      );

    }

    // =========================
    // success:false の場合
    // =========================

    if (
      data &&
      data.success === false
    ) {

      console.error(
        "売上API success:false:",
        data
      );

      throw new Error(
        data.message ||
        "売上APIエラー"
      );

    }

    // =========================
    // データ構造確認
    // =========================

    if (
      !data ||
      !data.store ||
      !data.kitchen
    ) {

      console.error(
        "売上APIデータ構造エラー:",
        data
      );

      throw new Error(
        "売上データの形式が正しくありません"
      );

    }

    // =========================
    // 店舗
    // =========================

    const store =
      data.store || {};

    const storeProducts =
      Array.isArray(
        store.products
      )
        ? store.products
        : [];

    const storeOnigiriSales =
      Number(
        store.onigiriSales || 0
      );

    const storeBbqSales =
      Number(
        store.bbqSales || 0
      );

    const storeOptionSales =
      Number(
        store.optionSales || 0
      );

    const storeTotalSales =
      Number(
        store.totalSales || 0
      );

    const onigiriSales =
      document.getElementById(
        "onigiriSales"
      );

    if (onigiriSales) {

      onigiriSales.innerText =
        "¥" +
        storeOnigiriSales
          .toLocaleString();

    }

    const bbqSales =
      document.getElementById(
        "bbqSales"
      );

    if (bbqSales) {

      bbqSales.innerText =
        "¥" +
        storeBbqSales
          .toLocaleString();

    }

    const optionSales =
      document.getElementById(
        "optionSales"
      );

    if (optionSales) {

      optionSales.innerText =
        "¥" +
        storeOptionSales
          .toLocaleString();

    }

    const storeTotal =
      document.getElementById(
        "storeTotalSales"
      );

    if (storeTotal) {

      storeTotal.innerText =
        "¥" +
        storeTotalSales
          .toLocaleString();

    }

    // =========================
    // 店舗 商品別
    // =========================

    displayProductSales(

      "storeProductSales",

      storeProducts

    );

    // =========================
    // キッチンカー
    // =========================

    const kitchen =
      data.kitchen || {};

    const kitchenProducts =
      Array.isArray(
        kitchen.products
      )
        ? kitchen.products
        : [];

    const kitchenTotalSales =
      Number(
        kitchen.totalSales || 0
      );

    const kitchenTotal =
      document.getElementById(
        "kitchenTotalSales"
      );

    if (kitchenTotal) {

      kitchenTotal.innerText =
        "¥" +
        kitchenTotalSales
          .toLocaleString();

    }

    // =========================
    // キッチンカー 商品別
    // =========================

    displayProductSales(

      "kitchenProductSales",

      kitchenProducts

    );

    // =========================
    // 総合
    // =========================

    const total =
      data.total || {};

    const grandTotalSales =
      Number(
        total.totalSales ||
        (
          storeTotalSales +
          kitchenTotalSales
        )
      );

    const totalStore =
      document.getElementById(
        "totalStoreSales"
      );

    if (totalStore) {

      totalStore.innerText =
        "¥" +
        storeTotalSales
          .toLocaleString();

    }

    const totalKitchen =
      document.getElementById(
        "totalKitchenSales"
      );

    if (totalKitchen) {

      totalKitchen.innerText =
        "¥" +
        kitchenTotalSales
          .toLocaleString();

    }

    const grandTotal =
      document.getElementById(
        "grandTotalSales"
      );

    if (grandTotal) {

      grandTotal.innerText =
        "¥" +
        grandTotalSales
          .toLocaleString();

    }

    // =========================
    // 総合の商品別
    //
    // HTMLには
    // totalStoreProductSales
    // totalKitchenProductSales
    // が存在するので、
    // それぞれ表示する
    // =========================

    displayProductSales(

      "totalStoreProductSales",

      storeProducts

    );

    displayProductSales(

      "totalKitchenProductSales",

      kitchenProducts

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

// =========================
// 店舗売上取得
// =========================

async function loadStoreSales(
  startDate,
  endDate
) {

  try {

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

    const responseText =
      await res.text();

    if (!res.ok) {

      throw new Error(
        "売上APIエラー: " +
        res.status +
        " " +
        responseText
      );

    }

    const data =
      JSON.parse(
        responseText
      );

    const store =
      data.store || {};

    const products =
      Array.isArray(
        store.products
      )
        ? store.products
        : [];

    const total =
      Number(
        store.totalSales || 0
      );

    const onigiri =
      document.getElementById(
        "onigiriSales"
      );

    if (onigiri) {

      onigiri.innerText =
        "¥" +
        Number(
          store.onigiriSales || 0
        )
          .toLocaleString();

    }

    const bbq =
      document.getElementById(
        "bbqSales"
      );

    if (bbq) {

      bbq.innerText =
        "¥" +
        Number(
          store.bbqSales || 0
        )
          .toLocaleString();

    }

    const option =
      document.getElementById(
        "optionSales"
      );

    if (option) {

      option.innerText =
        "¥" +
        Number(
          store.optionSales || 0
        )
          .toLocaleString();

    }

    const storeTotal =
      document.getElementById(
        "storeTotalSales"
      );

    if (storeTotal) {

      storeTotal.innerText =
        "¥" +
        total.toLocaleString();

    }

    displayProductSales(
      "storeProductSales",
      products
    );

    return {

      total,

      products

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

// =========================
// キッチンカー売上取得
// =========================

async function loadKitchenSales(
  startDate,
  endDate
) {

  try {

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

    const responseText =
      await res.text();

    if (!res.ok) {

      throw new Error(
        "売上APIエラー: " +
        res.status +
        " " +
        responseText
      );

    }

    const data =
      JSON.parse(
        responseText
      );

    const kitchen =
      data.kitchen || {};

    const products =
      Array.isArray(
        kitchen.products
      )
        ? kitchen.products
        : [];

    const total =
      Number(
        kitchen.totalSales || 0
      );

    const kitchenTotal =
      document.getElementById(
        "kitchenTotalSales"
      );

    if (kitchenTotal) {

      kitchenTotal.innerText =
        "¥" +
        total.toLocaleString();

    }

    displayProductSales(

      "kitchenProductSales",

      products

    );

    return {

      total,

      products

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

// =========================
// 総合売上更新
// =========================

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

  const totalStore =
    document.getElementById(
      "totalStoreSales"
    );

  if (totalStore) {

    totalStore.innerText =
      "¥" +
      storeTotal
        .toLocaleString();

  }

  const totalKitchen =
    document.getElementById(
      "totalKitchenSales"
    );

  if (totalKitchen) {

    totalKitchen.innerText =
      "¥" +
      Number(
        kitchenTotal || 0
      )
        .toLocaleString();

  }

  const grandTotal =
    document.getElementById(
      "grandTotalSales"
    );

  if (grandTotal) {

    grandTotal.innerText =
      "¥" +
      (
        storeTotal +
        Number(
          kitchenTotal || 0
        )
      )
        .toLocaleString();

  }

}

// =========================
// 商品別売上表示
// =========================

function displayProductSales(
  targetId,
  products
) {

  const area =
    document.getElementById(
      targetId
    );

  if (!area) {

    console.warn(
      "商品別売上表示先が見つかりません:",
      targetId
    );

    return;

  }

  area.innerHTML = "";

  if (
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

      const tr =
        document.createElement(
          "tr"
        );

      const nameTd =
        document.createElement(
          "td"
        );

      const qtyTd =
        document.createElement(
          "td"
        );

      const amountTd =
        document.createElement(
          "td"
        );

      nameTd.textContent =
        item.name || "";

      qtyTd.textContent =
        Number(
          item.qty || 0
        ) +
        "個";

      amountTd.textContent =
        "¥" +
        Number(
          item.amount || 0
        )
          .toLocaleString();

      tr.appendChild(
        nameTd
      );

      tr.appendChild(
        qtyTd
      );

      tr.appendChild(
        amountTd
      );

      area.appendChild(
        tr
      );

    }
  );

}

// =========================
// キッチンカー商品別表示
// =========================

function displayKitchenProducts(
  products
) {

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
) {

  const result = {};

  [
    ...(Array.isArray(storeProducts)
      ? storeProducts
      : []),

    ...(Array.isArray(kitchenProducts)
      ? kitchenProducts
      : [])

  ]
    .forEach(
      item => {

        const name =
          item.name || "";

        if (!result[name]) {

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

// =========================
// CSV出力
// =========================

async function downloadSalesCSV() {

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

    const responseText =
      await res.text();

    if (!res.ok) {

      console.error(
        "CSV APIエラー:",
        res.status,
        responseText
      );

      alert(
        "CSV作成に失敗しました\n" +
        res.status
      );

      return;

    }

    const data =
      JSON.parse(
        responseText
      );

    if (
      !data.success
    ) {

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

    document.body.appendChild(
      a
    );

    a.click();

    document.body.removeChild(
      a
    );

    URL.revokeObjectURL(
      url
    );

  }
  catch (e) {

    console.error(
      "CSV出力エラー:",
      e
    );

    alert(
      "CSV作成中にエラーが発生しました"
    );

  }

}
