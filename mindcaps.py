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
        sentiment INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    # New Tables for Enhancements
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gratitudes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sleep (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hours REAL,
        quality TEXT,
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

# Logic
def analyze_sentiment(note):
    positive_words = ["happy", "great", "calm", "excited", "love", "peace", "joy", "good", "proud"]
    negative_words = ["sad", "angry", "stressed", "tired", "hate", "anxious", "worried", "bad", "awful"]
    note = note.lower()
    pos = sum(word in note for word in positive_words)
    neg = sum(word in note for word in negative_words)
    if pos > neg: return "positive", 1
    elif neg > pos: return "negative", -1
    else: return "neutral", 0

# GUI Application
class MindCapsApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("MindCaps Desktop")
        self.geometry("600x900")
        self.configure(bg=COLORS["bg"])
        
        # Style
        self.style = ttk.Style()
        self.style.theme_use('clam')
        self.style.configure("TFrame", background=COLORS["bg"])
        self.style.configure("TLabel", background=COLORS["bg"], foreground=COLORS["text"], font=("Segoe UI", 10))
        self.style.configure("TButton", font=("Segoe UI", 10, "bold"))
        
        self.create_widgets()
        
    def create_widgets(self):
        # Header
        header = tk.Frame(self, bg=COLORS["primary"], height=80)
        header.pack(fill=tk.X)
        tk.Label(header, text="MindCaps", font=("Segoe UI", 20, "bold"), bg=COLORS["primary"], fg="white").pack(pady=20)
        
        # Scrollable Main Area
        canvas = tk.Canvas(self, bg=COLORS["bg"], highlightthickness=0)
        scrollbar = ttk.Scrollbar(self, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True, padx=20, pady=20)
        scrollbar.pack(side="right", fill="y")

        main_frame = scrollable_frame
        
        # 1. Mood Selection
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
        self.note_text = tk.Text(main_frame, height=4, width=50, font=("Segoe UI", 10))
        self.note_text.pack(fill=tk.X)
        
        tk.Button(main_frame, text="Save Journal Entry", bg=COLORS["primary"], fg="white", 
                  font=("Segoe UI", 11, "bold"), bd=0, padx=20, pady=10, command=self.save_entry).pack(pady=10, fill=tk.X)

        # 2. Daily Gratitude
        ttk.Separator(main_frame, orient='horizontal').pack(fill=tk.X, pady=15)
        ttk.Label(main_frame, text="Daily Gratitude", font=("Segoe UI", 11, "bold")).pack(pady=5)
        self.gratitude_entry = ttk.Entry(main_frame)
        self.gratitude_entry.pack(fill=tk.X, pady=5)
        tk.Button(main_frame, text="Add Gratitude", bg=COLORS["secondary"], fg="white", bd=0, pady=5, command=self.add_gratitude).pack(fill=tk.X)

        # 3. Sleep Tracker
        ttk.Separator(main_frame, orient='horizontal').pack(fill=tk.X, pady=15)
        ttk.Label(main_frame, text="Sleep Tracker", font=("Segoe UI", 11, "bold")).pack(pady=5)
        
        sleep_frame = ttk.Frame(main_frame)
        sleep_frame.pack(fill=tk.X)
        ttk.Label(sleep_frame, text="Hours:").pack(side=tk.LEFT)
        self.sleep_hours = ttk.Spinbox(sleep_frame, from_=0, to=24, increment=0.5, width=5)
        self.sleep_hours.set(8)
        self.sleep_hours.pack(side=tk.LEFT, padx=5)
        
        ttk.Label(sleep_frame, text="Quality:").pack(side=tk.LEFT, padx=5)
        self.sleep_quality = ttk.Combobox(sleep_frame, values=["Great", "Good", "Fair", "Poor"], width=10)
        self.sleep_quality.set("Good")
        self.sleep_quality.pack(side=tk.LEFT)
        
        tk.Button(main_frame, text="Log Sleep", bg=COLORS["success"], fg="white", bd=0, pady=5, command=self.log_sleep).pack(fill=tk.X, pady=10)

        # 4. Tools
        ttk.Separator(main_frame, orient='horizontal').pack(fill=tk.X, pady=15)
        ttk.Label(main_frame, text="Tools", font=("Segoe UI", 11, "bold")).pack(pady=5)
        
        tools_frame = ttk.Frame(main_frame)
        tools_frame.pack(fill=tk.X)
        tk.Button(tools_frame, text="Breathing", bg=COLORS["primary"], fg="white", bd=0, pady=5, command=self.breathing_exercise).pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)
        tk.Button(tools_frame, text="Export JSON", bg=COLORS["warning"], fg="white", bd=0, pady=5, command=self.export_json).pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)
        tk.Button(tools_frame, text="Analytics", bg=COLORS["text"], fg="white", bd=0, pady=5, command=self.show_analytics).pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)

        self.feedback_label = tk.Label(main_frame, text="Ready to track your day!", bg=COLORS["bg"], font=("Segoe UI", 9, "italic"))
        self.feedback_label.pack(pady=20)

    def save_entry(self):
        mood = self.mood_var.get()
        intensity = self.intensity_scale.get()
        note = self.note_text.get("1.0", tk.END).strip()
        if not note:
            messagebox.showwarning("Warning", "Please write a note.")
            return
        sentiment, score = analyze_sentiment(note)
        cursor.execute("INSERT INTO moods (mood, intensity, note, sentiment, timestamp) VALUES (?, ?, ?, ?, ?)",
                       (mood, intensity, note, score, datetime.now()))
        conn.commit()
        self.note_text.delete("1.0", tk.END)
        self.feedback_label.config(text=f"Journal saved! Sentiment: {sentiment}")

    def add_gratitude(self):
        text = self.gratitude_entry.get().strip()
        if text:
            cursor.execute("INSERT INTO gratitudes (text, timestamp) VALUES (?, ?)", (text, datetime.now()))
            conn.commit()
            self.gratitude_entry.delete(0, tk.END)
            self.feedback_label.config(text="Gratitude added!")

    def log_sleep(self):
        hours = self.sleep_hours.get()
        quality = self.sleep_quality.get()
        cursor.execute("INSERT INTO sleep (hours, quality, timestamp) VALUES (?, ?, ?)", (hours, quality, datetime.now()))
        conn.commit()
        self.feedback_label.config(text=f"Sleep logged: {hours}h ({quality})")

    def breathing_exercise(self):
        win = tk.Toplevel(self)
        win.title("Breathing")
        win.geometry("300x200")
        win.configure(bg=COLORS["bg"])
        lbl = tk.Label(win, text="Inhale...", font=("Segoe UI", 16), bg=COLORS["bg"])
        lbl.pack(expand=True)
        def run_cycle():
            steps = [("Inhale...", 4), ("Hold...", 4), ("Exhale...", 4)]
            for _ in range(3):
                for text, dur in steps:
                    if not win.winfo_exists(): return
                    lbl.config(text=text)
                    win.update()
                    time.sleep(dur)
            if win.winfo_exists(): lbl.config(text="Done.")
        threading.Thread(target=run_cycle, daemon=True).start()

    def export_json(self):
        cursor.execute("SELECT mood, intensity, note, sentiment, timestamp FROM moods")
        moods = [{"type": "mood", "mood": r[0], "intensity": r[1], "note": r[2], "sentiment": r[3], "date": r[4]} for r in cursor.fetchall()]
        
        cursor.execute("SELECT text, timestamp FROM gratitudes")
        grats = [{"type": "gratitude", "text": r[0], "date": r[1]} for r in cursor.fetchall()]
        
        cursor.execute("SELECT hours, quality, timestamp FROM sleep")
        sleep = [{"type": "sleep", "hours": r[0], "quality": r[1], "date": r[2]} for r in cursor.fetchall()]
        
        all_data = moods + grats + sleep
        filename = filedialog.asksaveasfilename(defaultextension=".json")
        if filename:
            with open(filename, "w") as f:
                json.dump(all_data, f, indent=2)
            messagebox.showinfo("Success", "Data exported.")

    def show_analytics(self):
        cursor.execute("SELECT mood, COUNT(*) FROM moods GROUP BY mood")
        rows = cursor.fetchall()
        if not rows: return
        moods = [r[0] for r in rows]
        counts = [r[1] for r in rows]
        plt.figure(figsize=(6, 4))
        plt.bar(moods, counts, color=COLORS["primary"])
        plt.title("Mood Distribution")
        plt.show()

if __name__ == "__main__":
    app = MindCapsApp()
    app.mainloop()

if __name__ == "__main__":
    app = MindCapsApp()
    app.mainloop()
