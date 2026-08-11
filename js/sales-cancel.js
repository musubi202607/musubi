// =========================
// 売上取消
// =========================

let currentOrder = null;

// =========================
// 初期表示
// =========================
document.addEventListener("DOMContentLoaded", () => {

    const today = new Date().toISOString().slice(0,10);

    document.getElementById("startDate").value = today;
    document.getElementById("endDate").value = today;

    loadOrders();

});

// =========================
// 一覧取得
// =========================
async function loadOrders(){

    const startDate =
        document.getElementById("startDate").value;

    const endDate =
        document.getElementById("endDate").value;

    document.getElementById("orderList").innerHTML =
        "読込中...";

    try{

        const res =
            await fetch(
                API_URL + "/api/sales/list",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:
                            "Bearer " +
                            localStorage.getItem("adminToken")
                    },
                    body:JSON.stringify({
                        startDate,
                        endDate
                    })
                }
            );

        const list =
            await res.json();

        if(!Array.isArray(list)){

            document.getElementById("orderList").innerHTML =
                "データ取得失敗";

            return;

        }

        if(list.length===0){

            document.getElementById("orderList").innerHTML =
                "対象データなし";

            return;

        }

        let html="";

        list.forEach(item=>{

            let icon="🍙";

            if(item.type==="bbq") icon="🔥";
            if(item.type==="kitchen") icon="🚚";

            html+=`

<div class="order-card"
onclick="showDetail('${item.type}','${item.orderNo}')">

<div class="order-top">

<div>

<div class="order-no">

${icon}
${item.orderNo}

</div>

<div>

${item.customerName || item.carNumber || ""}

</div>

</div>

<div class="order-total">

¥${Number(item.total).toLocaleString()}

</div>

</div>

<div class="order-paid">

会計：
${item.payment}

</div>

</div>

`;

        });

        document.getElementById("orderList").innerHTML =
            html;

    }catch(err){

        console.error(err);

        document.getElementById("orderList").innerHTML =
            "通信エラー";

    }

}

// =========================
// 明細表示
// =========================
async function showDetail(type,no){

    currentOrder={
        type,
        no
    };

    let url="";

    if(type==="onigiri"){

        url=
        API_URL+
        "/api/order?orderNo="+no;

    }

    if(type==="bbq"){

        url=
        API_URL+
        "/api/bbq/full-detail?no="+no;

    }

    if(type==="kitchen"){

        url=
        API_URL+
        "/api/kitchen/order?orderNo="+no;

    }

    const res=
        await fetch(url,{
            headers:{
                Authorization:
                "Bearer "+
                localStorage.getItem("adminToken")
            }
        });

    const data=
        await res.json();

    console.log(data);

    let html="";

    html+=`
<p>
注文番号：
${no}
</p>

<hr>
`;

    if(data.items){

        data.items.forEach(item=>{

            html+=`

<div class="detail-item">

<span>

${item.name}

×${item.qty}

</span>

<span>

¥${Number(item.amount).toLocaleString()}

</span>

</div>

`;

        });

    }

    html+=`

<hr>

<h2>

合計

¥${Number(data.total||0).toLocaleString()}

</h2>

<p>

会計状態：
${data.payment||""}

</p>

`;

    document.getElementById("detailBody").innerHTML=
        html;

    document.getElementById("detailCard").style.display=
        "block";

    document.getElementById("actionArea").style.display=
        "block";

    const btn=
        document.getElementById("actionBtn");

    if(data.payment==="未"){

        btn.innerText=
            "キャンセル";

    }else{

        btn.innerText=
            "売上取消";

    }

}

// =========================
// キャンセル・取消
// =========================
function executeAction(){

    if(!currentOrder){

        return;

    }

    alert(
        "次にWorker/GASを接続します。"
    );

}
