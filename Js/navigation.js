/**
 * P&P TOURS — NAVIGATION
 * Top nav, hamburger drawer, dot nav, scroll progress
 */

'use strict';

(function() {

  const nav       = document.getElementById('topNav');
  const hamburger = document.getElementById('navHamburger');
  const drawer    = document.getElementById('navDrawer');
  const progress  = document.getElementById('navProgress');
  const rc        = document.getElementById('reelContainer');
  const dots      = Array.from(document.querySelectorAll('.dot-nav-item'));
  const slides    = Array.from(document.querySelectorAll('.reel'));

  /* ── Hamburger ── */
  if (hamburger && drawer) {
    hamburger.addEventListener('click', function() {
      const open = drawer.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Close drawer when clicking outside
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target) && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  window.closeDrawer = function() {
    if (drawer) drawer.classList.remove('open');
    if (hamburger) {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  };

  /* ── Scroll handler: nav tint + progress bar ── */
  if (rc) {
    rc.addEventListener('scroll', PP.throttle(function() {
      if (!nav) return;
      nav.classList.toggle('scrolled', rc.scrollTop > 8);

      // Progress bar
      if (progress) {
        const pct = (rc.scrollTop / (rc.scrollHeight - rc.clientHeight)) * 100;
        progress.style.width = PP.clamp(pct, 0, 100) + '%';
      }

      // Hide float book btn when on booking slide
      const bookSlide = document.getElementById('slide-3');
      const floatBtn  = document.getElementById('floatBookBtn');
      if (bookSlide && floatBtn) {
        const r = bookSlide.getBoundingClientRect();
        const onBooking = r.top < window.innerHeight * 0.65 && r.bottom > window.innerHeight * 0.35;
        floatBtn.classList.toggle('hidden', onBooking);
      }
    }, 40), { passive: true });
  }

  /* ── Dot nav click ── */
  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      const idx = parseInt(dot.getAttribute('data-slide'), 10);
      goToSlide(idx);
    });
  });

  /* ── Update active dot ── */
  window.setActiveDot = function(slideId) {
    const idx = parseInt((slideId || '').replace('slide-', ''), 10);
    dots.forEach(function(d) {
      d.classList.toggle('active', parseInt(d.getAttribute('data-slide'), 10) === idx);
    });
  };

  /* ── goToSlide ── */
  window.goToSlide = function(n) {
    const target = document.getElementById('slide-' + n);
    if (!target || !rc) return;
    rc.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    closeDrawer();
  };

})();
