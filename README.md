# 東京行 2027 (Tokyo Trip App)

2027/2/7 到 2/13 的東京行程 PWA。兩天 GALA 湯澤滑雪、白州蒸溜所、橫濱杯麵博物館。純 HTML、CSS、JavaScript，沒有建置流程，資料存在手機的 localStorage。

架構參考 `日本福岡旅遊APP/FukuokaTripApp`。

## 本機執行

```bash
python -m http.server 8080
```

開 `http://localhost:8080`。Service Worker 需要 HTTP，直接雙擊 `index.html` 無法離線。

## 裝到手機

要先放到 HTTPS 網址（例如 GitHub Pages），用手機瀏覽器開啟後選「加到主畫面」。

## 功能

- 日期分頁切換每天行程，地名直書配朱印，旅途中自動打開今天並標出下一站（一律用日本時間）。
- 行程可新增、編輯、刪除（可復原）、移到別天，一鍵 Google Maps 導航。
- 準備頁：16 項預訂依期限排序、打包清單。行程上的「待訂」會跟著勾選變成「已訂」。
- 天氣依當天地點顯示，雪場多降雪量。預報只有 16 天，1/23 前不會去抓。
- 離線可看完整行程。

## 改內容

| 要改什麼 | 改哪裡 |
| --- | --- |
| 預設行程、預訂、打包 | `js/trip-data.js`，改完把 `seedVersion` +1 |
| 任何檔案要讓手機更新 | `sw.js` 的 `VERSION` +1 |

有手動編輯過的手機不會被新版預設行程覆蓋，要換請到「資訊」頁按重設。

## 設計

和紙底、墨字、朱印的旅のしおり風，只有淺色。字型與福岡版相同（Noto Sans JP、Noto Serif JP）。版面規則取自 [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) 的 Notion：扁平無陰影、細線分隔、方正按鈕、底線分頁；配色與造型為本專案自訂。

## 福岡版修掉的問題

- CSS、JS 帶 `?v=` 導致離線對不上快取，舊快取也不會清除，更新到不了手機。
- `online` 事件呼叫不存在的 `ItineraryTimeline.showToast`，網路恢復時會報錯。
- 行程只能改地圖關鍵字，不能編輯或刪除。
- 含引號的文字會弄壞輸入框。
- 天氣沒抓完前整頁空白，只有 7 天預報，地點寫死。
- manifest 沒有圖示，禁止手機縮放，日期分頁在手機佔太多高度。
