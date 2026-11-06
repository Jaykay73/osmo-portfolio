// Lightweight CSS 3D: no rendering library or continuous animation loop.
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  // Show the opening once per tab session. The page remains usable without JavaScript.
  let seenIntro = false;
  try { seenIntro = sessionStorage.getItem('osmo-intro-seen') === '1'; } catch (_) {}
  if (!seenIntro && !reduced.matches && !location.hash) {
    try { sessionStorage.setItem('osmo-intro-seen', '1'); } catch (_) {}
    const previousFocus = document.activeElement;
    const overlay = document.createElement('div');
    overlay.className = 'intro-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Opening Osmo portfolio');
    overlay.innerHTML = `<div class="intro-mark">osmo</div><div class="intro-lens" aria-hidden="true"><div class="intro-rim"><div class="intro-glass"><div class="intro-photo"></div><div class="intro-iris"></div><div class="intro-shine"></div></div></div></div><p class="intro-caption">A DIFFERENT PERSPECTIVE</p><button class="intro-skip" type="button">Skip intro <span aria-hidden="true">&#8599;</span></button>`;
    const photo = overlay.querySelector('.intro-photo');
    photo.style.backgroundImage = "url('assets/photography/hikmarh/books-frame-thumb.webp')";
    const iris = overlay.querySelector('.intro-iris');
    for (let i = 0; i < 8; i++) {
      const blade = document.createElement('span');
      blade.className = 'iris-blade';
      blade.style.setProperty('--blade', i);
      iris.append(blade);
    }
    document.body.append(overlay);
    const skip = overlay.querySelector('.intro-skip');
    const main = document.querySelector('main');
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    [header, main, footer].forEach(el => el.inert = true);
    document.body.classList.add('intro-active');
    skip.focus({preventScroll:true});
    let done = false;
    let openingTimer, closingTimer, removalTimer;
    function closeIntro() {
      if (done) return;
      done = true;
      clearTimeout(openingTimer); clearTimeout(closingTimer);
      overlay.classList.add('is-leaving');
      [header, main, footer].forEach(el => el.inert = false);
      document.body.classList.remove('intro-active');
      if (document.activeElement === skip) previousFocus?.focus?.({preventScroll:true});
      removalTimer = setTimeout(() => overlay.remove(), 350);
    }
    skip.addEventListener('click', closeIntro);
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeIntro();
      if (e.key === 'Tab') { e.preventDefault(); skip.focus(); }
    });
    reduced.addEventListener('change', () => { if (reduced.matches) { closeIntro(); clearTimeout(removalTimer); overlay.remove(); } });
    openingTimer = setTimeout(() => overlay.classList.add('is-open'), 450);
    closingTimer = setTimeout(closeIntro, 2050);
  }

  const bound = new WeakSet();
  function attachTilt(element, limit, eventSurface = element) {
    if (bound.has(element)) return;
    bound.add(element);
    let frame = 0;
    let rect;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      element.style.removeProperty('--rx');
      element.style.removeProperty('--ry');
      element.style.removeProperty('--light-x');
      element.style.removeProperty('--light-y');
      element.classList.remove('is-tilting');
    };
    eventSurface.addEventListener('pointerenter', () => { rect = eventSurface.getBoundingClientRect(); });
    eventSurface.addEventListener('pointermove', event => {
      if (reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
      rect ||= eventSurface.getBoundingClientRect();
      const x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
      const y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        element.style.setProperty('--rx', `${-y * limit}deg`);
        element.style.setProperty('--ry', `${x * limit}deg`);
        element.style.setProperty('--light-x', `${50 + x * 45}%`);
        element.style.setProperty('--light-y', `${35 + y * 45}%`);
        element.classList.add('is-tilting');
      });
    });
    eventSurface.addEventListener('pointerleave', reset);
    eventSurface.addEventListener('pointercancel', reset);
    reduced.addEventListener('change', reset);
    finePointer.addEventListener('change', reset);
  }
  function bindGallery() {
    document.querySelectorAll('.photo-image').forEach(el => attachTilt(el, 7));
  }
  bindGallery();
  new MutationObserver(bindGallery).observe(document.querySelector('#gallery'), {childList:true});

  // Reveal only after observation is available; the page stays visible otherwise.
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    }, {threshold: .08});
    document.querySelectorAll('.section-top, .work-title, .film-layout, .portrait, .about-copy, .brands, .contact h2').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('reveal');
      observer.observe(el);
    });
    reduced.addEventListener('change', () => {
      if (reduced.matches) {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
        observer.disconnect();
      }
    });
  }
})();
