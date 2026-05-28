/**
 * P&P TOURS — ANIMATIONS
 * Night drive canvas + ARIA booking assistant
 */

'use strict';

/* ══════════════════════════════════════
   NIGHT DRIVE CANVAS
══════════════════════════════════════ */
(function() {
  const cv = document.getElementById('driveCanvas');
  if (!cv) return;
  const cx = cv.getContext('2d');
  if (!cx) return;

  // Bail on reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cx.fillStyle = '#08090c';
    cx.fillRect(0, 0, cv.width, cv.height);
    return;
  }

  let W = 0, H = 0, t = 0, wheelAngle = 0;
  let animFrame = null;

  function resize() {
    if (cv.offsetWidth > 0) {
      W = cv.width  = cv.offsetWidth;
      H = cv.height = cv.offsetHeight;
    }
  }

  requestAnimationFrame(resize);
  window.addEventListener('resize', PP.debounce(resize, 80));

  // Stars
  const STARS = Array.from({ length: 50 }, function() {
    return { x: Math.random(), y: Math.random() * 0.52, r: Math.random() * 1.1 + 0.3, a: Math.random() * 0.55 + 0.2 };
  });

  // Background buildings
  const BLDGS_BG = Array.from({ length: 13 }, function(_, i) {
    return { x: i / 13, w: 0.04 + Math.random() * 0.05, h: 0.05 + Math.random() * 0.14 };
  });

  // Foreground buildings
  const BLDGS_FG = Array.from({ length: 9 }, function(_, i) {
    return { x: i / 9, w: 0.05 + Math.random() * 0.06, h: 0.1 + Math.random() * 0.2 };
  });

  // Road dashes
  const DASHES = Array.from({ length: 8 }, function(_, i) { return { x: i / 8 }; });

  /* ── Draw car ── */
  function drawCar(carX, gY) {
    const cw = W * 0.38;
    const wr  = cw * 0.116;
    const wxF = carX + cw * 0.27;
    const wxR = carX - cw * 0.26;
    const wY  = gY - wr;
    const bL  = carX - cw * 0.44;
    const bR  = carX + cw * 0.44;
    const bBY = wY + wr * 0.44;
    const bTY = wY - wr * 2.0;
    const bH  = bBY - bTY;
    const cbL = carX - cw * 0.24;
    const cbR = carX + cw * 0.29;
    const cbTY = bTY - bH * 0.5;
    const cbBY = bTY;

    // Headlight beam
    const beam = cx.createRadialGradient(bR, wY - wr * 0.88, 3, bR + cw * 0.28, wY - wr * 0.88, cw * 0.48);
    beam.addColorStop(0, 'rgba(255,253,210,0.2)'); beam.addColorStop(1, 'transparent');
    cx.beginPath(); cx.moveTo(bR, wY - wr * 1.25); cx.lineTo(bR + cw * 0.52, wY - wr * 1.7); cx.lineTo(bR + cw * 0.52, wY - wr * 0.2); cx.closePath();
    cx.fillStyle = beam; cx.fill();

    // Ground shadow
    const sh = cx.createRadialGradient(carX, gY + 2, 0, carX, gY + 2, cw * 0.4);
    sh.addColorStop(0, 'rgba(0,0,0,0.5)'); sh.addColorStop(1, 'transparent');
    cx.fillStyle = sh; cx.beginPath(); cx.ellipse(carX, gY + 3, cw * 0.38, 8, 0, 0, Math.PI * 2); cx.fill();

    // Underglow
    const ug = cx.createRadialGradient(carX, gY, 0, carX, gY, cw * 0.35);
    ug.addColorStop(0, 'rgba(196,151,90,0.22)'); ug.addColorStop(1, 'transparent');
    cx.fillStyle = ug; cx.beginPath(); cx.ellipse(carX, gY, cw * 0.3, 6, 0, 0, Math.PI * 2); cx.fill();

    // Car body
    cx.beginPath();
    cx.moveTo(bL + 12, bBY); cx.lineTo(bR - 12, bBY);
    cx.quadraticCurveTo(bR + 7, bBY, bR + 7, bBY - 10);
    cx.lineTo(bR + 7, bTY + 9); cx.quadraticCurveTo(bR + 7, bTY, bR - 5, bTY);
    cx.lineTo(bL + 9, bTY); cx.quadraticCurveTo(bL - 5, bTY, bL - 5, bTY + 9);
    cx.lineTo(bL - 5, bBY - 10); cx.quadraticCurveTo(bL - 5, bBY, bL + 12, bBY);
    cx.closePath(); cx.fillStyle = '#1d1e24'; cx.fill();

    // Bumper strip
    cx.beginPath(); cx.roundRect(bL - 3, bBY - 16, (bR - bL) + 10, 16, [0, 0, 4, 4]);
    cx.fillStyle = '#111216'; cx.fill();

    // Gold accent strip
    cx.beginPath(); cx.moveTo(bL + 3, bBY - 18); cx.lineTo(bR + 3, bBY - 18);
    cx.strokeStyle = 'rgba(196,151,90,0.8)'; cx.lineWidth = 1.6;
    cx.shadowColor = '#c4975a'; cx.shadowBlur = 5; cx.stroke(); cx.shadowBlur = 0;

    // Cabin
    cx.beginPath();
    cx.moveTo(cbL + 7, cbBY); cx.lineTo(cbR - 7, cbBY);
    cx.quadraticCurveTo(cbR + 3, cbBY, cbR, cbBY - 10);
    cx.lineTo(cbR, cbTY + 13); cx.quadraticCurveTo(cbR - 7, cbTY, cbR - 18, cbTY);
    cx.lineTo(cbL + 10, cbTY); cx.quadraticCurveTo(cbL, cbTY, cbL, cbTY + 14);
    cx.lineTo(cbL, cbBY - 9); cx.quadraticCurveTo(cbL - 2, cbBY, cbL + 7, cbBY);
    cx.closePath(); cx.fillStyle = '#18191f'; cx.fill();

    // Window
    const wmX = (cbL + cbR) / 2, wmW = (cbR - cbL) * 0.58, wmH = (cbBY - cbTY) * 0.48;
    cx.fillStyle = 'rgba(173,216,255,0.09)';
    cx.beginPath(); cx.roundRect(wmX - wmW / 2, cbTY + 7, wmW, wmH, 3); cx.fill();
    cx.strokeStyle = 'rgba(173,216,255,0.12)'; cx.lineWidth = 0.7; cx.stroke();

    // Headlight glow
    const hl = cx.createRadialGradient(bR, wY - wr * 0.88, 1, bR, wY - wr * 0.88, wr * 0.65);
    hl.addColorStop(0, 'rgba(255,250,200,0.95)'); hl.addColorStop(1, 'rgba(255,200,100,0.35)');
    cx.fillStyle = hl; cx.beginPath(); cx.ellipse(bR, wY - wr * 0.88, wr * 0.42, wr * 0.26, 0, 0, Math.PI * 2); cx.fill();

    // Tail light
    const tl = cx.createRadialGradient(bL + 3, wY - wr * 0.78, 1, bL + 3, wY - wr * 0.78, wr * 0.48);
    tl.addColorStop(0, 'rgba(220,50,30,0.88)'); tl.addColorStop(1, 'transparent');
    cx.fillStyle = tl; cx.beginPath(); cx.ellipse(bL + 3, wY - wr * 0.78, wr * 0.28, wr * 0.18, 0, 0, Math.PI * 2); cx.fill();

    // Wheels
    [wxR, wxF].forEach(function(wx) {
      const wg = cx.createRadialGradient(wx, wY, 2, wx, wY, wr);
      wg.addColorStop(0, '#3e3e3e'); wg.addColorStop(0.6, '#1f1f1f'); wg.addColorStop(1, '#0e0e0e');
      cx.fillStyle = wg; cx.beginPath(); cx.arc(wx, wY, wr, 0, Math.PI * 2); cx.fill();

      cx.beginPath(); cx.arc(wx, wY, wr * 0.63, 0, Math.PI * 2);
      cx.strokeStyle = 'rgba(196,151,90,0.48)'; cx.lineWidth = 1.8; cx.stroke();

      for (let s = 0; s < 5; s++) {
        const a = wheelAngle + s * (Math.PI * 2 / 5);
        cx.beginPath();
        cx.moveTo(wx + Math.cos(a) * wr * 0.19, wY + Math.sin(a) * wr * 0.19);
        cx.lineTo(wx + Math.cos(a) * wr * 0.54, wY + Math.sin(a) * wr * 0.54);
        cx.strokeStyle = 'rgba(175,155,115,0.5)'; cx.lineWidth = 1.4; cx.stroke();
      }
    });
  }

  /* ── Main render loop ── */
  function frame() {
    if (!W || !H) { animFrame = requestAnimationFrame(frame); return; }
    t += 0.016; wheelAngle += 0.055;

    cx.clearRect(0, 0, W, H);

    // Sky gradient
    const sky = cx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#060709'); sky.addColorStop(0.6, '#0c101a'); sky.addColorStop(1, '#111825');
    cx.fillStyle = sky; cx.fillRect(0, 0, W, H);

    // Stars
    STARS.forEach(function(s) {
      const fx = ((s.x + (t * 0.28) % 1) % 1) * W;
      const fy = s.y * H * 0.58;
      cx.beginPath(); cx.arc(fx, fy, s.r, 0, Math.PI * 2);
      cx.fillStyle = 'rgba(255,255,255,' + (s.a * (0.7 + Math.sin(t * 1.4 + s.x * 10) * 0.3)) + ')';
      cx.fill();
    });

    // Background buildings
    BLDGS_BG.forEach(function(b) {
      const bx = ((b.x - t * 0.018) % 1 + 1) % 1;
      cx.fillStyle = '#0a0d14';
      cx.fillRect(bx * W, H * 0.44 - b.h * H, b.w * W, b.h * H);
    });

    // Foreground buildings
    BLDGS_FG.forEach(function(b) {
      const bx = ((b.x - t * 0.038) % 1 + 1) % 1;
      cx.fillStyle = '#06080c';
      cx.fillRect(bx * W, H * 0.62 - b.h * H, b.w * W, b.h * H);
    });

    // Ground
    const gnd = cx.createLinearGradient(0, H * 0.62, 0, H);
    gnd.addColorStop(0, '#0c0f17'); gnd.addColorStop(1, '#060809');
    cx.fillStyle = gnd; cx.fillRect(0, H * 0.62, W, H * 0.38);

    // Road edge
    cx.strokeStyle = 'rgba(196,151,90,0.2)'; cx.lineWidth = 0.9;
    cx.beginPath(); cx.moveTo(0, H * 0.62); cx.lineTo(W, H * 0.62); cx.stroke();

    // Road dashes
    const dw    = W * 0.068;
    const dgap  = W * 0.058;
    const dspd  = t * W * 0.28;
    cx.fillStyle = 'rgba(255,218,75,0.3)';
    cx.shadowColor = 'rgba(255,218,75,0.25)'; cx.shadowBlur = 3;
    DASHES.forEach(function(d) {
      const dx = ((d.x * W - dspd) % (W + dw + dgap) + W + dw + dgap) % (W + dw + dgap) - dw;
      cx.fillRect(dx, H * 0.635 - 1.8, dw, 3.5);
    });
    cx.shadowBlur = 0;

    // Car
    drawCar(W * 0.52, H * 0.62);
    animFrame = requestAnimationFrame(frame);
  }

  animFrame = requestAnimationFrame(frame);

  // Pause when tab not visible
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    } else {
      if (!animFrame) animFrame = requestAnimationFrame(frame);
    }
  });
})();


/* ══════════════════════════════════════
   ARIA BOOKING ASSISTANT
══════════════════════════════════════ */
(function() {
  const fab      = document.getElementById('ariaFab');
  const panel    = document.getElementById('ariaPanel');
  const closeBtn = document.getElementById('ariaClose');
  const bodyEl   = document.getElementById('ariaBody');
  const bottomEl = document.getElementById('ariaBottom');
  const progEl   = document.getElementById('ariaProgress');
  const notifDot = document.getElementById('ariaNotif');

  if (!fab || !panel) return;

  let isOpen = false;
  const state = {};

  // Show notification after 9 seconds
  setTimeout(function() {
    if (!isOpen && notifDot) notifDot.style.display = 'block';
  }, 9000);

  fab.addEventListener('click', function() { isOpen ? close() : open(); });
  if (closeBtn) closeBtn.addEventListener('click', close);

  function open() {
    isOpen = true;
    panel.classList.add('open');
    if (notifDot) notifDot.style.display = 'none';
    if (!bodyEl.children.length) startFlow();
  }

  function close() {
    isOpen = false;
    panel.classList.remove('open');
  }

  function setProgress(pct) {
    if (progEl) progEl.style.width = pct + '%';
  }

  function clearBottom() {
    if (bottomEl) bottomEl.innerHTML = '';
  }

  function addMsg(text, who) {
    const wrap = document.createElement('div');
    wrap.className = 'aria-msg aria-msg-' + who;
    wrap.innerHTML = '<div class="aria-bubble">' + text + '</div><div class="aria-time">' + PP.nowTime() + '</div>';
    if (bodyEl) { bodyEl.appendChild(wrap); bodyEl.scrollTop = bodyEl.scrollHeight; }
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'aria-msg aria-msg-bot'; t.id = 'ariaTyping';
    t.innerHTML = '<div class="aria-typing"><div class="aria-typing-dot"></div><div class="aria-typing-dot"></div><div class="aria-typing-dot"></div></div>';
    if (bodyEl) { bodyEl.appendChild(t); bodyEl.scrollTop = bodyEl.scrollHeight; }
  }

  function hideTyping() { const t = document.getElementById('ariaTyping'); if (t) t.remove(); }

  function botSay(text, delay) {
    return new Promise(function(resolve) {
      showTyping();
      setTimeout(function() { hideTyping(); addMsg(text, 'bot'); resolve(); }, delay || 800);
    });
  }

  function showOptions(opts) {
    clearBottom();
    const div = document.createElement('div'); div.className = 'aria-options';
    opts.forEach(function(o) {
      const btn = document.createElement('button');
      btn.className = 'aria-opt' + (o.primary ? ' primary' : '');
      btn.textContent = o.label;
      btn.addEventListener('click', function() { addMsg(o.label, 'user'); clearBottom(); if (o.fn) o.fn(); });
      div.appendChild(btn);
    });
    if (bottomEl) bottomEl.appendChild(div);
  }

  function showCTA() {
    clearBottom();
    const div = document.createElement('div'); div.className = 'aria-cta-row';
    const waNum = (window.PP_CONFIG && PP_CONFIG.WA_NUMBER) || '917870737475';
    const msg = encodeURIComponent(
      '🚗 Quick Booking — P&P Tours\nFrom: ' + (state.from || '—') +
      '\nTo: ' + (state.to || '—') + '\nVehicle: ' + (state.vehicle || '—') +
      '\nPassengers: ' + (state.passengers || '—') + '\n\nPlease confirm availability. Thank you!'
    );
    div.innerHTML =
      '<a class="aria-cta-call" href="tel:+91' + waNum + '">📞 Call Now</a>' +
      '<a class="aria-cta-wa" href="https://wa.me/' + waNum + '?text=' + msg + '" target="_blank">💬 WhatsApp</a>';
    if (bottomEl) bottomEl.appendChild(div);
  }

  const DIST = {
    'Patna Junction-Gaya': 120, 'Patna Junction-Bodh Gaya': 130,
    'Patna Junction-Bihar Sharif': 88, 'Gaya-Bodh Gaya': 13,
    'Patna Airport-Patna Junction': 8
  };

  function startFlow() {
    setProgress(0);
    botSay('👋 Hi! I\'m Aria, your P&P booking assistant.<br/>Let me help you book a ride in 60 seconds.', 500).then(function() {
      botSay('Where are you travelling <strong>from</strong>?', 400).then(function() {
        setProgress(15);
        showOptions([
          { label: 'Patna Junction',  fn: function() { state.from = 'Patna Junction';  askTo(); } },
          { label: 'Gaya',            fn: function() { state.from = 'Gaya';            askTo(); } },
          { label: 'Patna Airport',   fn: function() { state.from = 'Patna Airport';   askTo(); } },
          { label: 'Other location',  fn: function() { askFreeText('From where?', function(v) { state.from = v; askTo(); }); } }
        ]);
      });
    });
  }

  function askFreeText(placeholder, cb) {
    clearBottom();
    const div = document.createElement('div'); div.className = 'aria-options';
    const inp = document.createElement('input');
    inp.type = 'text'; inp.placeholder = placeholder;
    Object.assign(inp.style, { flex:'1', padding:'0.38rem 0.75rem', background:'rgba(237,233,225,.06)', border:'1px solid rgba(196,151,90,.22)', borderRadius:'18px', color:'var(--text-primary)', fontSize:'0.84rem', fontFamily:'var(--font-body)', outline:'none' });
    const btn = document.createElement('button'); btn.className = 'aria-opt primary'; btn.textContent = 'Next →';
    const go = function() { const v = inp.value.trim(); if (!v) return; addMsg(v, 'user'); clearBottom(); cb(v); };
    btn.addEventListener('click', go);
    inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') go(); });
    div.appendChild(inp); div.appendChild(btn);
    if (bottomEl) bottomEl.appendChild(div);
    setTimeout(function() { inp.focus(); }, 80);
  }

  function askTo() {
    botSay('And where to? 🏁', 350).then(function() {
      setProgress(30);
      const common = state.from === 'Patna Junction'
        ? ['Gaya', 'Bodh Gaya', 'Bihar Sharif', 'Kolkata']
        : ['Patna Junction', 'Bodh Gaya', 'Bihar Sharif', 'Varanasi'];
      showOptions(common.map(function(c) {
        return { label: c, fn: function() { state.to = c; askVehicle(); } };
      }).concat({ label: 'Other', fn: function() { askFreeText('Destination?', function(v) { state.to = v; askVehicle(); }); } }));
    });
  }

  function askVehicle() {
    botSay('Which vehicle? 🚗', 350).then(function() {
      setProgress(50);
      showOptions([
        { label: '4-Seater · ₹15/km',  fn: function() { state.vehicle = '4-Seater Swift Dzire';   askPassengers(); } },
        { label: '6-Seater · ₹16/km',  fn: function() { state.vehicle = '6-Seater Maruti XL6';    askPassengers(); } },
        { label: '7-Seater · ₹17/km',  fn: function() { state.vehicle = '7-Seater Ertiga/Innova'; askPassengers(); } }
      ]);
    });
  }

  function askPassengers() {
    botSay('How many passengers? 👥', 350).then(function() {
      setProgress(65);
      showOptions([
        { label: '1–2', fn: function() { state.passengers = '1-2'; askConfirm(); } },
        { label: '3–4', fn: function() { state.passengers = '3-4'; askConfirm(); } },
        { label: '5–6', fn: function() { state.passengers = '5-6'; askConfirm(); } },
        { label: '7+',  fn: function() { state.passengers = '7+';  askConfirm(); } }
      ]);
    });
  }

  function askConfirm() {
    const distKey = state.from + '-' + state.to;
    const dist = DIST[distKey] || DIST[state.to + '-' + state.from] || 0;
    const rate = state.vehicle && state.vehicle.startsWith('4') ? 15 : state.vehicle && state.vehicle.startsWith('6') ? 16 : 17;
    const est  = dist ? '~₹' + PP.fmt(dist * rate) : 'custom';

    botSay(
      '✅ <strong>Trip Summary</strong><br/>' +
      '📍 ' + state.from + ' → ' + state.to + '<br/>' +
      '🚗 ' + state.vehicle + '<br/>' +
      '👥 ' + state.passengers + ' passengers<br/>' +
      '💰 Est. fare: ' + est, 600
    ).then(function() {
      setProgress(85);
      showOptions([
        { label: '✅ Book via WhatsApp', primary: true, fn: confirmBooking },
        { label: '📞 Call to confirm',  fn: function() { window.location.href = 'tel:+917870737475'; } },
        { label: '📝 Fill booking form', fn: function() { close(); goToSlide(3); } }
      ]);
    });
  }

  function confirmBooking() {
    setProgress(100);
    botSay('🎉 Opening WhatsApp with your trip details…', 400).then(showCTA);
  }
})();
