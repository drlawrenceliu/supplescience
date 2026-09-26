// Protein calculator on the GLP-1 part 2 guide. Pure arithmetic in the browser; nothing is stored.
// 1 portion of 豆魚蛋肉類 ≈ 7 g protein (國民健康署 food exchange list).

const GRAMS_PER_PORTION = 7;
const MEALS = 3;

function roundHalf(value) {
  return Math.round(value * 2) / 2;
}

function formatRange(low, high, digits = 0) {
  const a = String(Number(low.toFixed(digits)));
  const b = String(Number(high.toFixed(digits)));
  return a === b ? a : `${a}–${b}`;
}

document.addEventListener("DOMContentLoaded", () => {
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
});
