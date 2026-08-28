// =========================
// 経費集計
// admin-expense.js
// =========================


document.addEventListener(

"DOMContentLoaded",

()=>{


const now =
new Date();



const year =
document.getElementById(
"search-year"
);



for(
let y =
now.getFullYear();

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

loadSummary

);



loadSummary();


});





// =========================
// 集計取得
// =========================

async function loadSummary(){



const year =
document
.getElementById(
"search-year"
)
.value;



const month =
document
.getElementById(
"search-month"
)
.value;




const response =

await fetch(

`${API_URL}/api/expense-summary?year=${year}&month=${month}`

);



const result =

await response.json();



console.log(
"Expense Summary",
result
);



if(!result.success){

alert(
"取得失敗"
);

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



document
.getElementById(
"expense-total"
)
.innerHTML =


`
<h3>
合計：
${Number(data.total || 0)
.toLocaleString()}
円
</h3>
`;




const area =

document
.getElementById(
"expense-items"
);



area.innerHTML = "";



data.items.forEach(item=>{


const div =
document.createElement(
"div"
);


div.className =
"receipt-card";



div.innerHTML =


`
<div>
${item.category}
</div>

<div>
${Number(item.amount)
.toLocaleString()}
円
</div>
`;



area.appendChild(
div
);



});


}
