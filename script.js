// Quotes array
const quotes = [
    "You're doing great!",
    "Take a deep breath.",
    "One step at a time.",
    "You matter.",
    "Progress, not perfection.",
    "Be kind to yourself.",
    "Every moment is a fresh beginning.",
    "You are stronger than you think.",
    "Small steps lead to big changes.",
    "Your feelings are valid.",
    "It's okay to not be okay.",
    "You deserve happiness.",
    "Focus on what you can control.",
    "Growth happens outside comfort zones.",
    "You are enough.",
];

// Prompts for different moods
const prompts = {
    "Happy": ["What made you smile today?", "Who did you enjoy spending time with?"],
    "Sad": ["What's been bothering you?", "What would help you feel better?"],
    "Stressed": ["What's causing pressure?", "Can you take a short break?"],
    "Angry": ["What triggered your anger?", "How can you release it safely?"],
    "Calm": ["What helped you stay calm?", "Can you repeat this tomorrow?"],
    "Excited": ["What are you looking forward to?", "What's fueling your energy?"]
};

// Sentiment analysis
const positive_words = ["happy", "great", "calm", "excited", "love", "peace", "joy", "wonderful", "amazing", "good"];
const negative_words = ["sad", "angry", "stressed", "tired", "hate", "anxious", "worried", "depressed", "awful", "terrible"];

// DOM Elements
const moodBtns = document.querySelectorAll('.mood-btn');
const selectedMoodInput = document.getElementById('selected-mood');
const intensitySlider = document.getElementById('intensity-slider');
const intensityValue = document.getElementById('intensity-value');
const noteInput = document.getElementById('note-input');
const saveBtn = document.getElementById('save-btn');
const saveMessage = document.getElementById('save-message');
const sentimentDisplay = document.getElementById('sentiment-display');
const promptDisplay = document.getElementById('prompt-display');
const newQuoteBtn = document.getElementById('new-quote-btn');
const quoteText = document.getElementById('quote-text');
const entriesList = document.getElementById('entries-list');
const downloadBtn = document.getElementById('download-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    displayRandomQuote();
    displayRecentEntries();
    updateAnalytics();
});

// Mood Button Click Handler
moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        moodBtns.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Store selected mood
        const mood = btn.getAttribute('data-mood');
        selectedMoodInput.value = mood;
        
        // Display random prompt for this mood
        displayPrompt(mood);
        
        // Analyze sentiment in real-time if note exists
        if (noteInput.value.trim()) {
            analyzeSentiment(noteInput.value);
        }
    });
});

// Intensity Slider Update
intensitySlider.addEventListener('input', (e) => {
    intensityValue.textContent = e.target.value;
});

// Note Input Sentiment Analysis (Real-time)
noteInput.addEventListener('input', () => {
    if (noteInput.value.trim() && selectedMoodInput.value) {
        analyzeSentiment(noteInput.value);
    } else {
        sentimentDisplay.classList.add('hidden');
    }
});

// Save Entry
saveBtn.addEventListener('click', saveEntry);

// New Quote
newQuoteBtn.addEventListener('click', displayRandomQuote);

// Download Data
downloadBtn.addEventListener('click', downloadCSV);

// Functions
function displayPrompt(mood) {
    const moodPrompts = prompts[mood];
    if (moodPrompts) {
        const randomPrompt = moodPrompts[Math.floor(Math.random() * moodPrompts.length)];
        promptDisplay.textContent = `💭 ${randomPrompt}`;
    }
}

function analyzeSentiment(note) {
    const noteLower = note.toLowerCase();
    const posCount = positive_words.filter(word => noteLower.includes(word)).length;
    const negCount = negative_words.filter(word => noteLower.includes(word)).length;
    
    let sentiment, message, className;
    
    if (posCount > negCount) {
        sentiment = 'positive';
        message = "✨ Positive mood detected! Keep shining!";
        className = 'positive';
    } else if (negCount > posCount) {
        sentiment = 'negative';
        message = "💙 Negative mood detected. It's okay to feel this way. Remember, this too shall pass.";
        className = 'negative';
    } else {
        sentiment = 'neutral';
        message = "😐 Neutral mood. Whatever you're feeling is valid.";
        className = 'neutral';
    }
    
    sentimentDisplay.textContent = message;
    sentimentDisplay.className = `sentiment-display ${className}`;
}

function saveEntry() {
    const mood = selectedMoodInput.value;
    const intensity = intensitySlider.value;
    const note = noteInput.value.trim();
    
    if (!mood) {
        showMessage('Please select a mood!', 'error');
        return;
    }
    
    if (!note) {
        showMessage('Please write a note!', 'error');
        return;
    }
    
    // Analyze sentiment
    const sentiment = analyzeSentimentScore(note);
    
    // Create entry object
    const entry = {
        id: Date.now(),
        mood,
        intensity: parseInt(intensity),
        note,
        sentiment,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    let entries = JSON.parse(localStorage.getItem('mindcaps-entries')) || [];
    entries.push(entry);
    localStorage.setItem('mindcaps-entries', JSON.stringify(entries));
    
    showMessage('✅ Entry saved successfully!', 'success');
    
    // Reset form
    resetForm();
    
    // Update displays
    displayRecentEntries();
    updateAnalytics();
}

function analyzeSentimentScore(note) {
    const noteLower = note.toLowerCase();
    const posCount = positive_words.filter(word => noteLower.includes(word)).length;
    const negCount = negative_words.filter(word => noteLower.includes(word)).length;
    
    if (posCount > negCount) return 1;
    if (negCount > posCount) return -1;
    return 0;
}

function resetForm() {
    moodBtns.forEach(btn => btn.classList.remove('active'));
    selectedMoodInput.value = '';
    intensitySlider.value = 5;
    intensityValue.textContent = 5;
    noteInput.value = '';
    sentimentDisplay.classList.add('hidden');
    promptDisplay.textContent = '';
}

function showMessage(text, type) {
    saveMessage.textContent = text;
    saveMessage.className = `message ${type}`;
    
    setTimeout(() => {
        saveMessage.classList.add('hidden');
    }, 3000);
}

function displayRandomQuote() {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteText.textContent = `"${randomQuote}"`;
}

function displayRecentEntries() {
    let entries = JSON.parse(localStorage.getItem('mindcaps-entries')) || [];
    entries = entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (entries.length === 0) {
        entriesList.innerHTML = '<p class="no-entries">No entries yet. Start tracking your mood!</p>';
        return;
    }
    
    entriesList.innerHTML = entries.slice(0, 10).map(entry => {
        const date = new Date(entry.timestamp).toLocaleString();
        const moodEmoji = getMoodEmoji(entry.mood);
        const sentimentText = entry.sentiment === 1 ? '😊 Positive' : entry.sentiment === -1 ? '😟 Negative' : '😐 Neutral';
        
        return `
            <div class="entry-item">
                <div class="entry-header">
                    <span class="entry-mood">${moodEmoji} ${entry.mood}</span>
                    <span class="entry-date">${date}</span>
                </div>
                <div class="entry-content">${escapeHtml(entry.note)}</div>
                <div>
                    <span class="entry-intensity">Intensity: ${entry.intensity}/10</span> | 
                    <span>${sentimentText}</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateAnalytics() {
    let entries = JSON.parse(localStorage.getItem('mindcaps-entries')) || [];
    
    // Total entries
    document.getElementById('total-entries').textContent = entries.length;
    
    // Most common mood
    if (entries.length > 0) {
        const moodCounts = {};
        entries.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });
        const mostCommon = Object.keys(moodCounts).reduce((a, b) => 
            moodCounts[a] > moodCounts[b] ? a : b
        );
        document.getElementById('common-mood').textContent = `${getMoodEmoji(mostCommon)} ${mostCommon}`;
        
        // Average intensity
        const avgIntensity = (entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length).toFixed(1);
        document.getElementById('avg-intensity').textContent = avgIntensity;
    }
}

function getMoodEmoji(mood) {
    const emojiMap = {
        'Happy': '😊',
        'Sad': '😢',
        'Stressed': '😰',
        'Angry': '😠',
        'Calm': '😌',
        'Excited': '🤩'
    };
    return emojiMap[mood] || '😊';
}

function downloadCSV() {
    let entries = JSON.parse(localStorage.getItem('mindcaps-entries')) || [];
    
    if (entries.length === 0) {
        showMessage('No entries to download!', 'error');
        return;
    }
    
    // Prepare CSV content
    let csv = 'Date,Mood,Intensity,Note,Sentiment\n';
    entries.forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleString();
        const sentimentText = entry.sentiment === 1 ? 'Positive' : entry.sentiment === -1 ? 'Negative' : 'Neutral';
        const note = entry.note.replace(/"/g, '""'); // Escape quotes
        csv += `"${date}","${entry.mood}",${entry.intensity},"${note}","${sentimentText}"\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindcaps-entries-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showMessage('✅ Data downloaded successfully!', 'success');
}

function loadFromLocalStorage() {
    // Initialize empty array if doesn't exist
    if (!localStorage.getItem('mindcaps-entries')) {
        localStorage.setItem('mindcaps-entries', JSON.stringify([]));
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
