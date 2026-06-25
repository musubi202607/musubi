let calendarData = [];
let currentMonth = new Date();

// =========================
// 予約状態
// =========================
const saved = localStorage.getItem('bbqReservation');

let reservation = saved
  ? JSON.parse(saved)
  : {
      productId: null,
      productName: null,
      price: null,
      date: null
    };

// =========================
// BBQ商品取得
// =========================
async function loadBbq() {

  const response =
    await fetch(API_URL + '/api/products');

  const products =
    await response.json();

  const bbqProducts =
    products.filter(p => p.type === 'bbq');

  const target =
    document.getElementById('bbqProducts');

  if (!target) return;

  target.innerHTML = '';

  bbqProducts.forEach(product => {

    target.innerHTML += `
      <div class="product-card">

        <img src="${product.image}" alt="${product.name}">

        <div class="product-content">

          <h3>${product.name}</h3>

          <p>${product.description || ''}</p>

          <div class="price">
            ¥${Number(product.price).toLocaleString()}
          </div>

          <button onclick="selectBbq(${product.id}, ${JSON.stringify(product.name)}, ${product.price})">
            この商品を予約
          </button>

        </div>

      </div>
    `;

  });

}

// =========================
// BBQ選択
// =========================
function selectBbq(id, name, price) {

  reservation.productId = id;
  reservation.productName = name;
  reservation.price = price;

  saveReservation();
  updateGoButton();

  document
    .getElementById('calendarSection')
    ?.scrollIntoView({ behavior: 'smooth' });
}

// =========================
// カレンダー取得
// =========================
async function loadCalendar() {

  const response =
    await fetch(API_URL + '/api/calendar');

  calendarData = await response.json();

  renderCalendar();
}

// =========================
// カレンダー描画
// =========================
function renderCalendar() {

  const target =
    document.getElementById('calendar');

  if (!target) return;

  target.innerHTML = '';

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  target.innerHTML += `
    <div class="calendar-header">
      <button onclick="prevMonth()">←</button>
      <h2>${year}年 ${month + 1}月</h2>
      <button onclick="nextMonth()">→</button>
    </div>

    <div class="calendar-grid">

      <div class="calendar-week">日</div>
      <div class="calendar-week">月</div>
      <div class="calendar-week">火</div>
      <div class="calendar-week">水</div>
      <div class="calendar-week">木</div>
      <div class="calendar-week">金</div>
      <div class="calendar-week">土</div>
  `;

  for (let i = 0; i < startDay; i++) {
    target.innerHTML += '<div></div>';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let day = 1; day <= totalDays; day++) {

    const dateObj = new Date(year, month, day);
    const dateStr = formatDate(dateObj);

    const item = calendarData.find(d =>
      String(d.date).slice(0, 10).replaceAll('/', '-') === dateStr
    );

    if (!item) {
      target.innerHTML += '<div></div>';
      continue;
    }

    let className = 'calendar-day';
    let disabled = '';
    let statusText = item.status;

    if (dateObj < today) {

      className += ' closed';
      disabled = 'disabled';
      statusText = '受付終了';

    } else if (item.status === '○') {

      className += ' available';
      statusText = `あと${item.limit}枠`;

    } else if (item.status === '△') {

      className += ' few';
      statusText = `あと${item.limit}枠`;

    } else {

      className += ' closed';
      disabled = 'disabled';
      statusText = '予約不可';

    }

    target.innerHTML += `
      <button
        class="${className}"
        ${disabled}
        onclick="selectDate('${dateStr}', this)"
      >
        <div class="calendar-date">${day}</div>
        <div class="calendar-status">${statusText}</div>
      </button>
    `;
  }

  target.innerHTML += '</div>';
}

// =========================
// 日付選択
// =========================
function selectDate(date, button) {

  reservation.date = date;

  saveReservation();
  updateGoButton();

  document.querySelectorAll('.calendar-day')
    .forEach(btn => btn.classList.remove('selected'));

  button.classList.add('selected');
}

// =========================
// 月移動
// =========================
function prevMonth() {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
}

// =========================
// 日付フォーマット
// =========================
function formatDate(date) {

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

// =========================
// 保存
// =========================
function saveReservation() {

  localStorage.setItem(
    'bbqReservation',
    JSON.stringify(reservation)
  );
}

// =========================
// ボタン制御
// =========================
function updateGoButton() {

  const goBtn = document.getElementById('goOrder');

  if (!goBtn) return;

  goBtn.disabled = !(reservation.productId && reservation.date);
}

// =========================
// 次へ
// =========================
function goOrder() {

  if (!reservation.productId) {
    alert('BBQ商品を選択してください');
    return;
  }

  if (!reservation.date) {
    alert('予約日を選択してください');
    return;
  }

  location.href = 'bbq-order.html';
}

// =========================
// 初期化
// =========================
loadBbq();
loadCalendar();