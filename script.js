// DOM Elements
const sourceSelect = document.getElementById('sourceLang');
const targetSelect = document.getElementById('targetLang');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const charCount = document.getElementById('charCount');
const translateBtn = document.getElementById('translateBtn');
const swapBtn = document.getElementById('swapBtn');
const toast = document.getElementById('toast');
const darkBtn = document.getElementById('darkBtn');
const speakInput = document.getElementById('speakInput');
const speakOutput = document.getElementById('speakOutput');
const copyInput = document.getElementById('copyInput');
const copyOutput = document.getElementById('copyOutput');
const clearInput = document.getElementById('clearInput');

let debounceTimeout = null;
let isTranslating = false;

// Language mapping for speech (including Zambian languages)
function getSpeechLang(langCode) {
    const map = {
        'en': 'en-US',
        'fr': 'fr-FR',
        'es': 'es-ES',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'ru': 'ru-RU',
        'ar': 'ar-SA',
        'hi': 'hi-IN',
        // Zambian languages - using closest available speech synthesis
        'bem': 'en-ZM',
        'nya': 'en-ZM',
        'tum': 'en-ZM',
        'loz': 'en-ZM',
        'lue': 'en-ZM',
        'luv': 'en-ZM',
        'kaonde': 'en-ZM',
        'tonga': 'en-ZM',
        'lamba': 'en-ZM',
        'mambwe': 'en-ZM',
        'nsenga': 'en-ZM',
        'cokwe': 'en-ZM',
        'bisa': 'en-ZM',
        'mbunda': 'en-ZM',
        'lala': 'en-ZM',
        'swa': 'sw-KE'
    };
    return map[langCode] || 'en-US';
}

// Language display names for better UX
function getLanguageName(langCode) {
    const names = {
        'en': 'English',
        'fr': 'French',
        'es': 'Spanish',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ru': 'Russian',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'bem': 'Bemba',
        'nya': 'Chewa/Nyanja',
        'tum': 'Tumbuka',
        'loz': 'Lozi',
        'lue': 'Lunda',
        'luv': 'Luvale',
        'kaonde': 'Kaonde',
        'tonga': 'Tonga',
        'lamba': 'Lamba',
        'mambwe': 'Mambwe',
        'nsenga': 'Nsenga',
        'cokwe': 'Chokwe',
        'bisa': 'Bisa',
        'mbunda': 'Mbunda',
        'lala': 'Lala',
        'swa': 'Swahili'
    };
    return names[langCode] || langCode;
}

// Show toast notification
function showToast(message) {
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

// Update character count
function updateCharCount() {
    const len = inputText.value.length;
    charCount.textContent = `${len}/500`;
    if (len > 500) {
        inputText.value = inputText.value.slice(0, 500);
        updateCharCount();
    }
}

inputText.addEventListener('input', () => {
    updateCharCount();
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        if (inputText.value.trim()) {
            translate();
        }
    }, 600);
});

// Main translate function with MyMemory API (supports Zambian languages)
async function translate() {
    const text = inputText.value.trim();
    if (!text) {
        outputText.value = '';
        return;
    }

    if (isTranslating) return;

    isTranslating = true;
    const originalText = translateBtn.textContent;
    translateBtn.innerHTML = '<span class="loading-spinner"></span> Translating...';
    translateBtn.disabled = true;

    const source = sourceSelect.value === "auto" ? "auto" : sourceSelect.value;
    const target = targetSelect.value;

    try {
        // MyMemory API supports many languages including African languages
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
        const res = await fetch(url);

        if (!res.ok) throw new Error('Network error');

        const data = await res.json();

        if (data.responseData && data.responseData.translatedText) {
            let translated = data.responseData.translatedText;
            translated = translated.replace(/\[.*?\]/g, '');
            outputText.value = translated.trim();

            // Show success message with language info
            const targetName = getLanguageName(target);
            showToast(`Translated to ${targetName} ✓`);
        } else {
            outputText.value = "Translation failed. Some Zambian languages may have limited support. Try a major language.";
            showToast("Translation failed. Try a different language combination");
        }
    } catch (err) {
        console.error(err);
        outputText.value = "Error connecting to translation service. Please check your internet connection.";
        showToast("Connection error");
    } finally {
        isTranslating = false;
        translateBtn.innerHTML = originalText;
        translateBtn.disabled = false;
    }
}

translateBtn.addEventListener('click', translate);

// Swap languages with Zambian language support
swapBtn.addEventListener('click', () => {
    const sourceVal = sourceSelect.value;
    const targetVal = targetSelect.value;

    if (sourceVal === "auto") {
        showToast("Cannot swap with Detect Language");
        return;
    }

    // Store texts
    const inputVal = inputText.value;
    const outputVal = outputText.value;

    // Swap selections
    sourceSelect.value = targetVal;
    targetSelect.value = sourceVal;

    // Swap texts
    inputText.value = outputVal;
    outputText.value = inputVal;

    updateCharCount();

    // Translate if needed
    if (inputText.value.trim()) {
        translate();
    }

    showToast(`Swapped: ${getLanguageName(targetVal)} ↔ ${getLanguageName(sourceVal)}`);
});

// Text-to-Speech with Zambian language support
function speak(text, langCode) {
    if (!text.trim()) {
        showToast("Nothing to speak");
        return;
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getSpeechLang(langCode);
        utterance.rate = 0.9;
        utterance.onerror = () => showToast("Speech failed");

        // For Zambian languages, provide helpful message
        const zambianLangs = ['bem', 'nya', 'tum', 'loz', 'lue', 'luv', 'kaonde', 'tonga', 'lamba', 'mambwe', 'nsenga', 'cokwe', 'bisa', 'mbunda', 'lala'];
        if (zambianLangs.includes(langCode)) {
            showToast(`Speaking ${getLanguageName(langCode)} (using English voice)`);
        }

        window.speechSynthesis.speak(utterance);
    } else {
        showToast("Text-to-Speech not supported");
    }
}

speakInput.addEventListener('click', () => {
    const lang = sourceSelect.value === "auto" ? "en" : sourceSelect.value;
    speak(inputText.value, lang);
});

speakOutput.addEventListener('click', () => {
    speak(outputText.value, targetSelect.value);
});

// Copy functions
async function copy(text, btn) {
    if (!text.trim()) {
        showToast("Nothing to copy");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        const original = btn.textContent;
        btn.textContent = '✓';
        showToast("Copied!");
        setTimeout(() => {
            btn.textContent = original;
        }, 1000);
    } catch (err) {
        showToast("Copy failed");
    }
}

copyInput.addEventListener('click', () => copy(inputText.value, copyInput));
copyOutput.addEventListener('click', () => copy(outputText.value, copyOutput));

// Clear input
clearInput.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    updateCharCount();
    showToast("Cleared");
});

// Dark mode with localStorage
function loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.body.classList.add('dark');
        darkBtn.textContent = '☀️';
    }
}

darkBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    darkBtn.textContent = isDark ? '☀️' : '🌙';
});

loadTheme();

// Auto-resize
function autoResize() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 250) + 'px';
}

inputText.addEventListener('input', autoResize);

// Keyboard shortcut
inputText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        translate();
    }
});

// Display Zambian language info on select
function showLanguageInfo() {
    const targetLang = targetSelect.value;
    const zambianLangs = ['bem', 'nya', 'tum', 'loz', 'lue', 'luv', 'kaonde', 'tonga', 'lamba', 'mambwe', 'nsenga', 'cokwe', 'bisa', 'mbunda', 'lala', 'swa'];

    if (zambianLangs.includes(targetLang)) {
        showToast(`Selected: ${getLanguageName(targetLang)} - Zambia's local language`);
    }
}

targetSelect.addEventListener('change', showLanguageInfo);
sourceSelect.addEventListener('change', () => {
    if (sourceSelect.value !== 'auto') {
        const zambianLangs = ['bem', 'nya', 'tum', 'loz', 'lue', 'luv', 'kaonde', 'tonga', 'lamba', 'mambwe', 'nsenga', 'cokwe', 'bisa', 'mbunda', 'lala', 'swa'];
        if (zambianLangs.includes(sourceSelect.value)) {
            showToast(`Selected: ${getLanguageName(sourceSelect.value)} - Zambia's local language`);
        }
    }
});

// Initial translation
window.onload = () => {
    updateCharCount();
    autoResize.call(inputText);
    setTimeout(() => {
        if (inputText.value.trim()) translate();
    }, 100);
    showToast("🇿🇲 Zambian languages added! Translate to/from Bemba, Nyanja, Tonga, Lozi, and more!");
};