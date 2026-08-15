const initialTasks = [
  {
    id: 1,
    task: 'Social Media Management',
    frequency: 'Daily',
    description: 'Plan and publish daily posts, reels, videos, and stories; monitor engagement, comments, messages, and profile visits.'
  },
  {
    id: 2,
    task: 'Content Marketing',
    frequency: 'Daily',
    description: 'Create and manage useful blogs, articles, educational tips, quizzes, stories, and customer success stories.'
  },
  {
    id: 3,
    task: 'SEO & Google Search',
    frequency: 'Daily',
    description: 'Research relevant keywords, understand customer searches, optimise website content, monitor search rankings, and improve organic traffic.'
  },
  {
    id: 4,
    task: 'Competitor & Market Research',
    frequency: 'Daily',
    description: 'Monitor Ninjacart, Hyperpure, WayCool, and other competitors for campaigns, offers, advertisements, websites, SEO, and customer engagement strategies.'
  },
  {
    id: 5,
    task: 'Customer Feedback & Engagement',
    frequency: 'Daily',
    description: 'Monitor comments, messages, reviews, and feedback; identify customer requirements, complaints, and suggestions and share insights with relevant teams.'
  },
  {
    id: 6,
    task: 'Lead Generation & Conversion Tracking',
    frequency: 'Daily',
    description: 'Track enquiries from Google, social media, website, and other digital channels; coordinate with Sales to track marketing → lead → customer.'
  },
  {
    id: 7,
    task: 'Marketing Analytics & Reporting',
    frequency: 'Daily',
    description: 'Prepare regular reports covering reach, engagement, shares, likes, leads, and conversions.'
  },
  {
    id: 8,
    task: 'Google Business Profile & Online Reputation',
    frequency: 'Daily',
    description: 'Manage the Google Business Profile, monitor and respond to reviews, update business information, improve local visibility, and build customer trust.'
  },
  {
    id: 9,
    task: 'Marketing Strategy & Business Improvement',
    frequency: 'Daily',
    description: 'Identify digital marketing opportunities, customer trends, and improvement areas using marketing data, competitor research, and customer insights.'
  }
];

const storageKey = 'digital-marketing-to-do';
const notesKey = 'digital-marketing-notes';
const tableBody = document.getElementById('task-table-body');
const summaryPill = document.getElementById('summary-pill');
const taskForm = document.getElementById('task-form');
const newTaskInput = document.getElementById('new-task-input');
const notesInput = document.getElementById('notes-input');
const saveNotesBtn = document.getElementById('save-notes-btn');
const today = new Date();
let currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
let tasks = [...initialTasks];

function loadStoredTasks() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;

    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length) {
      tasks = parsed;
    }
  } catch (error) {
    console.error('Unable to load tasks', error);
  }
}

function saveStoredTasks() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function loadNotes() {
  const saved = localStorage.getItem(notesKey);
  if (saved) {
    notesInput.value = saved;
  }
}

function saveNotes() {
  localStorage.setItem(notesKey, notesInput.value);
  saveNotesBtn.textContent = 'Saved';
  setTimeout(() => {
    saveNotesBtn.textContent = 'Save Notes';
  }, 1000);
}

loadStoredTasks();
loadNotes();

function getCompletionData() {
  try {
    const saved = localStorage.getItem(`${storageKey}-status`);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
}

let completionData = getCompletionData();

function saveCompletionData() {
  localStorage.setItem(`${storageKey}-status`, JSON.stringify(completionData));
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function compareOnlyDate(a, b) {
  const dateA = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const dateB = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return dateA.getTime() - dateB.getTime();
}

function isSameDay(dateA, dateB) {
  return compareOnlyDate(dateA, dateB) === 0;
}

function isPastDate(date) {
  return compareOnlyDate(date, today) < 0;
}

function isFutureDate(date) {
  return compareOnlyDate(date, today) > 0;
}

function isEditableDate(date) {
  return isSameDay(date, today);
}

function getTaskStatus(taskId, date) {
  const key = getDateKey(date);
  return Boolean(completionData[key] && completionData[key][taskId]);
}

function setTaskStatus(taskId, date, completed) {
  const key = getDateKey(date);

  if (!completionData[key]) {
    completionData[key] = {};
  }

  completionData[key][taskId] = completed;
  saveCompletionData();
}

function renderTable() {
  tableBody.innerHTML = '';

  const completedCount = tasks.filter((task) => getTaskStatus(task.id, selectedDate)).length;
  summaryPill.textContent = `${completedCount} completed for ${selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;

  tasks.forEach((item) => {
    const isCompleted = getTaskStatus(item.id, selectedDate);
    const isLocked = !isEditableDate(selectedDate) || isCompleted;
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>
        <div class="task-name">${item.task}</div>
        <div class="task-description">${item.description}</div>
      </td>
      <td>
        <span class="frequency-badge daily">${item.frequency}</span>
      </td>
      <td>
        <div class="status-cell">
          <input
            class="status-check"
            type="checkbox"
            data-id="${item.id}"
            ${isCompleted ? 'checked' : ''}
            ${isLocked ? 'disabled' : ''}
            aria-label="Mark ${item.task} as complete"
          />
          <span class="status-text ${isCompleted ? 'completed' : ''}">
            ${
              isCompleted
                ? 'Completed'
                : isPastDate(selectedDate) || isFutureDate(selectedDate)
                  ? 'View only'
                  : 'Pending'
            }
          </span>
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });

  document.querySelectorAll('.status-check').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const taskId = Number(event.target.dataset.id);
      if (!isEditableDate(selectedDate)) {
        event.target.checked = false;
        return;
      }

      const wasChecked = event.target.checked;
      if (!wasChecked) {
        return;
      }

      setTaskStatus(taskId, selectedDate, true);
      renderTable();
      renderCalendar(currentDate);
    });
  });
}

const calendarMonth = document.getElementById('calendar-month');
const calendarGrid = document.getElementById('calendar-grid');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

function addTask(taskText) {
  const cleanedText = taskText.trim();
  if (!cleanedText) return;

  const newTask = {
    id: Date.now(),
    task: cleanedText,
    frequency: 'Daily',
    description: 'New custom task added by the user.'
  };

  tasks.push(newTask);
  saveStoredTasks();
  renderTable();
  renderCalendar(currentDate);
}

saveNotesBtn.addEventListener('click', saveNotes);

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(newTaskInput.value);
  newTaskInput.value = '';
});

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const previousMonthLastDay = new Date(year, month, 0).getDate();

  calendarMonth.textContent = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(date);

  calendarGrid.innerHTML = '';

  for (let i = 0; i < startDay; i += 1) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day muted';
    const dayNumber = previousMonthLastDay - startDay + i + 1;
    dayCell.innerHTML = `<span class="day-number">${dayNumber}</span>`;
    calendarGrid.appendChild(dayCell);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const currentCellDate = new Date(year, month, day);
    const isSelected = isSameDay(currentCellDate, selectedDate);
    const isToday = isSameDay(currentCellDate, today);
    const hasAnyCompletion = tasks.some((task) => getTaskStatus(task.id, currentCellDate));

    const dayCell = document.createElement('button');
    dayCell.type = 'button';
    dayCell.className = `calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${hasAnyCompletion ? 'has-task' : ''}`;
    dayCell.setAttribute('aria-label', `View tasks for ${currentCellDate.toDateString()}`);
    dayCell.innerHTML = `
      <span class="day-number">${day}</span>
      <span class="day-dot" aria-hidden="true"></span>
    `;

    dayCell.addEventListener('click', () => {
      selectedDate = new Date(year, month, day);
      renderTable();
      renderCalendar(date);
    });

    calendarGrid.appendChild(dayCell);
  }

  const totalCells = calendarGrid.children.length;
  const nextDays = (7 - (totalCells % 7)) % 7;

  for (let i = 1; i <= nextDays; i += 1) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day muted';
    dayCell.innerHTML = `<span class="day-number">${i}</span>`;
    calendarGrid.appendChild(dayCell);
  }
}

prevMonthBtn.addEventListener('click', () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  renderCalendar(currentDate);
});

nextMonthBtn.addEventListener('click', () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  renderCalendar(currentDate);
});

renderTable();
renderCalendar(currentDate);
