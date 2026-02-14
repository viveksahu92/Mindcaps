// Data & State
let currentUser = "Friend";
let entries = [];
const quotes = [
    "You're doing great!", "Take a deep breath.", "One step at a time.", "You matter.",
    "Progress, not perfection.", "Be kind to yourself.", "Every moment is a fresh beginning.",
    "You are stronger than you think.", "Small steps lead to big changes.", "Your feelings are valid."
];

// Sentiment Analysis Lists
const positive_words = ["happy", "great", "calm", "excited", "love", "peace", "joy", "wonderful", "amazing", "good", "proud"];
const negative_words = ["sad", "angry", "stressed", "tired", "hate", "anxious", "worried", "depressed", "awful", "terrible", "bad"];

// DOM Elements
const views = document.querySelectorAll('.view');
const navLinks = document.querySelectorAll('.nav-links li');
const modal = document.getElementById('entry-modal');
const newEntryBtn = document.getElementById('new-entry-btn');
const closeModal = document.querySelector('.close-modal');
const saveBtn = document.getElementById('save-btn');
const moodBtns = document.querySelectorAll('.mood-btn');
const noteInput = document.getElementById('note-input');
const intensitySlider = document.getElementById('intensity-slider');
const intensityValue = document.getElementById('intensity-value');
const greetingText = document.getElementById('greeting-text');
const dateDisplay = document.getElementById('current-date');
const streakCount = document.getElementById('streak-count');

// New Elements
const gratitudeInput = document.getElementById('gratitude-input');
const addGratitudeBtn = document.getElementById('add-gratitude-btn');
const gratitudeList = document.getElementById('gratitude-list');
const timerDisplay = document.getElementById('timer-display');
const timerToggleBtn = document.getElementById('timer-toggle');
const timerResetBtn = document.getElementById('timer-reset');
const sleepHoursInput = document.getElementById('sleep-hours');
const sleepQualityInput = document.getElementById('sleep-quality');
const saveSleepBtn = document.getElementById('save-sleep-btn');
const themeToggleBtn = document.getElementById('theme-toggle');

// State
let gratitudes = [];
let sleepData = [];
let timerInterval = null;
let timerSeconds = 300; // 5 minutes default

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateUI();
    setupEventListeners();
    renderCharts();
    initTheme();
});

// Event Listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const target = link.getAttribute('data-tab');
            switchTab(target);
        });
    });

    document.querySelectorAll('.see-all').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(btn.getAttribute('data-target'));
        });
    });

    // Modal
    newEntryBtn.addEventListener('click', () => modal.classList.add('active'));
    closeModal.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Mood Selection (Dashboard)
    document.querySelectorAll('.card.mood-card .mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openEntryModalWithMood(btn.dataset.mood, btn.dataset.emoji);
        });
    });

    // Slider
    intensitySlider.addEventListener('input', (e) => {
        intensityValue.textContent = e.target.value;
    });

    // Save
    saveBtn.addEventListener('click', saveEntry);

    // Theme Toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Gratitude
    addGratitudeBtn.addEventListener('click', addGratitude);
    gratitudeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addGratitude();
    });

    // Timer
    timerToggleBtn.addEventListener('click', toggleTimer);
    timerResetBtn.addEventListener('click', resetTimer);

    // Sleep
    saveSleepBtn.addEventListener('click', saveSleep);

    // Settings / Data Management
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportData);

    const importInput = document.getElementById('import-input');
    if (importInput) importInput.addEventListener('change', importData);

    const importBtn = document.getElementById('import-btn');
    if (importBtn && importInput) importBtn.addEventListener('click', () => importInput.click());

    const clearBtn = document.getElementById('clear-data-btn');
    if (clearBtn) clearBtn.addEventListener('click', clearAllData);
}

// Logic
function loadData() {
    const saved = localStorage.getItem('mindcaps-entries');
    entries = saved ? JSON.parse(saved) : [];

    // Set Date
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString('en-US', options);

    // Set Greeting
    const hour = now.getHours();
    if (hour < 12) greetingText.textContent = "Good Morning!";
    else if (hour < 18) greetingText.textContent = "Good Afternoon!";
    else greetingText.textContent = "Good Evening!";

    displayRandomQuote();
    calculateStreak();

    // Load new data
    const savedGratitudes = localStorage.getItem('mindcaps-gratitudes');
    gratitudes = savedGratitudes ? JSON.parse(savedGratitudes) : [];
    
    const savedSleep = localStorage.getItem('mindcaps-sleep');
    sleepData = savedSleep ? JSON.parse(savedSleep) : [];

    renderGratitudes();
}

function updateUI() {
    renderEntriesList();
    renderGratitudes();
    updateCharts();
    calculateStreak();
}

// Gratitude Logic
function addGratitude() {
    const text = gratitudeInput.value.trim();
    if (!text) return;

    const entry = {
        id: Date.now(),
        text: text,
        date: new Date().toISOString()
    };

    gratitudes.unshift(entry);
    localStorage.setItem('mindcaps-gratitudes', JSON.stringify(gratitudes));
    gratitudeInput.value = '';
    renderGratitudes();
}

function renderGratitudes() {
    if (!gratitudeList) return;
    gratitudeList.innerHTML = gratitudes.map(g => `
        <li class="gratitude-item">
            <span>${g.text}</span>
            <button class="btn-text" onclick="deleteGratitude(${g.id})"><i class="fa-solid fa-xmark"></i></button>
        </li>
    `).join('');
}

window.deleteGratitude = (id) => {
    gratitudes = gratitudes.filter(g => g.id !== id);
    localStorage.setItem('mindcaps-gratitudes', JSON.stringify(gratitudes));
    renderGratitudes();
};

// Timer Logic
function toggleTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerToggleBtn.textContent = 'Start Timer';
    } else {
        timerToggleBtn.textContent = 'Pause Timer';
        timerInterval = setInterval(() => {
            timerSeconds--;
            updateTimerDisplay();
            if (timerSeconds <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                alert("Meditation session complete! How do you feel?");
                resetTimer();
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = 300;
    updateTimerDisplay();
    timerToggleBtn.textContent = 'Start Timer';
}

function updateTimerDisplay() {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Sleep Logic
function saveSleep() {
    const hours = parseFloat(sleepHoursInput.value);
    const quality = sleepQualityInput.value;

    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        hours,
        quality
    };

    sleepData.push(entry);
    localStorage.setItem('mindcaps-sleep', JSON.stringify(sleepData));
    alert("Sleep data logged!");
    updateCharts();
}

// Theme Logic
function initTheme() {
    const savedTheme = localStorage.getItem('mindcaps-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('mindcaps-theme', target);
    updateThemeIcon(target);
}

function updateThemeIcon(theme) {
    const icon = themeToggleBtn.querySelector('i');
    if (theme === 'dark') {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
}

function switchTab(tabId) {
    // Update Nav
    navLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Update View
    views.forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(`${tabId}-view`);
    if (targetView) targetView.classList.add('active');

    if (tabId === 'dashboard' || tabId === 'analytics') {
        updateCharts(); // Refresh charts to ensure size correctness
    }
}

function openEntryModalWithMood(mood, emoji) {
    document.getElementById('modal-mood-input').value = mood;
    document.getElementById('modal-selected-mood-emoji').textContent = emoji;
    document.getElementById('modal-selected-mood-label').textContent = mood;
    modal.classList.add('active');
}

function saveEntry() {
    const mood = document.getElementById('modal-mood-input').value;
    if (!mood) {
        alert("Please select a mood first from the dashboard!");
        modal.classList.remove('active');
        return;
    }

    const intensity = parseInt(intensitySlider.value);
    const note = noteInput.value.trim();
    const sentiment = analyzeSentiment(note);

    const newEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        mood,
        intensity,
        note,
        sentiment
    };

    entries.unshift(newEntry);
    localStorage.setItem('mindcaps-entries', JSON.stringify(entries));

    // Reset & Close
    noteInput.value = '';
    intensitySlider.value = 5;
    intensityValue.textContent = '5';
    modal.classList.remove('active');

    // Update UI
    updateUI();

    // Show Toast (Using simple alert for now, can be upgraded)
    // alert("Entry Saved!"); 
}

function analyzeSentiment(text) {
    if (!text) return 'neutral';
    const lower = text.toLowerCase();
    let score = 0;
    positive_words.forEach(w => { if (lower.includes(w)) score++; });
    negative_words.forEach(w => { if (lower.includes(w)) score--; });

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
}

function calculateStreak() {
    if (entries.length === 0) {
        streakCount.textContent = 0;
        return;
    }

    // Sort by date descending
    const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date().setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let lastDate = null;

    for (let entry of sorted) {
        const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);

        // If it's the first check
        if (!lastDate) {
            if (entryDate === today || entryDate === today - 86400000) {
                currentStreak = 1;
                lastDate = entryDate;
            }
            continue;
        }

        // Check if consecutive day
        if (entryDate === lastDate - 86400000) {
            currentStreak++;
            lastDate = entryDate;
        } else if (entryDate < lastDate - 86400000) {
            break; // Streak broken
        }
    }

    streakCount.textContent = currentStreak;
}

function displayRandomQuote() {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('quote-text').textContent = `"${quote}"`;
}

function renderEntriesList() {
    const list = document.getElementById('entries-list');
    const fullList = document.getElementById('full-journal-list');

    if (entries.length === 0) return;

    const generateHTML = (limit = null) => {
        const displayEntries = limit ? entries.slice(0, limit) : entries;
        return displayEntries.map(entry => {
            const dateObj = new Date(entry.date);
            const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const date = dateObj.toLocaleDateString();
            const emoji = getMoodEmoji(entry.mood);

            return `
                <div class="entry-item">
                    <div class="entry-info">
                        <div class="entry-emoji">${emoji}</div>
                        <div>
                            <span class="entry-note">${entry.mood} - ${entry.note.substring(0, 30)}${entry.note.length > 30 ? '...' : ''}</span>
                            <span class="entry-date">${date} at ${time}</span>
                        </div>
                    </div>
                    <div class="entry-meta">
                        <span class="sentiment-badge ${entry.sentiment}">${entry.sentiment}</span>
                    </div>
                </div>
            `;
        }).join('');
    };

    list.innerHTML = generateHTML(3); // Dashboard shows 3
    if (fullList) fullList.innerHTML = generateHTML(); // Journal shows all
}

function getMoodEmoji(mood) {
    const map = { 'Happy': '😊', 'Sad': '😢', 'Stressed': '😰', 'Calm': '😌', 'Excited': '🤩' };
    return map[mood] || '😐';
}

// Data Export/Import
function exportData() {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `mindcaps_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                // Merge strategies could be complex, simple concat for now or replace
                if (confirm("Replace current data? (Cancel to Merge)")) {
                    entries = imported;
                } else {
                    entries = [...imported, ...entries];
                }
                localStorage.setItem('mindcaps-entries', JSON.stringify(entries));
                updateUI();
                alert("Data imported successfully!");
            } else {
                alert("Invalid JSON format.");
            }
        } catch (err) {
            alert("Error parsing JSON file");
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm("Are you sure you want to delete ALL entries? This cannot be undone.")) {
        entries = [];
        localStorage.removeItem('mindcaps-entries');
        updateUI();
    }
}

// Chart.js Configuration
let weeklyChart, distributionChart, intensityChart;

function renderCharts() {
    // 1. Weekly Activity (Dashboard)
    const ctx1 = document.getElementById('weekly-mood-chart').getContext('2d');
    weeklyChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Entries',
                data: [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#6C5DD3',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, display: false },
                x: { grid: { display: false } }
            }
        }
    });

    // 2. Mood Distribution (Analytics)
    const ctx2 = document.getElementById('distribution-chart').getContext('2d');
    distributionChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Happy', 'Sad', 'Stressed', 'Calm', 'Excited'],
            datasets: [{
                data: [1, 1, 1, 1, 1], // Placeholder
                backgroundColor: ['#FFD93D', '#6C5DD3', '#FF6B6B', '#4D96FF', '#FF8E00'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'right', labels: { color: '#fff' } } }
        }
    });

    // 3. Intensity History (Analytics)
    const ctx3 = document.getElementById('intensity-chart').getContext('2d');
    intensityChart = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Intensity',
                data: [],
                borderColor: '#FF75A0',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(255, 117, 160, 0.2)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 10, grid: { color: 'rgba(255,255,255,0.1)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 4. Sleep Trends (Analytics)
    const ctx4 = document.getElementById('sleep-chart').getContext('2d');
    sleepChart = new Chart(ctx4, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Hours',
                data: [],
                borderColor: '#4D96FF',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(77, 150, 255, 0.2)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 12 },
                x: { grid: { display: false } }
            }
        }
    });
}

function updateCharts() {
    if (!weeklyChart) return;

    // Logic to populate chart data from 'entries' array
    // This is a simplified version for demonstration

    // Distribution
    const counts = { 'Happy': 0, 'Sad': 0, 'Stressed': 0, 'Calm': 0, 'Excited': 0 };
    entries.forEach(e => { if (counts[e.mood] !== undefined) counts[e.mood]++; });
    distributionChart.data.datasets[0].data = Object.values(counts);
    distributionChart.update();

    // Intensity
    const recent = entries.slice(0, 10).reverse();
    intensityChart.data.labels = recent.map(e => new Date(e.date).toLocaleDateString());
    intensityChart.data.datasets[0].data = recent.map(e => e.intensity);
    intensityChart.update();

    // Sleep
    const recentSleep = sleepData.slice(-7);
    sleepChart.data.labels = recentSleep.map(e => new Date(e.date).toLocaleDateString());
    sleepChart.data.datasets[0].data = recentSleep.map(e => e.hours);
    sleepChart.update();
}
