import json
import unittest

from import_longman import normalize
from import_oxford import ROOT, extract as extract_oxford
from import_wordlist_membership import build_membership
from select_words import extract_words


class WordlistMembershipTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.oxford = extract_oxford()
        cls.longman = extract_words()
        cls.generated = json.loads(
            (ROOT / "wordlist-membership.js").read_text(encoding="utf-8")
            .split("window.WORDLIST_MEMBERSHIP = ", 1)[1].rstrip(";\n")
        )

    def test_exact_membership_for_all_display_rows(self):
        expected = build_membership(self.oxford, self.longman)
        self.assertEqual(self.generated, expected)
        self.assertEqual(len(expected), 3578)
        self.assertEqual(sum(value["oxford"] for value in expected.values()), 3000)
        self.assertTrue(all(isinstance(value[source], bool) for value in expected.values()
                            for source in ("oxford", "longman")))

    def test_longman_overlap_and_added_headwords(self):
        existing = {normalize(term) for entry in self.oxford for term in entry["terms"]}
        added = {normalize(entry["word"]) for entry in self.longman} - existing
        self.assertEqual(len(added), 578)
        self.assertTrue(all(self.generated[word]["longman"] for word in added))
        self.assertTrue(all(self.generated[entry["word"]]["oxford"] for entry in self.oxford))
        self.assertTrue(self.generated["map"]["oxford"])
        self.assertTrue(self.generated["map"]["longman"])
        self.assertTrue(self.generated["a, an"]["oxford"])

    def test_badges_match_only_the_two_uploaded_wordlists(self):
        for word, membership in self.generated.items():
            self.assertEqual(set(membership), {"oxford", "longman"})
            self.assertEqual(membership["oxford"], word in {entry["word"] for entry in self.oxford})
            self.assertIsInstance(membership["longman"], bool)
        # A Longman headword can match multiple Oxford homograph rows.
        self.assertTrue(self.generated["bank (money)"]["longman"])
        self.assertTrue(self.generated["bank (river)"]["longman"])


if __name__ == "__main__":
    unittest.main()
