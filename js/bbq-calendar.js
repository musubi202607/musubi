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

  // 曜日
  const weeks=[
    "月",
    "火",
    "水",
    "木",
    "金",
    "土",
    "日"
  ];

  weeks.forEach(day=>{

    body.innerHTML +=
    `<div class="bbq-week">${day}</div>`;

  });

  // 月初
  const first =
    new Date(
      year,
      month,
      1
    );

  let start =
    first.getDay();

  start =
    start===0
    ? 6
    : start-1;

  for(
    let i=0;
    i<start;
    i++
  ){

    body.innerHTML +=
      `<div class="bbq-cell bbq-empty"></div>`;

  }

  const monthData =
    calendarData.filter(row=>{

      const d =
        new Date(row.date);

      return(

        d.getFullYear()===year &&

        d.getMonth()===month

      );

    });

  monthData.forEach(row=>{

    const d =
      new Date(row.date);

    const day =
      d.getDate();

    const today =
      new Date();

    const isToday =

      today.getFullYear()===d.getFullYear()

      &&

      today.getMonth()===d.getMonth()

      &&

      today.getDate()===d.getDate();

    body.innerHTML += `

<div

class="bbq-cell

${row.status==="×"
?"bbq-closed"
:""}

${isToday
?"bbq-today"
:""}"

onclick="openModal('${row.date}')">

<div class="bbq-date">

${day}

</div>

<div>

${
row.status==="○"

?'<span class="bbq-open">予約可</span>'

:'<span class="bbq-close">予約不可</span>'

}

</div>

<div class="bbq-limit">

最大 ${row.limit}組

</div>

</div>

`;

  });

}

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

  // 曜日
  const weeks=[
    "月",
    "火",
    "水",
    "木",
    "金",
    "土",
    "日"
  ];

  weeks.forEach(day=>{

    body.innerHTML +=
    `<div class="bbq-week">${day}</div>`;

  });

  // 月初
  const first =
    new Date(
      year,
      month,
      1
    );

  let start =
    first.getDay();

  start =
    start===0
    ? 6
    : start-1;

  for(
    let i=0;
    i<start;
    i++
  ){

    body.innerHTML +=
      `<div class="bbq-cell bbq-empty"></div>`;

  }

  const monthData =
    calendarData.filter(row=>{

      const d =
        new Date(row.date);

      return(

        d.getFullYear()===year &&

        d.getMonth()===month

      );

    });

  monthData.forEach(row=>{

    const d =
      new Date(row.date);

    const day =
      d.getDate();

    const today =
      new Date();

    const isToday =

      today.getFullYear()===d.getFullYear()

      &&

      today.getMonth()===d.getMonth()

      &&

      today.getDate()===d.getDate();

    body.innerHTML += `

<div

class="bbq-cell

${row.status==="×"
?"bbq-closed"
:""}

${isToday
?"bbq-today"
:""}"

onclick="openModal('${row.date}')">

<div class="bbq-date">

${day}

</div>

<div>

${
row.status==="○"

?'<span class="bbq-open">予約可</span>'

:'<span class="bbq-close">予約不可</span>'

}

</div>

<div class="bbq-limit">

最大 ${row.limit}組

</div>

</div>

`;

  });

}