let calendarData = [];

let currentMonth =
  new Date();

async function loadBbq() {

  const response =
    await fetch(
      API_URL +
      '?mode=products'
    );

  const products =
    await response.json();

  const bbqProducts =
    products.filter(
      p => p.type === 'bbq'
    );

  const target =
    document.getElementById(
      'bbqProducts'
    );

  if (!target) return;

  target.innerHTML = '';

  bbqProducts.forEach(
    product => {

      target.innerHTML += `

        <div class="product-card">

          <img
            src="${product.image}"
            alt="${product.name}"
          >

          <div
            class="product-content"
          >

            <h3>

              ${product.name}

            </h3>

            <p>

              ${product.description}

            </p>

            <div class="price">

              ¥${Number(
                product.price
              ).toLocaleString()}

            </div>

            <button

              onclick="
                selectBbq(
                  ${product.id},
                  '${product.name}',
                  ${product.price}
                )
              "

            >

              この商品を予約

            </button>

          </div>

        </div>

      `;

    }
  );

}

function selectBbq(
  id,
  name,
  price
){

  localStorage.setItem(
    'bbqProductId',
    id
  );

  localStorage.setItem(
    'bbqProductName',
    name
  );

  localStorage.setItem(
    'bbqPrice',
    price
  );

  document
    .getElementById(
      'calendarSection'
    )
    ?.scrollIntoView({
      behavior:'smooth'
    });

}

async function loadCalendar(){

  const response =
    await fetch(
      API_URL +
      '?mode=calendar'
    );

  calendarData =
    await response.json();

  console.log(
    'calendarData',
    calendarData
  );

  renderCalendar();

}

function renderCalendar(){

  const target =
    document.getElementById(
      'calendar'
    );

  if(!target) return;

  target.innerHTML = '';

  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    );

  const lastDay =
    new Date(
      year,
      month + 1,
      0
    );

  const startDay =
    firstDay.getDay();

  const totalDays =
    lastDay.getDate();

  target.innerHTML += `

    <div class="calendar-header">

      <button
        onclick="prevMonth()"
      >
        ←
      </button>

      <h2>
        ${year}年
        ${month + 1}月
      </h2>

      <button
        onclick="nextMonth()"
      >
        →
      </button>

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

  for(
    let i = 0;
    i < startDay;
    i++
  ){

    target.innerHTML +=
      '<div></div>';

  }

  const today =
    new Date();

  today.setHours(
    0,0,0,0
  );

  for(
    let day = 1;
    day <= totalDays;
    day++
  ){

    const dateObj =
      new Date(
        year,
        month,
        day
      );

    const dateStr =
      formatDate(
        dateObj
      );

    const item =
      calendarData.find(
        d =>
          String(d.date)
            .substring(0,10)
            .replaceAll(
              '/',
              '-'
            )
          === dateStr
      );

    if(!item){

      target.innerHTML +=
        '<div></div>';

      continue;

    }

    let className =
      'calendar-day';

    let disabled =
      '';

    let statusText =
      item.status;

    if(
      dateObj < today
    ){

      className +=
        ' closed';

      disabled =
        'disabled';

      statusText =
        '受付終了';

    }
    else if(
      item.status === '○'
    ){

      className +=
        ' available';

      statusText =
        `あと${item.limit}枠`;

    }
    else if(
      item.status === '△'
    ){

      className +=
        ' few';

      statusText =
        `あと${item.limit}枠`;

    }
    else{

      className +=
        ' closed';

      disabled =
        'disabled';

      statusText =
        '予約不可';

    }

    target.innerHTML += `

      <button

        class="${className}"

        ${disabled}

        onclick="
          selectDate(
            '${dateStr}',
            this
          )
        "

      >

        <div
          class="calendar-date"
        >

          ${day}

        </div>

        <div
          class="calendar-status"
        >

          ${statusText}

        </div>

      </button>

    `;

  }

  target.innerHTML +=
    '</div>';

}

function selectDate(
  date,
  button
){

  localStorage.setItem(
    'bbqDate',
    date
  );

  document
    .querySelectorAll(
      '.calendar-day'
    )
    .forEach(
      btn =>
        btn.classList.remove(
          'selected'
        )
    );

  button.classList.add(
    'selected'
  );

  const goBtn =
    document.getElementById(
      'goOrder'
    );

  if(goBtn){

    goBtn.disabled =
      false;

  }

}

function prevMonth(){

  currentMonth.setMonth(
    currentMonth.getMonth() - 1
  );

  renderCalendar();

}

function nextMonth(){

  currentMonth.setMonth(
    currentMonth.getMonth() + 1
  );

  renderCalendar();

}

function formatDate(
  date
){

  const y =
    date.getFullYear();

  const m =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      '0'
    );

  const d =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    );

  return `${y}-${m}-${d}`;

}

function goOrder(){

  const bbqProduct =
    localStorage.getItem(
      'bbqProductId'
    );

  const bbqDate =
    localStorage.getItem(
      'bbqDate'
    );

  if(!bbqProduct){

    alert(
      'BBQ商品を選択してください'
    );

    return;

  }

  if(!bbqDate){

    alert(
      '予約日を選択してください'
    );

    return;

  }

  location.href =
    'bbq-order.html';

}

loadBbq();

loadCalendar();