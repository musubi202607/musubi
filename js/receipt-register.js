// =========================
// 領収書登録
// receipt-register.js
// 修正版
// 1/3
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

let isSaving = false;



// =========================
// 初期処理
// =========================

document.addEventListener(

    "DOMContentLoaded",

    () => {


        const bindClick = (id, fn) => {

            const el =
                document.getElementById(id);

            if(el){

                el.addEventListener(
                    "click",
                    fn
                );

            }

        };



        const bindChange = (id, fn) => {

            const el =
                document.getElementById(id);

            if(el){

                el.addEventListener(
                    "change",
                    fn
                );

            }

        };



        bindChange(
            "receipt-image",
            handleImageSelect
        );


        bindChange(
            "receipt-camera",
            handleImageSelect
        );



        bindClick(
            "camera-button",
            () => {

                document
                    .getElementById(
                        "receipt-camera"
                    )
                    .click();

            }
        );



        bindClick(
            "file-button",
            () => {

                document
                    .getElementById(
                        "receipt-image"
                    )
                    .click();

            }
        );



        bindClick(
            "ocr-button",
            executeReceiptOCR
        );



        bindClick(
            "save-expense",
            saveExpense
        );


    }

);






// =========================
// 画像選択
// HEIC対応
// =========================

async function handleImageSelect(event){


    const file =
        event.target.files[0];


    if(!file){

        return;

    }



    try{


        receiptFile =

            await compressImage(
                file
            );



        receiptImageUrl = "";

        ocrData = null;



        showPreview(
            receiptFile
        );



        console.log(

            "Compressed Image",

            receiptFile

        );


    }

    catch(error){


        console.error(

            "Image Convert Error",

            error

        );


        alert(
            "画像処理に失敗しました"
        );


    }


}








// =========================
// 画像圧縮
// JPEG変換
// =========================

function compressImage(file){


    return new Promise(

        (resolve,reject)=>{


            const reader =
                new FileReader();



            reader.onload = e => {


                const img =
                    new Image();



                img.onload = () => {



                    const canvas =
                        document.createElement(
                            "canvas"
                        );



                    const maxWidth =
                        1600;



                    let width =
                        img.width;


                    let height =
                        img.height;



                    if(width > maxWidth){


                        height *=
                            maxWidth / width;


                        width =
                            maxWidth;


                    }



                    canvas.width =
                        width;


                    canvas.height =
                        height;



                    const ctx =
                        canvas.getContext(
                            "2d"
                        );



                    ctx.drawImage(

                        img,

                        0,

                        0,

                        width,

                        height

                    );





                    canvas.toBlob(


                        blob => {


                            if(!blob){


                                reject(
                                    new Error(
                                        "画像変換失敗"
                                    )
                                );

                                return;

                            }



                            resolve(

                                new File(

                                    [blob],

                                    "receipt.jpg",

                                    {

                                        type:
                                            "image/jpeg"

                                    }

                                )

                            );


                        },


                        "image/jpeg",


                        0.85


                    );



                };



                img.onerror = () => {


                    reject(

                        new Error(
                            "画像読込失敗"
                        )

                    );


                };



                img.src =
                    e.target.result;



            };



            reader.onerror = () => {


                reject(

                    new Error(
                        "ファイル読込失敗"
                    )

                );


            };



            reader.readAsDataURL(
                file
            );


        }

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



    reader.onload = e => {


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
// 年月フォルダ保存
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





    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth()+1
        )
        .padStart(
            2,
            "0"
        );





    // =========================
    // Cloudinaryフォルダ
    // receipts/YYYY-MM/
    // =========================

    const publicId =

        `receipts/${year}-${month}/receipt_${year}${month}${String(now.getDate()).padStart(2,"0")}_${Date.now()}`;





    formData.append(

        "public_id",

        publicId

    );






    const response =

        await fetch(

            `https://api.cloudinary.com/v1_1/${EXPENSE_CLOUDINARY.cloudName}/auto/upload`,

            {

                method:

                    "POST",


                body:

                    formData


            }

        );






    const text =

        await response.text();






    console.log(

        "Cloudinary Response",

        text

    );






    let data;


    try{


        data =
            JSON.parse(
                text
            );


    }

    catch(e){


        throw new Error(

            "Cloudinary応答エラー"

        );


    }







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

async function executeReceiptOCR(){


    try{


        if(!receiptImageUrl){


            const upload =

                await uploadReceiptImage();



            receiptImageUrl =

                upload.url;



            console.log(

                "Receipt Image URL",

                receiptImageUrl

            );


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





    const text =

        await response.text();





    console.log(

        "OCR Response",

        text

    );





    const result =

        parseJSON(
            text
        );





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

    const vendor =

        await getVendorMaster(

            ocrData.supplier

        );





    if(vendor){



        ocrData = {

    ...ocrData,

    category:
        vendor.category ||
        ocrData.category,

    paymentMethod:
        vendor.paymentMethod ||
        ocrData.paymentMethod,

    taxRate:
        convertTaxRate(
            vendor.taxRate ||
            ocrData.taxRate
        ),

    invoiceNo:
        ocrData.invoiceNo ||
        vendor.invoiceNo ||
        ""

};


    }

    else{


        ocrData.taxRate =

            convertTaxRate(

                ocrData.taxRate

            );


    }





    displayOCRResult(

        ocrData

    );


}








// =========================
// JSON解析
// =========================

function parseJSON(text){


    try{


        return JSON.parse(
            text
        );


    }

    catch(error){


        throw new Error(

            "APIがJSONを返していません"

        );


    }


}








// =========================
// 取引先マスタ取得
// =========================

async function getVendorMaster(supplier){


    if(!supplier){


        return null;


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





        const text =

            await response.text();





        console.log(

            "Vendor Master Response",

            text

        );





        const result =
          parseJSON(
            text
          );


    if(
        !result ||
        !result.success ||
     !result.data
    ){

      return null;

    }





        return result.data;



    }

    catch(error){


        console.error(

            "vendor master error",

            error

        );



        return null;


    }


}








// =========================
// 税率変換
// =========================

function convertTaxRate(rate){


    if(

        rate === 0.1 ||

        rate === "0.1"

    ){


        return "10%";


    }




    if(

        rate === 0.08 ||

        rate === "0.08"

    ){


        return "8%";


    }





    return rate || "";


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





    setValue(

        "supplier",

        data.supplier

    );





    setValue(

        "trade-date",

        formatDisplayDate(

            data.tradeDate || data.date

        )

    );





    setValue(

        "amount",

        data.amount || data.total

    );





    setValue(

        "tax",

        data.tax

    );





    setValue(

        "category",

        data.category

    );





    setValue(

        "payment-method",

        data.paymentMethod

    );





    setValue(

        "tax-rate",

        convertTaxRate(

            data.taxRate

        )

    );





    setValue(

        "invoice-no",

        data.invoiceNo

    );

    displayReceiptDetails(
    data.details || []
    );

}




// =========================
// 項目セット
// =========================

function setValue(id,value){


    const el =

        document.getElementById(
            id
        );



    if(el && value !== undefined && value !== ""){


        el.value =
            value;


    }


}








// =========================
// 日付表示変換
// yyyy/mm/dd
// ↓
// yyyy-mm-dd
// =========================

function formatDisplayDate(date){


    if(!date){

        return "";

    }



    return date

        .replace(

            /\//g,

            "-"

        );


}


// =========================
// 経費登録
// =========================
async function saveExpense(){

    if(isSaving){
        return;
    }

    isSaving = true;

    const saveButton =
        document.getElementById(
            "save-expense"
        );

    if(saveButton){

        saveButton.disabled = true;
        saveButton.textContent = "登録中...";

    }

    try{

        const getValue = id => {

            const el =
                document.getElementById(id);

            return el
                ? el.value.trim()
                : "";

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
                    ) || 0
                ),

            tax:
                Number(
                    getValue(
                        "tax"
                    ) || 0
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
                ocrData?.ocrText || "",

            details:
                ocrData?.details || [],

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
        // 入力チェック
        // =========================

        if(!ocrData){

            alert(
                "先にOCR解析してください"
            );

            return;

        }

        if(!data.businessType){

            alert(
                "事業区分を入力してください"
            );

            return;

        }

        if(!data.category){

            alert(
                "勘定科目を入力してください"
            );

            return;

        }

        if(!data.amount){

            alert(
                "金額を入力してください"
            );

            return;

        }

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
                        JSON.stringify({

                            mode:
                                "saveExpense",

                            ...data

                        })

                }

            );
                const text =

            await response.text();

        console.log(

            "Expense Save Response",

            text

        );

        const result =

            parseJSON(

                text

            );

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

    finally{

        isSaving = false;

        if(saveButton){

            saveButton.disabled = false;

            saveButton.textContent = "登録";

        }

    }

}

// =========================
// Cloudinaryアップロード確認
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

// =========================
// 明細表示
// 複数税率対応
// =========================

function displayReceiptDetails(details){

    const body =
        document.getElementById(
            "receipt-details-body"
        );


    if(!body){
        return;
    }


    body.innerHTML = "";


    details.forEach(detail=>{


        const tr =
            document.createElement(
                "tr"
            );


        tr.innerHTML = `

<td>
<input
class="detail-tax-rate"
value="${detail.taxRate || ""}"
>
</td>


<td>
<input
class="detail-amount"
type="number"
value="${detail.amount || 0}"
>
</td>


<td>
<input
class="detail-category"
value="${detail.category || ""}"
>
</td>


<td>
<input
class="detail-item"
value="${detail.item || ""}"
>
</td>

`;


        body.appendChild(tr);


    });


}
