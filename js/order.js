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

  try {

    const params =
      new URLSearchParams({

        mode:
          'saveOrder',

        orderType:
          'ONIGIRI',

        customerName:
          customerName,

        customerTel:
          customerTel,

        memo:
          memo,

        items:
          JSON.stringify(
            items
          )

      });

    const result =
      await fetch(

        API_URL +
        '?' +
        params.toString()

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

        json.message ||

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