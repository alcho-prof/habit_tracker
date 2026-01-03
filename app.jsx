const { useState, useEffect, useMemo } = React;

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// --- Utility Functions ---
const getFormattedDate = (date) => {
    return date.toISOString().split('T')[0];
};

const getRecentDays = (count = 4) => {
    const days = [];
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
            day: FULL_DAYS[d.getDay()],
            date: getFormattedDate(d),
            obj: d
        });
    }
    return days;
};

const calculateLevel = (checkData) => {
    const totalChecks = Object.values(checkData).filter(Boolean).length;
    const xpPerCheck = 15;
    const currentXP = totalChecks * xpPerCheck;
    const level = Math.floor(currentXP / 100) + 1;
    const xpForNextLevel = level * 100;
    const progress = (currentXP % 100); // Simple 100 XP per level for now

    return { level, currentXP, xpForNextLevel, progress };
};

// --- Utility Components ---

const Icon = ({ name }) => {
    return <span>{name}</span>;
}

const ProgressBar = ({ current, total, color = "var(--accent-green)", label }) => {
    const pct = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;
    return (
        <div className="analysis-row">
            <div style={{ width: '120px', fontSize: '0.85rem', color: 'var(--text-main)' }}>{label}</div>
            <div className="bar-bg">
                <div
                    className="bar-fill"
                    style={{ width: `${pct}%`, background: color }}
                ></div>
            </div>
            <div style={{ width: '50px', marginLeft: 'auto', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {Math.round(pct)}%
            </div>
        </div>
    );
};

const CircularProgress = ({ value, label, subLabel }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="progress-ring-container">
            <svg height="150" width="150" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    className="ring-bg"
                    strokeWidth="10"
                    r={radius}
                    cx="75"
                    cy="75"
                />
                <circle
                    className="ring-progress"
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset: offset }}
                    r={radius}
                    cx="75"
                    cy="75"
                />
            </svg>
            <div className="ring-text" style={{ transform: 'none' }}>
                <div style={{ fontSize: '1.5rem', lineHeight: '1' }}>{value}%</div>
                {subLabel && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>{subLabel}</div>}
            </div>
        </div>
    );
};

// --- API Helpers ---
const API = {
    getHabits: async () => {
        const res = await fetch('/api/habits');
        return res.json();
    },
    addHabit: async (name) => {
        const res = await fetch('/api/habits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        return res.json();
    },
    deleteHabit: async (id) => {
        await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    },
    getChecks: async () => {
        const res = await fetch('/api/checks');
        return res.json();
    },
    toggleCheck: async (habitId, date) => {
        const res = await fetch('/api/checks/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ habitId, date })
        });
        return res.json();
    }
};

// --- Main Views ---

const HabitTrackerView = ({ habits, checkData, toggleCheck, monthDays, addNewHabit, deleteHabit }) => {
    const [newHabitName, setNewHabitName] = useState("");

    const handleAdd = (e) => {
        e.preventDefault();
        addNewHabit(newHabitName);
        setNewHabitName("");
    }

    return (
        <div className="card" style={{ overflowX: 'auto', borderRadius: '0', border: '1px solid var(--border)' }}>
            <table className="habit-matrix">
                <thead>
                    <tr>
                        <th className="habit-name-col">TASK / HABIT</th>
                        {monthDays.map(d => (
                            <th key={d.date} style={{ minWidth: '40px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{DAYS_OF_WEEK[d.dayOfWeek]}</div>
                                <div>{d.day}</div>
                            </th>
                        ))}
                        <th>%</th>
                    </tr>
                </thead>
                <tbody>
                    {habits.map(habit => {
                        const checks = monthDays.filter(d => checkData[`${habit.id}-${d.date}`]).length;
                        const pct = Math.round((checks / monthDays.length) * 100);

                        return (
                            <tr key={habit.id} className="habit-row">
                                <td style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: "var(--text-main)", fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ opacity: 0.5 }}>•</span>
                                        {habit.name}
                                    </div>
                                    <button
                                        onClick={() => deleteHabit(habit.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.3, fontSize: '0.8rem' }}
                                        title="Delete Habit"
                                    >
                                        ✕
                                    </button>
                                </td>
                                {monthDays.map(d => (
                                    <td key={d.date}>
                                        <div
                                            className={`check-box ${checkData[`${habit.id}-${d.date}`] ? 'checked' : ''}`}
                                            onClick={() => toggleCheck(habit.id, d.date)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                    </td>
                                ))}
                                <td>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{pct}%</div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <form onSubmit={handleAdd} className="add-habit-form" style={{ padding: '1rem', background: '#f9fafb', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    className="input-field"
                    placeholder="+ Add new task..."
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0' }}
                />
                <button type="submit" className="btn-primary" style={{ background: 'black', color: 'white', border: 'none', padding: '0 1.5rem', cursor: 'pointer', fontWeight: 600 }}>ADD</button>
            </form>
        </div>
    );
};

const DashboardView = ({ habits, checkData, toggleCheck }) => {
    const dashboardDays = useMemo(() => getRecentDays(4), []);

    return (
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {dashboardDays.map(d => {
                // Calculate daily progress
                const completedCount = habits.filter(h => checkData[`${h.id}-${d.date}`]).length;
                const totalCount = habits.length;
                const dailyPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                const isToday = d.date === getFormattedDate(new Date());

                return (
                    <div key={d.date} className="card" style={{ borderColor: isToday ? 'var(--primary)' : 'var(--border)', boxShadow: isToday ? '0 0 0 2px var(--primary)' : 'none' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem', background: isToday ? '#111827' : '#f3f4f6', color: isToday ? 'white' : 'inherit', padding: '1rem', borderRadius: '0' }}>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{d.day}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{d.date}</div>
                            <div style={{ marginTop: '1rem' }}>
                                <CircularProgress value={dailyPct} />
                            </div>
                        </div>

                        <div className="card-title">Tasks</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {habits.map(h => (
                                <div
                                    key={h.id}
                                    className={`input-row task-item ${checkData[`${h.id}-${d.date}`] ? 'done' : ''}`}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                    onClick={() => toggleCheck(h.id, d.date)}
                                >
                                    <div className={`check-box ${checkData[`${h.id}-${d.date}`] ? 'checked' : ''}`} style={{ width: '18px', height: '18px', flexShrink: 0 }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                    <span style={{ fontSize: '0.85rem' }}>{h.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const AnalysisPanel = ({ habits, checkData }) => {
    // Calculate real stats
    const totalHabits = habits.length;
    // For this month (assuming current month for simplicity of demo)
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    // Calculate top performing habit
    let topHabit = null;
    let maxChecks = -1;

    const habitStats = habits.map(h => {
        // Count checks for this habit across all recorded time (or simplify to just counting keys)
        // Ideally filter by current month
        let checks = 0;
        Object.keys(checkData).forEach(key => {
            if (key.startsWith(`${h.id}-`)) checks++;
        });

        if (checks > maxChecks) {
            maxChecks = checks;
            topHabit = h;
        }
        return { ...h, checks };
    });

    const totalPossibleChecks = totalHabits * 30; // Approx for "monthly" view
    const totalActualChecks = Object.values(checkData).filter(Boolean).length;
    const overallPct = totalPossibleChecks > 0 ? Math.round((totalActualChecks / Math.max(1, totalPossibleChecks)) * 100) : 0;

    return (
        <div className="card">
            <div className="card-title">Performance Analytics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div>
                    <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Habit Consistency (Lifetime)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {habitStats.slice(0, 5).map(h => (
                            <ProgressBar
                                key={h.id}
                                label={h.name}
                                current={h.checks}
                                total={30} // Benchmark against 30 days
                                color="black"
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <div className="card-title" style={{ marginTop: 0 }}>Overall Progress</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        {overallPct}%
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        {overallPct > 50 ? "Solid performance." : "Needs improvement."}
                    </p>

                    {topHabit && (
                        <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0', borderLeft: '3px solid black' }}>
                            <div style={{ fontWeight: 600, color: 'black' }}>Top Performer</div>
                            <div style={{ fontSize: '0.9rem' }}>{topHabit.name} ({topHabit.checks} completions)</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


const SettingsView = ({ }) => {
    return (
        <div className="card" style={{ maxWidth: '600px' }}>
            <div className="card-title">App Settings</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>Push Notifications</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get reminded to complete your habits.</div>
                    </div>
                    <div className="check-box checked" style={{ borderRadius: '12px', width: '40px', height: '24px', background: 'var(--primary)', position: 'relative' }}>
                        <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', right: '3px', top: '3px' }}></div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>Sound Effects</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Play sounds when completing tasks.</div>
                    </div>
                    <div className="check-box checked" style={{ borderRadius: '12px', width: '40px', height: '24px', background: 'var(--primary)', position: 'relative' }}>
                        <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', right: '3px', top: '3px' }}></div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>Compact Mode</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Show more data with less spacing.</div>
                    </div>
                    <div className="check-box" style={{ borderRadius: '12px', width: '40px', height: '24px', background: 'var(--bg-app)', border: '1px solid var(--border)', position: 'relative' }}>
                        <div style={{ width: '18px', height: '18px', background: 'var(--text-muted)', borderRadius: '50%', position: 'absolute', left: '3px', top: '2px' }}></div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)', marginBottom: '1rem' }}>Account</div>
                    <button style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: 'none',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        width: '100%',
                        textAlign: 'left'
                    }}>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main App ---

const App = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'tracker', 'settings'

    // State: Habits
    const [habits, setHabits] = useState([]);

    // State: CheckData
    const [checkData, setCheckData] = useState({});

    // Load Data from API
    useEffect(() => {
        API.getHabits().then(setHabits);
        API.getChecks().then(setCheckData);
    }, []);

    const addNewHabit = async (name) => {
        if (!name.trim()) return;
        try {
            const newHabit = await API.addHabit(name);
            setHabits(prev => [...prev, newHabit]);
        } catch (err) {
            console.error("Failed to add habit", err);
        }
    };

    const deleteHabit = async (id) => {
        try {
            await API.deleteHabit(id);
            setHabits(prev => prev.filter(h => h.id !== id));
            // Also cleanup checks in state for UI consistency
            setCheckData(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(key => {
                    if (key.startsWith(`${id}-`)) delete next[key];
                });
                return next;
            });
        } catch (err) {
            console.error("Failed to delete habit", err);
        }
    };

    const toggleCheck = async (habitId, dateStr) => {
        const key = `${habitId}-${dateStr}`;
        // Optimistic update
        const originalStatus = checkData[key];
        setCheckData(prev => {
            const next = { ...prev, [key]: !prev[key] };
            return next;
        });

        try {
            await API.toggleCheck(habitId, dateStr);
        } catch (err) {
            console.error("Failed to toggle check", err);
            // Revert
            setCheckData(prev => ({ ...prev, [key]: originalStatus }));
        }
    };

    const { level, currentXP, xpForNextLevel, progress } = calculateLevel(checkData);

    // Generate Month Days for Tracker View
    const monthDays = useMemo(() => {
        const days = [];
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth(); // Current month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayOfWeek = (new Date(year, month, i)).getDay();
            days.push({ day: i, date, dayOfWeek });
        }
        return days;
    }, []);

    const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    const getPageTitle = () => {
        switch (view) {
            case 'dashboard': return 'Daily Overview';
            case 'tracker': return currentMonthName;
            case 'settings': return 'Settings';
            default: return 'Level Up';
        }
    };

    const getPageSubtitle = () => {
        switch (view) {
            case 'dashboard': return 'Track your daily victories.';
            case 'tracker': return 'Consistency is the key to mastery.';
            case 'settings': return 'Manage your preferences.';
            default: return '';
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="logo">
                    <span>⚡</span> LEVEL UP
                </div>

                {/* Gamification Profile */}
                <div style={{ margin: '1rem 0', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Level {level}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{currentXP} XP</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, background: 'var(--gradient-primary, var(--primary))', height: '100%' }}></div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        {Math.round(100 - progress)} XP to Level {level + 1}
                    </div>
                </div>

                <div className="nav-menu">
                    <div
                        className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setView('dashboard')}
                    >
                        <span>📊</span> Dashboard
                    </div>
                    <div
                        className={`nav-item ${view === 'tracker' ? 'active' : ''}`}
                        onClick={() => setView('tracker')}
                    >
                        <span>📅</span> Monthly Tracker
                    </div>
                    <div
                        className={`nav-item ${view === 'settings' ? 'active' : ''}`}
                        onClick={() => setView('settings')}
                    >
                        <span>⚙️</span> Settings
                    </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <div className="card" style={{ padding: '1rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: 'none' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>Pro Access</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>Templates unlocked.</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="header">
                    <div className="title-section">
                        <h1>{getPageTitle()}</h1>
                        <p>{getPageSubtitle()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Online</span>
                        </div>
                    </div>
                </div>

                {view === 'dashboard' && (
                    <>
                        <DashboardView
                            habits={habits}
                            checkData={checkData}
                            toggleCheck={toggleCheck}
                        />
                        <AnalysisPanel habits={habits} checkData={checkData} />
                    </>
                )}

                {view === 'tracker' && (
                    <HabitTrackerView
                        habits={habits}
                        checkData={checkData}
                        toggleCheck={toggleCheck}
                        monthDays={monthDays}
                        addNewHabit={addNewHabit}
                        deleteHabit={deleteHabit}
                    />
                )}

                {view === 'settings' && (
                    <SettingsView />
                )}
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="bottom-nav">
                <div
                    className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setView('dashboard')}
                >
                    <div style={{ fontSize: '1.2rem' }}>📊</div>
                    <span style={{ fontSize: '0.7rem' }}>Dashboard</span>
                </div>
                <div
                    className={`nav-item ${view === 'tracker' ? 'active' : ''}`}
                    onClick={() => setView('tracker')}
                >
                    <div style={{ fontSize: '1.2rem' }}>📅</div>
                    <span style={{ fontSize: '0.7rem' }}>Tracker</span>
                </div>
                <div
                    className={`nav-item ${view === 'settings' ? 'active' : ''}`}
                    onClick={() => setView('settings')}
                >
                    <div style={{ fontSize: '1.2rem' }}>⚙️</div>
                    <span style={{ fontSize: '0.7rem' }}>Settings</span>
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
