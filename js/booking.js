/**
 * P&P TOURS — BOOKING
 * Form validation, trip summary, Google Sheets submit, WhatsApp open
 */

'use strict';

(function() {

  /* ── Field IDs ── */
  const FIELDS = ['b-pickup', 'b-drop', 'b-datetime', 'b-vehicle', 'b-triptype', 'b-distance', 'b-name', 'b-phone'];

  const getEl = function(id) { return document.getElementById(id); };

  const form       = getEl('bookingForm');
  const submitBtn  = getEl('bookingSubmit');
  const submitLbl  = getEl('bookingSubmitLabel');
  const successEl  = getEl('bookingSuccess');
  const driverBadge = getEl('driverBadge');

  if (!submitBtn) return;

  /* ── Restore saved phone ── */
  const savedPhone = PP.lsGet('pp_phone');
  if (savedPhone) {
    const phoneEl = getEl('b-phone');
    if (phoneEl && !phoneEl.value) phoneEl.value = savedPhone;
  }

  /* ── Utility: get field value ── */
  function val(id) {
    const el = getEl(id);
    return el ? el.value.trim() : '';
  }

  /* ── Count filled fields ── */
  function countFilled() {
    return FIELDS.filter(function(id) { return val(id) !== ''; }).length;
  }

  /* ── Update submit button state ── */
  function refreshSubmitBtn() {
    const filled  = countFilled();
    const missing = FIELDS.length - filled;
    const enabled = missing === 0 && isPhoneValid();
    submitBtn.disabled = !enabled;
    if (submitLbl) {
      submitLbl.textContent = enabled
        ? 'Confirm Booking via WhatsApp →'
        : missing + ' field' + (missing !== 1 ? 's' : '') + ' remaining';
    }
  }

  /* ── Phone validation ── */
  function isPhoneValid() {
    return val('b-phone').replace(/\D/g, '').length === 10;
  }

  /* ── Trip summary update ── */
  function updateSummary() {
    const pickup   = val('b-pickup');
    const drop     = val('b-drop');
    const dt       = val('b-datetime');
    const vehicle  = val('b-vehicle');
    const triptype = val('b-triptype');
    const distance = parseFloat(val('b-distance'));

    const box = getEl('tripSummaryBox');
    if (!box) return;

    if (!pickup && !drop) { box.classList.remove('show'); return; }
    box.classList.add('show');

    const setEl = function(id, v) { const el = getEl(id); if (el) el.textContent = v; };

    setEl('ts-pickup',   pickup  || '—');
    setEl('ts-drop',     drop    || '—');
    setEl('ts-datetime', dt ? PP.formatDatetime(dt) : '—');

    const vNames = { '4': '4-Seater (Swift Dzire)', '6': '6-Seater (Maruti XL6)', '7': '7-Seater (Ertiga/Innova)' };
    setEl('ts-vehicle',  vNames[vehicle]  || '—');
    setEl('ts-triptype', triptype === 'outstation' ? 'Outstation' : triptype === 'local' ? 'Local' : '—');
    setEl('ts-distance', distance > 0 ? distance + ' km' : '—');

    if (vehicle && triptype && distance > 0) {
      const result = PP.calcFare(vehicle, triptype, distance);
      if (result) {
        setEl('ts-price', '₹' + PP.fmt(result.total));
        const bd = distance + ' km × ₹' + result.rate + '/km' + (triptype === 'outstation' ? ' + ₹500 driver' : '');
        setEl('ts-breakdown', bd);
      }
    } else {
      setEl('ts-price',    '₹ —');
      setEl('ts-breakdown', '');
    }
  }

  /* ── Field listeners ── */
  FIELDS.forEach(function(id) {
    const el = getEl(id);
    if (!el) return;
    el.addEventListener('input',  function() { clearFieldError(id); refreshSubmitBtn(); updateSummary(); });
    el.addEventListener('change', function() { clearFieldError(id); refreshSubmitBtn(); updateSummary(); });
  });

  /* ── Phone: persist + visual feedback ── */
  const phoneEl = getEl('b-phone');
  if (phoneEl) {
    phoneEl.addEventListener('input', function() {
      PP.lsSet('pp_phone', phoneEl.value);
      const len = phoneEl.value.replace(/\D/g, '').length;
      phoneEl.classList.toggle('valid',   len === 10);
      phoneEl.classList.toggle('invalid', len > 0 && len !== 10);
    });
  }

  /* ── Field error helpers ── */
  function showFieldError(id) {
    const el  = getEl(id);
    const err = getEl('err-' + id.replace('b-', ''));
    if (el)  el.classList.add('invalid');
    if (err) err.classList.add('show');
  }

  function clearFieldError(id) {
    const el  = getEl(id);
    const err = getEl('err-' + id.replace('b-', ''));
    if (el)  { el.classList.remove('invalid'); el.classList.remove('valid'); }
    if (err) err.classList.remove('show');
  }

  /* ── Form submit ── */
  submitBtn.addEventListener('click', function() {
    if (submitBtn.disabled) return;

    // Validate all fields
    let hasErrors = false;
    FIELDS.forEach(function(id) {
      if (!val(id)) { showFieldError(id); hasErrors = true; }
    });
    if (!isPhoneValid()) { showFieldError('b-phone'); hasErrors = true; }
    if (hasErrors) { PP.toast('Please fill all required fields', 'error', '⚠️'); return; }

    // Build payload
    const vehicle  = val('b-vehicle');
    const triptype = val('b-triptype');
    const distance = parseFloat(val('b-distance'));
    const result   = PP.calcFare(vehicle, triptype, distance);
    const fare     = result ? '₹' + PP.fmt(result.total) + (triptype === 'outstation' ? ' (incl. ₹500 driver)' : '') : '—';

    const bookingId = PP.genBookingId();
    const drivers   = (window.PP_CONFIG && PP_CONFIG.DRIVERS) || ['Kishan Kumar', 'Vishal Kumar'];
    const driver    = PP.pick(drivers);

    const data = {
      bookingId: bookingId,
      pickup:    val('b-pickup'),
      drop:      val('b-drop'),
      datetime:  val('b-datetime'),
      vehicle:   vehicle,
      triptype:  triptype,
      distance:  distance,
      name:      val('b-name'),
      phone:     val('b-phone'),
      driver:    driver
    };

    // Show driver badge
    const driverName = getEl('assignedDriverName');
    const driverIdTag = getEl('bookingIdTag');
    if (driverName) driverName.textContent = driver;
    if (driverIdTag) driverIdTag.textContent = '#' + bookingId;
    if (driverBadge) driverBadge.classList.add('show');

    // Google Sheets submit
    submitToSheets({
      bookingId: bookingId,
      name:      data.name,
      phone:     data.phone,
      pickup:    data.pickup,
      drop:      data.drop,
      datetime:  PP.formatDatetime(data.datetime),
      vehicle:   ({ '4': '4-Seater (Swift Dzire)', '6': '6-Seater (Maruti XL6)', '7': '7-Seater (Ertiga/Innova)' })[vehicle] || vehicle,
      tripType:  triptype,
      distance:  distance + ' km',
      fare:      fare,
      driver:    driver,
      status:    'Pending',
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    });

    // GA event
    PP.trackEvent('booking_submitted', {
      event_category: 'Booking',
      event_label:    vehicle + '-' + triptype,
      value:          result ? result.total : 0
    });

    // Show success
    if (successEl) successEl.classList.add('show');
    PP.toast('Booking saved! Opening WhatsApp…', 'success', '✅');

    // Open WhatsApp
    setTimeout(function() {
      const waNum = (window.PP_CONFIG && PP_CONFIG.WA_NUMBER) || '917870737475';
      window.open('https://wa.me/' + waNum + '?text=' + PP.buildWAMsg(data), '_blank');
    }, 700);
  });

  /* ── Google Sheets submit ── */
  function submitToSheets(payload) {
    const url = (window.PP_CONFIG && PP_CONFIG.SHEETS_URL) || '';
    if (!url) return;

    const attempt = function(retries) {
      fetch(url, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      }).catch(function() {
        if (retries > 0) setTimeout(function() { attempt(retries - 1); }, 2500);
      });
    };

    attempt(2);
  }

  /* ── Scroll-snap freeze during form focus ── */
  (function() {
    const formInputs = FIELDS.map(getEl).filter(Boolean);
    const freeze = function() { document.body.classList.add('form-active'); };
    const thaw   = function() {
      setTimeout(function() {
        const active = document.activeElement;
        const inForm = formInputs.some(function(el) { return el === active; });
        if (!inForm) document.body.classList.remove('form-active');
      }, 350);
    };

    formInputs.forEach(function(el) {
      el.addEventListener('focus',      freeze, { passive: true });
      el.addEventListener('touchstart', freeze, { passive: true });
      el.addEventListener('blur',       thaw,   { passive: true });
    });

    // Visual viewport: keyboard detection
    if (window.visualViewport) {
      let lastH = window.visualViewport.height;
      window.visualViewport.addEventListener('resize', function() {
        const h = window.visualViewport.height;
        if (h < lastH - 50) {
          document.body.classList.add('form-active');
          document.body.classList.add('keyboard-open');
        } else if (h > lastH + 50) {
          setTimeout(function() {
            const active = document.activeElement;
            const inForm = formInputs.some(function(el) { return el === active; });
            if (!inForm) {
              document.body.classList.remove('form-active');
              document.body.classList.remove('keyboard-open');
            }
          }, 350);
        }
        lastH = h;
      });
    }
  })();

  /* ── Follow-up popup ── */
  (function() {
    const popup = document.getElementById('followupPopup');
    if (!popup) return;

    let shown     = false;
    const dismissed = PP.ssGet('pp_popup_dismissed') === '1';

    function show() {
      if (shown || dismissed) return;
      shown = true;
      const sub = document.getElementById('popupSub');
      if (sub && PP.lsGet('pp_phone')) {
        sub.textContent = 'You started a booking — finish in 30 seconds.';
      }
      popup.classList.add('show');
    }

    // Show on tab blur
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) setTimeout(show, 300);
    });

    // Show after 45s idle
    let idleTimer;
    const rc = document.getElementById('reelContainer');
    const resetIdle = function() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function() {
        if (rc && rc.scrollTop > 60) show();
      }, 45000);
    };
    ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(function(ev) {
      document.addEventListener(ev, resetIdle, { passive: true });
    });
    resetIdle();
  })();

  window.dismissPopup = function() {
    const popup = document.getElementById('followupPopup');
    if (popup) popup.classList.remove('show');
    PP.ssSet('pp_popup_dismissed', '1');
  };

})();
