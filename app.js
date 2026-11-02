"use strict";

const words = [
  { word: "journey", phonetic: "/ˈdʒɜːrni/", meaning: "旅程；歷程", category: "生活 · 名詞", example: "Every journey begins with a small step.", translation: "每一段旅程，都從一小步開始。" },
  { word: "practice", phonetic: "/ˈpræktɪs/", meaning: "練習", category: "學習 · 動詞", example: "I practice English every morning.", translation: "我每天早上練習英語。" },
  { word: "coffee", phonetic: "/ˈkɔːfi/", meaning: "咖啡", category: "飲食 · 名詞", example: "I'd like a cup of coffee, please.", translation: "我想要一杯咖啡，謝謝。" },
  { word: "explore", phonetic: "/ɪkˈsplɔːr/", meaning: "探索", category: "生活 · 動詞", example: "Let's explore the city together.", translation: "我們一起探索這座城市吧。" },
  { word: "usually", phonetic: "/ˈjuːʒuəli/", meaning: "通常", category: "日常 · 副詞", example: "I usually walk to work.", translation: "我通常走路上班。" },
  { word: "friendly", phonetic: "/ˈfrendli/", meaning: "友善的", category: "人物 · 形容詞", example: "Our new neighbor is very friendly.", translation: "我們的新鄰居非常友善。" },
  { word: "delicious", phonetic: "/dɪˈlɪʃəs/", meaning: "美味的", category: "飲食 · 形容詞", example: "This soup is delicious.", translation: "這道湯很美味。" },
  { word: "station", phonetic: "/ˈsteɪʃən/", meaning: "車站", category: "交通 · 名詞", example: "The station is next to the park.", translation: "車站就在公園旁邊。" },
  { word: "weekend", phonetic: "/ˈwiːkend/", meaning: "週末", category: "時間 · 名詞", example: "What do you do on the weekend?", translation: "你週末都做些什麼？" },
  { word: "improve", phonetic: "/ɪmˈpruːv/", meaning: "進步；改善", category: "學習 · 動詞", example: "Reading can improve your English.", translation: "閱讀能讓你的英語進步。" },
  { word: "comfortable", phonetic: "/ˈkʌmftəbəl/", meaning: "舒適的", category: "生活 · 形容詞", example: "This chair is very comfortable.", translation: "這張椅子非常舒適。" },
  { word: "remember", phonetic: "/rɪˈmembər/", meaning: "記得", category: "生活 · 動詞", example: "I remember your name.", translation: "我記得你的名字。" }
];

const scenarios = {
  cafe: { title: "At the coffee shop · 咖啡店點餐", lines: [
    ["店員", "Hi! What can I get for you?", "你好！想要點些什麼呢？"],
    ["你", "I'd like a latte, please.", "我想要一杯拿鐵，謝謝。"],
    ["店員", "Sure. Would you like it hot or iced?", "好的。你想要熱的還是冰的？"],
    ["你", "Iced, please. How much is it?", "冰的，謝謝。請問多少錢？"],
    ["店員", "It's five dollars.", "五元。"],
    ["你", "Here you go. Thank you!", "給你。謝謝！"]
  ] },
  directions: { title: "Finding your way · 問路與交通", lines: [
    ["你", "Excuse me. Where is the train station?", "不好意思，請問火車站在哪裡？"],
    ["路人", "Go straight and turn left at the park.", "直走，在公園左轉。"],
    ["你", "Is it far from here?", "離這裡遠嗎？"],
    ["路人", "No, it's about a five-minute walk.", "不遠，走路大約五分鐘。"],
    ["你", "Thank you for your help!", "謝謝你的幫忙！"],
    ["路人", "You're welcome!", "不客氣！"]
  ] },
  introductions: { title: "Nice to meet you · 第一次見面", lines: [
    ["Alex", "Hi, I'm Alex. What's your name?", "嗨，我是 Alex。你叫什麼名字？"],
    ["你", "I'm Jamie. Nice to meet you!", "我是 Jamie。很高興認識你！"],
    ["Alex", "Nice to meet you, too. Where are you from?", "我也很高興認識你。你來自哪裡？"],
    ["你", "I'm from Taiwan. How about you?", "我來自台灣。你呢？"],
    ["Alex", "I'm from Canada. What do you like to do?", "我來自加拿大。你喜歡做什麼？"],
    ["你", "I like reading and learning new things.", "我喜歡閱讀和學習新事物。"]
  ] }
};

const questions = [
  { question: "「我通常走路上班。」哪一句正確？", options: ["I usually walk to work.", "I usually walking to work.", "I walk usually to working."], answer: 0, explanation: "usually 表示「通常」，放在一般動詞 walk 前面；主詞 I 搭配原形動詞。" },
  { question: "在咖啡店，如何有禮貌地點一杯拿鐵？", options: ["Where is my latte?", "I'd like a latte, please.", "I am a latte."], answer: 1, explanation: "I'd like …, please. 是有禮貌的點餐句型，意思是「我想要……，謝謝」。" },
  { question: "friendly 的意思是什麼？", options: ["疲倦的", "昂貴的", "友善的"], answer: 2, explanation: "friendly 是形容詞，意思是「友善的」。例如：She is very friendly." },
  { question: "想請問車站在哪裡，可以怎麼說？", options: ["When is the station?", "Where is the train station?", "Who is the train station?"], answer: 1, explanation: "詢問地點用 Where。問路前加上 Excuse me. 會更有禮貌。" },
  { question: "「閱讀能讓你的英語進步。」請填空：Reading can ___ your English.", options: ["improve", "delicious", "station"], answer: 0, explanation: "improve 是「改善、進步」。can 是助動詞，後面接原形動詞。" }
];

const storageKey = "daily-english-v1";
const $ = (id) => document.getElementById(id);
const freshState = () => ({ learned: [], days: {}, bestScore: null });
let state = freshState();
let wordIndex = 0;
let scenarioId = "cafe";
let questionIndex = 0;
let quizScore = 0;
let answered = false;
let storageAvailable = true;

function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function validState(value) {
  return value && Array.isArray(value.learned) && value.learned.every((word) => words.some((item) => item.word === word)) &&
    value.days && typeof value.days === "object" && !Array.isArray(value.days) &&
    Object.entries(value.days).every(([key, day]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && day &&
      Array.isArray(day.words) && day.words.every((word) => words.some((item) => item.word === word)) &&
      typeof day.conversation === "boolean" && typeof day.quiz === "boolean") &&
    (value.bestScore === null || (Number.isInteger(value.bestScore) && value.bestScore >= 0 && value.bestScore <= questions.length));
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
  if (!state.days[key]) state.days[key] = { words: [], conversation: false, quiz: false };
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

function taskTotal(day) {
  return day ? Number(new Set(day.words).size >= 5) + Number(day.conversation) + Number(day.quiz) : 0;
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
  const day = today();
  $("streak-count").textContent = streak();
  $("learned-count").textContent = new Set(state.learned).size;
  $("task-count").textContent = taskTotal(day);
  $("task-bar").style.width = `${taskTotal(day) / 3 * 100}%`;
  [["words", day.words.length >= 5], ["conversation", day.conversation], ["quiz", day.quiz]].forEach(([name, complete], index) => {
    const element = $(`goal-${name}`);
    element.textContent = complete ? "✓" : index + 1;
    element.classList.toggle("complete", complete);
  });
  $("word-daily-count").textContent = `${Math.min(day.words.length, 5)} / 5`;
}

const viewTitles = { home: "學習總覽", words: "單字練習", conversation: "情境會話", quiz: "每日測驗", progress: "學習紀錄" };
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
window.addEventListener("focus", updateDashboard);

function renderWord() {
  const word = words[wordIndex];
  $("word-position").textContent = `${wordIndex + 1} / ${words.length}`;
  $("word-category").textContent = word.category;
  $("word-text").textContent = word.word;
  $("word-phonetic").textContent = word.phonetic;
  $("word-meaning").textContent = word.meaning;
  $("word-meaning").hidden = true;
  $("flashcard").setAttribute("aria-label", `${word.word}，翻面查看中文解釋`);
  $("flip-hint").textContent = "點一下，看看中文意思 ↻";
  $("word-example").textContent = word.example;
  $("word-translation").textContent = word.translation;
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
  $("word-status").textContent = "已完成這個單字！按「下一個」繼續練習。";
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

function renderConversation() {
  const scenario = scenarios[scenarioId];
  $("scenario-title").textContent = scenario.title;
  $("dialogue").replaceChildren();
  scenario.lines.forEach(([speaker, english, chinese], index) => {
    const row = document.createElement("div");
    row.className = "dialogue-line";
    const avatar = document.createElement("span");
    avatar.className = "speaker";
    avatar.textContent = index % 2 === 0 ? "A" : "B";
    const speech = document.createElement("div");
    speech.className = "speech";
    const name = document.createElement("small");
    name.textContent = speaker;
    const text = document.createElement("p");
    text.lang = "en";
    text.textContent = english;
    const translation = document.createElement("p");
    translation.className = "translation";
    translation.textContent = chinese;
    const listen = document.createElement("button");
    listen.className = "listen-button";
    listen.textContent = "♪ 聽這一句";
    listen.setAttribute("aria-label", `播放：${english}`);
    listen.addEventListener("click", () => speak(english, $("conversation-status")));
    speech.append(name, text, translation, listen);
    row.append(avatar, speech);
    $("dialogue").append(row);
  });
  $("conversation-status").textContent = "";
}
document.querySelectorAll("[data-scenario]").forEach((button) => {
  button.addEventListener("click", () => {
    scenarioId = button.dataset.scenario;
    document.querySelectorAll("[data-scenario]").forEach((tab) => {
      const active = tab === button;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-pressed", String(active));
    });
    renderConversation();
  });
});
$("finish-conversation").addEventListener("click", () => {
  today().conversation = true;
  save();
  $("conversation-status").textContent = "很棒！今天的會話任務已完成，也可以切換其他情境繼續練習。";
});

function renderQuestion() {
  answered = false;
  $("quiz-next").hidden = true;
  $("quiz-feedback").textContent = "";
  const question = questions[questionIndex];
  const container = $("quiz-content");
  container.replaceChildren();
  const topline = document.createElement("div");
  topline.className = "quiz-topline";
  topline.textContent = `QUESTION ${questionIndex + 1} / ${questions.length} · 已答對 ${quizScore} 題`;
  const heading = document.createElement("h2");
  heading.textContent = question.question;
  const options = document.createElement("div");
  options.className = "quiz-options";
  question.options.forEach((text, index) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.textContent = `${String.fromCharCode(65 + index)}. ${text}`;
    button.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const correct = index === question.answer;
      if (correct) quizScore++;
      Array.from(options.children).forEach((option, optionIndex) => {
        option.disabled = true;
        if (optionIndex === question.answer) option.classList.add("correct");
      });
      if (!correct) button.classList.add("incorrect");
      $("quiz-feedback").textContent = `${correct ? "答對了！" : `再學一次！正確答案是 ${String.fromCharCode(65 + question.answer)}。`} ${question.explanation}`;
      $("quiz-next").textContent = questionIndex === questions.length - 1 ? "查看學習成果 ✓" : "下一題 →";
      $("quiz-next").hidden = false;
      $("quiz-next").focus();
    });
    options.append(button);
  });
  container.append(topline, heading, options);
}
$("quiz-next").addEventListener("click", () => {
  if (!answered) return;
  questionIndex++;
  if (questionIndex < questions.length) {
    renderQuestion();
    $("quiz-content").querySelector("button").focus();
  } else {
    today().quiz = true;
    state.bestScore = Math.max(state.bestScore ?? 0, quizScore);
    save();
    $("quiz-content").innerHTML = `<div class="quiz-result"><div class="result-icon" aria-hidden="true">✦</div><span class="eyebrow">YOU SHOWED UP. THAT MATTERS.</span><h2>完成了！答對 ${quizScore} / ${questions.length} 題</h2><p>${quizScore === questions.length ? "全部答對，太棒了！明天也繼續保持。" : "每次練習，都是進步。回到單字與會話，再複習一下吧！"}</p><button class="button button-primary" id="restart-quiz">再練習一次 ↻</button></div>`;
    $("quiz-next").hidden = true;
    $("quiz-feedback").textContent = "今日測驗任務已完成。";
    $("restart-quiz").addEventListener("click", () => { questionIndex = 0; quizScore = 0; renderQuestion(); });
    $("restart-quiz").focus();
  }
});

function renderProgress() {
  $("progress-summary").replaceChildren();
  [["連續學習天數", `${streak()} 天`], ["累積學過的單字", `${new Set(state.learned).size} 個`], ["測驗最佳成績", state.bestScore === null ? "尚未測驗" : `${state.bestScore} / 5`]].forEach(([label, value]) => {
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
    const count = taskTotal(state.days[dayKey(date)]);
    const column = document.createElement("div");
    column.className = "chart-day";
    column.setAttribute("aria-label", `${date.getMonth() + 1} 月 ${date.getDate()} 日，完成 ${count} 項任務`);
    column.innerHTML = `<span>${count}/3</span><div class="chart-track"><div class="chart-fill" style="height:${count / 3 * 100}%"></div></div><span>${date.getMonth() + 1}/${date.getDate()}${offset === 0 ? " 今日" : ""}</span>`;
    $("week-chart").append(column);
  }
  $("learned-list").replaceChildren();
  if (!state.learned.length) $("learned-list").textContent = "還沒有學習紀錄。先去單字練習，認識你的第一個新單字吧！";
  words.filter((word) => state.learned.includes(word.word)).forEach((word) => {
    const chip = document.createElement("span");
    chip.className = "learned-chip";
    chip.textContent = `${word.word} · ${word.meaning}`;
    $("learned-list").append(chip);
  });
}

$("today-date").textContent = new Intl.DateTimeFormat("zh-TW", { month: "long", day: "numeric", weekday: "long" }).format(new Date());
renderWord();
renderConversation();
renderQuestion();
showView(location.hash.slice(1) || "home");
