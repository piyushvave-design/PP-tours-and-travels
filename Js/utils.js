/**
 * P&P TOURS — UTILS
 * Shared helper functions. No side effects, no DOM queries.
 */

'use strict';

const PP = window.PP || {};

/** Format a number with Indian-style comma grouping */
PP.fmt = function(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/** Clamp a value between min and max */
PP.clamp = function(val, min, max) {
  return Math.min(Math.max(val, min), max);
};

/** Debounce: delay fn execution until ms have passed since last call */
PP.debounce = function(fn, ms) {
  let timer;
  return function() {
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(this, args); }, ms);
  };
};

/** Throttle: call fn at most once per ms */
PP.throttle = function(fn, ms) {
  let last = 0;
  return function() {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn.apply(this, arguments); }
  };
};

/** Generate a short booking ID (e.g. PPT482931) */
PP.genBookingId = function() {
  return 'PPT' + Date.now().toString().slice(-6);
};

/** Format datetime-local value to human readable */
PP.formatDatetime = function(dtStr) {
  if (!dtStr) return '—';
  try {
    return new Date(dtStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch(e) { return dtStr; }
};

/** Current time as HH:MM AM/PM */
PP.nowTime = function() {
  const d = new Date(), h = d.getHours(), m = d.getMinutes();
  return (h % 12 || 12) + ':' + (m < 10 ? '0' + m : m) + (h < 12 ? ' AM' : ' PM');
};

/** Safe localStorage get */
PP.lsGet = function(key) {
  try { return localStorage.getItem(key); } catch(e) { return null; }
};

/** Safe localStorage set */
PP.lsSet = function(key, val) {
  try { localStorage.setItem(key, val); } catch(e) {}
};

/** Safe sessionStorage get */
PP.ssGet = function(key) {
  try { return sessionStorage.getItem(key); } catch(e) { return null; }
};

/** Safe sessionStorage set */
PP.ssSet = function(key, val) {
  try { sessionStorage.setItem(key, val); } catch(e) {}
};

/** Pick a random element from an array */
PP.pick = function(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
};

/** Fire a Google Analytics event safely */
PP.trackEvent = function(name, params) {
  try {
    if (typeof gtag === 'function') { gtag('event', name, params || {}); }
  } catch(e) {}
};

/** Show the global toast notification */
PP.toast = function(msg, type, icon, duration) {
  const el  = document.getElementById('ppToast');
  const ico = document.getElementById('toastIcon');
  const txt = document.getElementById('toastMsg');
  if (!el) return;
  if (ico) ico.textContent = icon || (type === 'error' ? '⚠️' : '✅');
  if (txt) txt.textContent = msg;
  el.className = 'show ' + (type || 'success');
  clearTimeout(el._t);
  el._t = setTimeout(function() { el.className = ''; }, duration || 3500);
};

/** Build the WhatsApp booking message string */
PP.buildWAMsg = function(data) {
  const vehicleNames = {
    '4': '4-Seater (Swift Dzire)',
    '6': '6-Seater (Maruti XL6)',
    '7': '7-Seater (Ertiga / Innova)'
  };
  const rates = {
    '4-local': 15, '6-local': 16, '7-local': 17,
    '4-outstation': 16, '6-outstation': 17, '7-outstation': 17
  };
  const rate = rates[data.vehicle + '-' + data.triptype] || 15;
  const base = (data.distance || 0) * rate;
  const total = data.triptype === 'outstation' ? base + 500 : base;

  return encodeURIComponent(
    '🚗 *Booking Request — P&P Tours & Travels*\n\n' +
    '📋 Booking ID: ' + data.bookingId + '\n' +
    '👤 Name: ' + data.name + '\n' +
    '📞 Phone: ' + data.phone + '\n\n' +
    '📍 Pickup: ' + data.pickup + '\n' +
    '🏁 Drop: ' + data.drop + '\n' +
    '⏰ Date & Time: ' + PP.formatDatetime(data.datetime) + '\n' +
    '🚗 Vehicle: ' + (vehicleNames[data.vehicle] || data.vehicle) + '\n' +
    '🛣️ Trip Type: ' + (data.triptype === 'outstation' ? 'Outstation (+₹500 driver)' : 'Local') + '\n' +
    '📏 Distance: ' + data.distance + ' km\n\n' +
    '💰 Estimated Fare: ₹' + PP.fmt(total) +
    (data.triptype === 'outstation' ? ' (incl. ₹500 driver allowance)' : '') + '\n' +
    '👨‍✈️ Driver: ' + data.driver + '\n\n' +
    'Please confirm my booking. Thank you! 🙏'
  );
};

/** Fare calculation helper */
PP.calcFare = function(vehicle, triptype, distance) {
  const rates = {
    '4-local': 15, '6-local': 16, '7-local': 17,
    '4-outstation': 16, '6-outstation': 17, '7-outstation': 17
  };
  const rate = rates[vehicle + '-' + triptype];
  if (!rate || !distance || distance <= 0) return null;
  const base  = distance * rate;
  const total = triptype === 'outstation' ? base + 500 : base;
  return { rate: rate, base: base, total: total };
};

window.PP = PP;
