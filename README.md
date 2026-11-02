# Daily English · 英語日常

以 Longman Communication 3000 為出發點的繁體中文英語學習網站。使用原生 HTML、CSS、JavaScript，不需安裝套件或建置。

- 網站：https://ehvacr9.github.io/English_site/
- 原始碼：https://github.com/ehvacr9/English_site

## 目前功能

- **首批隨機五字**：從使用者提供的完整 PDF 詞表去重後，以 Python `random.SystemRandom().sample` 無重複抽選：washing、studio、solution、product、basically。
- **固定這組練習**：目前只提供這五個單字，不會隨重新整理或日期變更而換字。依需求先完成五字教材，完整詞庫的每日隨機抽選尚未啟用。
- **單字卡片**：中文、音標、詞性、口語／書面頻率、中英例句、單字及完整例句發音、PDF 原始頁面連結。
- **學習紀錄**：今日五字進度、連續學習天數、最近七天單字練習數與單字收藏。
- 會話與每日測驗已移除，舊的 `#conversation`、`#quiz` 網址會顯示學習總覽。
- 響應式版面、鍵盤操作、狀態通知與減少動態效果支援。

## 教材來源

[longman_3000_list.pdf](./longman_3000_list.pdf) 由使用者提供，並經使用者確認有權公開後，複製至專案、GitHub 與網站。原始單字、詞性與頻率標記來自該 PDF；本站新增的中文、音標、英文例句與翻譯為另行編寫，並非 PDF 原有內容。原文件權利仍屬其權利人，本專案不授予第三方額外轉授權。

PDF 共 16 頁。解析第 2–16 頁得到 **3591 筆詞性條目、3160 個不重複詞頭**，包含片語與不同拼法；「3000」是來源詞表名稱，不將實際解析數硬湊成 3000。每個詞頭抽選機率相同，多詞性不會增加中選機率。

| 首批單字 | 詞性 | 頻率 | PDF 頁碼 |
|---|---|---|---|
| washing | n | S2 | 16 |
| studio | n | S3, W2 | 14 |
| solution | n | S2, W1 | 13 |
| product | n | S1, W1 | 11 |
| basically | adv | S1 | 3 |

S 為口語、W 為書面頻率；1、2、3 分別表示前 1000、2000、3000 名。不應將整份詞表視為單一 CEFR 等級。

### 檢查詞表或重新抽樣（開發用途）

[scripts/select_words.py](./scripts/select_words.py) 使用 Python 與 PyMuPDF，嚴格解析每個條目，遇到未知格式直接報錯。合併多詞性詞頭，將彎引號正規化為直引號，並保留 PDF 中未標詞性的 `to` 條目。

```powershell
py scripts\select_words.py
```

若執行時缺少 PyMuPDF，再以 `py -m pip install PyMuPDF` 安裝。程式只在終端輸出統計與新抽樣，不會改寫網站教材或學習紀錄。更換首批教材時仍需補齊中文、音標、例句、翻譯與來源頁碼，再更新 [app.js](./app.js) 及畫面文案。

## 本機使用與資料保存

直接用瀏覽器開啟 [index.html](./index.html)，或用 VS Code 靜態網站預覽工具。建議透過 HTTP 預覽，讓儲存行為與正式網站一致。

- 不需帳號，沒有後端或跨裝置同步。進度存於目前瀏覽器及網站來源的 `localStorage`，鍵值沿用 `daily-english-v1`。
- 保留先前版本的單字與歷史日期紀錄。舊會話／測驗欄位保留但不再顯示或新增，原本有學習的日期仍可延續連續天數；今天的五字目標只計算目前這組單字。
- 每天可重複練習這組五字，同一天每字只計一次，累積已學單字也不重複計數。七天圖表上限為每日五字。
- 日期以裝置本地日期計算；今天尚未開始時，連續天數保留到昨天。跨日後操作或回到頁面時更新每日目標。
- 清除網站資料或更換瀏覽器會失去紀錄。儲存錯誤會顯示警告；無法辨識的資料不會被覆寫。
- 發音使用瀏覽器 Web Speech API，語音、網路需求與支援程度依裝置而異。失敗會顯示提示；沒有錄音或口說評分。
- Google Fonts 是可選的外部字型；無網路時自動使用系統字型，核心功能不依賴該服務。

## GitHub Pages

[部署流程](./.github/workflows/pages.yml) 僅發布 HTML、CSS、JavaScript 與來源 PDF。推送到 `main` 後自動部署，Pages 的 Source 應設為 **GitHub Actions**。日後修改後提交並執行 `git push origin main` 即可更新，部署狀態可在 repository 的 Actions 查看。
