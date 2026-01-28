import tkinter as tk
import sqlite3
import threading
import time
import random
import csv 
from datetime import datetime

# Create or connect to SQLite database
conn = sqlite3.connect("mindcaps.db")
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS moods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mood TEXT,
    intensity INTEGER,
    note TEXT,
    sentiment INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")
conn.commit()

# Motivational quotes
quotes = [
    "You’re doing great!",
    "Take a deep breath.",
    "One step at a time.",
    "You matter.",
    "Progress, not perfection."
]

# Prompts for different moods
prompts = {
    "Happy": ["What made you smile today?", "Who did you enjoy spending time with?"],
    "Sad": ["What’s been bothering you?", "What would help you feel better?"],
    "Stressed": ["What’s causing pressure?", "Can you take a short break?"],
    "Angry": ["What triggered your anger?", "How can you release it safely?"],
    "Calm": ["What helped you stay calm?", "Can you repeat this tomorrow?"],
    "Excited": ["What are you looking forward to?", "What’s fueling your energy?"]
}

# Simple keyword-based sentiment analysis
positive_words = ["happy", "great", "calm", "excited", "love", "peace", "joy"]
negative_words = ["sad", "angry", "stressed", "tired", "hate", "anxious", "worried"]

def analyze_sentiment(note):
    note = note.lower()
    pos = sum(word in note for word in positive_words)
    neg = sum(word in note for word in negative_words)
    if pos > neg:
        return 1, "Positive mood detected 😊"
    elif neg > pos:
        return -1, "Negative mood detected 😟"
    else:
        return 0, "Neutral mood 😐"

# GUI setup
window = tk.Tk()
window.title("MindCaps - Mental Wellness App")
window.geometry("400x700") # Increased height to fit all elements
window.resizable(False, False)

# Mood selection
tk.Label(window, text="Select your mood:").pack(pady=5)
mood_var = tk.StringVar(window)
mood_var.set("Happy") # Default value
mood_menu = tk.OptionMenu(window, mood_var, "Happy", "Sad", "Stressed", "Excited", "Angry", "Calm")
mood_menu.pack()

# Intensity slider
tk.Label(window, text="Rate intensity (1–10):").pack(pady=5)
intensity = tk.Scale(window, from_=1, to=10, orient=tk.HORIZONTAL)
intensity.pack()

# Note box
tk.Label(window, text="Write a note:").pack(pady=5)
note_box = tk.Text(window, height=4, width=40)
note_box.pack()

# Result label
result_label = tk.Label(window, text="", fg="blue", wraplength=380)
result_label.pack(pady=5)

# Prompt label
prompt_label = tk.Label(window, text="", fg="green", wraplength=380)
prompt_label.pack(pady=5)

# Functions
def save_entry():
    mood = mood_var.get()
    level = intensity.get()
    note = note_box.get("1.0", tk.END).strip()
    
    if mood and note:
        sentiment_score, sentiment_text = analyze_sentiment(note)
        cursor.execute("INSERT INTO moods (mood, intensity, note, sentiment) VALUES (?, ?, ?, ?)",
                       (mood, level, note, sentiment_score))
        conn.commit()
        
        quote = random.choice(quotes)
        prompt = random.choice(prompts.get(mood, ["Write about your day."]))
        
        # Smart feedback
        advice = ""
        if mood in ["Sad", "Stressed", "Angry"] and sentiment_score < 0:
            advice = "You seem overwhelmed. Try a breathing exercise or write more."
        elif sentiment_score > 0 and mood in ["Happy", "Excited"]:
            advice = "Keep up the good vibes! 😊"
        else:
            advice = "Thanks for checking in. Stay mindful."

        result_label.config(text=f"{sentiment_text}\nSaved! Quote: {quote}\n{advice}")
        prompt_label.config(text=f"Journaling Prompt: {prompt}")
        note_box.delete("1.0", tk.END)
    else:
        result_label.config(text="Please select a mood and write a note.")

def show_trend():
    cursor.execute("SELECT mood, sentiment, timestamp FROM moods ORDER BY timestamp DESC LIMIT 5")
    rows = cursor.fetchall()
    if rows:
        trend = "\n".join([f"{r[2][:10]}: {r[0]} ({'😊' if r[1]==1 else '😟' if r[1]==-1 else '😐'})" for r in rows])
        result_label.config(text=f"Recent Mood Trend:\n{trend}")
    else:
        result_label.config(text="No entries yet.")

def breathing_exercise():
    def run():
        btn_breathing.config(state=tk.DISABLED)
        for _ in range(3):
            result_label.config(text="Inhale... (4s)")
            time.sleep(4)
            result_label.config(text="Hold... (4s)")
            time.sleep(4)
            result_label.config(text="Exhale... (4s)")
            time.sleep(4)
        result_label.config(text="Done! You’re calm now.")
        btn_breathing.config(state=tk.NORMAL)
    threading.Thread(target=run).start()

def export_data():
    try:
        cursor.execute("SELECT * FROM moods")
        rows = cursor.fetchall()
        filename = f"mood_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['ID', 'Mood', 'Intensity', 'Note', 'Sentiment', 'Timestamp'])
            writer.writerows(rows)
        result_label.config(text=f"Successfully exported to {filename}")
    except Exception as e:
        result_label.config(text=f"Error exporting data: {e}")

# Buttons
tk.Button(window, text="Save Mood", command=save_entry).pack(pady=5)
tk.Button(window, text="Show Mood Trend", command=show_trend).pack(pady=5)
btn_breathing = tk.Button(window, text="Start Breathing Exercise", command=breathing_exercise)
btn_breathing.pack(pady=5)
tk.Button(window, text="Export to CSV", command=export_data, bg="#e1f5fe").pack(pady=10)

# Run the app
window.mainloop()
