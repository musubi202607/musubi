async function loadBbq() {

  const response =
    await fetch(
      API_URL + '?mode=products'
    );

  const products =
    await response.json();

  const bbq =
    products.filter(
      p => p.type === 'bbq'
    );

  const target =
    document.getElementById(
      'bbqProducts'
    );

  target.innerHTML = '';

  bbq.forEach(product => {

    target.innerHTML += `

      <div class="product-card">

        <img src="${product.image}">

        <div class="product-content">

          <h3>

            ${product.name}

          </h3>

          <p>

            ${product.description}

          </p>

          <div class="price">

            ¥${product.price}

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

            この商品を予約する

          </button>

        </div>

      </div>

    `;

  });

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

  loadCalendar();

  document
    .getElementById(
      'calendarSection'
    )
    .scrollIntoView({
      behavior:'smooth'
    });

}

async function loadCalendar() {

  const response =
    await fetch(
      API_URL + '?mode=calendar'
    );

  const calendar =
    await response.json();

  const target =
    document.getElementById(
      'calendar'
    );

  target.innerHTML = '';

  calendar.forEach(day => {

    const disabled =
      day.status === '×'
      ? 'disabled'
      : '';

    target.innerHTML += `

      <button

        class="calendar-day"

        ${disabled}

        onclick="
          selectDate(
            '${day.date}'
          )
        "

      >

        <div>

          ${day.date}

        </div>

        <div>

          ${day.status}

        </div>

      </button>

    `;

  });

}

function selectDate(date){

  localStorage.setItem(
    'bbqDate',
    date
  );

  document
    .getElementById(
      'goOrder'
    )
    .disabled = false;

}

function goOrder(){

  const productId =
    localStorage.getItem(
      'bbqProductId'
    );

  const bbqDate =
    localStorage.getItem(
      'bbqDate'
    );

  if(!productId){

    alert(
      '商品を選択してください'
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