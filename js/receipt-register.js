// =========================
// 領収書登録
// receipt-register.js
// =========================


let receiptFile = null;



// =========================
// 初期処理
// =========================

document.addEventListener(
  "DOMContentLoaded",
  () => {


    const imageInput =
      document.getElementById(
        "receipt-image"
      );


    if(imageInput){

      imageInput.addEventListener(
        "change",
        handleImageSelect
      );

    }


  }
);





// =========================
// 画像選択
// =========================

function handleImageSelect(event){


  const file =
    event.target.files[0];


  if(!file){

    return;

  }


  receiptFile =
    file;



  showPreview(file);


}





// =========================
// プレビュー表示
// =========================

function showPreview(file){


  const preview =
    document.getElementById(
      "image-preview"
    );


  if(!preview){

    return;

  }



  const reader =
    new FileReader();



  reader.onload =
    function(e){


      preview.src =
        e.target.result;


      preview.style.display =
        "block";


    };



  reader.readAsDataURL(
    file
  );


}
