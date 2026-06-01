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

  target.innerHTML = '';

  bbqProducts.forEach(
    product => {

      target.innerHTML += `

        <div class="product-card">

          <img
            src="${product.image}"
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
    .scrollIntoView({
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

  renderCalendar();

}

function renderCalendar(){

  const target =
    document.getElementById(
      'calendar'
    );

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

      <div class="calendar-week">
        日
      </div>

      <div class="calendar-week">
        月
      </div>

      <div class="calendar-week">
        火
      </div>

      <div class="calendar-week">
        水
      </div>

      <div class="calendar-week">
        木
      </div>

      <div class="calendar-week">
        金
      </div>

      <div class="calendar-week">
        土
      </div>

  `;

  for(
    let i = 0;
    i < startDay;
    i++
  ){

    target.innerHTML +=
      '<div></div>';

  }

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
          d.date === dateStr
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
      item.status === '○'
    ){

      className +=
        ' available';

      statusText =
        `あと${item.limit}枠`;

    }

    if(
      item.status === '△'
    ){

      className +=
        ' few';

      statusText =
        `あと${item.limit}枠`;

    }

    if(
      item.status === '×'
    ){

      className +=
        ' closed';

      disabled =
        'disabled';

    }

    target.innerHTML += `

      <button

        class="${className}"

        ${disabled}

        onclick="
          selectDate(
            '${dateStr}'
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
  date
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

  event.target
    .closest('button')
    .classList.add(
      'selected'
    );

  document
    .getElementById(
      'goOrder'
    )
    .disabled = false;

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

  location.href =
    'bbq-order.html';

}

loadBbq();

loadCalendar();