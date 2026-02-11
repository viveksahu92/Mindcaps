import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import sqlite3
import threading
import time
import random
import csv 
import json 
from datetime import datetime
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

# Database Setup
def init_db():
    conn = sqlite3.connect("mindcaps.db")
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS moods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mood TEXT,
        intensity INTEGER,
        note TEXT,
        sentiment INTEGER, -- Stored as 1 (pos), -1 (neg), 0 (neutral) inside logic, but let's standardize
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    return conn

conn = init_db()
cursor = conn.cursor()

# Theme Colors (Matching Web App)
COLORS = {
    "bg": "#f7fafc",
    "primary": "#6C5DD3",
    "secondary": "#8B5CF6",
    "text": "#2D3748",
    "white": "#ffffff",
    "success": "#48BB78",
    "warning": "#ED8936",
    "danger": "#F56565"
}

# Assets
QUOTES = [
    "You're doing great!", "Take a deep breath.", "One step at a time.", "You matter.",
    "Progress, not perfection.", "Be kind to yourself.", "Every moment is a fresh beginning."
]

PROMPTS = {
    "Happy": ["What made you smile today?", "Who did you enjoy spending time with?"],
    "Sad": ["What's been bothering you?", "What would help you feel better?"],
    "Stressed": ["What's causing pressure?", "Can you take a short break?"],
    "Angry": ["What triggered your anger?", "How can you release it safely?"],
    "Calm": ["What helped you stay calm?", "Can you repeat this tomorrow?"],
    "Excited": ["What are you looking forward to?", "What's fueling your energy?"]
}

POSITIVE_WORDS = ["happy", "great", "calm", "excited", "love", "peace", "joy", "good", "proud"]
NEGATIVE_WORDS = ["sad", "angry", "stressed", "tired", "hate", "anxious", "worried", "bad", "awful"]

# Logic
def analyze_sentiment(note):
    note = note.lower()
    pos = sum(word in note for word in POSITIVE_WORDS)
    neg = sum(word in note for word in NEGATIVE_WORDS)
    if pos > neg: return "positive", 1
    elif neg > pos: return "negative", -1
    else: return "neutral", 0

# GUI Application
class MindCapsApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("MindCaps Desktop")
        self.geometry("500x800")
        self.configure(bg=COLORS["bg"])
        self.resizable(False, True)
        
        # Style
        self.style = ttk.Style()
        self.style.theme_use('clam')
        self.style.configure("TFrame", background=COLORS["bg"])
        self.style.configure("TLabel", background=COLORS["bg"], foreground=COLORS["text"], font=("Segoe UI", 10))
        self.style.configure("TButton", font=("Segoe UI", 10, "bold"), background=COLORS["primary"], foreground=COLORS["white"])
        self.style.map("TButton", background=[("active", COLORS["secondary"])])
        
        self.create_widgets()
        
    def create_widgets(self):
        # Header
        header = tk.Frame(self, bg=COLORS["primary"], height=80)
        header.pack(fill=tk.X)
        tk.Label(header, text="MindCaps", font=("Segoe UI", 20, "bold"), bg=COLORS["primary"], fg="white").pack(pady=20)
        
        main_frame = ttk.Frame(self)
        main_frame.pack(padx=20, pady=20, fill=tk.BOTH, expand=True)
        
        # Mood Selection
        ttk.Label(main_frame, text="How are you feeling?", font=("Segoe UI", 12, "bold")).pack(pady=5)
        self.mood_var = tk.StringVar(value="Happy")
        mood_frame = ttk.Frame(main_frame)
        mood_frame.pack(pady=10)
        
        moods = ["Happy", "Sad", "Stressed", "Calm", "Excited"]
        for m in moods:
            rb = tk.Radiobutton(mood_frame, text=m, variable=self.mood_var, value=m, 
                                bg=COLORS["bg"], font=("Segoe UI", 10), indicatoron=0, 
                                width=8, selectcolor=COLORS["secondary"], activebackground=COLORS["bg"])
            rb.pack(side=tk.LEFT, padx=2)
            
        # Intensity
        ttk.Label(main_frame, text="Intensity (1-10)").pack(pady=(15, 5))
        self.intensity_scale = tk.Scale(main_frame, from_=1, to=10, orient=tk.HORIZONTAL, bg=COLORS["bg"], highlightthickness=0)
        self.intensity_scale.set(5)
        self.intensity_scale.pack(fill=tk.X)
        
        # Note
        ttk.Label(main_frame, text="Journal Note").pack(pady=(15, 5))
        self.note_text = tk.Text(main_frame, height=5, width=40, font=("Segoe UI", 10))
        self.note_text.pack(fill=tk.X)
        
        # Action Button
        submit_btn = tk.Button(main_frame, text="Save Entry", bg=COLORS["primary"], fg="white", 
                               font=("Segoe UI", 11, "bold"), bd=0, padx=20, pady=10, command=self.save_entry)
        submit_btn.pack(pady=20, fill=tk.X)
        
        # Feedback Area
        self.feedback_label = tk.Label(main_frame, text="", bg=COLORS["bg"], fg=COLORS["primary"], font=("Segoe UI", 10, "italic"))
        self.feedback_label.pack(pady=5)

        # Tools Section
        ttk.Separator(main_frame, orient='horizontal').pack(fill=tk.X, pady=15)
        ttk.Label(main_frame, text="Tools & Data", font=("Segoe UI", 11, "bold")).pack(pady=5)
        
        tools_frame = ttk.Frame(main_frame)
        tools_frame.pack(fill=tk.X)
        
        tk.Button(tools_frame, text="Breathing Exercise", bg=COLORS["success"], fg="white", bd=0, padx=10, pady=5, command=self.breathing_exercise).pack(side=tk.LEFT, padx=2, expand=True, fill=tk.X)
        tk.Button(tools_frame, text="Export JSON", bg=COLORS["warning"], fg="white", bd=0, padx=10, pady=5, command=self.export_json).pack(side=tk.LEFT, padx=2, expand=True, fill=tk.X)
        tk.Button(tools_frame, text="Analytics", bg=COLORS["text"], fg="white", bd=0, padx=10, pady=5, command=self.show_analytics).pack(side=tk.LEFT, padx=2, expand=True, fill=tk.X)

    def save_entry(self):
        mood = self.mood_var.get()
        intensity = self.intensity_scale.get()
        note = self.note_text.get("1.0", tk.END).strip()
        
        if not note:
            messagebox.showwarning("Missing Input", "Please write a note.")
            return

        sentiment, score = analyze_sentiment(note)
        
        cursor.execute("INSERT INTO moods (mood, intensity, note, sentiment, timestamp) VALUES (?, ?, ?, ?, ?)",
                       (mood, intensity, note, score, datetime.now()))
        conn.commit()
        
        # UI Feedback
        self.note_text.delete("1.0", tk.END)
        quote = random.choice(QUOTES)
        self.feedback_label.config(text=f"Saved! {sentiment.title()} vibe.\n\"{quote}\"")

    def breathing_exercise(self):
        win = tk.Toplevel(self)
        win.title("Breathing")
        win.geometry("300x200")
        win.configure(bg=COLORS["bg"])
        
        lbl = tk.Label(win, text="Get ready...", font=("Segoe UI", 16), bg=COLORS["bg"])
        lbl.pack(expand=True)
        
        def run_cycle():
            steps = [("Inhale...", 4), ("Hold...", 4), ("Exhale...", 4)]
            for _ in range(3):
                for text, dur in steps:
                    lbl.config(text=text)
                    win.update()
                    time.sleep(dur)
            lbl.config(text="Complete.")
            
        threading.Thread(target=run_cycle, daemon=True).start()

    def export_json(self):
        """Export data in format compatible with Web App"""
        cursor.execute("SELECT id, mood, intensity, note, sentiment, timestamp FROM moods")
        rows = cursor.fetchall()
        
        # Web App expects: [ {id, date, mood, intensity, note, sentiment: 'positive'|'neutral'|'negative'} ]
        export_data = []
        for r in rows:
            formatted_date = r[5]
            # Convert numeric sentiment back to string if needed by web app logic or keep consistent
            sent_str = "neutral"
            if r[4] == 1: sent_str = "positive"
            if r[4] == -1: sent_str = "negative"
            
            export_data.append({
                "id": r[0],
                "date": formatted_date, # Web app uses ISO string, SQLite uses default string usually.
                "mood": r[1],
                "intensity": r[2],
                "note": r[3],
                "sentiment": sent_str
            })
            
        filename = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON Files", "*.json")])
        if filename:
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(export_data, f, indent=2)
            messagebox.showinfo("Success", "Data exported successfully! You can import this into the MindCaps Web App.")

    def show_analytics(self):
        cursor.execute("SELECT mood, COUNT(*) FROM moods GROUP BY mood")
        rows = cursor.fetchall()
        if not rows:
            messagebox.showinfo("Info", "No data to analyze.")
            return
            
        moods = [r[0] for r in rows]
        counts = [r[1] for r in rows]
        
        plt.figure(figsize=(6, 6))
        plt.pie(counts, labels=moods, autopct='%1.1f%%', startangle=140, colors=[COLORS["primary"], COLORS["secondary"], COLORS["success"], COLORS["warning"], COLORS["danger"]])
        plt.title("Mood Distribution")
        plt.show()

if __name__ == "__main__":
    app = MindCapsApp()
    app.mainloop()
