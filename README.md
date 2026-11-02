# Daily English · 常用詞彙庫

繁體中文介面的常用英文詞彙參考頁。原生 HTML、CSS 靜態網站，不需要 JavaScript、套件安裝或建置。

- 網站：https://ehvacr9.github.io/English_site/
- 原始碼：https://github.com/ehvacr9/English_site

## 目前內容

依使用者提供的詞性與 CEFR 等級，列出以下五筆詞彙，a、an 合併為一筆：

| 單字 | 詞性 | CEFR |
|---|---|---|
| a, an | indefinite article | A1 |
| abandon | v. | B2 |
| ability | n. | A2 |
| able | adj. | A2 |
| about | prep., adv. | A1 |

每筆提供 Oxford Learner's Dictionaries、Cambridge Dictionary、Longman、Collins（使用者原稱 collin）及 Merriam-Webster 官方詞條連結。Oxford 的 a 詞條包含 an，其他四家分別提供 a、an 連結。

- 等級依使用者提供的資料列示，並非取自 Longman PDF 的 S/W 頻率，也不代表所有辭典或所有詞義均採用相同分級。
- 所有外部詞條連結另開分頁，提供包含單字、辭典名稱與新分頁提示的無障礙標籤。
- 保留原生表格語意；窄螢幕可在可鍵盤聚焦的表格區域左右捲動。
- 外部網站內容、網址與存取政策由各家維護，可能受地區、反自動化或網路限制影響。本頁不複製辭典釋義。
- 單字練習、發音、每日目標及學習進度介面已移除；先前移除的會話與測驗也不再提供。
- 舊的 `#words`、`#progress`、`#conversation`、`#quiz` 網址仍會顯示此詞彙庫。網站不再讀寫 `localStorage`，不清除先前版本儲存的紀錄。

## 維護與本機預覽

[英語分級說明](./levels.html) 介紹 CEFR 的 A1–C2 六級、A／B／C 三大類、概略理解與表達能力、自擬生活情境，以及詞彙標記與整體能力、S/W 頻率的差別。附 Council of Europe 與 Cambridge English 來源連結；中文摘要為本站整理，非官方逐字譯文或程度測驗。不提供固定詞彙量門檻或非官方考試分數換算。兩頁均有主要導覽，詞彙表的 CEFR 欄位也可前往說明頁。

直接用瀏覽器開啟 [index.html](./index.html)，或以 VS Code 靜態網站預覽工具開啟。不需伺服器即可呈現完整詞彙表格。

新增詞彙時，在 [index.html](./index.html) 的表格加入一列，並同步更新筆數與本文件。樣式位於 [styles.css](./styles.css)。Google Fonts 為可選字型，無網路時自動使用系統字型。

## 參考 PDF

[longman_3000_list.pdf](./longman_3000_list.pdf) 由使用者提供，並經使用者確認有權公開後，保存於專案、GitHub 與網站。原文件權利仍屬其權利人，本專案不授予第三方額外轉授權。

PDF 是常用詞彙參考來源，不是本頁 CEFR 標示的來源。文件共 16 頁；解析第 2–16 頁得到 3591 筆詞性條目、3160 個不重複詞頭（含片語與不同拼法），「3000」為原詞表名稱。

先前建立的 [scripts/select_words.py](./scripts/select_words.py) 僅保留作為離線解析工具，不參與網頁、部署或目前五筆詞彙的選擇。需要使用時執行 `py scripts\select_words.py`；依賴 Python 與 PyMuPDF。

## GitHub Pages

[部署流程](./.github/workflows/pages.yml) 發布詞彙庫、分級說明頁、共用 CSS 與來源 PDF。推送到 `main` 後自動部署，Pages 的 Source 應設為 **GitHub Actions**。日後修改、提交並執行 `git push origin main` 即可更新，部署狀態可在 repository 的 Actions 查看。
