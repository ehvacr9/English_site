"use strict";

// Run in a normal Cambridge Dictionary browser page, not on the learning site.
window.collectCambridgeMetadata = async (words, records = []) => {
  if (new Set(words).size !== words.length ||
      records.some((record, index) => record.word !== words[index])) {
    throw new Error("Words must be unique and saved records must be an ordered prefix.");
  }
  for (const word of words.slice(records.length)) {
    const url = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word.replaceAll(" ", "-"))}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Cambridge HTTP ${response.status} for ${word}; collection stopped with ${records.length} saved records.`);
    }
    const record = {
      word, url: response.url,
      checked: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date()),
      status: response.ok ? "ok" : "not-found", entries: []
    };
    if (response.ok) {
      const doc = new DOMParser().parseFromString(await response.text(), "text/html");
      const nodes = [...doc.querySelectorAll(".entry-body__el, .di-body > .idiom-block, .di-body > .phrase-block")];
      if (!nodes.length) throw new Error(`Unrecognized Cambridge HTML for ${word}; collection stopped.`);
      record.entries = nodes.map((entry) => ({
        head: entry.querySelector(".hw, .di-title .headword")?.textContent.trim() || "",
        pos: entry.querySelector(".pos")?.textContent.trim() || "",
        levels: [...new Set([...entry.querySelectorAll(".def-info .epp-xref")]
          .filter((level) => entry.matches(".entry-body__el")
            ? !level.closest(".phrase-block, .idiom-block")
            : entry.matches(".idiom-block")
              ? !level.closest(".phrase-block") && level.closest(".pr.idiom-block") === entry
              : !level.closest(".idiom-block") && level.closest(".phrase-block") === entry)
          .map((level) => level.textContent.trim()))]
      }));
    }
    records.push(record);
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  return records;
};
