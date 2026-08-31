// =========================
// 領収書一覧
// receipt-list.js
// =========================


document.addEventListener(

"DOMContentLoaded",

()=>{


  const year =
    document.getElementById(
      "search-year"
    );


  const now =
    new Date();



  if(year){


    for(
      let y = now.getFullYear();
      y >= 2025;
      y--
    ){


      const option =
        document.createElement(
          "option"
        );


      option.value =
        y;


      option.textContent =
        y + "年";


      year.appendChild(
        option
      );


    }



    year.value =
      now.getFullYear();


  }




  const searchButton =
    document.getElementById(
      "search-button"
    );


  if(searchButton){

    searchButton.addEventListener(
      "click",
      loadReceipts
    );

  }





  const receiptCsvButton =
    document.getElementById(
      "receipt-csv-button"
    );


  if(receiptCsvButton){

    receiptCsvButton.addEventListener(
      "click",
      exportReceiptCSV
    );

  }





  const accountingCsvButton =
    document.getElementById(
      "accounting-csv-button"
    );


  if(accountingCsvButton){

    accountingCsvButton.addEventListener(
      "click",
      exportAccountingCSV
    );

  }





  loadReceipts();



});







// =========================
// 領収書一覧取得
// =========================

async function loadReceipts(){



  const year =
    document.getElementById(
      "search-year"
    )
    ?.value || "";



  const month =
    document.getElementById(
      "search-month"
    )
    ?.value || "";





  try{


    const response =

      await fetch(

        `${API_URL}/api/receipts?year=${year}&month=${month}`

      );





    const result =

      await response.json();





    console.log(

      "Receipt List",

      result

    );





    displayReceipts(

      result.data || []

    );





  }

  catch(error){



    console.error(

      "receipt list error",

      error

    );



    document

      .getElementById(
        "receipt-list"
      )

      .innerHTML =

      "取得失敗";



  }


}









// =========================
// 領収書表示
// =========================

function displayReceipts(data){

  const area =
    document.getElementById(
      "receipt-list"
    );

  if(!area){
    return;
  }

  if(!data.length){

    area.innerHTML =
      "データがありません";

    return;
  }

  area.innerHTML = "";

  data.forEach(item=>{

    const div =
      document.createElement(
        "div"
      );

    div.className =
      "receipt-card";

    const canceled =
       item.check === "取消";


    const confirmed =
       item.check === "確認済";

    div.innerHTML =

`
<div>
<b>${item.date || ""}</b>
${canceled ? '<span style="color:red;margin-left:10px;">【取消】</span>' : ""}
</div>

<div>
${item.supplier || ""}
</div>

<div>
${item.category || ""}
</div>

<div>
${Number(item.amount || 0).toLocaleString()}円
</div>

<div>
${item.paymentMethod || ""}
</div>

<div style="margin-top:10px;display:flex;gap:8px;">

${
item.imageUrl
?
`<a href="${item.imageUrl}" target="_blank">画像</a>`
:
""
}

${
!canceled
?
`<button onclick="cancelReceipt('${item.no}')">
取消
</button>`
:
""
}

</div>
`;

    area.appendChild(
      div
    );

  });

}

// =========================
// CSV共通ダウンロード
// =========================

function downloadCSV(

  data,

  filename

){



  const csv =

    data.map(row=>{


      return row.map(value=>{


        if(
          value === null ||
          value === undefined
        ){

          return "";

        }



        return '"' +

          String(value)
          .replace(
            /"/g,
            '""'
          )

          +

          '"';



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





  const link =

    document.createElement(
      "a"
    );





  link.href =
    url;



  link.download =
    filename;



  link.click();





  URL.revokeObjectURL(
    url
  );



}









// =========================
// 領収書CSV出力
// =========================

async function exportReceiptCSV(){



  const year =

    document.getElementById(
      "search-year"
    )
    ?.value || "";



  const month =

    document.getElementById(
      "search-month"
    )
    ?.value || "";





  try{



    const response =

      await fetch(

        `${API_URL}/api/receipt-csv?year=${year}&month=${month}`

      );





    const result =

      await response.json();





    if(!result.success){


      alert(
        "領収書CSV取得失敗"
      );


      return;


    }





    downloadCSV(

      result.data,

      "領収書一覧.csv"

    );




  }

  catch(error){


    console.error(
      error
    );


    alert(
      "領収書CSV出力失敗"
    );


  }



}









// =========================
// 会計CSV出力
// =========================

async function exportAccountingCSV(){



  try{



    const response =

      await fetch(

        `${API_URL}/api/accounting-csv`

      );





    const result =

      await response.json();





    if(!result.success){


      alert(
        "会計CSV取得失敗"
      );


      return;


    }





    downloadCSV(

      result.data,

      "会計データ.csv"

    );





  }

  catch(error){


    console.error(
      error
    );


    alert(
      "会計CSV出力失敗"
    );



  }



}

// =========================
// 領収書取消
// =========================

async function cancelReceipt(no){

  if(
    !confirm(
      "この領収書を取消しますか？"
    )
  ){
    return;
  }

  try{

    const response =
      await fetch(

        `${API_URL}/api/receipt-cancel`,

        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({
            no:no
          })

        }

      );

    const result =
      await response.json();

    if(!result.success){

      alert(
        "取消に失敗しました"
      );

      return;
    }

    alert(
      "取消しました"
    );

    loadReceipts();

  }
  catch(error){

    console.error(error);

    alert(
      "取消に失敗しました"
    );

  }

}
