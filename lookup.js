// 保健食品實證速查 — data and search.
// To add a supplement: append an entry to SUPPLEMENTS. Every claim needs a grade (A–D), a short
// verdict, and a verified source. `guide` is the full article, or null if not written yet.
// DRAFT CONTENT — must be clinically reviewed before public launch.

const SUPPLEMENTS = [
  {
    id: "fish-oil",
    name: "魚油",
    en: "Fish oil / Omega-3",
    aliases: ["魚油", "深海魚油", "omega-3", "omega3", "ω-3", "epa", "dha", "fish oil", "純 epa", "icosapent", "三酸甘油酯"],
    guide: "./guide-fish-oil.html",
    claims: [
      { grade: "A", claim: "心血管病人使用處方級高純度 EPA，減少重大心血管事件", note: "適用：已有心血管疾病（或糖尿病合併危險因子）、已用 statin、三酸甘油酯 135–499 mg/dL。每天 4 克，重大心血管事件減少約 25%。", source: "REDUCE-IT，N Engl J Med 2019" },
      { grade: "D", claim: "心血管高風險病人使用 EPA＋DHA 混合配方", note: "每天 4 克混合配方與對照組沒有差別，試驗提前終止。", source: "STRENGTH，JAMA 2020" },
      { grade: "D", claim: "一般人吃魚油預防心臟病、中風", note: "沒有心血管疾病的成人每天 1 克，主要心血管事件沒有減少。", source: "VITAL，N Engl J Med 2019" },
    ],
    caution: "omega-3 與心房顫動風險增加有關，每天超過 1 克更明顯。使用抗凝血或抗血小板藥物、即將手術的人，請先問醫師。",
  },
  {
    id: "red-yeast-rice",
    name: "紅麴",
    en: "Red yeast rice",
    aliases: ["紅麴", "紅麴米", "紅麴菌", "monacolin", "monacolin k", "red yeast rice", "血脂康", "膽固醇", "降膽固醇"],
    guide: "./guide-red-yeast-rice.html",
    claims: [
      { grade: "B", claim: "降低 LDL（壞膽固醇）", note: "含足量 Monacolin K 的標準化製劑有效；但市售產品含量差異大，也有研究中的產品沒有比安慰劑有效。", source: "Gerards，Atherosclerosis 2015；SPORT，J Am Coll Cardiol 2023" },
      { grade: "C", claim: "減少心肌梗塞、中風（市售紅麴保健食品）", note: "唯一的大型試驗使用中國藥品級萃取物，不能直接套用到一般產品。", source: "Lu，Am J Cardiol 2008" },
      { grade: "D", claim: "取代醫師處方的降血脂藥", note: "2025 歐洲與 2026 美國血脂指引都不建議以保健食品降低心血管風險。", source: "ESC/EAS 2025；ACC/AHA 2026" },
    ],
    caution: "Monacolin K 就是 lovastatin：已在吃 statin 的人不要併用。2024 年日本小林製藥紅麴曾因汙染造成腎臟損傷。出現肌肉痠痛、茶色尿請停用並就醫。",
  },
  {
    id: "vitamin-d",
    name: "維生素 D",
    en: "Vitamin D",
    aliases: ["維生素d", "維生素 d", "維他命d", "維他命 d", "vitamin d", "d3", "維生素 d3", "骨質疏鬆", "骨折"],
    guide: null,
    claims: [
      { grade: "D", claim: "預防癌症與心血管疾病", note: "中老年人每天 2,000 IU，癌症與主要心血管事件都沒有減少。", source: "VITAL，N Engl J Med 2019" },
      { grade: "D", claim: "健康中老年人預防骨折", note: "沒有缺乏、沒有骨質疏鬆的人，每天 2,000 IU 沒有降低骨折。不適用於已缺乏或有骨鬆的人。", source: "LeBoff，N Engl J Med 2022" },
      { grade: "B", claim: "75 歲以上長者、孕婦等特定族群", note: "美國內分泌學會建議這些族群可以補充，但最適合的劑量仍不確定。", source: "Endocrine Society，J Clin Endocrinol Metab 2024" },
    ],
    caution: "長期自行吃高劑量可能造成血鈣過高。有腎結石或腎臟病的人請先問醫師。",
  },
  {
    id: "lutein",
    name: "葉黃素",
    en: "Lutein",
    aliases: ["葉黃素", "玉米黃素", "lutein", "zeaxanthin", "護眼", "黃斑部", "眼睛"],
    guide: null,
    claims: [
      { grade: "C", claim: "一般人預防黃斑部病變", note: "系統性回顧找不到支持一般人預防發病的證據。", source: "Cochrane 系統性回顧 2017" },
      { grade: "B", claim: "已診斷中期黃斑部病變，使用 AREDS2 配方", note: "需先經眼科醫師診斷；以葉黃素取代 β-胡蘿蔔素，可避開吸菸者的肺癌風險。", source: "AREDS2，JAMA 2013" },
      { grade: "C", claim: "改善 3C 用眼疲勞、恢復視力", note: "目前沒有大型、高品質研究證實。", source: "缺乏高品質研究" },
    ],
    caution: "吸菸或曾吸菸者應避免含 β-胡蘿蔔素的舊配方。視力突然模糊或看東西變形，請立即就醫。",
  },
];

const GRADE_LABEL = {
  A: { zh: "有明確好處", en: "Clear benefit" },
  B: { zh: "可能有好處", en: "Likely benefit" },
  C: { zh: "證據不足", en: "Uncertain" },
  D: { zh: "無益或可能有害", en: "No benefit / harm" },
};

const normalize = (text) => text.toLowerCase().replace(/\s+/g, "");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function bilingual(tag, className, zh, en) {
  const node = el(tag, className);
  const a = el("span", "", zh);
  a.lang = "zh-Hant";
  const b = el("span", "", en);
  b.lang = "en";
  node.append(a, b);
  return node;
}

function renderCard(item, gradeFilter) {
  const card = el("article", "lookup-card");
  card.id = item.id;
  const head = el("div", "lookup-head");
  const title = el("h2", "", item.name);
  title.append(el("small", "", item.en));
  head.append(title);
  if (item.guide) {
    const link = el("a", "btn btn-ghost btn-sm");
    link.href = item.guide;
    link.append(bilingual("span", "", "閱讀完整指南", "Read the guide"), el("span", "arrow", "→"));
    head.append(link);
  } else {
    head.append(bilingual("span", "chip chip-soon", "完整指南準備中", "Full guide coming"));
  }
  card.append(head);

  const list = el("ul", "claim-list");
  item.claims
    .filter((claim) => !gradeFilter || claim.grade === gradeFilter)
    .forEach((claim) => {
      const row = el("li", "claim-row");
      const badge = el("span", `grade grade-${claim.grade.toLowerCase()}`, claim.grade);
      badge.title = GRADE_LABEL[claim.grade].zh;
      const body = el("div");
      const label = bilingual("span", `claim-grade-label grade-text-${claim.grade.toLowerCase()}`, GRADE_LABEL[claim.grade].zh, GRADE_LABEL[claim.grade].en);
      body.append(label, el("p", "claim-title", claim.claim), el("p", "claim-note", claim.note), el("p", "claim-source", claim.source));
      row.append(badge, body);
      list.append(row);
    });
  card.append(list);

  const caution = el("p", "lookup-caution");
  caution.append(bilingual("strong", "", "注意：", "Caution: "), document.createTextNode(item.caution));
  card.append(caution);
  return card;
}

function initLookup() {
  const input = document.getElementById("lookupInput");
  const results = document.getElementById("lookupResults");
  const empty = document.getElementById("lookupEmpty");
  const gradeChips = [...document.querySelectorAll("[data-grade-filter]")];
  const quick = document.getElementById("lookupQuick");
  if (!input || !results) return; // loaded on another page (e.g. by site search) — data only
  let gradeFilter = "";

  SUPPLEMENTS.forEach((item) => {
    const chip = el("button", "filter-chip", item.name);
    chip.type = "button";
    chip.addEventListener("click", () => {
      input.value = item.name;
      render();
      input.focus();
    });
    quick.append(chip);
  });

  function render() {
    const query = normalize(input.value);
    const matches = SUPPLEMENTS.filter((item) => {
      const textMatch = !query || [item.name, item.en, ...item.aliases].some((alias) => normalize(alias).includes(query) || query.includes(normalize(alias)));
      const gradeMatch = !gradeFilter || item.claims.some((claim) => claim.grade === gradeFilter);
      return textMatch && gradeMatch;
    });
    results.innerHTML = "";
    matches.forEach((item) => results.append(renderCard(item, gradeFilter)));
    empty.hidden = matches.length > 0;
    const url = new URL(window.location.href);
    if (input.value.trim()) url.searchParams.set("q", input.value.trim());
    else url.searchParams.delete("q");
    history.replaceState(null, "", url);
  }

  gradeChips.forEach((chip) =>
    chip.addEventListener("click", () => {
      gradeFilter = chip.dataset.gradeFilter === gradeFilter ? "" : chip.dataset.gradeFilter;
      gradeChips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.gradeFilter === gradeFilter)));
      render();
    })
  );
  input.addEventListener("input", render);
  document.getElementById("lookupForm").addEventListener("submit", (event) => {
    event.preventDefault();
    render();
  });
  input.value = new URLSearchParams(window.location.search).get("q") || "";
  render();
}

document.addEventListener("DOMContentLoaded", initLookup);
