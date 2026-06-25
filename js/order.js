async function sendOrder(){

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

  if(!customerName){
    alert('お名前を入力してください');
    return;
  }

  if(!customerTel){
    alert('電話番号を入力してください');
    return;
  }

  const sessionId =
    localStorage.getItem(
      'sessionId'
    );

  try{

    const res =
      await fetch(
        API_URL + '/api/order',
        {
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({
            sessionId,
            customerName,
            customerTel,
            memo
          })
        }
      );

    const json =
      await res.json();

    if(json.success){

      alert(
        '注文ありがとうございました'
      );

      location.href =
        'index.html';

    }else{

      alert(
        '注文送信エラー'
      );

    }

  }catch(error){

    console.error(error);

    alert(
      '通信エラーが発生しました'
    );

  }

}