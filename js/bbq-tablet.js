// =====================================================
// bbq-tablet.js (PRODUCTION FINAL VERSION)
// =====================================================

// =========================
// API
// =========================
const API_URL = "/api/bbq";

// =========================
// 状態管理
// =========================
const state = {
  currentReservation: null,
  reservationCache: []
};

// =========================
// LocalStorage Keys
// =========================
const STORAGE_KEYS = {
  CURRENT_RESERVATION: "bbqCurrentReservation",
  CART_PREFIX: "bbqOptionCart_"
};

// =====================================================
// 初期起動
// =====================================================
window.onload = async function () {
  try {
    const productArea = document.getElementById("productArea");
    if (productArea) productArea.style.display = "none";

    // 商品読み込み（外部定義想定）
    if (typeof loadBbqOptions === "function") {
      await loadBbqOptions();
    } else {
      console.warn("loadBbqOptions is not defined");
    }

    await loadReservations();

    if (restoreCurrentReservation()) {
      await searchReservationByNo(state.currentReservation.reservationNo);
    } else {
      renderCart();
    }

  } catch (err) {
    console.error("Init error:", err);
  }
};

// =====================================================
// 予約保存・復元
// =====================================================
function saveCurrentReservation(reservation) {
  state.currentReservation = reservation;

  localStorage.setItem(
    STORAGE_KEYS.CURRENT_RESERVATION,
    JSON.stringify(reservation)
  );
}

function restoreCurrentReservation() {
  const json = localStorage.getItem(STORAGE_KEYS.CURRENT_RESERVATION);

  if (!json) {
    state.currentReservation = null;
    return false;
  }

  try {
    state.currentReservation = JSON.parse(json);
    return true;
  } catch (e) {
    console.error(e);
    state.currentReservation = null;
    return false;
  }
}

function clearCurrentReservation() {
  state.currentReservation = null;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_RESERVATION);
}

// =====================================================
// カート系
// =====================================================
function getCartKey() {
  if (!state.currentReservation) return null;
  return STORAGE_KEYS.CART_PREFIX + state.currentReservation.reservationNo;
}

function getCart() {
  const key = getCartKey();
  if (!key) return [];

  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  const key = getCartKey();
  if (!key) return;

  localStorage.setItem(key, JSON.stringify(cart));
}

function clearCart() {
  if (!state.currentReservation) return;

  if (!confirm("カートを空にしますか？")) return;

  localStorage.removeItem(getCartKey());
  renderCart();
}

// =====================================================
// 予約一覧
// =====================================================
async function loadReservations() {
  try {
    const res = await fetch(API_URL + "?mode=reservations");
    const data = await res.json();

    state.reservationCache = data || [];
    renderReservationList(state.reservationCache);

  } catch (err) {
    console.error(err);
    alert("予約一覧取得エラー");
  }
}

function renderReservationList(list) {
  const target = document.getElementById("reservationList");
  if (!target) return;

  const unpaid = list.filter(v => v.paid !== "済");

  if (unpaid.length === 0) {
    target.innerHTML = `<div class="product-card"><h3>本日の未会計予約はありません</h3></div>`;
    return;
  }

  let html = "";

  unpaid.forEach(item => {
    const selected =
      state.currentReservation &&
      state.currentReservation.reservationNo === item.reservationNo;

    const checked = item.status === "来店済";

    html += `
      <div class="reservation-card ${selected ? "selected" : ""}">
        <h3>${item.customerName}</h3>
        <p>${item.people}名</p>
        <p>${item.plan}</p>
        <p>${checked ? "🟢受付中" : "⚪受付前"}</p>

        <button class="btn btn-order"
          onclick="selectReservation('${item.reservationNo}')">
          ${selected ? "選択中" : "選択"}
        </button>

        ${checked ? "" : `
          <button class="btn btn-checkin"
            onclick="checkInReservation('${item.reservationNo}')">
            受付開始
          </button>
        `}
      </div>
    `;
  });

  target.innerHTML = html;
}

// =====================================================
// 予約操作
// =====================================================
async function selectReservation(no) {
  await searchReservationByNo(no);
}

function changeReservation() {
  if (!confirm("予約を変更しますか？")) return;

  clearCurrentReservation();
  localStorage.removeItem("currentReservationNo");

  document.getElementById("currentReservation").innerHTML =
    `<div class="empty-state"><h3>予約を選択してください</h3></div>`;

  document.getElementById("productArea").style.display = "none";

  renderReservationList(state.reservationCache);
  renderCart();
}

async function searchReservationByNo(no) {
  try {
    const res = await fetch(API_URL + "?mode=reservation&no=" + encodeURIComponent(no));
    const data = await res.json();

    if (!data) {
      alert("予約が見つかりません");
      return;
    }

    saveCurrentReservation(data);
    await displayReservation(data);

  } catch (err) {
    console.error(err);
    alert("予約取得エラー");
  }
}

async function checkInReservation(no) {
  if (!confirm("来店受付しますか？")) return;

  try {
    const res = await fetch(API_URL + "?mode=checkin&no=" + encodeURIComponent(no));
    const result = await res.json();

    if (!result.success) {
      alert(result.message || "受付失敗");
      return;
    }

    await loadReservations();
    await searchReservationByNo(no);

    alert("受付完了");

  } catch (err) {
    console.error(err);
    alert("通信エラー");
  }
}

// =====================================================
// 予約詳細表示
// =====================================================
async function displayReservation(data) {
  saveCurrentReservation(data);

  const history = await loadOrderHistory(data.reservationNo);

  const bbqPrice = Number(data.price || 0);
  const optionTotal = Number(history.total || 0);
  const grandTotal = bbqPrice + optionTotal;

  let historyHtml = "";

  if (history.items && history.items.length) {
    history.items.forEach(item => {
      historyHtml += `
        <tr>
          <td>${item.itemName}</td>
          <td>${item.qty}</td>
          <td>¥${Number(item.amount).toLocaleString()}</td>
        </tr>
      `;
    });
  } else {
    historyHtml = `<tr><td colspan="3">追加注文なし</td></tr>`;
  }

  const target = document.getElementById("currentReservation");
  if (!target) return;

  const checkedIn = data.status === "来店済";

  target.innerHTML = `
    <div class="current-header">
      <div class="current-status">
        ${checkedIn ? "受付中" : "受付前"}
      </div>

      <button class="btn btn-clear" onclick="changeReservation()">
        予約変更
      </button>
    </div>

    <div>${data.customerName} 様</div>
    <div>予約番号：${data.reservationNo}</div>
    <div>人数：${data.people}名</div>
    <div>プラン：${data.plan}</div>
    <div>状態：${data.status}</div>

    ${checkedIn ? "" : `
      <button class="btn btn-checkin"
        onclick="checkInReservation('${data.reservationNo}')">
        受付開始
      </button>
    `}

    <hr>

    <h3>追加注文履歴</h3>

    <table style="width:100%;border-collapse:collapse;">
      <tr><th>商品</th><th>数量</th><th>金額</th></tr>
      ${historyHtml}
    </table>

    <div class="current-total">
      <p>BBQ予約 ¥${bbqPrice.toLocaleString()}</p>
      <p>追加注文 ¥${optionTotal.toLocaleString()}</p>
      <h2>合計 ¥${grandTotal.toLocaleString()}</h2>
    </div>
  `;

  renderReservationList(state.reservationCache);
  renderCart();

  const productArea = document.getElementById("productArea");
  if (productArea) {
    productArea.style.display = checkedIn ? "block" : "none";
  }
}

// =====================================================
// カート操作
// =====================================================
function addBbqOption(id, name, price) {
  if (!state.currentReservation) {
    alert("予約を選択してください");
    return;
  }

  if (state.currentReservation.status !== "来店済") {
    alert("来店受付後に追加注文できます");
    return;
  }

  const cart = getCart();
  const existing = cart.find(i => String(i.id) === String(id));

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price: Number(price), qty: 1 });
  }

  saveCart(cart);
  renderCart();
}

function changeCartQty(id, diff) {
  let cart = getCart();

  const item = cart.find(p => String(p.id) === String(id));
  if (!item) return;

  item.qty += diff;

  if (item.qty <= 0) {
    cart = cart.filter(p => String(p.id) !== String(id));
  }

  saveCart(cart);
  renderCart();
}

// =====================================================
// カート表示
// =====================================================
function renderCart() {
  const target = document.getElementById("cartArea");
  if (!target) return;

  if (!state.currentReservation) {
    target.innerHTML = `<div class="product-card"><h3>予約を選択してください</h3></div>`;
    return;
  }

  const cart = getCart();

  if (cart.length === 0) {
    target.innerHTML = `<div class="product-card"><h3>カートは空です</h3></div>`;
    return;
  }

  let html = "";
  let total = 0;

  cart.forEach(item => {
    const subtotal = item.price * item.qty;
    total += subtotal;

    html += `
      <div class="product-card">
        <h3>${item.name}</h3>

        <div>
          <button onclick="changeCartQty('${item.id}',-1)">−</button>
          <strong>${item.qty}</strong>
          <button onclick="changeCartQty('${item.id}',1)">＋</button>
        </div>

        <div>¥${subtotal.toLocaleString()}</div>
      </div>
    `;
  });

  html += `<div class="cart-summary">合計 ¥${total.toLocaleString()}</div>`;
  target.innerHTML = html;
}

// =====================================================
// 送信
// =====================================================
async function sendTabletOrder() {
  if (!state.currentReservation) {
    alert("予約を選択してください");
    return;
  }

  if (state.currentReservation.status !== "来店済") {
    alert("来店受付後に注文できます");
    return;
  }

  const cart = getCart();

  if (cart.length === 0) {
    alert("商品がありません");
    return;
  }

  try {
    const params = new URLSearchParams({
      mode: "saveBbqOption",
      reservationNo: state.currentReservation.reservationNo,
      orderDate: state.currentReservation.useDate,
      customerName: state.currentReservation.customerName,
      memo: "",
      items: JSON.stringify(cart)
    });

    const res = await fetch(API_URL + "?" + params.toString());
    const result = await res.json();

    if (!result.success) {
      alert(result.message || "送信失敗");
      return;
    }

    alert("注文登録完了");

    clearCart();
    await searchReservationByNo(state.currentReservation.reservationNo);

  } catch (err) {
    console.error(err);
    alert("通信エラー");
  }
}

// =====================================================
// 注文履歴
// =====================================================
async function loadOrderHistory(no) {
  try {
    const res = await fetch(API_URL + "?mode=orderhistory&no=" + encodeURIComponent(no));
    return await res.json();
  } catch (err) {
    console.error(err);
    return { total: 0, items: [] };
  }
}