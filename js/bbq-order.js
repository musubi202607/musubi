// =========================
// BBQ予約内容表示
// =========================
async function displayOrder() {

  const productName =
    localStorage.getItem('bbqProductName');

  const price =
    localStorage.getItem('bbqPrice');

  const bbqDate =
    localStorage.getItem('bbqDate');

  const target =
    document.getElementById('orderItems');

  if (!target) return;

  target.innerHTML = `
    <div class="product-card">

      <div class="product-content">

        <h2>${productName || ''}</h2>

        <p>予約日：${bbqDate || ''}</p>

        <div class="price">
          ¥${Number(price || 0).toLocaleString()}
        </div>

      </div>

    </div>
  `;
}


// =========================
// BBQ予約送信
// =========================
async function sendBbqOrder() {

  // =========================
  // 二重送信防止
  // =========================
  if (window.sending) return;
  window.sending = true;

  const btn = document.querySelector('.order-btn');
  if (btn) btn.disabled = true;

  try {

    const customerName =
      document.getElementById('customerName').value.trim();

    const customerTel =
      document.getElementById('customerTel').value.trim();

    const people =
      document.getElementById('people').value.trim();

    const memo =
      document.getElementById('memo').value.trim();

    const orderDate =
      localStorage.getItem('bbqDate');

    const productName =
      localStorage.getItem('bbqProductName');

    const price =
      localStorage.getItem('bbqPrice');

    // =========================
    // バリデーション
    // =========================
    if (!productName) {
      alert('BBQ商品を選択してください');
      return;
    }

    if (!orderDate) {
      alert('予約日を選択してください');
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

    if (!people || Number(people) <= 0) {
      alert('人数を正しく入力してください');
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

      // orderType は今のGASでは使っていないので、必要なら残してOK
      orderType: 'BBQ',

      // GAS側の saveBBQReservation が期待している名前に合わせる
      useDate: orderDate,                    // 利用日
      plan: productName,                     // プラン名
      unitPrice: Number(price || 0),         // 単価

      people: Number(people),
      customerName: customerName,
      customerTel: customerTel,
      memo: memo
      };
      

    // =========================
    // API送信
    // =========================
    const response =
      await fetch(API_URL + '/api/reservations', {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(orderData)

      });

    const result =
      await response.json();

    if (result.success) {

      alert(
        '予約完了しました\n予約番号：' +
        (result.reservationNo || '')
      );

      // =========================
      // localStorageクリア
      // =========================
      localStorage.removeItem('bbqProductId');
      localStorage.removeItem('bbqProductName');
      localStorage.removeItem('bbqPrice');
      localStorage.removeItem('bbqDate');

      location.href = 'index.html';

    } else {

      alert(result.message || '送信エラー');

    }

  } catch (error) {

    console.error(error);
    alert('通信エラーが発生しました');

  } finally {

    // =========================
    // ボタン復活（失敗時用）
    // =========================
    window.sending = false;

    const btn = document.querySelector('.order-btn');
    if (btn) btn.disabled = false;
  }
}


// =========================
// 初期表示
// =========================
displayOrder();