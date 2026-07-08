// =========================
// 管理画面認証チェック
// =========================

(function(){

  const token =
    localStorage.getItem("adminToken");


  // トークンなし
  if(!token){

    location.href =
      "admin-login.html";

    return;

  }


})();