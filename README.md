# Quick Dictionary – Chrome Extension

Instant word meanings + phonetics + pronunciation + offline save & search

---

## ✨ Features
- Dark, minimal pop-up appears when you select any word and press Ctrl  
- Real-time definitions + phonetic text via Free Dictionary API  
- Google-quality voice pronunciation (US English)  
- One-click save to an offline list  
- Full-text search across saved word, phonetic, or definition  
- Works on every page, including Google Docs / Gmail  

---

## 🚀 Install (Developer Mode)
1. Clone or download this repo  
2. Open `chrome://extensions` → Developer mode ON  
3. Load unpacked → select the extension folder  
4. Done!  Select any word → Ctrl → pop-up appears.  

---

## 📖 Usage

| Action              | Result                                                   |
|---------------------|----------------------------------------------------------|
| Select word + Ctrl  | Dark pop-up with meaning, phonetic, Save, Pronounce     |
| Click extension icon| Opens saved-words list with live search                 |
| Type in search bar  | Filters instantly across word, phonetic, or definition  |
| Remove button       | Deletes entry immediately                               |

---

## 🛠️ Tech Stack
- Manifest V3  
- No external keys / no backend – everything runs in-browser  
- SpeechSynthesis API for voice (Google voice prioritized)  
- `chrome.storage.local` for offline persistence  

---

## 📁 Project Structure
```
├── manifest.json
├── content.js        // inline pop-up & save logic
├── popup.html        // saved-words UI
├── popup.js          // list + search + voice
└── README.md         // you’re here
```

---

## 🖤 License
MIT – do whatever you want.
