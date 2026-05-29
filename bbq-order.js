window.addEventListener(
  'DOMContentLoaded',
  () => {

    const date =
      localStorage.getItem(
        'bbqDate'
      );

    const productName =
      localStorage.getItem(
        'bbqProductName'
      );

    const price =
      localStorage.getItem(
        'bbqPrice'
      );

    document.getElementById(
      'selectedDate'
    ).innerText = date;

    document.getElementById(
      'bbqOrder'
    ).innerHTML = `

      <div class="product-card">

        <div class="product-content">

          <h3>
            ${productName}
          </h3>

          <div class="price">

            ¥${price}

          </div>

        </div>

      </div>

    `;

  }
);

async function sendBbqOrder(){

  const pickupDate =
    localStorage.getItem(
      'bbqDate'
    );

  const productName =
    localStorage.getItem(
      'bbqProductName'
    );

  const price =
    localStorage.getItem(
      'bbqPrice'
    );

  const name =
    document.getElementById(
      'customerName'
    ).value;

  const tel =
    document.getElementById(
      'customerTel'
    ).value;

  const memo =
    document.getElementById(
      'memo'
    ).value;

  if(!pickupDate){

    alert(
      '予約日を選択してください'
    );

    return;
  }

  if(!name){

    alert(
      'お名前を入力してください'
    );

    return;
  }

  if(!tel){

    alert(
      '電話番号を入力してください'
    );

    return;
  }

  await fetch(API_URL, {

    method: 'POST',

    headers: {
      'Content-Type':
      'application/json'
    },

    body: JSON.stringify({

      pickupDate,

      name,

      tel,

      memo,

      orderText:
        productName,

      total:
        price

    })

  });

  alert(
    'BBQ予約完了'
  );

  localStorage.removeItem(
    'bbqDate'
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

  location.href =
    'bbq.html';

}