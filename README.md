# Daily English · Oxford + Longman 常用詞彙庫

繁體中文介面的英文詞彙參考網站，以原生 HTML、CSS、JavaScript 製作，不需套件安裝或建置。

- 網站：https://ehvacr9.github.io/English_site/
- 分級說明：https://ehvacr9.github.io/English_site/levels.html
- 原始碼：https://github.com/ehvacr9/English_site

## 完整詞庫

從使用者提供的 [The_Oxford_3000.pdf](./The_Oxford_3000.pdf) 共 11 頁匯入 **3,000 筆原始詞條、3,308 組詞性／CEFR 配對**，資料檔保留 PDF 原始順序，頁面則依單字排序。a、an 合併為一筆，不同詞義（例如兩筆 bank）及來源同形詞編號分別保留。

- 加入 Longman 去重後新增的 **578 個單字**，總共 **3,578 筆詞條**。每頁 50 筆，共 72 頁（最後一頁 28 筆），合併後依單字字母排序；同詞頭保留既有 Oxford 順序。搜尋涵蓋整個詞庫，不只目前頁面。
- 可搜尋單字（忽略大小寫、前後空白與彎／直單引號差異），依 A–Z 第一個英文字母分類，並依 A1–C2 或「未提供」篩選。三種條件可同時使用，變更條件會回到第一頁；「清除篩選」重設全部條件。「未提供」命中至少一個詞性沒有已核對等級的詞條，不等於所有 Longman 新增詞彙。
- 表格僅顯示單字、詞性與五家辭典連結，不顯示 CEFR 欄；等級資料保留供篩選使用，命中任一詞性／詞義等級即可顯示整筆詞條。
- 例：`academic` 的 `adj.` 是 B1、`n.` 是 B2，不會將兩個詞性誤標成同一級。
- 每筆附 Oxford、Cambridge、Longman、Collins、Merriam-Webster 五家官方查閱連結。a、an 各自提供五家連結。已移除逐筆 PDF 頁碼連結，仍保留側邊及頁尾的完整詞表入口；資料檔中的頁碼保留供來源驗證。
- Oxford 與 Longman 的辭典欄會在連結旁標記「Oxford 3000 收錄」或「Longman 3000 收錄」，依兩份上傳 PDF 逐詞核對；Oxford 同詞頭的不同義項也會分別標示。標記彼此獨立，不推論 Cambridge、Collins 或 Merriam-Webster 的詞表收錄狀況。
- 辭典查詢會移除詞頭後方的來源編號與括號說明，保留片語，將彎單引號正規化。Oxford 按詞性列出核對過的直接詞條連結（例如 map 的 noun、verb）；其他辭典採官方詞條網址格式。
- 辭典可能收錄在其他拼法或詞義下；連結並不保證直接跳到同一詞性或詞義。各家可用性與反自動化限制由原站決定，未逐一在線驗證所有外部頁面。網站不複製辭典釋義。
- 原生表格、鍵盤可操作的搜尋與分頁，窄螢幕可在表格內左右捲動。
- 資料未載入時顯示明確警告，不以空詞庫假裝載入成功。停用 JavaScript 時提供 PDF 替代入口。

單字練習、發音、每日目標、學習紀錄、會話及測驗不再提供。不再讀寫或清除先前版本的 `localStorage`；舊的 hash 網址仍顯示詞彙庫。

## CEFR 分級說明

[levels.html](./levels.html) 介紹 A1–C2 六級、A／B／C 三大類、概略能力與自擬情境，說明詞彙等級與整體能力、不同詞義分級的差別。附官方延伸閱讀，非程度測驗，不提供固定詞彙量門檻或非官方考試分數換算。

## 本機預覽

直接開啟 [index.html](./index.html)，或以 VS Code 靜態網站工具預覽。Oxford 詞庫、Oxford 詞性連結、Longman 新增詞庫及詞表收錄旗標分別以 [oxford-words.js](./oxford-words.js)、[oxford-links.js](./oxford-links.js)、[longman-words.js](./longman-words.js)、[wordlist-membership.js](./wordlist-membership.js) 載入，不使用 `fetch`，因此支援直接開啟本機檔案。共用樣式為 [styles.css](./styles.css)，搜尋、表格與分頁為 [library.js](./library.js)。

Google Fonts 是可選字型，無網路時自動使用系統字型。

## 重新匯入與驗證

[scripts/import_oxford.py](./scripts/import_oxford.py) 使用 Python 與 PyMuPDF，嚴格解析每頁、跨行條目與詞性／等級群組，未知格式、重複詞頭或數量不等於 3000 時報錯，不略過錯誤。保留來源中的 `noun.` 等原始寫法。

```powershell
py scripts\import_oxford.py
py scripts\import_wordlist_membership.py
py -m unittest discover -s scripts -p "test_*.py"
```

若缺少 PyMuPDF 再執行 `py -m pip install PyMuPDF`。重新匯入會更新產生的 [oxford-words.js](./oxford-words.js)；請勿直接手改這個資料檔。正常瀏覽網站不需要 Python。

[scripts/import_wordlist_membership.py](./scripts/import_wordlist_membership.py) 從兩份 PDF 重新產生 Oxford／Longman 收錄標記檔；標記只依 headword 對應，不複製辭典內容。

### Oxford 詞性連結

[oxford-links.js](./oxford-links.js) 於 2026-11-03 依 [Oxford 官方詞表](https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000) 核對，並補查該表未涵蓋的 13 個單字官方詞條頁，共 **3,817 個詞性連結，涵蓋全部 3,000 筆 PDF 詞條**。727 筆顯示多個連結。只保存詞頭、詞性與網址，不複製釋義、例句或音訊。

PDF 的 `v.` 可配對線上的 verb、linking verb、modal verb、auxiliary verb；例如 cannot 在 PDF 是 v.，線上為 modal verb，表格原始詞性不改，連結標籤使用線上分類。同一詞性如有多個官方詞條皆保留，不以詞義文字猜測網址。同字不同義可能共用一頁，請在辭典中確認所需詞義。

更新連結時先下載官方詞表 HTML 至本機；對未配對的單字另下載 Oxford 官方搜尋結果／詞條頁，命名為 `oxford-entry-單字.html`。執行：

```powershell
py scripts\import_oxford_links.py "C:\path\oxford-wordlist.html" --entries "C:\path\entry-pages"
```

[scripts/import_oxford_links.py](./scripts/import_oxford_links.py) 擷取官方詞表的詞性／href，並從補查頁的 canonical、描述及其他結果連結補足資料。任何 PDF 詞性未配對便報錯，不以猜測編號或搜尋入口冒充直接連結。原始 HTML 為開發時參考，不部署。詞庫或連結資料缺少時，頁面顯示載入失敗，不悄悄省略。

## 來源 PDF

使用者提供的 Oxford 與 [Longman PDF](./longman_3000_list.pdf) 均保存於專案、GitHub 與網站。使用者已授權本次複製及公開；原文件權利仍屬其權利人，本專案不授予第三方額外轉授權。

Oxford PDF 提供既有單字、詞性與 CEFR 等級。Longman 16 頁解析為 3591 筆詞性條目、3160 個不重複詞頭，其中 **2,582 個已由 Oxford 收錄而跳過，578 個加入**。比對以 Oxford `terms` 為準（已去除同形詞編號、括號註記，拆開 a、an），忽略大小寫、彎／直引號及多餘空白。不合併不同拼法；已存在的詞整筆跳過，不補入其 Longman 詞性或頻率，也不覆寫 Oxford 資料。

新增詞彙保留 Longman 原有詞性，已移除網站及產生資料檔中的 S/W 頻率。合併詞性拆開為各自一行，資料仍保留對應的 Cambridge 等級供篩選使用；單字欄只顯示單字，不標示辭典來源，也不重新加入逐筆 PDF 頁碼連結。CEFR 欄已移除，各家辭典連結、原始 PDF 與離線解析器保留原貌。

### Cambridge CEFR 補級

只補 Longman 新增的 578 個單字，**不覆寫原有 Oxford 等級**。依 Cambridge Dictionary 英文詞條中相同詞頭與詞性，在主詞義的 `.def-info .epp-xref` 擷取 A1–C2 標記；排除 `.phrase-block`、`.idiom-block` 內的片語／慣用語分級，不將其他詞性或近似拼法的等級移植過來。多個詞義等級去重並依 A1–C2 排序保存，例如 absorb（v）B2、C1，abuse（n）B2、C2，不取最低級冒充單字的唯一級別。

等級及 Cambridge 來源、核對狀態保存於資料檔，不在表格顯示。未標級或沒有核對到相同詞頭／詞性的資料供「未提供」條件篩選。2026-11-03 查閱全部 578 個新增詞頭後，514 個有至少一個已核對級別，64 個所有詞性仍為「未提供」；另有 5 個部分詞性沒有可採用等級，因此「未提供」篩選共命中 69 筆。

[scripts/cambridge-levels.json](./scripts/cambridge-levels.json) 保存逐詞來源網址、核對日期（台灣時間）、詞頭、詞性與 CEFR 標記，不含辭典釋義、例句、音訊或原始 HTML，也不部署至網站。產生的 [longman-words.js](./longman-words.js) 保留來源與核對狀態，測試會逐筆核對這份來源資料。

更新時，在正常可存取的 Cambridge Dictionary 瀏覽器頁面執行 [scripts/collect_cambridge.js](./scripts/collect_cambridge.js)。將詞庫中 `LONGMAN_WORDS.map(entry => entry.word)` 的 578 個公開詞頭複製為 `words` 陣列，執行 `await collectCambridgeMetadata(words, records)`，其中 `records` 是可保留進度的空陣列或先前結果，再將結果 JSON 存為上述來源檔。工具依序查閱並短暫間隔；遇到存取限制或無法辨識的 HTML 立即報錯停止，不繞過驗證、不猜測等級。404 明確記為 `not-found`。匯入器要求來源資料完整涵蓋 578 個新增詞頭，否則報錯，不以不完整資料覆寫詞庫。

[scripts/import_longman.py](./scripts/import_longman.py) 重用既有 Longman 解析器，產生 [longman-words.js](./longman-words.js)。比對目前下載的 Oxford 官方完整詞表後，410 筆新增詞彙可提供已核對詞性連結；171 筆仍有未核對詞性，明確提供 Oxford 搜尋連結（兩者可能重疊）。不把搜尋網址冒充詞性直接連結。既有 3,000 筆 Oxford 已核對連結完全保留。重新執行匯入：

```powershell
py scripts\import_longman.py --oxford-html "C:\path\oxford-wordlist.html" --cambridge-json "scripts\cambridge-levels.json"
py -m unittest discover -s scripts -p "test_*.py"
```

重複匯入會產生同一份去重資料，不累加重複詞。原有 [scripts/select_words.py](./scripts/select_words.py) 仍可作離線抽樣工具。

## GitHub Pages

[部署流程](./.github/workflows/pages.yml) 發布兩個 HTML 頁面、CSS、四個 JavaScript 檔與兩份 PDF。推送到 `main` 後自動部署，Pages 的 Source 應設為 **GitHub Actions**。修改後提交並執行 `git push origin main` 即可更新，部署狀態可於 Actions 查看。
