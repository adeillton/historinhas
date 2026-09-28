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
const timerEls = document.querySelectorAll('.js-timer');
function updateOfferTimer() {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const remaining = Math.max(0, midnight - now);
  const h = String(Math.floor(remaining / 3600000)).padStart(2, '0');
  const m = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
  const text = `${h}:${m}:${s}`;
  timerEls.forEach(el => { el.textContent = text; });
}
if (timerEls.length) {
  updateOfferTimer();
  setInterval(updateOfferTimer, 1000);
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
