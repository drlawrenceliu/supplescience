// 營養計算機 on the GLP-1 part 3 guide: protein (tab 1) and daily calories (tab 2).
// Pure arithmetic in the browser; nothing is stored or sent.
// Protein: 1 portion of 豆魚蛋肉類 ≈ 7 g protein (國民健康署 food exchange list).
// Calories: ① 國民健康署 method — kcal per kg of CURRENT weight by BMI status × workload;
// ② Mifflin–St Jeor × FAO/WHO/UNU PAL. For weight loss, about 500 kcal/day less, never below 1,200 kcal/day.

const GRAMS_PER_PORTION = 7;
const MEALS = 3;

// [low, high] kcal per kg current body weight
const KCAL_PER_KG = {
  under: { light: [35, 35], moderate: [40, 40], heavy: [45, 45] },
  normal: { light: [30, 30], moderate: [35, 35], heavy: [40, 40] },
  over: { light: [20, 25], moderate: [30, 30], heavy: [35, 35] },
};
const MIN_KCAL = 1200;
const DEFICIT = 500;

function roundHalf(value) {
  return Math.round(value * 2) / 2;
}

function formatRange(low, high, digits = 0) {
  const a = String(Number(low.toFixed(digits)));
  const b = String(Number(high.toFixed(digits)));
  return a === b ? a : `${a}–${b}`;
}

const roundKcal = (n) => Math.round(n);
const kcalRange = (lo, hi) => (lo === hi ? `${lo.toLocaleString()}` : `${lo.toLocaleString()}–${hi.toLocaleString()}`);

function initTabs() {
  const tabs = [...document.querySelectorAll("[data-calc-tab]")];
  const panels = [...document.querySelectorAll("[data-calc-panel]")];
  if (!tabs.length) return;
  const show = (name) => {
    tabs.forEach((t) => {
      const on = t.dataset.calcTab === name;
      t.setAttribute("aria-selected", String(on));
      t.setAttribute("aria-pressed", String(on));
    });
    panels.forEach((p) => (p.hidden = p.dataset.calcPanel !== name));
  };
  tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.calcTab)));
  const fromHash = () => {
    if (location.hash === "#calorie-calc") {
      show("calorie");
      document.getElementById("protein-calc").scrollIntoView({ block: "start" });
    }
  };
  fromHash();
  window.addEventListener("hashchange", fromHash);
}

function initProtein() {
  const weight = document.getElementById("proteinWeight");
  const goal = document.getElementById("proteinGoal");
  const result = document.getElementById("proteinResult");
  if (!weight || !goal || !result) return;

  function render() {
    const kg = Number(weight.value);
    if (!kg || kg < 30 || kg > 250) {
      result.innerHTML = '<p class="calc-empty">輸入 30–250 公斤之間的體重後，這裡會顯示每天與每餐的建議量。</p>';
      return;
    }
    const [lowPerKg, highPerKg] = goal.value.split("-").map(Number);
    const dayLow = Math.round(kg * lowPerKg);
    const dayHigh = Math.round(kg * highPerKg);
    const mealLow = dayLow / MEALS;
    const mealHigh = dayHigh / MEALS;
    const portionLow = roundHalf(mealLow / GRAMS_PER_PORTION);
    const portionHigh = roundHalf(mealHigh / GRAMS_PER_PORTION);
    result.innerHTML = `
      <div class="calc-stats">
        <div><span class="calc-label">每天</span><strong>${formatRange(dayLow, dayHigh)}</strong><span class="calc-unit">公克蛋白質</span></div>
        <div><span class="calc-label">每餐（分 3 餐）</span><strong>${formatRange(mealLow, mealHigh)}</strong><span class="calc-unit">公克</span></div>
        <div><span class="calc-label">每餐約</span><strong>${formatRange(portionLow, portionHigh, portionLow % 1 || portionHigh % 1 ? 1 : 0)}</strong><span class="calc-unit">份豆魚蛋肉類</span></div>
      </div>
      <p class="calc-example">1 份約等於：1 顆蛋、1 小杯（190 mL）無糖豆漿、3 小格傳統豆腐，或約 1 兩魚肉、雞肉。</p>`;
  }

  weight.addEventListener("input", render);
  goal.addEventListener("change", render);
  document.getElementById("proteinForm").addEventListener("submit", (event) => event.preventDefault());
  render();
}

// Mifflin–St Jeor resting energy (Mifflin 1990) × FAO/WHO/UNU (2004) physical activity level ranges.
const PAL = { light: [1.4, 1.69], moderate: [1.7, 1.99], heavy: [2.0, 2.4] };
const mifflin = (sex, kg, cm, age) => 10 * kg + 6.25 * cm - 5 * age + (sex === "m" ? 5 : -161);
const round10 = (n) => Math.round(n / 10) * 10;

function initCalorie() {
  const height = document.getElementById("calHeight");
  const weight = document.getElementById("calWeight");
  const age = document.getElementById("calAge");
  const lose = document.getElementById("calLose");
  const result = document.getElementById("calorieResult");
  if (!height || !weight || !result) return;
  const form = document.getElementById("calorieForm");
  const LABEL = { light: "輕度工作", moderate: "中度工作", heavy: "重度工作" };

  function render() {
    const cm = Number(height.value);
    const kg = Number(weight.value);
    const years = Number(age.value);
    const sex = form.querySelector('input[name="calSex"]:checked')?.value || "";
    if (!(cm >= 120 && cm <= 220) || !(kg >= 30 && kg <= 250)) {
      result.innerHTML = '<p class="calc-empty">輸入身高（120–220 公分）與體重（30–250 公斤）後，這裡會顯示你一天大約需要多少熱量。</p>';
      return;
    }
    if (age.value && years < 18) {
      result.innerHTML = '<p class="calc-warn">這個計算機只適用於 18 歲以上的成人。兒童與青少年的熱量需求與成長有關，請和醫師或營養師討論。</p>';
      return;
    }
    const activity = form.querySelector('input[name="calActivity"]:checked').value;
    const bmi = kg / (cm / 100) ** 2;
    const status = bmi < 18.5 ? "under" : bmi < 24 ? "normal" : "over";
    const statusLabel = bmi < 18.5 ? "體重過輕" : bmi < 24 ? "健康體位" : bmi < 27 ? "過重" : bmi < 30 ? "輕度肥胖" : bmi < 35 ? "中度肥胖" : "重度肥胖";
    const [lo, hi] = KCAL_PER_KG[status][activity];
    const hpa = [roundKcal(kg * lo), roundKcal(kg * hi)];

    const hasMifflin = (sex === "m" || sex === "f") && years >= 18 && years <= 100;
    let mif = null;
    if (hasMifflin) {
      const rmr = mifflin(sex, kg, cm, years);
      mif = { rmr: round10(rmr), range: PAL[activity].map((p) => round10(rmr * p)) };
    }
    const clampLow = (range) => range.map((n) => Math.max(MIN_KCAL, n));
    let summaryLabel;
    let summary;
    let summaryNote = "";
    let extra = "";

    if (lose.checked && status === "under") {
      extra = '<p class="calc-warn">你的 BMI 屬於體重過輕，不建議再減重。如果體重持續下降，請和醫師討論。</p>';
    } else if (lose.checked && status === "normal") {
      extra = '<p class="calc-warn">你的 BMI 在健康範圍，通常不需要刻意減重。若腰圍超標（男性 ≥90、女性 ≥80 公分），可以從飲食品質與活動量開始調整，而不是大幅減少熱量。</p>';
    }

    if (status === "over" && lose.checked) {
      // ① is already a weight-control intake for overweight people; ② is maintenance, so subtract ~500.
      const parts = mif ? [...hpa, ...mif.range.map((n) => n - DEFICIT)] : hpa;
      const raw = [Math.min(...parts), Math.max(...parts)];
      summary = clampLow(raw);
      summaryLabel = "減重時每天約";
      summaryNote = `對過重或肥胖的人，國健署的建議量本身就是控制體重的攝取量${mif ? "；公式估算的是維持體重的消耗，所以再減約 500 大卡" : ""}。${raw[0] < MIN_KCAL ? "已調整為不低於 1,200 大卡。" : ""}控制體重時，每天攝取不要低於 1,200 大卡。建議從範圍中較高的數字開始，依兩到三週的體重變化再調整，大約每週減 0.5 公斤是合理的速度。`;
      extra += '<p class="calc-example">正在使用 GLP-1 類減重藥物的人，常常吃得比這個還少。重點是先吃夠蛋白質（切換到「蛋白質」計算），不要刻意吃得更少。</p>';
    } else if (status === "over") {
      summary = mif ? mif.range : hpa;
      summaryLabel = mif ? "維持目前體重大約需要" : "國健署建議每天攝取";
      summaryNote = mif
        ? "這是維持目前體重的估算。國健署對過重或肥胖者的建議量（①）比較低，是以控制體重為目標。"
        : "國健署對過重或肥胖者的建議量，是以控制體重為目標。填寫性別與年齡，可以看到維持目前體重的估算。";
    } else {
      const all = mif ? [...hpa, ...mif.range] : hpa;
      summary = [Math.min(...all), Math.max(...all)];
      summaryLabel = "每天大約需要（參考範圍）";
      summaryNote = mif ? "兩種方法的差距，反映了公式本身的不確定性。" : "填寫性別與年齡，可以看到第二種估算。";
    }

    const mifCard = mif
      ? `<div><span class="calc-label">② 公式估算・維持體重的消耗</span><strong>${kcalRange(mif.range[0], mif.range[1])}</strong><span class="calc-unit">大卡（Mifflin–St Jeor，靜止代謝約 ${mif.rmr.toLocaleString()}）</span></div>`
      : `<div class="calc-missing"><span class="calc-label">② 公式估算・維持體重的消耗</span><span class="calc-unit">填寫性別與年齡後顯示</span></div>`;

    result.innerHTML = `
      <div class="calc-stats">
        <div><span class="calc-label">BMI</span><strong>${bmi.toFixed(1)}</strong><span class="calc-unit">${statusLabel}</span></div>
        <div><span class="calc-label">① 國健署建議攝取（${LABEL[activity]}）</span><strong>${kcalRange(hpa[0], hpa[1])}</strong><span class="calc-unit">大卡（${lo === hi ? lo : `${lo}–${hi}`} × ${kg} 公斤）</span></div>
        ${mifCard}
      </div>
      <div class="calc-stats single combined">
        <div><span class="calc-label">${summaryLabel}</span><strong>${kcalRange(summary[0], summary[1])}</strong><span class="calc-unit">大卡</span></div>
      </div>
      <p class="calc-example">${summaryNote}${mif ? "歐美發展的公式用在亞洲人身上可能略為高估。" : ""}</p>${extra}`;
  }

  [height, weight, age].forEach((el) => el.addEventListener("input", render));
  form.addEventListener("change", render);
  form.addEventListener("submit", (event) => event.preventDefault());
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initProtein();
  initCalorie();
});
