// =========================
// 初期化
// =========================
window.onload = function(){

  loadUsers();

};


// =========================
// 管理者一覧取得
// =========================
async function loadUsers(){

  try{

    const response =
      await fetch(
        API_URL + "/api/admin/users"
      );

    const result =
      await response.json();

    if(!result.success){

      alert(result.message);

      return;

    }

    let html = "";

    result.users.forEach(user=>{

      html += `

        <tr>

          <td>${user.id}</td>

          <td>${user.name}</td>

          <td>${user.role}</td>

          <td>

            ${
              user.enabled
              ? "有効"
              : "無効"
            }

          </td>

          <td>

            <button
              onclick="editUser('${user.id}')"
            >
              編集
            </button>

            ${
              user.role !== "owner"
              ? `
                <button
                  onclick="deleteUser('${user.id}')"
                >
                  削除
                </button>
              `
              : ""
            }

          </td>

        </tr>

      `;

    });

    document
      .getElementById("userList")
      .innerHTML =
      html;

  }catch(error){

    console.error(error);

    alert("読込失敗");

  }

}


// =========================
// 管理者追加
// =========================
async function addUser(){

  const id =
    document
      .getElementById("id")
      .value
      .trim();

  const name =
    document
      .getElementById("name")
      .value
      .trim();

  const password =
    document
      .getElementById("password")
      .value;

  const role =
    document
      .getElementById("role")
      .value;

  if(
    !id ||
    !name ||
    !password
  ){

    alert("入力してください");

    return;

  }

  const response =
    await fetch(

      API_URL +
      "/api/admin/user/add",

      {

        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:JSON.stringify({

          id,
          name,
          password,
          role

        })

      }

    );

  const result =
    await response.json();

  if(result.success){

    alert("登録しました");

    document.getElementById("id").value="";
    document.getElementById("name").value="";
    document.getElementById("password").value="";

    loadUsers();

  }else{

    alert(result.message);

  }

}


// =========================
// 編集（次で作成）
// =========================
function editUser(id){

  alert(
    "次で実装します"
  );

}


// =========================
// 削除（次で作成）
// =========================
function deleteUser(id){

  alert(
    "次で実装します"
  );

}