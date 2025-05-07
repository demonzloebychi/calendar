// Статические праздники (формат YYYY-MM-DD)
const holidays = [
  '2025-05-01',
  '2025-05-02',
  '2025-05-08',
  '2025-05-09',
  // Добавьте свои даты
];

// Динамические смещения для праздников (через сколько дней после сегодня подсвечивать)
const holidayOffsets = [6, 10, 16, 20, 21];

// Статические специальные дни (формат YYYY-MM-DD)
const specialDays = [
  // '2025-05-12',
  // '2025-05-19',
  // Добавьте свои даты
];

// Динамические offset’ы для специальных дней (число дней после сегодня)
const specialDayOffsets = [7, 9, 14, 17, 23, 28];

// Связанные даты
const dateLinks = {
  // '2025-05-06': ['2025-05-12', '2025-05-13'],
  // Добавьте свои связи
};

const SWITCH_DAY = 28; // переключение месяца

function pad(n) {
  return n < 10 ? '0' + n : n;
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getMonthToShow() {
  const today = new Date();
  if (today.getDate() >= SWITCH_DAY) {
    let nextMonth = today.getMonth() + 1;
    let year = today.getFullYear();
    if (nextMonth > 11) {
      nextMonth = 0;
      year++;
    }
    return { year, month: nextMonth };
  }
  return { year: today.getFullYear(), month: today.getMonth() };
}

let currentTable = null;

function generateCalendar(year, month) {
  const calendarDiv = document.getElementById('calendar');
  calendarDiv.innerHTML = '';

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const table = document.createElement('table');
  table.className = 'calendar-table';

  const caption = document.createElement('caption');
  caption.textContent = `${monthNames[month]} ${year}`;
  table.appendChild(caption);

  let thead = document.createElement('thead');
  let tr = document.createElement('tr');
  weekDays.forEach(day => {
    let th = document.createElement('th');
    th.textContent = day;
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  table.appendChild(thead);

  let tbody = document.createElement('tbody');
  let firstDay = new Date(year, month, 1);
  let lastDay = new Date(year, month + 1, 0);

  let startDay = (firstDay.getDay() + 6) % 7;
  let daysInPrevMonth = new Date(year, month, 0).getDate();

  let today = new Date();
  //new Date(new Date().setDate(new Date().getDate() + 1));
  today.setHours(0, 0, 0, 0);
  let todayStr = formatDate(today);

  // Вычисляем динамические праздники
  const dynamicHolidaysSet = new Set();
  holidayOffsets.forEach(offset => {
    let holidayDate = new Date(today);
    holidayDate.setDate(holidayDate.getDate() + offset);
    dynamicHolidaysSet.add(formatDate(holidayDate));
  });

  // Вычисляем динамические специальные дни
  const dynamicSpecialDaysSet = new Set();
  specialDayOffsets.forEach(offset => {
    let specialDate = new Date(today);
    specialDate.setDate(specialDate.getDate() + offset);
    dynamicSpecialDaysSet.add(formatDate(specialDate));
  });

  // Создаём массив дней для отображения
  let days = [];
  for (let i = 0; i < startDay; i++) {
    days.push({
      date: new Date(year, month - 1, daysInPrevMonth - startDay + i + 1),
      otherMonth: true
    });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({
      date: new Date(year, month, d),
      otherMonth: false
    });
  }
  while (days.length % 7 !== 0) {
    days.push({
      date: new Date(year, month + 1, days.length - (startDay + lastDay.getDate()) + 1),
      otherMonth: true
    });
  }

  // Все связанные даты
  const allLinkedDates = new Set();
  Object.values(dateLinks).forEach(arr => {
    arr.forEach(dateStr => allLinkedDates.add(dateStr));
  });

  for (let i = 0; i < days.length; i += 7) {
    let tr = document.createElement('tr');
    for (let j = 0; j < 7; j++) {
      let dayObj = days[i + j];
      let td = document.createElement('td');
      let dateStr = formatDate(dayObj.date);
      td.textContent = dayObj.date.getDate();

        // Выходные (Сб, Вс) красные
        if (j >= 5) {
          td.classList.add('weekend');
        } else {
          // Прошедшие дни (кроме выходных) красные
          if (dayObj.date < today) {
            td.classList.add('weekend');
          }
        }
      
      // Специальные дни - статические или динамические
      if (specialDays.includes(dateStr) || dynamicSpecialDaysSet.has(dateStr)) {
        td.classList.add('special-day');
      }

      // Праздники - статические или динамические
      if (holidays.includes(dateStr) || dynamicHolidaysSet.has(dateStr)) {
        td.classList.add('holiday');
      }

    



      // Сегодня
      if (dateStr === todayStr && !dayObj.otherMonth) td.classList.add('today');

      // Другой месяц
      if (dayObj.otherMonth) td.classList.add('other-month');

      // Связанные дни
      if (allLinkedDates.has(dateStr)) td.classList.add('linked-day');

      td.dataset.date = dateStr;

      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  calendarDiv.appendChild(table);

  currentTable = table;
}

document.addEventListener('DOMContentLoaded', () => {
  const { year, month } = getMonthToShow();
  generateCalendar(year, month);

  document.getElementById('calendar').addEventListener('click', function (e) {
    if (e.target.tagName !== 'TD') return;
    if (!currentTable) return;

    let clickedDate = e.target.dataset.date;
    currentTable.querySelectorAll('.linked-day').forEach(td => td.classList.remove('linked-day'));

    if (dateLinks[clickedDate]) {
      dateLinks[clickedDate].forEach(linked => {
        let linkedTd = currentTable.querySelector(`td[data-date="${linked}"]`);
        if (linkedTd) linkedTd.classList.add('linked-day');
      });
    }
  });
});
