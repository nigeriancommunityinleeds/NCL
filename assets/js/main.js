const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const SLIDES = [
  {
    headline: ['One Community', 'In Leeds'],
    title: 'LACoN',
    meta: 'Football: since 2007',
    text: 'Teams and supporters at the Leeds African Cup of Nations, the one-day tournament that brings African communities and wider Leeds together.',
  },
  {
    headline: ['Culture Worth', 'Celebrating'],
    title: 'Gala Night',
    meta: 'Fundraising: every year',
    text: 'Guests at the annual gala awards night, which raises funds for the Nigeria House Leeds project.',
  },
  {
    headline: ['Learning Every', 'Saturday'],
    title: 'Excel@NCL',
    meta: 'School: term-time Saturdays',
    text: 'Pupils and parents from the supplementary school at Richmond Hill Community Centre, running since 2007.',
  },
];
const SLIDE_INTERVAL_MS = 7000;
const FADER_INTERVAL_MS = 5000;

function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const toTop = document.querySelector('[data-to-top]');
  const update = () => {
    header.classList.toggle('is-stuck', window.scrollY > 24);
    toTop?.classList.toggle('is-visible', window.scrollY > window.innerHeight);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initMenu() {
  const menu = document.querySelector('[data-menu]');
  const open = document.querySelector('[data-menu-open]');
  if (!menu || !open) return;

  open.addEventListener('click', () => menu.showModal());
  menu.addEventListener('click', (event) => {
    const clickedBackdrop = event.target === menu;
    if (clickedBackdrop || event.target.closest('a, [data-menu-close]')) menu.close();
  });
}

function initSlider() {
  const slider = document.querySelector('[data-slider]');
  if (!slider) return;

  const images = [...slider.querySelectorAll('[data-slide]')];
  const headline = slider.querySelector('[data-headline]');
  const title = slider.querySelector('[data-caption-title]');
  const meta = slider.querySelector('[data-caption-meta]');
  const text = slider.querySelector('[data-caption-text]');
  const prevCount = slider.querySelector('[data-prev-count]');
  const nextCount = slider.querySelector('[data-next-count]');
  const dots = [...slider.querySelectorAll('[data-dot]')];
  const total = images.length;
  let index = 0;
  let timer = null;

  const wrap = (i) => (i + total) % total;
  const label = (i) => `${String(wrap(i) + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;

  const show = (next) => {
    index = wrap(next);
    const slide = SLIDES[index];
    images.forEach((image, i) => image.classList.toggle('is-active', i === index));
    headline.replaceChildren(slide.headline[0], document.createElement('br'), slide.headline[1]);
    title.textContent = slide.title;
    meta.textContent = slide.meta;
    text.textContent = slide.text;
    prevCount.textContent = label(index - 1);
    nextCount.textContent = label(index + 1);
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  const start = () => {
    if (reducedMotion.matches || timer) return;
    timer = setInterval(() => show(index + 1), SLIDE_INTERVAL_MS);
  };

  slider.querySelector('[data-prev]').addEventListener('click', () => { stop(); show(index - 1); });
  slider.querySelector('[data-next]').addEventListener('click', () => { stop(); show(index + 1); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { stop(); show(i); }));
  slider.addEventListener('pointerenter', stop);
  slider.addEventListener('pointerleave', start);
  slider.addEventListener('focusin', stop);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  start();
}

function initFader() {
  const fader = document.querySelector('[data-fader]');
  if (!fader) return;

  const items = [...fader.querySelectorAll('[data-fader-item]')];
  const dots = [...fader.querySelectorAll('[data-fader-dot]')];
  let index = 0;
  let timer = null;

  const show = (next) => {
    index = next % items.length;
    items.forEach((item, i) => item.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-current', String(i === index));
    });
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  const start = () => {
    if (reducedMotion.matches || timer) return;
    timer = setInterval(() => show(index + 1), FADER_INTERVAL_MS);
  };

  dots.forEach((dot, i) => dot.addEventListener('click', () => { stop(); show(i); }));
  fader.addEventListener('pointerenter', stop);
  fader.addEventListener('pointerleave', start);
  start();
}

// The site has no server, so the contact form hands the message to the visitor's email app.
function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = data.get('subject') || 'Message from the NCL website';
    const body = `${data.get('message')}\n\n${data.get('name')}`;
    const address = new URL(form.action).pathname;
    window.location.href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

// Membership registration has no server yet, so it also goes through the visitor's email app.
function initMailtoForm() {
  const form = document.querySelector('[data-mailto-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const body = [...new FormData(form)]
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n');
    const address = new URL(form.action).pathname;
    window.location.href = `mailto:${address}?subject=${encodeURIComponent(form.dataset.mailtoForm)}&body=${encodeURIComponent(body)}`;
  });
}

function initReveal() {
  const meter = document.querySelector('.meter');
  if (!meter) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      meter.classList.add('is-visible');
      observer.disconnect();
    },
    { threshold: 1 },
  );
  observer.observe(meter);
}

function initYear() {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
}

initHeader();
initMenu();
initSlider();
initFader();
initContactForm();
initMailtoForm();
initReveal();
initYear();
