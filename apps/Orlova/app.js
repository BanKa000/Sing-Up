const form = document.querySelector('#request');
const petButtons = [...document.querySelectorAll('[data-pet]')];
const result = document.querySelector('#result');
const message = document.querySelector('#message');
const status = document.querySelector('#status');
const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeZone: 'UTC' });
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Moscow' }).format(new Date());
form.elements.date.min = today;

function updateSelection() {
  for (const button of petButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.pet === form.elements.pet.value));
  }
  result.hidden = true;
}
const draftKey = 'orlova-booking-draft';
const fields = ['pet', 'details', 'date', 'note'];
try {
  const draft = JSON.parse(localStorage.getItem(draftKey) || '{}');
  for (const field of fields) {
    if (typeof draft[field] === 'string') form.elements[field].value = draft[field];
  }
  if (form.elements.date.value < today) form.elements.date.value = '';
} catch {}
updateSelection();

function saveDraft() {
  try {
    const draft = Object.fromEntries(fields.map((field) => [field, form.elements[field].value]));
    localStorage.setItem(draftKey, JSON.stringify(draft));
  } catch {}
  updateSelection();
}
form.addEventListener('input', saveDraft);

const screens = [...document.querySelectorAll('.screen')];
const links = [...document.querySelectorAll('.dock a')];
const studioMap = document.querySelector('#studio-map');
const mapOffline = document.querySelector('#map-offline');

function updateStudioMap() {
  const online = navigator.onLine;
  mapOffline.hidden = online;
  studioMap.hidden = !online;
  if (online && !document.querySelector('#studio').hidden && !studioMap.hasAttribute('src')) {
    studioMap.src = studioMap.dataset.src;
  }
}
window.addEventListener('online', updateStudioMap);
window.addEventListener('offline', updateStudioMap);

function showScreen() {
  const screen = screens.find((item) => '#' + item.id === location.hash) || screens[0];
  for (const item of screens) item.hidden = item !== screen;
  for (const link of links) {
    if (link.hash === '#' + screen.id) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  updateStudioMap();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', showScreen);
showScreen();
for (const button of petButtons) {
  button.addEventListener('click', () => {
    form.elements.pet.value = button.dataset.pet;
    saveDraft();
    location.hash = "booking";
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const details = data.get('details').trim();
  const note = data.get('note').trim();
  const date = data.get('date');
  const lines = [
    'Здравствуйте! Хочу узнать стоимость и записаться на стрижку.',
    'Питомец: ' + data.get('pet'),
    details && 'Порода или кличка: ' + details,
    date && 'Удобная дата: ' + dateFormat.format(new Date(date)),
    note && 'Комментарий: ' + note
  ];
  message.value = lines.filter(Boolean).join('\n');
  document.querySelector('#whatsapp').href =
    'https://wa.me/79956258789?text=' + encodeURIComponent(message.value);
  result.hidden = false;
  status.textContent = 'Запрос готов. Отправьте его студии в мессенджере.';
  message.focus();
});

document.querySelector('#copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(message.value);
    status.textContent = 'Скопировано. Вставьте сообщение в переписку со студией.';
  } catch {
    message.focus();
    message.select();
    status.textContent = 'Текст выделен. Скопируйте его вручную.';
  }
});

const installButton = document.querySelector('#install');
let installPrompt;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});
installButton.addEventListener('click', async () => {
  if (!installPrompt) {
    document.querySelector('#install-help').showModal();
    return;
  }
  const prompt = installPrompt;
  installPrompt = undefined;
  installButton.hidden = true;
  const choice = await prompt.prompt();
  if (choice.outcome === 'dismissed') installButton.hidden = false;
});
if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
  installButton.hidden = true;
}
window.addEventListener('appinstalled', () => { installButton.hidden = true; });
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(console.error);
}
