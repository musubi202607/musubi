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

        API_URL +
        "/api/admin/verify",

        {

          headers:{

            Authorization:
              "Bearer " + token

          }

        }

      );


    // =========================
    // 認証失敗
    // =========================
    if(!res.ok){


      localStorage.removeItem(
        "adminToken"
      );

      localStorage.removeItem(
        "adminUser"
      );


      location.href =
        "admin-login.html";


      return;

    }



    const result =
      await res.json();



    // =========================
    // ユーザー情報保存
    // =========================
    window.adminUser =
      result.user;



    localStorage.setItem(

      "adminUser",

      JSON.stringify(
        result.user
      )

    );


  }


  catch(e){


    console.error(e);



    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "adminUser"
    );



    location.href =
      "admin-login.html";


  }


})();