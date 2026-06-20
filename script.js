document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Sticky header ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 60);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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

  /* ---------- Hero reveal ---------- */
  document.querySelector('.hero-mark')?.classList.add('reveal-mark');
  document.querySelector('.bow-line')?.classList.add('draw');

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
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.faq-a').style.maxHeight = null;
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        }
      });
      if (isOpen) {
        item.classList.remove('is-open');
        answer.style.maxHeight = null;
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Contact form ---------- */
  const form = document.querySelector('.proposal-form');
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
        `Event date: ${data.get('eventDate') || '—'}`,
        `Venue: ${data.get('venue') || '—'}`,
        `Event type: ${data.get('eventType') || '—'}`,
        `Performance length: ${data.get('duration') || '—'}`,
        '',
        'Special requests:',
        data.get('message') || '—'
      ];

      const subject = encodeURIComponent(`New inquiry — ${data.get('eventType') || 'Event'} — ${name}`);
      const body = encodeURIComponent(lines.join('\n'));
      const mailto = `mailto:hello@castanedastrings.com?subject=${subject}&body=${body}`;

      window.location.href = mailto;
      showToast('Opening your email to send the inquiry…');
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
