# Builds one 1200x630 HTML card per page; screenshots are taken with headless Chrome.
CARDS = {
 "home": dict(eyebrow="EVIDENCE, NOT HYPE", title="健康資訊很多，<br>先看<span class='hl'>證據</span>再決定。", sub="保健食品・GLP-1・運動・飲食<br>每個說法都標示證據等級", side="grades"),
 "guides": dict(eyebrow="GUIDES", title="實證指南", sub="保健食品、GLP-1 與體重管理、運動、飲食<br>附原始研究與證據等級", side="grades"),
 "tools": dict(eyebrow="FREE TOOLS", title="實用工具", sub="體重管理小幫手・蛋白質與熱量計算機<br>保健食品實證速查・看診準備單", side="stat", stat="免費", cap="不需登入<br>資料只存在你的裝置"),
 "guide-glp1": dict(eyebrow="GUIDE · GLP-1 · PART 1", title="GLP-1 減重藥物（一）<br>誰適合、效果有多大", sub="作用原理・適用對象・心血管證據<br>含台灣參與的 STEP 12 研究", side="stat", stat="−15~21%", cap="大型試驗的平均體重變化"),
 "guide-glp1-safety": dict(eyebrow="GUIDE · GLP-1 · PART 2", title="GLP-1 減重藥物（二）<br>劑量、副作用、停藥", sub="研究怎麼調劑量、副作用怎麼處理<br>停藥或減量後會怎樣", side="stat", stat="+6.9%", cap="STEP 4：停藥後 48 週體重回升"),
 "guide-glp1-lifestyle": dict(eyebrow="GUIDE · GLP-1 · PART 3", title="GLP-1 治療期間<br>怎麼吃、怎麼動", sub="附蛋白質與熱量計算機", side="stat", stat="<span style='font-size:56px;white-space:nowrap'>1.0–1.2 g</span>", cap="減重期間每公斤每日蛋白質"),
 "guide-fish-oil": dict(eyebrow="GUIDE · SUPPLEMENTS", title="魚油有沒有用？<br>一般人和心血管病人", sub="結果差很多：<br>市售魚油 vs 處方級高純度 EPA", side="pair", pair=[("D","一般人吃魚油","d"),("A","心血管病人<br>處方純 EPA","a")]),
 "guide-red-yeast-rice": dict(eyebrow="GUIDE · SUPPLEMENTS", title="紅麴能降膽固醇<br>為何不建議取代藥物？", sub="台灣與國際指引怎麼說", side="stat", stat="<span style='font-size:54px;white-space:nowrap'>= Lovastatin</span>", cap="紅麴的 Monacolin K<br>和降血脂藥是同一個分子"),
 "guide-exercise": dict(eyebrow="GUIDE · EXERCISE", title="運動：每週 150 分鐘<br>怎麼做到？", sub="肌力訓練・久坐的解方・8 週入門計畫", side="stat", stat="150 分", cap="每週中等強度活動"),
 "guide-nutrition": dict(eyebrow="GUIDE · NUTRITION", title="飲食：不靠極端飲食<br>也能吃得健康", sub="我的餐盤・減鈉・纖維・外食技巧", side="stat", stat="<span style='font-size:58px;white-space:nowrap'>2,400 mg</span>", cap="台灣建議每日鈉上限"),
 "lookup": dict(eyebrow="TOOL · EVIDENCE LOOKUP", title="保健食品實證速查", sub="魚油・紅麴・維生素 D・葉黃素<br>每項宣稱功效分別標示證據等級", side="grades"),
 "weight": dict(eyebrow="TOOL · WEIGHT", title="體重管理小幫手", sub="BMI 與腰圍・體重曲線<br>和大型研究平均值對照", side="chart"),
 "visit-prep": dict(eyebrow="TOOL · CLINIC VISIT", title="看診準備單", sub="想問的問題・藥物與保健食品清單<br>列印或存成 PDF 帶去看診", side="check"),
 "reset": dict(eyebrow="21-DAY RESET", title="21 天心臟代謝重整", sub="每天一個 2–10 分鐘的小行動<br>不需註冊", side="days"),
}
MARK = '<svg viewBox="0 0 64 64" width="56" height="56"><rect width="64" height="64" rx="18" fill="#12302f"/><path d="M17 34c7-16 22-20 30-14-3 15-13 24-29 22l-5 5" fill="none" stroke="#c9f06b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="43" cy="19" r="4" fill="#ee6c4f"/></svg>'
def side(c):
    k=c["side"]
    if k=="grades":
        g=[("A","#0d7550","#e1f2e8"),("B","#2c649d","#e3ecf6"),("C","#9a620c","#faefd8"),("D","#ae3831","#f8e3df")]
        return '<div class="grades">'+"".join(f'<span style="color:{a};background:{b}">{l}</span>' for l,a,b in g)+'</div><p class="cap">證據等級 A・B・C・D</p>'
    if k=="stat":
        return f'<div class="stat">{c["stat"]}</div><p class="cap">{c["cap"]}</p>'
    if k=="pair":
        col={"a":("#0d7550","#e1f2e8"),"d":("#ae3831","#f8e3df")}
        return '<div class="pair">'+"".join(f'<div><span style="color:{col[t][0]};background:{col[t][1]}">{g}</span><p>{lab}</p></div>' for g,lab,t in c["pair"])+'</div>'
    if k=="chart":
        return '<svg class="mini" viewBox="0 0 300 180"><line x1="10" y1="30" x2="290" y2="30" stroke="#25413f"/><line x1="10" y1="90" x2="290" y2="90" stroke="#25413f"/><line x1="10" y1="150" x2="290" y2="150" stroke="#25413f"/><polyline points="10,30 60,60 110,88 160,110 210,124 260,132 290,134" fill="none" stroke="#c9f06b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><polyline points="10,30 50,52 90,70 130,84" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/><circle cx="130" cy="84" r="8" fill="#fff"/></svg><p class="cap">你的紀錄 vs 研究平均曲線</p>'
    if k=="check":
        items=["我的藥物會互相影響嗎？","我的 LDL 目標是多少？","我適合 GLP-1 藥物嗎？"]
        return '<ul class="checks">'+"".join(f'<li><i></i>{t}</li>' for t in items)+'</ul>'
    if k=="days":
        cells="".join(f'<span class="{"on" if i<5 else ("now" if i==5 else "")}">{i+1:02d}</span>' for i in range(21))
        return f'<div class="days">{cells}</div>'
CSS = """
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#0d2626;color:#eef3ef;font-family:'Noto Sans TC',sans-serif;position:relative}
body:before{content:"";position:absolute;inset:0;background-image:radial-gradient(circle,rgba(201,240,107,.13) 1.3px,transparent 1.6px);background-size:26px 26px;-webkit-mask-image:radial-gradient(ellipse 60% 80% at 85% 40%,#000 10%,transparent 75%)}
.wrap{position:relative;display:grid;grid-template-columns:1fr 380px;gap:48px;height:100%;padding:56px 64px 52px}
.brand{display:flex;align-items:center;gap:14px;margin-bottom:46px}
.brand b{display:block;font-size:26px;font-weight:700;color:#fff;letter-spacing:.02em}
.brand small{display:block;font-family:'IBM Plex Mono',monospace;font-size:14px;letter-spacing:.18em;color:#b6c5c0}
.eyebrow{font-family:'IBM Plex Mono',monospace;font-size:18px;letter-spacing:.14em;color:#c9f06b;margin-bottom:18px;display:flex;align-items:center;gap:10px}
.eyebrow:before{content:"";width:10px;height:10px;border-radius:3px;background:#ee6c4f}
h1{font-size:58px;line-height:1.18;font-weight:700;color:#fff;letter-spacing:-.01em}
.hl{background:linear-gradient(transparent 62%,#c9f06b 62%, #c9f06b 92%,transparent 92%);color:#fff}
.sub{margin-top:22px;font-size:25px;line-height:1.55;color:#b6c5c0}
.domain{position:absolute;left:64px;bottom:40px;font-family:'IBM Plex Mono',monospace;font-size:19px;letter-spacing:.06em;color:#809691}
.side{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;background:#153534;border:1px solid #25413f;border-radius:28px;padding:36px;margin:20px 0 40px}
.stat{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:74px;line-height:1;color:#c9f06b;letter-spacing:-.03em}
.cap{margin-top:18px;font-size:22px;line-height:1.5;color:#b6c5c0}
.grades{display:grid;grid-template-columns:repeat(2,110px);gap:18px}
.grades span{display:grid;place-items:center;height:110px;border-radius:24px;font-family:'IBM Plex Mono',monospace;font-size:54px;font-weight:600}
.pair{display:grid;gap:22px;width:100%}
.pair div{display:flex;align-items:center;gap:20px;text-align:left}
.pair span{display:grid;place-items:center;width:96px;height:96px;flex:0 0 96px;border-radius:22px;font-family:'IBM Plex Mono',monospace;font-size:50px;font-weight:600}
.pair p{font-size:25px;line-height:1.35;color:#fff;font-weight:600}
.mini{width:300px}
.checks{list-style:none;padding:0;display:grid;gap:16px;width:100%;text-align:left}
.checks li{display:flex;gap:14px;align-items:center;font-size:23px;color:#fff;background:#0d2626;border-radius:16px;padding:14px 16px}
.checks i{width:26px;height:26px;flex:0 0 26px;border-radius:7px;background:#c9f06b}
.days{display:grid;grid-template-columns:repeat(7,40px);gap:9px}
.days span{display:grid;place-items:center;height:40px;border-radius:10px;border:1px solid #25413f;color:#809691;font-family:'IBM Plex Mono',monospace;font-size:14px}
.days span.on{background:#c9f06b;border-color:#c9f06b;color:#0d2626;font-weight:600}
.days span.now{border-color:#c9f06b;color:#c9f06b}
"""
FONTS='<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Noto+Sans+TC:wght@400;600;700&family=Space+Grotesk:wght@700&display=block" rel="stylesheet">'
for key,c in CARDS.items():
    html=f"""<!doctype html><html><head><meta charset="utf-8">{FONTS}<style>{CSS}</style></head><body><div class="wrap"><div>
<div class="brand">{MARK}<div><b>實證補給</b><small>EVIDENCE FOR LIVING</small></div></div>
<p class="eyebrow">{c['eyebrow']}</p><h1>{c['title']}</h1><p class="sub">{c['sub']}</p></div>
<div class="side">{side(c)}</div></div><p class="domain">evidenceforliving.com</p></body></html>"""
    open(f"card-{key}.html","w",encoding="utf-8").write(html)
print(" ".join(CARDS))
