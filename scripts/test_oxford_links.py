import json
import unittest

from import_oxford import ROOT, extract
from import_oxford_links import EntryParser, POS, WordlistParser, match_links


class OxfordLinksTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        source = (ROOT / "oxford-links.js").read_text(encoding="utf-8")
        cls.links = json.loads(source.split("window.OXFORD_LINKS = ", 1)[1].rstrip(";\n"))

    def test_all_pdf_parts_covered(self):
        import re
        entries = extract()
        self.assertEqual(set(self.links), {entry["word"] for entry in entries})
        for entry in entries:
            for term in entry["terms"]:
                for group in entry["groups"]:
                    for part in re.split(r"[,/]\s*", group["pos"]):
                        self.assertTrue(any(link["term"] == term and link["pos"] in POS[part.strip()]
                                            for link in self.links[entry["word"]]), (entry["word"], part))
        self.assertEqual(sum(map(len, self.links.values())), 3817)

    def test_known_multiple_pos_urls(self):
        for word, parts in [("map", ["noun", "verb"]), ("book", ["noun", "verb"]),
                            ("academic", ["adjective", "noun"]), ("about", ["preposition", "adverb"])]:
            self.assertEqual([link["pos"] for link in self.links[word]], parts)
            self.assertEqual([link["url"].rsplit("/", 1)[1] for link in self.links[word]],
                             [word + "_1", word + "_2"])

    def test_direct_urls_and_no_duplicates(self):
        for links in self.links.values():
            self.assertEqual(len(links), len({(link["term"], link["pos"], link["url"]) for link in links}))
            for link in links:
                self.assertRegex(link["url"], r"^https://www\.oxfordlearnersdictionaries\.com/definition/english/[a-zA-Z0-9_'%.-]+$")

    def test_parsers_and_unmatched_report(self):
        wordlist = WordlistParser()
        wordlist.feed('<li data-hw="map"><a href="/definition/english/map_2">map</a><span class="pos">verb</span></li>')
        result, missing = match_links([{"word": "map", "terms": ["map"], "groups": [{"pos": "n., v."}]}], wordlist.rows)
        self.assertEqual(result["map"][0]["pos"], "verb")
        self.assertEqual(missing, [{"word": "map", "term": "map", "pos": "n."}])
        entry = EntryParser()
        entry.feed('<link rel="canonical" href="https://www.oxfordlearnersdictionaries.com/definition/english/cannot">'
                   '<meta name="description" content="Definition of cannot modal verb in Oxford Advanced Learner\'s Dictionary.">')
        self.assertEqual(entry.finish()[0]["pos"], "modal verb")


if __name__ == "__main__":
    unittest.main()
