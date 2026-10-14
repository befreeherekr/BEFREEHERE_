/* 휴대폰 전용 배치 (768px 이하에서만 동작 — 컴퓨터 화면은 그대로) */
(function () {
  if (!window.matchMedia('(max-width: 768px)').matches) return;

  var PHONE = '01089526368';
  var page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  var body = document.body;
  if (page === 'living') body.classList.add('m-light');

  // ── 카드 옆으로 넘기기 + 점 표시 ──
  function toSwipe(grid) {
    if (!grid) return;
    grid.classList.add('m-swipe');
    var cards = Array.prototype.slice.call(grid.children);
    var dots = document.createElement('div');
    dots.className = 'm-dots'; dots.setAttribute('aria-hidden', 'true');
    cards.forEach(function (_, i) {
      var d = document.createElement('i'); if (i === 0) d.className = 'on'; dots.appendChild(d);
    });
    grid.parentNode.insertBefore(dots, grid.nextSibling);
    grid.addEventListener('scroll', function () {
      var w = cards[0].getBoundingClientRect().width + 12;
      var idx = Math.round(grid.scrollLeft / w);
      dots.querySelectorAll('i').forEach(function (d, i) { d.classList.toggle('on', i === idx); });
    }, { passive: true });
  }

  // ── 아래 고정 상담 바 ──
  function addBar(openModal) {
    var bar = document.createElement('div');
    bar.className = 'm-bar';
    bar.innerHTML =
      '<a class="m-call" href="tel:' + PHONE + '">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
      '전화 상담</a>' +
      '<button class="m-ask" type="button">상담 신청하기</button>';
    bar.querySelector('.m-ask').addEventListener('click', openModal);
    body.appendChild(bar);
    body.classList.add('m-has-bar');
    var onScroll = function () { bar.classList.toggle('show', window.scrollY > 240); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  var clickNavCta = function () {
    var b = document.querySelector('.nav-cta'); if (b) b.click();
  };

  // ═══ 페이지별 적용 ═══
  if (page === 'funeral') {
    toSwipe(document.querySelector('.who-card-grid'));
    toSwipe(document.querySelector('.diff-grid'));

    addBar(clickNavCta);
  }

  if (page === 'living') {
    toSwipe(document.querySelector('.about-slides'));

    addBar(clickNavCta);
  }
})();
