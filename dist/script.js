'use strict';
const preview = document.querySelector('#preview-dialog');
let previousFocus;
document.querySelectorAll('[data-preview]').forEach(button => {
  button.addEventListener('click', () => {
    previousFocus = button;
    const image = preview.querySelector('img');
    image.src = button.dataset.preview;
    image.alt = button.dataset.title;
    preview.querySelector('p').textContent = button.dataset.title;
    preview.showModal();
    document.body.classList.add('modal-open');
  });
});
preview.querySelector('.dialog-close').addEventListener('click', () => preview.close());
preview.addEventListener('click', event => {
  const r = preview.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) preview.close();
});
preview.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  previousFocus?.focus({preventScroll: true});
});
// Mirrors the 15-minute "oferta por tempo limitado" the Cakto checkout shows.
const timerEls = [...document.querySelectorAll('.js-timer')];
if (timerEls.length) {
  const WINDOW_MS = 15 * 60 * 1000;
  let deadline = 0;
  try {
    const stored = Number(sessionStorage.getItem('offerDeadline'));
    if (stored > Date.now()) deadline = stored;
  } catch {}
  if (!deadline) deadline = Date.now() + WINDOW_MS;
  const paintTimer = () => {
    let left = deadline - Date.now();
    if (left <= 0) {
      deadline = Date.now() + WINDOW_MS;
      left = WINDOW_MS;
    }
    try { sessionStorage.setItem('offerDeadline', String(deadline)); } catch {}
    const m = String(Math.floor(left / 60000)).padStart(2, '0');
    const s = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');
    timerEls.forEach(el => { el.textContent = `${m}:${s}`; });
  };
  paintTimer();
  setInterval(paintTimer, 1000);
}
// Preserve only campaign attribution parameters. Never forward arbitrary query data.
const sourceParams = new URLSearchParams(location.search);
const allowed = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
document.querySelectorAll('a.checkout').forEach(link => {
  const checkout = new URL(link.href);
  allowed.forEach(key => {
    const value = sourceParams.get(key);
    if (value) checkout.searchParams.set(key, value.slice(0, 250));
  });
  link.href = checkout.toString();
});
