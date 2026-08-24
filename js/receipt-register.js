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





    const cameraInput =

      document.getElementById(
        "receipt-camera"
      );



    if(cameraInput){

      cameraInput.addEventListener(

        "change",

        handleImageSelect

      );

    }






    const cameraButton =

      document.getElementById(
        "camera-button"
      );



    if(cameraButton){

      cameraButton.addEventListener(

        "click",

        () => {


          document
            .getElementById(
              "receipt-camera"
            )
            .click();


        }

      );

    }







    const fileButton =

      document.getElementById(
        "file-button"
      );



    if(fileButton){

      fileButton.addEventListener(

        "click",

        () => {


          document
            .getElementById(
              "receipt-image"
            )
            .click();


        }

      );

    }








    const ocrButton =

      document.getElementById(
        "ocr-button"
      );



    if(ocrButton){

      ocrButton.addEventListener(

        "click",

        executeReceiptOCR

      );

    }







    const saveButton =

      document.getElementById(
        "save-expense"
      );



    if(saveButton){

      saveButton.addEventListener(

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



  // OCR結果リセット

  receiptImageUrl = "";

  ocrData = null;



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

      "画像を選択してください"

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
// OCR実行ボタン
// =========================

async function executeReceiptOCR(){



  try{



    if(!receiptImageUrl){



      const upload =

        await uploadReceiptImage();




      receiptImageUrl =

        upload.url;



    }







    await executeOCR(

      receiptImageUrl

    );







    alert(

      "OCR解析が完了しました。内容を確認してください。"

    );



  }


  catch(error){



    console.error(

      "OCR error",

      error

    );



    alert(

      "OCRに失敗しました"

    );


  }


}


// =========================
// OCR API
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


// =========================
// 取引先マスタ補完
// =========================

await applyVendorMaster(
  ocrData.supplier
);


// =========================
// OCR結果表示
// =========================

displayOCRResult(
  ocrData
);


}

// =========================
// 取引先マスタ補完
// =========================

async function applyVendorMaster(supplier){


  if(!supplier){

    return;

  }



  try{


    const response =

      await fetch(

        `${API_URL}/api/vendor-master`,

        {


          method:

            "POST",



          headers:{


            "Content-Type":

              "application/json"


          },



          body:

            JSON.stringify({

              supplier:

                supplier

            })


        }

      );




    const result =

      await response.json();





    if(

      !result.success ||

      !result.data

    ){

      return;

    }




    const master =

      result.data;





    // =========================
    // 勘定科目
    // =========================

    const category =

      document.getElementById(
        "category"
      );


    if(

      category &&

      master.category

    ){

      category.value =

        master.category;

    }






    // =========================
    // 支払方法
    // =========================

    const paymentMethod =

      document.getElementById(
        "payment-method"
      );



    if(

      paymentMethod &&

      master.paymentMethod

    ){

      paymentMethod.value =

        master.paymentMethod;

    }






    // =========================
    // 税率
    // =========================

    const taxRate =

      document.getElementById(
        "tax-rate"
      );



    if(
  taxRate &&
  master.taxRate
){


  let rate = master.taxRate;


  if(rate === 0.1){

    rate = "10%";

  }


  if(rate === 0.08){

    rate = "8%";

  }


  taxRate.value =
    rate;


}






    // =========================
    // インボイス番号
    // =========================

    const invoiceNo =

      document.getElementById(
        "invoice-no"
      );



    if(

      invoiceNo &&

      master.invoiceNo

    ){

      invoiceNo.value =

        master.invoiceNo;

    }



  }


  catch(error){


    console.error(

      "vendor master error",

      error

    );


  }


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







  const supplier =

    document.getElementById(
      "supplier"
    );


  if(supplier){

    supplier.value =

      data.supplier || "";

  }







  const tradeDate =

    document.getElementById(
      "trade-date"
    );


  if(tradeDate){

    tradeDate.value =

      data.tradeDate || "";

  }







  const amount =

    document.getElementById(
      "amount"
    );


  if(amount){

    amount.value =

      data.amount || "";

  }







  const tax =

    document.getElementById(
      "tax"
    );


  if(tax){

    tax.value =

      data.tax || "";

  }







  const category =

    document.getElementById(
      "category"
    );


  if(category && data.category){


    category.value =

      data.category;


  }







  const paymentMethod =

    document.getElementById(
      "payment-method"
    );


  if(paymentMethod && data.paymentMethod){


    paymentMethod.value =

      data.paymentMethod;


  }







  const taxRate =

    document.getElementById(
      "tax-rate"
    );


  if(taxRate && data.taxRate){


    taxRate.value =

      data.taxRate;


  }







  const invoiceNo =

    document.getElementById(
      "invoice-no"
    );


  if(invoiceNo && data.invoiceNo){


    invoiceNo.value =

      data.invoiceNo;


  }


}







// =========================
// 経費登録
// =========================

async function saveExpense(){



  try{





    const getValue = (id) => {


      const el =

        document.getElementById(id);



      return el

        ?

        el.value.trim()

        :

        "";

    };







    const businessType =

      getValue(
        "business-type"
      );



    const category =

      getValue(
        "category"
      );



    const amount =

      Number(

        getValue(
          "amount"
        )

        ||

        0

      );







    // =========================
    // 登録前チェック
    // =========================


    if(!ocrData){


      alert(

        "先にOCR解析してください"

      );


      return;


    }







    if(!businessType){


      alert(

        "事業区分を入力してください"

      );


      return;


    }







    if(!category){


      alert(

        "勘定科目を入力してください"

      );


      return;


    }







    if(!amount){


      alert(

        "金額を入力してください"

      );


      return;


    }








    const data = {



      businessType:

        businessType,




      category:

        category,




      supplier:

        getValue(
          "supplier"
        ),




      date:

        getValue(
          "trade-date"
        ),




      amount:

        amount,




      tax:

        Number(

          getValue(
            "tax"
          )

          ||

          0

        ),





      taxRate:

        getValue(
          "tax-rate"
        ),





      invoiceNo:

        getValue(
          "invoice-no"
        ),





      paymentMethod:

        getValue(
          "payment-method"
        ),





      imageUrl:

        receiptImageUrl,





      ocrText:

        ocrData.ocrText || "",





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

        result.message ||

        "保存失敗"

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
