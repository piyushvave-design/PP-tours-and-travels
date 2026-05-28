/**
 * P&P TOURS — SCROLL
 * Intersection Observer for reveal animations + slide tracking
 */

'use strict';

(function() {

  const rc     = document.getElementById('reelContainer');
  const slides = Array.from(document.querySelectorAll('.reel'));

  if (!rc || !slides.length) return;

  /* ── Reveal animation observer ── */
  const revealObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      // Animate all reveal children in the entering slide
      entry.target.querySelectorAll('.reveal, .reveal-scale, .reveal-fade').forEach(function(el) {
        requestAnimationFrame(function() { el.classList.add('in'); });
      });
    });
  }, { root: rc, threshold: 0.18 });

  /* ── Active slide observer (for dots + nav) ── */
  const slideObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.45) return;
      const id = entry.target.id;
      if (typeof setActiveDot === 'function') setActiveDot(id);
    });
  }, { root: rc, threshold: 0.45 });

  slides.forEach(function(slide) {
    revealObs.observe(slide);
    slideObs.observe(slide);
  });

  /* ── Trigger first slide immediately ── */
  const firstSlide = document.getElementById('slide-0');
  if (firstSlide) {
    firstSlide.querySelectorAll('.reveal, .reveal-scale, .reveal-fade').forEach(function(el) {
      el.classList.add('in');
    });
  }

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-question').forEach(function(q) {
    q.addEventListener('click', function() {
      const item    = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('open'); });
      // Open this one unless it was already open
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ── Location tabs ── */
  window.switchLoc = function(id, btn) {
    document.querySelectorAll('.loc-panel').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.loc-tab').forEach(function(t) { t.classList.remove('active'); });
    const panel = document.getElementById('loc-' + id);
    if (panel) panel.classList.add('active');
    if (btn) btn.classList.add('active');
  };

  /* ── Card tilt on desktop hover ── */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.fleet-card, .driver-card, .trust-badge').forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        const r  = card.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top  + r.height / 2;
        const dx = (e.clientX - cx) / (r.width  / 2);
        const dy = (e.clientY - cy) / (r.height / 2);
        card.style.transform = 'translateY(-5px) perspective(600px) rotateX(' + (dy * -3) + 'deg) rotateY(' + (dx * 3) + 'deg)';
        card.style.transformStyle = 'preserve-3d';
      }, { passive: true });
      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
        card.style.transformStyle = '';
      });
    });
  }

  /* ── Button ripple ── */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Inject keyframe once
    if (!document.getElementById('pp-ripple-kf')) {
      const s = document.createElement('style');
      s.id = 'pp-ripple-kf';
      s.textContent = '@keyframes ppRipple{to{transform:scale(1);opacity:0}}';
      document.head.appendChild(s);
    }

    document.querySelectorAll('.btn, .booking-submit, .nav-cta, .calc-btn').forEach(function(btn) {
      if (btn._hasRipple) return;
      btn._hasRipple = true;
      btn.addEventListener('click', function(e) {
        const r    = btn.getBoundingClientRect();
        const size = Math.max(r.width, r.height) * 1.5;
        const x    = e.clientX - r.left - size / 2;
        const y    = e.clientY - r.top  - size / 2;
        const rpl  = document.createElement('span');
        Object.assign(rpl.style, {
          position: 'absolute', width: size + 'px', height: size + 'px',
          left: x + 'px', top: y + 'px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', transform: 'scale(0)',
          animation: 'ppRipple 0.5s ease-out forwards',
          pointerEvents: 'none', zIndex: '99'
        });
        btn.appendChild(rpl);
        setTimeout(function() { rpl.remove(); }, 550);
      });
    });
  }

})();
