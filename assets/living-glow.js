/* 생전추모식 첫 화면 — 빛꽃
 * 오른쪽 위 몇 군데에서 빛이 꽃봉오리처럼 맺혔다가 꽃잎을 벌리며 피어나고, 빛가루로 흩어짐.
 * 꽃마다 피는 때가 달라 하나가 질 무렵 다른 하나가 피어남. 움직임은 모두 CSS */
(function () {
  var hero = document.querySelector('.living-hero');
  if (!hero) return;
  var small = innerWidth < 768;
  // [가로 %, 세로 %, 크기(vw), 꽃잎 수, 한 번 피는 데 걸리는 시간(초), 시작 지연(초), 기울기(도)]
  var flowers = small ? [
    [74, 14, 62, 6, 11, 0, 8], [52, 3, 30, 5, 11, 5.5, -14], [96, 44, 40, 5, 11, 8, 22]
  ] : [
    [72, 28, 26, 6, 12, 0, 6], [90, 62, 17, 5, 12, 4, -18], [57, 10, 14, 5, 12, 8, 24], [95, 14, 11, 5, 12, 10, 40]
  ];
  var wrap = document.createElement('div');
  wrap.className = 'living-glow';
  wrap.setAttribute('aria-hidden', 'true');
  flowers.forEach(function (f) {
    var b = document.createElement('div');
    b.className = 'lb';
    b.style.cssText = 'left:' + f[0] + '%;top:' + f[1] + '%;width:' + f[2] + 'vw;height:' + f[2] + 'vw;' +
      '--dur:' + f[4] + 's;--delay:-' + (f[4] - f[5]) + 's;--tilt:' + f[6] + 'deg';
    var html = '<i class="lb-halo"></i>';
    // 바깥 겹(크고 옅게, 조금 늦게) + 안쪽 겹(엇갈려서)
    for (var i = 0; i < f[3]; i++) {
      html += '<span class="lb-arm" style="transform:rotate(' + (360 / f[3] * (i + .5)) + 'deg)"><i class="lb-petal lb-outer"></i></span>';
    }
    for (var j = 0; j < f[3]; j++) {
      html += '<span class="lb-arm" style="transform:rotate(' + (360 / f[3] * j) + 'deg)"><i class="lb-petal"></i></span>';
    }
    html += '<i class="lb-core"></i>';
    // 다 핀 뒤 흩어지는 빛가루
    for (var k = 0; k < 7; k++) {
      var an = Math.random() * 360, d = 32 + Math.random() * 22;
      html += '<span class="lb-arm" style="transform:rotate(' + an.toFixed(0) + 'deg)"><i class="lb-dust" style="--d:' + d.toFixed(0) + '"></i></span>';
    }
    b.innerHTML = html;
    wrap.appendChild(b);
  });
  hero.insertBefore(wrap, hero.firstChild);
})();
