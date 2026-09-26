// Shared behaviour for every page: language toggle, mobile menu, article table of contents.
// Language is stored only in this browser. Each page sets <html data-lang> in an inline
// <head> script before first paint, so there is no flash of the wrong language.

const LANG_KEY = "supplescience-lang";

function getLang() {
  return document.documentElement.dataset.lang === "en" ? "en" : "zh";
}

function setLang(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (error) {
    // Storage can be blocked (private mode); the toggle still works for this page view.
  }
  applyLang(lang);
  document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
}

function applyLang(lang) {
  const root = document.documentElement;
  root.dataset.lang = lang;
  root.lang = lang === "en" ? "en" : "zh-Hant";
  const title = lang === "en" ? root.dataset.titleEn : root.dataset.titleZh;
  if (title) document.title = title;
  document.querySelectorAll(".lang-toggle").forEach((button) => {
    button.textContent = lang === "en" ? "中文" : "EN";
    button.setAttribute("aria-label", lang === "en" ? "切換到繁體中文" : "Switch to English");
  });
}

function initMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("siteNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

// Highlights the table-of-contents entry for the section currently on screen.
function initToc() {
  const links = [...document.querySelectorAll(".toc a[href^='#']")];
  if (!links.length || !("IntersectionObserver" in window)) return;
  const byId = new Map(links.map((link) => [link.getAttribute("href").slice(1), link]));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.remove("is-active"));
        byId.get(entry.target.id)?.classList.add("is-active");
      });
    },
    { rootMargin: "-20% 0px -70% 0px" }
  );
  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

// Guides page: topic filter chips. The chosen topic is kept in the URL (?topic=glp1)
// so topic cards on the home page can link straight to a filtered list.
function initGuideFilter() {
  const grid = document.getElementById("guideGrid");
  if (!grid) return;
  const cards = [...grid.querySelectorAll("[data-topic]")];
  const chips = [...document.querySelectorAll(".filter-chip")];
  document.querySelectorAll("[data-count]").forEach((node) => {
    const topic = node.dataset.count;
    const live = cards.filter((card) => !card.classList.contains("is-soon") && (topic === "all" || card.dataset.topic === topic));
    node.textContent = live.length;
  });
  const apply = (topic) => {
    if (!chips.some((chip) => chip.dataset.filter === topic)) topic = "all";
    chips.forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.filter === topic)));
    cards.forEach((card) => {
      card.hidden = topic !== "all" && card.dataset.topic !== topic;
    });
    const url = new URL(window.location.href);
    if (topic === "all") url.searchParams.delete("topic");
    else url.searchParams.set("topic", topic);
    history.replaceState(null, "", url);
  };
  chips.forEach((chip) => chip.addEventListener("click", () => apply(chip.dataset.filter)));
  apply(new URLSearchParams(window.location.search).get("topic") || "all");
}

document.addEventListener("DOMContentLoaded", () => {
  applyLang(getLang());
  document.querySelectorAll(".lang-toggle").forEach((button) => {
    button.addEventListener("click", () => setLang(getLang() === "en" ? "zh" : "en"));
  });
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
  initMenu();
  initToc();
  initGuideFilter();
  // Site search (header box). Logic lives in search.js so pages stay light until it is used.
  const search = document.createElement("script");
  search.src = "./search.js";
  search.defer = true;
  document.head.appendChild(search);
});
