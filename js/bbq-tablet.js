async function loadReservations(){

  try{

    const response =
      await fetch(
        API_URL +
        '?mode=reservations'
      );

    const data =
      await response.json();

    const target =
      document.getElementById(
        'reservationList'
      );

    target.innerHTML = '';

    if(data.length === 0){

      target.innerHTML = `

        <div class="product-card">

          <div class="product-content">

            <h3>

              本日の予約はありません

            </h3>

          </div>

        </div>

      `;

      return;

    }

    data.forEach(item => {

      target.innerHTML += `

        <div class="product-card">

          <div class="product-content">

            <h3>

              ${item.reservationNo}

            </h3>

            <p>

              ${item.customerName}

            </p>

            <p>

              ${item.people}名

            </p>

            <p>

              ${item.plan}

            </p>

            <p>

              会計：
              ${item.paid || '未'}

            </p>

          </div>

        </div>

      `;

    });

  }catch(error){

    console.error(error);

    alert(
      '予約一覧取得エラー'
    );

  }

}

async function searchReservation(){

  const no =
    document
      .getElementById(
        'reservationNo'
      )
      .value
      .trim();

  if(!no){

    alert(
      '予約番号を入力してください'
    );

    return;

  }

  try{

    const response =
      await fetch(

        API_URL +
        '?mode=reservation&no=' +
        encodeURIComponent(no)

      );

    const data =
      await response.json();

    if(!data){

      alert(
        '予約が見つかりません'
      );

      return;

    }

    displayReservation(
      data
    );

  }catch(error){

    console.error(error);

    alert(
      '検索エラー'
    );

  }

}

function displayReservation(data){

  const target =
    document.getElementById(
      'reservationDetail'
    );

  target.innerHTML = `

    <div class="product-card">

      <div class="product-content">

        <h2>

          予約番号
          ${data.reservationNo}

        </h2>

        <p>

          氏名：
          ${data.customerName}

        </p>

        <p>

          電話：
          ${data.customerTel}

        </p>

        <p>

          利用日：
          ${data.useDate}

        </p>

        <p>

          人数：
          ${data.people}名

        </p>

        <p>

          プラン：
          ${data.plan}

        </p>

        <p>

          金額：
          ¥${Number(
            data.price
          ).toLocaleString()}

        </p>

        <p>

          状態：
          ${data.status}

        </p>

        <p>

          会計：
          ${data.paid}

        </p>

      </div>

    </div>

  `;

}

window.onload = function(){

  loadReservations();

};

let currentReservation = null;

function renderCart(){

  const cart =
    JSON.parse(
      localStorage.getItem(
        'bbqOptionCart'
      )
    ) || [];

  const target =
    document.getElementById(
      'cartArea'
    );

  let total = 0;

  target.innerHTML = '';

  cart.forEach(item => {

    const subtotal =
      Number(item.price) *
      Number(item.qty);

    total += subtotal;

    target.innerHTML += `

      <div class="product-card">

        <div class="product-content">

          <h3>

            ${item.name}

          </h3>

          <p>

            数量：
            ${item.qty}

          </p>

          <div class="price">

            ¥${subtotal.toLocaleString()}

          </div>

        </div>

      </div>

    `;

  });

  target.innerHTML += `

    <h2>

      合計
      ¥${total.toLocaleString()}

    </h2>

  `;

}