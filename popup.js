/*  Popup – flat list with search  */
const search = document.getElementById('search');
const list   = document.getElementById('wordList');
const empty  = document.getElementById('empty');

let allWords = [];

/* load & render */
chrome.storage.local.get({ savedWords: [] }, ({ savedWords }) => {
  allWords = savedWords;
  render(allWords);
});

/* live filter */
search.addEventListener('input', () => {
  const q = search.value.toLowerCase();
  const filtered = allWords.filter(
    w =>
      w.word.toLowerCase().includes(q) ||
      (w.phonetic || '').toLowerCase().includes(q) ||
      w.definition.toLowerCase().includes(q)
  );
  render(filtered);
});

/* render helpers */
function render(words) {
  list.innerHTML = '';
  empty.hidden = words.length > 0;
  words.forEach(({ word, phonetic, definition }) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="word">${word}</div>
      ${phonetic ? `<div class="phonetic">${phonetic}</div>` : ''}
      <div class="def">${definition}</div>
      <div class="actions">
        <button class="pronounce">Pronounce</button>
        <button class="remove">Remove</button>
      </div>
    `;
    card.querySelector('.pronounce').addEventListener('click', () => speak(word));
    card.querySelector('.remove').addEventListener('click', () => removeWord(word));
    list.appendChild(card);
  });
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  const voices = speechSynthesis.getVoices();
  const voice =
    voices.find(v => /google.*en/i.test(v.name)) ||
    voices.find(v => v.lang === 'en-US') ||
    voices[0];
  if (voice) utter.voice = voice;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

function removeWord(word) {
  chrome.storage.local.get({ savedWords: [] }, (res) => {
    const updated = res.savedWords.filter(w => w.word !== word);
    allWords = updated;
    chrome.storage.local.set({ savedWords: updated });
    render(updated);
  });
}