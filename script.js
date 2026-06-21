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

  const getFirstParam = (params, keys) => {
    for (const key of keys) {
      const value = params.get(key);
      if (value && value.trim()) return value.trim();
    }
    return '';
  };

  const titleCase = (value = '') => String(value)
    .replace(/[+_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const normalizeMedium = (value = '') => {
    const medium = String(value || '').trim().toLowerCase();
    if (!medium) return '';
    if (['dm', 'dms', 'direct-message', 'direct_message', 'message', 'messages', 'inbox'].includes(medium)) return 'DM';
    if (['bio', 'link-in-bio', 'link_in_bio'].includes(medium)) return 'Bio';
    if (['story', 'stories'].includes(medium)) return 'Story';
    if (['reel', 'reels'].includes(medium)) return 'Reel';
    if (['ad', 'ads', 'paid', 'paid-social', 'paid_social'].includes(medium)) return 'Paid Social';
    if (['referral', 'refer', 'partner'].includes(medium)) return 'Referral';
    return titleCase(medium);
  };

  const detectBrowserContext = (userAgent = '') => {
    const ua = String(userAgent);
    if (/Instagram/i.test(ua)) return 'Instagram in-app browser';
    if (/(FBAN|FBAV|FB_IAB|FB4A|FBIOS|FBDV|FBSV)/i.test(ua)) return 'Facebook in-app browser';
    if (/TikTok/i.test(ua)) return 'TikTok in-app browser';
    if (/LinkedInApp/i.test(ua)) return 'LinkedIn in-app browser';
    return 'Standard browser';
  };

  const inferLeadSource = ({ params, referrer, browserContext }) => {
    const explicitSource = getFirstParam(params, ['utm_source', 'lead_source', 'source', 'src']);
    if (explicitSource) return titleCase(explicitSource);

    const dmValue = getFirstParam(params, ['dm', 'message', 'inbox']);
    if (dmValue && !['1', 'true', 'yes'].includes(dmValue.toLowerCase())) {
      return titleCase(dmValue);
    }

    if (browserContext !== 'Standard browser') {
      return browserContext.replace(' in-app browser', '');
    }

    try {
      const host = new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
      if (host.includes('instagram')) return 'Instagram';
      if (host.includes('facebook') || host.includes('fb.')) return 'Facebook';
      if (host.includes('tiktok')) return 'TikTok';
      if (host.includes('google')) return 'Google';
      return host || 'Referral';
    } catch (error) {
      return 'Direct / Website';
    }
  };

  const inferLeadMedium = ({ params }) => {
    const explicitMedium = getFirstParam(params, ['utm_medium', 'lead_medium', 'medium']);
    if (explicitMedium) return normalizeMedium(explicitMedium);

    const dmValue = getFirstParam(params, ['dm', 'message', 'inbox']);
    if (dmValue) return 'DM';

    return '';
  };

  const buildMessageChannel = ({ leadSource, leadMedium }) => {
    if (leadMedium !== 'DM') return '';
    if (!leadSource || leadSource === 'Direct / Website') return 'DM';
    return `${leadSource} DM`;
  };

  const getAttribution = () => {
    const params = new URLSearchParams(window.location.search);
    const userAgent = navigator.userAgent || '';
    const browserContext = detectBrowserContext(userAgent);
    const referrer = document.referrer || '';
    const landingPage = window.location.href;
    const leadSource = inferLeadSource({ params, referrer, browserContext });
    const leadMedium = inferLeadMedium({ params });
    const referralCode = getFirstParam(params, ['ref', 'referral', 'referral_code', 'code', 'promo', 'partner']);

    const current = {
      leadSource,
      leadMedium,
      messageChannel: buildMessageChannel({ leadSource, leadMedium }),
      referralCode,
      leadCampaign: getFirstParam(params, ['utm_campaign', 'campaign']),
      leadContent: getFirstParam(params, ['utm_content', 'content']),
      leadTerm: getFirstParam(params, ['utm_term', 'term']),
      clickId: params.get('fbclid') ? 'fbclid' : params.get('gclid') ? 'gclid' : params.get('ttclid') ? 'ttclid' : '',
      referrer,
      landingPage,
      currentPage: window.location.href,
      browserContext,
      userAgent
    };

    const hasTrackingSignal = Boolean(
      getFirstParam(params, ['utm_source', 'lead_source', 'source', 'src']) ||
      getFirstParam(params, ['utm_medium', 'lead_medium', 'medium']) ||
      getFirstParam(params, ['dm', 'message', 'inbox']) ||
      referralCode ||
      params.get('fbclid') ||
      params.get('gclid') ||
      params.get('ttclid') ||
      referrer ||
      browserContext !== 'Standard browser'
    );

    try {
      const stored = JSON.parse(localStorage.getItem('castanedaLeadAttribution') || 'null');
      const thirtyDays = 1000 * 60 * 60 * 24 * 30;
      const storedIsFresh = stored?.capturedAt && Date.now() - stored.capturedAt < thirtyDays;

      if (hasTrackingSignal || !storedIsFresh) {
        const next = { ...current, capturedAt: Date.now() };
        localStorage.setItem('castanedaLeadAttribution', JSON.stringify(next));
        return next;
      }

      return { ...stored, currentPage: window.location.href, browserContext, userAgent };
    } catch (error) {
      return { ...current, capturedAt: Date.now() };
    }
  };

  const serializeInquiry = (form, mode = 'home') => {
    const data = new FormData(form);
    const attribution = getAttribution();

    return {
      source: mode === 'quote' ? 'Inquiry page' : 'Homepage',
      leadSource: attribution.leadSource,
      leadMedium: attribution.leadMedium,
      messageChannel: attribution.messageChannel,
      referralCode: attribution.referralCode,
      leadCampaign: attribution.leadCampaign,
      leadContent: attribution.leadContent,
      leadTerm: attribution.leadTerm,
      clickId: attribution.clickId,
      referrer: attribution.referrer,
      landingPage: attribution.landingPage,
      currentPage: attribution.currentPage,
      browserContext: attribution.browserContext,
      userAgent: attribution.userAgent,
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
