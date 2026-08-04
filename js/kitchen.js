let kitchenProducts=[];
let kitchenCart=[];

// =========================
// 初期化
// =========================
window.addEventListener("DOMContentLoaded",async()=>{

await loadKitchenProducts();

});


// =========================
// 商品取得
// =========================
async function loadKitchenProducts(){

try{

const res=
await fetch(
API_URL+"/api/products"
);

const data=
await res.json();


kitchenProducts=
data.filter(item=>
item.status==="販売中" &&
item.kitchenCar==="○"
);


displayKitchenProducts();


}catch(e){

console.error(e);

}

}


// =========================
// 商品表示
// =========================
function displayKitchenProducts(){

const area=
document.getElementById(
"kitchenProductGrid"
);


area.innerHTML="";


kitchenProducts.forEach(p=>{

area.innerHTML+=`

<div class="product-card">

<img src="${p.image||""}">

<h3>${p.name}</h3>

<p>
¥${Number(p.price).toLocaleString()}
</p>


<div class="qty-area">

<button onclick="changeKitchenQty(${p.id},-1)">
－
</button>

<span id="kqty_${p.id}">
0
</span>

<button onclick="changeKitchenQty(${p.id},1)">
＋
</button>

</div>

</div>

`;

});

}


// =========================
// 数量変更
// =========================
function changeKitchenQty(id,diff){

let target=
document.getElementById(
"kqty_"+id
);


let qty=
Number(target.innerText)+diff;


if(qty<0) qty=0;


target.innerText=qty;


const item=
kitchenCart.find(
x=>x.id===id
);


if(item){

item.qty=qty;

}else{

kitchenCart.push({

id:id,
qty:qty

});

}


kitchenCart=
kitchenCart.filter(
x=>x.qty>0
);


displayKitchenCart();

}


// =========================
// カート表示
// =========================
function displayKitchenCart(){

const area=
document.getElementById(
"kitchenCart"
);


area.innerHTML="";


let total=0;


kitchenCart.forEach(item=>{


const product=
kitchenProducts.find(
p=>p.id==item.id
);


if(!product)return;


const price=
Number(product.price)*
Number(item.qty);


total+=price;


area.innerHTML+=`

<div>

${product.name}
${item.qty}個
¥${price.toLocaleString()}

</div>

`;

});


document.getElementById(
"totalPrice"
).innerText=
"¥"+total.toLocaleString();

}


// =========================
// 注文送信
// =========================
async function sendKitchenOrder(){


if(kitchenCart.length===0){

alert(
"商品を選択してください"
);

return;

}


const carNumber=
document.getElementById(
"carNumber"
).value;



const orders=
kitchenCart.map(item=>{


const product=
kitchenProducts.find(
p=>p.id==item.id
);


return {

productName:
product.name,

qty:
item.qty,

price:
product.price,

amount:
Number(product.price)*
Number(item.qty)

};


});



const res=
await fetch(

API_URL+"/api/kitchen/order",

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:
JSON.stringify({

carNumber,

orders

})

}

);



const result=
await res.json();


if(result.success){

document.getElementById(
"resultArea"
).innerHTML=

`

<h2>
注文番号：
${result.orderNo}
</h2>

<p>
受付しました
</p>

`;

setTimeout(()=>{

document.getElementById(
"resultArea"
).innerHTML="";

},3000);
  
kitchenCart=[];

displayKitchenCart();

document
.querySelectorAll(
"[id^='kqty_']"
)
.forEach(e=>{

e.innerText=0;

});


}else{

alert(
result.message||
"注文失敗"
);

}


}
