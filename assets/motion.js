/* 커서 동그라미 + 부드러운 스크롤
 * - 마우스가 있는 기기에서만 동작 (휴대폰은 기본 스크롤 그대로)
 * - 커서는 B 한 글자를 감싸는 정확한 동그라미
 * - '움직임 줄이기' 설정이면 부드러운 스크롤은 끔 */
(function () {
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (!fine) return;
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 부드러운 스크롤 ──
  var lenis = null;
  if (!calm && window.Lenis) {
    document.querySelectorAll('[class*="overlay"],[class*="Overlay"],[id*="verlay"],[class*="modal"],[id*="Modal"],[id*="modal"]')
      .forEach(function (el) { el.setAttribute('data-lenis-prevent', ''); });
    lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
    (function loop(t) { lenis.raf(t); requestAnimationFrame(loop); })(performance.now());

    // 팝업이 열려 페이지가 잠기면 멈춤
    new MutationObserver(function () {
      if (document.body.style.overflow === 'hidden') lenis.stop(); else lenis.start();
    }).observe(document.body, { attributes: true, attributeFilter: ['style'] });

    // 페이지 안 이동 링크도 같은 부드러움으로
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"],[data-scroll]');
      if (!a) return;
      var id = a.dataset.scroll || a.getAttribute('href').slice(1);
      var t = id && document.getElementById(id);
      if (!t) return;
      e.preventDefault(); e.stopPropagation();
      lenis.scrollTo(t, { offset: -70, duration: 1.4 });
    }, true);
  }

  // ── 커서: B 한 글자 + 정확한 동그라미 ──
  var dot = document.getElementById('cur');
  var ring = document.getElementById('curRing');
  if (!dot || !ring) return;

  var gold = getComputedStyle(dot).backgroundColor;
  ring.style.color = gold;
  dot.style.color = gold;
  dot.classList.add('cur-b');
  dot.textContent = 'B';
  ring.innerHTML = '<svg viewBox="0 0 44 44" aria-hidden="true"><circle class="ring-base" cx="22" cy="22" r="21"/></svg>';

  var mx = -100, my = -100, rx = mx, ry = my, scale = 1, hover = false, shown = false;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!shown) { rx = mx; ry = my; dot.classList.add('on'); ring.classList.add('on'); shown = true; }
    var h = e.target.closest && e.target.closest('a,button,[data-modal],[data-scroll],label,summary');
    if (!!h !== hover) { hover = !!h; ring.classList.toggle('is-hover', hover); dot.classList.toggle('is-hover', hover); }
  }, { passive: true });
  document.addEventListener('mouseleave', function () {
    dot.classList.remove('on'); ring.classList.remove('on'); shown = false;
  });

  (function tick() {
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    scale += ((hover ? 1.45 : 1) - scale) * 0.16;
    dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
    ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0) translate(-50%,-50%) scale(' + scale.toFixed(3) + ')';
    requestAnimationFrame(tick);
  })();
})();
