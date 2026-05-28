window.addEventListener(
  'DOMContentLoaded',
  () => {

    const date =
      localStorage.getItem(
        'bbqDate'
      );

    document.getElementById(
      'selectedDate'
    ).innerText = date;

  }
);

async function sendBbqOrder(){

  const pickupDate =
    localStorage.getItem(
      'bbqDate'
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
        'BBQ予約',

      total: 0

    })

  });

  alert('BBQ予約完了');

  localStorage.removeItem(
    'bbqDate'
  );

  location.href =
    'bbq.html';

}