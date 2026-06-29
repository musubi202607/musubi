async function sendBbqOptionOrder() {

  console.log("① sendBbqOptionOrder START");

  const cart =
    JSON.parse(localStorage.getItem("bbqOptionCart")) || [];

  console.log("② cart", cart);

  const reservationNo =
    localStorage.getItem("reservationNo") || "";

  console.log("③ reservationNo", reservationNo);

  const bbqDate =
    document.getElementById("bbqDate").value.trim();

  console.log("④ bbqDate", bbqDate);

  const customerName =
    document.getElementById("customerName").value.trim();

  console.log("⑤ customerName", customerName);

  const customerTel =
    document.getElementById("customerTel").value.trim();

  console.log("⑥ customerTel", customerTel);

  console.log("⑦ fetch直前");
  
  // =========================
  // バリデーション
  // =========================
  if (!reservationNo) {
    alert("予約番号がありません");
    return;
  }

  if (!bbqDate) {
    alert("利用日を入力してください");
    return;
  }

  if (!customerName) {
    alert("お名前を入力してください");
    return;
  }

  if (!customerTel) {
    alert("電話番号を入力してください");
    return;
  }

  const telPattern =
    /^[0-9\-]+$/;

  if (!telPattern.test(customerTel)) {
    alert("電話番号を正しく入力してください");
    return;
  }

  // =========================
  // Worker送信
  // =========================
  const response = await fetch(
  API_URL + "/api/bbq/addOrder",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      reservationNo,
      orderDate: bbqDate,
      customerName,
      customerTel,
      items: cart,
      memo
    })
  }
);

console.log("status =", response.status);

const text = await response.text();

console.log("response =", text);

  const result =
    await response.json();

  if (result.success) {

    alert("追加注文を受け付けました");

    localStorage.removeItem(
      "bbqOptionCart"
    );

    location.href =
      "index.html";

  } else {

    alert(
      result.message ||
      "送信エラー"
    );

  }

}