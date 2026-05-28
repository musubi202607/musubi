async function sendBbqOrder(){

  const pickupDate =
    document.getElementById(
      'pickupDate'
    ).value;

  const name =
    document.getElementById(
      'customerName'
    ).value;

  const tel =
    document.getElementById(
      'customerTel'
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

      orderText: 'BBQ予約',

      total: 0

    })

  });

  alert('BBQ予約完了');

}