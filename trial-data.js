// Verified GLP-1 trial data used by the weight companion and the GLP-1 guide charts.
// Sources: the published papers, appendices and protocols (kept locally in References/, not published).
// Per-visit curves were read from the papers' figures (no per-visit tables exist):
//   STEP 1 ≈ ±0.5 percentage points; STEP 4 ≈ ±0.3 (supplement eFigure 3); SURMOUNT-1, STEP 12 ≈ ±0.2 (vector extraction);
//   SURMOUNT-MAINTAIN ≈ ±0.5 except weeks 84 and 112 (exact).
// Every curve notes its analysis set because they differ between trials.

const TRIALS = {
  step1: {
    name: "STEP 1",
    drug: "semaglutide",
    cite: "Wilding JPH, et al. N Engl J Med 2021;384:989–1002（Figure 1A）",
    analysis: "所有隨機分配者的實際觀察平均（不論是否停藥）",
    weeks: [0, 4, 8, 12, 16, 20, 28, 36, 44, 52, 60, 68],
    arms: {
      drug: { label: "Semaglutide 2.4 mg", values: [0, -2.2, -4.0, -5.9, -7.7, -9.5, -11.7, -13.4, -14.6, -15.5, -15.8, -15.6] },
      placebo: { label: "安慰劑（生活型態）", values: [0, -1.1, -1.7, -2.2, -2.5, -2.8, -2.8, -3.0, -3.2, -3.3, -3.2, -2.8] },
    },
    responders: { 5: 86.4, 10: 69.1, 15: 50.5, 20: 32.0 }, // week 68, treatment policy (main Table 2)
    responderWeek: 68,
  },
  step12: {
    name: "STEP 12（台灣、中國大陸）",
    drug: "semaglutide",
    cite: "Guo L, et al. Lancet Diabetes Endocrinol 2026;14:805–817（Figure 2A）",
    analysis: "所有隨機分配者的實際觀察平均",
    weeks: [0, 2, 4, 8, 12, 16, 20, 28, 36, 44],
    arms: {
      drug: { label: "Semaglutide 2.4 mg", values: [0, -1.0, -1.6, -3.3, -5.1, -7.0, -8.9, -10.9, -11.7, -12.2] },
      placebo: { label: "安慰劑（生活型態）", values: [0, -0.4, -0.6, -1.3, -1.5, -1.9, -2.6, -3.2, -2.6, -2.2] },
    },
    responders: { 5: 80.5, 10: 60.4 }, // week 44, treatment policy
    responderWeek: 44,
  },
  surmount1: {
    name: "SURMOUNT-1",
    drug: "tirzepatide",
    cite: "Jastreboff AM, et al. N Engl J Med 2022;387:205–216（Figure 1B）",
    analysis: "持續用藥者的平均（efficacy estimand）",
    weeks: [0, 4, 8, 12, 16, 20, 24, 36, 48, 60, 72],
    arms: {
      d5: { label: "Tirzepatide 5 mg", values: [0, -3.2, -6.0, -7.9, -9.2, -10.5, -11.7, -13.7, -14.9, -15.9, -16.0] },
      d10: { label: "Tirzepatide 10 mg", values: [0, -3.4, -6.2, -8.8, -11.1, -12.8, -14.3, -17.5, -19.4, -20.9, -21.4] },
      d15: { label: "Tirzepatide 15 mg", values: [0, -3.2, -5.8, -8.4, -10.6, -12.6, -14.7, -18.4, -20.6, -22.0, -22.5] },
      placebo: { label: "安慰劑（生活型態）", values: [0, -1.1, -1.7, -2.1, -2.3, -2.4, -2.7, -3.0, -2.6, -2.6, -2.4] },
    },
    // week 72, treatment-regimen estimand (main Table 2), per dose
    responders: {
      5: { d5: 85.1, d10: 88.9, d15: 90.9 },
      10: { d5: 68.5, d10: 78.1, d15: 83.5 },
      15: { d5: 48.0, d10: 66.6, d15: 70.6 },
      20: { d5: 30.0, d10: 50.1, d15: 56.7 },
    },
    responderWeek: 72,
  },
  step4: {
    name: "STEP 4",
    drug: "semaglutide",
    cite: "Rubino D, et al. JAMA 2021;325:1414–1425（Supplement 1 eFigure 3，與正文 Figure 2C 相符）",
    analysis: "實際觀察平均；第 0–20 週所有人都用藥，第 20 週後隨機分組",
    weeks: [0, 4, 8, 12, 16, 20, 24, 28, 36, 44, 52, 60, 68],
    arms: {
      drug: { label: "繼續用藥", values: [0, -2.3, -4.4, -6.4, -8.4, -10.4, -11.8, -13.2, -15.0, -16.4, -17.2, -17.6, -17.6] },
      placebo: { label: "第 20 週改用安慰劑（停藥）", values: [0, -2.3, -4.4, -6.4, -8.4, -10.7, -10.2, -9.6, -8.6, -7.4, -6.8, -6.4, -5.2] },
    },
    switchWeek: 20,
  },
  maintain: {
    name: "SURMOUNT-MAINTAIN",
    drug: "tirzepatide",
    cite: "Horn DB, et al. Lancet 2026;407:2305–2318（Figure 3B）",
    analysis: "持續用藥者的平均；第 0–60 週所有人用最高可耐受劑量，第 60 週後隨機分組",
    weeks: [0, 8, 16, 24, 36, 48, 60, 72, 84, 96, 104, 112],
    arms: {
      drug: { label: "繼續原劑量", values: [0, -5.3, -10.0, -14.2, -17.9, -20.3, -21.7, -22.3, -22.4, -22.3, -22.4, -22.4] },
      d5: { label: "降到 5 mg", values: [0, -5.3, -10.0, -14.2, -17.9, -20.3, -21.7, -20.0, -18.8, -17.7, -17.5, -17.0] },
      placebo: { label: "改用安慰劑（停藥）", values: [0, -5.3, -10.0, -14.2, -17.9, -20.3, -21.7, -15.9, -12.3, -10.5, -10.1, -10.1] },
    },
    switchWeek: 60,
  },
};

// Dose-escalation schedules used in the trials (protocols / methods). Educational only.
const TITRATION = {
  semaglutide: {
    brand: "週纖達（Wegovy®）",
    steps: [
      { mg: 0.25, from: 0, to: 4 },
      { mg: 0.5, from: 4, to: 8 },
      { mg: 1.0, from: 8, to: 12 },
      { mg: 1.7, from: 12, to: 16 },
      { mg: 2.4, from: 16, to: null },
    ],
    doses: [0.25, 0.5, 1.0, 1.7, 2.4],
    maintenanceWeek: 16,
  },
  tirzepatide: {
    brand: "猛健樂（Mounjaro®）",
    steps: [
      { mg: 2.5, from: 0, to: 4 },
      { mg: 5, from: 4, to: 8 },
      { mg: 7.5, from: 8, to: 12 },
      { mg: 10, from: 12, to: 16 },
      { mg: 12.5, from: 16, to: 20 },
      { mg: 15, from: 20, to: null },
    ],
    doses: [2.5, 5, 7.5, 10, 12.5, 15],
    maintenanceWeek: 20,
  },
};

// Linear interpolation of a curve at week w (null outside the curve).
function curveAt(weeks, values, w) {
  if (w < weeks[0] || w > weeks[weeks.length - 1]) return null;
  for (let i = 1; i < weeks.length; i += 1) {
    if (w <= weeks[i]) {
      const t = (w - weeks[i - 1]) / (weeks[i] - weeks[i - 1]);
      return values[i - 1] + t * (values[i] - values[i - 1]);
    }
  }
  return values[values.length - 1];
}

// ---- Small SVG line-chart renderer shared by the guide and the weight tool ----
// spec: { series: [{ points:[[x,y]], cls, label?, dots? }], vlines: [{ x, label }], xLabel, yMin?, yMax?, xMax? }
function drawLineChart(box, spec) {
  box.innerHTML = "";
  const NS = "http://www.w3.org/2000/svg";
  const W = Math.max(280, Math.min(900, Math.round(box.clientWidth - 16) || 640));
  const narrow = W < 520;
  const H = narrow ? 250 : 300;
  const M = { l: 44, r: narrow ? 10 : 16, t: 18, b: 34 };
  const all = spec.series.flatMap((s) => s.points);
  const xMax = spec.xMax ?? Math.max(4, ...all.map((p) => p[0]));
  let yMin = spec.yMin ?? Math.min(-2, ...all.map((p) => p[1]));
  let yMax = spec.yMax ?? Math.max(1, ...all.map((p) => p[1]));
  const range = yMax - yMin;
  const step = range <= 4 ? 1 : range <= 10 ? 2 : 5;
  yMin = Math.floor((yMin - 0.5) / step) * step;
  yMax = Math.ceil((yMax + 0.5) / step) * step;
  const xStep = xMax <= 8 ? 1 : xMax <= 26 ? 4 : narrow || xMax > 80 ? 24 : 12;
  const sx = (x) => M.l + (x / xMax) * (W - M.l - M.r);
  const sy = (y) => M.t + ((yMax - y) / (yMax - yMin)) * (H - M.t - M.b);
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("class", "weight-chart");
  svg.setAttribute("role", "img");
  if (spec.ariaLabel) svg.setAttribute("aria-label", spec.ariaLabel);
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
  for (let x = 0; x <= xMax; x += xStep) add("text", { x: sx(x), y: H - M.b + 20, class: "tick", "text-anchor": "middle" }, `${x}`);
  add("text", { x: W - M.r, y: H - 4, class: "tick", "text-anchor": "end" }, spec.xLabel || "週");
  (spec.vlines || []).forEach((v, i) => {
    add("line", { x1: sx(v.x), x2: sx(v.x), y1: M.t, y2: H - M.b, class: "vline" });
    // Stagger labels on three rows so close dose changes do not overlap.
    if (v.label) add("text", { x: sx(v.x) + 4, y: M.t + 10 + (i % 3) * 13, class: "vline-label" }, v.label);
  });
  spec.series.forEach((s) => {
    if (s.points.length > 1) add("polyline", { points: s.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" "), class: s.cls });
    if (s.dots) {
      s.points.forEach(([x, y, title]) => {
        const dot = add("circle", { cx: sx(x), cy: sy(y), r: s.points.length > 8 ? 3 : 4.5, class: "you-dot" });
        if (title) {
          const t = document.createElementNS(NS, "title");
          t.textContent = title;
          dot.appendChild(t);
        }
      });
    }
    if (s.label && s.points.length) {
      const [lx, ly] = s.points[s.points.length - 1];
      add("text", { x: sx(lx) - 4, y: sy(ly) - 6, class: "series-label", "text-anchor": "end" }, s.label);
    }
  });
  box.appendChild(svg);
}

// Guide pages: <div class="chart-box" data-trial-chart="step1|surmount1|step12|step4|maintain"></div>
function trialSeries(key) {
  const trial = TRIALS[key];
  return Object.entries(trial.arms).map(([arm, a]) => {
    let cls = "ref-line-drug";
    if (arm === "placebo") cls = "ref-line-placebo";
    else if (key === "surmount1") cls = `ref-line-drug ${arm}`;
    else if (arm === "d5") cls = "ref-line-mid";
    return {
      points: trial.weeks.map((w, i) => [w, a.values[i]]),
      cls,
      legend: `${a.label}：第 ${trial.weeks[trial.weeks.length - 1]} 週 ${a.values[a.values.length - 1]}%`,
    };
  });
}

function initGuideCharts() {
  const boxes = [...document.querySelectorAll("[data-trial-chart]")];
  if (!boxes.length) return;
  const render = () =>
    boxes.forEach((box) => {
      const key = box.dataset.trialChart;
      const trial = TRIALS[key];
      const series = trialSeries(key);
      drawLineChart(box, {
        series,
        vlines: trial.switchWeek ? [{ x: trial.switchWeek, label: "隨機分組" }] : [],
        ariaLabel: `${trial.name} 平均體重變化`,
      });
      let legend = box.nextElementSibling;
      if (!legend || !legend.classList.contains("trial-legend")) {
        legend = document.createElement("div");
        legend.className = "chart-legend trial-legend";
        box.after(legend);
      }
      legend.innerHTML = "";
      series.forEach((s) => {
        const item = document.createElement("span");
        const swatch = document.createElement("i");
        swatch.className = `lg ${s.cls}`;
        const text = document.createElement("span");
        text.textContent = s.legend;
        item.append(swatch, text);
        legend.append(item);
      });
    });
  render();
  document.querySelectorAll("[data-tabs-for]").forEach((group) => {
    const box = document.getElementById(group.dataset.tabsFor);
    group.querySelectorAll("[data-chart-tab]").forEach((button) =>
      button.addEventListener("click", () => {
        box.dataset.trialChart = button.dataset.chartTab;
        group.querySelectorAll("[data-chart-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
        render();
      })
    );
  });
  let last = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === last) return;
    last = window.innerWidth;
    render();
  });
}

document.addEventListener("DOMContentLoaded", initGuideCharts);
