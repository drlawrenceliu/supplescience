// Site search for a static site: no server, nothing sent anywhere.
// On first use it fetches the pages listed in SEARCH_PAGES, splits them into sections (h2),
// and searches titles, headings and text in the current language.
// When you add a guide or tool page, add it to SEARCH_PAGES.

(function () {
  const SEARCH_PAGES = [
    "guide-glp1.html",
    "guide-glp1-safety.html",
    "guide-glp1-lifestyle.html",
    "guide-fish-oil.html",
    "guide-red-yeast-rice.html",
    "weight.html",
    "lookup.html",
    "visit-prep.html",
    "reset.html",
    "tools.html",
  ];

  // Everyday words readers type → words used on the site.
  const SYNONYMS = {
    減肥: ["減重", "體重"],
    瘦身: ["減重", "體重"],
    瘦瘦針: ["GLP-1", "semaglutide", "tirzepatide"],
    減肥針: ["GLP-1", "semaglutide", "tirzepatide"],
    減重針: ["GLP-1", "semaglutide", "tirzepatide"],
    瘦瘦筆: ["GLP-1"],
    猛健樂: ["tirzepatide", "猛健樂"],
    週纖達: ["semaglutide", "週纖達"],
    胰妥讚: ["semaglutide", "胰妥讚"],
    omega: ["魚油", "omega-3"],
    維他命: ["維生素"],
    膽固醇: ["膽固醇", "LDL", "紅麴"],
    肌肉: ["肌肉", "肌力"],
    副作用: ["副作用", "噁心", "腸胃"],
    運動: ["運動", "活動", "肌力"],
    復胖: ["復胖", "回升", "停藥"],
    胖回來: ["回升", "停藥"],
    漏打: ["忘記", "漏打"],
  };

  const lang = () => (document.documentElement.dataset.lang === "en" ? "en" : "zh");
  const t = (zh, en) => (lang() === "en" ? en : zh);
  const norm = (s) => s.toLowerCase().replace(/\s+/g, "");
  const cache = {};

  // ---------- UI ----------
  const actions = document.querySelector(".header-actions");
  if (!actions) return;
  const form = document.createElement("form");
  form.className = "site-search";
  form.setAttribute("role", "search");
  form.innerHTML = `
    <button class="search-icon" type="button" aria-label="搜尋" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>
    </button>
    <div class="search-field">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>
      <input type="search" autocomplete="off" spellcheck="false" aria-label="搜尋本站" aria-controls="searchResults" />
      <kbd class="search-kbd" aria-hidden="true">/</kbd>
    </div>
    <div class="search-results" id="searchResults" role="listbox" hidden></div>`;
  actions.insertBefore(form, actions.firstChild);
  const input = form.querySelector("input");
  const results = form.querySelector(".search-results");
  const iconBtn = form.querySelector(".search-icon");
  const setPlaceholder = () => (input.placeholder = t("搜尋：魚油、GLP-1、蛋白質…", "Search: fish oil, GLP-1, protein…"));
  setPlaceholder();
  document.addEventListener("langchange", () => {
    setPlaceholder();
    if (input.value.trim()) run();
  });

  let active = -1;
  let items = [];

  function open() {
    form.classList.add("is-open");
    iconBtn.setAttribute("aria-expanded", "true");
    input.focus();
    if (input.value.trim()) run();
  }
  function close() {
    form.classList.remove("is-open");
    iconBtn.setAttribute("aria-expanded", "false");
    results.hidden = true;
    active = -1;
  }
  iconBtn.addEventListener("click", () => (form.classList.contains("is-open") ? close() : open()));
  input.addEventListener("focus", () => {
    form.classList.add("is-focused");
    if (input.value.trim()) run();
    else loadIndex(); // warm up
  });
  input.addEventListener("blur", () => form.classList.remove("is-focused"));
  document.addEventListener("click", (e) => {
    if (!form.contains(e.target)) {
      results.hidden = true;
      if (window.matchMedia("(max-width: 760px)").matches && !input.value) close();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      open();
    }
    if (e.key === "Escape" && (form.contains(document.activeElement) || !results.hidden)) {
      close();
      input.blur();
    }
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!items.length) return;
      active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items.forEach((a, i) => a.classList.toggle("is-active", i === active));
      items[active].scrollIntoView({ block: "nearest" });
    }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const target = items[active >= 0 ? active : 0];
    if (target) target.click();
  });
  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(run, 120);
  });

  // ---------- Index ----------
  function loadLookupData() {
    if (typeof SUPPLEMENTS !== "undefined") return Promise.resolve();
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "./lookup.js";
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  function sectionsFrom(url, html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const other = lang() === "en" ? "zh-Hant" : "en";
    doc.querySelectorAll(`script, style, [lang="${other}"], sup, .refs, .toc, .site-header, .site-footer, .skip-link, .draft-banner, #safety`).forEach((n) => {
      if (n !== doc.documentElement) n.remove();
    });
    // Keep words from neighbouring cells / list items apart in snippets.
    doc.querySelectorAll("td, th, li, p, h3, dt, dd").forEach((n) => n.append(" "));
    const main = doc.querySelector("main") || doc.body;
    const pageTitle = (doc.querySelector("h1")?.textContent || doc.title).replace(/\s+/g, " ").trim();
    const dek = doc.querySelector(".article-dek")?.textContent.trim() || "";
    const out = [{ url, page: pageTitle, heading: "", text: dek }];
    main.querySelectorAll("h2").forEach((h) => {
      if (["kp", "refs-title"].includes(h.id) || h.closest(".safety")) return;
      const anchorEl = h.id ? h : h.closest("[id]");
      const anchor = anchorEl && anchorEl.id !== "main" ? `#${anchorEl.id}` : "";
      const heading = h.cloneNode(true);
      heading.querySelectorAll(".num, .step").forEach((n) => n.remove());
      let text = "";
      for (let n = h.nextElementSibling; n && n.tagName !== "H2" && text.length < 2500; n = n.nextElementSibling) {
        if (n.querySelector && n.querySelector("h2")) break;
        text += " " + n.textContent;
      }
      if (!text.trim() && h.parentElement) text = h.parentElement.textContent.replace(h.textContent, "");
      out.push({ url: url + anchor, page: pageTitle, heading: heading.textContent.replace(/\s+/g, " ").trim(), text: text.replace(/\s+/g, " ").trim() });
    });
    return out;
  }

  function loadIndex() {
    const key = lang();
    if (!cache[key]) {
      cache[key] = Promise.all([
        loadLookupData(),
        ...SEARCH_PAGES.map((url) =>
          fetch(url)
            .then((r) => (r.ok ? r.text() : ""))
            .then((html) => (html ? sectionsFrom(url, html) : []))
            .catch(() => [])
        ),
      ]).then((parts) => parts.slice(1).flat());
    }
    return cache[key];
  }

  // ---------- Search ----------
  function expand(term) {
    const alts = new Set([term]);
    Object.entries(SYNONYMS).forEach(([k, v]) => {
      if (norm(term).includes(norm(k))) v.forEach((x) => alts.add(x));
    });
    return [...alts].map(norm);
  }

  function score(entry, groups) {
    const title = norm(entry.page);
    const heading = norm(entry.heading);
    const text = norm(entry.text);
    let total = 0;
    for (const alts of groups) {
      let best = 0;
      alts.forEach((a) => {
        if (!a) return;
        let s = 0;
        if (heading.includes(a)) s += 6;
        if (title.includes(a)) s += 4;
        if (text.includes(a)) s += 1 + Math.min(3, text.split(a).length - 2) * 0.3;
        best = Math.max(best, s);
      });
      if (!best) return 0; // every term (or a synonym) must match
      total += best;
    }
    return total;
  }

  function bigramScore(entry, q) {
    const grams = [];
    for (let i = 0; i < q.length - 1; i += 1) grams.push(q.slice(i, i + 2));
    if (!grams.length) return 0;
    const hay = norm(entry.page + entry.heading + entry.text);
    const hits = grams.filter((g) => hay.includes(g)).length;
    return hits / grams.length >= 0.6 ? hits : 0;
  }

  function snippet(text, terms) {
    const low = text.toLowerCase();
    let at = -1;
    let len = 0;
    terms.flat().forEach((term) => {
      if (at >= 0 || !term) return;
      const i = low.replace(/\s+/g, "").indexOf(term);
      if (i >= 0) {
        // map index in space-less text back to original text
        let seen = 0;
        for (let j = 0; j < text.length; j += 1) {
          if (!/\s/.test(text[j])) {
            if (seen === i) { at = j; break; }
            seen += 1;
          }
        }
        len = term.length;
      }
    });
    if (at < 0) return { before: text.slice(0, 70), match: "", after: text.length > 70 ? "…" : "" };
    const start = Math.max(0, at - 28);
    return {
      before: (start > 0 ? "…" : "") + text.slice(start, at),
      match: text.slice(at, at + len),
      after: text.slice(at + len, at + len + 50) + (at + len + 50 < text.length ? "…" : ""),
    };
  }

  function resultLink(href, kicker, title, snip) {
    const a = document.createElement("a");
    a.className = "search-hit";
    a.href = href;
    a.setAttribute("role", "option");
    const k = document.createElement("span");
    k.className = "search-kicker";
    k.textContent = kicker;
    const tt = document.createElement("span");
    tt.className = "search-title";
    tt.textContent = title;
    a.append(k, tt);
    if (snip) {
      const p = document.createElement("span");
      p.className = "search-snippet";
      p.append(document.createTextNode(snip.before));
      if (snip.match) {
        const m = document.createElement("mark");
        m.textContent = snip.match;
        p.append(m);
      }
      p.append(document.createTextNode(snip.after));
      a.append(p);
    }
    a.addEventListener("click", () => {
      const [path, hash] = a.getAttribute("href").split("#");
      const here = location.pathname.split("/").pop() || "index.html";
      if (path === here && hash) setTimeout(close, 0);
    });
    return a;
  }

  async function run() {
    const raw = input.value.trim();
    results.innerHTML = "";
    items = [];
    active = -1;
    if (!raw) {
      results.hidden = true;
      return;
    }
    results.hidden = false;
    const loading = document.createElement("p");
    loading.className = "search-empty";
    loading.textContent = t("搜尋中…", "Searching…");
    results.append(loading);

    const index = await loadIndex();
    if (input.value.trim() !== raw) return; // user kept typing
    results.innerHTML = "";

    const terms = raw.split(/\s+/).filter(Boolean);
    const groups = terms.map(expand);
    let hits = index.map((e) => ({ e, s: score(e, groups) })).filter((h) => h.s > 0);
    if (!hits.length && terms.length === 1 && norm(raw).length >= 3) {
      hits = index.map((e) => ({ e, s: bigramScore(e, norm(raw)) })).filter((h) => h.s > 0);
    }
    hits.sort((a, b) => b.s - a.s);

    // Supplement shortcuts from the evidence lookup
    const q = norm(raw);
    const supps = typeof SUPPLEMENTS === "undefined" ? [] : SUPPLEMENTS.filter((s) => [s.name, s.en, ...s.aliases].some((a) => { const n = norm(a); return n.includes(q) || (q.length >= 2 && q.includes(n)); }));
    supps.slice(0, 2).forEach((s) => {
      const grades = s.claims.map((c) => c.grade).join(" / ");
      items.push(resultLink(`./lookup.html?q=${encodeURIComponent(s.name)}`, t("實證速查", "Evidence lookup"), `${s.name}：${grades}`, { before: s.claims[0].claim, match: "", after: "" }));
    });

    const seen = new Set();
    hits.forEach(({ e }) => {
      if (items.length >= 8 || seen.has(e.url)) return;
      seen.add(e.url);
      const snip = snippet(e.text || e.heading, groups);
      items.push(resultLink(`./${e.url}`, e.heading ? e.page : t("頁面", "Page"), e.heading || e.page, snip));
    });

    if (!items.length) {
      const p = document.createElement("p");
      p.className = "search-empty";
      p.textContent = t("找不到相關內容。試試：魚油、紅麴、GLP-1、副作用、蛋白質、肌力訓練", "No results. Try: fish oil, red yeast rice, GLP-1, protein");
      results.append(p);
      const all = document.createElement("a");
      all.className = "search-all";
      all.href = "./guides.html";
      all.textContent = t("查看全部指南 →", "See all guides →");
      results.append(all);
      return;
    }
    items.forEach((a) => results.append(a));
  }
})();
