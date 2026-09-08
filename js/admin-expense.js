// =========================
// 経費集計
// admin-expense.js
// =========================

document.addEventListener("DOMContentLoaded",()=>{

const now=new Date();
const year=document.getElementById("search-year");

for(let y=now.getFullYear();y>=2025;y--){

const option=document.createElement("option");
option.value=y;
option.textContent=y+"年";
year.appendChild(option);

}

year.value=now.getFullYear();

document.getElementById("search-month").value=
now.getMonth()+1;


document.getElementById("search-button")
.addEventListener(
"click",
loadSummary
);


loadSummary();

});


// =========================
// 集計取得
// =========================

async function loadSummary(){

const year=
document.getElementById("search-year").value;

const month=
document.getElementById("search-month").value;


const response=
await fetch(
`${API_URL}/api/expense-summary?year=${year}&month=${month}`
);


const result=
await response.json();


console.log(
"Expense Summary",
result
);


if(!result.success){

alert("取得失敗");
return;

}


displaySummary(
result.data
);

}


// =========================
// 表示
// =========================

function displaySummary(data){


document.getElementById(
"expense-total"
).innerHTML=`

<h2>
合計：${Number(data.total||0).toLocaleString()} 円
</h2>

`;



document.getElementById(
"expense-links"
).innerHTML=`

<div class="summary-grid">


<div class="summary-card"
onclick="location.href='receipt-list.html?year=${data.year}&month=${data.month}'">

<h3>
領収書件数
</h3>

<p>
${data.count||0} 件
</p>

</div>



<div class="summary-card"
onclick="location.href='receipt-list.html?year=${data.year}&month=${data.month}&check=確認済'">

<h3>
確認済
</h3>

<p>
${data.confirmed||0} 件
</p>

</div>



<div class="summary-card"
onclick="location.href='receipt-list.html?year=${data.year}&month=${data.month}&check=未確認'">

<h3>
未確認
</h3>

<p>
${data.unchecked||0} 件
</p>

</div>



<div class="summary-card"
onclick="location.href='receipt-list.html?year=${data.year}&month=${data.month}&check=取消'">

<h3>
取消
</h3>

<p>
${data.canceled||0} 件
</p>

</div>


</div>

`;



const area=
document.getElementById(
"expense-items"
);


area.innerHTML="";



// =========================
// 共通表示
// =========================

const createSection=(title,list,name)=>{


let html=`

<div class="summary-section">

<h3>
${title}
</h3>

`;


(list||[]).forEach(item=>{


html+=`

<div class="summary-item">

<div>
${item[name]}
</div>


<div>
${Number(item.amount||0).toLocaleString()} 円
</div>


</div>

`;

});


html+="</div>";

return html;

};



// =========================
// 勘定科目別
// =========================

area.innerHTML+=
createSection(
"勘定科目別",
data.items,
"category"
);



// =========================
// 支払方法別
// =========================

area.innerHTML+=
createSection(
"支払方法別",
data.paymentItems,
"payment"
);



// =========================
// 税率別
// =========================

area.innerHTML+=
createSection(
"税率別",
data.taxItems,
"tax"
);



// =========================
// 事業区分別
// =========================

area.innerHTML+=
createSection(
"事業区分別",
data.businessItems,
"business"
);


}
