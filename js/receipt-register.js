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

// =========================
// Cloudinary設定
// =========================

const EXPENSE_CLOUDINARY = {

  cloudName:
    "i5pbmztl",

  uploadPreset:
    "expenses_upload"

};




// =========================
// Cloudinaryアップロード
// =========================

async function uploadReceiptImage(){


  if(!receiptFile){

    throw new Error(
      "画像がありません"
    );

  }



  const formData =
    new FormData();



  formData.append(
    "file",
    receiptFile
  );


  formData.append(
    "upload_preset",
    EXPENSE_CLOUDINARY.uploadPreset
  );



  const today =
    new Date();


  const fileName =
    `receipt_${today.getFullYear()}${String(today.getMonth()+1).padStart(2,"0")}${String(today.getDate()).padStart(2,"0")}_${Date.now()}`;



  formData.append(
    "public_id",
    `musubi/expenses/${fileName}`
  );




  const url =
    `https://api.cloudinary.com/v1_1/${EXPENSE_CLOUDINARY.cloudName}/image/upload`;



  const response =
    await fetch(
      url,
      {
        method:"POST",
        body:formData
      }
    );



  const data =
    await response.json();



  if(!data.secure_url){

    throw new Error(
      "画像アップロード失敗"
    );

  }



  return {

    url:data.secure_url,

    publicId:data.public_id

  };


}
