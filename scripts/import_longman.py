"""Add Longman headwords not already represented by Oxford dictionary terms."""

import argparse
import json
import re
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

from import_oxford import ROOT, extract
from import_oxford_links import WordlistParser, match_links
from select_words import extract_words


def normalize(term):
    return " ".join(term.lower().replace("\u2019", "'").split())


def additions(oxford, longman):
    existing = {normalize(term) for entry in oxford for term in entry["terms"]}
    added = []
    for entry in longman:
        key = normalize(entry["word"])
        if key in existing:
            continue
        added.append({
            "word": entry["word"],
            "terms": [entry["word"]],
            "source": "Longman",
            "groups": [{"pos": part, "level": ""} for part in dict.fromkeys(
                part.strip() for group in entry["entries"] for part in group["partOfSpeech"].split(","))],
            "page": entry["entries"][0]["page"],
        })
        existing.add(key)
    return added


LONGMAN_POS = {
    "n": "n.", "v": "v.", "adj": "adj.", "adv": "adv.", "prep": "prep.",
    "conj": "conj.", "pron": "pron.", "determiner": "det.", "predeterminer": "det.",
    "possessive determiner": "det.", "interjection": "exclam.", "exclamation": "exclam.",
    "modal": "modal v.", "modal verb": "modal v.", "auxiliary": "auxiliary v.",
    "number": "number", "ordinal number": "number", "indefinite article": "indefinite article",
    "definite article": "definite article", "infinitive marker": "infinitive marker",
}

CAMBRIDGE_POS = {
    "n": {"noun"}, "v": {"verb", "phrasal verb"}, "adj": {"adjective"},
    "adv": {"adverb"}, "prep": {"preposition"}, "pron": {"pronoun"},
    "interjection": {"exclamation", "interjection"}, "modal": {"modal verb"}, "conj": {"conjunction"},
}
LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]


def apply_cambridge(entries, records):
    index = {}
    for record in records:
        key = normalize(record["word"])
        if key in index:
            raise ValueError(f"Duplicate Cambridge record: {key}")
        if record["status"] not in {"ok", "not-found"}:
            raise ValueError(f"Unverified Cambridge record: {key}")
        if record["status"] == "not-found" and record["entries"]:
            raise ValueError(f"Not-found Cambridge record contains entries: {key}")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", record["checked"]):
            raise ValueError(f"Invalid Cambridge check date: {key}")
        url = urlsplit(record["url"])
        if (url.scheme != "https" or url.netloc != "dictionary.cambridge.org" or url.fragment or
                not re.fullmatch(r"/dictionary/english/[a-zA-Z0-9'%_-]+", url.path) or
                (url.query and parse_qs(url.query, keep_blank_values=True) != {"q": [record["word"]]})):
            raise ValueError(f"Unexpected Cambridge source URL: {record['url']}")
        for source in record["entries"]:
            if any(level not in LEVELS for level in source["levels"]):
                raise ValueError(f"Invalid Cambridge CEFR: {key}")
        index[key] = record
    expected = {normalize(entry["word"]) for entry in entries}
    if set(index) != expected:
        raise ValueError("Cambridge records must cover exactly the added Longman words")
    for entry in entries:
        record = index[normalize(entry["word"])]
        entry["cambridge"] = {"url": record["url"], "checked": record["checked"], "status": record["status"]}
        for group in entry["groups"]:
            if group["pos"] not in CAMBRIDGE_POS:
                raise ValueError(f"Unsupported Longman POS: {group['pos']}")
            matched = [source for source in record["entries"]
                       if normalize(source["head"]) == normalize(entry["word"])
                       and source["pos"] in CAMBRIDGE_POS[group["pos"]]]
            found = {level for source in matched for level in source["levels"]}
            group["levels"] = [level for level in LEVELS if level in found]
            group["levelSource"] = "Cambridge"
            group["levelStatus"] = "graded" if found else "ungraded" if matched else "unmatched"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--oxford-html", type=Path, required=True,
                        help="Downloaded official Oxford wordlist HTML for verified POS links")
    parser.add_argument("--cambridge-json", type=Path, default=ROOT / "scripts" / "cambridge-levels.json",
                        help="Verified Cambridge headword/POS/CEFR metadata exported from dictionary pages")
    args = parser.parse_args()
    oxford, longman = extract(), extract_words()
    if len(longman) != 3160:
        raise ValueError(f"Unexpected Longman headword count: {len(longman)}")
    added = additions(oxford, longman)
    wordlist = WordlistParser()
    wordlist.feed(args.oxford_html.read_text(encoding="utf-8"))
    if len(wordlist.rows) < 3000:
        raise ValueError("Incomplete Oxford link source")
    for entry in added:
        parts = {part.strip() for group in entry["groups"] for part in group["pos"].split(",")}
        supported = [LONGMAN_POS[part] for part in sorted(parts) if part in LONGMAN_POS]
        link_entry = {**entry, "groups": [{"pos": ", ".join(supported)}]} if supported else None
        links, missing = match_links([link_entry], wordlist.rows) if link_entry else ({entry["word"]: []}, [])
        entry["oxfordLinks"] = links[entry["word"]]
        entry["oxfordSearch"] = bool(missing or any(part not in LONGMAN_POS for part in parts))
    apply_cambridge(added, json.loads(args.cambridge_json.read_text(encoding="utf-8")))
    output = "// Generated by scripts/import_longman.py; existing Oxford terms are skipped.\n"
    output += "window.LONGMAN_WORDS = " + json.dumps(added, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ROOT / "longman-words.js").write_text(output, encoding="utf-8")
    print(f"Longman: {len(longman)} unique headwords; skipped {len(longman) - len(added)}; added {len(added)}; total rows {len(oxford) + len(added)}.")
    print(f"Verified Oxford links for {sum(bool(entry['oxfordLinks']) for entry in added)} added entries; "
          f"{sum(entry['oxfordSearch'] for entry in added)} entries also require an explicitly labelled search link.")
    print(f"Cambridge CEFR available for {sum(any(group['levels'] for group in entry['groups']) for entry in added)} words; "
          f"{sum(not group['levels'] for entry in added for group in entry['groups'])} POS groups remain ungraded.")
