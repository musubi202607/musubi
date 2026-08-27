// =========================
// 売上取消
// =========================

let currentOrder = null;


// =========================
// 初期表示
// =========================
document.addEventListener("DOMContentLoaded", () => {

    const now = new Date();

    const today =
        new Date(
            now.getTime() -
            now.getTimezoneOffset() * 60000
        )
        .toISOString()
        .slice(0,10);


    document.getElementById("startDate").value =
        today;


    document.getElementById("endDate").value =
        today;


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


    const orderList =
        document.getElementById("orderList");


    orderList.innerHTML =
        "読込中...";


    try{


        const token =
            localStorage.getItem("adminToken");



        const res =
            await fetch(

                API_URL +
                "/api/sales/list",

                {

                    method:"POST",

                    headers:{

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            token

                    },

                    body:
                        JSON.stringify({

                            startDate:startDate,

                            endDate:endDate

                        })

                }

            );



        if(!res.ok){


            const errorText =
                await res.text();


            console.error(
                "Sales List Error:",
                res.status,
                errorText
            );


            orderList.innerHTML =
                "データ取得失敗";


            return;

        }



        const data =
            await res.json();



        console.log(
            "Sales List Response:",
            data
        );



        // =========================
        // 配列取得
        // =========================
        let list = [];



        if(Array.isArray(data)){

            list = data;

        }
        else if(Array.isArray(data.orders)){

            list = data.orders;

        }
        else if(Array.isArray(data.data)){

            list = data.data;

        }



        if(!Array.isArray(list)){


            console.error(
                "Invalid sales list:",
                data
            );


            orderList.innerHTML =
                "データ取得失敗";


            return;

        }



        // =========================
        // 受付中
        // =========================
        const activeList =
            list.filter(item => {


                return (

                    item.type === "onigiri" ||
                    item.type === "kitchen"

                )
                &&
                (
                    !item.status ||
                    item.status === ""

                );

            });




        // =========================
        // 取消済
        // =========================
        const canceledList =
            list.filter(item => {


                return (

                    item.type === "onigiri" ||
                    item.type === "kitchen"

                )
                &&
                (
                    item.status === "キャンセル" ||
                    item.status === "取消"

                );


            });





        // =========================
        // HTML生成
        // =========================
        let html = "";



        html += `

<h3>
受付中
</h3>

`;



        if(activeList.length === 0){


            html += `

<p>
対象データなし
</p>

`;

        }
        else{


            activeList.forEach(item=>{

                html += createOrderCard(
                    item,
                    true
                );

            });


        }




        html += `

<hr>

<h3>
取消済
</h3>

`;



        if(canceledList.length === 0){


            html += `

<p>
対象データなし
</p>

`;

        }
        else{


            canceledList.forEach(item=>{


                html += createOrderCard(
                    item,
                    false
                );


            });


        }



        orderList.innerHTML =
            html;



    }
    catch(err){


        console.error(
            "Sales List Exception:",
            err
        );


        orderList.innerHTML =
            "通信エラー";


    }


}




// =========================
// 注文カード生成
// =========================
function createOrderCard(
    item,
    canCancel
){


    let icon =
        "🍙";


    if(item.type === "kitchen"){

        icon =
            "🚚";

    }



    const statusText =
        item.status
        ? item.status
        : "受付中";



    return `


<div
class="order-card"
onclick="
showDetail(
'${item.type}',
'${item.orderNo}'
)
"
>


<div class="order-top">


<div>


<div class="order-no">

${icon}
${item.orderNo}

</div>



<div>

${item.customerName || ""}

</div>


</div>



<div class="order-total">

¥${Number(
    item.total || 0
).toLocaleString()}

</div>



</div>



<div class="order-paid">

状態：
${statusText}

</div>



<div class="order-paid">

会計：
${item.payment || ""}

</div>


</div>


`;

}

// =========================
// 明細表示
// =========================
async function showDetail(
    type,
    no
){


    currentOrder = {

        type:type,

        no:no

    };



    try{


        const res =
            await fetch(

                API_URL +
                "/api/sales/detail",

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

                            type:type,

                            orderNo:no

                        })

                }

            );



        if(!res.ok){


            const errorText =
                await res.text();


            console.error(
                "Detail Error:",
                res.status,
                errorText
            );


            throw new Error(
                "HTTP " +
                res.status
            );


        }



        const data =
            await res.json();



        console.log(
            "Order Detail:",
            data
        );



        let html = "";



        html += `

<p>

注文番号：
${no}

</p>

<hr>

`;



        if(Array.isArray(data.items)){


            data.items.forEach(item=>{


                html += `

<div class="detail-item">


<span>

${item.name}

×${item.qty}

</span>



<span>

¥${Number(
    item.amount || 0
).toLocaleString()}

</span>


</div>

`;

            });


        }



        html += `

<hr>


<h2>

合計

¥${Number(
    data.total || 0
).toLocaleString()}

</h2>



<p>

会計状態：
${data.payment || ""}

</p>


<p>

状態：
${data.status || "受付中"}

</p>


`;



        document.getElementById(
            "detailBody"
        ).innerHTML =
            html;



        document.getElementById(
            "detailCard"
        ).style.display =
            "block";




        const actionArea =
            document.getElementById(
                "actionArea"
            );



        const btn =
            document.getElementById(
                "actionBtn"
            );



        // =========================
        // 取消済
        // =========================
        if(

            data.status === "キャンセル" ||
            data.status === "取消"

        ){


            actionArea.style.display =
                "none";


            return;

        }



        // =========================
        // 取消可能
        // =========================
        actionArea.style.display =
            "block";



        if(data.payment === "未"){


            btn.innerText =
                "キャンセル";


        }
        else{


            btn.innerText =
                "売上取消";


        }


    }
    catch(err){


        console.error(
            "Detail Exception:",
            err
        );


        alert(
            "注文詳細の取得に失敗しました"
        );


    }


}






// =========================
// キャンセル・取消
// =========================
async function executeAction(){



    if(!currentOrder){

        return;

    }



    const btn =
        document.getElementById(
            "actionBtn"
        );



    const action =
        btn.innerText;



    if(
        !confirm(
            action +
            "を実行しますか？"
        )
    ){

        return;

    }



    try{


        const res =
            await fetch(

                API_URL +
                "/api/sales/cancel",

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

                            type:
                                currentOrder.type,


                            orderNo:
                                currentOrder.no

                        })


                }

            );



        if(!res.ok){


            const errorText =
                await res.text();



            console.error(
                "Cancel Error:",
                res.status,
                errorText
            );


            alert(
                "取消に失敗しました"
            );


            return;


        }



        const data =
            await res.json();



        console.log(
            "Cancel Response:",
            data
        );



        if(!data.success){


            alert(
                data.message ||
                "取消に失敗しました"
            );


            return;

        }



        alert(
            action +
            "しました"
        );



        document.getElementById(
            "detailCard"
        ).style.display =
            "none";



        document.getElementById(
            "actionArea"
        ).style.display =
            "none";



        currentOrder =
            null;



        loadOrders();



    }
    catch(err){


        console.error(
            "Cancel Exception:",
            err
        );


        alert(
            "通信エラーが発生しました"
        );


    }


}
