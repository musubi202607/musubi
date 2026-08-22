// =========================
// 会計管理
// accounting.js
// =========================


document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadExpenseSummary();

    loadExpenses();


    const csvBtn =
      document.getElementById(
        "csv-btn"
      );


    if(csvBtn){

      csvBtn.addEventListener(
        "click",
        downloadCSV
      );

    }

  }
);



// =========================
// 月別集計取得
// =========================
async function loadExpenseSummary(){

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    now.getMonth() + 1;



  const url =
    `${API_URL}/api/expenses?mode=summary&year=${year}&month=${month}`;



  try {


    const res =
      await fetch(url);


    const json =
      await res.json();



    if(!json.success){

      throw new Error(
        "集計取得失敗"
      );

    }



    renderExpenseSummary(
      json.data
    );



  }catch(error){

    console.error(
      "loadExpenseSummary error",
      error
    );

  }

}





// =========================
// 集計表示
// =========================
function renderExpenseSummary(data){


  const total =
    document.getElementById(
      "expense-total"
    );


  if(total){

    total.textContent =
      `${data.total.toLocaleString()}円`;

  }



  const list =
    document.getElementById(
      "expense-category-list"
    );


  if(!list){

    return;

  }



  list.innerHTML = "";



  data.items.forEach(item=>{


    const div =
      document.createElement(
        "div"
      );


    div.textContent =
      `${item.category}　${item.amount.toLocaleString()}円`;


    list.appendChild(div);


  });


}







// =========================
// 経費一覧取得
// =========================
async function loadExpenses(){


  try{


    const res =
      await fetch(
        `${API_URL}/api/expenses`
      );



    const json =
      await res.json();



    if(!json.success){

      throw new Error(
        "一覧取得失敗"
      );

    }



    renderExpenseList(
      json.data
    );



  }catch(error){

    console.error(
      "loadExpenses error",
      error
    );

  }

}






// =========================
// 一覧表示
// =========================
function renderExpenseList(data){


  const tbody =
    document.getElementById(
      "expense-list"
    );


  if(!tbody){

    return;

  }



  tbody.innerHTML = "";



  data.forEach(expense=>{


    const tr =
      document.createElement(
        "tr"
      );



    tr.innerHTML = `

      <td>
      ${expense.date}
      </td>

      <td>
      ${expense.supplier}
      </td>

      <td>
      ${expense.category}
      </td>

      <td>
      ${Number(expense.amount).toLocaleString()}円
      </td>

      <td>
      ${expense.businessType}
      </td>

    `;



    tr.onclick = ()=>{

      showExpenseDetail(
        expense
      );

    };



    tbody.appendChild(tr);


  });


}

// =========================
// CSV出力
// =========================
async function downloadCSV(){

  try{


    const res =
      await fetch(
        `${API_URL}/api/expenses?mode=csv`
      );


    const json =
      await res.json();



    if(!json.success){

      throw new Error(
        "CSV取得失敗"
      );

    }



    const csv =
      json.data
        .map(row => {

          return row
            .map(value => {

              const text =
                String(value ?? "");


              // カンマ・改行対策
              return `"${text.replace(/"/g,'""')}"`;

            })
            .join(",");

        })
        .join("\n");



    const blob =
      new Blob(
        [
          "\uFEFF" + csv
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
      "経費一覧.csv";


    a.click();



    URL.revokeObjectURL(
      url
    );



  }catch(error){

    console.error(
      "downloadCSV error",
      error
    );

    alert(
      "CSV出力に失敗しました"
    );

  }

}







// =========================
// 領収書詳細表示
// =========================
function showExpenseDetail(
  expense
){


  const section =
    document.getElementById(
      "expense-detail"
    );


  const area =
    document.getElementById(
      "detail-area"
    );


  if(
    !section ||
    !area
  ){

    return;

  }



  section.style.display =
    "block";



  area.innerHTML = `

    <p>
    No：
    ${expense.no}
    </p>


    <p>
    取引日：
    ${expense.date}
    </p>


    <p>
    取引先：
    ${expense.supplier}
    </p>


    <p>
    勘定科目：
    ${expense.category}
    </p>


    <p>
    金額：
    ${Number(expense.amount).toLocaleString()}円
    </p>


    <p>
    税額：
    ${Number(expense.tax || 0).toLocaleString()}円
    </p>


    <p>
    事業区分：
    ${expense.businessType}
    </p>


    <p>
    登録者：
    ${expense.user}
    </p>



    ${
      expense.imageUrl
      ?
      `
      <img
      src="${expense.imageUrl}"
      style="
      max-width:300px;
      "
      >
      `
      :
      ""
    }


    <h3>
    OCR全文
    </h3>


    <pre>
${expense.ocrText || ""}
    </pre>


  `;


}
