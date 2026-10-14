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
