# Daily English · Oxford 3000 常用詞彙庫

繁體中文介面的英文詞彙參考網站，以原生 HTML、CSS、JavaScript 製作，不需套件安裝或建置。

- 網站：https://ehvacr9.github.io/English_site/
- 分級說明：https://ehvacr9.github.io/English_site/levels.html
- 原始碼：https://github.com/ehvacr9/English_site

## 完整詞庫

從使用者提供的 [The_Oxford_3000.pdf](./The_Oxford_3000.pdf) 共 11 頁匯入 **3,000 筆原始詞條、3,308 組詞性／CEFR 配對**，保留 PDF 原始順序。a、an 合併為一筆，不同詞義（例如兩筆 bank）及來源同形詞編號分別保留。

- 每頁 50 筆，共 60 頁；搜尋涵蓋整個詞庫，不只目前頁面。
- 可搜尋單字（忽略大小寫、前後空白與彎／直單引號差異），依 A–Z 第一個英文字母分類，並依 A1、A2、B1、B2 篩選。三種條件可同時使用，變更條件會回到第一頁；「清除篩選」重設全部條件。
- 含多種等級的詞條，篩選命中任一等級即可顯示，且保留全部詞性／等級；兩欄的多行內容逐行對應。
- 例：`academic` 的 `adj.` 是 B1、`n.` 是 B2，不會將兩個詞性誤標成同一級。
- 每筆附 Oxford、Cambridge、Longman、Collins、Merriam-Webster 五家官方查閱連結。a、an 各自提供五家連結。已移除逐筆 PDF 頁碼連結，仍保留側邊及頁尾的完整詞表入口；資料檔中的頁碼保留供來源驗證。
- 辭典查詢會移除詞頭後方的來源編號與括號說明，保留片語，將彎單引號正規化。Oxford 使用官方搜尋入口，不猜測同形詞的詞條編號；其他辭典採官方詞條網址格式。
- 辭典可能收錄在其他拼法或詞義下；連結並不保證直接跳到同一詞性或詞義。各家可用性與反自動化限制由原站決定，未逐一在線驗證所有外部頁面。網站不複製辭典釋義。
- 原生表格、鍵盤可操作的搜尋與分頁，窄螢幕可在表格內左右捲動。
- 資料未載入時顯示明確警告，不以空詞庫假裝載入成功。停用 JavaScript 時提供 PDF 替代入口。

單字練習、發音、每日目標、學習紀錄、會話及測驗不再提供。不再讀寫或清除先前版本的 `localStorage`；舊的 hash 網址仍顯示詞彙庫。

## CEFR 分級說明

[levels.html](./levels.html) 介紹 A1–C2 六級、A／B／C 三大類、概略能力與自擬情境，說明詞彙等級與整體能力、Longman S/W 頻率的差別。附官方延伸閱讀，非程度測驗，不提供固定詞彙量門檻或非官方考試分數換算。

## 本機預覽

直接開啟 [index.html](./index.html)，或以 VS Code 靜態網站工具預覽。詞庫以 [oxford-words.js](./oxford-words.js) 載入，不使用 `fetch`，因此支援直接開啟本機檔案。共用樣式為 [styles.css](./styles.css)，搜尋、表格與分頁為 [library.js](./library.js)。

Google Fonts 是可選字型，無網路時自動使用系統字型。

## 重新匯入與驗證

[scripts/import_oxford.py](./scripts/import_oxford.py) 使用 Python 與 PyMuPDF，嚴格解析每頁、跨行條目與詞性／等級群組，未知格式、重複詞頭或數量不等於 3000 時報錯，不略過錯誤。保留來源中的 `noun.` 等原始寫法。

```powershell
py scripts\import_oxford.py
py -m unittest discover -s scripts -p "test_*.py"
```

若缺少 PyMuPDF 再執行 `py -m pip install PyMuPDF`。重新匯入會更新產生的 [oxford-words.js](./oxford-words.js)；請勿直接手改這個資料檔。正常瀏覽網站不需要 Python。

## 來源 PDF

使用者提供的 Oxford 與 [Longman PDF](./longman_3000_list.pdf) 均保存於專案、GitHub 與網站。使用者已授權本次複製及公開；原文件權利仍屬其權利人，本專案不授予第三方額外轉授權。

Oxford PDF 是目前單字、詞性與等級的來源。Longman 是補充參考，不作為 CEFR 分級依據；其 16 頁解析為 3591 筆詞性條目、3160 個不重複詞頭。既有 [scripts/select_words.py](./scripts/select_words.py) 僅為 Longman 離線抽樣工具，不參與網頁。

## GitHub Pages

[部署流程](./.github/workflows/pages.yml) 發布兩個 HTML 頁面、CSS、兩個 JavaScript 檔與兩份 PDF。推送到 `main` 後自動部署，Pages 的 Source 應設為 **GitHub Actions**。修改後提交並執行 `git push origin main` 即可更新，部署狀態可於 Actions 查看。
