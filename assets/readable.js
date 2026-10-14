/* 읽기 쉬운 줄바꿈 — 브라우저가 text-wrap: pretty를 모를 때만 동작
   · 문단 끝 단어가 혼자 다음 줄로 떨어지지 않게 마지막 두 단어를 붙임
   · '할 수 있다'처럼 떨어지면 어색한 말은 한 덩어리로 묶음 */
(function () {
  if (window.CSS && CSS.supports && CSS.supports('text-wrap', 'pretty')) return;
  var NB = ' ';
  var sel = '.page p, .page li, .lead, .note, blockquote';
  document.querySelectorAll(sel).forEach(function (el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (t) {
      t.nodeValue = t.nodeValue.replace(/ (수|것|때|줄|등) (?=\S)/g, NB + '$1' + NB);
    });
    // 문단 마지막 두 단어 붙이기 (마지막 단어가 짧을 때만)
    for (var i = nodes.length - 1; i >= 0; i--) {
      var v = nodes[i].nodeValue, trimmed = v.replace(/\s+$/, '');
      if (!trimmed) continue;
      var m = trimmed.match(/^([\s\S]*\S) (\S{1,6})$/);
      if (m) nodes[i].nodeValue = m[1] + NB + m[2] + v.slice(trimmed.length);
      else if (!/\s/.test(trimmed) && trimmed.length <= 6 && i > 0) {
        // 마지막 단어가 굵은 글씨 등으로 따로 있을 때: 앞 글자와의 띄어쓰기를 붙임
        nodes[i - 1].nodeValue = nodes[i - 1].nodeValue.replace(/ $/, NB);
      }
      break;
    }
  });
})();
