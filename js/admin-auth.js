// =========================
// 管理画面認証チェック
// =========================

(async function(){

  const token =
    localStorage.getItem("adminToken");

  // =========================
  // トークンなし
  // =========================
  if(!token){

    location.href =
      "admin-login.html";

    return;

  }

  try{

    const res =
      await fetch(

        API_URL + "/api/admin/verify",

        {

          headers:{

            Authorization:
              "Bearer " + token

          }

        }

      );

    if(!res.ok){

      localStorage.removeItem("adminToken");

      location.href =
        "admin-login.html";

      return;

    }

    const result =
      await res.json();

    window.adminUser =
      result.user;

  }

  catch(e){

    console.error(e);

    location.href =
      "admin-login.html";

  }

})();