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

  document.getElementById("expense-total").innerHTML=`

<h3>合計：${Number(data.total||0).toLocaleString()} 円</h3>

<div class="receipt-card">
<div>領収書件数：${data.count||0} 件</div>
<div>確認済：${data.confirmed||0} 件</div>
<div>未確認：${data.unchecked||0} 件</div>
<div>取消：${data.canceled||0} 件</div>
</div>

`;

  const area=document.getElementById("expense-items");
  area.innerHTML="";

  // =========================
  // 勘定科目別
  // =========================

  area.innerHTML+="<h3>勘定科目別</h3>";

  data.items.forEach(item=>{

    area.innerHTML+=`
    <div class="receipt-card">
      <div>${item.category}</div>
      <div>${Number(item.amount).toLocaleString()} 円</div>
    </div>
    `;

  });

  // =========================
  // 支払方法別
  // =========================

  area.innerHTML+="<h3>支払方法別</h3>";

  data.paymentItems.forEach(item=>{

    area.innerHTML+=`
    <div class="receipt-card">
      <div>${item.payment}</div>
      <div>${Number(item.amount).toLocaleString()} 円</div>
    </div>
    `;

  });

  // =========================
  // 税率別
  // =========================

  area.innerHTML+="<h3>税率別</h3>";

  data.taxItems.forEach(item=>{

    area.innerHTML+=`
    <div class="receipt-card">
      <div>${item.tax}</div>
      <div>${Number(item.amount).toLocaleString()} 円</div>
    </div>
    `;

  });

  // =========================
  // 事業区分別
  // =========================

  area.innerHTML+="<h3>事業区分別</h3>";

  data.businessItems.forEach(item=>{

    area.innerHTML+=`
    <div class="receipt-card">
      <div>${item.business}</div>
      <div>${Number(item.amount).toLocaleString()} 円</div>
    </div>
    `;

  });

}
