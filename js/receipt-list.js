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
