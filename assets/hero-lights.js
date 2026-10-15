/* 첫 화면 — 떠오르는 빛 (거리감 있는 빛 입자가 등불처럼 천천히 올라감) */
/* 홈: .hero 의 배경에 그림 / 다른 페이지: data-lights 를 단 section 에 그림 (data-lights="free" 면 글씨 자리를 비우지 않음) */
(function () {
  var host = document.querySelector('[data-lights]');
  var hero = host || document.querySelector('.hero');
  if (!hero) return;
  var free = host && host.getAttribute('data-lights') === 'free';
  var cv = document.createElement('canvas');
  cv.className = 'hero-lights';
  cv.style.cssText = 'position:absolute;left:0;top:0;z-index:0;pointer-events:none;';
  // 홈은 어두운 배경 그림 위에, 다른 페이지는 section 의 맨 뒤(글씨 아래)에
  if (host) host.insertBefore(cv, host.firstChild); else hero.querySelector('.hero-bg').appendChild(cv);
  var ctx = cv.getContext('2d');
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = 1; // 흐린 빛이라 고해상도가 필요 없음 — 가볍게
  var W, H, parts = [], mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5, small = false, glow = 1;
  var touch = !matchMedia('(hover:hover) and (pointer:fine)').matches;

  // 부드러운 빛 한 점
  var sprite = document.createElement('canvas'); sprite.width = sprite.height = 64;
  var s = sprite.getContext('2d');
  var g = s.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,236,200,1)');
  g.addColorStop(0.18, 'rgba(236,200,140,.85)');
  g.addColorStop(0.5, 'rgba(200,160,100,.22)');
  g.addColorStop(1, 'rgba(200,160,100,0)');
  s.fillStyle = g; s.fillRect(0, 0, 64, 64);

  function place(p, anywhere) {
    for (var i = 0; i < 6; i++) {
      p.x = Math.random() * W;
      p.y = anywhere ? Math.random() * H : H + 20 + Math.random() * 60;
      // 글씨가 있는 왼쪽 아래는 비워 둠
      if (free || !(p.x < W * 0.55 && p.y > H * 0.42) || Math.random() < 0.15) break;
    }
  }
  function resize() {
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 휴대폰은 화면이 작아 면적대로 세면 빛이 너무 적음 — 한 화면에 보이는 양을 컴퓨터와 비슷하게
    small = W < 768;
    var n = small ? Math.round(Math.min(160, 90 * H / 780)) : Math.round(Math.min(160, W * H / 9000));
    glow = small ? 1.3 : 1;
    // 홈 첫 화면은 아래쪽이 어둡게 가려지고 글씨 자리를 비워 두므로 더 많이, 더 밝게
    if (!host) { n = Math.round(n * 1.6); glow *= 1.7; }
    parts = [];
    for (var i = 0; i < n; i++) {
      var d = Math.pow(Math.random(), 1.8); // 대부분 멀리, 몇 개만 가까이
      var p = { d: d, ph: Math.random() * 6.28, tw: Math.random() * 6.28 };
      place(p, true); parts.push(p);
    }
  }
  resize();
  // 휴대폰은 스크롤할 때 주소창이 접히며 높이만 바뀜 — 그때 빛을 새로 뿌리면 툭 끊겨 보이므로 너비가 바뀔 때만
  var lastW = W;
  addEventListener('resize', function () {
    if (touch && hero.clientWidth === lastW) {
      H = hero.clientHeight; cv.height = H * dpr; cv.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return;
    }
    lastW = hero.clientWidth; resize();
  });

  addEventListener('mousemove', function (e) { tx = e.clientX / innerWidth; ty = e.clientY / innerHeight; }, { passive: true });

  var visible = true;
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(hero);

  var last = performance.now();
  function frame(now) {
    var dt = Math.min((now - last) / 16.7, 3); last = now;
    // 마우스가 없는 휴대폰은 빛이 스스로 천천히 흔들리며 거리감을 냄
    if (touch && !calm) { tx = 0.5 + 0.35 * Math.sin(now / 5200); ty = 0.5 + 0.25 * Math.sin(now / 7300); }
    mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    var t = now / 1000;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], d = p.d;
      if (!calm) {
        p.y -= (0.12 + 0.55 * d) * dt;
        p.x += Math.sin(t * 0.35 + p.ph) * 0.12 * d * dt;
        if (p.y < -40) place(p, false);
      }
      var px = p.x + (mx - 0.5) * -60 * d;
      var py = p.y + (my - 0.5) * -30 * d;
      var size = (host ? 2 : 2.4) + (host ? 26 : 32) * d * d;                      // 가까울수록 크게 (흐린 빛망울)
      var a = d > 0.6 ? 0.22 - (d - 0.6) * 0.25 : 0.18 + d * 0.7;
      a *= 0.75 + 0.25 * Math.sin(t * 1.3 + p.tw);    // 숨 쉬듯 깜빡임
      // 위로 올라갈수록 서서히 사라짐
      a *= Math.min(1, p.y / (H * (host ? 0.35 : 0.18))) * glow;
      if (a <= 0) continue;
      ctx.globalAlpha = a;
      ctx.drawImage(sprite, px - size, py - size, size * 2, size * 2);
    }
    ctx.globalAlpha = 1;
    if (!calm && visible) requestAnimationFrame(frame);
    else if (!calm) setTimeout(function () { requestAnimationFrame(frame); }, 300);
  }
  requestAnimationFrame(frame);
})();
