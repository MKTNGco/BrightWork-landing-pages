(function () {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = reducedMotion ? 'none' : '0.35s cubic-bezier(0.16, 1, 0.3, 1)';

  const css = `
    nav {
      transition: height ${ease};
    }
    nav .nav-logo img,
    nav .nav-logo-blue img {
      transition: height ${ease};
    }
    nav .nav-phone,
    nav .nav-link,
    nav .nav-logo-text {
      transition: font-size ${ease};
    }
    nav .nav-phone svg {
      transition: width ${ease}, height ${ease};
    }
    nav .nav-links {
      transition: gap ${ease};
    }
    nav.nav-is-scrolled {
      height: 54px;
    }
    nav.nav-is-scrolled .nav-logo img,
    nav.nav-is-scrolled .nav-logo-blue img {
      height: 41px;
    }
    nav.nav-is-scrolled .nav-logo-text {
      font-size: 15px;
    }
    nav.nav-is-scrolled .nav-phone {
      font-size: 12px;
    }
    nav.nav-is-scrolled .nav-link {
      font-size: 10px;
    }
    nav.nav-is-scrolled .nav-phone svg {
      width: 14px;
      height: 14px;
    }
    nav.nav-is-scrolled .nav-links {
      gap: 22px;
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const THRESHOLD = 32;
  let ticking = false;

  function updateNav() {
    nav.classList.toggle('nav-is-scrolled', window.scrollY > THRESHOLD);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  updateNav();
})();
