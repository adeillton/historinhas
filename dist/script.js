'use strict';

// Images are selected explicitly; the gallery never rotates automatically.
const cover = document.querySelector('#gallery-cover');
const galleryPhoto = document.querySelector('#gallery-photo');
document.querySelectorAll('[data-gallery]').forEach(button => {
  button.addEventListener('click', () => {
    const isCover = button.dataset.gallery === 'cover';
    cover.hidden = !isCover;
    galleryPhoto.hidden = isCover;
    if (!isCover) {
      galleryPhoto.src = button.dataset.gallery;
      galleryPhoto.alt = button.dataset.alt;
    }
    document.querySelectorAll('[data-gallery]').forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  });
});

const preview = document.querySelector('#preview-dialog');
const drawings = [...document.querySelectorAll('[data-preview]')];
let currentDrawing = 0;
let previousFocus;
function showDrawing(index) {
  currentDrawing = Math.max(0, Math.min(drawings.length - 1, index));
  const drawing = drawings[currentDrawing];
  const image = document.querySelector('#preview-image');
  image.src = drawing.dataset.preview;
  image.alt = drawing.dataset.title;
  document.querySelector('#preview-title').textContent = drawing.dataset.title;
  document.querySelector('#preview-count').textContent = 'Prévia ' + (currentDrawing + 1) + ' de ' + drawings.length;
  document.querySelector('#preview-prev').disabled = currentDrawing === 0;
  document.querySelector('#preview-next').disabled = currentDrawing === drawings.length - 1;
}
drawings.forEach((button, index) => button.addEventListener('click', () => {
  previousFocus = button;
  showDrawing(index);
  preview.showModal();
  document.body.classList.add('modal-open');
}));
document.querySelector('#preview-prev').addEventListener('click', () => showDrawing(currentDrawing - 1));
document.querySelector('#preview-next').addEventListener('click', () => showDrawing(currentDrawing + 1));
preview.querySelector('.dialog-close').addEventListener('click', () => preview.close());
preview.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); showDrawing(currentDrawing + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showDrawing(currentDrawing - 1); }
});
preview.addEventListener('click', event => {
  const rect = preview.getBoundingClientRect();
  if (event.target === preview && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) preview.close();
});
preview.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  previousFocus?.focus({preventScroll:true});
});

// The demonstration is fetched on demand, keeping the first view light.
const video = document.querySelector('#product-video');
const playButton = document.querySelector('#play-demo');
playButton.addEventListener('click', async () => {
  const source = video.querySelector('source');
  if (!source.getAttribute('src')) { source.src = source.dataset.src; video.load(); }
  video.controls = true;
  playButton.hidden = true;
  try { await video.play(); } catch { playButton.hidden = false; }
});
video.addEventListener('ended', () => { video.controls = false; playButton.hidden = false; });
document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });

// Forward only campaign attribution, not arbitrary URL or personal data.
const params = new URLSearchParams(location.search);
const allowed = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id','src','sck','fbclid'];
document.querySelectorAll('a.checkout').forEach(link => {
  const checkout = new URL(link.href);
  allowed.forEach(key => {
    const value = params.get(key);
    if (value) checkout.searchParams.set(key, value.slice(0, 250));
  });
  if (!checkout.searchParams.has('src')) checkout.searchParams.set('src', 'site_historinhas');
  if (!checkout.searchParams.has('sck')) {
    checkout.searchParams.set('sck', [params.get('utm_content'), link.dataset.cta].filter(Boolean).join('|').slice(0, 250));
  }
  link.href = checkout.toString();
  link.addEventListener('click', () => {
    // Cakto owns InitiateCheckout/Purchase; a separate click event avoids duplication.
    if (typeof window.fbq === 'function') window.fbq('trackCustom', 'CheckoutClick', {placement:link.dataset.cta});
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({event:'checkout_click', placement:link.dataset.cta});
  });
});

// Keep one prominent mobile purchase action: show the dock between inline CTAs.
const dock = document.querySelector('.buy-dock');
const inlineCtas = [...document.querySelectorAll('main a.checkout')];
if ('IntersectionObserver' in window) {
  const visibleCtas = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.95) visibleCtas.add(entry.target);
      else visibleCtas.delete(entry.target);
    });
    const hide = visibleCtas.size > 0;
    dock.classList.toggle('is-hidden', hide);
    dock.inert = hide;
  }, {threshold:[0,0.95,1], rootMargin:'-78px 0px -15px 0px'});
  inlineCtas.forEach(link => observer.observe(link));
}
