(() => {
  const config = window.YORMIO_CONFIG || {};

  const links = {
    privacy: config.privacyUrl,
    terms: config.termsUrl,
    support: config.supportUrl,
    deletion: config.accountDeletionUrl,
  };

  document.querySelectorAll('[data-config-link]').forEach((link) => {
    const url = links[link.dataset.configLink];
    if (url) {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  });

  const storeNote = document.querySelector('#store-note');
  const stores = [
    ['apple', config.appStoreUrl],
    ['google', config.googlePlayUrl],
  ];
  let activeStoreCount = 0;

  stores.forEach(([name, url]) => {
    const button = document.querySelector(`[data-store="${name}"]`);
    if (!button) return;

    if (url) {
      activeStoreCount += 1;
      button.href = url;
      button.target = '_blank';
      button.rel = 'noopener noreferrer';
    } else {
      button.classList.add('is-disabled');
      button.setAttribute('aria-disabled', 'true');
      button.addEventListener('click', (event) => event.preventDefault());
    }
  });

  if (storeNote && activeStoreCount === 2) {
    storeNote.textContent = 'Available on the App Store and Google Play.';
  } else if (storeNote && activeStoreCount === 1) {
    storeNote.textContent = 'One store listing is live. The other is coming soon.';
  }

  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  navToggle?.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('is-open', !open);
    document.body.classList.toggle('nav-open', !open);
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle?.setAttribute('aria-expanded', 'false');
      nav?.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    });
  });

  const header = document.querySelector('.site-header');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  const filters = document.querySelectorAll('.screen-filter');
  const cards = document.querySelectorAll('.screen-card');
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filters.forEach((item) => item.classList.toggle('is-active', item === button));
      cards.forEach((card) => {
        const show = filter === 'all' || card.dataset.theme === filter;
        card.classList.toggle('is-filtered-out', !show);
      });
    });
  });

  document.querySelectorAll('.screen-frame img').forEach((img) => {
    img.addEventListener('error', () => {
      const frame = img.closest('.screen-frame');
      if (!frame || frame.classList.contains('is-missing')) return;
      frame.classList.add('is-missing');
      const message = document.createElement('div');
      message.className = 'missing-image';
      message.innerHTML = `<span>Screenshot slot</span><strong>${img.getAttribute('src').split('/').pop()}</strong>`;
      img.hidden = true;
      frame.appendChild(message);
    });
  });

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
