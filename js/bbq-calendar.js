// =========================
// BBQカレンダー管理 Ver2
// =========================

let calendarData = [];

let currentMonth = new Date();

currentMonth.setDate(1);

let editingDate = "";

// =========================
// 初期化
// =========================
window.onload = async function(){

  await loadCalendar();

  document
    .getElementById("prevMonth")
    .addEventListener(
      "click",
      prevMonth
    );

  document
    .getElementById("nextMonth")
    .addEventListener(
      "click",
      nextMonth
    );

  document
    .getElementById("closeModal")
    .addEventListener(
      "click",
      closeModal
    );

  document
    .getElementById("saveModal")
    .addEventListener(
      "click",
      saveCalendar
    );

};

// =========================
// データ取得
// =========================
async function loadCalendar(){

  try{

    const response =
      await fetch(
        API_URL +
        "/api/business-calendar"
      );

    calendarData =
      await response.json();

    renderCalendar();

  }catch(e){

    console.error(e);

    alert("取得エラー");

  }

}

// =========================
// カレンダー描画
// =========================
function renderCalendar() {

  const body = document.getElementById("calendarBody");
  body.innerHTML = "";

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  document.getElementById("monthTitle").textContent =
    `${year}年${month + 1}月`;

  // 曜日ヘッダ（日曜始まり）
  const weeks = ["日", "月", "火", "水", "木", "金", "土"];

  weeks.forEach(day => {
    body.innerHTML += `<div class="bbq-week">${day}</div>`;
  });

  // 月初と開始曜日
  const first = new Date(year, month, 1);
  const start = first.getDay();   // 0=日〜6=土

  // 空白セル
  for (let i = 0; i < start; i++) {
    body.innerHTML += `<div class="bbq-cell bbq-empty"></div>`;
  }

  // 月末日
  const last = new Date(year, month + 1, 0);
  const totalDays = last.getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1日〜月末までループ
  for (let day = 1; day <= totalDays; day++) {

    const dateObj = new Date(year, month, day);
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    // この日のデータを calendarData から探す
    const row = calendarData.find(r => r.date === dateStr);

    // 「今日」判定
    const isToday =
      today.getFullYear() === y &&
      today.getMonth() === dateObj.getMonth() &&
      today.getDate() === day;

    // デフォルト：平日は予約不可／limit 0
    let statusText = "予約不可";
    let limitText = "最大 0組";
    let cellClass = "bbq-cell bbq-closed";

    if (row) {
      // データがあればそれを優先
      if (row.status === "○") {
        statusText = "予約可";
        cellClass = "bbq-cell";
      } else {
        statusText = "予約不可";
        cellClass = "bbq-cell bbq-closed";
      }
      limitText = `最大 ${row.limit}組`;
    }

    if (isToday) {
      cellClass += " bbq-today";
    }

    body.innerHTML += `
      <div
        class="${cellClass}"
        onclick="openModal('${dateStr}')"
      >
        <div class="bbq-date">
          ${day}
        </div>
        <div>
          <span class="${statusText === "予約可" ? "bbq-open" : "bbq-close"}">
            ${statusText}
          </span>
        </div>
        <div class="bbq-limit">
          ${limitText}
        </div>
      </div>
    `;
  }
}

// =========================
// 編集モーダル表示
// =========================
function openModal(date){

  editingDate = date;

  const row =
    calendarData.find(r=>r.date===date);

  if(!row) return;

  document.getElementById(
    "modalDate"
  ).textContent = date;

  document.getElementById(
    "modalStatus"
  ).value = row.status;

  document.getElementById(
    "modalLimit"
  ).value = row.limit;

  document.getElementById(
    "editModal"
  ).style.display = "flex";

}

// =========================
// モーダル閉じる
// =========================
function closeModal(){

  document.getElementById(
    "editModal"
  ).style.display = "none";

}

// =========================
// 保存
// =========================
async function saveCalendar(){

  try{

    const status =
      document.getElementById(
        "modalStatus"
      ).value;

    const limit =
      Number(
        document.getElementById(
          "modalLimit"
        ).value
      );

    const res =
      await fetch(

        API_URL +
        "/api/business-calendar",

        {

          method:"POST",

          headers:{
            "Content-Type":
            "application/json"
          },

          body:JSON.stringify({

            mode:
            "updateBusinessCalendar",

            date:
              editingDate,

            status,

            limit

          })

        }

      );

    const result =
      await res.json();

    if(!result.success){

      alert(
        result.message ||
        "保存失敗"
      );

      return;

    }

    const row =
      calendarData.find(r=>
        r.date===editingDate
      );

    if(row){

      row.status = status;
      row.limit = limit;

    }

    closeModal();

    renderCalendar();

    alert("保存しました");

  }catch(e){

    console.error(e);

    alert("通信エラー");

  }

}

// =========================
// 前月
// =========================
function prevMonth(){

  currentMonth.setMonth(
    currentMonth.getMonth()-1
  );

  renderCalendar();

}

// =========================
// 次月
// =========================
function nextMonth(){

  currentMonth.setMonth(
    currentMonth.getMonth()+1
  );

  renderCalendar();

}

// =========================
// モーダル外クリック
// =========================
window.onclick = function(e){

  const modal =
    document.getElementById(
      "editModal"
    );

  if(e.target===modal){

    closeModal();

  }

};