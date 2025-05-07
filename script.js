// Настройте праздники и связи
const holidays = [
  '2025-05-01',
  '2025-05-02',
  '2025-05-08',
  '2025-05-09',
  // Добавьте свои даты
];

const specialDays = [
  '2025-05-12',
  '2025-05-19',
  // Добавьте свои даты
];

const dateLinks = {
  '2025-05-06': ['2025-05-12', '2025-05-13'],
  '2025-05-07': ['2025-05-16', '2025-05-17'],

  // Добавьте свои связи
};

// Определяет, когда показывать следующий месяц
const SWITCH_DAY = 28; // Например, с 28 числа показываем следующий месяц

function pad(n) {
  return n < 10 ? '0' + n : n;
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getMonthToShow() {
  const today = new Date();
  if (today.getDate() >= SWITCH_DAY) {
    // Показать следующий месяц
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

  // Заголовок месяца
  const caption = document.createElement('caption');
  caption.textContent = `${monthNames[month]} ${year}`;
  table.appendChild(caption);

  // Заголовки дней недели
  let thead = document.createElement('thead');
  let tr = document.createElement('tr');
  weekDays.forEach(day => {
    let th = document.createElement('th');
    th.textContent = day;
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  table.appendChild(thead);

  // Даты
  let tbody = document.createElement('tbody');
  let firstDay = new Date(year, month, 1);
  let lastDay = new Date(year, month + 1, 0);

  // День недели первого дня месяца (0 - Воскресенье, 1 - Понедельник, ...)
  let startDay = (firstDay.getDay() + 6) % 7; // Приводим к понедельнику
  let daysInPrevMonth = new Date(year, month, 0).getDate();

  let todayStr = formatDate(new Date());

  // Получаем связанные даты для сегодняшней даты
  const linkedDatesForToday = new Set(dateLinks[todayStr] || []);

  let days = [];
  // Заполнение предыдущими днями
  for (let i = 0; i < startDay; i++) {
    days.push({
      date: new Date(year, month - 1, daysInPrevMonth - startDay + i + 1),
      otherMonth: true
    });
  }
  // Текущий месяц
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({
      date: new Date(year, month, d),
      otherMonth: false
    });
  }
  // Следующий месяц (до конца строки)
  while (days.length % 7 !== 0) {
    days.push({
      date: new Date(year, month + 1, days.length - (startDay + lastDay.getDate()) + 1),
      otherMonth: true
    });
  }

  // Рисуем строки
  for (let i = 0; i < days.length; i += 7) {
    let tr = document.createElement('tr');
    for (let j = 0; j < 7; j++) {
      let dayObj = days[i + j];
      let td = document.createElement('td');
      let dateStr = formatDate(dayObj.date);
      td.textContent = dayObj.date.getDate();

      // Выходные (Сб=5, Вс=6)
      if (j >= 5) td.classList.add('weekend');

      // Праздники
      if (holidays.includes(dateStr)) td.classList.add('holiday');

      // Специальные дни
      if (specialDays.includes(dateStr)) td.classList.add('special-day');

      // Сегодня
      if (dateStr === todayStr && !dayObj.otherMonth) td.classList.add('today');

      // Другой месяц
      if (dayObj.otherMonth) td.classList.add('other-month');

      // Подсветка связанных дней только для сегодняшней даты
      if (linkedDatesForToday.has(dateStr)) td.classList.add('linked-day');

      // Для связи дат
      td.dataset.date = dateStr;

      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  calendarDiv.appendChild(table);

  currentTable = table;
}

// Навешиваем обработчик клика один раз, используя делегирование
document.addEventListener('DOMContentLoaded', () => {
  const { year, month } = getMonthToShow();
  generateCalendar(year, month);

  document.getElementById('calendar').addEventListener('click', function (e) {
    if (e.target.tagName !== 'TD') return;
    if (!currentTable) return;

    let clickedDate = e.target.dataset.date;
    // Сбросить подсветку linked-day
    // currentTable.querySelectorAll('.linked-day').forEach(td => td.classList.remove('linked-day'));

    if (dateLinks[clickedDate]) {
      dateLinks[clickedDate].forEach(linked => {
        let linkedTd = currentTable.querySelector(`td[data-date="${linked}"]`);
        if (linkedTd) linkedTd.classList.add('linked-day');
      });
    }
  });
});
