window.PP_CONFIG = {
    SHEETS_URL: 'https://script.google.com/macros/s/AKfycbwVYgc5XKi1EltBG9_dC-8ZcRO83t_3wJaH0ozb3ozpN2E2Dia1fUA1EvhSaKHYj3tK3A/exec',
    GA_ID: 'G-6D0TFFYF0Q',
    WA_NUMBER: '917870737475',
    DRIVERS: ['Kishan Kumar', 'Vishal Kumar']
  };

// Dot nav
var dots = document.querySelectorAll('.dot');
dots.forEach(function(dot){
  dot.addEventListener('click', function(){ goToSlide(parseInt(this.getAttribute('data-slide'))); });
});
function goToSlide(i){
  var s = document.getElementById('slide-'+i);
  if(s) s.scrollIntoView({behavior:'smooth'});
}

// IntersectionObserver — trigger animations + update active dot
var slides = document.querySelectorAll('.reel');
var io = new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting){
      var idx = parseInt(entry.target.id.replace('slide-',''));
      dots.forEach(function(d,i){ d.classList.toggle('active', i===idx); });
      entry.target.querySelectorAll('.anim,.ascale').forEach(function(el){ el.classList.add('in'); });
    }
  });
}, {threshold:0.3});
slides.forEach(function(s){ io.observe(s); });

// Trigger slide 0 immediately
document.querySelectorAll('#slide-0 .anim, #slide-0 .ascale').forEach(function(el){ el.classList.add('in'); });

// Formatter
function fmt(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,','); }

// Dashboard state — on window so Aria widget can access and sync
window.dashFare=0; window.dashDaily=0;
function updateDashboard(){
  var gt = window.dashFare + window.dashDaily;
  document.getElementById('dash-fare-val').textContent  = window.dashFare  > 0 ? '₹'+fmt(window.dashFare)  : 'Not calculated';
  document.getElementById('dash-daily-val').textContent = window.dashDaily > 0 ? '₹'+fmt(window.dashDaily) : 'Not calculated';
  document.getElementById('dash-fare-val').className  = 'dash-value'+(window.dashFare  > 0 ? '' : ' pending');
  document.getElementById('dash-daily-val').className = 'dash-value'+(window.dashDaily > 0 ? '' : ' pending');
  document.getElementById('dash-grand-total').textContent = (window.dashFare>0||window.dashDaily>0) ? '₹'+fmt(gt) : '₹ —';
}

// Fare Calculator
function calculateFare(){
  var seater = document.getElementById('seater').value;
  var trip   = document.getElementById('trip').value;
  var dist   = parseFloat(document.getElementById('distance').value);
  if(!dist||dist<=0||isNaN(dist)){
    document.getElementById('amount').textContent='—';
    document.getElementById('breakdown').textContent='⚠ Enter a valid distance';
    return;
  }
  var rates={'4-local':15,'6-local':16,'7-local':17,'4-outstation':16,'6-outstation':17,'7-outstation':17};
  var rate=rates[seater+'-'+trip], total=dist*rate;
  document.getElementById('amount').textContent='₹'+fmt(total);
  document.getElementById('breakdown').textContent=(seater==='4'?'4-Seater':seater==='6'?'6-Seater':'7-Seater')+' · '+(trip==='local'?'Local':'Outstation')+' · '+dist+' km × ₹'+rate+'/km';
  window.dashFare=total;
  document.getElementById('dash-fare-meta').textContent=(seater==='4'?'4-Seater':'6-Seater')+' · '+dist+' km';
  updateDashboard();
}

// Daily Calculator
function calculateDaily(){
  var days=parseInt(document.getElementById('d-days').value);
  if(!days||days<=0||isNaN(days)){
    document.getElementById('daily-amount').textContent='—';
    document.getElementById('daily-breakdown').textContent='⚠ Enter a valid number of days';
    return;
  }
  var car=100*days, driver=500*days, total=car+driver;
  var label=days+' day'+(days>1?'s':'');
  document.getElementById('daily-amount').textContent='₹'+fmt(total);
  document.getElementById('daily-breakdown').innerHTML=
    '<table style="width:100%;border-collapse:collapse;text-align:left;margin-top:.4rem">'+
    '<tr><td style="padding:.3rem 0;font-size:.8rem;color:#8a8070">🚗 Car (₹100 × '+label+')</td>'+
    '<td style="padding:.3rem 0;font-size:.8rem;color:#f2ede6;font-weight:600;text-align:right">₹'+fmt(car)+'</td></tr>'+
    '<tr><td style="padding:.3rem 0;font-size:.8rem;color:#8a8070">👤 Driver (₹500 × '+label+')</td>'+
    '<td style="padding:.3rem 0;font-size:.8rem;color:#f2ede6;font-weight:600;text-align:right">₹'+fmt(driver)+'</td></tr>'+
    '<tr style="border-top:1px solid rgba(201,168,76,0.25)">'+
    '<td style="padding:.35rem 0;font-size:.85rem;font-weight:700;color:#c9a84c">Total</td>'+
    '<td style="padding:.35rem 0;font-size:.85rem;font-weight:700;color:#c9a84c;text-align:right">₹'+fmt(total)+'</td></tr></table>';
  window.dashDaily=total;
  document.getElementById('dash-daily-meta').textContent=label+' · Car + Driver';
  updateDashboard();
}

// ── Night Drive Parallax Canvas ──
(function(){
  var cv = document.getElementById('driveCanvas');
  if(!cv) return;
  var cx = cv.getContext('2d');
  var W, H, t = 0;

  function resize(){ 
    if(cv.offsetWidth > 0) { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; }
  }
  // Defer first resize to ensure layout is complete
  requestAnimationFrame(function(){ resize(); });
  window.addEventListener('resize', resize);

  // Stars
  var stars = Array.from({length:60}, function(){
    return { x:Math.random(), y:Math.random()*0.55, r:Math.random()*1.2+0.3, a:Math.random()*0.6+0.2 };
  });

  // City buildings (background layer — slow)
  var bldgsBg = Array.from({length:14}, function(_, i){
    return { x: i/14, w: 0.04+Math.random()*0.05, h: 0.06+Math.random()*0.16 };
  });
  // City buildings (foreground layer — faster, taller, darker)
  var bldgsFg = Array.from({length:10}, function(_, i){
    return { x: i/10, w: 0.05+Math.random()*0.07, h: 0.1+Math.random()*0.22, lit: Math.random() };
  });

  // Road dashes
  var dashes = Array.from({length:8}, function(_, i){
    return { x: i/8 };
  });

  // Wheel angle
  var wheelAngle = 0;

  function drawCar(carX, groundY) {
    var cw = W * 0.40; // total car width

    // Wheel dimensions
    var wr  = cw * 0.118;          // wheel radius
    var wxF = carX + cw * 0.28;    // front wheel X
    var wxR = carX - cw * 0.27;    // rear wheel X
    var wY  = groundY - wr;        // wheel centre Y (sitting on ground)

    // Body geometry
    var bodyL  = carX - cw * 0.46; // body left edge
    var bodyR  = carX + cw * 0.46; // body right edge
    var bodyBY = wY + wr * 0.45;   // body bottom Y (just above ground)
    var bodyTY = wY - wr * 2.1;    // body top Y  (SUV is tall)
    var bodyH  = bodyBY - bodyTY;

    // Cabin (roof) — sits ON TOP of body, inset slightly
    var cabL  = carX - cw * 0.25;
    var cabR  = carX + cw * 0.30;
    var cabTY = bodyTY - bodyH * 0.52; // roof is ~half again above body
    var cabBY = bodyTY;

    // ── Headlight beam cone (forward) ──
    var beamGrad = cx.createRadialGradient(bodyR, wY - wr * 0.9, 4, bodyR + cw * 0.3, wY - wr * 0.9, cw * 0.5);
    beamGrad.addColorStop(0, 'rgba(255,253,210,0.22)');
    beamGrad.addColorStop(1, 'transparent');
    cx.beginPath();
    cx.moveTo(bodyR, wY - wr * 1.3);
    cx.lineTo(bodyR + cw * 0.55, wY - wr * 1.8);
    cx.lineTo(bodyR + cw * 0.55, wY - wr * 0.2);
    cx.closePath();
    cx.fillStyle = beamGrad;
    cx.fill();

    // ── Ground shadow ──
    var shG = cx.createRadialGradient(carX, groundY + 2, 0, carX, groundY + 2, cw * 0.42);
    shG.addColorStop(0, 'rgba(0,0,0,0.5)');
    shG.addColorStop(1, 'transparent');
    cx.fillStyle = shG;
    cx.beginPath();
    cx.ellipse(carX, groundY + 4, cw * 0.4, 9, 0, 0, Math.PI * 2);
    cx.fill();

    // ── Neon underglow ──
    var ugG = cx.createRadialGradient(carX, groundY, 0, carX, groundY, cw * 0.38);
    ugG.addColorStop(0, 'rgba(201,168,76,0.28)');
    ugG.addColorStop(1, 'transparent');
    cx.fillStyle = ugG;
    cx.beginPath();
    cx.ellipse(carX, groundY, cw * 0.34, 7, 0, 0, Math.PI * 2);
    cx.fill();

    // ── SUV Main body ──
    cx.beginPath();
    cx.moveTo(bodyL + 14, bodyBY);
    cx.lineTo(bodyR - 14, bodyBY);
    cx.quadraticCurveTo(bodyR + 8, bodyBY, bodyR + 8, bodyBY - 12);
    cx.lineTo(bodyR + 8, bodyTY + 10);
    cx.quadraticCurveTo(bodyR + 8, bodyTY, bodyR - 6, bodyTY);
    cx.lineTo(bodyL + 10, bodyTY);
    cx.quadraticCurveTo(bodyL - 6, bodyTY, bodyL - 6, bodyTY + 10);
    cx.lineTo(bodyL - 6, bodyBY - 12);
    cx.quadraticCurveTo(bodyL - 6, bodyBY, bodyL + 14, bodyBY);
    cx.closePath();
    cx.fillStyle = '#1e1f24';
    cx.fill();

    // Body bottom panel (darker sill)
    cx.beginPath();
    cx.roundRect(bodyL - 4, bodyBY - 18, (bodyR - bodyL) + 12, 18, [0, 0, 5, 5]);
    cx.fillStyle = '#131417';
    cx.fill();

    // ── Gold accent line along body ──
    cx.beginPath();
    cx.moveTo(bodyL + 4, bodyBY - 20);
    cx.lineTo(bodyR + 4, bodyBY - 20);
    cx.strokeStyle = 'rgba(201,168,76,0.85)';
    cx.lineWidth = 1.8;
    cx.shadowColor = '#c9a84c';
    cx.shadowBlur = 7;
    cx.stroke();
    cx.shadowBlur = 0;

    // ── Wheel arches (cut into body) ──
    cx.save();
    cx.globalCompositeOperation = 'destination-out';
    cx.beginPath(); cx.arc(wxF, wY, wr + 3, Math.PI, 0); cx.fill();
    cx.beginPath(); cx.arc(wxR, wY, wr + 3, Math.PI, 0); cx.fill();
    cx.restore();

    // Arch trim (gold ring top half)
    [wxR, wxF].forEach(function(wx) {
      cx.beginPath();
      cx.arc(wx, wY, wr + 4, Math.PI, 0);
      cx.strokeStyle = 'rgba(201,168,76,0.35)';
      cx.lineWidth = 2;
      cx.stroke();
    });

    // ── SUV Roof / cabin ──
    cx.beginPath();
    cx.moveTo(cabL - 4, cabBY);
    cx.quadraticCurveTo(cabL - 10, cabBY - 8, cabL + 4, cabTY + 6);
    cx.quadraticCurveTo(cabL + 10, cabTY, cabL + 22, cabTY);
    cx.lineTo(cabR - 16, cabTY);
    cx.quadraticCurveTo(cabR + 4, cabTY, cabR + 4, cabTY + 10);
    cx.lineTo(cabR + 4, cabBY);
    cx.closePath();
    cx.fillStyle = '#17181c';
    cx.fill();

    // Roof rail
    cx.beginPath();
    cx.moveTo(cabL + 20, cabTY + 2);
    cx.lineTo(cabR - 4, cabTY + 2);
    cx.strokeStyle = 'rgba(201,168,76,0.4)';
    cx.lineWidth = 2.5;
    cx.stroke();

    // ── Windshield (front, right side) ──
    cx.beginPath();
    cx.moveTo(cabR + 3,  cabBY);
    cx.quadraticCurveTo(cabR + 14, cabBY - 10, cabR + 10, cabTY + 6);
    cx.lineTo(cabR - 14, cabTY + 2);
    cx.lineTo(cabR - 14, cabBY);
    cx.closePath();
    cx.fillStyle = 'rgba(26,159,166,0.6)';
    cx.fill();
    // windshield shine
    cx.beginPath();
    cx.moveTo(cabR - 2, cabTY + 5);
    cx.lineTo(cabR + 5, cabTY + 10);
    cx.lineTo(cabR + 3, cabBY - 8);
    cx.lineTo(cabR - 4, cabBY - 12);
    cx.closePath();
    cx.fillStyle = 'rgba(255,255,255,0.07)';
    cx.fill();

    // ── Rear window (left side) ──
    cx.beginPath();
    cx.moveTo(cabL - 3, cabBY);
    cx.lineTo(cabL + 2, cabTY + 4);
    cx.lineTo(cabL + 22, cabTY + 2);
    cx.lineTo(cabL + 22, cabBY);
    cx.closePath();
    cx.fillStyle = 'rgba(26,159,166,0.45)';
    cx.fill();

    // ── Side windows (middle) ──
    var winMidL = cabL + 24;
    var winMidR = cabR - 16;
    cx.beginPath();
    cx.roundRect(winMidL, cabTY + 4, winMidR - winMidL, cabBY - cabTY - 8, 3);
    cx.fillStyle = 'rgba(26,159,166,0.38)';
    cx.fill();
    cx.strokeStyle = 'rgba(201,168,76,0.2)';
    cx.lineWidth = 1;
    cx.stroke();
    // window divider
    var midDiv = (winMidL + winMidR) / 2;
    cx.beginPath();
    cx.moveTo(midDiv, cabTY + 4);
    cx.lineTo(midDiv, cabBY - 4);
    cx.strokeStyle = 'rgba(201,168,76,0.25)';
    cx.lineWidth = 1.2;
    cx.stroke();

    // ── Door line ──
    cx.beginPath();
    cx.moveTo(bodyL + 4, bodyTY + bodyH * 0.5);
    cx.lineTo(bodyR, bodyTY + bodyH * 0.5);
    cx.strokeStyle = 'rgba(201,168,76,0.18)';
    cx.lineWidth = 1;
    cx.stroke();

    // Door handles
    cx.beginPath();
    cx.roundRect(carX - cw*0.12, bodyTY + bodyH*0.28, cw*0.1, 4, 2);
    cx.fillStyle = 'rgba(201,168,76,0.6)';
    cx.fill();
    cx.beginPath();
    cx.roundRect(carX + cw*0.06, bodyTY + bodyH*0.28, cw*0.1, 4, 2);
    cx.fill();

    // ── Headlight ──
    cx.beginPath();
    cx.ellipse(bodyR + 2, wY - wr * 1.25, 9, 5, 0, 0, Math.PI * 2);
    cx.fillStyle = '#fffde0';
    cx.shadowColor = '#fffde0';
    cx.shadowBlur = 16;
    cx.fill();
    cx.shadowBlur = 0;
    // DRL strip
    cx.beginPath();
    cx.moveTo(bodyR - 6, wY - wr * 1.55);
    cx.lineTo(bodyR + 4, wY - wr * 1.55);
    cx.strokeStyle = 'rgba(255,253,220,0.8)';
    cx.lineWidth = 2.5;
    cx.shadowColor = '#fffde0';
    cx.shadowBlur = 8;
    cx.stroke();
    cx.shadowBlur = 0;

    // ── Taillight ──
    cx.beginPath();
    cx.ellipse(bodyL - 2, wY - wr * 1.25, 7, 4, 0, 0, Math.PI * 2);
    cx.fillStyle = '#c9a84c';
    cx.shadowColor = '#c9a84c';
    cx.shadowBlur = 12;
    cx.fill();
    cx.shadowBlur = 0;
    cx.beginPath();
    cx.moveTo(bodyL + 6, wY - wr * 1.55);
    cx.lineTo(bodyL - 4, wY - wr * 1.55);
    cx.strokeStyle = 'rgba(201,168,76,0.8)';
    cx.lineWidth = 2;
    cx.shadowBlur = 6;
    cx.shadowColor = '#c9a84c';
    cx.stroke();
    cx.shadowBlur = 0;

    // Front grille
    cx.beginPath();
    cx.roundRect(bodyR - 2, wY - wr * 0.55, 10, wr * 0.7, 2);
    cx.fillStyle = '#0d0d0d';
    cx.fill();
    cx.strokeStyle = 'rgba(201,168,76,0.3)';
    cx.lineWidth = 1;
    cx.stroke();

    // ── Wheels ──
    [wxR, wxF].forEach(function(wx) {
      // outer tyre
      cx.beginPath(); cx.arc(wx, wY, wr, 0, Math.PI * 2);
      cx.fillStyle = '#0c0c0c'; cx.fill();
      cx.strokeStyle = 'rgba(80,80,80,0.6)'; cx.lineWidth = 2; cx.stroke();

      // rim
      cx.beginPath(); cx.arc(wx, wY, wr * 0.7, 0, Math.PI * 2);
      cx.fillStyle = '#1c1d22'; cx.fill();
      cx.strokeStyle = 'rgba(201,168,76,0.5)'; cx.lineWidth = 1.5; cx.stroke();

      // spokes × 5
      for (var s = 0; s < 5; s++) {
        var ang = wheelAngle + (s / 5) * Math.PI * 2;
        var ix = wx + Math.cos(ang) * wr * 0.18;
        var iy = wY + Math.sin(ang) * wr * 0.18;
        var ox = wx + Math.cos(ang) * wr * 0.65;
        var oy = wY + Math.sin(ang) * wr * 0.65;
        cx.beginPath(); cx.moveTo(ix, iy); cx.lineTo(ox, oy);
        cx.strokeStyle = 'rgba(201,168,76,0.65)'; cx.lineWidth = 1.8; cx.stroke();
      }

      // centre cap
      cx.beginPath(); cx.arc(wx, wY, wr * 0.15, 0, Math.PI * 2);
      cx.fillStyle = '#c9a84c';
      cx.shadowColor = '#c9a84c'; cx.shadowBlur = 6;
      cx.fill(); cx.shadowBlur = 0;
    });
    wheelAngle += 0.055;
  }

  var canvasVisible = false;
  var rafId = null;

  var canvasIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      canvasVisible = e.isIntersecting;
      // Restart loop when slide scrolls back into view
      if (canvasVisible && !rafId) { rafId = requestAnimationFrame(frame); }
    });
  }, {threshold:0.1});
  canvasIO.observe(cv);

  function frame(){
    if(canvasVisible){
      t++;
      if(!W || !H){ requestAnimationFrame(frame); return; }

    // ── Sky ──
    var skyG = cx.createLinearGradient(0,0,0,H*0.52);
    skyG.addColorStop(0,'#06070b');
    skyG.addColorStop(1,'#0d0f16');
    cx.fillStyle = skyG; cx.fillRect(0,0,W,H*0.52);

    // Stars twinkle
    stars.forEach(function(s){
      var tw = Math.sin(t*0.03 + s.x*10) * 0.3 + s.a;
      cx.beginPath(); cx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2);
      cx.fillStyle = 'rgba(255,248,220,'+tw+')'; cx.fill();
    });

    // Horizon glow (city ambient)
    var hg = cx.createLinearGradient(0, H*0.38, 0, H*0.52);
    hg.addColorStop(0,'rgba(201,168,76,0.0)');
    hg.addColorStop(1,'rgba(201,168,76,0.06)');
    cx.fillStyle = hg; cx.fillRect(0,H*0.38,W,H*0.14);

    var groundY = H * 0.58;

    // ── Background buildings (slow parallax) ──
    var bgOffset = (t * 0.3) % W;
    for(var rep=0;rep<3;rep++){
      bldgsBg.forEach(function(b){
        var bx = ((b.x * W - bgOffset + rep*W) % (W*1.5)) - W*0.1;
        var bh = b.h * H;
        var bw = b.w * W;
        cx.fillStyle = '#0f1018';
        cx.fillRect(bx, groundY - bh, bw, bh);
        // windows
        for(var wy2=0; wy2<bh-8; wy2+=9){
          for(var wx2=3; wx2<bw-3; wx2+=7){
            if(Math.sin(bx*3+wy2*7+wx2*5) > 0.3){
              cx.fillStyle = 'rgba(201,168,76,0.35)';
              cx.fillRect(bx+wx2, groundY-bh+wy2, 3, 4);
            }
          }
        }
      });
    }

    // ── Foreground buildings (faster, darker) ──
    var fgOffset = (t * 0.9) % W;
    for(var rep2=0;rep2<3;rep2++){
      bldgsFg.forEach(function(b){
        var bx = ((b.x * W - fgOffset + rep2*W) % (W*1.5)) - W*0.1;
        var bh = b.h * H;
        var bw = b.w * W;
        cx.fillStyle = '#07080b';
        cx.fillRect(bx, groundY - bh, bw, bh);
        // fewer, brighter windows
        for(var wy2=4; wy2<bh-8; wy2+=11){
          for(var wx2=4; wx2<bw-4; wx2+=8){
            if(Math.sin(bx*7+wy2*11+wx2*3+t*0.01) > 0.55){
              cx.fillStyle = 'rgba(255,248,200,0.5)';
              cx.fillRect(bx+wx2, groundY-bh+wy2, 3, 4);
            }
          }
        }
      });
    }

    // ── Ground / road ──
    var roadG = cx.createLinearGradient(0, groundY, 0, H);
    roadG.addColorStop(0,'#131418');
    roadG.addColorStop(1,'#0d0e11');
    cx.fillStyle = roadG;
    cx.fillRect(0, groundY, W, H - groundY);

    // Road edge lines
    cx.strokeStyle = 'rgba(201,168,76,0.3)'; cx.lineWidth = 1;
    cx.beginPath(); cx.moveTo(0,groundY); cx.lineTo(W,groundY); cx.stroke();

    // White dashes
    var dashOffset = (t * 3.5) % (W/4);
    for(var d=0;d<12;d++){
      var dx = d*(W/4) - dashOffset;
      if(dx > -60 && dx < W+60){
        cx.fillStyle = 'rgba(255,255,255,0.12)';
        cx.fillRect(dx, groundY + (H-groundY)*0.45, 40, 3);
      }
    }

    // Gold centre line dashes
    var cdOffset = (t * 3.5) % (W/5);
    for(var d2=0;d2<14;d2++){
      var cdx = d2*(W/5) - cdOffset;
      if(cdx > -50 && cdx < W+50){
        cx.fillStyle = 'rgba(201,168,76,0.2)';
        cx.fillRect(cdx, groundY + (H-groundY)*0.22, 28, 2);
      }
    }

    // Motion streaks (speed lines left side)
    for(var ml=0; ml<5; ml++){
      var sy = groundY - 8 - ml*4;
      var slen = 18 + ml*10;
      var soff = (t*4 + ml*37) % (W*1.3);
      var sx = W*0.38 - soff;
      if(sx > -slen && sx < W*0.4){
        cx.strokeStyle = 'rgba(201,168,76,'+(0.08+ml*0.04)+')';
        cx.lineWidth = 0.8;
        cx.beginPath(); cx.moveTo(sx, sy); cx.lineTo(sx+slen, sy); cx.stroke();
      }
    }

    // ── Car ──
    var carX = W * 0.42;
    drawCar(carX, groundY);

    // Road reflection under car
    var refG = cx.createLinearGradient(0, groundY, 0, H);
    refG.addColorStop(0,'rgba(201,168,76,0.04)');
    refG.addColorStop(1,'transparent');
    cx.fillStyle = refG;
    cx.fillRect(carX - W*0.25, groundY, W*0.5, H - groundY);

    } // end if(canvasVisible)
    rafId = null;
    if (canvasVisible) { rafId = requestAnimationFrame(frame); }
  }
  // Start — canvasIO will fire on first observation and kick off the loop
  // Also start immediately in case IntersectionObserver fires late
  rafId = requestAnimationFrame(frame);
})();
document.getElementById('fare-btn').addEventListener('click', calculateFare);
document.getElementById('daily-btn').addEventListener('click', calculateDaily);
document.getElementById('distance').addEventListener('keydown', function(e){ if(e.key==='Enter') calculateFare(); });
document.getElementById('d-days').addEventListener('keydown', function(e){ if(e.key==='Enter') calculateDaily(); });

// ══════════════════════════════════════════════════════
// P&P ANALYTICS MODULE — Event Tracking
// Tracks to both GA4 and localStorage for offline backup
// ══════════════════════════════════════════════════════
var PPAnalytics = (function(){
  function send(eventName, params) {
    // GA4 event
    try {
      if(typeof gtag === 'function') {
        gtag('event', eventName, params || {});
      }
    } catch(e){}

    // localStorage backup log
    try {
      var log = JSON.parse(localStorage.getItem('pp_events') || '[]');
      log.push({ event: eventName, params: params || {}, time: new Date().toISOString() });
      if(log.length > 200) log = log.slice(-200);
      localStorage.setItem('pp_events', JSON.stringify(log));
    } catch(e){}

    // Console debug
    console.log('[P&P Analytics]', eventName, params || '');
  }

  // Page view (already handled by GA4 config, but log locally)
  send('page_view', { page_title: 'P&P Tours and Travels' });

  // Call button clicks
  document.querySelectorAll('a[href^="tel:"]').forEach(function(el){
    el.addEventListener('click', function(){
      send('call_button_click', { location: document.title });
    });
  });

  // WhatsApp button clicks
  document.querySelectorAll('a[href^="https://wa.me"]').forEach(function(el){
    el.addEventListener('click', function(){
      var label = el.textContent.trim().substring(0, 40) || 'whatsapp_cta';
      send('whatsapp_button_click', { button_label: label });
    });
  });

  // Float Book Now button
  var floatBtn = document.getElementById('floatBookBtn');
  if(floatBtn){
    floatBtn.addEventListener('click', function(){
      send('float_book_btn_click', {});
    });
  }

  // Expose for use in booking module
  return { send: send };
})();

// Legacy alias for backward compatibility
function trackClick(label){ PPAnalytics.send(label, {}); }

// ══════════════════════════════════════════════════════
// P&P TOAST MODULE — UI Notifications
// ══════════════════════════════════════════════════════
var PPToast = (function(){
  var timer = null;
  function show(msg, type, duration) {
    var el = document.getElementById('ppToast');
    var iconEl = document.getElementById('toastIcon');
    var msgEl  = document.getElementById('toastMsg');
    if(!el) return;
    clearTimeout(timer);
    el.className = 'show ' + (type || 'success');
    iconEl.textContent = type === 'error' ? '❌' : type === 'loading' ? '⏳' : '✅';
    msgEl.textContent  = msg;
    if(type !== 'loading') {
      timer = setTimeout(function(){ el.classList.remove('show'); }, duration || 4000);
    }
  }
  function hide() {
    var el = document.getElementById('ppToast');
    if(el) el.classList.remove('show');
    clearTimeout(timer);
  }
  return { show: show, hide: hide };
})();

// ══════════════════════════════════════════════════════
// PP STORAGE MODULE — robust POST + retry + iframe fallback
// ══════════════════════════════════════════════════════
var PPStorage = (function () {
  'use strict';

  function sanitize(str) {
    if (typeof str !== 'string') return String(str);
    return str.replace(/<[^>]*>/g, '').replace(/[<>"'`]/g, '').trim().substring(0, 200);
  }

  function generateBookingId() {
    var ts  = Date.now().toString(36).toUpperCase();
    var rnd = Math.random().toString(36).substring(2, 5).toUpperCase();
    return 'PP-' + ts + '-' + rnd;
  }

  function assignDriver() {
    var drivers = (window.PP_CONFIG && window.PP_CONFIG.DRIVERS) || ['Kishan Kumar', 'Vishal Kumar'];
    var idx = 0;
    try { idx = parseInt(localStorage.getItem('pp_driver_idx') || '0', 10); } catch (e) {}
    var driver = drivers[idx % drivers.length];
    try { localStorage.setItem('pp_driver_idx', String((idx + 1) % drivers.length)); } catch (e) {}
    return driver;
  }

  function saveLocal(booking) {
    try {
      var list = JSON.parse(localStorage.getItem('pp_bookings') || '[]');
      list.push(booking);
      if (list.length > 200) list = list.slice(-200);
      localStorage.setItem('pp_bookings', JSON.stringify(list));
      console.log('[PP Storage] Local backup saved. ID:', booking.bookingId);
    } catch (e) {
      console.warn('[PP Storage] localStorage save failed:', e);
    }
  }

  // application/x-www-form-urlencoded is CORS-safelisted — sent correctly
  // with no-cors. Apps Script reads fields via e.parameter (not JSON.parse).
  function toParams(booking) {
    return Object.keys(booking).map(function (k) {
      var v = (booking[k] === null || booking[k] === undefined) ? '' : String(booking[k]);
      return encodeURIComponent(k) + '=' + encodeURIComponent(v);
    }).join('&');
  }

  // Tier 3: hidden iframe + form POST — zero fetch dependency
  function submitViaIframe(url, booking) {
    console.log('[PP Storage] Trying iframe-form fallback. ID:', booking.bookingId);
    try {
      var uid    = 'pp_frame_' + Date.now();
      var iframe = document.createElement('iframe');
      iframe.name = uid;
      iframe.style.cssText = 'display:none;position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;border:none;';
      document.body.appendChild(iframe);

      var form    = document.createElement('form');
      form.method = 'POST';
      form.action = url;
      form.target = uid;
      form.style.cssText = 'display:none;';

      Object.keys(booking).forEach(function (k) {
        var inp   = document.createElement('input');
        inp.type  = 'hidden';
        inp.name  = k;
        inp.value = (booking[k] === null || booking[k] === undefined) ? '' : String(booking[k]);
        form.appendChild(inp);
      });

      document.body.appendChild(form);
      form.submit();
      console.log('[PP Storage] Iframe-form submitted. ID:', booking.bookingId);

      setTimeout(function () {
        try { form.parentNode && form.parentNode.removeChild(form); } catch (e) {}
        try { iframe.parentNode && iframe.parentNode.removeChild(iframe); } catch (e) {}
      }, 15000);
    } catch (err) {
      console.error('[PP Storage] Iframe-form fallback failed:', err);
    }
  }

  // Tier 1+2: fetch with one automatic retry after 1.5 s
  function submitViaFetch(url, booking, attempt, onDone) {
    attempt = attempt || 0;
    console.log('[PP Storage] fetch attempt ' + (attempt + 1) + '. ID:', booking.bookingId);

    fetch(url, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    toParams(booking)
    })
    .then(function () {
      // Opaque response (no-cors) = request reached the server
      console.log('[PP Storage] Submission sent (opaque OK). ID:', booking.bookingId);
      onDone(true);
    })
    .catch(function (err) {
      console.warn('[PP Storage] fetch attempt ' + (attempt + 1) + ' failed:', err.message || err);
      if (attempt < 1) {
        setTimeout(function () { submitViaFetch(url, booking, attempt + 1, onDone); }, 1500);
      } else {
        console.warn('[PP Storage] fetch exhausted. Falling back to iframe-form.');
        submitViaIframe(url, booking);
        onDone(false);
      }
    });
  }

  function sendToSheets(booking, onSuccess, onError) {
    var url = (window.PP_CONFIG && window.PP_CONFIG.SHEETS_URL) || '';

    if (!url || url.indexOf('YOUR_SCRIPT_ID') !== -1 || url.length < 60) {
      console.warn('[PP Storage] SHEETS_URL not configured — local-only mode.');
      saveLocal(booking);
      onSuccess(booking);
      return;
    }

    var DEDUP = 'pp_last_submit';
    try {
      var last = parseInt(localStorage.getItem(DEDUP) || '0', 10);
      if (Date.now() - last < 10000) {
        console.warn('[PP Storage] Duplicate blocked — treating as success.');
        onSuccess(booking);
        return;
      }
      localStorage.setItem(DEDUP, String(Date.now()));
    } catch (e) {
      console.warn('[PP Storage] localStorage unavailable:', e);
    }

    console.log('[PP Storage] Submitting data. ID:', booking.bookingId);
    saveLocal(booking);

    if (typeof fetch === 'function') {
      submitViaFetch(url, booking, 0, function () { onSuccess(booking); });
    } else {
      submitViaIframe(url, booking);
      onSuccess(booking);
    }
  }

  return {
    sanitize:          sanitize,
    generateBookingId: generateBookingId,
    assignDriver:      assignDriver,
    saveLocal:         saveLocal,
    sendToSheets:      sendToSheets
  };
})();

// ══════════════════════════════════════════════════════
// UPGRADED BOOKING SYSTEM — Live Pricing + Trip Summary
// + Google Sheets backend + GA4 tracking + Driver assign
// ══════════════════════════════════════════════════════
(function(){

  // ── Pricing config ──
  var RATES = { '4': 15, '6': 16, '7': 17 };
  var DRIVER_CHARGE = 500; // outstation only

  // ── Field IDs for validation ──
  var REQUIRED = ['b-pickup','b-drop','b-datetime','b-vehicle','b-triptype','b-distance','b-name','b-phone'];

  var bookSubmitting = false;

  // ─────────────────────────────────────
  // UI HELPERS
  // ─────────────────────────────────────
  function setFieldError(id, show) {
    var el  = document.getElementById(id);
    var err = document.getElementById('err-' + id.replace('b-',''));
    if(!el) return;
    el.classList.toggle('field-error', show);
    if(err) err.classList.toggle('show', show);
  }
  function clearAllErrors() {
    REQUIRED.forEach(function(id){ setFieldError(id, false); });
  }

  // ─────────────────────────────────────
  // LIVE PRICE CALCULATION
  // ─────────────────────────────────────
  function calcPrice() {
    var vehicle  = document.getElementById('b-vehicle').value;
    var triptype = document.getElementById('b-triptype').value;
    var distVal  = parseFloat(document.getElementById('b-distance').value);
    var rate     = RATES[vehicle] || 0;
    var dist     = (!isNaN(distVal) && distVal > 0) ? distVal : 0;
    var fare     = dist * rate;
    var driver   = (triptype === 'outstation' && dist > 0 && rate > 0) ? DRIVER_CHARGE : 0;
    return { rate: rate, dist: dist, fare: fare, driver: driver, total: fare + driver, vehicle: vehicle, triptype: triptype };
  }

  // ─────────────────────────────────────
  // TRIP SUMMARY — live update
  // ─────────────────────────────────────
  function updateSummary() {
    var pickup      = document.getElementById('b-pickup').value.trim();
    var drop        = document.getElementById('b-drop').value.trim();
    var datetime    = document.getElementById('b-datetime').value;
    var vehicleEl   = document.getElementById('b-vehicle');
    var triptype    = document.getElementById('b-triptype').value;
    var dist        = document.getElementById('b-distance').value;
    var vehicleLabel= vehicleEl.options[vehicleEl.selectedIndex] ? vehicleEl.options[vehicleEl.selectedIndex].text.split(' —')[0] : '—';
    var triptypeLabel = triptype === 'local' ? 'Local' : triptype === 'outstation' ? 'Outstation' : '—';
    var dtStr = '—';
    if(datetime) { try { dtStr = new Date(datetime).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}); } catch(e){} }
    var p = calcPrice();
    var hasEnough = pickup || drop || datetime || vehicleEl.value || triptype || dist;
    var box = document.getElementById('tripSummaryBox');
    if(hasEnough) {
      box.style.display = 'block';
      document.getElementById('ts-pickup').textContent   = pickup   || '—';
      document.getElementById('ts-drop').textContent     = drop     || '—';
      document.getElementById('ts-datetime').textContent = dtStr;
      document.getElementById('ts-vehicle').textContent  = vehicleLabel;
      document.getElementById('ts-triptype').textContent = triptypeLabel;
      document.getElementById('ts-distance').textContent = dist > 0 ? dist + ' km' : '—';
      if(p.total > 0) {
        document.getElementById('ts-price').textContent = '₹' + fmt(p.total);
        var bkdn = p.dist + ' km × ₹' + p.rate + '/km';
        if(p.driver > 0) bkdn += ' + ₹' + fmt(p.driver) + ' driver';
        document.getElementById('ts-breakdown').textContent = bkdn;
      } else {
        document.getElementById('ts-price').textContent = '₹ —';
        document.getElementById('ts-breakdown').textContent = 'Enter vehicle, trip type & distance';
      }
    } else {
      box.style.display = 'none';
    }
  }

  // ─────────────────────────────────────
  // FORM VALIDITY → enable/disable button
  // ─────────────────────────────────────
  function checkFormValidity() {
    var pickup   = document.getElementById('b-pickup').value.trim();
    var drop     = document.getElementById('b-drop').value.trim();
    var datetime = document.getElementById('b-datetime').value;
    var vehicle  = document.getElementById('b-vehicle').value;
    var triptype = document.getElementById('b-triptype').value;
    var dist     = parseFloat(document.getElementById('b-distance').value);
    var name     = document.getElementById('b-name').value.trim();
    var phone    = document.getElementById('b-phone').value.trim().replace(/\D/g,'');
    if (phone.length === 12 && phone.startsWith('91')) phone = phone.slice(2);
    if (phone.length === 11 && phone.startsWith('0'))  phone = phone.slice(1);
    var allFilled= pickup && drop && datetime && vehicle && triptype && !isNaN(dist) && dist > 0 && name && phone.length === 10;
    var btn = document.getElementById('bookNowBtn');
    var lbl = document.getElementById('bookBtnLabel');
    if(allFilled) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor  = 'pointer';
      lbl.textContent = 'Book via WhatsApp — ₹' + fmt(calcPrice().total);
    } else {
      btn.disabled = true;
      btn.style.opacity = '.5';
      btn.style.cursor  = 'not-allowed';
      lbl.textContent = 'Fill all fields to continue';
    }
  }

  // ─────────────────────────────────────
  // ATTACH LIVE LISTENERS
  // ─────────────────────────────────────
  REQUIRED.forEach(function(id) {
    var el = document.getElementById(id);
    if(!el) return;
    el.addEventListener((el.tagName === 'SELECT') ? 'change' : 'input', function(){
      setFieldError(id, false);
      updateSummary();
      checkFormValidity();
    });
  });

  // ─────────────────────────────────────────────────────────
  // SUBMIT — WhatsApp first (sync), Sheets second (async)
  // ─────────────────────────────────────────────────────────
  document.getElementById('bookNowBtn').addEventListener('click', function () {
    if (bookSubmitting) return;

    // ── Read values ──────────────────────────────────────────────
    var pickup       = document.getElementById('b-pickup').value.trim();
    var drop         = document.getElementById('b-drop').value.trim();
    var datetime     = document.getElementById('b-datetime').value;
    var vehicleEl    = document.getElementById('b-vehicle');
    var vehicle      = vehicleEl.value;
    var vehicleLabel = vehicleEl.options[vehicleEl.selectedIndex]
                       ? vehicleEl.options[vehicleEl.selectedIndex].text.split(' \u2014')[0] : '';
    var triptype     = document.getElementById('b-triptype').value;
    var dist         = parseFloat(document.getElementById('b-distance').value);
    var name         = document.getElementById('b-name').value.trim();
    var phone        = document.getElementById('b-phone').value.trim().replace(/\D/g, '');
    // Normalise Indian numbers: strip leading country code or trunk prefix
    if (phone.length === 12 && phone.startsWith('91')) phone = phone.slice(2);
    if (phone.length === 11 && phone.startsWith('0'))  phone = phone.slice(1);

    // ── Validate ─────────────────────────────────────────────────
    clearAllErrors();
    var hasError = false;
    function fieldErr(id) { setFieldError(id, true); hasError = true; }
    if (!pickup)                  fieldErr('b-pickup');
    if (!drop)                    fieldErr('b-drop');
    if (!datetime)                fieldErr('b-datetime');
    if (!vehicle)                 fieldErr('b-vehicle');
    if (!triptype)                fieldErr('b-triptype');
    if (isNaN(dist) || dist <= 0) fieldErr('b-distance');
    if (!name)                    fieldErr('b-name');
    if (phone.length !== 10)      fieldErr('b-phone');
    if (hasError) {
      PPToast.show('Please fill all required fields correctly.', 'error');
      return;
    }

    bookSubmitting = true;
    // Safety timer: if callbacks never fire (network hang), unlock after 15s
    var bookingLockTimer = setTimeout(function(){
      bookSubmitting = false;
      console.warn('[PP Booking] Safety unlock: bookSubmitting reset after 15s.');
    }, 15000);
    PPToast.show('Saving your booking\u2026', 'loading');

    // ── Build booking object ──────────────────────────────────────
    var s              = PPStorage.sanitize;
    var p              = calcPrice();
    var assignedDriver = PPStorage.assignDriver();
    var bookingId      = PPStorage.generateBookingId();
    var dtStr          = datetime;
    try { dtStr = new Date(datetime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) {}

    var booking = {
      bookingId:     bookingId,
      timestamp:     new Date().toISOString(),
      name:          s(name),
      phone:         s(phone),
      pickup:        s(pickup),
      drop:          s(drop),
      datetime:      datetime,
      datetimeStr:   dtStr,
      vehicle:       s(vehicleLabel),
      vehicleSeater: s(vehicle),
      triptype:      s(triptype),
      distance:      dist,
      rate:          p.rate,
      fare:          p.fare,
      driverCharge:  p.driver,
      price:         p.total,
      driver:        assignedDriver,
      source:        'website_form'
    };

    // ── GA4 event ─────────────────────────────────────────────────
    PPAnalytics.send('booking_form_submit', {
      booking_id:      bookingId,
      vehicle_type:    vehicleLabel,
      trip_type:       triptype,
      distance_km:     dist,
      total_price:     p.total,
      assigned_driver: assignedDriver
    });

    // ── Build WhatsApp message ─────────────────────────────────────
    var priceBreakdown = booking.distance + ' km × ₹' + booking.rate + '/km = ₹' + fmt(booking.fare);
    if (booking.driverCharge > 0) priceBreakdown += '\nDriver Allowance: ₹' + fmt(booking.driverCharge);

    var waMsg = [
      '*New Booking - P&P Tours & Travels*',
      'Booking ID: ' + booking.bookingId,
      '',
      '*Name:* '        + booking.name,
      '*Phone:* '       + booking.phone,
      '',
      '*Pickup:* '      + booking.pickup,
      '*Drop:* '        + booking.drop,
      '*Date & Time:* ' + booking.datetimeStr,
      '*Vehicle:* '     + booking.vehicle,
      '*Trip Type:* '   + (booking.triptype === 'outstation' ? 'Outstation' : 'Local'),
      '*Distance:* '    + booking.distance + ' km',
      '*Assigned Driver:* ' + booking.driver,
      '',
      '*Price Breakdown:*',
      priceBreakdown,
      '*Total Estimated: ₹' + fmt(booking.price) + '*',
      '',
      'Please confirm availability. Thank you!'
    ].join('\n');

    var waNumber = (window.PP_CONFIG && window.PP_CONFIG.WA_NUMBER) || '917870737475';
    var waURL    = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(waMsg);

    // ── KEY FIX: Open WhatsApp SYNCHRONOUSLY inside the click event ─
    // window.open() must be called during the user-gesture tick.
    // Calling it inside setTimeout or a Promise callback causes mobile
    // browsers (iOS Safari, Android Chrome) to block it as a popup.
    console.log('[PP Booking] Submission start. ID:', bookingId);
    console.log('[PP Booking] Redirecting to WhatsApp...');
    var waWindow = window.open(waURL, '_blank');

    // Fallback for Android WebViews that block window.open on click
    if (!waWindow || waWindow.closed || typeof waWindow.closed === 'undefined') {
      var tempA       = document.createElement('a');
      tempA.href      = waURL;
      tempA.target    = '_blank';
      tempA.rel       = 'noopener noreferrer';
      tempA.style.cssText = 'display:none;';
      document.body.appendChild(tempA);
      tempA.click();
      setTimeout(function () {
        try { document.body.removeChild(tempA); } catch (e) {}
      }, 500);
    }

    // ── Update UI immediately (no network wait) ────────────────────
    var badge        = document.getElementById('driverBadge');
    var driverNameEl = document.getElementById('assignedDriverName');
    var bookingTagEl = document.getElementById('bookingIdTag');
    if (badge && driverNameEl && bookingTagEl) {
      driverNameEl.textContent  = booking.driver;
      bookingTagEl.textContent  = '#' + booking.bookingId;
      badge.style.display       = 'block';
    }
    var successEl = document.getElementById('formSuccess');
    if (successEl) successEl.classList.add('show');
    var lbl = document.getElementById('bookBtnLabel');
    var btn = document.getElementById('bookNowBtn');
    if (lbl) lbl.textContent = 'Book via WhatsApp — ₹' + fmt(booking.price);
    if (btn) btn.style.opacity = '1';
    PPToast.show('Booking saved! Opening WhatsApp...', 'success');

    // ── Send to Sheets AFTER handing off WA link (fire-and-forget) ─
    // 400 ms head-start: WA link is fully handed to the OS before we
    // hit the network. Prevents Android browsers from cancelling an
    // in-flight fetch when navigating to the WA app chooser.
    setTimeout(function () {
      console.log('[PP Booking] Submitting data to Sheets...');
      PPStorage.sendToSheets(
        booking,
        function (b) {
          clearTimeout(bookingLockTimer);
          bookSubmitting = false;
          console.log('[PP Booking] Submission sent. ID:', b.bookingId);
          PPAnalytics.send('booking_sheets_success', { booking_id: b.bookingId });
        },
        function (errMsg) {
          clearTimeout(bookingLockTimer);
          bookSubmitting = false;
          console.warn('[PP Booking] Submission error:', errMsg);
          PPToast.show(errMsg || 'Something went wrong. Data saved locally.', 'error');
          PPAnalytics.send('booking_form_error', { error: errMsg || 'unknown' });
        }
      );
    }, 400);
  });

  // Init
  updateSummary();
  checkFormValidity();

})();

// ══════════════════════════════════════
// ARIA — Booking Assistant Logic
// ══════════════════════════════════════
(function(){
  var fab     = document.getElementById('ariaFab');
  var panel   = document.getElementById('ariaPanel');
  var closeBtn= document.getElementById('ariaClose');
  var body    = document.getElementById('ariaBody');
  var bottom  = document.getElementById('ariaBottom');
  var progress= document.getElementById('ariaProgress');
  var notif   = document.getElementById('ariaNot');

  var isOpen  = false;
  var state   = {};  // booking state

  // ── Open / close ──
  fab.addEventListener('click', function(){
    if(!isOpen){ openPanel(); } else { closePanel(); }
  });
  closeBtn.addEventListener('click', closePanel);

  function openPanel(){
    isOpen = true;
    panel.classList.add('open');
    if(notif) notif.style.display = 'none';
    if(body.children.length === 0) startFlow();
  }
  function closePanel(){
    isOpen = false;
    panel.classList.remove('open');
  }

  // ── Helpers ──
  function now(){
    var d=new Date(); var h=d.getHours(),m=d.getMinutes();
    return (h%12||12)+':'+(m<10?'0'+m:m)+(h<12?' AM':' PM');
  }
  function addMsg(text, who, delay){
    return new Promise(function(res){
      var wrap = document.createElement('div');
      wrap.className = 'msg msg-'+who;
      wrap.innerHTML = '<div class="bubble">'+text+'</div><div class="msg-time">'+now()+'</div>';
      body.appendChild(wrap);
      body.scrollTop = body.scrollHeight;
      if(delay){ setTimeout(res, delay); } else { res(); }
    });
  }
  function showTyping(){
    var t = document.createElement('div');
    t.className = 'msg msg-bot'; t.id = 'typingEl';
    t.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
  }
  function hideTyping(){
    var t = document.getElementById('typingEl');
    if(t) t.remove();
  }
  function setProgress(pct){ progress.style.width = pct+'%'; }
  function clearBottom(){ bottom.innerHTML = ''; }

  function botSay(text, delay){
    return new Promise(function(res){
      showTyping();
      setTimeout(function(){
        hideTyping();
        addMsg(text,'bot').then(res);
      }, delay||900);
    });
  }

  function showOptions(opts){
    clearBottom();
    var div = document.createElement('div');
    div.className = 'aria-options';
    opts.forEach(function(o){
      var btn = document.createElement('button');
      btn.className = 'opt-btn'+(o.primary?' primary':'');
      btn.textContent = o.label;
      btn.addEventListener('click', function(){
        addMsg(o.label,'user');
        clearBottom();
        o.action();
      });
      div.appendChild(btn);
    });
    bottom.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function showNumberInput(placeholder, unit, onSubmit){
    clearBottom();
    var div = document.createElement('div');
    div.className = 'aria-input-row';
    div.innerHTML = '<input type="number" min="1" placeholder="'+placeholder+'" id="ariaNumIn"/><button>Go →</button>';
    bottom.appendChild(div);
    var inp = document.getElementById('ariaNumIn');
    var btn = div.querySelector('button');
    inp.focus();
    function submit(){
      var v = parseInt(inp.value);
      if(!v||v<1){ inp.style.borderColor='rgba(220,80,80,0.6)'; return; }
      addMsg(v+' '+unit,'user');
      clearBottom();
      onSubmit(v);
    }
    btn.addEventListener('click', submit);
    inp.addEventListener('keydown', function(e){ if(e.key==='Enter') submit(); });
  }

  function showTextInput(placeholder, unit, onSubmit){
    // unit is optional (for backward compat), so check if it's a function
    if(typeof unit === 'function'){ onSubmit = unit; unit = ''; }
    clearBottom();
    var div = document.createElement('div');
    div.className = 'aria-input-row';
    div.innerHTML = '<input id="ariaTextIn" type="text" placeholder="'+placeholder+'" autocomplete="off"/><button>→</button>';
    bottom.appendChild(div);
    var inp = document.getElementById('ariaTextIn');
    var btn = div.querySelector('button');
    inp.focus();
    function submit(){
      var v = inp.value.trim();
      if(!v){ inp.style.borderColor='rgba(220,80,80,0.6)'; return; }
      addMsg(v,'user');
      clearBottom();
      onSubmit(v);
    }
    btn.addEventListener('click', submit);
    inp.addEventListener('keydown', function(e){ if(e.key==='Enter') submit(); });
  }

  function showCTA(){
    clearBottom();
    var div = document.createElement('div');
    div.className = 'aria-cta-row';
    div.innerHTML =
      '<a class="cta-call" href="tel:+917870737475">📞 Call Now</a>'+
      '<a class="cta-wa" href="https://wa.me/917870737475?text=I%20want%20to%20book%20a%20car" target="_blank">💬 WhatsApp</a>';
    bottom.appendChild(div);
  }

  function fmt(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,','); }

  // ══════════════════════════════════════
  // FLOW
  // ══════════════════════════════════════
  function startFlow(){
    state = {};
    setProgress(5);
    botSay('Namaste! 🙏 I\'m <strong>Aria</strong>, your P&amp;P booking assistant.<br><br>I can <strong>book your ride instantly</strong> via WhatsApp or help you <strong>estimate your fare</strong>. What would you like?', 600)
    .then(function(){
      setProgress(12);
      showOptions([
        { label:'📲 Book a Ride Now', primary:true, action: stepDirectBook },
        { label:'💰 Get Fare Estimate', action: stepServiceType },
        { label:'📅 Daily Rental Cost', action: stepDailyDays },
      ]);
    });
  }

  // ── Direct Book flow (NEW) ──
  function stepDirectBook(){
    setProgress(20);
    botSay('Let\'s book your ride! 🚗<br>What\'s your <strong>pickup location</strong>?')
    .then(function(){
      showTextInput('e.g. Patna Junction…', function(pickup){
        state.pickup = pickup;
        setProgress(35);
        botSay('Got it! And your <strong>drop location</strong>?', 300)
        .then(function(){
          showTextInput('e.g. Gaya Airport…', function(drop){
            state.drop = drop;
            setProgress(55);
            botSay('Perfect! Your <strong>name</strong> please?', 300)
            .then(function(){
              showTextInput('Full name…', function(uname){
                state.uname = uname;
                setProgress(75);
                botSay('And your <strong>phone number</strong>?', 300)
                .then(function(){
                  showTextInput('+91 XXXXX…', function(uphone){
                    state.uphone = uphone;
                    setProgress(95);
                    var msg = '🚗 *New Booking — P&P Tours*\n\n' +
                              '👤 *Name:* ' + state.uname + '\n' +
                              '📱 *Phone:* ' + state.uphone + '\n' +
                              '📍 *Pickup:* ' + state.pickup + '\n' +
                              '🏁 *Drop:* ' + state.drop + '\n\n' +
                              'Please confirm availability. Thank you!';
                    var waURL = 'https://wa.me/917870737475?text=' + encodeURIComponent(msg);
                    botSay('All set, <strong>' + state.uname + '</strong>! 🎉<br>Tap below to confirm your booking.', 400)
                    .then(function(){
                      setProgress(100);
                      clearBottom();
                      var row = document.createElement('div');
                      row.className = 'aria-cta-row';
                      row.innerHTML = '<a class="cta-wa" href="' + waURL + '" target="_blank" style="flex:1">📲 Confirm on WhatsApp</a>';
                      bottom.appendChild(row);
                      setTimeout(function(){
                        botSay('Is there anything else I can help with?', 1500)
                        .then(function(){
                          showOptions([
                            { label:'💰 Get Fare Estimate', action: function(){ clearBottom(); body.innerHTML=''; startFlow(); }},
                            { label:'✕ Close', action: closePanel },
                          ]);
                        });
                      }, 2000);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  // ── Step: service type ──
  function stepServiceType(){
    setProgress(25);
    botSay('Great choice! Which vehicle size do you prefer?')
    .then(function(){
      showOptions([
        { label:'🚗 4-Seater', action: function(){ state.seater='4'; stepTripType(); }},
        { label:'🚙 6-Seater', action: function(){ state.seater='6'; stepTripType(); }},
      ]);
    });
  }

  // ── Step: trip type ──
  function stepTripType(){
    setProgress(42);
    botSay('Perfect! And what kind of trip is this?')
    .then(function(){
      showOptions([
        { label:'🏙️ Local (city)', action: function(){ state.trip='local'; stepDistance(); }},
        { label:'🛣️ Outgoing (intercity)', action: function(){ state.trip='outgoing'; stepDistance(); }},
      ]);
    });
  }

  // ── Step: distance ──
  function stepDistance(){
    setProgress(60);
    botSay('Almost there! How many <strong>kilometres</strong> is your journey?')
    .then(function(){
      showNumberInput('Enter distance…','km', function(dist){
        state.dist = dist;
        stepShowFare();
      });
    });
  }

  // ── Step: show fare result ──
  function stepShowFare(){
    setProgress(82);
    var rates = {'4-local':15,'6-local':16,'4-outgoing':16,'6-outgoing':17};
    var rate  = rates[state.seater+'-'+state.trip];
    var total = state.dist * rate;
    var label = (state.seater==='4'?'4-Seater':'6-Seater')+' · '+(state.trip==='local'?'Local':'Outgoing');

    // also push to main dashboard
    window.dashFare = total;
    var dmEl = document.getElementById('dash-fare-meta');
    var dvEl = document.getElementById('dash-fare-val');
    if(dmEl) dmEl.textContent = state.seater+'-Seater · '+state.dist+' km';
    if(dvEl){ dvEl.textContent='₹'+fmt(total); dvEl.className='dash-value'; }
    var gtEl = document.getElementById('dash-grand-total');
    if(gtEl) gtEl.textContent = '₹'+fmt((window.dashFare||0)+(window.dashDaily||0));

    botSay('Here\'s your estimate 👇')
    .then(function(){
      var card = document.createElement('div');
      card.className = 'msg msg-bot';
      card.innerHTML =
        '<div class="result-card">'+
          '<div class="rc-label">Estimated Fare</div>'+
          '<div class="rc-amount">₹'+fmt(total)+'</div>'+
          '<div class="rc-detail">'+label+' &nbsp;·&nbsp; '+state.dist+' km &nbsp;·&nbsp; ₹'+rate+'/km</div>'+
        '</div>'+
        '<div class="msg-time">'+now()+'</div>';
      body.appendChild(card);
      body.scrollTop = body.scrollHeight;
      return botSay('Looks good? Ready to confirm your booking! 🎉', 600);
    })
    .then(function(){
      setProgress(100);
      showOptions([
        { label:'📲 Book via WhatsApp', primary:true, action: function(){ stepConfirm('fare'); }},
        { label:'📋 Fill Booking Form', action: function(){ closePanel(); goToSlide(3); }},
        { label:'🔄 Start Over', action: function(){ clearBottom(); body.innerHTML=''; startFlow(); }},
      ]);
    });
  }

  // ── Daily rental flow ──
  function stepDailyDays(){
    setProgress(35);
    botSay('Daily rentals include a professional driver.<br><br>'+
           '🚗 Car — <strong>₹100/day</strong><br>👤 Driver — <strong>₹500/day</strong><br><br>How many <strong>days</strong> do you need the vehicle?')
    .then(function(){
      showNumberInput('Enter number of days…','days', function(days){
        state.days = days;
        stepShowDailyFare();
      });
    });
  }

  function stepShowDailyFare(){
    setProgress(82);
    var car    = 100 * state.days;
    var driver = 500 * state.days;
    var total  = car + driver;
    var label  = state.days+' day'+(state.days>1?'s':'');

    window.dashDaily = total;
    var dmEl = document.getElementById('dash-daily-meta');
    var dvEl = document.getElementById('dash-daily-val');
    if(dmEl) dmEl.textContent = label+' · Car + Driver';
    if(dvEl){ dvEl.textContent='₹'+fmt(total); dvEl.className='dash-value'; }
    var gtEl = document.getElementById('dash-grand-total');
    if(gtEl) gtEl.textContent = '₹'+fmt((window.dashFare||0)+(window.dashDaily||0));

    botSay('Here\'s your daily rental breakdown 👇')
    .then(function(){
      var card = document.createElement('div');
      card.className = 'msg msg-bot';
      card.innerHTML =
        '<div class="result-card">'+
          '<div class="rc-label">Total Rental Cost</div>'+
          '<div class="rc-amount">₹'+fmt(total)+'</div>'+
          '<div class="rc-detail">'+
            '🚗 Car: ₹'+fmt(car)+' &nbsp;·&nbsp; 👤 Driver: ₹'+fmt(driver)+'<br>'+
            label+' &nbsp;·&nbsp; ₹600/day total'+
          '</div>'+
        '</div>'+
        '<div class="msg-time">'+now()+'</div>';
      body.appendChild(card);
      body.scrollTop = body.scrollHeight;
      return botSay('Shall I connect you to confirm the booking? 🚗', 600);
    })
    .then(function(){
      setProgress(100);
      showOptions([
        { label:'📲 Book via WhatsApp', primary:true, action: function(){ stepConfirm('daily'); }},
        { label:'📋 Fill Booking Form', action: function(){ closePanel(); goToSlide(3); }},
        { label:'🔄 Start Over', action: function(){ clearBottom(); body.innerHTML=''; startFlow(); }},
      ]);
    });
  }

  // ── Compare both ──
  function stepCompareBoth(){
    setProgress(30);
    botSay('Sure! Let\'s calculate your <strong>ride fare</strong> first, then <strong>daily rental</strong>.')
    .then(function(){
      stepServiceType();
    });
  }

  // ── Confirm step ──
  function stepConfirm(type){
    setProgress(100);
    botSay('Awesome! Use one of the options below to confirm your booking.<br>Mention your trip details and we\'ll confirm it right away! ✅')
    .then(function(){
      clearBottom();
      var div = document.createElement('div');
      div.className = 'aria-cta-row';
      div.innerHTML =
        '<a class="cta-call" href="tel:+917870737475">📞 Call Now</a>'+
        '<a class="cta-wa" href="https://wa.me/917870737475?text=I%20want%20to%20confirm%20my%20booking%20-%20'+
        (type==='fare' ? encodeURIComponent(state.seater+'-Seater '+state.trip+' '+state.dist+' km') : encodeURIComponent(state.days+' day rental'))+
        '" target="_blank">💬 WhatsApp</a>';
      bottom.appendChild(div);
      setTimeout(function(){
        botSay('Is there anything else I can help you with?', 300)
        .then(function(){
          showOptions([
            { label:'🔄 New Booking', action: function(){ clearBottom(); body.innerHTML=''; startFlow(); }},
            { label:'✕ Close', action: closePanel },
          ]);
        });
      }, 1800);
    });
  }

})();

// ADDED: FAQ Accordion
document.querySelectorAll('.faq-q').forEach(function(q){
  q.addEventListener('click', function(){
    var item = this.parentElement;
    var wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function(el){ el.classList.remove('open'); });
    if(!wasOpen) item.classList.add('open');
  });
});

// ADDED: Smooth scroll to booking - clear error states when user returns
document.querySelectorAll('a[href="#"]').forEach(function(a){
  a.addEventListener('click', function(){
    ['b-pickup','b-drop','b-datetime','b-vehicle','b-triptype','b-distance','b-name','b-phone'].forEach(function(id){
      var el = document.getElementById(id);
      if(el){ el.classList.remove('field-error'); }
    });
    ['err-pickup','err-drop','err-datetime','err-vehicle','err-triptype','err-distance','err-name','err-phone'].forEach(function(id){
      var el = document.getElementById(id);
      if(el){ el.classList.remove('show'); }
    });
    var fs = document.getElementById('formSuccess');
    if(fs){ fs.classList.remove('show'); }
  });
});

// ADDED: Button hover highlight on CTA
document.querySelectorAll('.btn-primary, .book-now-btn, .calc-btn').forEach(function(btn){
  btn.addEventListener('mouseenter', function(){ this.style.filter='brightness(1.08)'; });
  btn.addEventListener('mouseleave', function(){ this.style.filter=''; });
});

// ADDED: Performance - reduce animation on mobile
(function(){
  if(window.innerWidth <= 600){
    // Reduce drift animation duration to save battery on mobile
    var orbs = document.querySelectorAll('.orb');
    orbs.forEach(function(o){ o.style.animationDuration = '40s'; });
  }
})();

// ══════════════════════════════════════════
// URGENCY SYSTEM — Dynamic Live Availability
// ══════════════════════════════════════════
(function(){
  var mainMessages = [
    "Only {n} cars left today — book now!",
    "Just {n} slots remaining for today",
    "{n} cars available — filling fast!",
    "High demand: only {n} vehicles left"
  ];
  var slots = [
    "Today evening (6–9 PM)",
    "Tomorrow morning (7–10 AM)",
    "Today afternoon (3–6 PM)",
    "Tomorrow afternoon (12–3 PM)"
  ];
  var subMessages = [
    "Weekend demand is high. Don't miss your slot.",
    "We recommend booking at least 12 hours in advance.",
    "Several bookings confirmed this hour. Act fast.",
    "Our most popular time slots fill up quickly."
  ];

  function rand(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function updateUrgency(){
    var carsLeft = rand(2, 4);
    var bookingsThisWeek = rand(38, 54);
    var msgTemplate = mainMessages[rand(0,mainMessages.length-1)];
    var mainMsg = msgTemplate.replace('{n}', carsLeft);
    var nextSlot = slots[rand(0,slots.length-1)];
    var subMsg = subMessages[rand(0,subMessages.length-1)];

    var mainEl = document.getElementById('urgencyMainText');
    var subEl  = document.getElementById('urgencySubText');
    var carsEl = document.getElementById('urgencyCarsLeft');
    var bookEl = document.getElementById('urgencyBookings');
    var slotEl = document.getElementById('urgencyNextSlot');

    if(mainEl) mainEl.textContent = mainMsg;
    if(subEl)  subEl.textContent  = subMsg;
    if(carsEl) carsEl.textContent = carsLeft;
    if(bookEl) bookEl.textContent = bookingsThisWeek+'+';
    if(slotEl) slotEl.textContent = '⏰ Next available slot: '+nextSlot;
  }

  // Run on load
  updateUrgency();

  // Refresh every 90 seconds to simulate live updates
  setInterval(updateUrgency, 90000);
})();

// ══════════════════════════════════════════════════════
// UX & SEO UPGRADE v3 — NEW JAVASCRIPT
// ══════════════════════════════════════════════════════

// ── Top Nav: hamburger toggle ──
(function(){
  var btn = document.getElementById('navHamburger');
  var drawer = document.getElementById('navDrawer');
  if(!btn||!drawer) return;
  btn.addEventListener('click', function(){
    var open = drawer.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

function closeDrawer(){
  var btn = document.getElementById('navHamburger');
  var drawer = document.getElementById('navDrawer');
  if(drawer) drawer.classList.remove('open');
  if(btn){ btn.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
}

// ── Top Nav: scroll shadow ──
(function(){
  var nav = document.getElementById('topNav');
  var rc  = document.getElementById('reelContainer');
  if(!nav||!rc) return;
  rc.addEventListener('scroll', function(){
    nav.classList.toggle('scrolled', rc.scrollTop > 10);
  }, {passive:true});
})();

// ── Top Nav: active link highlight based on current slide ──
(function(){
  var navSlideMap = {0:'home',1:'home',2:'fleet',3:'booking',4:'booking',5:'booking',6:'booking',7:'services',8:'services',9:'pricing',10:'contact',11:'services',12:'faq'};
  window.addEventListener('slideChanged', function(e){
    document.querySelectorAll('.nav-link').forEach(function(l){ l.classList.remove('active'); });
  });
})();

// ── Location SEO Tabs ──
function switchLoc(id, btn){
  document.querySelectorAll('.loc-panel').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('.loc-tab').forEach(function(t){ t.classList.remove('active'); });
  var panel = document.getElementById('loc-'+id);
  if(panel) panel.classList.add('active');
  if(btn) btn.classList.add('active');
}

// ── Follow-up Popup System ──
(function(){
  var popup = document.getElementById('followupPopup');
  var popupSub = document.getElementById('popupSub');
  var dismissed = false;
  var shown = false;
  var phoneVal = '';

  // Restore dismissed state so popup doesn't reappear on reload within same session
  try {
    if (sessionStorage.getItem('pp_popup_dismissed') === '1') { dismissed = true; }
  } catch(e){}

  // Restore saved phone from localStorage
  try {
    var saved = localStorage.getItem('pp_phone');
    if(saved){
      var bPhone = document.getElementById('b-phone');
      if(bPhone && !bPhone.value) bPhone.value = saved;
    }
  } catch(e){}

  // Save phone on input
  var bPhone = document.getElementById('b-phone');
  if(bPhone){
    bPhone.addEventListener('input', function(){
      phoneVal = this.value;
      try{ localStorage.setItem('pp_phone', phoneVal); } catch(e){}
    });
  }

  function showPopup(){
    if(dismissed || shown) return;
    shown = true;
    // Personalize if phone saved
    try{
      var p = localStorage.getItem('pp_phone');
      if(p && p.length >= 5 && popupSub){
        popupSub.textContent = 'You started a booking — finish it in 30 seconds and confirm your ride.';
      }
    } catch(e){}
    if(popup) popup.classList.add('show');
  }

  // Show popup on page visibility change (user switches tabs / leaves)
  document.addEventListener('visibilitychange', function(){
    if(document.hidden && !dismissed){ setTimeout(showPopup, 300); }
  });

  // Also show after 45 seconds of inactivity on page
  var idleTimer = null;
  function resetIdle(){
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function(){
      var rc = document.getElementById('reelContainer');
      if(rc && rc.scrollTop > 80) showPopup();
    }, 45000);
  }
  ['mousemove','keydown','scroll','touchstart'].forEach(function(ev){
    document.addEventListener(ev, resetIdle, {passive:true});
  });
  resetIdle();
})();

function dismissPopup(){
  var popup = document.getElementById('followupPopup');
  if(popup) popup.classList.remove('show');
  // Mark dismissed for this session
  try{ sessionStorage.setItem('pp_popup_dismissed','1'); } catch(e){}
}

// Popup dismissal state is now restored inside the popup IIFE above.

// ══════════════════════════════════════════════════════
// FINAL POLISH — Micro-interactions + Scroll Animations
// Pure CSS where possible. Zero heavy libraries.
// ══════════════════════════════════════════════════════
(function(){
  'use strict';

  // ── 1. Respect reduced-motion preference ──
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 2. Ripple effect on primary buttons ──
  function addRipple(btn) {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    if (btn._ripple) return;   // prevent triple-registration
    btn._ripple = true;
    btn.addEventListener('click', function(e) {
      if(prefersReduced) return;
      var r = btn.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 2;
      var x = e.clientX - r.left - size / 2;
      var y = e.clientY - r.top  - size / 2;
      var ripple = document.createElement('span');
      ripple.style.cssText = [
        'position:absolute',
        'border-radius:50%',
        'pointer-events:none',
        'width:' + size + 'px',
        'height:' + size + 'px',
        'left:' + x + 'px',
        'top:' + y + 'px',
        'background:rgba(255,255,255,0.18)',
        'transform:scale(0)',
        'animation:ppRipple 0.55s cubic-bezier(0.4,0,0.2,1) forwards',
        'z-index:99'
      ].join(';');
      btn.appendChild(ripple);
      setTimeout(function(){ if(ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 600);
    });
  }
  document.querySelectorAll('.btn-primary, .book-now-btn, .calc-btn, .nav-cta, .sticky-cta-call, .sticky-cta-wa, #floatBookBtn, .popup-btn-primary').forEach(addRipple);

  // ── 3. Input focus glow: add/remove class for CSS control ──
  document.querySelectorAll('input, select, textarea').forEach(function(el) {
    el.addEventListener('focus', function() { this.classList.add('pp-focused'); }, true);
    el.addEventListener('blur',  function() { this.classList.remove('pp-focused'); }, true);
  });

  // ── 4. Card magnetic tilt on desktop hover (subtle) ──
  if(!prefersReduced && window.innerWidth > 768) {
    document.querySelectorAll('.fleet-card, .why-card, .trust-badge, .wc-card').forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var r = card.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top  + r.height / 2;
        var dx = (e.clientX - cx) / (r.width  / 2);
        var dy = (e.clientY - cy) / (r.height / 2);
        var tiltX = dy * -4;
        var tiltY = dx *  4;
        card.style.transform = 'translateY(-6px) perspective(600px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
        card.style.transition = 'transform 0.08s linear, border-color 0.28s, box-shadow 0.28s';
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
        card.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), border-color 0.28s, box-shadow 0.28s';
      });
    });
  }

  // ── 5. Floating Book Now: entrance slide + smart hide on booking slide ──
  var floatBtn = document.getElementById('floatBookBtn');
  var reelContainer = document.getElementById('reelContainer');
  if(floatBtn && reelContainer) {
    // Delayed entrance
    floatBtn.style.opacity = '0';
    floatBtn.style.transform = 'translateY(20px)';
    floatBtn.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s';
    setTimeout(function() {
      floatBtn.style.opacity = '1';
      floatBtn.style.transform = 'translateY(0)';
    }, 1200);

    // Hide when user is on booking slide (slide-3)
    reelContainer.addEventListener('scroll', function() {
      var bookingSlide = document.getElementById('slide-3');
      if(!bookingSlide) return;
      var r = bookingSlide.getBoundingClientRect();
      var onBooking = r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4;
      floatBtn.style.opacity     = onBooking ? '0' : '1';
      floatBtn.style.pointerEvents = onBooking ? 'none' : 'auto';
    }, { passive: true });
  }

  // ── 6. WhatsApp float: entrance + pulse ring ──
  var waFloat = document.querySelector('.wa-float');
  if(waFloat) {
    waFloat.style.opacity = '0';
    waFloat.style.transform = 'translateY(16px) scale(0.85)';
    waFloat.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    setTimeout(function() {
      waFloat.style.opacity = '1';
      waFloat.style.transform = 'translateY(0) scale(1)';
    }, 1600);
  }

  // ── 7. Staggered card reveal on slide entry ──
  // Augments existing .anim system with per-sibling stagger
  var slideObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if(!entry.isIntersecting) return;
      var cards = entry.target.querySelectorAll(
        '.fleet-card, .why-card, .trust-badge, .testi-card-v2, .service-card, ' +
        '.wc-card, .usecase-card, .driver-card, .google-card, .faq-item, .trust-badge-v2'
      );
      cards.forEach(function(card, idx) {
        var delay = Math.min(idx * 70, 420); // cap stagger at 420ms
        card.style.transitionDelay = delay + 'ms';
        card.classList.add('pp-card-visible');
        setTimeout(function() { card.style.transitionDelay = '0ms'; }, delay + 500);
      });
      slideObs.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reel').forEach(function(s) { slideObs.observe(s); });

  // ── 8. Section title shimmer on entry ──
  var titleObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if(entry.isIntersecting) {
        entry.target.classList.add('pp-title-in');
        titleObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.section-title').forEach(function(el) { titleObs.observe(el); });

  // ── 9. Nav CTA pulse — draw attention on load ──
  var navCta = document.querySelector('.nav-cta');
  if(navCta) {
    setTimeout(function() {
      navCta.classList.add('pp-nav-pulse');
      setTimeout(function() { navCta.classList.remove('pp-nav-pulse'); }, 1800);
    }, 2500);
  }

  // ── 10. Form field typing feedback: live character indicator ──
  var phoneInput = document.getElementById('b-phone');
  if(phoneInput) {
    phoneInput.addEventListener('input', function() {
      var len = this.value.replace(/\D/g,'').length;
      if(len === 10) {
        this.style.borderColor = 'rgba(37,211,102,0.55)';
        this.style.boxShadow   = '0 0 0 3px rgba(37,211,102,0.1)';
      } else {
        this.style.borderColor = '';
        this.style.boxShadow   = '';
      }
    });
  }

  // ── 11. Scroll progress line on nav ──
  var topNav = document.getElementById('topNav');
  if(topNav && reelContainer) {
    var progressBar = document.createElement('div');
    progressBar.id = 'ppScrollProgress';
    progressBar.style.cssText = 'position:absolute;bottom:0;left:0;height:2px;width:0%;background:linear-gradient(90deg,var(--gold),var(--teal));transition:width 0.15s linear;pointer-events:none;';
    topNav.style.position = 'fixed';
    topNav.appendChild(progressBar);
    reelContainer.addEventListener('scroll', function() {
      var el  = reelContainer;
      var pct = el.scrollTop / (el.scrollHeight - el.clientHeight) * 100;
      progressBar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  }

  // ── 12. Booking button: value countdown label ──
  var bookBtn = document.getElementById('bookNowBtn');
  var bookLabel = document.getElementById('bookBtnLabel');
  if(bookBtn && bookLabel) {
    var reqFields = ['b-pickup','b-drop','b-datetime','b-vehicle','b-triptype','b-distance','b-name','b-phone'];
    function countFilled() {
      return reqFields.filter(function(id) {
        var el = document.getElementById(id);
        return el && el.value && el.value.trim() !== '';
      }).length;
    }
    function updateBtnLabel() {
      var filled  = countFilled();
      var total   = reqFields.length;
      var missing = total - filled;
      if(bookBtn.disabled) {
        bookLabel.textContent = missing > 0
          ? missing + ' field' + (missing > 1 ? 's' : '') + ' remaining'
          : 'Confirm your booking →';
      }
    }
    reqFields.forEach(function(id) {
      var el = document.getElementById(id);
      if(el) el.addEventListener('input', updateBtnLabel);
      if(el) el.addEventListener('change', updateBtnLabel);
    });
  }

})();

(function () {
  /* ── FIX 1: Make datetime row span full width ── */
  var dtRow = document.querySelector('#b-datetime');
  if (dtRow) {
    var row = dtRow.closest('.form-row');
    if (row) row.classList.add('full');
  }

  /* ── FIX 2: Freeze scroll-snap on focus, restore on blur ── */
  var FIELDS = [
    '#b-pickup','#b-drop','#b-datetime',
    '#b-vehicle','#b-triptype','#b-distance',
    '#b-name','#b-phone'
  ];

  function freeze() {
    document.body.classList.add('form-active');
  }

  function thaw() {
    /* 400 ms grace period so the WA / Book button stays tappable
       right after the keyboard closes */
    setTimeout(function () {
      var active = document.activeElement;
      var stillInForm = FIELDS.some(function (sel) {
        return active && active === document.querySelector(sel);
      });
      if (!stillInForm) document.body.classList.remove('form-active');
    }, 400);
  }

  FIELDS.forEach(function (sel) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.addEventListener('focus',      freeze, { passive: true });
    el.addEventListener('touchstart', freeze, { passive: true });
    el.addEventListener('blur',       thaw,   { passive: true });
  });

  /* ── FIX 3: Stop scroll-snap re-firing when the mobile keyboard
     resizes the visual viewport (the root cause of the jump) ── */
  if (window.visualViewport) {
    var rc = document.getElementById('reelContainer');
    var lastHeight = window.visualViewport.height;

    window.visualViewport.addEventListener('resize', function () {
      var newHeight = window.visualViewport.height;
      var keyboardOpening = newHeight < lastHeight - 50;
      var keyboardClosing = newHeight > lastHeight + 50;
      lastHeight = newHeight;

      if (keyboardOpening) {
        /* Keyboard just appeared — freeze snap immediately */
        document.body.classList.add('form-active');
      } else if (keyboardClosing) {
        /* Keyboard dismissed — give layout 350 ms to settle, then unfreeze */
        setTimeout(function () {
          var active = document.activeElement;
          var inForm = FIELDS.some(function (sel) {
            return active && active === document.querySelector(sel);
          });
          if (!inForm) document.body.classList.remove('form-active');
        }, 350);
      }
    });
  }
})();

/* ═══════════════════════════════════════════════════
   ANIMATION ENGINE — Scroll-snap slide observer
   Watches which reel is in view and fires animations.
   Does NOT touch booking, WA, analytics, or Sheets.
═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Skip if user prefers reduced motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var rc = document.getElementById('reelContainer');
  if (!rc) return;

  var slides  = Array.prototype.slice.call(rc.querySelectorAll('.reel'));
  var entered = new Set();

  /* Fire entrance for a slide */
  function animateIn(slide) {
    var idx = parseInt(slide.id.replace('slide-', ''), 10) || 0;
    if (entered.has(idx)) return;
    entered.add(idx);

    /* Mark slide for CSS label-line animations */
    slide.classList.add('pp-slide-in');

    /* Trigger .anim → .in (existing system compatibility) */
    var anims = slide.querySelectorAll('.anim, .ascale');
    anims.forEach(function (el) {
      /* Small RAF to ensure paint first */
      requestAnimationFrame(function () {
        el.classList.add('in');
      });
    });

    /* Stagger cards in grids */
    var cards = slide.querySelectorAll(
      '.fleet-card, .why-card, .trust-badge, .wc-card, ' +
      '.usecase-card, .driver-card, .google-card, ' +
      '.testi-card-v2, .service-card, .trust-badge-v2'
    );
    cards.forEach(function (card, i) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(22px)';
      card.style.transition =
        'opacity 0.42s cubic-bezier(0.16,1,0.3,1) ' + (i * 0.07 + 0.05) + 's, ' +
        'transform 0.42s cubic-bezier(0.34,1.56,0.64,1) ' + (i * 0.07 + 0.05) + 's';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          card.style.opacity = '';
          card.style.transform = '';
        });
      });
    });
  }

  /* IntersectionObserver on the reel container viewport */
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          animateIn(entry.target);
          /* Update dot nav active state */
          var idx = entry.target.id.replace('slide-', '');
          document.querySelectorAll('.dot').forEach(function (d) {
            d.classList.toggle('active', d.getAttribute('data-slide') === idx);
          });
        }
      });
    },
    {
      root: rc,
      threshold: 0.35
    }
  );

  slides.forEach(function (slide) { observer.observe(slide); });

  /* Animate first slide immediately */
  if (slides[0]) animateIn(slides[0]);

  /* ─── Micro-interaction: card tilt on mouse move (desktop only) ─── */
  if (!('ontouchstart' in window)) {
    document.querySelectorAll('.fleet-card, .why-card, .driver-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect  = card.getBoundingClientRect();
        var cx    = rect.left + rect.width  / 2;
        var cy    = rect.top  + rect.height / 2;
        var dx    = (e.clientX - cx) / (rect.width  / 2);
        var dy    = (e.clientY - cy) / (rect.height / 2);
        var tiltX = dy * -5;  /* max ±5deg */
        var tiltY = dx *  5;
        card.style.transform =
          'translateY(-8px) scale(1.02) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
        card.style.transformStyle = 'preserve-3d';
      }, { passive: true });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transformStyle = '';
      });
    });
  }

  /* ─── Ripple effect on primary buttons ─── */
  document.querySelectorAll('.btn-primary, .calc-btn, .book-now-btn, .nav-cta').forEach(function (btn) {
    if (btn._ripple) return;   // prevent triple-registration from multiple script blocks
    btn._ripple = true;
    btn.addEventListener('click', function (e) {
      var ripple = document.createElement('span');
      var rect   = btn.getBoundingClientRect();
      var size   = Math.max(rect.width, rect.height) * 1.6;
      var x      = e.clientX - rect.left - size / 2;
      var y      = e.clientY - rect.top  - size / 2;
      Object.assign(ripple.style, {
        position:      'absolute',
        width:         size + 'px',
        height:        size + 'px',
        left:          x + 'px',
        top:           y + 'px',
        borderRadius:  '50%',
        background:    'rgba(255,255,255,0.18)',
        transform:     'scale(0)',
        animation:     'ppRipple 0.55s ease-out forwards',
        pointerEvents: 'none',
        zIndex:        '99'
      });
      /* Inject keyframe if not already done */
      if (!document.getElementById('ppRippleKF')) {
        var s = document.createElement('style');
        s.id  = 'ppRippleKF';
        s.textContent = '@keyframes ppRipple{to{transform:scale(1);opacity:0;}}';
        document.head.appendChild(s);
      }
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    });
  });

})();

/* ── WA Sticky Bar + WA Float: keyboard open/close detection ───────────────
   Uses visualViewport (supported on all modern Android/iOS Chrome).
   Adds body.keyboard-open when keyboard appears → CSS hides sticky bar + WA float.
   Removes it when keyboard dismisses → CSS slides bar back in.
────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  if (!window.visualViewport) {
    // Fallback: ensure sticky bar is always visible if no visualViewport API
    var barFallback = document.getElementById('stickyCta');
    if (barFallback) {
      barFallback.style.animation  = 'none';
      barFallback.style.transform  = 'translateY(0)';
      barFallback.style.opacity    = '1';
    }
    return;
  }

  var body         = document.body;
  var vv           = window.visualViewport;
  var baseHeight   = vv.height;
  var KB_THRESHOLD = 120;   /* px — smaller changes are orientation or reflow */
  var kbOpen       = false;
  var closeTimer   = null;

  function onVVResize() {
    var h        = vv.height;
    var shrinkage = baseHeight - h;

    if (shrinkage > KB_THRESHOLD && !kbOpen) {
      kbOpen = true;
      clearTimeout(closeTimer);
      body.classList.add('keyboard-open');
    } else if (shrinkage <= KB_THRESHOLD && kbOpen) {
      closeTimer = setTimeout(function () {
        kbOpen = false;
        body.classList.remove('keyboard-open');
        baseHeight = vv.height; /* recalibrate after keyboard close */
      }, 280);
    }

    /* Recalibrate on orientation change (h grows, not shrinks) */
    if (h > baseHeight + 60) {
      baseHeight = h;
    }
  }

  vv.addEventListener('resize', onVVResize, { passive: true });

  /* ── Defensive: ensure sticky bar is visible on DOMContentLoaded
     In case ppStickyIn animation stalled and left bar at translateY(100%) ── */
  function ensureBarVisible() {
    var bar = document.getElementById('stickyCta');
    if (bar) {
      bar.style.animation  = 'none';
      bar.style.transform  = 'translateY(0)';
      bar.style.opacity    = '1';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureBarVisible);
  } else {
    ensureBarVisible();
  }

})();

(function(){
  /* Trigger pop animation on fare result when value changes */
  var resultEl = document.getElementById('amount') || document.getElementById('daily-amount');
  var fareBtn  = document.getElementById('fare-btn');
  var dailyBtn = document.getElementById('daily-btn');

  function popResult(id){
    var el = document.getElementById(id);
    if(!el) return;
    el.classList.remove('pop');
    void el.offsetWidth; /* reflow to restart */
    el.classList.add('pop');
    el.addEventListener('animationend', function(){ el.classList.remove('pop'); }, {once:true});
  }

  if(fareBtn)  fareBtn.addEventListener('click',  function(){ setTimeout(function(){popResult('amount');},50); });
  if(dailyBtn) dailyBtn.addEventListener('click', function(){ setTimeout(function(){popResult('daily-amount');},50); });

  /* Ripple on calc buttons (v4 may have missed them) */
  function addRipple(el){
    if(!el || el._ripple) return;
    el._ripple = true;
    el.addEventListener('click', function(e){
      var r   = el.getBoundingClientRect();
      var s   = Math.max(r.width, r.height);
      var sp  = document.createElement('span');
      sp.style.cssText = 'position:absolute;border-radius:50%;pointer-events:none;'
        + 'background:rgba(255,255,255,0.15);transform:scale(0);'
        + 'width:'+s+'px;height:'+s+'px;'
        + 'left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px;'
        + 'animation:ripple-out .5s ease-out forwards;';
      if(getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.style.overflow = 'hidden';
      el.appendChild(sp);
      setTimeout(function(){ sp.remove(); }, 520);
    });
  }
  document.querySelectorAll('.calc-btn,.wcu-cta-btn,.trust-cta-link,.bcr-call-btn,.bcr-wa-btn,.popup-btn-primary').forEach(addRipple);
})();

(function(){
  'use strict';

  /* ── 1. Scroll-reveal via IntersectionObserver ── */
  var revealTargets = [
    '.fc-card','.wcu-card','.usecase-card',
    '.testi-upgrade-card','.driver-card','.google-card',
    '.trust-badge-v2','.trust-trio-card','.section-label',
    '.section-title','.trust-stats','.hero-urgency-row',
    '.booking-trust-badges','.booking-call-row',
    '.wcu-grid','.testi-upgrade-grid'
  ];

  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    },{threshold:0.12,rootMargin:'0px 0px -30px 0px'});

    revealTargets.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        /* Only add reveal if not already inside an .anim (already handled) */
        if(!el.closest('.anim') && !el.classList.contains('anim')){
          el.classList.add('reveal');
          io.observe(el);
        }
      });
    });
  } else {
    /* Fallback: just show everything */
    document.querySelectorAll('.reveal').forEach(function(el){
      el.classList.add('visible');
    });
  }

  /* ── 2. Ripple effect on primary buttons ── */
  function addRipple(el){
    el.addEventListener('click',function(e){
      var rect = el.getBoundingClientRect();
      var r = document.createElement('span');
      var size = Math.max(rect.width,rect.height);
      r.style.cssText = [
        'position:absolute',
        'border-radius:50%',
        'transform:scale(0)',
        'background:rgba(255,255,255,0.18)',
        'pointer-events:none',
        'width:'+size+'px',
        'height:'+size+'px',
        'left:'+(e.clientX-rect.left-size/2)+'px',
        'top:'+(e.clientY-rect.top-size/2)+'px',
        'animation:ripple-out .5s ease-out forwards'
      ].join(';');
      /* ensure parent has relative + overflow:hidden */
      if(getComputedStyle(el).position==='static') el.style.position='relative';
      el.style.overflow='hidden';
      el.appendChild(r);
      setTimeout(function(){r.remove();},520);
    });
  }

  /* Inject ripple keyframe once */
  var rippleStyle = document.createElement('style');
  rippleStyle.textContent = '@keyframes ripple-out{to{transform:scale(2.5);opacity:0;}}';
  document.head.appendChild(rippleStyle);

  /* Apply to key buttons */
  [
    '#bookNowBtn','.btn-primary','.hero-cta-main',
    '.nav-cta','.wcu-cta-btn','#floatBookBtn',
    '.bcr-call-btn','.bcr-wa-btn','.book-now-btn'
  ].forEach(function(sel){
    document.querySelectorAll(sel).forEach(addRipple);
  });

  /* ── 3. Nav active state on scroll/slide ── */
  var lastActiveSlide = -1;
  function setActiveNav(idx){
    if(idx === lastActiveSlide) return;
    lastActiveSlide = idx;
    document.querySelectorAll('.nav-link').forEach(function(l){l.classList.remove('active');});
    var map = {0:'#section-home',2:'#section-fleet',3:'#section-booking',7:'#section-services',10:'#section-contact'};
    if(map[idx]){
      var a = document.querySelector('.nav-link[href="'+map[idx]+'"]');
      if(a) a.classList.add('active');
    }
  }

  /* Hook into existing goToSlide if present */
  if(typeof goToSlide === 'function'){
    var _orig = goToSlide;
    window.goToSlide = function(n){
      _orig(n);
      setActiveNav(n);
    };
  }

  /* Nav scroll shadow is handled by the reelContainer scroll listener above — no duplicate needed */

})();

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     1. BOOKING BUTTON — loading / success / error
     Hooks onto existing flow by watching #ppToast.
     Zero backend changes.
  ───────────────────────────────────────────── */
  function wrapBookBtn(btn) {
    if (!btn || btn._ppBrandWrapped) return;
    btn._ppBrandWrapped = true;
    var originalHTML = btn.innerHTML;

    btn.addEventListener('click', function () {
      if (btn.disabled || btn.classList.contains('pp-btn-loading')) return;

      /* Snapshot text, show loading */
      btn.dataset.origHTML = btn.innerHTML;
      btn.classList.add('pp-btn-loading');
      btn.innerHTML = '<span style="opacity:.82;padding-right:1.4rem;">Confirming your ride\u2026</span>';

      /* Watch #ppToast for outcome */
      var toast = document.getElementById('ppToast');
      if (!toast) {
        /* No toast found — safety reset after 8s */
        setTimeout(reset, 8000);
        return;
      }

      var observer = new MutationObserver(function () {
        if (!toast.classList.contains('show')) return;
        observer.disconnect();
        var isError = toast.classList.contains('error');

        btn.classList.remove('pp-btn-loading');

        if (isError) {
          btn.innerHTML = btn.dataset.origHTML || originalHTML;
          btn.classList.add('pp-btn-error');
          setTimeout(function () { btn.classList.remove('pp-btn-error'); }, 600);
        } else {
          btn.classList.add('pp-btn-success');
          btn.innerHTML =
            '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">' +
            '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>' +
            '</svg>' +
            '<span>Booking Confirmed! Check WhatsApp \u2714</span>';
          setTimeout(reset, 4000);
        }
      });
      observer.observe(toast, { attributes: true, attributeFilter: ['class'] });

      /* Hard safety reset */
      setTimeout(function () { observer.disconnect(); reset(); }, 12000);

      function reset() {
        btn.classList.remove('pp-btn-loading', 'pp-btn-success', 'pp-btn-error');
        btn.innerHTML = btn.dataset.origHTML || originalHTML;
      }
    }, true /* capture — fires before existing handlers */);
  }

  /* Wire up booking button */
  ['bookNowBtn'].forEach(function (id) {
    wrapBookBtn(document.getElementById(id));
  });
  document.querySelectorAll('.book-now-btn').forEach(wrapBookBtn);

  /* ─────────────────────────────────────────────
     2. BRAND PROMISE — live booking ticker
     Shows how many bookings happened "today"
     (deterministic from date so it looks real)
  ───────────────────────────────────────────── */
  var pill = document.querySelector('.pp-brand-promise');
  if (pill) {
    var now       = new Date();
    var seed      = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    var todayRides = 12 + (seed % 9); /* 12-20, stable per day */

    /* Append a live counter badge */
    var badge = document.createElement('span');
    badge.style.cssText =
      'display:inline-flex;align-items:center;gap:.28rem;' +
      'background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.3);' +
      'border-radius:100px;font-family:"Space Mono",monospace;' +
      'font-size:.6rem;letter-spacing:.1em;color:var(--gold);' +
      'padding:.12rem .55rem;flex-shrink:0;';
    badge.innerHTML =
      '<span style="width:6px;height:6px;border-radius:50%;background:#c9a84c;' +
      'animation:pillPulse 2s ease-in-out infinite;"></span>' +
      todayRides + ' booked today';
    pill.appendChild(badge);
  }

  /* ─────────────────────────────────────────────
     3. BOOKING FORM — field completion progress bar
     Shows a subtle gold bar that fills as fields
     are completed, making the CTA feel reachable.
  ───────────────────────────────────────────── */
  var form = document.querySelector('.booking-form');
  var bookBtn = document.getElementById('bookNowBtn');

  if (form && bookBtn) {
    /* Inject progress bar */
    var progressWrap = document.createElement('div');
    progressWrap.id  = 'ppFormProgress';
    progressWrap.style.cssText =
      'height:3px;background:rgba(201,168,76,.1);border-radius:2px;' +
      'margin-bottom:.9rem;overflow:hidden;';
    var progressBar = document.createElement('div');
    progressBar.style.cssText =
      'height:100%;width:0%;background:linear-gradient(90deg,var(--gold),var(--teal));' +
      'border-radius:2px;transition:width .4s cubic-bezier(.22,1,.36,1);';
    progressWrap.appendChild(progressBar);
    form.insertBefore(progressWrap, form.firstChild);

    var watchedFields = [
      'b-pickup', 'b-drop', 'b-datetime',
      'b-vehicle', 'b-triptype', 'b-distance',
      'b-name', 'b-phone'
    ];

    function updateProgress() {
      var filled = watchedFields.filter(function (id) {
        var el = document.getElementById(id);
        return el && el.value && el.value.toString().trim().length > 0;
      }).length;
      var pct = Math.round((filled / watchedFields.length) * 100);
      progressBar.style.width = pct + '%';

      /* Colour shift near completion */
      if (pct === 100) {
        progressBar.style.background = 'linear-gradient(90deg,#25d366,#1adb60)';
      } else {
        progressBar.style.background = 'linear-gradient(90deg,var(--gold),var(--teal))';
      }
    }

    watchedFields.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', updateProgress);
      if (el) el.addEventListener('change', updateProgress);
    });

    updateProgress(); /* initial state */
  }

  /* ─────────────────────────────────────────────
     4. SECTION LABELS — add accent lines dynamically
     for any .section-label that doesn't already
     have the pp-brand-polish styles applied.
  ───────────────────────────────────────────── */
  /* Already handled by CSS — no JS needed */

  /* ─────────────────────────────────────────────
     5. NAV — highlight active slide link
  ───────────────────────────────────────────── */
  var slideToNav = {
    0: 'Home', 2: 'Fleet', 3: 'Pricing',
    7: 'Use Cases', 10: 'Contact'
  };

  var rc2 = document.getElementById('reelContainer');
  if (rc2) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var idx = parseInt(e.target.id.replace('slide-', ''), 10);
        var label = slideToNav[idx];
        document.querySelectorAll('.nav-link').forEach(function (l) {
          l.classList.toggle('active', label && l.textContent.trim() === label);
        });
      });
    }, { root: rc2, threshold: 0.55 });

    rc2.querySelectorAll('.reel[id]').forEach(function (s) { navObs.observe(s); });
  }

  /* ─────────────────────────────────────────────
     6. FLOATING BOOK BUTTON — show after 3s
     Already exists in HTML; just add entrance
     animation class so it slides in cleanly.
  ───────────────────────────────────────────── */
  var fab = document.getElementById('floatBookBtn');
  if (fab) {
    fab.style.opacity   = '0';
    fab.style.transform = 'translateY(12px) scale(0.92)';
    fab.style.transition = 'opacity .5s ease, transform .5s cubic-bezier(.34,1.56,.64,1)';
    setTimeout(function () {
      fab.style.opacity   = '1';
      fab.style.transform = '';
    }, 2800);
  }

})();
