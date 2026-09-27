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
