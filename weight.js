// 體重管理小幫手 — BMI/waist categories, weight log with chart, weekly habits and coaching messages.
// Everything is stored only in this browser (localStorage). This tool never recommends medicines or doses.
// DRAFT CONTENT — must be clinically reviewed before public launch.

const WEIGHT_KEY = "supplescience-weight-v1";

// 衛生福利部國民健康署 adult BMI categories and waist cut-offs.
const BMI_BANDS = [
  { max: 18.5, key: "under", label: "體重過輕", tone: "c" },
  { max: 24, key: "healthy", label: "健康體位", tone: "a" },
  { max: 27, key: "over", label: "過重", tone: "c" },
  { max: 30, key: "ob1", label: "輕度肥胖", tone: "d" },
  { max: 35, key: "ob2", label: "中度肥胖", tone: "d" },
  { max: Infinity, key: "ob3", label: "重度肥胖", tone: "d" },
];
const WAIST_CUTOFF = { m: 90, f: 80 };


const HABITS = [
  {
    id: "protein",
    text: "大多數正餐都有一份以上的蛋白質（蛋、豆、魚、肉、奶）",
    tip: "每餐先放一份蛋白質：1 顆蛋、1 杯無糖豆漿，或 3 小格傳統豆腐。不確定吃多少，可以用蛋白質計算機算算看。",
    link: "./guide-glp1-lifestyle.html#protein-calc",
  },
  {
    id: "strength",
    text: "這週做了 2 次以上肌力訓練",
    tip: "這週試著安排 2 次、每次約 20 分鐘：椅子坐站、靠牆伏地挺身、提踵。體重下降時，肌力訓練能幫你保住肌肉。",
    link: "./guide-glp1-lifestyle.html#strength",
  },
  {
    id: "activity",
    text: "這週累積約 150 分鐘快走等中等強度活動",
    tip: "把活動拆小：每天兩餐後各散步 10 分鐘，一週就累積 140 分鐘。",
    link: "./guide-glp1-lifestyle.html#aerobic",
  },
  {
    id: "sleep",
    text: "大多數晚上睡滿 7 小時",
    tip: "先固定起床時間，睡前 30 分鐘把手機放遠一點。睡眠不足時，很多人會比較想吃東西。",
    link: "./reset.html",
  },
  {
    id: "weigh",
    text: "這週固定一天量體重並記錄",
    tip: "每週固定一天、早上起床上完廁所後量，比每天量更容易看出趨勢，也比較不會被每天的起伏影響心情。",
    link: "#log",
    auto: true,
  },
];

let data = loadWeight();

function emptyWeight() {
  return { profile: { sex: "", height: "", weight: "", waist: "" }, entries: [], habits: {}, refs: false, treatment: { drug: "", start: "", doses: [] } };
}

function loadWeight() {
  try {
    const saved = JSON.parse(localStorage.getItem(WEIGHT_KEY) || "null");
    if (saved && typeof saved === "object") {
      const base = emptyWeight();
      return {
        profile: { ...base.profile, ...(saved.profile || {}) },
        entries: Array.isArray(saved.entries) ? saved.entries.filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date) && Number(e.kg) > 0) : [],
        habits: saved.habits && typeof saved.habits === "object" ? saved.habits : {},
        refs: Boolean(saved.refs),
        treatment: {
          drug: ["semaglutide", "tirzepatide", "other"].includes(saved.treatment?.drug) ? saved.treatment.drug : "",
          start: /^\d{4}-\d{2}-\d{2}$/.test(saved.treatment?.start || "") ? saved.treatment.start : "",
          doses: Array.isArray(saved.treatment?.doses) ? saved.treatment.doses.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date) && Number(d.mg) >= 0) : [],
        },
      };
    }
  } catch (error) {
    console.warn("Could not read weight data", error);
  }
  return emptyWeight();
}

function saveWeight() {
  try {
    localStorage.setItem(WEIGHT_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Could not save weight data", error);
  }
}

// ---------- date helpers ----------
const pad2 = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseISO = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);

function weekStart(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - offset);
  return d;
}

function sortedEntries() {
  return [...data.entries].sort((a, b) => a.date.localeCompare(b.date));
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const fmt = (n, digits = 1) => Number(n).toFixed(digits);
const signed = (n, digits = 1) => `${n > 0 ? "+" : n < 0 ? "−" : "±"}${fmt(Math.abs(n), digits)}`;

// ---------- Step 1: BMI ----------
function renderBMI() {
  const box = document.getElementById("bmiResult");
  box.innerHTML = "";
  const { sex, height, weight, waist } = data.profile;
  const h = Number(height) / 100;
  const w = Number(weight);
  if (!h || !w || h < 1.2 || h > 2.2 || w < 30 || w > 300) {
    box.append(el("p", "calc-empty", "輸入身高與體重後，這裡會顯示你的 BMI 與分類。"));
    return;
  }
  const bmi = w / (h * h);
  const band = BMI_BANDS.find((b) => bmi < b.max);

  const top = el("div", "bmi-top");
  const stat = el("div", `bmi-stat tone-${band.tone}`);
  stat.append(el("span", "calc-label", "BMI"), el("strong", "", fmt(bmi)), el("span", "bmi-band", band.label));
  top.append(stat);

  const waistNum = Number(waist);
  if (sex && waistNum >= 40) {
    const high = waistNum >= WAIST_CUTOFF[sex];
    const ws = el("div", `bmi-stat tone-${high ? "d" : "a"}`);
    ws.append(el("span", "calc-label", "腰圍"), el("strong", "", `${fmt(waistNum, waistNum % 1 ? 1 : 0)}`), el("span", "bmi-band", high ? "腹部肥胖" : "未達腹部肥胖"));
    top.append(ws);
  }
  box.append(top);

  // scale bar 15–40
  const scale = el("div", "bmi-scale");
  const segments = [[15, 18.5, "c"], [18.5, 24, "a"], [24, 27, "c"], [27, 40, "d"]];
  segments.forEach(([a, b, tone]) => {
    const seg = el("span", `seg tone-${tone}`);
    seg.style.flex = String(b - a);
    scale.append(seg);
  });
  const marker = el("i", "bmi-marker");
  marker.style.left = `${Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100))}%`;
  scale.append(marker);
  const ticks = el("div", "bmi-ticks");
  ["18.5", "24", "27"].forEach((t) => {
    const s = el("span", "", t);
    s.style.left = `${((Number(t) - 15) / 25) * 100}%`;
    ticks.append(s);
  });
  box.append(scale, ticks);

  const msg = el("div", "bmi-message");
  const waistHigh = sex && waistNum >= 40 && waistNum >= WAIST_CUTOFF[sex];
  const lines = [];
  if (band.key === "under") {
    lines.push("BMI 低於 18.5 屬於體重過輕，也可能影響健康。如果不是刻意減重，建議和醫師討論。");
  } else if (band.key === "healthy") {
    lines.push(waistHigh
      ? "BMI 在健康範圍，但腰圍已達腹部肥胖標準，代表腹部脂肪可能偏多。建議從飲食、活動與睡眠著手，並和醫師討論血壓、血糖與血脂。"
      : "BMI 在健康範圍。維持目前的飲食與活動習慣即可。減重藥物並不適用於 BMI 正常的人。");
  } else if (band.key === "over") {
    lines.push("屬於過重。建議先從飲食、活動與睡眠調整，每週記錄一次體重。");
    lines.push("若同時有高血壓、糖尿病、血脂異常或睡眠呼吸中止，請和醫師討論整體風險與治療選擇。");
  } else {
    lines.push("屬於肥胖。肥胖是一種會影響心臟、血糖、關節與睡眠的慢性疾病，不是意志力不足。");
    lines.push("生活型態調整是所有治療的基礎。國際上減重藥物通常用於 BMI ≥30，或 BMI ≥27 合併體重相關疾病的人；是否適合你、該用哪一種，需要由醫師評估。");
  }
  if (waistHigh && band.key !== "healthy") lines.push(`腰圍已達腹部肥胖標準（${sex === "m" ? "男性 ≥90" : "女性 ≥80"} 公分）。`);
  lines.forEach((line) => msg.append(el("p", "", line)));
  if (["over", "ob1", "ob2", "ob3"].includes(band.key)) {
    const link = el("a", "", "了解 GLP-1 減重藥物適合誰 →");
    link.href = "./guide-glp1.html#who";
    msg.append(link);
  }
  box.append(msg);
  box.append(el("p", "calc-note", "分類依衛生福利部國民健康署成人標準：BMI 24–27 為過重、27 以上為肥胖；腰圍男性 ≥90 公分、女性 ≥80 公分為腹部肥胖。BMI 不適用於孕婦、18 歲以下與肌肉量特別高的人。"));
}

// ---------- Treatment ----------
const onTrackedDrug = () => ["semaglutide", "tirzepatide"].includes(data.treatment.drug) && data.treatment.start;

function sortedDoses() {
  return [...data.treatment.doses].sort((a, b) => a.date.localeCompare(b.date));
}

function currentDose() {
  const today = toISO(new Date());
  const past = sortedDoses().filter((d) => d.date <= today);
  return past[past.length - 1] || null;
}

const doseLabel = (mg) => (Number(mg) === 0 ? "停藥" : `${Number(mg)} mg`);

function renderTreatment() {
  const t = data.treatment;
  document.getElementById("drugSelect").value = t.drug;
  document.getElementById("startDate").value = t.start;
  const area = document.getElementById("doseArea");
  area.hidden = !t.drug;
  const select = document.getElementById("doseSelect");
  const other = document.getElementById("doseOther");
  select.innerHTML = "";
  const doses = TITRATION[t.drug]?.doses || [];
  doses.forEach((mg) => {
    const o = el("option", "", `${mg} mg`);
    o.value = String(mg);
    select.append(o);
  });
  if (!doses.length) {
    const o = el("option", "", "填寫劑量");
    o.value = "custom";
    select.append(o);
  }
  const stop = el("option", "", "停藥");
  stop.value = "0";
  select.append(stop);
  other.hidden = select.value !== "custom";

  const list = document.getElementById("doseList");
  list.innerHTML = "";
  sortedDoses().forEach((d) => {
    const li = el("li", "custom-item");
    li.append(el("span", "", `${d.date}　${doseLabel(d.mg)}`));
    const remove = el("button", "text-button danger", "刪除");
    remove.type = "button";
    remove.addEventListener("click", () => {
      data.treatment.doses = data.treatment.doses.filter((x) => !(x.date === d.date && x.mg === d.mg));
      saveWeight();
      renderAll();
    });
    li.append(remove);
    list.append(li);
  });
}

// ---------- Weight log & chart ----------
// Returns the points to plot: x in weeks (since treatment start, or since the first entry), y in % change.
function chartModel() {
  const entries = sortedEntries();
  if (!entries.length) return { points: [], base: null, mode: "none" };
  if (onTrackedDrug()) {
    const start = data.treatment.start;
    const before = entries.filter((e) => e.date <= start);
    let base = before[before.length - 1];
    let baseNote = "";
    if (!base) {
      base = entries.find((e) => daysBetween(start, e.date) <= 28) || entries[0];
      baseNote = `開始用藥前沒有體重紀錄，以 ${base.date} 的 ${fmt(base.kg)} 公斤作為起點。`;
    }
    const points = entries
      .filter((e) => e.date >= base.date)
      .map((e) => ({ x: Math.max(0, daysBetween(start, e.date) / 7), y: ((e.kg - base.kg) / base.kg) * 100, date: e.date, kg: e.kg }));
    return { points, base, mode: "treatment", baseNote };
  }
  const base = entries[0];
  return { points: entries.map((e) => ({ x: daysBetween(base.date, e.date) / 7, y: ((e.kg - base.kg) / base.kg) * 100, date: e.date, kg: e.kg })), base, mode: "log" };
}

function referenceSeries() {
  const drug = data.treatment.drug;
  const keys = drug === "tirzepatide" ? ["surmount1"] : ["step1", "step12"];
  const series = [];
  const legend = [];
  keys.forEach((key) => {
    const trial = TRIALS[key];
    Object.entries(trial.arms).forEach(([arm, a]) => {
      if (arm === "placebo") return; // drug arms only
      const alt = key === "step12" ? " alt" : "";
      const cls = arm === "placebo" ? `ref-line-placebo${alt}` : `ref-line-drug${alt}${key === "surmount1" ? ` ${arm}` : ""}`;
      series.push({ points: trial.weeks.map((w, i) => [w, a.values[i]]), cls });
      legend.push({ cls, text: `${trial.name}：${a.label}（第 ${trial.weeks[trial.weeks.length - 1]} 週 ${a.values[a.values.length - 1]}%）` });
    });
  });
  const notes = keys.map((k) => `${TRIALS[k].name}：${TRIALS[k].analysis}。${TRIALS[k].cite}`);
  return { series, legend, notes };
}

function renderLog() {
  const entries = sortedEntries();
  const list = document.getElementById("logList");
  list.innerHTML = "";
  document.getElementById("logCount").textContent = entries.length ? `（${entries.length}）` : "";
  const model = chartModel();
  [...entries].reverse().forEach((entry) => {
    const li = el("li", "log-row");
    const pct = model.base ? ((entry.kg - model.base.kg) / model.base.kg) * 100 : 0;
    const isBase = model.base && entry.date === model.base.date;
    li.append(el("span", "log-date", entry.date), el("span", "log-kg", `${fmt(entry.kg)} kg`), el("span", "log-pct", isBase ? "起點" : entry.date < model.base.date ? "—" : `${signed(pct)}%`));
    const remove = el("button", "icon-button", "×");
    remove.type = "button";
    remove.setAttribute("aria-label", `刪除 ${entry.date} 的紀錄`);
    remove.addEventListener("click", () => {
      data.entries = data.entries.filter((e) => e.date !== entry.date);
      saveWeight();
      renderAll();
    });
    li.append(remove);
    list.append(li);
  });

  const stat = document.getElementById("chartStat");
  const pts = model.points;
  if (!entries.length) stat.textContent = "加入第一筆紀錄後，這裡會畫出你的變化。";
  else if (pts.length <= 1) stat.textContent = `起點：${model.base.date}，${fmt(model.base.kg)} 公斤。之後每週記錄一次，就能看到趨勢。`;
  else {
    const last = pts[pts.length - 1];
    const diff = last.kg - model.base.kg;
    const weeks = model.mode === "treatment" ? last.x : daysBetween(model.base.date, last.date) / 7;
    stat.textContent = `${model.mode === "treatment" ? "用藥第" : "記錄"} ${fmt(weeks, weeks < 10 ? 1 : 0)} 週：${signed(diff)} 公斤（${signed(last.y)}%）`;
  }
  renderChart(model);
  renderProgress(model);
}

function renderChart(model) {
  const box = document.getElementById("chartBox");
  const legendBox = document.getElementById("chartLegend");
  const noteBox = document.getElementById("refNote");
  const showRefs = data.refs;
  if (!model.points.length && !showRefs) {
    box.innerHTML = "";
    box.append(el("p", "chart-empty", "還沒有資料"));
    legendBox.hidden = true;
    noteBox.hidden = true;
    return;
  }
  const series = [];
  const legend = [];
  let notes = [];
  if (showRefs) {
    const ref = referenceSeries();
    series.push(...ref.series);
    legend.push(...ref.legend);
    notes = ref.notes;
  }
  if (model.points.length) {
    series.push({ points: model.points.map((p) => [p.x, p.y, `${p.date}：${fmt(p.kg)} kg（${signed(p.y)}%）`]), cls: "you-line", dots: true });
    legend.unshift({ cls: "you", text: "你的紀錄" });
  }
  const vlines = model.mode === "treatment"
    ? sortedDoses().filter((d) => d.date >= data.treatment.start).map((d) => ({ x: daysBetween(data.treatment.start, d.date) / 7, label: doseLabel(d.mg) }))
    : [];
  const lastX = model.points.length ? model.points[model.points.length - 1].x : 0;
  const refMax = showRefs ? Math.max(...series.filter((s) => !s.dots).flatMap((s) => s.points.map((p) => p[0]))) : 0;
  drawLineChart(box, {
    series,
    vlines,
    xMax: Math.max(4, Math.ceil(lastX * 1.15), refMax),
    xLabel: model.mode === "treatment" ? "用藥週數" : "週",
    ariaLabel: "體重變化百分比圖",
  });

  legendBox.innerHTML = "";
  legend.forEach((item) => {
    const span = el("span");
    span.append(el("i", `lg ${item.cls}`), el("span", "", item.text));
    legendBox.append(span);
  });
  legendBox.hidden = legend.length === 0;
  noteBox.hidden = !showRefs;
  noteBox.innerHTML = "";
  if (showRefs) {
    noteBox.append(el("span", "", "研究曲線是平均值，不是目標；每個人的反應差異很大。曲線由論文圖表判讀，誤差約 ±0.5 個百分點。是否用藥、用多少，由醫師決定。"));
    notes.forEach((n) => noteBox.append(el("span", "ref-cite", n)));
    if (model.baseNote) noteBox.append(el("span", "ref-cite", model.baseNote));
  }
}

// ---------- Progress panel: phase, comparison with trials, milestones ----------
function progressBox(title, lines, tone = "") {
  const box = el("div", `progress-box ${tone}`);
  box.append(el("p", "progress-title", title));
  lines.forEach((line) => {
    if (typeof line === "string") box.append(el("p", "", line));
    else box.append(line);
  });
  return box;
}

function renderProgress(model) {
  const panel = document.getElementById("progressPanel");
  panel.innerHTML = "";
  const drug = data.treatment.drug;
  const tracked = onTrackedDrug();
  const pts = model.points;
  const last = pts[pts.length - 1];
  const best = pts.length ? Math.min(...pts.map((p) => p.y)) : 0;
  const dose = currentDose();

  // Stopped
  if (tracked && dose && Number(dose.mg) === 0) {
    panel.append(progressBox("停藥之後，研究怎麼說", [
      "在 STEP 4 中，用 semaglutide 20 週後改用安慰劑的人，接下來 48 週體重平均回升 6.9%；繼續用藥的人則再減少 7.9%。改用安慰劑的人中，82% 體重有回升。",
      "SURMOUNT-MAINTAIN 中，用 tirzepatide 60 週後：繼續原劑量的人一年內體重幾乎不變（−0.2%），降到 5 mg 的人回升 7.0%，改用安慰劑的人回升 15.2%。",
      "這不是失敗，而是肥胖這個慢性病的特性。停藥後最能幫上忙的，是每週量體重、維持肌力訓練與規律活動，並和醫師約好追蹤時間。",
    ], "warn"));
  }

  if (tracked) {
    const weeks = Math.max(0, daysBetween(data.treatment.start, toISO(new Date())) / 7);
    const tit = TITRATION[drug];
    const phaseLines = [];
    if (dose && Number(dose.mg) > 0) phaseLines.push(`你記錄的目前劑量：${doseLabel(dose.mg)}（${dose.date} 起）。`);
    if (weeks < tit.maintenanceWeek) {
      phaseLines.push(drug === "semaglutide"
        ? `研究中的做法是每 4 週調高一次劑量，約第 16 週達到 2.4 mg。你目前在第 ${fmt(weeks, 0)} 週。實際何時調整、調到多少，由你的醫師依反應與副作用決定。`
        : `研究中的做法是每 4 週增加 2.5 mg，5、10、15 mg 分別在第 4、12、20 週達到。你目前在第 ${fmt(weeks, 0)} 週。實際何時調整、調到多少，由你的醫師決定。`);
      phaseLines.push(drug === "semaglutide"
        ? "腸胃不適最常出現在這個階段。STEP 1 中約 44% 的人曾噁心，每次噁心的中位持續時間約 8 天；因腸胃副作用停藥的人約 4.5%，多發生在前 12 週。"
        : "腸胃不適最常出現在這個階段。SURMOUNT-1 中約 25–33% 的人曾噁心、19–23% 腹瀉，多為輕度到中度、在調整劑量期出現。");
      phaseLines.push("研究中處理腸胃不適的順序：先調整吃法（慢慢吃、少量、吃飽就停，可把三餐分成四餐以上），仍不舒服時由醫師評估症狀藥物，或暫緩調高劑量。請和你的醫師討論，不要自行跳過或加倍劑量。");
      panel.append(progressBox(`調整劑量期・第 ${fmt(weeks, 0)} 週`, phaseLines));
    } else {
      phaseLines.push("研究中，這時多數人已在維持劑量。體重下降通常會逐漸變慢，最後進入平台期，這是正常的。");
      panel.append(progressBox(`維持期・第 ${fmt(weeks, 0)} 週`, phaseLines));
    }
  }

  // Comparison with the trial average at the same week
  if (tracked && last && last.x >= 2) {
    const w = last.x;
    let refText = "";
    if (drug === "semaglutide") {
      const s1 = curveAt(TRIALS.step1.weeks, TRIALS.step1.arms.drug.values, w);
      const s12 = curveAt(TRIALS.step12.weeks, TRIALS.step12.arms.drug.values, w);
      refText = [s1 !== null && `STEP 1 約 ${fmt(s1)}%`, s12 !== null && `STEP 12（台灣、中國大陸）約 ${fmt(s12)}%`].filter(Boolean).join("、");
    } else {
      const t = TRIALS.surmount1;
      const lo = curveAt(t.weeks, t.arms.d5.values, w);
      const hi = curveAt(t.weeks, t.arms.d15.values, w);
      if (lo !== null) refText = `SURMOUNT-1 約 ${fmt(lo)}%（5 mg 組）到 ${fmt(hi)}%（15 mg 組）`;
    }
    if (refText) {
      // "Ahead" = at or below the lower-intensity reference (STEP 1 semaglutide, or the 5 mg arm).
      const ref = drug === "semaglutide"
        ? curveAt(TRIALS.step1.weeks, TRIALS.step1.arms.drug.values, w) ?? curveAt(TRIALS.step12.weeks, TRIALS.step12.arms.drug.values, w)
        : curveAt(TRIALS.surmount1.weeks, TRIALS.surmount1.arms.d5.values, w);
      const ahead = ref !== null && last.y <= ref + 0.5;
      panel.append(progressBox("和研究平均相比", [
        `用藥第 ${fmt(w, 0)} 週，研究中的平均體重變化：${refText}。你目前是 ${signed(last.y)}%。`,
        ahead
          ? "你的進度和研究平均相近或更快。體重下降較快時，更要顧好蛋白質與肌力訓練，也留意是否吃得太少、喝水不夠。"
          : "減得比研究平均慢，不代表失敗：研究中也有不少人減得較少，而且研究參與者的起始體重多半比較重。可以帶著這張圖和醫師討論。",
      ]));
    }
  }

  // Milestones
  if (pts.length >= 2) {
    const reached = [5, 10, 15, 20].filter((m) => best <= -m);
    const chips = el("div", "milestones");
    [5, 10, 15, 20].forEach((m) => chips.append(el("span", `milestone${reached.includes(m) ? " on" : ""}`, `${m}%`)));
    const lines = [chips];
    const top = reached[reached.length - 1];
    if (top) {
      if (drug === "semaglutide") {
        const p = TRIALS.step1.responders[top];
        lines.push(`你已經減少 ${top}% 以上。STEP 1 中，用藥 68 週後有 ${p}% 的人達到這個程度${TRIALS.step12.responders[top] ? `；台灣參與的 STEP 12 則是 ${TRIALS.step12.responders[top]}%（44 週）` : ""}。`);
      } else if (drug === "tirzepatide") {
        const r = TRIALS.surmount1.responders[top];
        lines.push(`你已經減少 ${top}% 以上。SURMOUNT-1 中，用藥 72 週後各劑量組有 ${r.d5}–${r.d15}% 的人達到這個程度。`);
      } else {
        lines.push(`你已經減少 ${top}% 以上。在 STEP 1 只接受飲食與運動諮詢的安慰劑組中，68 週後約 31.5% 的人減少 5% 以上——你做到了很多人做不到的事。`);
      }
      lines.push("研究顯示，體重減少約 5% 以上，血壓、血糖與血脂往往開始改善。下次看診時可以請醫師一起看看。");
    } else {
      lines.push("第一個里程碑是 5%。以 80 公斤為例，大約是 4 公斤。");
    }
    if (best <= -5) {
      lines.push("減掉的不全是脂肪：在 STEP 12 台灣受試者的身體組成研究中，減少的體重約 75% 是脂肪、25% 是肌肉等非脂肪組織。每週 2 次肌力訓練與足夠蛋白質，可以幫忙保住肌肉。");
    }
    panel.append(progressBox("里程碑", lines.filter(Boolean)));
  }
}

// ---------- Step 3: habits ----------
function currentWeekKey() {
  return toISO(weekStart());
}

function loggedThisWeek() {
  const start = currentWeekKey();
  return data.entries.some((e) => e.date >= start && daysBetween(start, e.date) < 7);
}

function habitState() {
  const key = currentWeekKey();
  const saved = data.habits[key] || {};
  const state = {};
  HABITS.forEach((h) => {
    state[h.id] = h.auto ? loggedThisWeek() : Boolean(saved[h.id]);
  });
  return state;
}

function renderHabits() {
  const start = weekStart();
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  document.getElementById("weekLabel").textContent = `本週 ${start.getMonth() + 1}/${start.getDate()}–${end.getMonth() + 1}/${end.getDate()}`;
  const list = document.getElementById("habitList");
  list.innerHTML = "";
  const state = habitState();
  HABITS.forEach((habit) => {
    const row = el("label", "task-item");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = state[habit.id];
    if (habit.auto) {
      input.disabled = true;
    } else {
      input.addEventListener("change", () => {
        const key = currentWeekKey();
        data.habits[key] = { ...(data.habits[key] || {}), [habit.id]: input.checked };
        saveWeight();
        renderCoach();
      });
    }
    const text = el("span", "", habit.text);
    if (habit.auto) text.append(el("small", "habit-auto", "（加入本週體重紀錄後自動勾選）"));
    row.append(input, text);
    list.append(row);
  });
}

// ---------- Coach ----------
function renderCoach() {
  const box = document.getElementById("coachMessages");
  box.innerHTML = "";
  const messages = [];
  const entries = sortedEntries();
  const today = toISO(new Date());

  if (!entries.length) {
    messages.push({ text: "先從一個起點開始：在上面記下今天的體重。之後每週量一次就好，不需要每天量。" });
  } else {
    const last = entries[entries.length - 1];
    const gap = daysBetween(last.date, today);
    if (gap >= 14) messages.push({ text: `已經 ${gap} 天沒有記錄了。沒關係，今天量一次，重新接上就好。` });
    else if (loggedThisWeek()) messages.push({ text: "這週已經記錄了，做得很好。持續記錄本身，就是改變的一部分。" });
    else messages.push({ text: "這週還沒量體重，挑一個固定的早上量一次吧。" });

    if (entries.length >= 2 && daysBetween(entries[0].date, last.date) >= 21) {
      const pct = ((last.kg - entries[0].kg) / entries[0].kg) * 100;
      messages.push({
        text: pct < 0
          ? `和起點相比已經減少 ${fmt(Math.abs(pct))}%。體重下降時更要顧好肌肉：每週 2 次肌力訓練、每餐都有蛋白質。`
          : "體重有起伏很正常，尤其是剛開始的幾週。先把注意力放在這週做得到的習慣上。",
      });
    }
  }

  const state = habitState();
  const next = HABITS.find((h) => !state[h.id]);
  if (next) messages.push({ text: `這週的小目標：${next.tip}`, link: next.link, linkText: "怎麼做 →" });
  else messages.push({ text: "五個習慣這週都做到了！下週維持同樣的節奏就很好。" });

  messages.forEach((m) => {
    const p = el("p", "coach-msg", m.text);
    if (m.link) {
      const a = el("a", "", ` ${m.linkText}`);
      a.href = m.link;
      p.append(a);
    }
    box.append(p);
  });
}

function renderAll() {
  renderTreatment();
  renderBMI();
  renderLog();
  renderHabits();
  renderCoach();
}

document.addEventListener("DOMContentLoaded", () => {
  const p = data.profile;
  const height = document.getElementById("heightInput");
  const weight = document.getElementById("bmiWeightInput");
  const waist = document.getElementById("waistInput");
  height.value = p.height;
  weight.value = p.weight;
  waist.value = p.waist;
  document.querySelectorAll('input[name="sex"]').forEach((radio) => {
    radio.checked = radio.value === p.sex;
    radio.addEventListener("change", () => {
      data.profile.sex = radio.value;
      saveWeight();
      renderBMI();
    });
  });
  [[height, "height"], [weight, "weight"], [waist, "waist"]].forEach(([input, key]) =>
    input.addEventListener("input", () => {
      data.profile[key] = input.value;
      saveWeight();
      renderBMI();
    })
  );
  document.getElementById("bmiForm").addEventListener("submit", (e) => e.preventDefault());

  const logDate = document.getElementById("logDate");
  const logWeight = document.getElementById("logWeight");
  logDate.value = toISO(new Date());
  logDate.max = toISO(new Date());
  document.getElementById("logForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const kg = Number(logWeight.value);
    const note = document.getElementById("logNote");
    if (!logDate.value || !(kg >= 30 && kg <= 300)) {
      note.textContent = "請輸入日期與 30–300 公斤之間的體重。";
      return;
    }
    const replaced = data.entries.some((e) => e.date === logDate.value);
    data.entries = data.entries.filter((e) => e.date !== logDate.value);
    data.entries.push({ date: logDate.value, kg: Math.round(kg * 10) / 10 });
    if (logDate.value >= (sortedEntries().slice(-1)[0] || {}).date) {
      data.profile.weight = String(kg);
      weight.value = String(kg);
    }
    saveWeight();
    note.textContent = replaced ? "已更新這一天的紀錄。" : "已加入紀錄。";
    logWeight.value = "";
    renderAll();
  });

  document.getElementById("drugSelect").addEventListener("change", (event) => {
    data.treatment.drug = event.target.value;
    if (!data.treatment.drug) data.treatment.doses = [];
    saveWeight();
    renderAll();
  });
  document.getElementById("startDate").addEventListener("change", (event) => {
    data.treatment.start = event.target.value;
    saveWeight();
    renderAll();
  });
  document.getElementById("doseSelect").addEventListener("change", (event) => {
    document.getElementById("doseOther").hidden = event.target.value !== "custom";
  });
  const doseDate = document.getElementById("doseDate");
  doseDate.value = toISO(new Date());
  document.getElementById("doseForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const choice = document.getElementById("doseSelect").value;
    const mg = choice === "custom" ? Number(document.getElementById("doseOther").value) : Number(choice);
    if (!doseDate.value || !(mg >= 0)) return;
    data.treatment.doses = data.treatment.doses.filter((d) => d.date !== doseDate.value);
    data.treatment.doses.push({ date: doseDate.value, mg });
    if (!data.treatment.start && mg > 0) data.treatment.start = doseDate.value;
    saveWeight();
    renderAll();
  });

  const refToggle = document.getElementById("refToggle");
  refToggle.checked = data.refs;
  refToggle.addEventListener("change", () => {
    data.refs = refToggle.checked;
    saveWeight();
    renderLog();
  });

  document.getElementById("clearWeight").addEventListener("click", () => {
    if (!window.confirm("確定要清除這台裝置上所有的體重、BMI 與習慣紀錄嗎？此動作無法復原。")) return;
    try {
      localStorage.removeItem(WEIGHT_KEY);
    } catch (error) {
      console.warn("Could not clear weight data", error);
    }
    data = emptyWeight();
    height.value = weight.value = waist.value = "";
    document.querySelectorAll('input[name="sex"]').forEach((r) => (r.checked = false));
    refToggle.checked = false;
    renderAll();
  });

  let resizeTimer;
  let lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => renderChart(chartModel()), 150);
  });

  renderAll();
});
