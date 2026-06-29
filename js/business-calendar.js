// =========================
// 営業日カレンダー取得
// =========================
async function loadBusinessCalendar() {

  const response =
    await fetch(API_URL + '/api/business-calendar');

  const data = await response.json();

  let html = '';

  data.forEach(row => {

    html += `
      <tr>

        <td>${row.date}</td>

        <td>
          <select id="status-${row.id}">
            <option value="○" ${row.status === '○' ? 'selected' : ''}>○</option>
            <option value="×" ${row.status === '×' ? 'selected' : ''}>×</option>
          </select>
        </td>

        <td>
          <button onclick="saveBusinessCalendar(${row.id})">
            保存
          </button>
        </td>

      </tr>
    `;
  });

  document.getElementById('businessCalendarBody').innerHTML = html;
}


// =========================
// 営業日カレンダー更新
// =========================
async function saveBusinessCalendar(id) {

  const status =
    document.getElementById('status-' + id).value;

  const res = await fetch(API_URL + '/api/business-calendar/update', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id,
      status
    })
  });

  const result = await res.json();

  if (result.ok) {
    alert('保存しました');
  } else {
    alert('保存失敗');
  }
}


// 初期読み込み
loadBusinessCalendar();