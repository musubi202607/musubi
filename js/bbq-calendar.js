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

    data.forEach(row=>{

      html += `
<tr>

<td>${row.date}</td>

<td>

<select id="status-${row.date}">

<option value="○"
${row.status==="○"?"selected":""}>

予約可

</option>

<option value="×"
${row.status==="×"?"selected":""}>

予約不可

</option>

</select>

</td>

<td>

<input
type="number"
min="0"
id="limit-${row.date}"
value="${row.limit}">

</td>

<td>

<button
onclick="saveCalendar('${row.date}')">

保存

</button>

</td>

</tr>
`;

    });

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