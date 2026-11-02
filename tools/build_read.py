#!/usr/bin/env python3
"""글 모음(/read/)과 각 방(생전추모식·유골 커스텀·장례식) 아래 '읽어보세요' 구역을 read/posts.json 에서 다시 만든다.
새 글을 올릴 때: read/posts.json 맨 위에 한 줄 추가 → python3 tools/build_read.py
(rooms 에는 어느 방에 보여줄지: living / keepsake / funeral)"""
import json, re, html, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
posts = sorted(json.load(open(ROOT/'read/posts.json', encoding='utf-8')), key=lambda p: p['date'], reverse=True)
e = html.escape
ROOMS = {'living':('생전추모식','/living/'),'keepsake':('유골 커스텀','/keepsake/'),'funeral':('장례식','/funeral/')}

def card(p, dark=False):
    return (f'<a class="rd-c" href="{p["url"]}">'
            f'<b>{e(p["title"])}</b><span class="rd-d">{e(p["desc"])}</span><i aria-hidden="true">→</i></a>')

CSS = '''<style>
.rd{padding:6.5rem 4rem 0;font-family:'Gowun Batang','Noto Serif KR',serif;color:#1B1A17;background:#ECEBE6}
.rd-q{max-width:1000px;margin:0 auto 2rem;font-size:13px;letter-spacing:.14em;color:#7D5F2A}
.rd-g{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:1.4rem}
.rd-c{display:flex;flex-direction:column;gap:.6rem;padding:1.5rem 1.4rem 1.7rem;border-top:.5px solid rgba(125,95,42,.45);background:rgba(255,255,255,.28);position:relative;transition:background .25s,transform .25s}
.rd-c:hover{background:rgba(255,255,255,.55);transform:translateY(-2px)}
.rd-t{font-size:11.5px;letter-spacing:.12em;color:#B5613A}
.rd-c b{font-weight:400;font-size:clamp(17px,1.6vw,20px);line-height:1.5;letter-spacing:-.01em;padding-right:1.4rem;word-break:keep-all}
.rd-d{font-size:13px;line-height:1.85;color:rgba(27,26,23,.62);word-break:keep-all}
.rd-c i{font-style:normal;position:absolute;right:1.2rem;top:1.5rem;color:#7D5F2A}
.rd-more{max-width:1000px;margin:1.6rem auto 0;text-align:right;font-size:13px}
.rd-more a{color:#7D5F2A;border-bottom:.5px solid rgba(125,95,42,.5);padding-bottom:3px}
.rd-dark{background:#0e0d0b;color:#F3EFE6}
.rd-dark .rd-q{color:#c8a96e}.rd-dark .rd-c{border-top-color:rgba(201,185,154,.35);background:rgba(255,255,255,.04)}
.rd-dark .rd-c:hover{background:rgba(255,255,255,.09)}.rd-dark .rd-t{color:#c8a96e}.rd-dark .rd-d{color:rgba(243,239,230,.62)}
.rd-dark .rd-c i,.rd-dark .rd-more a{color:#c8a96e;border-color:rgba(200,169,110,.5)}
@media(max-width:768px){.rd{padding:4.2rem 1.4rem 0}.rd-g{grid-template-columns:1fr;gap:.9rem}}
</style>'''

def teaser(room, dark):
    ps = [p for p in posts if room in p['rooms']][:3]
    if not ps: return ''
    cls = 'rd rd-dark' if dark else 'rd'
    return (f'<!--READ-START--><section class="{cls}" aria-label="글">'
            f'<div class="rd-g">{"".join(card(p) for p in ps)}</div>'
            f'<p class="rd-more"><a href="/read/">글 더 보기 →</a></p></section>{CSS}<!--READ-END-->\n')

for room,(name,url) in ROOMS.items():
    path = ROOT/(url.strip('/')+'/index.html')
    s = path.read_text(encoding='utf-8')
    s = re.sub(r'<!--READ-START-->.*?<!--READ-END-->\n?', '', s, flags=re.S)
    t = teaser(room, room=='funeral')
    if t:
        s = s.replace('<!-- 다른 이야기 -->', t + '<!-- 다른 이야기 -->', 1)
    path.write_text(s, encoding='utf-8')

# 모음 페이지
faq = (ROOT/'faq.html').read_text(encoding='utf-8')
footer = re.search(r'<!-- 다른 이야기 -->.*?</footer>', faq, flags=re.S).group(0)

ROOMCARDS=[('/living/','생전추모식','살아있는 지금 건네는 인사','slideshow.jpg','t-cream'),('/keepsake/','유골 커스텀','그날 이후, 나를 남기는 방식','lp-shelf.jpg','t-sand'),('/funeral/','장례식','그 사람다운 마지막 배웅','toast-garden.jpg','t-brown'),('/','처음으로','비프리히어 첫 화면','night-poster.jpg','t-ink')]
BAND=('<link rel="stylesheet" href="/assets/gate.css"/>\n<section class="gate" aria-label="다른 이야기 보기"><div class="gate-g" style="--n:4">'
 +''.join(f'<a class="gc {t}" href="{u}">{'' if u=='/' else f'<img src="/images/ph/{i}" alt="" loading="lazy">'}<div><b>{n}</b><span>{d}</span><em>들어가기 →</em></div></a>' for u,n,d,i,t in ROOMCARDS)+'</div></section>\n')
footer = re.sub(r'<section class="rooms".*?</section>', lambda m: BAND, footer, count=1, flags=re.S)
items = ''.join(
    f'<a class="post" href="{p["url"]}"><h2>{e(p["title"])}</h2><p>{e(p["desc"])}</p></a>' for p in posts)
hub = f'''<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<link rel="icon" href="/favicon.png" type="image/png" sizes="32x32"/>
<link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
<title>글 모음 · 장례, 추모, 생전추모식 이야기 | 비프리히어</title>
<meta name="description" content="무빈소 장례 절차, 부고 문자, 생전추모식 이야기까지. 비프리히어가 일주일에 한두 편씩 쓴 글을 모았습니다."/>
<meta name="robots" content="index, follow"/>
<link rel="canonical" href="https://befreeherekr.com/read/"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="https://befreeherekr.com/read/"/>
<meta property="og:title" content="비프리히어 글 모음"/>
<meta property="og:description" content="장례와 추모, 생전추모식 이야기를 일주일에 한두 편씩 올립니다."/>
<meta property="og:image" content="https://befreeherekr.com/og-image.JPG"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300&family=Noto+Sans+KR:wght@300;400&family=Noto+Serif+KR:wght@300;400&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/assets/page.css"/>
<style>
.sr{{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}}
.posts{{margin-top:0;border-top:.5px solid rgba(201,185,154,.14)}}
.post{{display:block;padding:2.2rem 0;border-bottom:.5px solid rgba(201,185,154,.14);transition:padding .3s}}
.post:hover{{padding-left:.8rem}}
.post h2{{margin:0 0 .6rem;font-size:clamp(20px,2.6vw,26px)}}
.post p{{margin-bottom:0!important}}
.post:hover h2{{color:#fff}}
</style>
</head>
<body>
<nav class="nav">
  <a href="/" class="logo" aria-label="비프리히어 홈"><span class="logo-kr">비프리히어</span><span class="logo-en">Befreehere</span></a>
  <a class="nav-home" href="/">처음으로</a>
</nav>
<main class="page" style="padding-top:2rem">
  <h1 class="sr">비프리히어 글 모음</h1>
  <div class="posts">{items}</div>
</main>
{footer}
</body>
</html>
'''
(ROOT/'read/index.html').write_text(hub, encoding='utf-8')
print('posts', len(posts))
