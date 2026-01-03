from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__, static_folder='.')
CORS(app)

DB_FILE = 'habits.db'

def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS habits
                     (id INTEGER PRIMARY KEY, name TEXT, icon TEXT, color TEXT)''')
        c.execute('''CREATE TABLE IF NOT EXISTS checks
                     (habit_id INTEGER, date TEXT, PRIMARY KEY (habit_id, date))''')
        conn.commit()
        
        # Seed initial data if empty
        c.execute('SELECT count(*) FROM habits')
        if c.fetchone()[0] == 0:
            initial_habits = [
                (1, "5:30 AM Wake Up", "bi-alarm", "#f87171"),
                (2, "Stop smoking green", "bi-flower1", "#4ade80"),
                (3, "No Porn", "bi-droplet", "#60a5fa"),
                (4, "Budget Tracking", "bi-piggy-bank", "#fbbf24"),
                (5, "No Alcohol", "bi-cup-straw", "#a855f7"),
                (6, "No social media", "bi-phone-vibrate", "#f43f5e"),
                (7, "Project Work", "bi-bullseye", "#2563eb"),
                (8, "Read 10 Pages", "bi-book", "#f59e0b"),
                (9, "Cold Shower", "bi-snow", "#06b6d4"),
                (10, "Work Session", "bi-laptop", "#8b5cf6")
            ]
            c.executemany('INSERT INTO habits VALUES (?,?,?,?)', initial_habits)
            conn.commit()

# Initialize DB on start
init_db()

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# Routes
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/habits', methods=['GET'])
def get_habits():
    conn = get_db_connection()
    habits = conn.execute('SELECT * FROM habits').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in habits])

@app.route('/api/habits', methods=['POST'])
def add_habit():
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Name is required'}), 400
    
    conn = get_db_connection()
    # Find max id to simple increment or let sqlite do it
    # We will let sqlite autoincrement but we defined id safely? 
    # Actually let's just insert
    cursor = conn.execute('INSERT INTO habits (name, icon, color) VALUES (?, ?, ?)', 
                          (name, "bi-pencil-square", "#000000"))
    new_id = cursor.lastrowid
    conn.commit()
    
    new_habit = conn.execute('SELECT * FROM habits WHERE id = ?', (new_id,)).fetchone()
    conn.close()
    return jsonify(dict(new_habit))

@app.route('/api/habits/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM habits WHERE id = ?', (habit_id,))
    conn.execute('DELETE FROM checks WHERE habit_id = ?', (habit_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/checks', methods=['GET'])
def get_checks():
    conn = get_db_connection()
    checks = conn.execute('SELECT * FROM checks').fetchall()
    conn.close()
    
    # Format as checkData: "id-date": true
    check_data = {}
    for row in checks:
        key = f"{row['habit_id']}-{row['date']}"
        check_data[key] = True
        
    return jsonify(check_data)

@app.route('/api/checks/toggle', methods=['POST'])
def toggle_check():
    data = request.json
    habit_id = data.get('habitId')
    date_str = data.get('date')
    
    conn = get_db_connection()
    existing = conn.execute('SELECT * FROM checks WHERE habit_id = ? AND date = ?', (habit_id, date_str)).fetchone()
    
    if existing:
        conn.execute('DELETE FROM checks WHERE habit_id = ? AND date = ?', (habit_id, date_str))
        status = False
    else:
        conn.execute('INSERT INTO checks (habit_id, date) VALUES (?, ?)', (habit_id, date_str))
        status = True
        
    conn.commit()
    conn.close()
    return jsonify({'checked': status})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
