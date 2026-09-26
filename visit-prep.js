// 看診準備單 — everything is saved only in this browser (localStorage). Nothing is uploaded.
// The printable sheet is rebuilt into #prepPrint just before printing.

const PREP_KEY = "supplescience-visitprep-v1";

const QUESTION_GROUPS = [
  {
    id: "general",
    title: "一般",
    guide: null,
    questions: [
      ["g1", "我目前吃的藥物和保健食品，有沒有會互相影響的？"],
      ["g2", "我正在吃的保健食品，需要繼續嗎？"],
      ["g3", "這次的檢查結果中，我最需要注意哪一項？"],
      ["g4", "下次什麼時候回診？回診前需要做哪些檢查？"],
      ["g5", "出現哪些症狀時，我應該提早回診或去急診？"],
    ],
  },
  {
    id: "glp1",
    title: "GLP-1 與體重管理",
    guide: "./guide-glp1-safety.html#questions",
    questions: [
      ["w1", "以我的 BMI 與健康狀況，是否適合使用 GLP-1 類藥物？"],
      ["w2", "我可以預期多少效果？多久評估一次，達到什麼程度算有效？"],
      ["w3", "我目前的降血糖藥需要調整嗎？"],
      ["w4", "出現噁心、嘔吐等副作用時，我該怎麼處理？"],
      ["w5", "每個月的費用大概多少？我是否符合健保給付條件？"],
      ["w6", "預計使用多久？如果未來要減量或停藥，要怎麼安排？"],
      ["w7", "我每天大約需要多少蛋白質？需要轉介營養師或運動專業人員嗎？"],
    ],
  },
  {
    id: "lipids",
    title: "血脂與保健食品",
    guide: "./guide-fish-oil.html",
    questions: [
      ["l1", "我的 LDL 目標是多少？目前達標了嗎？"],
      ["l2", "我適合使用處方級高純度 EPA 嗎？在台灣能取得嗎？"],
      ["l3", "我吃的魚油會不會和抗血小板或抗凝血藥物互相影響？"],
      ["l4", "如果我想先嘗試紅麴，多久要回來抽血確認？"],
      ["l5", "我之前吃 statin 有肌肉痠痛，還有哪些經過證實的替代藥物？"],
    ],
  },
];

const MED_TYPES = [
  ["rx", "處方藥"],
  ["otc", "成藥"],
  ["supp", "保健食品"],
];

const questionText = new Map(QUESTION_GROUPS.flatMap((group) => group.questions));

let prep = loadPrep();

function emptyPrep() {
  return { date: "", dept: "", checked: [], custom: [], meds: [{ name: "", dose: "", type: "rx" }], notes: "" };
}

function loadPrep() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREP_KEY) || "null");
    if (saved && typeof saved === "object") {
      return {
        date: typeof saved.date === "string" ? saved.date : "",
        dept: typeof saved.dept === "string" ? saved.dept : "",
        checked: Array.isArray(saved.checked) ? saved.checked.filter((id) => questionText.has(id)) : [],
        custom: Array.isArray(saved.custom) ? saved.custom.filter((q) => typeof q === "string" && q.trim()) : [],
        meds: Array.isArray(saved.meds) && saved.meds.length ? saved.meds : emptyPrep().meds,
        notes: typeof saved.notes === "string" ? saved.notes : "",
      };
    }
  } catch (error) {
    console.warn("Could not read visit prep", error);
  }
  return emptyPrep();
}

function savePrep() {
  try {
    localStorage.setItem(PREP_KEY, JSON.stringify(prep));
  } catch (error) {
    console.warn("Could not save visit prep", error);
  }
  renderSummary();
}

function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function renderQuestionBank() {
  const bank = document.getElementById("questionBank");
  bank.innerHTML = "";
  QUESTION_GROUPS.forEach((group) => {
    const box = node("details", "question-group");
    box.open = group.id === "general" || group.questions.some(([id]) => prep.checked.includes(id));
    const summary = node("summary", "", group.title);
    box.append(summary);
    const list = node("div", "task-list");
    group.questions.forEach(([id, text]) => {
      const row = node("label", "task-item");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = prep.checked.includes(id);
      input.addEventListener("change", () => {
        prep.checked = input.checked ? [...prep.checked, id] : prep.checked.filter((x) => x !== id);
        savePrep();
      });
      row.append(input, node("span", "", text));
      list.append(row);
    });
    box.append(list);
    if (group.guide) {
      const more = node("a", "question-guide", "相關指南 →");
      more.href = group.guide;
      box.append(more);
    }
    bank.append(box);
  });
}

function renderCustom() {
  const list = document.getElementById("customList");
  list.innerHTML = "";
  prep.custom.forEach((question, index) => {
    const item = node("li", "custom-item");
    item.append(node("span", "", question));
    const remove = node("button", "text-button danger", "移除");
    remove.type = "button";
    remove.setAttribute("aria-label", `移除：${question}`);
    remove.addEventListener("click", () => {
      prep.custom.splice(index, 1);
      savePrep();
      renderCustom();
    });
    item.append(remove);
    list.append(item);
  });
}

function renderMeds() {
  const list = document.getElementById("medList");
  list.innerHTML = "";
  prep.meds.forEach((med, index) => {
    const row = node("div", "med-row");
    const name = document.createElement("input");
    name.type = "text";
    name.maxLength = 80;
    name.placeholder = "名稱，例如：魚油";
    name.value = med.name || "";
    name.setAttribute("aria-label", `第 ${index + 1} 項名稱`);
    const dose = document.createElement("input");
    dose.type = "text";
    dose.maxLength = 80;
    dose.placeholder = "劑量與用法，例如：早晚各 1 顆";
    dose.value = med.dose || "";
    dose.setAttribute("aria-label", `第 ${index + 1} 項劑量與用法`);
    const type = document.createElement("select");
    type.setAttribute("aria-label", `第 ${index + 1} 項類型`);
    MED_TYPES.forEach(([value, label]) => {
      const option = node("option", "", label);
      option.value = value;
      option.selected = med.type === value;
      type.append(option);
    });
    const update = () => {
      prep.meds[index] = { name: name.value, dose: dose.value, type: type.value };
      savePrep();
    };
    [name, dose].forEach((input) => input.addEventListener("input", update));
    type.addEventListener("change", update);
    const remove = node("button", "icon-button", "×");
    remove.type = "button";
    remove.setAttribute("aria-label", `刪除第 ${index + 1} 項`);
    remove.addEventListener("click", () => {
      prep.meds.splice(index, 1);
      if (!prep.meds.length) prep.meds.push({ name: "", dose: "", type: "rx" });
      savePrep();
      renderMeds();
    });
    row.append(name, dose, type, remove);
    list.append(row);
  });
}

function selectedQuestions() {
  return [...prep.checked.map((id) => questionText.get(id)), ...prep.custom];
}

function filledMeds() {
  return prep.meds.filter((med) => (med.name || "").trim());
}

function renderSummary() {
  const questions = selectedQuestions().length;
  const meds = filledMeds().length;
  document.getElementById("questionCount").textContent = `已選 ${questions} 題`;
  document.getElementById("prepSummary").textContent = `${questions} 個問題・${meds} 項藥物與保健食品`;
}

function buildPrintSheet() {
  const sheet = document.getElementById("prepPrint");
  sheet.innerHTML = "";
  const head = node("div", "print-head");
  head.append(node("h1", "", "看診準備單"));
  const meta = [prep.date && `看診日期：${prep.date}`, prep.dept && `科別：${prep.dept}`].filter(Boolean).join("　");
  head.append(node("p", "", meta || "看診日期：＿＿＿＿＿＿　科別：＿＿＿＿＿＿"));
  sheet.append(head);

  const section = (title) => {
    sheet.append(node("h2", "", title));
  };

  section("我想問的問題");
  const questions = selectedQuestions();
  if (questions.length) {
    const ol = node("ol");
    questions.forEach((q) => ol.append(node("li", "", q)));
    sheet.append(ol);
  } else {
    sheet.append(node("p", "print-muted", "（未填寫）"));
  }

  section("目前使用的藥物與保健食品");
  const meds = filledMeds();
  if (meds.length) {
    const table = node("table");
    const headRow = node("tr");
    ["名稱", "劑量與用法", "類型"].forEach((h) => headRow.append(node("th", "", h)));
    table.append(headRow);
    meds.forEach((med) => {
      const tr = node("tr");
      tr.append(node("td", "", med.name), node("td", "", med.dose || ""), node("td", "", (MED_TYPES.find(([v]) => v === med.type) || ["", ""])[1]));
      table.append(tr);
    });
    sheet.append(table);
  } else {
    sheet.append(node("p", "print-muted", "（未填寫）"));
  }

  if (prep.notes.trim()) {
    section("想讓醫師知道的事");
    sheet.append(node("p", "print-notes", prep.notes.trim()));
  }

  section("醫師建議（看診時記下）");
  const lines = node("div", "print-lines");
  for (let i = 0; i < 6; i += 1) lines.append(node("span"));
  sheet.append(lines);
  sheet.append(node("p", "print-foot", "實證補給 SuppleScience｜本表僅協助整理看診資訊，不能取代醫師的診斷與治療。"));
}

document.addEventListener("DOMContentLoaded", () => {
  const date = document.getElementById("prepDate");
  const dept = document.getElementById("prepDept");
  const notes = document.getElementById("prepNotes");
  date.value = prep.date;
  dept.value = prep.dept;
  notes.value = prep.notes;
  date.addEventListener("change", () => { prep.date = date.value; savePrep(); });
  dept.addEventListener("input", () => { prep.dept = dept.value; savePrep(); });
  notes.addEventListener("input", () => { prep.notes = notes.value; savePrep(); });

  document.getElementById("customForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("customInput");
    const text = input.value.trim();
    if (!text) return;
    prep.custom.push(text);
    input.value = "";
    savePrep();
    renderCustom();
  });
  document.getElementById("addMed").addEventListener("click", () => {
    prep.meds.push({ name: "", dose: "", type: "supp" });
    savePrep();
    renderMeds();
    const inputs = document.querySelectorAll("#medList .med-row input[type=text]");
    inputs[inputs.length - 2]?.focus();
  });
  document.getElementById("printPrep").addEventListener("click", () => {
    buildPrintSheet();
    window.print();
  });
  window.addEventListener("beforeprint", buildPrintSheet);
  document.getElementById("clearPrep").addEventListener("click", () => {
    if (!window.confirm("確定要清除這張看診準備單的所有內容嗎？")) return;
    try {
      localStorage.removeItem(PREP_KEY);
    } catch (error) {
      console.warn("Could not clear visit prep", error);
    }
    prep = emptyPrep();
    date.value = "";
    dept.value = "";
    notes.value = "";
    renderAll();
    document.getElementById("prepNote").textContent = "已清除。";
  });

  function renderAll() {
    renderQuestionBank();
    renderCustom();
    renderMeds();
    renderSummary();
  }
  renderAll();
});
