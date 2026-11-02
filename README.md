# Daily English · 英語日常

一個繁體中文介面的英語學習網站雛形，使用原生 HTML、CSS、JavaScript，不需安裝套件或建置，適合部署到 GitHub Pages。

- 網站：https://ehvacr9.github.io/English_site/
- 原始碼：https://github.com/ehvacr9/English_site

## 功能

- 學習總覽：連續學習天數、累積單字與每日三項目標。
- 單字練習：12 個 A1–A2 生活單字，翻面卡片、中英例句、單字與例句英語發音及完成標記。點選例句下方的「♪ 聽例句」可朗讀目前的完整英文例句。
- 情境會話：咖啡店、問路、初次見面，共三個可切換情境，支援逐句發音。
- 每日測驗：5 題選擇題，即時回饋與解析，可重新練習。
- 學習紀錄：最近七天的任務完成情況、學過的單字與測驗最佳成績。
- 響應式版面、鍵盤操作、狀態通知與減少動態效果支援。

## 本機使用

直接用瀏覽器開啟 [index.html](./index.html)，或用 VS Code 的靜態網站預覽工具開啟專案。建議透過 HTTP 預覽，讓瀏覽器儲存行為與正式網站一致。

Google Fonts 是可選的外部字型；無網路時自動使用系統字型，網站核心功能不依賴外部服務。

## 資料與限制

- 本雛形沒有帳號、後端、AI 對話或跨裝置同步，畫面上的學習者是本機使用者。
- 學習紀錄存於目前瀏覽器、目前網站來源的 `localStorage`，鍵值為 `daily-english-v1`。清除網站資料或更換瀏覽器會失去紀錄；無痕模式可能無法保留。
- 儲存讀寫失敗會在頁面顯示警告；資料格式不正確時不會覆寫原有紀錄。
- 「連續學習」以裝置本地日期計算；認識一個單字、完成會話或交卷都算當天有學習。今天尚未開始時，會保留截至昨天的連續天數。
- 每日任務是練習五個不同單字、手動標記完成一段會話、完成五題測驗。單字可隔日複習，但累積單字不重複計數。題庫目前固定，並非每日更新。
- 發音使用瀏覽器 Web Speech API，語音、網路需求與支援程度依裝置而異，播放失敗會顯示提示；沒有錄音或口說評分。

## 發布到 GitHub Pages

本 repository 使用 [Pages workflow](./.github/workflows/pages.yml)，推送到 `main` 後自動部署。Pages 的 Source 應設為 **GitHub Actions**。日後修改後提交並執行 `git push origin main` 即可更新網站，部署狀態可在 repository 的 Actions 查看。

### 發布自己的副本

1. 在 GitHub 建立空的 `English_site` repository（不要另外初始化 README）。
2. 在此資料夾將網站檔案提交到 `main`，並連結實際的 repository：

   ```powershell
   git add index.html styles.css app.js README.md .github
   git commit -m "Create English learning website prototype"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/English_site.git
   git push -u origin main
   ```

3. 在 repository 的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。
4. 若首次推送的部署尚未成功，在 **Actions → Deploy to GitHub Pages → Run workflow** 重新執行。
5. 部署成功後，網址通常為 `https://YOUR_USERNAME.github.io/English_site/`。

請將 `YOUR_USERNAME` 換成自己的 GitHub 帳號。自己的副本需完成 repository 建立、推送與 Pages 設定後才會上線。使用私有 repository 時，GitHub Pages 可用性依帳號方案而定。
