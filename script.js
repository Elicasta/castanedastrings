document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  toggle.addEventListener('click', () => {
    const open = toggle.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  /* ---------- Hero entrance ---------- */
  requestAnimationFrame(() => {
    document.querySelector('.hero-copy')?.classList.add('is-ready');
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Inquiry form ---------- */
  const form = document.querySelector('.inquiry-form');
  const toast = document.querySelector('.toast');
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 3600);
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').trim();
      const email = (data.get('email') || '').trim();

      if (!name || !email) {
        showToast('Please add your name and email.');
        return;
      }

      const lines = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${data.get('phone') || '—'}`,
        `Event type: ${data.get('eventType') || '—'}`,
        `Event date: ${data.get('eventDate') || '—'}`,
        `Venue / location: ${data.get('venue') || '—'}`,
        `Estimated performance time: ${data.get('duration') || '—'}`,
        '',
        'About the event:',
        data.get('message') || '—'
      ];

      const subject = encodeURIComponent(`New inquiry — ${data.get('eventType') || 'Event'} — ${name}`);
      const body = encodeURIComponent(lines.join('\n'));
      window.location.href = `mailto:hello@castanedastrings.com?subject=${subject}&body=${body}`;
      showToast('Opening your email to send the inquiry…');
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
