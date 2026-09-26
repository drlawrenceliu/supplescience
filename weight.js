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

// End-of-trial mean % weight change (verified against the published abstracts).
const TRIAL_REFS = [
  { week: 68, drug: -14.9, placebo: -2.4, label: "STEP 1" },
  { week: 72, drug: -20.9, placebo: -3.1, label: "SURMOUNT-1" },
  { week: 44, drug: -12.1, placebo: -2.2, label: "STEP 12" },
];

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
  return { profile: { sex: "", height: "", weight: "", waist: "" }, entries: [], habits: {}, refs: false };
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

// ---------- Step 2: log & chart ----------
function renderLog() {
  const entries = sortedEntries();
  const list = document.getElementById("logList");
  list.innerHTML = "";
  document.getElementById("logCount").textContent = entries.length ? `（${entries.length}）` : "";
  const first = entries[0];
  [...entries].reverse().forEach((entry) => {
    const li = el("li", "log-row");
    const pct = first ? ((entry.kg - first.kg) / first.kg) * 100 : 0;
    li.append(el("span", "log-date", entry.date), el("span", "log-kg", `${fmt(entry.kg)} kg`), el("span", "log-pct", entry === first ? "起點" : `${signed(pct)}%`));
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
  if (entries.length === 0) stat.textContent = "加入第一筆紀錄後，這裡會畫出你的變化。";
  else if (entries.length === 1) stat.textContent = `起點：${first.date}，${fmt(first.kg)} 公斤。之後每週記錄一次，就能看到趨勢。`;
  else {
    const last = entries[entries.length - 1];
    const diff = last.kg - first.kg;
    const weeks = daysBetween(first.date, last.date) / 7;
    stat.textContent = `${first.date} 到 ${last.date}（${fmt(weeks, weeks < 10 ? 1 : 0)} 週）：${signed(diff)} 公斤（${signed((diff / first.kg) * 100)}%）`;
  }
  renderChart(entries);
}

function niceStep(range) {
  if (range <= 4) return 1;
  if (range <= 10) return 2;
  return 5;
}

function renderChart(entries) {
  const box = document.getElementById("chartBox");
  box.innerHTML = "";
  const showRefs = data.refs;
  document.getElementById("chartLegend").hidden = !showRefs;
  document.getElementById("refNote").hidden = !showRefs;
  if (!entries.length && !showRefs) {
    box.append(el("p", "chart-empty", "還沒有資料"));
    return;
  }
  const first = entries[0];
  const points = entries.map((e) => ({ x: first ? daysBetween(first.date, e.date) / 7 : 0, y: ((e.kg - first.kg) / first.kg) * 100, date: e.date, kg: e.kg }));

  const lastX = points.length ? points[points.length - 1].x : 0;
  let xMax = Math.max(4, Math.ceil(lastX * 1.15));
  let yMin = Math.min(-2, ...points.map((p) => p.y));
  let yMax = Math.max(1, ...points.map((p) => p.y));
  if (showRefs) {
    xMax = Math.max(xMax, 76);
    yMin = Math.min(yMin, -22);
  }
  const step = niceStep(yMax - yMin);
  yMin = Math.floor((yMin - 0.5) / step) * step;
  yMax = Math.ceil((yMax + 0.5) / step) * step;
  // Draw at the container's real pixel width so text stays readable on phones.
  const W = Math.max(280, Math.min(900, Math.round(box.clientWidth - 16) || 640));
  const narrow = W < 520;
  const H = narrow ? 250 : 300;
  const M = { l: 44, r: 12, t: 16, b: 34 };
  const xStep = xMax <= 8 ? 1 : xMax <= 26 ? 4 : narrow ? 24 : 12;
  const sx = (x) => M.l + (x / xMax) * (W - M.l - M.r);
  const sy = (y) => M.t + ((yMax - y) / (yMax - yMin)) * (H - M.t - M.b);
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("class", "weight-chart");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "體重變化百分比圖");
  const add = (tag, attrs, text) => {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    if (text !== undefined) n.textContent = text;
    svg.appendChild(n);
    return n;
  };

  for (let y = yMin; y <= yMax + 1e-9; y += step) {
    add("line", { x1: M.l, x2: W - M.r, y1: sy(y), y2: sy(y), class: y === 0 ? "axis-zero" : "grid" });
    add("text", { x: M.l - 8, y: sy(y) + 4, class: "tick", "text-anchor": "end" }, `${y > 0 ? "+" : ""}${y}%`);
  }
  for (let x = 0; x <= xMax; x += xStep) {
    add("text", { x: sx(x), y: H - M.b + 20, class: "tick", "text-anchor": "middle" }, `${x}`);
  }
  add("text", { x: W - M.r, y: H - 4, class: "tick", "text-anchor": "end" }, "週");

  if (showRefs) {
    TRIAL_REFS.forEach((r) => {
      add("circle", { cx: sx(r.week), cy: sy(r.placebo), r: 5, class: "ref-placebo" });
      add("rect", { x: sx(r.week) - 5.5, y: sy(r.drug) - 5.5, width: 11, height: 11, transform: `rotate(45 ${sx(r.week)} ${sy(r.drug)})`, class: "ref-drug" });
      if (narrow) {
        add("text", { x: sx(r.week) - 9, y: sy(r.drug) - 2, class: "ref-label", "text-anchor": "end" }, r.label);
        add("text", { x: sx(r.week) - 9, y: sy(r.drug) + 10, class: "ref-label", "text-anchor": "end" }, `${r.drug}%`);
      } else {
        add("text", { x: sx(r.week) - 9, y: sy(r.drug) + 4, class: "ref-label", "text-anchor": "end" }, `${r.label} ${r.drug}%`);
      }
    });
  }

  if (points.length > 1) {
    add("polyline", { points: points.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" "), class: "you-line" });
  }
  points.forEach((p) => {
    const dot = add("circle", { cx: sx(p.x), cy: sy(p.y), r: points.length > 8 ? 3 : 4.5, class: "you-dot" });
    const title = document.createElementNS(NS, "title");
    title.textContent = `${p.date}：${fmt(p.kg)} kg（${signed(p.y)}%）`;
    dot.appendChild(title);
  });
  box.append(svg);
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
    resizeTimer = setTimeout(() => renderChart(sortedEntries()), 150);
  });

  renderAll();
});
