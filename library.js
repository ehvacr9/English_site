"use strict";

(() => {
  const entries = window.OXFORD_WORDS;
  const $ = (id) => document.getElementById(id);
  if (!Array.isArray(entries) || entries.length !== 3000) {
    console.error("Oxford vocabulary data is missing or incomplete.");
    $("library-error").textContent = "無法載入完整 Oxford 詞庫，請重新整理頁面或檢查網路。你仍可從側邊連結查閱原始 PDF。";
    $("library-error").hidden = false;
    $("results-status").textContent = "詞庫載入失敗";
    return;
  }

  const pageSize = 50;
  let pageNumber = 1;
  let filtered = entries;
  const normalize = (text) => text.toLowerCase().replaceAll("’", "'").trim().replace(/\s+/g, " ");
  const dictionaries = [
    { name: "Oxford", url: (term) => `https://www.oxfordlearnersdictionaries.com/search/english/?q=${encodeURIComponent(term)}` },
    { name: "Cambridge", url: (term) => `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(term.replaceAll(" ", "-"))}` },
    { name: "Longman", url: (term) => `https://www.ldoceonline.com/dictionary/${encodeURIComponent(term.replaceAll(" ", "-"))}` },
    { name: "Collins", url: (term) => `https://www.collinsdictionary.com/dictionary/english/${encodeURIComponent(term.replaceAll(" ", "-"))}` },
    { name: "Merriam-Webster", url: (term) => `https://www.merriam-webster.com/dictionary/${encodeURIComponent(term)}` }
  ];

  function externalLink(text, href, label) {
    const link = document.createElement("a");
    link.textContent = text;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `${label}（另開分頁）`);
    return link;
  }

  function render() {
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const start = (pageNumber - 1) * pageSize;
    const body = $("vocabulary-body");
    const fragment = document.createDocumentFragment();
    for (const entry of filtered.slice(start, start + pageSize)) {
      const row = document.createElement("tr");
      const word = document.createElement("th");
      word.scope = "row";
      const text = document.createElement("span");
      text.lang = "en";
      text.textContent = entry.word;
      word.append(text, externalLink(`PDF 第 ${entry.page} 頁 ↗`, `./The_Oxford_3000.pdf#page=${entry.page}`, `${entry.word}：Oxford PDF 第 ${entry.page} 頁`));
      const pos = document.createElement("td");
      const levels = document.createElement("td");
      for (const group of entry.groups) {
        const part = document.createElement("div");
        part.className = "pos-group";
        part.lang = "en";
        part.textContent = group.pos;
        const levelRow = document.createElement("div");
        levelRow.className = "level-group";
        const badge = document.createElement("span");
        badge.className = `level level-${group.level.toLowerCase()}`;
        badge.textContent = group.level;
        levelRow.append(badge);
        pos.append(part);
        levels.append(levelRow);
      }
      row.append(word, pos, levels);
      for (const dictionary of dictionaries) {
        const cell = document.createElement("td");
        for (const term of entry.terms) {
          cell.append(externalLink(`${dictionary.name}${entry.terms.length > 1 ? ` · ${term}` : ""} ↗`, dictionary.url(term), `${entry.word}：${dictionary.name} 查詢 ${term}`));
        }
        row.append(cell);
      }
      fragment.append(row);
    }
    if (!filtered.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 8;
      cell.className = "empty-results";
      cell.textContent = "沒有符合的詞條，請更換關鍵字、等級或清除篩選。";
      row.append(cell);
      fragment.append(row);
    }
    body.replaceChildren(fragment);
    $("results-status").textContent = filtered.length ? `共 ${filtered.length.toLocaleString("zh-TW")} 筆 · 顯示 ${start + 1}–${Math.min(start + pageSize, filtered.length)} 筆` : "共 0 筆符合條件";
    $("page-status").textContent = `${pageNumber} / ${pages} 頁`;
    $("previous-page").disabled = pageNumber === 1;
    $("next-page").disabled = pageNumber >= pages;
  }

  function filter() {
    const query = normalize($("word-search").value);
    const level = $("level-filter").value;
    filtered = entries.filter((entry) => normalize(entry.word).includes(query) && (!level || entry.groups.some((group) => group.level === level)));
    pageNumber = 1;
    render();
  }

  $("filters").addEventListener("submit", (event) => event.preventDefault());
  $("word-search").addEventListener("input", filter);
  $("level-filter").addEventListener("change", filter);
  $("filters").addEventListener("reset", () => {
    $("word-search").value = "";
    $("level-filter").value = "";
    filter();
  });
  function turnPage(direction) {
    pageNumber += direction;
    render();
    // Keep keyboard focus usable when the page turn disables its own button.
    $("results-status").setAttribute("tabindex", "-1");
    $("results-status").focus({ preventScroll: true });
  }
  $("previous-page").addEventListener("click", () => turnPage(-1));
  $("next-page").addEventListener("click", () => turnPage(1));
  for (const id of ["word-search", "level-filter", "clear-filters"]) $(id).disabled = false;
  render();
})();
