let currentReservation = null;
let reservationCache = []; // ★キャッシュ追加（重要）

// =========================
// 起動
// =========================
window.onload = function () {

  loadReservations();
  loadBbqOptions();
  renderCart();

};

// =========================
// 予約一覧（POS最適化版）
// =========================
async function loadReservations() {

  try {

    const response =
      await fetch(API_URL + '?mode=reservations');

    const data =
      await response.json();

    reservationCache = data;

    renderReservationList(data);

  } catch (error) {

    console.error(error);
    alert('予約一覧取得エラー');

  }

}

// =========================
// 予約描画（分離して高速化）
// =========================
function renderReservationList(data) {

  const target =
    document.getElementById('reservationList');

  if (!target) return;

  target.innerHTML = '';

  if (!data || data.length === 0) {

    target.innerHTML = `
      <div class="reservation-card">
        <h3>本日の予約はありません</h3>
      </div>
    `;
    return;

  }

  // ★最大2組固定
  data.slice(0, 2).forEach(item => {

    const isSelected =
      currentReservation &&
      currentReservation.reservationNo === item.reservationNo;

    const isCheckedIn =
      item.status === "CHECKIN";

    const div = document.createElement("div");

    div.className =
      "reservation-card" +
      (isSelected ? " selected" : "") +
      (isCheckedIn ? " checked-in" : "");

    div.innerHTML = `
      <h3>${item.customerName}</h3>
      <p>予約番号：${item.reservationNo}</p>
      <p>${item.people}名 / ${item.plan}</p>
      <p>状態：${item.status || "未"}</p>

      <button
        class="btn btn-checkin"
        onclick="selectReservation('${item.reservationNo}')"
        ${isCheckedIn ? "disabled" : ""}
      >
        選択
      </button>

      <button
        class="btn btn-order"
        onclick="checkInReservation('${item.reservationNo}')"
        ${isCheckedIn ? "disabled" : ""}
      >
        受付
      </button>
    `;

    target.appendChild(div);

  });

}

// =========================
// 予約選択（統一処理）
// =========================
async function selectReservation(no) {

  const reservation =
    reservationCache.find(r => r.reservationNo === no);

  if (!reservation) {
    alert("予約が見つかりません");
    return;
  }

  currentReservation = reservation;

  renderCurrentReservation();

  // UI再描画（選択状態更新）
  renderReservationList(reservationCache);

}

// =========================
// 選択中表示
// =========================
function renderCurrentReservation() {

  const target =
    document.getElementById('currentReservation');

  if (!target || !currentReservation) return;

  target.innerHTML = `
    <div class="reservation-card selected">

      <h2>${currentReservation.customerName}</h2>

      <p>予約番号：${currentReservation.reservationNo}</p>
      <p>電話：${currentReservation.customerTel || "-"}</p>
      <p>人数：${currentReservation.people}名</p>
      <p>プラン：${currentReservation.plan}</p>

      <p><b>状態：${currentReservation.status}</b></p>

    </div>
  `;

}

// =========================
// 受付処理（安定版）
// =========================
async function checkInReservation(no) {

  if (!confirm("来店受付しますか？")) return;

  try {

    const response =
      await fetch(API_URL + '?mode=checkin&no=' + encodeURIComponent(no));

    const result =
      await response.json();

    if (result.success) {

      alert("受付完了");

      // ★状態更新だけ再取得
      loadReservations();

    } else {

      alert(result.message || "受付エラー");

    }

  } catch (error) {

    console.error(error);
    alert("通信エラー");

  }

}

// =========================
// 予約詳細検索（互換用）
// =========================
async function searchReservationByNo(no) {

  try {

    const response =
      await fetch(API_URL + '?mode=reservation&no=' + encodeURIComponent(no));

    const data =
      await response.json();

    if (!data) {
      alert("予約なし");
      return;
    }

    currentReservation = data;

    renderCurrentReservation();

  } catch (error) {

    console.error(error);
    alert("検索エラー");

  }

}