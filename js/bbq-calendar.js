// =========================
// BBQ営業日一覧取得
// =========================
async function loadCalendar(){

  try{

    const response =
      await fetch(
        API_URL + "/api/business-calendar"
      );

    const data =
      await response.json();

    let html = "";

// 曜日
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

  html += `
<div class="bbq-week">

${day}

</div>
`;

});

// データが無い場合
if(data.length===0){

  document.getElementById(
    "calendarBody"
  ).innerHTML = html;

  return;

}

// 日付順
data.sort((a,b)=>{

  return new Date(a.date)
    - new Date(b.date);

});

// 月タイトル
const firstDate =
  new Date(data[0].date);

document.getElementById(
  "monthTitle"
).textContent =
`${firstDate.getFullYear()}年${firstDate.getMonth()+1}月`;

// 月初曜日
const monthStart =
  new Date(
    firstDate.getFullYear(),
    firstDate.getMonth(),
    1
  );

let start =
  monthStart.getDay();

start =
  start===0
  ? 6
  : start-1;

// 空白
for(
  let i=0;
  i<start;
  i++
){

  html += `
<div class="bbq-day bbq-empty">

</div>
`;

}

// 日付
data.forEach(row=>{

  const d =
    new Date(row.date);

  const day =
    d.getDate();

  html += `

<div class="bbq-day
${row.status==="×"
?"bbq-closed"
:""}">

<div class="bbq-date">

${day}

</div>

<div class="bbq-status">

<select
id="status-${row.date}">

<option
value="○"
${row.status==="○"
?"selected"
:""}>

予約可

</option>

<option
value="×"
${row.status==="×"
?"selected"
:""}>

予約不可

</option>

</select>

</div>

<div class="bbq-limit">

<input
type="number"
min="0"
id="limit-${row.date}"
value="${row.limit}">

組

</div>

<button
class="bbq-save"
onclick="saveCalendar('${row.date}')">

保存

</button>

</div>

`;

});

document.getElementById(
"calendarBody"
).innerHTML = html;

    document.getElementById(
      "calendarBody"
    ).innerHTML = html;

  }catch(e){

    console.error(e);

    alert("取得エラー");

  }

}

// =========================
// 保存
// =========================
async function saveCalendar(date){

  try{

    let limit =
      Number(
        document.getElementById(
          "limit-"+date
        ).value
      );

    let status =
      limit<=0
      ? "×"
      : "○";

    document.getElementById(
      "status-"+date
    ).value = status;

    const res =
      await fetch(

        API_URL +
        "/api/business-calendar",

        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({

            mode:"updateBusinessCalendar",

            date,
            status,
            limit

          })

        }

      );

    const result =
      await res.json();

    if(result.success){

      alert("保存しました");

    }else{

      alert(result.message);

    }

  }catch(e){

    console.error(e);

    alert("通信エラー");

  }

}

loadCalendar();