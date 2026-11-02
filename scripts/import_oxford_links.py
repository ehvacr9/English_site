"""Match PDF parts of speech to links published in Oxford's official wordlist."""

import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path

from import_oxford import ROOT, extract


SOURCE_URL = "https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000"
POS = {
    "n.": ["noun"], "noun.": ["noun"], "v.": ["verb", "linking verb", "modal verb", "auxiliary verb"],
    "adj.": ["adjective"], "adv.": ["adverb"], "prep.": ["preposition"],
    "pron.": ["pronoun"], "det.": ["determiner"], "conj.": ["conjunction"],
    "exclam.": ["exclamation"], "number": ["number", "ordinal number"],
    "modal v.": ["modal verb"], "auxiliary v.": ["auxiliary verb"],
    "indefinite article": ["indefinite article"], "definite article": ["definite article"],
    "infinitive marker": ["infinitive marker"],
}


def normalize(word):
    return word.lower().replace("\u2019", "'").strip()


class WordlistParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.row = None
        self.capture = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "li" and "data-hw" in attrs:
            self.row = {"word": attrs["data-hw"], "url": "", "pos": ""}
        if self.row is not None:
            if tag == "a" and not self.row["url"]:
                self.row["url"] = attrs.get("href", "")
            if tag == "span" and attrs.get("class") == "pos":
                self.capture = True

    def handle_data(self, data):
        if self.row is not None and self.capture:
            self.row["pos"] += data

    def handle_endtag(self, tag):
        if tag == "span":
            self.capture = False
        if tag == "li" and self.row is not None:
            self.rows.append(self.row)
            self.row = None


class EntryParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonical = None
        self.description = None
        self.rows = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs["href"]
        if tag == "meta" and attrs.get("name") == "description":
            self.description = attrs.get("content", "")
        if tag == "a":
            self.add_title(attrs.get("title", ""), attrs.get("href", ""))

    def add_title(self, title, url):
        for pos in sorted({value for values in POS.values() for value in values}, key=len, reverse=True):
            ending = f" {pos} definition"
            if title.endswith(ending) and url.startswith("https://www.oxfordlearnersdictionaries.com/definition/english/"):
                self.rows.append({"word": title[:-len(ending)], "pos": pos, "url": url.split(".com", 1)[1]})
                return

    def finish(self):
        match = re.match(r"Definition of (.+?) in Oxford", self.description or "")
        if not self.canonical or not match:
            raise ValueError("Missing canonical link or definition metadata in entry HTML")
        self.add_title(match[1] + " definition", self.canonical)
        if not self.rows:
            raise ValueError("No entry links found")
        return self.rows


def match_links(entries, rows):
    index = {}
    for row in rows:
        if not re.fullmatch(r"/definition/english/[a-zA-Z0-9_'%.-]+", row["url"]):
            raise ValueError(f"Unexpected Oxford URL: {row}")
        index.setdefault((normalize(row["word"]), row["pos"]), []).append(row["url"])
    result = {}
    missing = []
    for entry in entries:
        links = []
        for term in entry["terms"]:
            for group in entry["groups"]:
                for part in re.split(r"[,/]\s*", group["pos"]):
                    part = part.strip()
                    if part not in POS:
                        raise ValueError(f"Unknown part of speech: {part}")
                    matches = [
                        (pos, url) for pos in POS[part]
                        for url in index.get((normalize(term), pos), [])
                    ]
                    if not matches:
                        missing.append({"word": entry["word"], "term": term, "pos": part})
                    for pos, url in matches:
                        link = {"term": term, "pos": pos, "url": "https://www.oxfordlearnersdictionaries.com" + url}
                        if link not in links:
                            links.append(link)
        result[entry["word"]] = links
    return result, missing


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("html", type=Path, help="Local HTML downloaded from " + SOURCE_URL)
    parser.add_argument("--entries", type=Path, help="Directory containing oxford-entry-*.html for unmatched words")
    args = parser.parse_args()
    wordlist = WordlistParser()
    wordlist.feed(args.html.read_text(encoding="utf-8"))
    if len(wordlist.rows) < 3000:
        raise ValueError("Incomplete Oxford wordlist HTML")
    if args.entries:
        for path in sorted(args.entries.glob("oxford-entry-*.html")):
            entry = EntryParser()
            entry.feed(path.read_text(encoding="utf-8"))
            wordlist.rows.extend(entry.finish())
    links, missing = match_links(extract(), wordlist.rows)
    if missing:
        raise ValueError("Unmatched PDF POS groups: " + json.dumps(missing, ensure_ascii=True))
    output = "// Official Oxford wordlist link metadata; see scripts/import_oxford_links.py.\n"
    output += "window.OXFORD_LINKS = " + json.dumps(links, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ROOT / "oxford-links.js").write_text(output, encoding="utf-8")
    print(f"Matched {sum(len(value) for value in links.values())} links across {sum(bool(value) for value in links.values())} entries.")
    print("Unmatched PDF POS groups:", json.dumps(missing, ensure_ascii=True))
