async function sendOrder(){

  const sessionId =
    localStorage.getItem("sessionId");

  console.log("sessionId=", sessionId);

  const customerName =
    document.getElementById("customerName").value;

  const customerTel =
    document.getElementById("customerTel").value;

  const memo =
    document.getElementById("memo").value;

  const payload = {
    sessionId,
    customerName,
    customerTel,
    memo
  };

  console.log(payload);

  const res =
    await fetch(
      API_URL + "/api/order",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(payload)
      }
    );

  const json =
    await res.json();

  console.log(json);

}