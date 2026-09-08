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
document.getElementById("search-month").value=now.getMonth()+1;

document.getElementById("search-button")
.addEventListener("click",loadSummary);

loadSummary();

});


// =========================
// 集計取得
// =========================

async function loadSummary(){

const year=document.getElementById("search-year").value;
const month=document.getElementById("search-month").value;

const response=await fetch(
`${API_URL}/api/expense-summary?year=${year}&month=${month}`
);

const result=await response.json();

console.log("Expense Summary",result);

if(!result.success){
alert("取得失敗");
return;
}

displaySummary(result.data);

}


// =========================
// 表示
// =========================

function displaySummary(data){

const total=document.getElementById("expense-total");

total.innerHTML=`

<h2>
合計：${Number(data.total||0).toLocaleString()} 円
</h2>


<div class="summary-grid">


<div class="summary-card"
onclick="location.href='receipt-list.html'"
style="cursor:pointer;">

<h3>領収書件数</h3>

<p>
${data.count||0} 件
</p>

</div>



<div class="summary-card"
onclick="location.href='receipt-list.html?check=確認済'"
style="cursor:pointer;">

<h3>確認済</h3>

<p>
${data.confirmed||0} 件
</p>

</div>



<div class="summary-card"
onclick="location.href='receipt-list.html?check=未確認'"
style="cursor:pointer;">

<h3>未確認</h3>

<p>
${data.unchecked||0} 件
</p>

</div>



<div class="summary-card"
onclick="location.href='receipt-list.html?check=取消'"
style="cursor:pointer;">

<h3>取消</h3>

<p>
${data.canceled||0} 件
</p>

</div>


</div>

`;



const area=document.getElementById("expense-items");

area.innerHTML="";



// =========================
// 勘定科目別
// =========================

area.innerHTML+=`
<div class="summary-section">
<h3>勘定科目別</h3>
`;

(data.items||[]).forEach(item=>{

area.innerHTML+=`

<div class="summary-item">

<div>
${item.category}
</div>

<div>
${Number(item.amount||0).toLocaleString()} 円
</div>

</div>

`;

});

area.innerHTML+="</div>";



// =========================
// 支払方法別
// =========================

area.innerHTML+=`
<div class="summary-section">
<h3>支払方法別</h3>
`;

(data.paymentItems||[]).forEach(item=>{

area.innerHTML+=`

<div class="summary-item">

<div>
${item.payment}
</div>

<div>
${Number(item.amount||0).toLocaleString()} 円
</div>

</div>

`;

});

area.innerHTML+="</div>";



// =========================
// 税率別
// =========================

area.innerHTML+=`
<div class="summary-section">
<h3>税率別</h3>
`;

(data.taxItems||[]).forEach(item=>{

area.innerHTML+=`

<div class="summary-item">

<div>
${item.tax}
</div>

<div>
${Number(item.amount||0).toLocaleString()} 円
</div>

</div>

`;

});

area.innerHTML+="</div>";



// =========================
// 事業区分別
// =========================

area.innerHTML+=`
<div class="summary-section">
<h3>事業区分別</h3>
`;

(data.businessItems||[]).forEach(item=>{

area.innerHTML+=`

<div class="summary-item">

<div>
${item.business}
</div>

<div>
${Number(item.amount||0).toLocaleString()} 円
</div>

</div>

`;

});

area.innerHTML+="</div>";

}
