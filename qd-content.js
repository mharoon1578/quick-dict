/*  Quick Dictionary – dark, offline-ready save  */
let popup   = null;
let lastSel = '';

/* ---------- SVG assets ---------- */
const speakerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
     viewBox="0 0 24 24" fill="currentColor">
  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
</svg>`;

const saveSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
     viewBox="0 0 24 24" fill="currentColor">
  <path d="M17 3H7c-1.1 0-2 .9-2 2v14l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
</svg>`;

/* ---------- Ctrl key listener ---------- */
document.addEventListener('keydown', async (e) => {
  if (e.key !== 'Control') return;
  const word = window.getSelection().toString().trim();
  if (!word) return;
  if (popup && lastSel === word) { closePopup(); return; }
  lastSel = word;
  await showPopup(word);
});

/* ---------- Popup builder ---------- */
async function showPopup(word) {
  closePopup();

  popup = document.createElement('div');
  popup.id = 'qd-popup';
  Object.assign(popup.style, {
    position: 'absolute', top: 0, left: 0,
    background: '#1e1e1e', color: '#e5e5e5',
    border: '1px solid #444', padding: '8px 12px',
    fontSize: '14px', lineHeight: '1.4', maxWidth: '240px',
    borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,.5)',
    zIndex: 2147483647
  });

  popup.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between">
      <strong>${word}</strong>
      <div style="display:flex;gap:8px">
        <button id="qd-save" title="Save word" style="background:none;border:none;color:#4fc3f7;cursor:pointer;display:flex;align-items:center;gap:4px;font-size:13px">${saveSvg}<span>Save</span></button>
        <button id="qd-speak" title="Pronounce" style="background:none;border:none;color:#4fc3f7;cursor:pointer;display:flex;align-items:center;gap:4px;font-size:13px">${speakerSvg}<span>Pronounce</span></button>
      </div>
    </div>
    <div id="qd-phonetic" style="margin-top:2px;font-style:italic;color:#aaa;font-size:12px"></div>
    <div id="qd-def" style="margin-top:4px">Loading…</div>
  `;
  document.body.appendChild(popup);

  const range = window.getSelection().getRangeAt(0);
  const rect  = range.getBoundingClientRect();
  popup.style.left = `${rect.left + window.scrollX}px`;
  popup.style.top  = `${rect.bottom + window.scrollY + 4}px`;

  const { definition, phonetic } = await fetchMeaning(word);
  document.getElementById('qd-phonetic').textContent = phonetic || '';
  document.getElementById('qd-def').textContent      = definition;

  document.getElementById('qd-speak').addEventListener('click', () => speak(word));
  document.getElementById('qd-save').addEventListener('click', () => saveWord(word, phonetic, definition));
}

/* ---------- Dictionary fetch ---------- */
async function fetchMeaning(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) throw new Error('Not found');
    const entry = (await res.json())[0];
    const definition = entry.meanings?.[0]?.definitions?.[0]?.definition || 'No definition found.';
    const phonetic   = entry.phonetics?.find(p => p.text)?.text || '';
    return { definition, phonetic };
  } catch {
    return { definition: 'Word not found.', phonetic: '' };
  }
}

/* ---------- Save & speak ---------- */
function saveWord(word, phonetic, definition) {
  chrome.storage.local.get({ savedWords: [] }, (res) => {
    // remove duplicates
    const updated = res.savedWords.filter(obj => obj.word !== word);
    updated.push({ word, phonetic, definition });
    updated.sort((a, b) => a.word.localeCompare(b.word));
    chrome.storage.local.set({ savedWords: updated });

    // visual feedback
    const btn = document.getElementById('qd-save');
    btn.innerHTML = '✓ Saved';
    setTimeout(() => btn.innerHTML = `${saveSvg}<span>Save</span>`, 1500);
  });
}

function speak(text) {
  // always use the freshest voice list
  const voices = speechSynthesis.getVoices();
  const googleVoice =
    voices.find(v => /google.*en/i.test(v.name)) ||
    voices.find(v => v.lang === 'en-US') ||
    voices[0];

  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = googleVoice;
  utter.lang  = googleVoice.lang || 'en-US';
  utter.rate  = 1;
  speechSynthesis.cancel(); // stop previous
  speechSynthesis.speak(utter);
}

function closePopup() {
  if (popup) { popup.remove(); popup = null; lastSel = ''; }
}
document.addEventListener('click', (e) => {
  if (popup && !popup.contains(e.target)) closePopup();
});