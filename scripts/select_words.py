"""Extract unique headwords and draw five from the supplied Longman PDF."""

import json
import random
import re
import sys
from pathlib import Path

import pymupdf


SOURCE = Path(__file__).resolve().parents[1] / "longman_3000_list.pdf"
POS = (
    r"indefinite article|definite article|modal verb|modal|auxiliary|"
    r"v|n|adj|adv|prep|conj|determiner|predeterminer|pron|interjection|"
    r"number|ordinal number|infinitive marker|prefix|suffix|"
    r"possessive determiner|exclamation"
)
ENTRY = re.compile(
    rf"^(?P<word>.+?)\s+(?P<pos>(?:{POS})(?:,\s*(?:{POS}))*)\s+"
    r"(?P<frequency>[SW][123](?:,\s*[SW][123])*)$"
)


def extract_words():
    entries = {}
    with pymupdf.open(SOURCE) as document:
        for page_number, page in enumerate(document, start=1):
            if page_number == 1:
                continue
            pending = []
            for line in page.get_text().splitlines():
                line = " ".join(line.split())
                if not line or line.isdigit() or "Longman" in line or "LONGMAN" in line or " = " in line:
                    continue
                pending.append(line)
                if not re.search(r"[SW][123]$", line):
                    continue
                text = " ".join(pending)
                if text == "to S1, W1":
                    entry = entries.setdefault("to", {"word": "to", "entries": []})
                    entry["entries"].append({
                        "partOfSpeech": "",
                        "frequency": "S1, W1",
                        "page": page_number,
                    })
                    pending.clear()
                    continue
                match = ENTRY.fullmatch(text)
                if not match:
                    raise ValueError(f"Unrecognized entry on page {page_number}: {text}")
                word = match["word"].replace("\u2019", "'")
                entry = entries.setdefault(word, {"word": word, "entries": []})
                entry["entries"].append({
                    "partOfSpeech": match["pos"],
                    "frequency": match["frequency"],
                    "page": page_number,
                })
                pending.clear()
            if pending:
                raise ValueError(f"Unfinished entry on page {page_number}: {pending}")
    if len(entries) < 2800:
        raise ValueError(f"Unexpectedly small vocabulary: {len(entries)}")
    return list(entries.values())


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    vocabulary = extract_words()
    print(json.dumps({
        "uniqueHeadwords": len(vocabulary),
        "entries": sum(len(word["entries"]) for word in vocabulary),
        "selected": random.SystemRandom().sample(vocabulary, 5),
    }, ensure_ascii=False, indent=2))
