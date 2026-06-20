document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggleHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 48);
  };
  toggleHeader();
  window.addEventListener('scroll', toggleHeader, { passive: true });

  const menuButton = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('menu-open', isOpen);
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -42px 0px' });

    revealEls.forEach((el, index) => {
      el.style.transitionDelay = `${Math.min(index % 5, 4) * 55}ms`;
      observer.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  const toast = document.querySelector('.toast');
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
  };

  const sendInquiry = (form, mode = 'home') => {
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();

    if (!name || !email) {
      showToast('Please add your name and email.');
      return;
    }

    const eventType = data.get('eventType') || data.get('serviceType') || 'Event';
    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${data.get('phone') || '—'}`,
      `Event type: ${eventType}`,
      `Event date: ${data.get('eventDate') || '—'}`,
      data.get('eventTime') ? `Event time: ${data.get('eventTime')}` : null,
      `Venue / location: ${data.get('venue') || '—'}`,
      `Desired performance time: ${data.get('duration') || '—'}`,
      `Music style or song requests: ${data.get('musicStyle') || '—'}`,
      data.get('contactMethod') ? `Preferred contact method: ${data.get('contactMethod')}` : null,
      '',
      'Event notes:',
      data.get('message') || '—'
    ].filter(Boolean);

    const subjectPrefix = mode === 'quote' ? 'Quote request' : 'New inquiry';
    const subject = encodeURIComponent(`${subjectPrefix} — ${eventType} — ${name}`);
    const body = encodeURIComponent(lines.join('\n'));

    window.location.href = `mailto:hello@castanedastrings.com?subject=${subject}&body=${body}`;
    showToast('Opening your email to send the inquiry.');
  };

  document.querySelectorAll('.inquiry-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      sendInquiry(form, 'home');
    });
  });

  document.querySelectorAll('.quote-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      sendInquiry(form, 'quote');
    });
  });

  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
