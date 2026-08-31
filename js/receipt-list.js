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



  // =========================
  // 確認状態フィルター
  // =========================

  const check =
    document.getElementById(
      "search-check"
    )
    ?.value || "";



  const url =
    `${API_URL}/api/receipts` +
    `?year=${encodeURIComponent(year)}` +
    `&month=${encodeURIComponent(month)}` +
    `&check=${encodeURIComponent(check)}`;



  console.log(
    "Receipt Request URL",
    url
  );



  try{


    const response =
      await fetch(
        url
      );



    const result =
      await response.json();



    console.log(
      "Receipt List",
      result
    );



    if(!result.success){

      console.error(
        "receipt api error",
        result
      );


      document
        .getElementById(
          "receipt-list"
        )
        .innerHTML =
        "取得失敗";


      return;

    }



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
// 展開・明細表示対応
// =========================

function displayReceipts(data){

  const area=document.getElementById("receipt-list");

  if(!area)return;

  if(!data.length){
    area.innerHTML="データがありません";
    return;
  }

  area.innerHTML="";


  data.forEach(item=>{

    const div=document.createElement("div");
    div.className="receipt-card";


    const canceled=item.check==="取消";
    const confirmed=item.check==="確認済";


    let status="";

    if(canceled){
      status='<span style="color:red;margin-left:10px;">【取消】</span>';
    }
    else if(confirmed){
      status='<span style="color:green;margin-left:10px;">【確認済】</span>';
    }
    else{
      status='<span style="color:orange;margin-left:10px;">【未確認】</span>';
    }


    let detailHtml="";


    if(item.details && item.details.length){

      detailHtml+=`
      <div style="margin-top:10px;">
      <b>明細</b>
      `;

      item.details.forEach(detail=>{

        detailHtml+=`
        <div style="margin-top:5px;">
        ${detail.item || ""}
        ${detail.taxRate || ""}
        ${Number(detail.amount || 0).toLocaleString()}円
        ${detail.category || ""}
        </div>
        `;

      });

      detailHtml+=`
      </div>
      `;

    }



    div.innerHTML=`

<div>
<b>${item.date || ""}</b>
${status}
</div>


<div style="font-size:18px;font-weight:bold;margin-top:8px;">
${item.supplier || ""}
</div>


<div>
${item.category || ""}
</div>


<div style="font-size:18px;">
${Number(item.amount || 0).toLocaleString()}円
</div>


<div>
${item.paymentMethod || ""}
</div>



<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">

<button onclick="toggleReceiptDetail('${item.no}',this)">
詳細表示
</button>


${
!canceled && !confirmed
?
`
<button onclick="confirmReceipt('${item.no}')">
確認
</button>
`
:
""
}


${
!canceled
?
`
<button onclick="cancelReceipt('${item.no}')">
取消
</button>
`
:
""
}


</div>



<div id="detail-${item.no}"
style="display:none;margin-top:15px;padding:12px;background:#f5f5f5;border-radius:8px;">


<div>
<b>領収書番号：</b>${item.no || ""}
</div>


<div>
<b>税込金額：</b>${Number(item.amount || 0).toLocaleString()}円
</div>


<div>
<b>税額：</b>${Number(item.tax || 0).toLocaleString()}円
</div>


<div>
<b>税率：</b>${item.taxRate || ""}
</div>


<div>
<b>インボイス番号：</b>${item.invoiceNo || "なし"}
</div>


<div>
<b>登録者：</b>${item.registeredBy || ""}
</div>


<div style="margin-top:10px;">
<b>OCR内容</b><br>
${item.ocrText || ""}
</div>


${detailHtml}


${
item.imageUrl
?
`
<div style="margin-top:10px;">
<a href="${item.imageUrl}" target="_blank">
領収書画像を開く
</a>
</div>
`
:
""
}


</div>

`;

    area.appendChild(div);

  });

}



// =========================
// 詳細開閉
// =========================

function toggleReceiptDetail(no,button){

  const area=document.getElementById("detail-"+no);

  if(!area)return;


  if(area.style.display==="none"){

    area.style.display="block";

    if(button){
      button.textContent="閉じる";
    }

  }
  else{

    area.style.display="none";

    if(button){
      button.textContent="詳細表示";
    }

  }

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

async function confirmReceipt(no){

 if(
  !confirm(
   "確認済みにしますか？"
  )
 ){
  return;
 }


 try{

 const response =
 await fetch(
  `${API_URL}/api/receipt-confirm`,
  {
   method:"POST",
   headers:{
    "Content-Type":
     "application/json"
   },
   body:
    JSON.stringify({
     no:no
    })
  }
 );


 const result =
  await response.json();


 if(!result.success){

  alert(
   "確認失敗"
  );

  return;

 }


 alert(
  "確認しました"
 );


 loadReceipts();


 }
 catch(error){

 console.error(error);

 alert(
  "確認失敗"
 );

 }

}
