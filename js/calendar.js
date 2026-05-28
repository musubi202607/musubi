async function loadCalendar() {

  const response =
    await fetch(
      API_URL + '?mode=calendar'
    );

  const calendar =
    await response.json();

  const target =
    document.getElementById(
      'calendar'
    );

  if(!target) return;

  target.innerHTML = '';

  calendar.forEach(day => {

    const disabled =
      day.status === '×'
      ? 'disabled'
      : '';

    target.innerHTML += `

      <button

        class="calendar-day"

        ${disabled}

        onclick="
          selectDate(
            '${day.date}'
          )
        "

      >

        ${day.date}

        <br>

        ${day.status}

      </button>

    `;
  });

}

function selectDate(date){

  document.getElementById(
    'pickupDate'
  ).value = date;

  document
    .querySelectorAll(
      '.calendar-day'
    )
    .forEach(btn => {

      btn.classList.remove(
        'selected'
      );

    });

  event.target.classList.add(
    'selected'
  );
}

loadCalendar();