// =========================
// 領収書登録
// receipt-register.js
// =========================


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
// 状態保持
// =========================

let receiptFile = null;

let receiptImageUrl = "";

let ocrData = null;



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



    const saveBtn =
      document.getElementById(
        "save-expense"
      );


    if(saveBtn){

      saveBtn.addEventListener(
        "click",
        saveExpense
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


  showPreview(
    file
  );


}






// =========================
// 画像プレビュー
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



  const now =
    new Date();



  const fileName =
    `receipt_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}_${Date.now()}`;



  formData.append(
    "public_id",
    fileName
  );



  const url =
    `https://api.cloudinary.com/v1_1/${EXPENSE_CLOUDINARY.cloudName}/auto/upload`;



  const response =
    await fetch(
      url,
      {

        method:
          "POST",

        body:
          formData

      }
    );



  const data =
    await response.json();



  if(!data.secure_url){

    throw new Error(
      "Cloudinaryアップロード失敗"
    );

  }



  return {

    url:
      data.secure_url,

    publicId:
      data.public_id

  };


}

// =========================
// OCR実行
// =========================

async function executeOCR(imageUrl){


  const response =
    await fetch(

      `${API_URL}/api/ocr`,

      {

        method:
          "POST",

        headers:{

          "Content-Type":
            "application/json"

        },


        body:
          JSON.stringify({

            imageUrl:
              imageUrl

          })

      }

    );



  const result =
    await response.json();



  if(!result.success){

    throw new Error(
      result.message ||
      "OCR失敗"
    );

  }



  ocrData =
    result.data;



  displayOCRResult(
    ocrData
  );


}








// =========================
// OCR結果表示
// =========================

function displayOCRResult(data){


  const area =

    document.getElementById(
      "ocr-result"
    );


  if(area){

    area.style.display =
      "block";

  }




  // =========================
  // 取引先
  // =========================

  const supplier =

    document.getElementById(
      "supplier"
    );


  if(supplier){

    supplier.value =
      data.supplier || "";

  }





  // =========================
  // 取引日
  // =========================

  const tradeDate =

    document.getElementById(
      "trade-date"
    );


  if(tradeDate){

    tradeDate.value =
      data.tradeDate || "";

  }





  // =========================
  // 金額
  // =========================

  const amount =

    document.getElementById(
      "amount"
    );


  if(amount){

    amount.value =
      data.amount || "";

  }





  // =========================
  // 税額
  // =========================

  const tax =

    document.getElementById(
      "tax"
    );


  if(tax){

    tax.value =
      data.tax || "";

  }





  // =========================
  // 勘定科目
  // =========================

  const category =

    document.getElementById(
      "category"
    );


  if(category){

    category.value =
      data.category || "";

  }





  // =========================
  // 支払方法
  // =========================

  const paymentMethod =

    document.getElementById(
      "payment-method"
    );


  if(paymentMethod){

    paymentMethod.value =
      data.paymentMethod || "";

  }





  // =========================
  // 税率
  // =========================

  const taxRate =

    document.getElementById(
      "tax-rate"
    );


  if(taxRate){

    taxRate.value =
      data.taxRate || "";

  }





  // =========================
  // インボイス番号
  // =========================

  const invoiceNo =

    document.getElementById(
      "invoice-no"
    );


  if(invoiceNo){

    invoiceNo.value =
      data.invoiceNo || "";

  }


}

// =========================
// 経費保存
// =========================

async function saveExpense(){


  try{


    // =========================
    // 画像アップロード + OCR
    // =========================

    if(!receiptImageUrl){


      const upload =
        await uploadReceiptImage();


      receiptImageUrl =
        upload.url;


      await executeOCR(
        receiptImageUrl
      );


    }




    // =========================
    // 入力値取得
    // =========================

    const getValue = (id) => {

      const el =
        document.getElementById(id);


      return el
        ?
        el.value
        :
        "";

    };



    const data = {


      businessType:

        getValue(
          "business-type"
        ),



      category:

        getValue(
          "category"
        ),



      supplier:

        getValue(
          "supplier"
        ),



      date:

        getValue(
          "trade-date"
        ),



      amount:

        Number(
          getValue(
            "amount"
          )
          ||
          0
        ),



      tax:

        Number(
          getValue(
            "tax"
          )
          ||
          0
        ),



      taxRate:

        ocrData
        ?
        ocrData.taxRate || ""
        :
        "",



      invoiceNo:

        ocrData
        ?
        ocrData.invoiceNo || ""
        :
        "",



      paymentMethod:

        getValue(
          "payment-method"
        ),



      imageUrl:

        receiptImageUrl,



      ocrText:

        ocrData
        ?
        ocrData.ocrText || ""
        :
        "",



      // =========================
      // 取引先学習
      // =========================

      learnVendor:

        document.getElementById(
          "learn-vendor"
        )
        ?
        document.getElementById(
          "learn-vendor"
        ).checked
        :
        false,



      registeredBy:

        "staff"


    };





    // =========================
    // 保存
    // =========================

    const response =

      await fetch(

        `${API_URL}/api/expenses`,

        {

          method:

            "POST",


          headers:{

            "Content-Type":

              "application/json"

          },


          body:

            JSON.stringify(
              data
            )

        }

      );





    const result =

      await response.json();





    if(!result.success){

      throw new Error(
        result.message
      );

    }





    alert(
      "登録しました"
    );



    location.reload();



  }
  catch(error){


    console.error(
      "saveExpense error",
      error
    );


    alert(
      "保存に失敗しました"
    );


  }


}

// =========================
// Cloudinaryテスト
// =========================

async function testReceiptUpload(){


  try{


    const result =
      await uploadReceiptImage();




    console.log(
      "UPLOAD OK",
      result
    );



    alert(
      "アップロード成功"
    );



  }
  catch(error){


    console.error(
      error
    );



    alert(
      "アップロード失敗"
    );


  }


}
