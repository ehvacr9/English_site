import json
import unittest

from import_longman import CAMBRIDGE_POS, LEVELS, LONGMAN_POS, apply_cambridge
from import_oxford_links import POS
from import_longman import additions, normalize
from import_oxford import ROOT, extract
from select_words import extract_words


class LongmanImportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.oxford = extract()
        cls.longman = extract_words()
        cls.added = additions(cls.oxford, cls.longman)
        source = (ROOT / "longman-words.js").read_text(encoding="utf-8")
        cls.generated = json.loads(source.split("window.LONGMAN_WORDS = ", 1)[1].rstrip(";\n"))

    def test_exact_difference_and_counts(self):
        existing = {normalize(term) for entry in self.oxford for term in entry["terms"]}
        expected = {normalize(entry["word"]) for entry in self.longman} - existing
        actual = {normalize(entry["word"]) for entry in self.added}
        self.assertEqual(actual, expected)
        self.assertEqual(len(self.longman), 3160)
        self.assertEqual(len(self.added), 578)
        self.assertEqual(len(actual), len(self.added))
        self.assertTrue(actual.isdisjoint(existing))

    def test_existing_terms_skipped_regardless_of_pos(self):
        entries = {entry["word"] for entry in self.added}
        for word in ["a", "an", "map", "bank", "o'clock", "according to"]:
            self.assertNotIn(word, entries)
        duplicate = {"word": " AN ", "entries": [{"partOfSpeech": "v", "frequency": "S1", "page": 2}]}
        self.assertEqual(additions(self.oxford, [duplicate]), [])

    def test_generated_data_and_source_groups(self):
        self.assertEqual(len(self.generated), len(self.added))
        for original, generated in zip(self.added, self.generated):
            for key, value in original.items():
                if key == "groups":
                    self.assertEqual([group["pos"] for group in generated[key]], [group["pos"] for group in value])
                else:
                    self.assertEqual(generated[key], value)
            self.assertTrue(generated["oxfordLinks"] or generated["oxfordSearch"])
            for group in generated["groups"]:
                self.assertEqual(group["level"], "")
                self.assertNotIn("frequency", group)
                self.assertEqual(group["levelSource"], "Cambridge")
                self.assertEqual(group["levels"], sorted(set(group["levels"]), key=LEVELS.index))
                self.assertIn(group["pos"], CAMBRIDGE_POS)
        # Running the difference again with the combined library adds nothing.
        self.assertEqual(additions(self.oxford + self.added, self.longman), [])

    def test_new_oxford_link_metadata(self):
        direct_count = search_count = 0
        for entry in self.generated:
            allowed = {pos for group in entry["groups"] for part in group["pos"].split(",")
                       for pos in POS[LONGMAN_POS[part.strip()]]}
            self.assertEqual(len(entry["oxfordLinks"]), len({link["url"] for link in entry["oxfordLinks"]}))
            for link in entry["oxfordLinks"]:
                self.assertEqual(normalize(link["term"]), normalize(entry["word"]))
                self.assertIn(link["pos"], allowed)
                self.assertRegex(link["url"], r"^https://www\.oxfordlearnersdictionaries\.com/definition/english/[a-zA-Z0-9_'%.-]+$")
                direct_count += 1
            search_count += entry["oxfordSearch"]
        self.assertEqual(direct_count, 413)
        self.assertEqual(search_count, 171)

    def test_cambridge_matching_does_not_mix_parts_or_headwords(self):
        entries = [{"word": "abuse", "groups": [{"pos": "n"}, {"pos": "v"}]}]
        record = {"word": "abuse", "url": "https://dictionary.cambridge.org/dictionary/english/abuse",
                  "checked": "2026-11-03", "status": "ok", "entries": [
                      {"head": "abuse", "pos": "noun", "levels": ["C2", "B2", "B2"]},
                      {"head": "abuse", "pos": "verb", "levels": []},
                      {"head": "abusive", "pos": "verb", "levels": ["A1"]}]}
        apply_cambridge(entries, [record])
        self.assertEqual(entries[0]["groups"][0]["levels"], ["B2", "C2"])
        self.assertEqual(entries[0]["groups"][1]["levels"], [])
        self.assertEqual(entries[0]["groups"][1]["levelStatus"], "ungraded")
        record["entries"] = []
        apply_cambridge(entries, [record])
        self.assertEqual(entries[0]["groups"][0]["levelStatus"], "unmatched")
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            apply_cambridge(entries, [record, record])
        with self.assertRaisesRegex(ValueError, "exactly"):
            apply_cambridge(entries, [])
        record["entries"] = [{"head": "abuse", "pos": "noun", "levels": ["B3"]}]
        with self.assertRaisesRegex(ValueError, "Invalid"):
            apply_cambridge(entries, [record])

    def test_cambridge_representative_levels(self):
        data = {entry["word"]: entry for entry in self.generated}
        self.assertEqual(data["absence"]["groups"][0]["levels"], ["B2"])
        self.assertEqual(data["absorb"]["groups"][0]["levels"], ["B2", "C1"])
        self.assertEqual(data["abuse"]["groups"][0]["levels"], ["B2", "C2"])
        self.assertEqual(sum(any(group["levels"] for group in entry["groups"]) for entry in self.generated), 514)
        self.assertEqual(sum(any(not group["levels"] for group in entry["groups"]) for entry in self.generated), 69)
        for entry in self.generated:
            self.assertRegex(entry["cambridge"]["checked"], r"^\d{4}-\d{2}-\d{2}$")
            self.assertIn(entry["cambridge"]["status"], ["ok", "not-found"])

    def test_generated_levels_match_saved_official_metadata(self):
        records = json.loads((ROOT / "scripts" / "cambridge-levels.json").read_text(encoding="utf-8"))
        expected = additions(self.oxford, self.longman)
        apply_cambridge(expected, records)
        for original, generated in zip(expected, self.generated):
            self.assertEqual(original["groups"], generated["groups"])
            self.assertEqual(original["cambridge"], generated["cambridge"])


if __name__ == "__main__":
    unittest.main()
