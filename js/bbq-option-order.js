async function sendBbqOptionOrder(){

  const cart =
    JSON.parse(
      localStorage.getItem(
        'bbqOptionCart'
      )
    ) || [];

  if(cart.length === 0){

    alert(
      '商品がありません'
    );

    return;

  }

  const bbqDate =
    document
      .getElementById(
        'bbqDate'
      )
      .value
      .trim();

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

  const memo =
    document
      .getElementById(
        'memo'
      )
      .value
      .trim();

  // BBQ利用日チェック
  if(!bbqDate){

    alert(
      'BBQ利用日を入力してください'
    );

    return;

  }

  // お名前チェック
  if(!customerName){

    alert(
      'お名前を入力してください'
    );

    return;

  }

  // 電話番号チェック
  if(!customerTel){

    alert(
      '電話番号を入力してください'
    );

    return;

  }

  const telPattern =
    /^[0-9\-]+$/;

  if(
    !telPattern.test(
      customerTel
    )
  ){

    alert(
      '電話番号を正しく入力してください'
    );

    return;

  }

 const orderData = {

  orderType:
    'BBQ_OPTION',

  reservationNo:
    localStorage.getItem(
      'reservationNo'
    ) || '',

  orderDate:
    bbqDate,

  items:
    cart,

  customerName:
    customerName,

  customerTel:
    customerTel,

  memo:
    memo

};

  try{

    const response =
      await fetch(
        API_URL,
        {

          method:
            'POST',

          headers:{
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

    if(result.success){

      alert(
        '追加注文を受け付けました'
      );

      localStorage.removeItem(
        'bbqOptionCart'
      );

      location.href =
        'index.html';

    }else{

      alert(
        '送信エラー'
      );

    }

  }catch(error){

    console.error(
      error
    );

    alert(
      '通信エラーが発生しました'
    );

  }

}