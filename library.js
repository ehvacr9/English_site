"use strict";

(() => {
  const oxford = window.OXFORD_WORDS;
  const longman = window.LONGMAN_WORDS;
  const oxfordLinks = window.OXFORD_LINKS;
  const wordlistMembership = window.WORDLIST_MEMBERSHIP;
  const $ = (id) => document.getElementById(id);
  if (!Array.isArray(oxford) || oxford.length !== 3000 || !Array.isArray(longman) || longman.length !== 578 || !oxfordLinks ||
      oxford.some((entry) => !Array.isArray(oxfordLinks[entry.word]) || !oxfordLinks[entry.word].length) ||
      longman.some((entry) => !Array.isArray(entry.oxfordLinks) || (!entry.oxfordLinks.length && !entry.oxfordSearch) ||
        !entry.cambridge || !entry.cambridge.url || entry.groups.some((group) => !Array.isArray(group.levels) ||
          group.levelSource !== "Cambridge" || group.levels.some((level) => !["A1", "A2", "B1", "B2", "C1", "C2"].includes(level)))) ||
      !wordlistMembership || Object.keys(wordlistMembership).length !== 3578 ||
      [...oxford, ...longman].some((entry) => !wordlistMembership[entry.word] ||
        typeof wordlistMembership[entry.word].oxford !== "boolean" ||
        typeof wordlistMembership[entry.word].longman !== "boolean")) {
    console.error("Vocabulary or dictionary link data is missing or incomplete.");
    $("library-error").textContent = "無法載入完整詞庫，請重新整理頁面或檢查網路。你仍可從側邊連結查閱原始 PDF。";
    $("library-error").hidden = false;
    $("results-status").textContent = "詞庫載入失敗";
    return;
  }

  const pageSize = 50;
  let pageNumber = 1;
  const normalize = (text) => text.toLowerCase().replaceAll("’", "'").trim().replace(/\s+/g, " ");
  const entries = [...oxford, ...longman].sort((a, b) => normalize(a.terms[0]).localeCompare(normalize(b.terms[0]), "en"));
  let filtered = entries;
  const groupLevels = (group) => group.levels || (group.level ? [group.level] : []);
  const dictionaries = [
    { name: "Oxford" },
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

  function markWordlistLink(link, source, entry) {
    if (!wordlistMembership[entry.word][source]) return;
    link.classList.add(`wordlist-${source}-included`);
    link.title = `此單字有出現在上傳的 ${source === "oxford" ? "Oxford" : "Longman"} 3000 詞表。`;
    link.setAttribute("aria-label", `出現在上傳的 ${source === "oxford" ? "Oxford" : "Longman"} 3000 詞表。${link.getAttribute("aria-label")}`);
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
      word.append(text);
      const pos = document.createElement("td");
      for (const group of entry.groups) {
        const part = document.createElement("div");
        part.className = "pos-group";
        part.lang = "en";
        part.textContent = group.pos;
        pos.append(part);
      }
      row.append(word, pos);
      for (const dictionary of dictionaries) {
        const cell = document.createElement("td");
        if (dictionary.name === "Oxford") {
          for (const link of entry.oxfordLinks || oxfordLinks[entry.word]) {
            const anchor = externalLink("Oxford ↗", link.url, `${entry.word}：Oxford ${link.term} ${link.pos}`);
            markWordlistLink(anchor, "oxford", entry);
            cell.append(anchor);
          }
          if (entry.oxfordSearch) {
            const term = entry.terms[0];
            const anchor = externalLink("Oxford 搜尋 ↗", `https://www.oxfordlearnersdictionaries.com/search/english/?q=${encodeURIComponent(term)}`, `${entry.word}：Oxford 搜尋未核對的詞性`);
            markWordlistLink(anchor, "oxford", entry);
            cell.append(anchor);
          }
        } else {
          for (const term of entry.terms) {
            const url = dictionary.name === "Cambridge" && entry.cambridge ? entry.cambridge.url : dictionary.url(term);
            const anchor = externalLink(`${dictionary.name}${entry.terms.length > 1 ? ` · ${term}` : ""} ↗`, url, `${entry.word}：${dictionary.name} 查詢 ${term}`);
            if (dictionary.name === "Longman") markWordlistLink(anchor, "longman", entry);
            cell.append(anchor);
          }
        }
        row.append(cell);
      }
      fragment.append(row);
    }
    if (!filtered.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 7;
      cell.className = "empty-results";
      cell.textContent = "沒有符合的詞條，請更換關鍵字、字首、等級或清除篩選。";
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
    const initial = $("initial-filter").value;
    const level = $("level-filter").value;
    filtered = entries.filter((entry) => normalize(entry.word).includes(query) &&
      (!initial || normalize(entry.word).startsWith(initial)) &&
      (!level || entry.groups.some((group) => level === "ungraded" ? !groupLevels(group).length : groupLevels(group).includes(level))));
    pageNumber = 1;
    render();
  }

  $("filters").addEventListener("submit", (event) => event.preventDefault());
  $("word-search").addEventListener("input", filter);
  $("initial-filter").addEventListener("change", filter);
  $("level-filter").addEventListener("change", filter);
  $("filters").addEventListener("reset", () => {
    $("word-search").value = "";
    $("initial-filter").value = "";
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
  for (const letter of "abcdefghijklmnopqrstuvwxyz") {
    const option = document.createElement("option");
    option.value = letter;
    option.textContent = letter.toUpperCase();
    $("initial-filter").append(option);
  }
  for (const id of ["word-search", "initial-filter", "level-filter", "clear-filters"]) $(id).disabled = false;
  render();
})();
