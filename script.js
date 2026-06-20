document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  const toast = document.querySelector('[data-toast]');
  const form = document.querySelector('[data-form]');

  const setHeaderState = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 36);
  };
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const closeMenu = () => {
    menuButton?.classList.remove('is-open');
    mobileNav?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = !menuButton.classList.contains('is-open');
    menuButton.classList.toggle('is-open', isOpen);
    mobileNav?.classList.toggle('is-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  mobileNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  document.querySelectorAll('.faq-item').forEach((item) => {
    const button = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    button?.addEventListener('click', () => {
      const shouldOpen = !item.classList.contains('is-open');

      document.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
        if (openItem === item) return;
        openItem.classList.remove('is-open');
        openItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        const openAnswer = openItem.querySelector('.faq-answer');
        if (openAnswer) openAnswer.style.maxHeight = null;
      });

      item.classList.toggle('is-open', shouldOpen);
      button.setAttribute('aria-expanded', String(shouldOpen));
      if (answer) answer.style.maxHeight = shouldOpen ? `${answer.scrollHeight}px` : null;
    });
  });

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
  };

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();

    if (!name || !email) {
      showToast('Add your name and email first.');
      return;
    }

    const eventType = String(data.get('eventType') || 'Event').trim() || 'Event';
    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${data.get('phone') || '—'}`,
      `Event date: ${data.get('eventDate') || '—'}`,
      `Venue / location: ${data.get('venue') || '—'}`,
      `Event type: ${eventType}`,
      `Performance length: ${data.get('duration') || '—'}`,
      `Best contact method: ${data.get('contactMethod') || 'Email'}`,
      '',
      'Special requests:',
      `${data.get('message') || '—'}`
    ];

    const subject = encodeURIComponent(`Castaneda Strings Inquiry — ${eventType} — ${name}`);
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:hello@castanedastrings.com?subject=${subject}&body=${body}`;
    showToast('Opening your email with the inquiry prepared.');
  });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
});
