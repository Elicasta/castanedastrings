document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const form = document.querySelector('.proposal-form');
  const toast = document.querySelector('.toast');

  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = (open) => {
    toggle?.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    mobileMenu?.classList.toggle('is-open', open);
    mobileMenu?.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle?.addEventListener('click', () => setMenu(!toggle.classList.contains('is-open')));
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  document.querySelectorAll('.faq-item').forEach((item) => {
    const button = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    button?.setAttribute('aria-expanded', 'false');

    button?.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
        if (openItem === item) return;
        openItem.classList.remove('is-open');
        openItem.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
        const openAnswer = openItem.querySelector('.faq-a');
        if (openAnswer) openAnswer.style.maxHeight = null;
      });

      item.classList.toggle('is-open', !isOpen);
      button.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? null : `${answer.scrollHeight}px`;
    });
  });

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
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

    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${data.get('phone') || '—'}`,
      `Event date: ${data.get('eventDate') || '—'}`,
      `Venue: ${data.get('venue') || '—'}`,
      `Event type: ${data.get('eventType') || '—'}`,
      '',
      'Message:',
      data.get('message') || '—'
    ];

    const subject = encodeURIComponent(`Castaneda Strings inquiry — ${name}`);
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:hello@castanedastrings.com?subject=${subject}&body=${body}`;
    showToast('Opening your email app.');
  });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
});
