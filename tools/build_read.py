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
    return (f'<a class="gc {p["theme"]}" href="{p["url"]}"><img src="/images/ph/{p["img"]}" alt="" loading="lazy">'
            f'<div><b>{e(p["title"])}</b><span>{e(p["desc"])}</span><em>읽어보기 →</em></div></a>')

def teaser(room, dark):
    ps = [p for p in posts if room in p['rooms']][:3]
    if not ps: return ''
    return (f'<!--READ-START--><link rel="stylesheet" href="/assets/gate.css"/>'
            f'<section class="gate" aria-label="글"><div class="gate-g" style="--n:{len(ps)}">{"".join(card(p) for p in ps)}</div>'
            f'<p class="gate-more"><a href="/read/">글 더 보기 →</a></p></section><!--READ-END-->\n')

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
items = ''.join(card(p) for p in posts)
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
.gate-2{{row-gap:0}}.gate-2 .gc:nth-child(2n+1){{border-left:0}}
@media(max-width:768px){{.gate-2 .gc:nth-child(2n+1){{border-left:0}}}}
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
<main>
  <h1 class="sr">비프리히어 글 모음</h1>
  <link rel="stylesheet" href="/assets/gate.css"/>
  <section class="gate" aria-label="글 모음"><div class="gate-g gate-2" style="--n:2">{items}</div></section>
</main>
{footer}
</body>
</html>
'''
(ROOT/'read/index.html').write_text(hub, encoding='utf-8')
print('posts', len(posts))
