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
    window.setTimeout(() => toast.classList.remove('is-visible'), 4200);
  };

  const serializeInquiry = (form, mode = 'home') => {
    const data = new FormData(form);

    return {
      source: mode === 'quote' ? 'Inquiry page' : 'Homepage',
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      eventType: String(data.get('eventType') || data.get('serviceType') || '').trim(),
      eventDate: String(data.get('eventDate') || '').trim(),
      eventTime: String(data.get('eventTime') || '').trim(),
      venue: String(data.get('venue') || '').trim(),
      duration: String(data.get('duration') || '').trim(),
      musicStyle: String(data.get('musicStyle') || '').trim(),
      contactMethod: String(data.get('contactMethod') || '').trim(),
      message: String(data.get('message') || '').trim(),
      companyWebsite: String(data.get('companyWebsite') || '').trim()
    };
  };

  const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const setSubmitState = (form, isSending) => {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;

    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }

    button.disabled = isSending;
    button.setAttribute('aria-busy', String(isSending));
    button.textContent = isSending ? 'Sending…' : button.dataset.originalText;
  };

  const sendInquiry = async (form, mode = 'home') => {
    const payload = serializeInquiry(form, mode);

    if (payload.companyWebsite) {
      // Honeypot field. Act successful so bots do not learn the rule.
      form.reset();
      showToast('Inquiry sent. We’ll be in touch soon.');
      return;
    }

    if (!payload.name || !payload.email) {
      showToast('Please add your name and email.');
      return;
    }

    if (!isValidEmail(payload.email)) {
      showToast('Please enter a valid email address.');
      return;
    }

    setSubmitState(form, true);

    try {
      const response = await fetch('/api/send-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Unable to send inquiry.');
      }

      form.reset();
      showToast('Inquiry sent. We’ll be in touch soon.');
    } catch (error) {
      console.error('Inquiry send failed:', error);
      showToast('Something went wrong. Please email hello@castanedastrings.com.');
    } finally {
      setSubmitState(form, false);
    }
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
