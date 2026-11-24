// ==========================================
// 領収書登録 フロントエンドスクリプト (最適化版)
// ==========================================

// Cloudinary設定
const EXPENSE_CLOUDINARY = {
    cloudName: "i5pbmztl",
    uploadPreset: "expenses_upload"
};

// 状態保持
let receiptFile = null;
let receiptImageUrl = "";
let ocrData = null;
let isSaving = false;
let isOCRRunning = false;

// =========================
// 初期化
// =========================
document.addEventListener("DOMContentLoaded", () => {
    const bindClick = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", fn);
    };

    const bindChange = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("change", fn);
    };

    bindChange("receipt-image", handleImageSelect);
    bindChange("receipt-camera", handleImageSelect);

    bindClick("camera-button", () => document.getElementById("receipt-camera").click());
    bindClick("file-button", () => document.getElementById("receipt-image").click());
    bindClick("ocr-button", executeReceiptOCR);
    bindClick("save-expense", saveExpense);
});

// =========================
// 画像選択・圧縮処理
// =========================
async function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        receiptFile = await compressImage(file);
        receiptImageUrl = "";
        ocrData = null;
        showPreview(receiptFile);
    } catch (error) {
        console.error("Image Convert Error", error);
        alert("画像の処理に失敗しました");
    }
}

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const maxWidth = 1600;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(blob => {
                    if (!blob) {
                        reject(new Error("画像変換失敗"));
                        return;
                    }
                    resolve(new File([blob], "receipt.jpg", { type: "image/jpeg" }));
                }, "image/jpeg", 0.85);
            };
            img.onerror = () => reject(new Error("画像読込失敗"));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("ファイル読込失敗"));
        reader.readAsDataURL(file);
    });
}

function showPreview(file) {
    const preview = document.getElementById("image-preview");
    if (!preview) return;

    const reader = new FileReader();
    reader.onload = e => {
        preview.src = e.target.result;
        preview.style.display = "block";
    };
    reader.readAsDataURL(file);
}

// =========================
// Cloudinaryアップロード
// =========================
async function uploadReceiptImage() {
    if (!receiptFile) throw new Error("画像を選択してください");

    const formData = new FormData();
    formData.append("file", receiptFile);
    formData.append("upload_preset", EXPENSE_CLOUDINARY.uploadPreset);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const publicId = `receipts/${year}-${month}/receipt_${year}${month}${String(now.getDate()).padStart(2, "0")}_${Date.now()}`;

    formData.append("public_id", publicId);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${EXPENSE_CLOUDINARY.cloudName}/auto/upload`,
        { method: "POST", body: formData }
    );

    const data = await response.json();
    if (!data.secure_url) throw new Error("Cloudinaryアップロード失敗");

    return { url: data.secure_url, publicId: data.public_id };
}

// =========================
// OCR解析実行
// =========================
async function executeReceiptOCR() {
    if (isOCRRunning) return;
    isOCRRunning = true;

    const button = document.getElementById("ocr-button");
    const loading = document.getElementById("ocr-loading");

    if (button) {
        button.disabled = true;
        button.textContent = "OCR解析中...";
    }
    if (loading) loading.style.display = "block";

    try {
        if (!receiptImageUrl) {
            const upload = await uploadReceiptImage();
            receiptImageUrl = upload.url;
        }

        // ★ 選択されたAIモデル（gemini または groq）を取得
        const aiModelElement = document.getElementById("ai-model");
        const aiModel = aiModelElement ? aiModelElement.value : "gemini";

        // GAS側へAIモデル情報を渡して実行
        await executeOCR(receiptImageUrl, aiModel);
        alert("OCR解析が完了しました。内容を確認してください。");
    } catch (error) {
        console.error("OCR error", error);
        alert("OCRに失敗しました: " + error.message);
    } finally {
        isOCRRunning = false;
        if (button) {
            button.disabled = false;
            button.textContent = "OCR解析する";
        }
        if (loading) loading.style.display = "none";
    }
}

// =========================
// OCR API (AIモデル送信対応)
// =========================
async function executeOCR(imageUrl, aiModel = "gemini") {

    const response = await fetch(`${API_URL}/api/ocr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            imageUrl: imageUrl,
            aiModel: aiModel // ★ バックエンドに "gemini" か "groq" を送信
        })
    });

    const result = await response.json();

    // GAS側でエラーが起きていた場合はストップする
    const innerData = result.data;
    if (innerData && (innerData.error || innerData.success === false)) {
        throw new Error("GAS内部エラー: " + (innerData.error || innerData.message));
    }

    if (!result.success) {
        throw new Error(result.message || "OCR失敗");
    }

    // データの階層を自動判定してセット
    ocrData = (innerData && innerData.supplier !== undefined) ? innerData : (innerData?.data || innerData);

    displayOCRResult(ocrData);
}

// =========================
// 画面描画
// =========================
function convertTaxRate(rate) {
    if (rate === 0.1 || rate === "0.1" || rate === 10) return "10%";
    if (rate === 0.08 || rate === "0.08" || rate === 8) return "8%";
    return rate || "";
}

function displayOCRResult(data) {
    const area = document.getElementById("ocr-result");
    if (area) area.style.display = "block";

    setValue("supplier", data.supplier);
    setValue("trade-date", formatDisplayDate(data.tradeDate || data.date));
    setValue("amount", data.amount || data.total);
    setValue("tax", data.tax);
    setValue("category", data.category);
    setValue("payment-method", data.paymentMethod);
    setValue("tax-rate", convertTaxRate(data.taxRate));
    setValue("invoice-no", data.invoiceNo);

    displayReceiptDetails(data.details || []);
}

function displayReceiptDetails(details) {
    const body = document.getElementById("receipt-details-body");
    if (!body) return;
    body.innerHTML = "";

    details.forEach(detail => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><input class="detail-tax-rate" value="${detail.taxRate || ""}"></td>
            <td><input class="detail-amount" type="number" value="${detail.amount || 0}"></td>
            <td><input class="detail-category" value="${detail.category || ""}"></td>
            <td><input class="detail-item" value="${detail.item || ""}"></td>
        `;
        body.appendChild(tr);
    });
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null && value !== "") {
        el.value = value;
    }
}

function formatDisplayDate(date) {
    if (!date) return "";
    return date.replace(/\//g, "-");
}

// =========================
// 経費保存
// =========================
async function saveExpense() {
    if (isSaving) return;
    isSaving = true;

    const saveButton = document.getElementById("save-expense");
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "登録中...";
    }

    try {
        const getValue = id => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : "";
        };

        const data = {
            businessType: getValue("business-type"),
            category: getValue("category"),
            supplier: getValue("supplier"),
            date: getValue("trade-date"),
            amount: Number(getValue("amount") || 0),
            tax: Number(getValue("tax") || 0),
            taxRate: getValue("tax-rate"),
            invoiceNo: getValue("invoice-no"),
            paymentMethod: getValue("payment-method"),
            imageUrl: receiptImageUrl,
            ocrText: ocrData?.ocrText || "",
            details: ocrData?.details || [],
            learnVendor: document.getElementById("learn-vendor") ? document.getElementById("learn-vendor").checked : false,
            registeredBy: "staff"
        };

        if (!ocrData) {
            alert("先にOCR解析してください");
            return;
        }
        if (!data.businessType) {
            alert("事業区分を入力してください");
            return;
        }
        if (!data.category) {
            alert("勘定科目を入力してください");
            return;
        }
        if (!data.amount) {
            alert("金額を入力してください");
            return;
        }

        const response = await fetch(`${API_URL}/api/expenses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: "saveExpense", ...data })
        });

        const result = await response.json();

        if (result.duplicate) {
            alert("この領収書はすでに登録されています\nNo:" + result.no);
            location.reload();
            return;
        }

        if (!result.success) {
            throw new Error(result.message || "保存失敗");
        }

        alert("登録しました");
        location.reload();
    } catch (error) {
        console.error("saveExpense error", error);
        alert("保存に失敗しました: " + error.message);
    } finally {
        isSaving = false;
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = "登録";
        }
    }
}
