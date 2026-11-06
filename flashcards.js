"use strict";

(() => {
  const cards = [
    {
      word: "a, an",
      hint: "一個；某個（用在單數可數名詞前）",
      definition: "used before a singular countable noun when you mention it for the first time",
      examples: ["She has a book in her bag.", "He ate an apple after lunch."],
      speech: "a, an"
    },
    {
      word: "abandon",
      hint: "放棄；離開（不再繼續或照料）",
      definition: "to leave someone or something, or to stop doing or using something",
      examples: ["They had to abandon the car in the snow.", "She decided to abandon the plan."],
      speech: "abandon"
    },
    {
      word: "ability",
      hint: "能力；才幹",
      definition: "the skill or power to do something",
      examples: ["He has the ability to explain difficult ideas.", "Her musical ability became clear at an early age."],
      speech: "ability"
    },
    {
      word: "able",
      hint: "有能力的；能夠的",
      definition: "having the skill, knowledge, time, or opportunity to do something",
      examples: ["Will you be able to come tomorrow?", "She is able to speak three languages."],
      speech: "able"
    },
    {
      word: "about",
      hint: "關於；大約",
      definition: "on the subject of someone or something; approximately",
      examples: ["We talked about our trip.", "The journey takes about an hour."],
      speech: "about"
    }
  ];

  const $ = (id) => document.getElementById(id);
  const oxfordWords = window.OXFORD_WORDS;
  const oxfordLinks = window.OXFORD_LINKS;
  const expectedWords = ["a, an", "abandon", "ability", "able", "about"];
  const validOxfordData = Array.isArray(oxfordWords) && oxfordWords.length === 3000 && oxfordLinks &&
    cards.every((card, index) => {
      const entry = oxfordWords.find((word) => word.word === card.word);
      return card.word === expectedWords[index] && entry && entry.groups.length &&
        Array.isArray(oxfordLinks[card.word]) && oxfordLinks[card.word].length &&
        card.examples.length > 0;
    });

  if (!validOxfordData) {
    console.error("Oxford word or dictionary link data for the flashcard test deck is missing or incomplete.");
    $("flashcard-error").textContent = "無法載入單字卡資料，請重新整理頁面或檢查網路。";
    $("flashcard-error").hidden = false;
    $("card-status").textContent = "單字卡載入失敗";
    for (const id of ["previous-card", "replay-audio", "reveal-answer", "next-card"]) $(id).disabled = true;
    return;
  }

  const entries = cards.map((card) => ({
    ...card,
    source: oxfordWords.find((entry) => entry.word === card.word),
    oxfordLink: oxfordLinks[card.word][0].url
  }));
  const reviews = new Map();
  let currentIndex = 0;
  let revealed = false;
  const speechAvailable = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

  function speak(text) {
    if (!speechAvailable) {
      $("speech-note").textContent = "此瀏覽器不支援語音合成，仍可使用卡片閱讀與翻面功能。";
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  function updateSummary() {
    $("reviewed-count").textContent = reviews.size;
    $("remembered-count").textContent = [...reviews.values()].filter((remembered) => remembered).length;
  }

  function setAnswerVisible(visible) {
    revealed = visible;
    $("card-back").hidden = !visible;
    $("reveal-answer").hidden = visible;
    $("review-controls").hidden = !visible;
    $("card-status").textContent = visible ? "答案面" : "單字面";
  }

  function render() {
    const card = entries[currentIndex];
    const group = card.source.groups[0];
    $("card-word").textContent = card.word.replace(", ", " / ");
    $("card-pos").textContent = group.pos;
    $("card-level").textContent = group.level || "Oxford 3000";
    $("card-counter").textContent = `${currentIndex + 1} / ${entries.length}`;
    $("card-hint").textContent = card.hint;
    $("card-definition").textContent = card.definition;
    $("oxford-link").href = card.oxfordLink;

    const examples = document.createDocumentFragment();
    for (const example of card.examples) {
      const item = document.createElement("li");
      const text = document.createElement("span");
      text.lang = "en";
      text.textContent = example;
      const audio = document.createElement("button");
      audio.type = "button";
      audio.className = "example-audio";
      audio.textContent = "▶";
      audio.setAttribute("aria-label", `播放例句：${example}`);
      audio.disabled = !speechAvailable;
      audio.addEventListener("click", () => speak(example));
      item.append(text, audio);
      examples.append(item);
    }
    $("card-examples").replaceChildren(examples);
    $("previous-card").disabled = currentIndex === 0;
    $("next-card").disabled = currentIndex === entries.length - 1;
    $("progress-bar").style.width = `${((currentIndex + 1) / entries.length) * 100}%`;
    setAnswerVisible(false);
    updateSummary();
  }

  function moveCard(direction) {
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= entries.length) return;
    currentIndex = nextIndex;
    render();
    $("card-word").focus({ preventScroll: true });
  }

  $("play-word").addEventListener("click", () => speak(entries[currentIndex].speech));
  $("replay-audio").addEventListener("click", () => speak(entries[currentIndex].speech));
  $("reveal-answer").addEventListener("click", () => {
    setAnswerVisible(true);
    $("definition-heading").focus({ preventScroll: true });
  });
  $("previous-card").addEventListener("click", () => moveCard(-1));
  $("next-card").addEventListener("click", () => moveCard(1));
  $("mark-again").addEventListener("click", () => {
    reviews.set(currentIndex, false);
    updateSummary();
    if (currentIndex < entries.length - 1) moveCard(1);
    else $("card-status").textContent = "已記錄：再複習";
  });
  $("mark-remembered").addEventListener("click", () => {
    reviews.set(currentIndex, true);
    updateSummary();
    if (currentIndex < entries.length - 1) moveCard(1);
    else $("card-status").textContent = "已記錄：記得";
  });
  $("restart-session").addEventListener("click", () => {
    currentIndex = 0;
    reviews.clear();
    render();
  });
  $("replay-audio").disabled = !speechAvailable;
  $("play-word").disabled = !speechAvailable;
  if (!speechAvailable) $("speech-note").textContent = "此瀏覽器不支援語音合成，仍可使用卡片閱讀與翻面功能。";
  render();
})();
