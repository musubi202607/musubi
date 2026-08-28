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



for(
let y =
now.getFullYear();

y >=
2025;

y--
){


const option =
document.createElement(
"option"
);


option.value =
y;


option.textContent =
y+"年";


year.appendChild(
option
);


}



year.value =
now.getFullYear();



document
.getElementById(
"search-button"
)
.addEventListener(

"click",

loadReceipts

);



loadReceipts();



}

);





// =========================
// 一覧取得
// =========================

async function loadReceipts(){



const year =
document.getElementById(
"search-year"
)
.value;



const month =
document.getElementById(
"search-month"
)
.value;




const url =

`${API_URL}/api/receipts?year=${year}&month=${month}`;





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



displayReceipts(
result.data || []
);



}

catch(error){


console.error(
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
// 表示
// =========================

function displayReceipts(data){



const area =

document.getElementById(
"receipt-list"
);





if(!data.length){


area.innerHTML =
"データがありません";


return;


}





area.innerHTML = "";





data.forEach(
(item)=>{


const div =

document.createElement(
"div"
);



div.className =
"receipt-card";



div.innerHTML =

`

<div>

<b>${item.date}</b>

</div>


<div>
${item.supplier}
</div>


<div>
${item.category}
</div>


<div>
${Number(item.amount).toLocaleString()}
円
</div>


<div>
${item.paymentMethod || ""}
</div>


<div>

<a
href="${item.imageUrl}"
target="_blank"
>
画像
</a>

</div>

`;




area.appendChild(
div
);



}

);



}

// =========================
// CSV出力
// =========================

async function exportReceiptCSV(){


  const year =
    document.getElementById(
      "search-year"
    ).value;


  const month =
    document.getElementById(
      "search-month"
    ).value;



  const response =
    await fetch(

      `${API_URL}/api/receipt-csv?year=${year}&month=${month}`

    );



  const data =
    await response.json();



  if(
    !data.success
  ){

    alert(
      "CSV取得失敗"
    );

    return;

  }



  const csv =
    data.data
      .map(row=>{

        return row
          .map(value=>{

            if(value === null ||
               value === undefined){

              return "";

            }


            return '"' +
              String(value)
              .replace(/"/g,'""')
              +
              '"';

          })
          .join(",");


      })
      .join("\n");



  const bom =
    "\uFEFF";


  const blob =
    new Blob(
      [
        bom + csv
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
    "領収書一覧.csv";


  a.click();


  URL.revokeObjectURL(
    url
  );


}



// =========================
// CSVボタン
// =========================

document
.getElementById(
  "csv-button"
)
.addEventListener(
  "click",
  exportReceiptCSV
);
