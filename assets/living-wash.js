/* 생전추모식 첫 화면 — 수채 번짐
 * 한지 위에 옅은 물감이 떨어져 천천히 번지고, 가장자리에 물감이 고였다가 스러짐.
 * 오른쪽 위에서만 피어나 글씨는 가리지 않음 */
(function () {
  var hero = document.querySelector('.living-hero');
  if (!hero) return;
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = !matchMedia('(hover:hover) and (pointer:fine)').matches;

  var wrap = document.createElement('div');
  wrap.className = 'living-wash';
  wrap.setAttribute('aria-hidden', 'true');
  var cv = document.createElement('canvas');
  wrap.appendChild(cv);
  hero.insertBefore(wrap, hero.firstChild);
  var ctx = cv.getContext('2d');

  // 물감 — 제목의 주황빛에서 살구·장밋빛·놋쇠빛까지
  var PAINT = [[204, 112, 70], [222, 160, 104], [206, 134, 118], [190, 150, 90], [214, 128, 84]];
  var S = 2, W, H, w, h, lastW = 0, blobs = [], small = false;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function blob(born) {
    var k = [];
    for (var i = 0; i < 5; i++) k.push({ f: i + 2, ph: rnd(0, 6.28), amp: rnd(.05, .17) / (1 + i * .35), sp: rnd(-.05, .05) });
    return {
      x: small ? rnd(.4, 1.02) : rnd(.5, .98), y: small ? rnd(-.05, .4) : rnd(.02, .6),
      r: small ? rnd(.2, .32) : rnd(.1, .19), c: PAINT[Math.random() * PAINT.length | 0],
      a: rnd(.08, .13), life: rnd(18, 28), born: born, k: k,
      dx: rnd(-.004, .004), dy: rnd(.002, .008) // 종이 결을 따라 아주 조금 흘러내림
    };
  }
  function resize() {
    W = hero.clientWidth; H = hero.clientHeight; lastW = W; small = W < 768;
    w = Math.ceil(W / S); h = Math.ceil(H / S);
    cv.width = w; cv.height = h; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  }
  resize();
  addEventListener('resize', function () {
    if (touch && hero.clientWidth === lastW) { // 휴대폰 주소창이 접힐 때는 높이만 맞춤
      H = hero.clientHeight; h = Math.ceil(H / S); cv.height = h; cv.style.height = H + 'px'; return;
    }
    resize();
  });

  var t0 = performance.now() / 1000;
  var N = 4;
  for (var i = 0; i < N; i++) { var b = blob(t0); b.born = t0 - b.life * (i / N) - rnd(0, 3); blobs.push(b); }

  // 번진 자국 하나: 들쭉날쭉한 테두리 안을 채우고, 가장자리에 물감이 고이게
  function shape(cx, cy, R, b, t, grow) {
    ctx.beginPath();
    for (var j = 0; j <= 64; j++) {
      var an = j / 64 * Math.PI * 2, m = 1;
      for (var q = 0; q < b.k.length; q++) { var K = b.k[q]; m += K.amp * Math.sin(an * K.f + K.ph + t * K.sp * grow); }
      var x = cx + Math.cos(an) * R * m, y = cy + Math.sin(an) * R * m * .88;
      j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  }
  function paint(b, now) {
    var age = now - b.born, p = age / b.life;
    if (p >= 1) return false;
    if (p < 0) return true;
    // 빠르게 번지다가 천천히 멈춤
    var grow = 1 - Math.pow(1 - Math.min(1, p * 1.6), 3);
    var env = Math.min(1, p / .12) * Math.min(1, (1 - p) / .35);
    var R = b.r * Math.max(w, h) * (.45 + .55 * grow);
    var cx = (b.x + b.dx * age) * w, cy = (b.y + b.dy * age) * h;
    var c = b.c.join(','), A = b.a * env;

    // 1) 넓게 스민 바탕
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.12);
    g.addColorStop(0, 'rgba(' + c + ',' + (A * .42).toFixed(3) + ')');
    g.addColorStop(.62, 'rgba(' + c + ',' + (A * .55).toFixed(3) + ')');
    g.addColorStop(.86, 'rgba(' + c + ',' + (A * .95).toFixed(3) + ')'); // 가장자리에 고인 물감
    g.addColorStop(.97, 'rgba(' + c + ',' + (A * .5).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(' + c + ',0)');
    ctx.fillStyle = g; shape(cx, cy, R, b, age, grow); ctx.fill();

    // 2) 안쪽에 한 번 더 번진 결 (조금 어긋나게)
    var ix = cx + R * .14 * Math.cos(b.k[0].ph), iy = cy + R * .1 * Math.sin(b.k[1].ph), IR = R * .58;
    var g2 = ctx.createRadialGradient(ix, iy, 0, ix, iy, IR * 1.1);
    g2.addColorStop(0, 'rgba(' + c + ',' + (A * .25).toFixed(3) + ')');
    g2.addColorStop(.85, 'rgba(' + c + ',' + (A * .3).toFixed(3) + ')');
    g2.addColorStop(1, 'rgba(' + c + ',0)');
    ctx.fillStyle = g2; shape(ix, iy, IR, b, age * 1.3 + 7, grow); ctx.fill();

    // 3) 물이 마르며 남은 가는 테두리
    ctx.strokeStyle = 'rgba(' + c + ',' + (A * .55).toFixed(3) + ')';
    ctx.lineWidth = 1.1;
    shape(cx, cy, R * 1.02, b, age, grow); ctx.stroke();
    return true;
  }

  var visible = true;
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(hero);

  function frame(ms) {
    var now = ms / 1000;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'multiply';
    for (var i = 0; i < blobs.length; i++) {
      if (!paint(blobs[i], now)) blobs[i] = blob(now + rnd(0, 2));
    }
    ctx.globalCompositeOperation = 'source-over';
    if (calm) return;
    if (visible) requestAnimationFrame(frame);
    else setTimeout(function () { requestAnimationFrame(frame); }, 400);
  }
  requestAnimationFrame(frame);
})();
