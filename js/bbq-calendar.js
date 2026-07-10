// =========================
// BBQカレンダー Ver2
// =========================

let calendarData = [];

let currentMonth = new Date();

currentMonth.setDate(1);

// =========================
// 初期化
// =========================
window.onload = async function(){

  await loadCalendar();

};

// =========================
// BBQ営業日取得
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
function renderCalendar(){

  const body =
    document.getElementById(
      "calendarBody"
    );

  body.innerHTML = "";

  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  document.getElementById(
    "monthTitle"
  ).textContent =
    `${year}年${month+1}月`;

  // -------------------------
  // 曜日
  // -------------------------

  const weeks = [
    "月",
    "火",
    "水",
    "木",
    "金",
    "土",
    "日"
  ];

  weeks.forEach(day=>{

    body.innerHTML += `
      <div class="bbq-week">
        ${day}
      </div>
    `;

  });

  // -------------------------
  // 月初の曜日
  // -------------------------

  const firstDay =
    new Date(
      year,
      month,
      1
    );

  let start =
    firstDay.getDay();

  // 月曜始まりへ変換
  start =
    start===0
    ? 6
    : start-1;

  // -------------------------
  // 空白セル
  // -------------------------

  for(
    let i=0;
    i<start;
    i++
  ){

    body.innerHTML +=
      `<div class="bbq-day bbq-empty"></div>`;

  }

  // -------------------------
  // 表示する月だけ抽出
  // -------------------------

  const monthData =
    calendarData.filter(row=>{

      const d =
        new Date(row.date);

      return (
        d.getFullYear()===year &&
        d.getMonth()===month
      );

    });

  // -------------------------
  // 日付カード
  // -------------------------

  monthData.forEach(row=>{

  const d =
    new Date(row.date);

  const day =
    d.getDate();

  body.innerHTML += `

<div class="bbq-day ${row.status==="×"?"bbq-closed":""}">

  <div class="bbq-date">
    ${day}
  </div>

  <div class="bbq-status">

    <select
      id="status-${row.date}">

      <option
        value="○"
        ${row.status==="○"?"selected":""}>
        予約可
      </option>

      <option
        value="×"
        ${row.status==="×"?"selected":""}>
        予約不可
      </option>

    </select>

  </div>

  <div class="bbq-limit">

    最大組数

    <br>

    <input
      type="number"
      min="0"
      id="limit-${row.date}"
      value="${row.limit}">

  </div>

  <button
    class="bbq-save"
    onclick="saveCalendar('${row.date}')">

    保存

  </button>

</div>

`;

});

}

// =========================
// 前月
// =========================
document
.getElementById("prevMonth")
.addEventListener(
"click",
()=>{

  currentMonth.setMonth(
    currentMonth.getMonth()-1
  );

  renderCalendar();

});

// =========================
// 次月
// =========================
document
.getElementById("nextMonth")
.addEventListener(
"click",
()=>{

  currentMonth.setMonth(
    currentMonth.getMonth()+1
  );

  renderCalendar();

});

// =========================
// 保存
// =========================
async function saveCalendar(date){

  try{

    const limit =
      Number(
        document.getElementById(
          "limit-"+date
        ).value
      );

    const status =
      limit>0
      ? "○"
      : "×";

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

            date,

            status,

            limit

          })

        }

      );

    const result =
      await res.json();

    if(result.success){

      const row =
        calendarData.find(r=>
          r.date===date
        );

      if(row){

        row.status =
          status;

        row.limit =
          limit;

      }

      renderCalendar();

      alert("保存しました");

    }else{

      alert(
        result.message ||
        "保存失敗"
      );

    }

  }catch(e){

    console.error(e);

    alert("通信エラー");

  }

}