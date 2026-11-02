import json
import re
import unittest
from collections import Counter

import pymupdf

from import_oxford import ROOT, SOURCE, extract


class OxfordImportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.entries = extract()
        cls.by_word = {entry["word"]: entry for entry in cls.entries}

    def test_exact_counts_and_generated_data(self):
        self.assertEqual(len(self.entries), 3000)
        self.assertEqual(len(self.by_word), 3000)
        levels = Counter(group["level"] for entry in self.entries for group in entry["groups"])
        self.assertEqual(levels, {"A1": 900, "A2": 872, "B1": 809, "B2": 727})
        generated = (ROOT / "oxford-words.js").read_text(encoding="utf-8")
        self.assertEqual(json.loads(generated.split("window.OXFORD_WORDS = ", 1)[1].rstrip(";\n")), self.entries)

    def test_every_source_entry_and_page_accounted_for(self):
        with pymupdf.open(SOURCE) as document:
            for number, page in enumerate(document, start=1):
                lines = []
                for raw in page.get_text().splitlines():
                    line = " ".join(raw.split())
                    if not line or line.startswith(("© Oxford University Press", "The Oxford 3000")) or re.fullmatch(r"\d+ / \d+", line):
                        continue
                    lines.append(line)
                source = re.sub(r"\s+", "", "".join(lines))
                rebuilt = []
                for entry in self.entries:
                    if entry["page"] == number:
                        details = ", ".join(f"{group['pos']} {group['level']}" for group in entry["groups"])
                        rebuilt.append(f"{entry['word']} {details}")
                self.assertEqual(re.sub(r"\s+", "", "".join(rebuilt)), source, f"Source mismatch on page {number}")

    def test_groups_and_wrapped_lines(self):
        self.assertEqual(self.by_word["academic"]["groups"], [
            {"pos": "adj.", "level": "B1"}, {"pos": "n.", "level": "B2"}])
        self.assertEqual(self.by_word["light (from the sun/a lamp)"]["groups"], [
            {"pos": "n., adj.", "level": "A1"}, {"pos": "v.", "level": "A2"}])
        self.assertEqual(self.by_word["second1 (next after the first)"]["groups"][0],
                         {"pos": "det./ number", "level": "A1"})
        self.assertEqual(self.entries[0]["terms"], ["a", "an"])
        self.assertEqual(self.entries[-1]["word"], "zone")

    def test_dictionary_terms(self):
        self.assertEqual(self.by_word["last1 (taking time)"]["terms"], ["last"])
        self.assertEqual(self.by_word["o\u2019clock"]["terms"], ["o'clock"])
        for entry in self.entries:
            for term in entry["terms"]:
                self.assertRegex(term, r"^[A-Za-z]+(?:[ '\-][A-Za-z]+)*$")


if __name__ == "__main__":
    unittest.main()
