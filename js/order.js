async function sendOrder() {

  const customerName =
    document.getElementById('customerName').value.trim();

  const customerTel =
    document.getElementById('customerTel').value.trim();

  const memo =
    document.getElementById('memo')?.value.trim() || '';

  if (!customerName) {
    alert('お名前を入力してください');
    return;
  }

  if (!customerTel) {
    alert('電話番号を入力してください');
    return;
  }

  const sessionId = localStorage.getItem('sessionId');

  if (!sessionId) {
    alert('カート情報がありません');
    return;
  }

  // =========================
  // カート取得（Worker）
  // =========================
  const cartRes = await fetch(
    API_URL + '/api/cart/get?sessionId=' + sessionId
  );

  const cart = await cartRes.json();

  if (!cart.length) {
    alert('商品がありません');
    return;
  }

  // =========================
  // ★ここが重要：GASに合わせて送る
  // =========================
  const payload = {
    mode: "saveOrder",
    orderType: "ONIGIRI",
    customerName,
    customerTel,
    memo,
    items: cart
  };

  try {

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (json.success) {

      alert('注文ありがとうございました');

      // Worker側でカート削除してるならOK
      location.href = 'index.html';

    } else {
      alert(json.message || '注文送信エラー');
    }

  } catch (error) {

    console.error(error);
    alert('通信エラーが発生しました');

  }
}