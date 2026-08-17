// ==================================================
// dashboard.js
// ダッシュボード Ver.2.0
// ==================================================

// =========================
// 初期設定
// =========================

let dashboardData = {};

let autoReloadTimer = null;

// =========================
// 初期化
// =========================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    loadDashboard();

    startAutoReload();

  }
);

// =========================
// 数値変換
// =========================

function safeNumber(value){

  const num =
    Number(value);

  return Number.isFinite(num)
    ? num
    : 0;

}

// =========================
// 金額表示
// =========================

function formatYen(value){

  return (
    "¥" +
    Math.round(
      safeNumber(value)
    ).toLocaleString()
  );

}

// =========================
// 日付表示
// =========================

function updateToday(){

  const target =
    document.getElementById(
      "dashboardDate"
    );

  if(!target){
    return;
  }

  const now =
    new Date();

  target.innerText =
    now.toLocaleDateString(
      "ja-JP",
      {
        year:"numeric",
        month:"long",
        day:"numeric",
        weekday:"long"
      }
    );

}

// =========================
// 更新時刻
// =========================

function updateLastUpdate(){

  const target =
    document.getElementById(
      "lastUpdate"
    );

  if(!target){
    return;
  }

  const now =
    new Date();

  target.innerText =
    now.toLocaleTimeString(
      "ja-JP",
      {
        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit"
      }
    );

}

// =========================
// テキスト表示
// =========================

function setText(id,value){

  const el =
    document.getElementById(id);

  if(!el){
    return;
  }

  el.innerText =
    value;

}

// =========================
// 金額表示
// =========================

function setMoney(id,value){

  const el =
    document.getElementById(id);

  if(!el){
    return;
  }

  el.innerText =
    formatYen(value);

}

// =========================
// HTMLエスケープ
// =========================

function escapeHtml(value){

  return String(value ?? "")

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
// ダッシュボード取得
// =========================

async function loadDashboard(){

  try{

    updateToday();

    const token =
      localStorage.getItem(
        "adminToken"
      );

    if(!token){

      alert(
        "ログインしてください。"
      );

      location.href =
        "login.html";

      return;

    }

    const response =
      await fetch(

        API_URL +
        "/api/dashboard",

        {

          headers:{

            Authorization:
              "Bearer " +
              token

          }

        }

      );

    if(response.status === 401){

      alert(
        "ログイン期限が切れました。"
      );

      location.href =
        "login.html";

      return;

    }

    if(!response.ok){

      throw new Error(
        "Dashboard API Error : " +
        response.status
      );

    }

    const data =
      await response.json();

    dashboardData =
      data || {};

    // =====================
    // 今日の状況
    // =====================

    renderTodayStatus(
      dashboardData
    );

    // =====================
    // 売上
    // =====================

    renderSalesSummary(
      dashboardData
    );

    // =====================
    // 人気商品
    // =====================

    renderTopProducts(
      dashboardData.topProducts || []
    );

    // =====================
    // BBQ状況
    // =====================

    renderBBQStatus(
      dashboardData
    );

    // =====================
    // 会計待ち
    // =====================

    renderWaitingPayment(
      dashboardData.waitingPayment || []
    );

    // =====================
    // お知らせ
    // =====================

    renderNotice(
      dashboardData.notice || []
    );

    updateLastUpdate();

  }

  catch(error){

    console.error(
      "Dashboard Error",
      error
    );

    alert(
      "ダッシュボード取得に失敗しました。"
    );

  }

}

// =========================
// 売上カード更新
// =========================
function updateSalesCards(data){

  setText(
    "bbqSales",
    formatYen(data.bbqSales)
  );

  setText(
    "optionSales",
    formatYen(data.optionSales)
  );

  setText(
    "onigiriSales",
    formatYen(data.onigiriSales)
  );

  setText(
    "totalSales",
    formatYen(data.totalSales)
  );

  setText(
    "todayProfit",
    formatYen(data.todayProfit)
  );

}

// =========================
// KPI更新
// =========================
function updateKpi(data){

  setText(
    "reservationCount",
    data.reservationCount || 0
  );

  setText(
    "checkedInCount",
    data.checkedInCount || 0
  );

  setText(
    "bbqUnpaidCount",
    data.bbqUnpaidCount || 0
  );

  setText(
    "onigiriUnpaidCount",
    data.onigiriUnpaidCount || 0
  );

  setText(
    "todayOrders",
    data.todayOrders || 0
  );

  setText(
    "averagePrice",
    formatYen(data.averagePrice)
  );

}

// =========================
// 営業状況
// =========================
function updateStatus(data){

  const status =
    document.getElementById(
      "businessStatus"
    );

  if(!status){
    return;
  }

  if(data.businessOpen){

    status.textContent =
      "営業中";

    status.className =
      "status-open";

  }else{

    status.textContent =
      "営業時間外";

    status.className =
      "status-close";

  }

}

// =========================
// ランキング
// =========================
function updateRanking(data){

  const tbody =
    document.getElementById(
      "rankingTable"
    );

  if(!tbody){
    return;
  }

  tbody.innerHTML = "";

  const list =
    Array.isArray(
      data.topProducts
    )
      ? data.topProducts
      : [];

  if(list.length === 0){

    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          データがありません
        </td>
      </tr>
    `;

    return;

  }

  list.forEach(
    (item,index)=>{

      tbody.innerHTML += `
        <tr>
          <td>${index+1}</td>
          <td>${item.name}</td>
          <td>${item.qty}個</td>
          <td>${formatYen(item.amount)}</td>
        </tr>
      `;

    }
  );

}

// =========================
// 最近の注文
// =========================
function updateRecentOrders(data){

  const tbody =
    document.getElementById(
      "recentOrdersTable"
    );

  if(!tbody){
    return;
  }

  tbody.innerHTML = "";

  const list =
    Array.isArray(
      data.recentOrders
    )
      ? data.recentOrders
      : [];

  if(list.length === 0){

    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          最近の注文はありません
        </td>
      </tr>
    `;

    return;

  }

  list.forEach(item=>{

    tbody.innerHTML += `
      <tr>
        <td>${item.time || ""}</td>
        <td>${item.name || ""}</td>
        <td>${item.product || ""}</td>
        <td>${item.qty || 0}</td>
        <td>${formatYen(item.amount)}</td>
      </tr>
    `;

  });

}

// =========================
// お知らせ
// =========================
function updateNotices(data){

  const area =
    document.getElementById(
      "dashboardNotice"
    );

  if(!area){
    return;
  }

  area.innerHTML = "";

  const notices = [];

  if((data.bbqUnpaidCount || 0) > 0){

    notices.push(
      `BBQ未会計が ${data.bbqUnpaidCount} 件あります`
    );

  }

  if((data.onigiriUnpaidCount || 0) > 0){

    notices.push(
      `おにぎり未会計が ${data.onigiriUnpaidCount} 件あります`
    );

  }

  if((data.reservationCount || 0) > 10){

    notices.push(
      `本日の予約が多くなっています`
    );

  }

  if(notices.length === 0){

    area.innerHTML = `
      <div class="notice-item ok">
        本日対応が必要な通知はありません
      </div>
    `;

    return;

  }

  notices.forEach(text=>{

    area.innerHTML += `
      <div class="notice-item warning">
        ${text}
      </div>
    `;

  });

}

// =========================
// 更新日時
// =========================
function updateLastUpdate(){

  const elm =
    document.getElementById(
      "lastUpdate"
    );

  if(!elm){
    return;
  }

  const now =
    new Date();

  elm.textContent =
    now.toLocaleTimeString(
      "ja-JP",
      {
        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit"
      }
    );

}

// =========================
// 初期化
// =========================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    loadDashboard();

    setInterval(
      loadDashboard,
      60000
    );

  }
);

// =========================
// ボタン
// =========================

function openSales(){

  location.href =
    "admin-sales.html";

}

function openReservations(){

  location.href =
    "admin-reservations.html";

}

function openProducts(){

  location.href =
    "admin-products.html";

}

function openCalendar(){

  location.href =
    "admin-calendar.html";

}

function openKitchen(){

  location.href =
    "kitchen-index.html";

}

function openDashboard(){

  loadDashboard();

}

// =========================
// 共通
// =========================

function setText(id,value){

  const el =
    document.getElementById(id);

  if(el){

    el.innerText =
      value;

  }

}

function setMoney(id,value){

  setText(
    id,
    "¥" +
    Number(
      value || 0
    ).toLocaleString()
  );

}

// =========================
// エラー表示
// =========================

function showError(message){

  console.error(message);

  alert(
    "ダッシュボード取得エラー\n\n" +
    message
  );

}
