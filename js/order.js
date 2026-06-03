async function sendOrder() {

  const customerName =
    document.getElementById(
      'customerName'
    ).value.trim();

  const customerTel =
    document.getElementById(
      'customerTel'
    ).value.trim();

  const memo =
    document.getElementById(
      'memo'
    )?.value.trim() || '';

  // 未入力チェック
  if (!customerName) {

    alert(
      'お名前を入力してください'
    );

    return;

  }

  if (!customerTel) {

    alert(
      '電話番号を入力してください'
    );

    return;

  }

  const response =
    await fetch(
      API_URL +
      '?mode=products'
    );

  const products =
    await response.json();

  const cart =
    JSON.parse(
      localStorage.getItem(
        'cart'
      )
    ) || [];

  if (cart.length === 0) {

    alert(
      '商品がありません'
    );

    return;

  }

  const items = [];

  cart.forEach(item => {

    const product =
      products.find(
        p => p.id == item.id
      );

    if (!product) return;

    items.push({

      id:
        product.id,

      name:
        product.name,

      price:
        product.price,

      qty:
        item.qty

    });

  });

  const orderData = {

    orderType:
      'ONIGIRI',

    pickupDate:
      '',

    items:
      items,

    customerName:
      customerName,

    customerTel:
      customerTel,

    memo:
      memo

  };

  try {

    const result =
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

    const json =
      await result.json();

    if (json.success) {

      alert(
        '注文ありがとうございました'
      );

      localStorage.removeItem(
        'cart'
      );

      location.href =
        'index.html';

    } else {

      alert(
        '注文送信エラー'
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