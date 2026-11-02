"use strict";

const words = [
  { word: "washing", phonetic: "/ˈwɑːʃɪŋ/", meaning: "待洗或已洗的衣物；洗滌", category: "名詞 · n", frequency: "S2", page: 16, example: "I do the washing on Sunday mornings.", translation: "我在星期天早上洗衣服。" },
  { word: "studio", phonetic: "/ˈstuːdioʊ/", meaning: "工作室；錄音室", category: "名詞 · n", frequency: "S3, W2", page: 14, example: "She records music in a small studio.", translation: "她在一間小錄音室裡錄製音樂。" },
  { word: "solution", phonetic: "/səˈluːʃən/", meaning: "解決方法；解答", category: "名詞 · n", frequency: "S2, W1", page: 13, example: "We need a simple solution to this problem.", translation: "我們需要一個簡單的方法來解決這個問題。" },
  { word: "product", phonetic: "/ˈprɑːdʌkt/", meaning: "產品；製品", category: "名詞 · n", frequency: "S1, W1", page: 11, example: "This product is easy to use.", translation: "這項產品很容易使用。" },
  { word: "basically", phonetic: "/ˈbeɪsɪkli/", meaning: "基本上；大致說來", category: "副詞 · adv", frequency: "S1", page: 3, example: "The two plans are basically the same.", translation: "這兩個計畫基本上是一樣的。" }
];
const legacyWords = new Set(["journey", "practice", "coffee", "explore", "usually", "friendly", "delicious", "station", "weekend", "improve", "comfortable", "remember"]);
const knownWords = new Set([...legacyWords, ...words.map((word) => word.word)]);
const storageKey = "daily-english-v1";
const $ = (id) => document.getElementById(id);
let state = { learned: [], days: {} };
let wordIndex = 0;
let storageAvailable = true;

function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function validWordList(value) {
  return Array.isArray(value) && value.every((word) => knownWords.has(word));
}

function validState(value) {
  return value && validWordList(value.learned) && value.days && typeof value.days === "object" &&
    !Array.isArray(value.days) && Object.entries(value.days).every(([key, day]) =>
      /^\d{4}-\d{2}-\d{2}$/.test(key) && day && validWordList(day.words) &&
      (day.conversation === undefined || typeof day.conversation === "boolean") &&
      (day.quiz === undefined || typeof day.quiz === "boolean"));
}

function showStorageError(message, error) {
  console.error(message, error);
  $("storage-notice").textContent = message;
  $("storage-notice").hidden = false;
}

try {
  const saved = localStorage.getItem(storageKey);
  if (saved !== null) {
    const parsed = JSON.parse(saved);
    if (!validState(parsed)) throw new Error("Invalid learning record format");
    state = parsed;
  }
} catch (error) {
  storageAvailable = false;
  showStorageError("無法讀取學習紀錄，可能是瀏覽器限制或資料格式損毀。本次仍可練習，但不會覆寫或儲存紀錄。請檢查瀏覽器的網站儲存設定。", error);
}

function today() {
  const key = dayKey();
  if (!state.days[key]) state.days[key] = { words: [] };
  return state.days[key];
}

function save() {
  if (storageAvailable) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      storageAvailable = false;
      showStorageError("無法儲存學習紀錄。本次進度暫留在頁面中，重新整理後可能遺失；請確認瀏覽器允許網站儲存資料。", error);
    }
  }
  updateDashboard();
}

function completedWords() {
  return words.filter((word) => today().words.includes(word.word)).length;
}

function streak() {
  const date = new Date();
  let count = 0;
  const active = (key) => state.days[key] && (state.days[key].words.length > 0 || state.days[key].conversation || state.days[key].quiz);
  if (!active(dayKey(date))) date.setDate(date.getDate() - 1);
  while (active(dayKey(date))) {
    count++;
    date.setDate(date.getDate() - 1);
  }
  return count;
}

function updateDashboard() {
  const completed = completedWords();
  $("streak-count").textContent = streak();
  $("learned-count").textContent = new Set(state.learned).size;
  $("task-count").textContent = completed;
  $("task-bar").style.width = `${completed / words.length * 100}%`;
  $("goal-words").textContent = completed === words.length ? "✓" : completed;
  $("goal-words").classList.toggle("complete", completed === words.length);
  $("goal-status").textContent = `已完成 ${completed} / ${words.length} 個`;
  $("word-daily-count").textContent = `${completed} / ${words.length}`;
  $("today-date").textContent = new Intl.DateTimeFormat("zh-TW", { month: "long", day: "numeric", weekday: "long" }).format(new Date());
}

const viewTitles = { home: "學習總覽", words: "單字練習", progress: "學習紀錄" };
function showView(name) {
  if (!Object.hasOwn(viewTitles, name)) name = "home";
  updateDashboard();
  document.querySelectorAll(".view").forEach((view) => { view.hidden = view.id !== `view-${name}`; });
  document.querySelectorAll("[data-view]").forEach((button) => {
    const active = button.dataset.view === name;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  $("breadcrumb-current").textContent = viewTitles[name];
  document.title = `${viewTitles[name]}｜Daily English 英語日常`;
  if (name === "progress") renderProgress();
  if (name === "words") renderWord();
  $("main").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
}

document.querySelectorAll("[data-view], [data-go]").forEach((button) => {
  button.addEventListener("click", () => { location.hash = button.dataset.view || button.dataset.go; });
});
$("tip-start").addEventListener("click", () => { location.hash = "words"; });
window.addEventListener("hashchange", () => showView(location.hash.slice(1)));
window.addEventListener("focus", () => {
  updateDashboard();
  if (!$("view-words").hidden && $("learn-word").disabled !== today().words.includes(words[wordIndex].word)) renderWord();
  if (!$("view-progress").hidden) renderProgress();
});

function renderWord() {
  updateDashboard();
  const word = words[wordIndex];
  $("word-position").textContent = `${wordIndex + 1} / ${words.length}`;
  $("word-category").textContent = `${word.category} · ${word.frequency}`;
  $("word-text").textContent = word.word;
  $("word-phonetic").textContent = word.phonetic;
  $("word-meaning").textContent = word.meaning;
  $("word-meaning").hidden = true;
  $("flashcard").setAttribute("aria-label", `${word.word}，翻面查看中文解釋`);
  $("flip-hint").textContent = "點一下，看看中文意思 ↻";
  $("word-example").textContent = word.example;
  $("word-translation").textContent = word.translation;
  $("word-source").href = `./longman_3000_list.pdf#page=${word.page}`;
  $("word-source").textContent = `Longman Communication 3000 · PDF 第 ${word.page} 頁 ↗`;
  $("word-status").textContent = state.learned.includes(word.word) ? "你已經學過這個單字。今天再複習一次，也很棒！" : "";
  $("learn-word").disabled = today().words.includes(word.word);
  $("learn-word").textContent = today().words.includes(word.word) ? "今日已練習 ✓" : "我記住了 ✓";
}

$("flashcard").addEventListener("click", () => {
  const hidden = !$("word-meaning").hidden;
  $("word-meaning").hidden = hidden;
  $("flip-hint").textContent = hidden ? "點一下，看看中文意思 ↻" : "點一下，收起中文意思 ↻";
  $("flashcard").setAttribute("aria-label", hidden ? `${words[wordIndex].word}，翻面查看中文解釋` : `${words[wordIndex].word}，${words[wordIndex].meaning}，點一下收起`);
});
$("prev-word").addEventListener("click", () => { wordIndex = (wordIndex - 1 + words.length) % words.length; renderWord(); });
$("next-word").addEventListener("click", () => { wordIndex = (wordIndex + 1) % words.length; renderWord(); });
$("learn-word").addEventListener("click", () => {
  const word = words[wordIndex].word;
  if (!state.learned.includes(word)) state.learned.push(word);
  if (!today().words.includes(word)) today().words.push(word);
  save();
  renderWord();
  $("word-meaning").hidden = false;
  $("flip-hint").textContent = "點一下，收起中文意思 ↻";
  $("flashcard").setAttribute("aria-label", `${word}，${words[wordIndex].meaning}，點一下收起`);
  $("word-status").textContent = completedWords() === words.length ? "今天的 5 個單字都練習完成了，做得很好！" : "已完成這個單字！按「下一個」繼續練習。";
});

function speak(text, statusElement) {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    statusElement.textContent = "目前瀏覽器不支援語音播放，請改用支援語音的瀏覽器；你仍可閱讀例句並自行跟讀。";
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  utterance.onstart = () => { statusElement.textContent = "播放中，跟著讀讀看。"; };
  utterance.onend = () => { statusElement.textContent = "播放完畢，再自己說一次吧！"; };
  utterance.onerror = (event) => {
    if (event.error === "interrupted" || event.error === "canceled") return;
    console.error("Speech playback failed:", event.error);
    statusElement.textContent = "語音播放失敗，請檢查裝置的英語語音與音訊設定。";
  };
  window.speechSynthesis.speak(utterance);
}
$("speak-word").addEventListener("click", () => speak(words[wordIndex].word, $("word-status")));
$("speak-example").addEventListener("click", () => speak(words[wordIndex].example, $("word-status")));

function renderProgress() {
  $("progress-summary").replaceChildren();
  [["連續學習天數", `${streak()} 天`], ["累積學過的單字", `${new Set(state.learned).size} 個`], ["今日五字進度", `${completedWords()} / ${words.length}`]].forEach(([label, value]) => {
    const metric = document.createElement("div");
    metric.className = "progress-metric";
    const text = document.createElement("span");
    text.textContent = label;
    const number = document.createElement("strong");
    number.textContent = value;
    metric.append(text, number);
    $("progress-summary").append(metric);
  });
  $("week-chart").replaceChildren();
  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const count = offset === 0 ? completedWords() : Math.min(new Set(state.days[dayKey(date)]?.words || []).size, 5);
    const column = document.createElement("div");
    column.className = "chart-day";
    column.setAttribute("aria-label", `${date.getMonth() + 1} 月 ${date.getDate()} 日，完成 ${count} 個單字`);
    column.innerHTML = `<span>${count}/5</span><div class="chart-track"><div class="chart-fill" style="height:${count / 5 * 100}%"></div></div><span>${date.getMonth() + 1}/${date.getDate()}${offset === 0 ? " 今日" : ""}</span>`;
    $("week-chart").append(column);
  }
  $("learned-list").replaceChildren();
  if (!state.learned.length) $("learned-list").textContent = "還沒有學習紀錄。先去單字練習，認識你的第一個新單字吧！";
  [...new Set(state.learned)].forEach((learned) => {
    const word = words.find((item) => item.word === learned);
    const chip = document.createElement("span");
    chip.className = "learned-chip";
    chip.textContent = word ? `${word.word} · ${word.meaning}` : `${learned} · 先前版本已學`;
    $("learned-list").append(chip);
  });
}

renderWord();
showView(location.hash.slice(1) || "home");
