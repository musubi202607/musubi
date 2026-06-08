async function displayOrder(){

  const productName =
    localStorage.getItem(
      'bbqProductName'
    );

  const price =
    localStorage.getItem(
      'bbqPrice'
    );

  const bbqDate =
    localStorage.getItem(
      'bbqDate'
    );

  const target =
    document.getElementById(
      'orderItems'
    );

  target.innerHTML = `

    <div class="product-card">

      <div class="product-content">

        <h2>

          ${productName}

        </h2>

        <p>

          予約日：
          ${bbqDate}

        </p>

        <div class="price">

          ¥${Number(
            price
          ).toLocaleString()}

        </div>

      </div>

    </div>

  `;

}

async function sendBbqOrder() {

  const customerName =
    document
      .getElementById(
        'customerName'
      )
      .value
      .trim();

  const customerTel =
    document
      .getElementById(
        'customerTel'
      )
      .value
      .trim();

  const people =
    document
      .getElementById(
        'people'
      )
      .value
      .trim();

  const memo =
    document
      .getElementById(
        'memo'
      )
      .value
      .trim();

  // お名前チェック
  if (!customerName) {

    alert(
      'お名前を入力してください'
    );

    return;

  }

  // 電話番号チェック
  if (!customerTel) {

    alert(
      '電話番号を入力してください'
    );

    return;

  }

  const telPattern =
    /^[0-9\-]+$/;

  if (
    !telPattern.test(
      customerTel
    )
  ) {

    alert(
      '電話番号を正しく入力してください'
    );

    return;

  }

  // 人数チェック
  if (!people) {

    alert(
      '人数を入力してください'
    );

    return;

  }

  if (
    Number(people) <= 0
  ) {

    alert(
      '人数は1名以上で入力してください'
    );

    return;

  }

  const orderData = {

    orderType:
      'BBQ',

    orderDate:
      localStorage.getItem(
        'bbqDate'
      ),

    productName:
      localStorage.getItem(
        'bbqProductName'
      ),

    price:
      localStorage.getItem(
        'bbqPrice'
      ),

    people:
      people,

    customerName:
      customerName,

    customerTel:
      customerTel,

    memo:
      memo

  };

  try {

    const response =
      await fetch(
        API_URL,
        {

          method:
            'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify(
              orderData
            )

        }
      );

    const result =
      await response.json();

    if (
  result.success
) {

  if(
    result.reservationNo
  ){

    localStorage.setItem(

      'reservationNo',

      result.reservationNo

    );

  }

  alert(

    '予約番号：' +

    result.reservationNo +

    '\n予約完了しました'

  );

  localStorage.removeItem(
    'bbqProductId'
  );

  localStorage.removeItem(
    'bbqProductName'
  );

  localStorage.removeItem(
    'bbqPrice'
  );

  localStorage.removeItem(
    'bbqDate'
  );

  location.href =
    'index.html';

} else {

  alert(
    '送信エラー'
  );

}

      localStorage.removeItem(
        'bbqProductName'
      );

      localStorage.removeItem(
        'bbqPrice'
      );

      localStorage.removeItem(
        'bbqDate'
      );

      location.href =
        'index.html';

    } else {

      alert(
        '送信エラー'
      );

    }

  } catch (error) {

    console.error(
      error
    );

    alert(
      '通信エラーが発生しました'
    );

  }

}