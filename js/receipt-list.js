// =========================
// 領収書一覧
// receipt-list.js
// =========================

document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("search-year");
  const now = new Date();

  // =========================
  // 年設定
  // =========================
  if (year) {
    for (let y = now.getFullYear(); y >= 2025; y--) {
      const option = document.createElement("option");
      option.value = y;
      option.textContent = y + "年";
      year.appendChild(option);
    }
  }

  // =========================
  // URLパラメータ取得
  // =========================
  const params = new URLSearchParams(location.search);
  const paramYear = params.get("year");
  const paramMonth = params.get("month");
  const paramCheck = params.get("check");

  // =========================
  // 初期値設定
  // =========================
  if (paramYear && year) {
    year.value = paramYear;
  } else if (year) {
    year.value = now.getFullYear();
  }

  const month = document.getElementById("search-month");
  if (paramMonth && month) {
    month.value = paramMonth;
  } else if (month) {
    month.value = now.getMonth() + 1;
  }

  const check = document.getElementById("search-check");
  if (paramCheck && check) {
    check.value = paramCheck;
  } else if (check) {
    check.value = "未確認";
  }

  // 初期ロード時にCSV期間も現在の検索年月にセット
  setCsvDatePreset("searchMonth");

  // =========================
  // ボタン設定
  // =========================
  const searchButton = document.getElementById("search-button");
  if (searchButton) {
    searchButton.addEventListener("click", loadReceipts);
  }

  const receiptCsvButton = document.getElementById("receipt-csv-button");
  if (receiptCsvButton) {
    receiptCsvButton.addEventListener("click", exportReceiptCSV);
  }

  const accountingCsvButton = document.getElementById("accounting-csv-button");
  if (accountingCsvButton) {
    accountingCsvButton.addEventListener("click", exportAccountingCSV);
  }

  const blueReturnButton = document.getElementById("blue-return-button");
  if (blueReturnButton) {
    blueReturnButton.addEventListener("click", exportBlueReturnCSV);
  }

  // 期間プリセットボタン
  document.getElementById("btn-preset-last-year")?.addEventListener("click", () => setCsvDatePreset("lastYear"));
  document.getElementById("btn-preset-this-year")?.addEventListener("click", () => setCsvDatePreset("thisYear"));
  document.getElementById("btn-preset-search-month")?.addEventListener("click", () => setCsvDatePreset("searchMonth"));

  loadReceipts();
});

// =========================
// CSV期間プリセット補助関数
// =========================
function setCsvDatePreset(type) {
  const now = new Date();
  const currentYear = now.getFullYear();
  let start = "";
  let end = "";

  if (type === "lastYear") {
    // 前年 1/1 〜 12/31（確定申告用）
    start = `${currentYear - 1}-01-01`;
    end = `${currentYear - 1}-12-31`;
  } else if (type === "thisYear") {
    // 今年 1/1 〜 12/31
    start = `${currentYear}-01-01`;
    end = `${currentYear}-12-31`;
  } else if (type === "searchMonth") {
    // 検索セレクトボックスの年・月（1日〜月末）
    const sYear = document.getElementById("search-year")?.value || currentYear;
    const sMonth = document.getElementById("search-month")?.value;

    if (sMonth) {
      const m = String(sMonth).padStart(2, "0");
      const lastDay = new Date(Number(sYear), Number(sMonth), 0).getDate();
      start = `${sYear}-${m}-01`;
      end = `${sYear}-${m}-${String(lastDay).padStart(2, "0")}`;
    } else {
      start = `${sYear}-01-01`;
      end = `${sYear}-12-31`;
    }
  }

  const startInput = document.getElementById("csv-start-date");
  const endInput = document.getElementById("csv-end-date");
  if (startInput) startInput.value = start;
  if (endInput) endInput.value = end;
}

// =========================
// 領収書一覧取得
// =========================
async function loadReceipts() {
  const year = document.getElementById("search-year")?.value || "";
  const month = document.getElementById("search-month")?.value || "";
  const check = document.getElementById("search-check")?.value || "";

  const url = `${API_URL}/api/receipts` +
    `?year=${encodeURIComponent(year)}` +
    `&month=${encodeURIComponent(month)}` +
    `&check=${encodeURIComponent(check)}`;

  console.log("Receipt Request URL", url);

  try {
    const response = await fetch(url);
    const result = await response.json();

    console.log("Receipt List", result);

    if (!result.success) {
      document.getElementById("receipt-list").innerHTML = "取得失敗";
      return;
    }

    const data = result.data || [];
    updateReceiptSummary(data);
    displayReceipts(data);

  } catch (error) {
    console.error("receipt list error", error);
    document.getElementById("receipt-list").innerHTML = "取得失敗";
  }
}

// =========================
// 検索結果集計
// =========================
function updateReceiptSummary(data) {
  const count = document.getElementById("receipt-count");
  const total = document.getElementById("receipt-total");

  if (count) {
    count.textContent = data.length;
  }

  if (total) {
    const sum = data.reduce((acc, item) => {
      if (item.check === "取消") {
        return acc;
      }
      return acc + Number(item.amount || 0);
    }, 0);

    total.textContent = sum.toLocaleString();
  }
}

// =========================
// 領収書表示
// =========================
function displayReceipts(data) {
  const area = document.getElementById("receipt-list");
  if (!area) return;

  if (!data.length) {
    area.innerHTML = "データがありません";
    return;
  }

  area.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "receipt-card";

    const canceled = item.check === "取消";
    const confirmed = item.check === "確認済";

    let status = "";
    if (canceled) {
      status = '<span style="color:red;">【取消】</span>';
    } else if (confirmed) {
      status = '<span style="color:green;">【確認済】</span>';
    } else {
      status = '<span style="color:orange;">【未確認】</span>';
    }

    const taxRate = formatTaxRate(item.taxRate);

    div.innerHTML = `
      <div>
        <b>${item.date || ""}</b>
        ${status}
      </div>

      <div class="receipt-title">
        ${item.supplier || ""}
      </div>

      <div>
        ${item.category || ""}
      </div>

      <div class="receipt-price">
        ${Number(item.amount || 0).toLocaleString()}円
      </div>

      <div>
        ${item.paymentMethod || ""}
      </div>

      <div class="receipt-buttons">
        <button onclick="toggleReceiptDetail('${item.no}', this)">
          詳細表示
        </button>

        ${!canceled && !confirmed ? `
          <button onclick="confirmReceipt('${item.no}')">
            確認
          </button>
        ` : ""}

        ${!canceled ? `
          <button onclick="cancelReceipt('${item.no}')">
            取消
          </button>
        ` : ""}
      </div>

      <div id="detail-${item.no}" style="
        display:none;
        margin-top:15px;
        padding:12px;
        background:#f5f5f5;
        border-radius:8px;
      ">
        <div><b>領収書番号：</b>${item.no || ""}</div>
        <div><b>税込金額：</b>${Number(item.amount || 0).toLocaleString()}円</div>
        <div><b>税額：</b>${Number(item.tax || 0).toLocaleString()}円</div>
        <div><b>税率：</b>${taxRate}</div>
        <div><b>インボイス番号：</b>${item.invoiceNo || "なし"}</div>
        <div><b>登録者：</b>${item.registeredBy || ""}</div>

        <div style="margin-top:10px;">
          <b>OCR内容</b><br>
          ${item.ocrText || ""}
        </div>

        ${item.imageUrl ? `
          <div style="margin-top:10px;">
            <a href="${item.imageUrl}" target="_blank">
              領収書画像を開く
            </a>
          </div>
        ` : ""}
      </div>
    `;

    area.appendChild(div);
  });
}

// =========================
// 税率表示変換
// =========================
function formatTaxRate(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  let rate = Number(value);
  if (rate <= 1) {
    rate = rate * 100;
  }
  return rate + "%";
}

// =========================
// 詳細開閉
// =========================
function toggleReceiptDetail(no, button) {
  const area = document.getElementById("detail-" + no);
  if (!area) return;

  if (area.style.display === "none") {
    area.style.display = "block";
    if (button) button.textContent = "閉じる";
  } else {
    area.style.display = "none";
    if (button) button.textContent = "詳細表示";
  }
}

// =========================
// CSV共通ダウンロード
// =========================
function downloadCSV(data, filename) {
  const csv = data.map(row => {
    return row.map(value => {
      if (value === null || value === undefined) {
        return "";
      }
      return '"' + String(value).replace(/"/g, '""') + '"';
    }).join(",");
  }).join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// =========================
// 青色申告CSV出力（その年の1年分を一括出力）
// =========================
async function exportBlueReturnCSV(){

  const year = document.getElementById("search-year")?.value || "";
  if (!year) {
    alert("年を選択してください");
    return;
  }

  // ★「month」はあえて送らず、year（年）だけ送る！
  try{
    const response = await fetch(
      `${API_URL}/api/blue-return-csv?year=${year}`
    );

    const result = await response.json();

    if(!result.success){
      alert("青色申告CSV取得失敗");
      return;
    }

    downloadCSV(
      result.data,
      `青色申告仕訳_${year}年分.csv`
    );

  }catch(error){
    console.error(error);
    alert("青色申告CSV出力失敗");
  }
}
// =========================
// 領収書CSV出力（範囲指定対応）
// =========================
async function exportReceiptCSV() {
  const startDate = document.getElementById("csv-start-date")?.value || "";
  const endDate = document.getElementById("csv-end-date")?.value || "";
  const year = document.getElementById("search-year")?.value || "";
  const month = document.getElementById("search-month")?.value || "";

  const btn = document.getElementById("receipt-csv-button");
  const origText = btn ? btn.textContent : "";
  if (btn) {
    btn.disabled = true;
    btn.textContent = "出力中...";
  }

  try {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate,
      year: year,
      month: month
    });

    const response = await fetch(`${API_URL}/api/receipt-csv?${params.toString()}`);
    const result = await response.json();

    if (!result.success) {
      alert("領収書CSV取得失敗: " + (result.error || ""));
      return;
    }

    const filename = startDate && endDate ? `領収書一覧_${startDate}_${endDate}.csv` : "領収書一覧.csv";
    downloadCSV(result.data, filename);

  } catch (error) {
    console.error(error);
    alert("領収書CSV出力失敗");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = origText;
    }
  }
}

// =========================
// 会計CSV出力（範囲指定対応）
// =========================
async function exportAccountingCSV() {
  const startDate = document.getElementById("csv-start-date")?.value || "";
  const endDate = document.getElementById("csv-end-date")?.value || "";

  const btn = document.getElementById("accounting-csv-button");
  const origText = btn ? btn.textContent : "";
  if (btn) {
    btn.disabled = true;
    btn.textContent = "出力中...";
  }

  try {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate
    });

    const response = await fetch(`${API_URL}/api/accounting-csv?${params.toString()}`);
    const result = await response.json();

    if (!result.success) {
      alert("会計CSV取得失敗: " + (result.error || ""));
      return;
    }

    const filename = startDate && endDate ? `会計データ_${startDate}_${endDate}.csv` : "会計データ.csv";
    downloadCSV(result.data, filename);

  } catch (error) {
    console.error(error);
    alert("会計CSV出力失敗");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = origText;
    }
  }
}

// =========================
// 領収書取消
// =========================
async function cancelReceipt(no) {
  if (!confirm("この領収書を取消しますか？")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/receipt-cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ no: no })
    });

    const result = await response.json();
    if (!result.success) {
      alert("取消に失敗しました");
      return;
    }

    alert("取消しました");
    loadReceipts();

  } catch (error) {
    console.error(error);
    alert("取消に失敗しました");
  }
}

// =========================
// 領収書確認済
// =========================
async function confirmReceipt(no) {
  if (!confirm("確認済みにしますか？")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/receipt-confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ no: no })
    });

    const result = await response.json();
    if (!result.success) {
      alert("確認失敗");
      return;
    }

    alert("確認しました");
    loadReceipts();

  } catch (error) {
    console.error(error);
    alert("確認失敗");
  }
}
