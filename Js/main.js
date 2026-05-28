/**
 * P&P TOURS — MAIN
 * App configuration and initialization
 */

'use strict';

/* ── App config ── */
window.PP_CONFIG = {
  SHEETS_URL: 'https://script.google.com/macros/s/AKfycbwVYgc5XKi1EltBG9_dC-8ZcRO83t_3wJaH0ozb3ozpN2E2Dia1fUA1EvhSaKHYj3tK3A/exec',
  GA_ID:      'G-6D0TFFYF0Q',
  WA_NUMBER:  '917870737475',
  DRIVERS:    ['Kishan Kumar', 'Vishal Kumar']
};

window.PP = window.PP || {};

/* ── DOMContentLoaded init ── */
document.addEventListener('DOMContentLoaded', function() {

  /* Set datetime minimum to now */
  const dtEl = document.getElementById('b-datetime');
  if (dtEl) {
    const now  = new Date();
    const off  = now.getTimezoneOffset() * 60000;
    const local = new Date(now - off).toISOString().slice(0, 16);
    dtEl.min   = local;
    dtEl.value = local;
  }

  /* Active nav link highlight */
  const navLinks = document.querySelectorAll('.nav-link[data-slide]');
  navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      navLinks.forEach(function(l) { l.classList.remove('active'); });
      link.classList.add('active');
    });
  });

  /* Float button: scroll to booking */
  const floatBtn = document.getElementById('floatBookBtn');
  if (floatBtn) {
    floatBtn.addEventListener('click', function() { goToSlide(3); });
  }

  /* Popup buttons */
  const popupBook = document.getElementById('popupBook');
  if (popupBook) { popupBook.addEventListener('click', function() { dismissPopup(); goToSlide(3); }); }

  /* Fleet "Book This Vehicle" buttons — scroll to form */
  document.querySelectorAll('.fleet-card-btn[data-vehicle]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const v = btn.getAttribute('data-vehicle');
      const vehicleEl = document.getElementById('b-vehicle');
      if (vehicleEl && v) vehicleEl.value = v;
      goToSlide(3);
    });
  });

  /* Use-case primary buttons */
  document.querySelectorAll('.usecase-btn-primary[data-slide]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      goToSlide(parseInt(btn.getAttribute('data-slide'), 10));
    });
  });

  /* Sticky bar "Book Now" */
  const sbBook = document.getElementById('stickyBarBook');
  if (sbBook) { sbBook.addEventListener('click', function() { goToSlide(3); }); }

  /* Google Analytics: page view already handled by gtag in <head> */
  PP.trackEvent('page_view', { page_title: 'P&P Tours Homepage' });

  /* Console brand message */
  console.log('%c🚗 P&P Tours & Travels', 'font-size:1.4rem;font-weight:700;color:#c4975a;');
  console.log('%cBihar\'s premium cab service. Starting ₹15/km.', 'color:#7a7268;');

});
