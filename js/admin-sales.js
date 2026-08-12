// ==================================================
// admin-sales.js
// 売上確認 Ver.2.0
// ==================================================

let currentTab = "store";

// =========================
// 初期化
// =========================

window.addEventListener(
  "DOMContentLoaded",
  ()=>{

    setThisMonth();

    showSalesTab(
      "store"
    );

  }
);

// =========================
// タブ切替
// =========================

function showSalesTab(
  tab
){

  currentTab = tab;

  document
  .querySelectorAll(
    ".tab-content"
  )
  .forEach(el=>{

    el.classList.remove(
      "active"
    );

  });

  document
  .querySelectorAll(
    ".tab-btn"
  )
  .forEach(el=>{

    el.classList.remove(
      "active"
    );

  });

  if(tab==="store"){

    document
    .getElementById(
      "storeTab"
    )
    .classList.add(
      "active"
    );

    document
    .getElementById(
      "tabStore"
    )
    .classList.add(
      "active"
    );

  }

  if(tab==="kitchen"){

    document
    .getElementById(
      "kitchenTab"
    )
    .classList.add(
      "active"
    );

    document
    .getElementById(
      "tabKitchen"
    )
    .classList.add(
      "active"
    );

  }

  if(tab==="total"){

    document
    .getElementById(
      "totalTab"
    )
    .classList.add(
      "active"
    );

    document
    .getElementById(
      "tabTotal"
    )
    .classList.add(
      "active"
    );

  }

  if(
    tab === "kitchen" ||
    tab === "total"
  ){

    loadSales();

  }

}

// =========================
// 日付フォーマット
// =========================

function formatDate(
  date
){

  const y =
  date.getFullYear();

  const m =
  String(
    date.getMonth()+1
  )
  .padStart(
    2,
    "0"
  );

  const d =
  String(
    date.getDate()
  )
  .padStart(
    2,
    "0"
  );

  return (
    y+
    "-"+
    m+
    "-"+
    d
  );

}

// =========================
// 当日
// =========================

function setToday(){

  const today =
  new Date();

  document
  .getElementById(
    "startDate"
  )
  .value =
  formatDate(
    today
  );

  document
  .getElementById(
    "endDate"
  )
  .value =
  formatDate(
    today
  );

  loadSales();

}



// =========================
// 当月
// =========================

function setThisMonth(){

  const today =
  new Date();

  const start =
  new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  document
  .getElementById(
    "startDate"
  )
  .value =
  formatDate(
    start
  );

  document
  .getElementById(
    "endDate"
  )
  .value =
  formatDate(
    today
  );

  loadSales();

}



// =========================
// 前月
// =========================

function setLastMonth(){

  const today =
  new Date();

  const start =
  new Date(
    today.getFullYear(),
    today.getMonth()-1,
    1
  );

  const end =
  new Date(
    today.getFullYear(),
    today.getMonth(),
    0
  );

  document
  .getElementById(
    "startDate"
  )
  .value =
  formatDate(
    start
  );

  document
  .getElementById(
    "endDate"
  )
  .value =
  formatDate(
    end
  );

  loadSales();

}

// =========================
// 売上集計
// =========================
async function loadSales(){

  const loading =
  document.getElementById(
    "salesLoading"
  );

  if(loading){
    loading.classList.add(
      "show"
    );
  }

  try{

    const startDate =
    document
    .getElementById(
      "startDate"
    )
    .value;

    const endDate =
    document
    .getElementById(
      "endDate"
    )
    .value;

    if(
      !startDate ||
      !endDate
    ){

      alert(
        "期間を指定してください"
      );

      return;

    }

    // =========================
    // 売上取得
    // =========================

    const res =
    await fetch(

      API_URL +
      "/api/sales",

      {

        method:"POST",

        headers:{

          "Content-Type":
          "application/json",

          "Authorization":
          "Bearer " +
          localStorage.getItem(
            "adminToken"
          )

        },

        body:
        JSON.stringify({

          startDate,

          endDate

        })

      }

    );

    const data =
    await res.json();

    // =========================
    // 店舗
    // =========================

    document
    .getElementById(
      "onigiriSales"
    )
    .innerText =
    "¥" +
    Number(
      data.store.onigiriSales || 0
    )
    .toLocaleString();

    document
    .getElementById(
      "bbqSales"
    )
    .innerText =
    "¥" +
    Number(
      data.store.bbqSales || 0
    )
    .toLocaleString();

    document
    .getElementById(
      "optionSales"
    )
    .innerText =
    "¥" +
    Number(
      data.store.optionSales || 0
    )
    .toLocaleString();

    document
    .getElementById(
      "storeTotalSales"
    )
    .innerText =
    "¥" +
    Number(
      data.store.totalSales || 0
    )
    .toLocaleString();

    displayProductSales(

      "storeProductSales",

      data.store.products || []

    );

    // =========================
    // キッチンカー
    // =========================

    document
    .getElementById(
      "kitchenTotalSales"
    )
    .innerText =
    "¥" +
    Number(
      data.kitchen.totalSales || 0
    )
    .toLocaleString();

    displayProductSales(

      "kitchenProductSales",

      data.kitchen.products || []

    );

    // =========================
    // 総合
    // =========================

    document
    .getElementById(
      "totalStoreSales"
    )
    .innerText =
    "¥" +
    Number(
      data.store.totalSales || 0
    )
    .toLocaleString();

    document
    .getElementById(
      "totalKitchenSales"
    )
    .innerText =
    "¥" +
    Number(
      data.kitchen.totalSales || 0
    )
    .toLocaleString();

    document
    .getElementById(
      "grandTotalSales"
    )
    .innerText =
    "¥" +
    Number(
      data.total.totalSales || 0
    )
    .toLocaleString();

    displayProductSales(

      "totalProductSales",

      mergeProducts(

        data.store.products,

        data.kitchen.products

      )

    );

  }
  catch(e){

    console.error(
      "売上集計エラー",
      e
    );

    alert(
      "売上取得中にエラーが発生しました"
    );

  }
  finally{

    if(loading){

      loading.classList.remove(
        "show"
      );

    }

  }

}

// =========================
// 店舗売上取得
// =========================

async function loadStoreSales(

startDate,

endDate

){

try{

const res =
await fetch(

API_URL+
"/api/sales",

{

method:"POST",

headers:{

"Content-Type":
"application/json",

"Authorization":
"Bearer "+
localStorage.getItem(
"adminToken"
)

},

body:

JSON.stringify({

startDate,

endDate

})

}

);

const data =
await res.json();

document
.getElementById(
"onigiriSales"
)
.innerText =

"¥"+
Number(
data.store.onigiriSales || 0
)
.toLocaleString();

document
.getElementById(
"bbqSales"
)
.innerText =

"¥"+
Number(
data.store.bbqSales || 0
)
.toLocaleString();

document
.getElementById(
"optionSales"
)
.innerText =

"¥"+
Number(
data.store.optionSales || 0
)
.toLocaleString();

document
.getElementById(
"storeTotalSales"
)
.innerText =

"¥"+
Number(
data.store.totalSales || 0
)
.toLocaleString();

// =========================
// 商品別表示
// =========================

displayProductSales(

"storeProductSales",

data.store.products

);

return{

total:
Number(
data.store.totalSales || 0
),

products:

data.store.products || []

};

}catch(e){

console.error(
"店舗売上取得エラー",
e
);

return{

total:0,

products:[]

};

}

}

// =========================
// キッチンカー売上取得
// =========================

async function loadKitchenSales(

startDate,

endDate

){

try{

const res =

await fetch(

API_URL+
"/api/sales",

{

method:"POST",

headers:{

"Content-Type":
"application/json",

"Authorization":
"Bearer "+
localStorage.getItem(
"adminToken"
)

},

body:

JSON.stringify({

startDate,

endDate

})

}

);

const data =

await res.json();

const total =

Number(
data.kitchen.totalSales || 0
);

document
.getElementById(
"kitchenTotalSales"
)
.innerText =

"¥"+
total.toLocaleString();

// =========================
// 商品別表示
// =========================

displayProductSales(

"kitchenProductSales",

data.kitchen.products

);

updateTotalSales(

total

);

return{

total,

products:

data.kitchen.products || []

};

}catch(e){

console.error(
"キッチンカー売上取得エラー",
e
);

return{

total:0,

products:[]

};

}

}

// =========================
// 総合売上更新
// =========================

function updateTotalSales(

kitchenTotal

){

const storeTotal =

Number(

document
.getElementById(
"storeTotalSales"
)
.innerText
.replace(
/[^0-9]/g,
""
)

||0

);

document
.getElementById(
"totalStoreSales"
)
.innerText =

"¥"+
storeTotal.toLocaleString();

document
.getElementById(
"totalKitchenSales"
)
.innerText =

"¥"+
Number(
kitchenTotal
)
.toLocaleString();

document
.getElementById(
"grandTotalSales"
)
.innerText =

"¥"+
(
storeTotal
+
Number(kitchenTotal)
)
.toLocaleString();

}

// =========================
// 商品別売上表示
// =========================

function displayProductSales(

targetId,

products

){

const area =

document.getElementById(
targetId
);

if(!area){

return;

}

area.innerHTML = "";

if(
!products ||
products.length===0
){

area.innerHTML =

`
<tr>
<td colspan="3">
データがありません
</td>
</tr>
`;

return;

}

products.forEach(item=>{

area.innerHTML +=

`

<tr>

<td>
${item.name}
</td>

<td>
${Number(item.qty || 0)}
個
</td>

<td>
¥${Number(item.amount || 0)
.toLocaleString()}
</td>

</tr>

`;

});

}

// =========================
// キッチンカー商品別表示
// =========================

function displayKitchenProducts(

products

){

displayProductSales(

"kitchenProductSales",

products

);

}

// =========================
// 総合商品集計
// =========================

function mergeProducts(

storeProducts,

kitchenProducts

){

const result = {};

[
...(storeProducts || []),
...(kitchenProducts || [])
]
.forEach(item=>{

if(!result[item.name]){

result[item.name]={

name:item.name,

qty:0,

amount:0

};

}

result[item.name].qty +=

Number(item.qty || 0);

result[item.name].amount +=

Number(item.amount || 0);

});

return Object.values(result);

}

// =========================
// CSV出力
// =========================

async function downloadSalesCSV(){

const startDate =

document
.getElementById(
"startDate"
)
.value;

const endDate =

document
.getElementById(
"endDate"
)
.value;

const token =

localStorage.getItem(
"adminToken"
);

const res =

await fetch(

API_URL+
"/api/sales/csv",

{

method:"POST",

headers:{

"Content-Type":
"application/json",

"Authorization":
"Bearer "+token

},

body:

JSON.stringify({

startDate,

endDate

})

}

);

const data =

await res.json();

if(
!data.success
){

alert(
"CSV作成失敗"
);

return;

}

const csv =

data.csv
.map(row=>

row.map(value=>

`"${String(value)
.replace(/"/g,'""')}"`

)
.join(",")

)
.join("\n");

const blob =

new Blob(

[

"\uFEFF"+
csv

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

a.href=url;

a.download=

"売上履歴_"+
startDate+
"_"+
endDate+
".csv";

a.click();

URL.revokeObjectURL(
url
);

}
