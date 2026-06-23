async function sendBbqOptionOrder() {

  const cart =
    JSON.parse(localStorage.getItem('bbqOptionCart')) || [];

  if (cart.length === 0) {
    alert('商品がありません');
    return;
  }

  const reservationNo =
    localStorage.getItem('reservationNo') || '';

  const bbqDate =
    document.getElementById('bbqDate')?.value?.trim();

  const customerName =
    document.getElementById('customerName')?.value?.trim();

  const customerTel =
    document.getElementById('customerTel')?.value?.trim();

  const memo =
    document.getElementById('memo')?.value?.trim();

  // =========================
  // バリデーション
  // =========================
  if (!reservationNo) {
    alert('予約を選択してください');
    return;
  }

  if (!bbqDate) {
    alert('BBQ利用日を入力してください');
    return;
  }

  if (!customerName) {
    alert('お名前を入力してください');
    return;
  }

  if (!customerTel) {
    alert('電話番号を入力してください');
    return;
  }

  const telPattern = /^[0-9\-]+$/;

  if (!telPattern.test(customerTel)) {
    alert('電話番号を正しく入力してください');
    return;
  }

  // =========================
  // 送信データ
  // =========================
  const orderData = {

    orderType: 'BBQ_OPTION',

    reservationNo,
    orderDate: bbqDate,

    customerName,
    customerTel,

    items: cart,

    memo

  };

  // =========================
  // API送信（Worker統一ルート）
  // =========================
  try {

    const response =
      await fetch(API_URL + '/api/orders', {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(orderData)

      });

    const result =
      await response.json();

    if (result.success) {

      alert('追加注文を受け付けました');

      localStorage.removeItem('bbqOptionCart');

      location.href = 'index.html';

    } else {

      alert('送信エラー');

    }

  } catch (error) {

    console.error(error);
    alert('通信エラーが発生しました');

  }

}