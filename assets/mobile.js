/* 휴대폰 전용 (768px 이하에서만 동작 — 컴퓨터 화면은 그대로)
   생전추모식 '어떤 자리든' 세 가지(잔잔한 작별 · 파티형 추모식 · 둘만의 작별)를 옆으로 넘기는 카드로 */
(function () {
  if (!window.matchMedia('(max-width: 768px)').matches) return;

  var wrap = document.querySelector('.cac-wrap');
  if (!wrap) return;
  var items = Array.prototype.slice.call(wrap.querySelectorAll('.cac-item'));
  if (!items.length) return;
  wrap.classList.add('m-cac');

  // 설명 문장: 한 문장씩 새 줄에서 시작하되, 줄이 넘치면 고르게 나눠지도록
  wrap.querySelectorAll('.cac-desc').forEach(function (p) {
    p.innerHTML = p.innerHTML.split(/<br\s*\/?>/i)
      .map(function (line) { return '<span class="m-line">' + line.trim() + '</span>'; }).join('');
  });

  // 아래 점: 지금 몇 번째 카드인지
  var dots = document.createElement('div');
  dots.className = 'm-dots'; dots.setAttribute('aria-hidden', 'true');
  items.forEach(function (_, i) {
    var d = document.createElement('i'); if (i === 0) d.className = 'on'; dots.appendChild(d);
  });
  wrap.parentNode.insertBefore(dots, wrap.nextSibling);

  wrap.addEventListener('scroll', function () {
    var w = items[0].getBoundingClientRect().width + 12;
    var idx = Math.min(items.length - 1, Math.round(wrap.scrollLeft / w));
    dots.querySelectorAll('i').forEach(function (d, i) { d.classList.toggle('on', i === idx); });
  }, { passive: true });
})();

/* 휴대폰 메뉴 — 오른쪽 위 가는 선 두 줄을 누르면 전체 화면 목록 */
(function () {
  if (!window.matchMedia('(max-width: 768px)').matches) return;
  var nav = document.getElementById('nav');
  if (!nav) return;

  // 페이지 바탕이 밝은지(생전추모식) 어두운지에 맞춰 색 결정
  var bg = getComputedStyle(document.body).backgroundColor.match(/\d+/g) || [14, 13, 11];
  var light = (0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]) > 128;
  var root = document.documentElement.style;
  if (light) {
    root.setProperty('--m-bg', '#ECEBE6'); root.setProperty('--m-ink', '#1B1A17');
    root.setProperty('--m-sub', 'rgba(27,26,23,.55)'); root.setProperty('--m-gold', '#7D5F2A');
    root.setProperty('--m-line', 'rgba(125,95,42,.22)');
  } else {
    root.setProperty('--m-bg', '#0e0d0b'); root.setProperty('--m-ink', '#e8e2d9');
    root.setProperty('--m-sub', 'rgba(232,226,217,.5)'); root.setProperty('--m-gold', '#c8a96e');
    root.setProperty('--m-line', 'rgba(200,169,110,.2)');
  }

  var arrow = '<svg width="14" height="12" viewBox="0 0 12 10" fill="none" aria-hidden="true"><line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" stroke-width=".8"/><polyline points="6,1 10,5 6,9" fill="none" stroke="currentColor" stroke-width=".8"/></svg>';
  var items = [
    ['index.html', '홈', ''],
    ['funeral.html', '장례식', '무빈소 장례 · 맞춤 추모식'],
    ['living.html', '생전추모식', '살아있는 동안 건네는 인사'],
    ['funeral-guide.html', '장례 절차 안내', ''],
    ['obituary-message.html', '부고 문자 예시', ''],
    ['living-stories.html', '생전추모식 이야기', ''],
    ['faq.html', '자주 묻는 질문', '']
  ];
  var here = location.pathname.split('/').pop() || 'index.html';

  var menu = document.createElement('div');
  menu.className = 'm-menu'; menu.id = 'mMenu';
  menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-label', '메뉴');
  menu.innerHTML = '<ul>' + items.map(function (it) {
    return '<li><a href="' + it[0] + '"' + (it[0] === here ? ' aria-current="page"' : '') + '><span>' + it[1] +
      (it[2] ? '<small>' + it[2] + '</small>' : '') + '</span>' + arrow + '</a></li>';
  }).join('') + '</ul>' +
    '<a class="m-menu-call" href="tel:01089526368" aria-label="전화 상담 010-8952-6368"><span>' +
    '<div class="lbl">24시간 전화 상담</div><div class="num">010<i>·</i>8952<i>·</i>6368</div></span>' +
    '<span class="go" aria-hidden="true"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.59 3.41 2 2 0 0 1 3.56 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.75 16.92z"/></svg></span></a>' +
    '<a class="m-menu-mail" href="mailto:befreehere.kr@gmail.com">befreehere.kr@gmail.com</a>';
  document.body.appendChild(menu);

  var btn = document.createElement('button');
  btn.className = 'm-menu-btn'; btn.type = 'button';
  btn.setAttribute('aria-label', '메뉴 열기'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'mMenu');
  btn.innerHTML = '<i></i><i></i>';
  nav.appendChild(btn);

  function set(open) {
    document.documentElement.classList.toggle('m-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  btn.addEventListener('click', function () { set(!document.documentElement.classList.contains('m-open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  // 상담 문의 버튼을 누르면 메뉴는 닫힘
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-modal]') && document.documentElement.classList.contains('m-open')) set(false);
  }, true);
})();
