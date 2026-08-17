// ==================================================
// ダッシュボード Ver.3
// ==================================================

let dashboardData = {};

let hourlyChart = null;


// =========================
// 初期化
// =========================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    loadDashboard();

  }
);


// =========================
// ダッシュボード取得
// =========================

async function loadDashboard(){

  try{

    const token =
      localStorage.getItem(
        "adminToken"
      );

    const response =
      await fetch(

        API_URL +
        "/api/dashboard",

        {

          headers:{

            Authorization:
              "Bearer " +
              token

          }

        }

      );

    if(!response.ok){

      alert(
        "認証エラーです。"
      );

      location.href =
        "login.html";

      return;

    }

    dashboardData =
      await response.json();


    // =========================
    // 基本表示
    // =========================

    renderDashboard(
      dashboardData
    );


    // =========================
    // 昨日比較
    // =========================

    renderYesterdayCard(
      dashboardData
    );


    // =========================
    // 時間帯売上
    // =========================

    renderHourlyChart(

      dashboardData.hourlySales,

      dashboardData.yesterdayHourlySales

    );


    // =========================
    // 人気商品
    // =========================

    renderTopProducts(

      dashboardData.topProducts

    );


    // =========================
    // カテゴリ売上
    // =========================

    renderCategorySales(

      dashboardData.categorySales

    );


    // =========================
    // 天気
    // =========================

    loadWeather();

  }

  catch(error){

    console.error(error);

    alert(
      "ダッシュボード取得に失敗しました。"
    );

  }

}

// =========================
// 基本表示
// =========================

function renderDashboard(data){

  document.getElementById(
    "reservationCount"
  ).innerText =
    data.reservationCount || 0;

  document.getElementById(
    "checkedInCount"
  ).innerText =
    data.checkedInCount || 0;

  document.getElementById(
    "visitRate"
  ).innerText =
    (data.visitRate || 0) + "%";

  document.getElementById(
    "bbqUnpaidCount"
  ).innerText =
    data.bbqUnpaidCount || 0;

  document.getElementById(
    "onigiriUnpaidCount"
  ).innerText =
    data.onigiriUnpaidCount || 0;

  document.getElementById(
    "bbqSales"
  ).innerText =
    "¥" +
    Number(
      data.bbqSales || 0
    ).toLocaleString();

  document.getElementById(
    "optionSales"
  ).innerText =
    "¥" +
    Number(
      data.optionSales || 0
    ).toLocaleString();

  document.getElementById(
    "onigiriSales"
  ).innerText =
    "¥" +
    Number(
      data.onigiriSales || 0
    ).toLocaleString();

  document.getElementById(
    "kitchenSales"
  ).innerText =
    "¥" +
    Number(
      data.kitchenSales || 0
    ).toLocaleString();

  document.getElementById(
    "todaySales"
  ).innerText =
    "¥" +
    Number(
      data.todaySales || 0
    ).toLocaleString();

  document.getElementById(
    "monthSales"
  ).innerText =
    "¥" +
    Number(
      data.monthSales || 0
    ).toLocaleString();

  document.getElementById(
    "totalSales"
  ).innerText =
    "¥" +
    Number(
      data.totalSales || 0
    ).toLocaleString();

}


// =========================
// 昨日比較
// =========================

function renderYesterdayCard(data){

  document.getElementById(
    "yesterdaySales"
  ).innerText =
    "¥" +
    Number(
      data.yesterdaySales || 0
    ).toLocaleString();

  const diff =
    document.getElementById(
      "salesDiff"
    );

  const value =
    Number(
      data.salesDiff || 0
    );

  diff.innerText =
    value + "%";

  if(value > 0){

    diff.style.color =
      "#2e7d32";

  }
  else if(value < 0){

    diff.style.color =
      "#d32f2f";

  }
  else{

    diff.style.color =
      "#666";

  }

}

// =========================
// 時間帯別売上グラフ
// =========================

function renderHourlyChart(
  today,
  yesterday
){

  const canvas =
    document.getElementById(
      "hourlyChart"
    );

  if(!canvas){

    return;

  }

  const ctx =
    canvas.getContext("2d");

  if(hourlyChart){

    hourlyChart.destroy();

  }

  hourlyChart =
    new Chart(

      ctx,

      {

        type:"bar",

        data:{

          labels:[
            "11時",
            "12時",
            "13時",
            "14時",
            "15時"
          ],

          datasets:[

            {

              label:"今日",

              data:[

                today["11"] || 0,
                today["12"] || 0,
                today["13"] || 0,
                today["14"] || 0,
                today["15"] || 0

              ]

            },

            {

              label:"昨日",

              data:[

                yesterday["11"] || 0,
                yesterday["12"] || 0,
                yesterday["13"] || 0,
                yesterday["14"] || 0,
                yesterday["15"] || 0

              ]

            }

          ]

        },

        options:{

          responsive:true,

          maintainAspectRatio:false,

          plugins:{

            legend:{

              position:"bottom"

            }

          },

          scales:{

            y:{

              beginAtZero:true

            }

          }

        }

      }

    );

}


// =========================
// 人気商品TOP5
// =========================

function renderTopProducts(
  products
){

  const list =
    document.getElementById(
      "topProducts"
    );

  if(!list){

    return;

  }

  list.innerHTML = "";

  (products || []).forEach(

    (item,index)=>{

      const li =
        document.createElement(
          "li"
        );

      li.innerHTML =

        `<strong>${index+1}位</strong>
         ${item.name}
         <br>
         <small>
         ${item.qty}個　
         ¥${Number(item.sales).toLocaleString()}
         </small>`;

      list.appendChild(li);

    }

  );

}


// =========================
// カテゴリ売上
// =========================

function renderCategorySales(
  categories
){

  const list =
    document.getElementById(
      "categorySales"
    );

  if(!list){

    return;

  }

  list.innerHTML = "";

  (categories || []).forEach(

    item=>{

      const li =
        document.createElement(
          "li"
        );

      li.innerHTML =

        `${item.category}

        <span>

        ¥${Number(item.amount).toLocaleString()}

        </span>`;

      list.appendChild(
        li
      );

    }

  );

}

// =========================
// 天気取得
// =========================

async function loadWeather(){

  const weatherText =
    document.getElementById(
      "weatherText"
    );

  const weatherTemp =
    document.getElementById(
      "weatherTemp"
    );

  if(
    !weatherText ||
    !weatherTemp
  ){

    return;

  }

  try{

    // =========================
    // Open-Meteo
    // 緯度経度は店舗所在地へ変更可
    // =========================

    const response =
      await fetch(

        "https://api.open-meteo.com/v1/forecast?latitude=34.6618&longitude=133.9350&current=temperature_2m,weather_code"

      );

    if(!response.ok){

      throw new Error(
        "天気取得失敗"
      );

    }

    const data =
      await response.json();

    const current =
      data.current || {};

    weatherText.innerText =
      weatherName(
        current.weather_code
      );

    weatherTemp.innerText =
      Number(
        current.temperature_2m || 0
      ).toFixed(1)
      + "℃";

  }

  catch(error){

    console.error(error);

    weatherText.innerText =
      "取得失敗";

    weatherTemp.innerText =
      "--℃";

  }

}


// =========================
// 天気コード変換
// =========================

function weatherName(code){

  switch(Number(code)){

    case 0:
      return "☀ 快晴";

    case 1:
    case 2:
      return "🌤 晴れ";

    case 3:
      return "☁ 曇り";

    case 45:
    case 48:
      return "🌫 霧";

    case 51:
    case 53:
    case 55:
      return "🌦 小雨";

    case 61:
    case 63:
    case 65:
      return "🌧 雨";

    case 71:
    case 73:
    case 75:
      return "❄ 雪";

    case 80:
    case 81:
    case 82:
      return "🌦 にわか雨";

    case 95:
    case 96:
    case 99:
      return "⛈ 雷雨";

    default:
      return "－";

  }

}

// =========================
// 金額表示
// =========================

function formatYen(value){

  return "¥" +

    Number(
      value || 0
    ).toLocaleString();

}


// =========================
// 件数表示
// =========================

function formatCount(value){

  return Number(
    value || 0
  ).toLocaleString();

}


// =========================
// パーセント表示
// =========================

function formatPercent(value){

  return Number(
    value || 0
  ).toFixed(1) + "%";

}


// =========================
// グラフ更新
// =========================

function reloadDashboard(){

  loadDashboard();

}


// =========================
// 自動更新（5分）
// =========================

setInterval(

  reloadDashboard,

  1000 * 60 * 5

);


// =========================
// 読み込み完了
// =========================

console.log(

  "Dashboard Ver.3 Loaded"

);
