/* 스크롤에 따라 사진이 입체로 기울고, 히어로 사진이 천천히 밀려남 (움직임 줄이기 설정이면 꺼짐) */
(function(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var tilts=[].slice.call(document.querySelectorAll('[data-tilt]'));
  var hero=document.querySelector('.hero-photo img');
  var ticking=false, vh=innerHeight;
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function frame(){
    ticking=false; vh=innerHeight;
    var y=scrollY;
    if(hero && y<vh*1.3){ hero.style.transform='translate3d(0,'+(y*0.18).toFixed(1)+'px,0) scale('+(1+y/vh*0.06).toFixed(4)+')'; }
    for(var i=0;i<tilts.length;i++){
      var el=tilts[i], r=el.getBoundingClientRect();
      if(r.bottom<-80||r.top>vh+80) continue;
      var c=(r.top+r.height/2-vh/2)/(vh/2+r.height/2);   // -1(위) ~ 1(아래)
      c=clamp(c,-1,1);
      var even=(el.closest('.aslide:nth-child(even)')||el.classList.contains('kp-b'))?-1:1;
      el.style.transform='perspective(1100px) rotateY('+(c*9*even).toFixed(2)+'deg) rotateX('+(c*-4).toFixed(2)+'deg) translate3d(0,'+(c*22).toFixed(1)+'px,0)';
      var im=el.firstElementChild; if(im) im.style.transform='scale('+(1.08+Math.abs(c)*0.04).toFixed(4)+') translate3d(0,'+(c*-14).toFixed(1)+'px,0)';
    }
  }
  function req(){ if(!ticking){ticking=true; requestAnimationFrame(frame);} }
  addEventListener('scroll',req,{passive:true}); addEventListener('resize',req); frame();
})();
