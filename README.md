# 🧠 MindCaps - Mental Wellness App

<p align="center">
  <strong>AI-powered mental wellness app for mood tracking and journaling</strong>
</p>

<p align="center">
  An intelligent emotional support application built with Python (Tkinter) and JavaScript (Web Version) featuring sentiment analysis, mood tracking, and personalized wellness tools.
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Features

- **Mood Tracking**: Track your emotional state with 6 different mood options (Happy, Sad, Stressed, Angry, Calm, Excited)
- **Intensity Rating**: Rate the intensity of your mood on a scale of 1-10
- **Journaling**: Write detailed notes about your feelings and experiences
- **Sentiment Analysis**: AI-powered keyword-based sentiment detection (Positive/Negative/Neutral)
- **Smart Prompts**: Context-aware journaling prompts based on your selected mood

### 📊 Analytics & Insights

- **Mood Trends**: Visualize your mood patterns over time
- **Visual Graphs**: Line charts showing intensity over time
- **Pie Charts**: Mood distribution analysis
- **Daily Statistics**: Comprehensive daily mood breakdown
- **Recent Entries**: Quick view of your last 10 mood entries

### 🌟 Wellness Tools

- **Motivational Quotes**: Inspiring daily affirmations
- **Breathing Exercise**: Guided 4-4-4 breathing technique (3 rounds)
- **Data Export**: Export your mood history to CSV for backup or analysis
- **Offline Support**: All data stored locally - no internet required
- **Privacy First**: Your data never leaves your device

---

## 🎥 Demo

### Web Version
Open `index.html` in your browser to access the modern web interface with:
- Beautiful gradient UI
- Real-time sentiment analysis
- Responsive design for mobile and desktop
- LocalStorage-based data persistence

### Desktop Version
Run `mindcaps.py` for the Tkinter desktop application with:
- SQLite database for robust data storage
- Matplotlib visualizations
- Breathing exercise with threading
- Cross-platform compatibility

---

## 🛠️ Tech Stack

### Web Version
- **Frontend**: HTML5, CSS3 (with CSS Variables), Vanilla JavaScript
- **Storage**: Browser LocalStorage API
- **Styling**: Modern gradient design with animations

### Desktop Version
- **Language**: Python 3.x
- **GUI**: Tkinter
- **Database**: SQLite3
- **Visualization**: Matplotlib
- **Threading**: For non-blocking breathing exercises

---

## 📥 Installation

### Prerequisites

#### For Web Version:
- Any modern web browser (Chrome, Firefox, Safari, Edge)

#### For Desktop Version:
- Python 3.7 or higher
- pip (Python package manager)

### Setup Instructions

#### Web Version:
```bash
# Clone the repository
git clone https://github.com/viveksahu92/Mindcaps.git
cd Mindcaps

# Open in browser
# Simply open index.html in your web browser
```

#### Desktop Version:
```bash
# Clone the repository
git clone https://github.com/viveksahu92/Mindcaps.git
cd Mindcaps

# Install required packages
pip install matplotlib

# Run the application
python mindcaps.py
```

---

## 🚀 Usage

### Web Application

1. **Open the App**: Launch `index.html` in your browser
2. **Select Your Mood**: Click on one of the 6 mood buttons
3. **Rate Intensity**: Adjust the slider from 1-10
4. **Write Your Note**: Share your thoughts in the text area (minimum 10 characters)
5. **Save Entry**: Click "Save Entry" to store your mood
6. **View Analytics**: Check your mood statistics and trends
7. **Export Data**: Download your mood history as CSV

### Desktop Application

1. **Launch the App**: Run `python mindcaps.py`
2. **Select Mood**: Choose from the dropdown menu
3. **Set Intensity**: Use the slider (1-10)
4. **Write Note**: Enter your feelings in the text box
5. **Save**: Click "Save Mood"
6. **View Trends**: Use buttons to see:
   - Text-based mood trend
   - Visual line graph
   - Mood pie chart
   - Daily statistics
7. **Breathing Exercise**: Click to start guided breathing
8. **Export**: Save your data as CSV

---

## 📁 Project Structure

```
Mindcaps/
│
├── index.html          # Web app main page
├── script.js           # Web app JavaScript logic
├── styles.css          # Web app styling
│
├── mindcaps.py         # Desktop app (Tkinter)
├── mindcaps.db         # SQLite database (auto-created)
│
├── README.md           # Project documentation
└── author              # Author information
```

---

## 🔧 Configuration

### Web Version
- Data stored in browser's LocalStorage
- Maximum storage: ~5-10MB (browser dependent)
- Clear data: Use browser's developer tools or clear site data

### Desktop Version
- Database: `mindcaps.db` (SQLite)
- Window size: 400x750 pixels
- CSV exports: Timestamped files in project directory

---

## 🎨 Customization

### Changing Colors (Web)
Edit `styles.css` CSS variables:
```css
:root {
    --primary-color: #667eea;    /* Main theme color */
    --secondary-color: #764ba2;  /* Secondary theme */
    --success-color: #48bb78;    /* Success messages */
    --danger-color: #f56565;     /* Error messages */
}
```

### Adding Moods
1. Update prompts object in both `script.js` and `mindcaps.py`
2. Add mood button in `index.html`
3. Add emoji mapping in `getMoodEmoji()` function

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Save mood entry with all moods
- [ ] Test intensity slider (1-10)
- [ ] Verify sentiment analysis with positive/negative words
- [ ] Check data persistence after page reload
- [ ] Test CSV export functionality
- [ ] Verify breathing exercise timing
- [ ] Test responsive design on mobile
- [ ] Check analytics calculations

---

## 🐛 Known Issues & Fixes

All major issues have been fixed in the latest version:
- ✅ Database connection properly closed on exit
- ✅ Thread-safe GUI updates in breathing exercise
- ✅ LocalStorage error handling implemented
- ✅ Input validation added
- ✅ Memory leaks in matplotlib resolved
- ✅ Copyright year updated to 2026

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👤 Author

**Vivek Sahu**
- GitHub: [@viveksahu92](https://github.com/viveksahu92)
- Project: [Mindcaps](https://github.com/viveksahu92/Mindcaps)

---

## 🙏 Acknowledgments

- Built as part of Winter of Contributing initiative
- Inspired by mental health awareness and digital wellness
- Icons and emojis: Unicode Standard

---

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Known Issues](#-known-issues--fixes) section
2. Open an issue on GitHub
3. Review closed issues for solutions

---

## 🌟 Star History

If you find this project helpful, please consider giving it a star ⭐

---

<p align="center">
  Made with ❤️ for mental wellness
</p>

