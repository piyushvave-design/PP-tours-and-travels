/**
 * P&P TOURS — CALCULATOR
 * Fare calculator, daily rental estimator, cost dashboard
 */

'use strict';

(function() {

  /* ── Shared dashboard state ── */
  const dash = { fare: 0, daily: 0 };

  function updateDashboard() {
    const fareEl    = document.getElementById('dash-fare-val');
    const dailyEl   = document.getElementById('dash-daily-val');
    const totalEl   = document.getElementById('dash-grand-total');
    const fareMeta  = document.getElementById('dash-fare-meta');
    const dailyMeta = document.getElementById('dash-daily-meta');

    if (fareEl) {
      fareEl.textContent = dash.fare > 0 ? '₹' + PP.fmt(dash.fare) : 'Not calculated';
      fareEl.className = 'dashboard-value' + (dash.fare > 0 ? '' : ' empty');
    }
    if (dailyEl) {
      dailyEl.textContent = dash.daily > 0 ? '₹' + PP.fmt(dash.daily) : 'Not calculated';
      dailyEl.className = 'dashboard-value' + (dash.daily > 0 ? '' : ' empty');
    }
    if (totalEl) {
      const gt = dash.fare + dash.daily;
      totalEl.textContent = (gt > 0) ? '₹' + PP.fmt(gt) : '₹ —';
    }
    if (fareMeta)  fareMeta.textContent  = dash._fareMeta  || '';
    if (dailyMeta) dailyMeta.textContent = dash._dailyMeta || '';
  }

  /* ── FARE CALCULATOR ── */
  (function initFareCalc() {
    const seaterEl  = document.getElementById('calc-seater');
    const tripEl    = document.getElementById('calc-trip');
    const distEl    = document.getElementById('calc-distance');
    const calcBtn   = document.getElementById('calc-fare-btn');
    const amountEl  = document.getElementById('calc-amount');
    const breakdownEl = document.getElementById('calc-breakdown');

    if (!calcBtn) return;

    function run() {
      const seater   = seaterEl ? seaterEl.value : '4';
      const triptype = tripEl   ? tripEl.value   : 'local';
      const distance = parseFloat(distEl ? distEl.value : 0);

      if (!distance || distance <= 0 || isNaN(distance)) {
        if (amountEl)    amountEl.textContent    = '—';
        if (breakdownEl) breakdownEl.textContent = '⚠ Enter a valid distance';
        return;
      }

      const result = PP.calcFare(seater, triptype, distance);
      if (!result) return;

      if (amountEl) amountEl.textContent = '₹' + PP.fmt(result.total);

      const vehicleLabel = seater === '4' ? '4-Seater' : seater === '6' ? '6-Seater' : '7-Seater';
      const tripLabel    = triptype === 'outstation' ? 'Outstation' : 'Local';
      let bd = vehicleLabel + ' · ' + tripLabel + ' · ' + distance + ' km × ₹' + result.rate + '/km = ₹' + PP.fmt(result.base);
      if (triptype === 'outstation') bd += ' + ₹500 driver = ₹' + PP.fmt(result.total);
      if (breakdownEl) breakdownEl.textContent = bd;

      // Update dashboard
      dash.fare = result.total;
      dash._fareMeta = vehicleLabel + ' · ' + distance + ' km';
      updateDashboard();

      PP.trackEvent('fare_calculated', { vehicle: seater, trip_type: triptype, distance: distance, fare: result.total });
    }

    calcBtn.addEventListener('click', run);
    if (distEl) distEl.addEventListener('keydown', function(e) { if (e.key === 'Enter') run(); });
  })();

  /* ── DAILY RENTAL CALCULATOR ── */
  (function initDailyCalc() {
    const daysEl     = document.getElementById('daily-days');
    const dailyBtn   = document.getElementById('daily-calc-btn');
    const amountEl   = document.getElementById('daily-amount');
    const breakdownEl = document.getElementById('daily-breakdown');

    if (!dailyBtn) return;

    function run() {
      const days = parseInt(daysEl ? daysEl.value : 0, 10);
      if (!days || days <= 0 || isNaN(days)) {
        if (amountEl)    amountEl.textContent    = '—';
        if (breakdownEl) breakdownEl.innerHTML   = '⚠ Enter a valid number of days';
        return;
      }

      const car    = 100  * days;
      const driver = 500  * days;
      const total  = car  + driver;
      const label  = days + ' day' + (days > 1 ? 's' : '');

      if (amountEl) amountEl.textContent = '₹' + PP.fmt(total);

      if (breakdownEl) {
        breakdownEl.innerHTML =
          '<table style="width:100%;border-collapse:collapse;text-align:left;margin-top:8px">' +
          '<tr><td style="padding:4px 0;font-size:.78rem;color:var(--text-muted)">🚗 Car · ₹100 × ' + label + '</td>' +
          '<td style="padding:4px 0;font-size:.78rem;color:var(--text-primary);font-weight:600;text-align:right">₹' + PP.fmt(car) + '</td></tr>' +
          '<tr><td style="padding:4px 0;font-size:.78rem;color:var(--text-muted)">👤 Driver · ₹500 × ' + label + '</td>' +
          '<td style="padding:4px 0;font-size:.78rem;color:var(--text-primary);font-weight:600;text-align:right">₹' + PP.fmt(driver) + '</td></tr>' +
          '<tr style="border-top:1px solid rgba(196,151,90,.12)">' +
          '<td style="padding:6px 0;font-size:.82rem;font-weight:700;color:var(--gold)">Total</td>' +
          '<td style="padding:6px 0;font-size:.82rem;font-weight:700;color:var(--gold);text-align:right">₹' + PP.fmt(total) + '</td></tr>' +
          '</table>';
      }

      // Dashboard
      dash.daily = total;
      dash._dailyMeta = label + ' · Car + Driver';
      updateDashboard();

      PP.trackEvent('daily_rental_calculated', { days: days, total: total });
    }

    dailyBtn.addEventListener('click', run);
    if (daysEl) daysEl.addEventListener('keydown', function(e) { if (e.key === 'Enter') run(); });
  })();

  /* ── Urgency system ── */
  (function initUrgency() {
    function update() {
      const hour = new Date().getHours();
      let carsLeft, bookings, mainMsg, subMsg, nextSlot;

      if      (hour >= 6  && hour < 9)  { carsLeft = 2; bookings = 18; mainMsg = '🔴 Only 2 cars available today'; subMsg = 'Peak morning hours — slots filling fast.'; nextSlot = 'Today 9:00 AM'; }
      else if (hour >= 9  && hour < 13) { carsLeft = 3; bookings = 22; mainMsg = '⚡ 3 cars available this morning'; subMsg = 'Book now before all slots are taken.'; nextSlot = 'Today ' + hour + ':30 AM'; }
      else if (hour >= 13 && hour < 18) { carsLeft = 4; bookings = 25; mainMsg = '✅ Good availability this afternoon'; subMsg = 'Book now for guaranteed same-day travel.'; nextSlot = 'Today 2:00 PM'; }
      else if (hour >= 18 && hour < 22) { carsLeft = 2; bookings = 28; mainMsg = '🔴 Evening slots running out'; subMsg = 'Only 2 cars left for tonight.'; nextSlot = 'Today 8:00 PM'; }
      else                              { carsLeft = 5; bookings = 30; mainMsg = '✅ Cars available for tomorrow'; subMsg = 'Advance booking recommended.'; nextSlot = 'Tomorrow 6:00 AM'; }

      const setEl = function(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; };
      setEl('urgency-main-text', mainMsg);
      setEl('urgency-sub-text',  subMsg);
      setEl('urgency-cars',      carsLeft);
      setEl('urgency-bookings',  bookings + '+');
      setEl('urgency-next-slot', '⏰ Next available: ' + nextSlot);
    }

    update();
    setInterval(update, 90000);
  })();

})();
