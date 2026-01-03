# ⚡ Level Up Life - Gamified Habit Tracker

**Turn your daily habits into a game.**  
"Level Up Life" is a minimalist, Excel-themed habit tracker that helps you build consistency through gamification. Track your daily tasks, earn XP, and level up as you improve yourself.

## 🚀 Features

*   **Gamification System**: Earn XP for every habit you complete. Level up your profile as you stay consistent.
*   **Excel-Like Aesthetic**: A clean, high-contrast, black-and-white interface designed for focus and productivity.
*   **Persistence**: Powered by a **SQLite database**, ensuring your progress is always saved safely.
*   **Analytics Dashboard**: Visualize your daily progress with circular progress rings and consistency analysis.
*   **Custom Habits**: Add and delete your own custom habits to track what matters to you.
*   **Dynamic Calendar**: specific month/day tracking that adjusts to the current date.

## 🛠️ Tech Stack

*   **Frontend**: React.js (Component-based UI), Vanilla CSS (Custom design system).
*   **Backend**: Python Flask (REST API).
*   **Database**: SQLite (Relation data storage).

## 🏃‍♂️ Run Locally

1.  **Clone the repository**
    ```bash
    git clone https://github.com/alcho-prof/habit_tracker.git
    cd habit_tracker
    ```

2.  **Setup Backend (Python)**
    ```bash
    # Create virtual environment
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`

    # Install dependencies
    pip install -r requirements.txt

    # Run the server
    python server.py
    ```
    The backend will start on `http://localhost:8080` (or the port defined in environment).

3.  **Run Frontend**
    Since this is a simple React app bundled in a single file for this version, it is served directly by the Flask backend.
    
    Simply open **http://localhost:8080** in your browser once the Python server is running.

## 🌍 Deployment

 This project is configured for **One-Click Deployment** on Render.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/alcho-prof/habit_tracker)

1.  Click the button above.
2.  Connect your GitHub account.
3.  Render will automatically build the Python environment and start the app.

## 📂 Project Structure

*   `app.jsx`: Main React application logic.
*   `server.py`: Flask backend and database management.
*   `styles.css`: Custom CSS styling.
*   `habits.db`: SQLite database file (created automatically).
*   `render.yaml`: Deployment blueprint for Render.

---
*Built with consistency and code.*
