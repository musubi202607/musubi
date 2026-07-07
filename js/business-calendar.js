```javascript
// =========================
// 営業日カレンダー取得
// =========================
async function loadBusinessCalendar(){

  try{

    const response =
      await fetch(
        API_URL + "/api/calendar"
      );

    const data =
      await response.json();

    let html = "";

    data.forEach(row=>{

      html += `

<tr>

<td>

${row.date}

</td>

<td>

<select
id="status-${row.date}">

<option
value="営業日"
${row.status==="営業日"?"selected":""}>

営業日

</option>

<option
value="店休日"
${row.status==="店休日"?"selected":""}>

店休日

</option>

</select>

</td>

<td>

<button
onclick="saveBusinessCalendar('${row.date}')">

保存

</button>

</td>

</tr>

`;

    });

    document.getElementById(
      "businessCalendarBody"
    ).innerHTML = html;

  }catch(e){

    console.error(e);

    alert("営業日取得エラー");

  }

}

// =========================
// 営業日保存
// =========================
async function saveBusinessCalendar(date){

  try{

    const status =
      document.getElementById(
        "status-"+date
      ).value;

    const res =
      await fetch(

        API_URL +
        "/api/calendar",

        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({

            date,

            status

          })

        }

      );

    const result =
      await res.json();

    if(result.success){

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

// 初期表示
loadBusinessCalendar();
```
