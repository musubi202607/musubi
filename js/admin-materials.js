// =========================
// 材料管理
// Ver.1.0
// =========================

let materials = [];

let filteredMaterials = [];

let editId = null;


// =========================
// 初期化
// =========================

window.addEventListener(

  "DOMContentLoaded",

  async ()=>{

    await loadMaterials();

  }

);


// =========================
// 材料取得
// =========================

async function loadMaterials(){

  try{

    const res =
      await fetch(

        API_URL +
        "/api/materials",

        {

          headers:{

            Authorization:
              "Bearer " +
              localStorage.getItem(
                "adminToken"
              )

          }

        }

      );

    if(!res.ok){

      throw new Error(
        "材料取得失敗"
      );

    }

    materials =
      await res.json();

    if(
      !Array.isArray(materials)
    ){

      materials = [];

    }

    materials.sort(

      (a,b)=>

        Number(a.id) -

        Number(b.id)

    );

    filteredMaterials =

      [...materials];

    renderMaterials();

  }

  catch(error){

    console.error(error);

    document.getElementById(
      "materialList"
    ).innerHTML =

    `

    <div class="card">

      材料一覧の取得に失敗しました。

    </div>

    `;

  }

}


// =========================
// 一覧表示
// =========================

function renderMaterials(){

  const list =

    document.getElementById(
      "materialList"
    );

  if(
    filteredMaterials.length === 0
  ){

    list.innerHTML =

    `

    <div class="card">

      材料がありません。

    </div>

    `;

    return;

  }

  let html = "";

  filteredMaterials.forEach(

    item=>{

      html +=

      `

<div class="material-item">

<div class="material-info">

<div class="material-name">

${escapeHtml(item.name)}

</div>

<div class="material-detail">

ID：

${item.id}

／

${escapeHtml(item.category)}

／

使用：

${item.use}

</div>

</div>

<div class="material-actions">

<button

onclick="openEditModal(

${item.id}

)"

>

編集

</button>

<button

onclick="deleteMaterial(

${item.id}

)"

>

削除

</button>

</div>

</div>

`;

    }

  );

  list.innerHTML =

    html;

}

// =========================
// 検索
// =========================

function filterMaterials(){

  const keyword =

    document
      .getElementById(
        "searchText"
      )
      .value
      .trim()
      .toLowerCase();

  if(keyword === ""){

    filteredMaterials =
      [...materials];

  }else{

    filteredMaterials =

      materials.filter(

        item=>

          String(item.name || "")
            .toLowerCase()
            .includes(keyword)

          ||

          String(item.category || "")
            .toLowerCase()
            .includes(keyword)

          ||

          String(item.id)
            .includes(keyword)

      );

  }

  renderMaterials();

}


// =========================
// 新規追加
// =========================

function openAddModal(){

  editId = null;

  document
    .getElementById(
      "modalTitle"
    )
    .textContent =
      "材料追加";

  document
    .getElementById(
      "materialForm"
    )
    .reset();

  document
    .getElementById(
      "materialId"
    )
    .value = "";

  document
    .getElementById(
      "unitCost"
    )
    .textContent =
      "0.000 円/g";

  document
    .getElementById(
      "materialModal"
    )
    .style.display =
      "block";

}


// =========================
// 編集
// =========================

function openEditModal(id){

  editId = id;

  const item =

    materials.find(

      m=>

        Number(m.id) ===
        Number(id)

    );

  if(!item){

    return;

  }

  document
    .getElementById(
      "modalTitle"
    )
    .textContent =
      "材料編集";

  document
    .getElementById(
      "materialId"
    )
    .value =
      item.id || "";

  document
    .getElementById(
      "materialName"
    )
    .value =
      item.name || "";

  document
    .getElementById(
      "materialCategory"
    )
    .value =
      item.category || "その他";

  document
    .getElementById(
      "materialUse"
    )
    .value =
      item.use || "○";

  document
    .getElementById(
      "useUnit"
    )
    .value =
      item.useUnit || "g";

  document
    .getElementById(
      "purchaseUnit"
    )
    .value =
      item.purchaseUnit || "g";

  document
    .getElementById(
      "purchaseQty"
    )
    .value =
      item.purchaseQty || "";

  document
    .getElementById(
      "purchasePrice"
    )
    .value =
      item.purchasePrice || "";

  document
    .getElementById(
      "stock"
    )
    .value =
      item.stock || "";

  document
    .getElementById(
      "reorderPoint"
    )
    .value =
      item.reorderPoint || "";

  document
    .getElementById(
      "reorderUnit"
    )
    .value =
      item.reorderUnit || "g";

  document
    .getElementById(
      "supplier"
    )
    .value =
      item.supplier || "";

  document
    .getElementById(
      "remarks"
    )
    .value =
      item.remarks || "";

  document
    .getElementById(
      "unitCost"
    ).textContent =

      item.unitCost
      ? `${item.unitCost} 円/${item.useUnit || "g"}`
      : `0.000 円/${item.useUnit || "g"}`;

  document
    .getElementById(
      "materialModal"
    )
    .style.display =
      "block";

  calculateUnitCost();

}


// =========================
// モーダルを閉じる
// =========================

function closeModal(){

  document
    .getElementById(
      "materialModal"
    )
    .style.display =
      "none";

}

// =========================
// 保存
// =========================

document
  .getElementById(
    "materialForm"
  )
  .addEventListener(

    "submit",

    async function(e){

      e.preventDefault();

      const data = {

        id:
          document.getElementById(
            "materialId"
          ).value,

        name:
          document.getElementById(
            "materialName"
          ).value.trim(),

        category:
          document.getElementById(
            "materialCategory"
          ).value,

        useUnit:
          document.getElementById(
            "useUnit"
          ).value,

        purchaseUnit:
          document.getElementById(
            "purchaseUnit"
          ).value,

        purchaseQty:
          Number(
            document.getElementById(
              "purchaseQty"
            ).value || 0
          ),

        purchasePrice:
          Number(
            document.getElementById(
              "purchasePrice"
            ).value || 0
          ),

        stock:
          Number(
            document.getElementById(
              "stock"
            ).value || 0
          ),

        reorderPoint:
          Number(
            document.getElementById(
              "reorderPoint"
            ).value || 0
          ),

        reorderUnit:
          document.getElementById(
            "reorderUnit"
          ).value,

        supplier:
          document.getElementById(
            "supplier"
          ).value.trim(),

        use:
          document.getElementById(
            "materialUse"
          ).value,

        remarks:
          document.getElementById(
            "remarks"
          ).value.trim()

      };

      const url =
        editId
        ? "/api/materials/update"
        : "/api/materials";

      try{

        const res =
          await fetch(

            API_URL + url,

            {

              method:"POST",

              headers:{

                "Content-Type":
                  "application/json",

                Authorization:
                  "Bearer " +
                  localStorage.getItem(
                    "adminToken"
                  )

              },

              body:
                JSON.stringify(data)

            }

          );

        const result =
          await res.json();

        if(
          !res.ok ||
          !result.success
        ){

          throw new Error(
            result.message
          );

        }

        closeModal();

        await loadMaterials();

        alert("保存しました。");

      }

      catch(error){

        console.error(error);

        alert("保存に失敗しました。");

      }

    }

  );


// =========================
// 削除
// =========================

async function deleteMaterial(id){

  if(
    !confirm(
      "削除しますか？"
    )
  ){

    return;

  }

  try{

    const res =
      await fetch(

        API_URL +
        "/api/materials/delete",

        {

          method:"POST",

          headers:{

            "Content-Type":
              "application/json",

            Authorization:
              "Bearer " +
              localStorage.getItem(
                "adminToken"
              )

          },

          body:
            JSON.stringify({

              id:id

            })

        }

      );

    const result =
      await res.json();

    if(
      !result.success
    ){

      throw new Error();

    }

    await loadMaterials();

  }

  catch(error){

    console.error(error);

    alert("削除できませんでした。");

  }

}


// =========================
// 原価単価計算
// =========================

function calculateUnitCost(){

  const qty =
    Number(
      document.getElementById(
        "purchaseQty"
      ).value || 0
    );

  const price =
    Number(
      document.getElementById(
        "purchasePrice"
      ).value || 0
    );

  const purchaseUnit =
    document.getElementById(
      "purchaseUnit"
    ).value;

  const useUnit =
    document.getElementById(
      "useUnit"
    ).value;

  const result =
    convertToUseUnit(
      qty,
      purchaseUnit,
      useUnit
    );

  const area =
    document.getElementById(
      "unitCost"
    );

  if(
    result <= 0 ||
    price <= 0
  ){

    area.textContent =
      `0.000 円/${useUnit}`;

    return;

  }

  const cost =
    price / result;

  area.textContent =
    `${cost.toFixed(3)} 円/${useUnit}`;

}


// =========================
// 単位換算
// =========================

function convertToUseUnit(
  qty,
  purchaseUnit,
  useUnit
){

  if(
    purchaseUnit === useUnit
  ){

    return qty;

  }

  if(
    purchaseUnit === "kg" &&
    useUnit === "g"
  ){

    return qty * 1000;

  }

  if(
    purchaseUnit === "L" &&
    useUnit === "ml"
  ){

    return qty * 1000;

  }

  return qty;

}


// =========================
// HTMLエスケープ
// =========================

function escapeHtml(value){

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}
