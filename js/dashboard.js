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
    // KPI表示
    // =========================

    renderDashboard(
      dashboardData
    );

    // =========================
    // 前日比較
    // =========================

    renderYesterdayCard(
      dashboardData
    );

    // =========================
    // 時間帯グラフ
    // =========================

    renderHourlyChart(

      dashboardData.hourlyChart

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
      "ダッシュボードの取得に失敗しました。"
    );

  }

}

// =========================
// KPI表示
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
    formatYen(
      data.bbqSales
    );

  document.getElementById(
    "optionSales"
  ).innerText =
    formatYen(
      data.optionSales
    );

  document.getElementById(
    "onigiriSales"
  ).innerText =
    formatYen(
      data.onigiriSales
    );

  document.getElementById(
    "kitchenSales"
  ).innerText =
    formatYen(
      data.kitchenSales
    );

  document.getElementById(
    "todaySales"
  ).innerText =
    formatYen(
      data.todaySales
    );

  document.getElementById(
    "yesterdaySales"
  ).innerText =
    formatYen(
      data.yesterdaySales
    );

  document.getElementById(
    "monthSales"
  ).innerText =
    formatYen(
      data.monthSales
    );

  document.getElementById(
    "totalSales"
  ).innerText =
    formatYen(
      data.totalSales
    );

}


// =========================
// 前日比較
// =========================

function renderYesterdayCard(data){

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

function renderHourlyChart(chartData){

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

          labels:

            chartData.labels,

          datasets:[

            {

              label:"今日",

              data:
                chartData.today,

              backgroundColor:
                "#4CAF50"

            },

            {

              label:"昨日",

              data:
                chartData.yesterday,

              backgroundColor:
                "#90CAF9"

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

              beginAtZero:true,

              ticks:{

                callback:function(value){

                  return "¥" +

                    Number(value)

                    .toLocaleString();

                }

              }

            }

          }

        }

      }

    );

}


// =========================
// 人気商品TOP5
// =========================

function renderTopProducts(products){

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

        `
        <strong>

        ${index + 1}位

        </strong>

        ${item.name}

        <br>

        <small>

        ${item.qty}個　

        ¥${Number(item.sales).toLocaleString()}

        </small>
        `;

      list.appendChild(
        li
      );

    }

  );

}


// =========================
// カテゴリ売上
// =========================

function renderCategorySales(categories){

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

        `

        <span>

        ${item.category}

        </span>

        <span>

        ¥${Number(item.amount).toLocaleString()}

        </span>

        `;

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
    // ※緯度・経度は店舗所在地
    // =========================

    const response =
      await fetch(

        "https://api.open-meteo.com/v1/forecast?latitude=34.6618&longitude=133.9350&current=temperature_2m,weather_code"

      );

    if(!response.ok){

      throw new Error(
        "Weather Error"
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
// 数値表示
// =========================

function formatNumber(value){

  return Number(
    value || 0
  ).toLocaleString();

}


// =========================
// ダッシュボード更新
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
// ページ表示中に再取得
// =========================

document.addEventListener(

  "visibilitychange",

  ()=>{

    if(

      document.visibilityState ===

      "visible"

    ){

      reloadDashboard();

    }

  }

);


// =========================
// リサイズ時
// （Chart.js再描画）
// =========================

window.addEventListener(

  "resize",

  ()=>{

    if(

      dashboardData.hourlyChart

    ){

      renderHourlyChart(

        dashboardData.hourlyChart

      );

    }

  }

);


// =========================
// 読み込み完了
// =========================

console.log(

  "Dashboard Ver.3 Loaded"

);
