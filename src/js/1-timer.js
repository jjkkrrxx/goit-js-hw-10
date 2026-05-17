import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const datetimePicker = document.querySelector('#datetime-picker');
const startBtn = document.querySelector('[data-start]');
const daysSpan = document.querySelector('[data-days]');
const hoursSpan = document.querySelector('[data-hours]');
const minutesSpan = document.querySelector('[data-minutes]');
const secondsSpan = document.querySelector('[data-seconds]');

let userSelectedDate = null;
let timerInterval = null;

startBtn.disabled = true;

function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}

function updateTimerDisplay() {
  if (!userSelectedDate) return;

  const now = new Date();
  const remainingMs = userSelectedDate - now;

  if (remainingMs <= 0) {
    stopTimer();
    updateTimerDisplayWithValues(0, 0, 0, 0);
    return;
  }

  const { days, hours, minutes, seconds } = convertMs(remainingMs);
  updateTimerDisplayWithValues(days, hours, minutes, seconds);
}

function updateTimerDisplayWithValues(days, hours, minutes, seconds) {
  daysSpan.textContent = addLeadingZero(days);
  hoursSpan.textContent = addLeadingZero(hours);
  minutesSpan.textContent = addLeadingZero(minutes);
  secondsSpan.textContent = addLeadingZero(seconds);
}

function startTimer() {
  if (timerInterval) return;

  datetimePicker.disabled = true;
  startBtn.disabled = true;

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    const now = new Date();
    if (userSelectedDate <= now) {
      stopTimer();
      updateTimerDisplayWithValues(0, 0, 0, 0);
    } else {
      updateTimerDisplay();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  datetimePicker.disabled = false;
  startBtn.disabled = true;
}

function validateAndSetDate(selectedDate) {
  const now = new Date();

  if (selectedDate <= now) {
    iziToast.error({
      title: 'Error',
      message: 'Please choose a date in the future',
      position: 'topRight',
    });
    startBtn.disabled = true;
    return false;
  }

  userSelectedDate = selectedDate;
  startBtn.disabled = false;
  return true;
}

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
    if (selectedDates.length === 0) return;
    validateAndSetDate(selectedDates[0]);
  },
};

flatpickr(datetimePicker, options);

startBtn.addEventListener('click', startTimer);