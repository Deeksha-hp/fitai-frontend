import { useState, useEffect, useRef, createContext, useContext } from "react";

const AppContext = createContext(null);
const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const callGemini = async (prompt, apiKey) => {
  const res = await fetch(`${GEMINI_API}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const parseJSON = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --sage: #4CAF50;
  --sage-dark: #388E3C;
  --sage-light: #C8E6C9;
  --sage-pale: #F1F8F1;
  --accent: #FF5722;
  --accent2: #FF9800;
  --slate: #546E7A;
  --slate-dark: #263238;
  --slate-light: #B0BEC5;
  --offwhite: #F8F9FA;
  --white: #ffffff;
  --card-bg: rgba(255,255,255,0.92);
  --radius: 8px;
  --radius-lg: 16px;
  --shadow: 0 4px 24px rgba(76,175,80,0.10), 0 1px 4px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 40px rgba(76,175,80,0.15), 0 2px 8px rgba(0,0,0,0.08);
}

body { font-family: 'DM Sans', sans-serif; background: #f0f4f0; }

.app-wrap { min-height: 100vh; background: linear-gradient(135deg, #e8f5e9 0%, #f3f8f3 40%, #fff8f0 100%); }

h1,h2,h3,h4 { font-family: 'Syne', sans-serif; }

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 12px 24px; border-radius: var(--radius); border: none;
  font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; text-decoration: none;
}
.btn-primary { background: var(--sage); color: #fff; box-shadow: 0 4px 16px rgba(76,175,80,0.3); }
.btn-primary:hover { background: var(--sage-dark); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(76,175,80,0.4); }
.btn-outline { background: transparent; color: var(--sage); border: 2px solid var(--sage); }
.btn-outline:hover { background: var(--sage-pale); }
.btn-accent { background: var(--accent); color: #fff; box-shadow: 0 4px 16px rgba(255,87,34,0.3); }
.btn-accent:hover { background: #e64a19; transform: translateY(-1px); }
.btn-ghost { background: rgba(255,255,255,0.7); color: var(--slate-dark); border: 1px solid rgba(0,0,0,0.1); }
.btn-ghost:hover { background: var(--white); }
.btn-sm { padding: 8px 16px; font-size: 13px; }
.btn-lg { padding: 16px 36px; font-size: 17px; }
.btn-full { width: 100%; justify-content: center; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

.card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.8);
}

input, select, textarea {
  width: 100%; padding: 12px 16px;
  border: 1.5px solid #e0e0e0; border-radius: var(--radius);
  font-family: 'DM Sans', sans-serif; font-size: 15px;
  transition: border 0.2s, box-shadow 0.2s;
  background: #fff; outline: none;
}
input:focus, select:focus, textarea:focus {
  border-color: var(--sage); box-shadow: 0 0 0 3px rgba(76,175,80,0.15);
}
label { font-size: 13px; font-weight: 600; color: var(--slate); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px; }

.chip {
  padding: 8px 18px; border-radius: 999px; border: 2px solid #e0e0e0;
  font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;
  background: white; color: var(--slate-dark);
}
.chip:hover { border-color: var(--sage); color: var(--sage); }
.chip.active { background: var(--sage); color: white; border-color: var(--sage); }

.chip-sm { padding: 5px 12px; font-size: 12px; }

.progress-bar-wrap { height: 6px; background: #e8f5e9; border-radius: 999px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: linear-gradient(90deg, var(--sage), #8BC34A); border-radius: 999px; transition: width 0.5s ease; }

.sidebar { width: 240px; min-height: 100vh; background: var(--slate-dark); position: fixed; left: 0; top: 0; z-index: 100; display: flex; flex-direction: column; }
.sidebar-logo { padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.sidebar-logo .logo-text { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--sage); }
.sidebar-logo .logo-sub { font-size: 11px; color: var(--slate-light); letter-spacing: 1.5px; text-transform: uppercase; }
.sidebar-nav { padding: 16px 0; flex: 1; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.2s; font-size: 14px; font-weight: 500; border-left: 3px solid transparent; }
.nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
.nav-item.active { background: rgba(76,175,80,0.15); color: var(--sage); border-left-color: var(--sage); }
.nav-item .nav-icon { font-size: 18px; width: 20px; text-align: center; }
.sidebar-footer { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.08); }

.main-content { margin-left: 240px; min-height: 100vh; background: #f5f7f5; }
.page-header { padding: 24px 32px; background: white; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; }
.page-body { padding: 32px; }

.stat-card { background: white; border-radius: var(--radius-lg); padding: 20px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.stat-label { font-size: 12px; font-weight: 600; color: var(--slate-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.stat-value { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700; color: var(--slate-dark); }
.stat-sub { font-size: 12px; color: var(--sage); margin-top: 4px; }

.meal-card { min-width: 200px; background: white; border-radius: var(--radius-lg); padding: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; }
.meal-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); transition: all 0.2s; }
.meal-time { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--sage); margin-bottom: 6px; }
.meal-name { font-size: 14px; font-weight: 600; color: var(--slate-dark); line-height: 1.4; }
.meal-cal { font-size: 12px; color: var(--slate-light); margin-top: 4px; }

.exercise-row { display: flex; align-items: center; gap: 16px; padding: 14px 16px; background: white; border-radius: var(--radius); margin-bottom: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); border: 1px solid #f5f5f5; }
.exercise-num { width: 32px; height: 32px; border-radius: 50%; background: var(--sage-pale); color: var(--sage-dark); font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.exercise-name { flex: 1; font-weight: 600; font-size: 14px; color: var(--slate-dark); }
.exercise-meta { display: flex; gap: 8px; }
.badge { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.badge-green { background: #E8F5E9; color: #2E7D32; }
.badge-orange { background: #FFF3E0; color: #E65100; }
.badge-blue { background: #E3F2FD; color: #1565C0; }

.chat-bubble { max-width: 75%; padding: 12px 16px; border-radius: 16px; line-height: 1.6; font-size: 14px; }
.chat-bubble.user { background: var(--sage); color: white; border-bottom-right-radius: 4px; margin-left: auto; }
.chat-bubble.ai { background: white; color: var(--slate-dark); border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.chat-meta { font-size: 11px; color: var(--slate-light); margin-top: 4px; }

.log-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: white; border-radius: var(--radius); margin-bottom: 8px; border: 1px solid #f0f0f0; }

.weekly-bar { background: #E8F5E9; border-radius: var(--radius); padding: 4px; display: flex; align-items: flex-end; gap: 4px; height: 100px; }
.day-bar { flex: 1; background: var(--sage); border-radius: 4px 4px 0 0; transition: all 0.3s; cursor: pointer; position: relative; }
.day-bar:hover { background: var(--sage-dark); }

.tab-bar { display: flex; gap: 4px; background: #f0f0f0; padding: 4px; border-radius: var(--radius); }
.tab { flex: 1; padding: 8px 12px; border-radius: calc(var(--radius) - 2px); font-size: 13px; font-weight: 600; cursor: pointer; text-align: center; transition: all 0.2s; color: var(--slate); }
.tab.active { background: white; color: var(--sage-dark); box-shadow: 0 1px 4px rgba(0,0,0,0.1); }

.onboarding-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: linear-gradient(135deg, #e8f5e9 0%, #f3f8f3 50%, #fff8f0 100%); }
.onboarding-card { width: 100%; max-width: 520px; }

.divider { display: flex; align-items: center; gap: 12px; color: var(--slate-light); font-size: 13px; margin: 20px 0; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e0e0e0; }

.scroll-x { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; }
.scroll-x::-webkit-scrollbar { height: 4px; }
.scroll-x::-webkit-scrollbar-track { background: #f0f0f0; border-radius: 999px; }
.scroll-x::-webkit-scrollbar-thumb { background: var(--sage-light); border-radius: 999px; }

.day-pill { padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.2s; border: 2px solid transparent; }
.day-pill.active { background: var(--sage); color: white; }
.day-pill:not(.active) { background: white; color: var(--slate); border-color: #e0e0e0; }
.day-pill:not(.active):hover { border-color: var(--sage); color: var(--sage); }

.loading-dots { display: inline-flex; gap: 4px; }
.loading-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--sage); animation: bounce 1.2s infinite; }
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }

.motivation-card { background: white; border-radius: var(--radius-lg); padding: 16px 20px; border: 2px solid transparent; cursor: pointer; display: flex; align-items: center; gap: 14px; transition: all 0.2s; }
.motivation-card:hover { border-color: var(--sage-light); }
.motivation-card.active { border-color: var(--sage); background: var(--sage-pale); }
.motivation-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }

.text-sage { color: var(--sage); }
.text-accent { color: var(--accent); }
.text-slate { color: var(--slate); }
.text-muted { color: var(--slate-light); }
.text-sm { font-size: 13px; }
.text-xs { font-size: 11px; }
.fw-600 { font-weight: 600; }
.fw-700 { font-weight: 700; }
.mt-8 { margin-top: 8px; }
.mt-16 { margin-top: 16px; }
.mt-24 { margin-top: 24px; }
.mb-8 { margin-bottom: 8px; }
.mb-16 { margin-bottom: 16px; }
.mb-24 { margin-bottom: 24px; }
.gap-8 { gap: 8px; }
.gap-12 { gap: 12px; }
.gap-16 { gap: 16px; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.flex-wrap { flex-wrap: wrap; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

.alert { padding: 12px 16px; border-radius: var(--radius); font-size: 14px; margin-bottom: 16px; }
.alert-error { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
.alert-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
.alert-info { background: #e3f2fd; color: #1565c0; border: 1px solid #bbdefb; }

@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .main-content { margin-left: 0; }
  .grid-4 { grid-template-columns: 1fr 1fr; }
  .grid-2 { grid-template-columns: 1fr; }
  .page-body { padding: 16px; }
}
`;

// ─── CONTEXT & STATE ─────────────────────────────────────────────────────────
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_key") || "");
  const [onboardingData, setOnboardingData] = useState({
    dietPrefs: [], motivation: "", age: "", height: "", weight: "", activity: "sedentary", steps: "", goal: "weight_loss"
  });
  const [dietPlan, setDietPlan] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [logs, setLogs] = useState({ food: [], workout: [] });
  const [chatHistory, setChatHistory] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);

  const saveApiKey = (k) => { setApiKey(k); localStorage.setItem("gemini_key", k); };

  // Fake auth
  const login = (email, password) => {
    const stored = JSON.parse(localStorage.getItem("fitai_users") || "[]");
    const found = stored.find(u => u.email === email && u.password === password);
    if (found) { setUser(found); return true; }
    return false;
  };
  const register = (name, email, password, role = "client") => {
    const stored = JSON.parse(localStorage.getItem("fitai_users") || "[]");
    if (stored.find(u => u.email === email)) return false;
    const newUser = { id: Date.now(), name, email, password, role };
    localStorage.setItem("fitai_users", JSON.stringify([...stored, newUser]));
    return true;
  };
  const logout = () => { setUser(null); setDietPlan(null); setWorkoutPlan(null); };

  const addLog = (type, item) => setLogs(prev => ({ ...prev, [type]: [{ ...item, id: Date.now(), date: new Date().toLocaleDateString() }, ...prev[type]] }));

  return (
    <AppContext.Provider value={{ user, setUser, apiKey, saveApiKey, onboardingData, setOnboardingData, dietPlan, setDietPlan, workoutPlan, setWorkoutPlan, logs, addLog, chatHistory, setChatHistory, weeklySummary, setWeeklySummary, login, register, logout }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const LoadingDots = () => <div className="loading-dots"><span /><span /><span /></div>;

const ProgressBar = ({ step, total }) => (
  <div style={{ marginBottom: 24 }}>
    <div className="flex justify-between items-center mb-8">
      <span className="text-xs text-muted fw-600">STEP {step} OF {total}</span>
      <span className="text-xs text-sage fw-600">{Math.round((step / total) * 100)}%</span>
    </div>
    <div className="progress-bar-wrap">
      <div className="progress-bar-fill" style={{ width: `${(step / total) * 100}%` }} />
    </div>
  </div>
);

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────
function LoginPage({ onNavigate }) {
  const { login } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handle = () => {
    if (!email || !password) { setError("Please fill all fields"); return; }
    if (!login(email, password)) setError("Invalid credentials");
  };

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏃</div>
          <h1 style={{ fontSize: 28, color: "var(--slate-dark)" }}>FitAI</h1>
          <p className="text-muted text-sm mt-8">Your AI-powered fitness companion</p>
        </div>
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 20, marginBottom: 24, color: "var(--slate-dark)" }}>Welcome back</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="mb-16">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="mb-24">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={handle}>Sign In →</button>
          <div className="divider">or</div>
          <button className="btn btn-outline btn-full" onClick={() => onNavigate("register")}>Create Account</button>
          <p className="text-xs text-muted mt-16" style={{ textAlign: "center" }}>Demo: admin@fitai.com / admin123 or register new</p>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ onNavigate }) {
  const { register } = useContext(AppContext);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handle = () => {
    if (!form.name || !form.email || !form.password) { setError("Please fill all fields"); return; }
    if (register(form.name, form.email, form.password, form.role)) {
      setSuccess(true);
      setTimeout(() => onNavigate("login"), 1500);
    } else setError("Email already registered");
  };

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💪</div>
          <h1 style={{ fontSize: 28, color: "var(--slate-dark)" }}>Join FitAI</h1>
          <p className="text-muted text-sm mt-8">Start your fitness journey today</p>
        </div>
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 20, marginBottom: 24 }}>Create Account</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">Account created! Redirecting...</div>}
          <div className="mb-16"><label>Full Name</label><input placeholder="Alex Johnson" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="mb-16"><label>Email</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="mb-16"><label>Password</label><input type="password" placeholder="min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          <div className="mb-24">
            <label>Account Type</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="client">Client (Fitness User)</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={handle}>Create Account →</button>
          <div className="divider">already have an account?</div>
          <button className="btn btn-ghost btn-full" onClick={() => onNavigate("login")}>Sign In</button>
        </div>
      </div>
    </div>
  );
}

// ─── API KEY SETUP ────────────────────────────────────────────────────────────
function ApiKeySetup({ onDone }) {
  const { apiKey, saveApiKey } = useContext(AppContext);
  const [key, setKey] = useState(apiKey);
  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">
        <div className="card" style={{ padding: 32 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 40 }}>🤖</div>
            <h2 style={{ marginTop: 12 }}>Connect Gemini AI</h2>
            <p className="text-muted text-sm mt-8">Enter your Google Gemini API key to unlock AI features</p>
          </div>
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            Get a free API key at <strong>aistudio.google.com</strong> — no credit card needed
          </div>
          <label>Gemini API Key</label>
          <input type="password" placeholder="AIza..." value={key} onChange={e => setKey(e.target.value)} style={{ marginBottom: 16 }} />
          <button className="btn btn-primary btn-full btn-lg" onClick={() => { saveApiKey(key); onDone(); }} disabled={!key}>
            Save & Continue →
          </button>
          <button className="btn btn-ghost btn-full mt-8" onClick={onDone} style={{ marginTop: 10 }}>
            Skip (demo mode)
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ONBOARDING STEPS ─────────────────────────────────────────────────────────
function Step1_DietPrefs({ onNext }) {
  const { onboardingData, setOnboardingData } = useContext(AppContext);
  const options = ["🍚 Rice", "🫓 Roti/Chapati", "🥗 Salad", "🥑 Keto", "🌾 Gluten-Free", "🥦 Vegan", "🥩 Non-Veg", "🐟 Pescatarian", "🍳 High Protein", "🫘 Dal/Legumes", "🧃 Juicing", "🚫 No Sugar"];
  const toggle = (item) => {
    const label = item.split(" ").slice(1).join(" ");
    const cur = onboardingData.dietPrefs;
    setOnboardingData({ ...onboardingData, dietPrefs: cur.includes(label) ? cur.filter(x => x !== label) : [...cur, label] });
  };
  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">
        <div className="card" style={{ padding: 32 }}>
          <ProgressBar step={1} total={4} />
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>What do you prefer to eat?</h2>
          <p className="text-muted text-sm mb-24">Select all that apply — we'll build your plan around these</p>
          <div className="flex flex-wrap gap-8 mb-24">
            {options.map(o => {
              const label = o.split(" ").slice(1).join(" ");
              return <button key={o} className={`chip ${onboardingData.dietPrefs.includes(label) ? "active" : ""}`} onClick={() => toggle(o)}>{o}</button>;
            })}
          </div>
          <button className="btn btn-primary btn-full" onClick={onNext} disabled={onboardingData.dietPrefs.length === 0}>
            Next: Your Goal →
          </button>
        </div>
      </div>
    </div>
  );
}

function Step2_Motivation({ onNext, onBack }) {
  const { onboardingData, setOnboardingData } = useContext(AppContext);
  const goals = [
    { id: "weight_loss", emoji: "🔥", label: "Lose Weight", desc: "Burn fat, feel lighter" },
    { id: "muscle_gain", emoji: "💪", label: "Build Muscle", desc: "Gain strength & size" },
    { id: "maintenance", emoji: "⚖️", label: "Stay Fit", desc: "Maintain current shape" },
    { id: "doctor", emoji: "👨‍⚕️", label: "Doctor's Advice", desc: "Medical recommendation" },
    { id: "wedding", emoji: "💍", label: "Wedding / Event", desc: "Look your best" },
    { id: "energy", emoji: "⚡", label: "More Energy", desc: "Feel active all day" },
  ];
  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">
        <div className="card" style={{ padding: 32 }}>
          <ProgressBar step={2} total={4} />
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>What's your goal?</h2>
          <p className="text-muted text-sm mb-24">This helps us personalize your plan</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {goals.map(g => (
              <div key={g.id} className={`motivation-card ${onboardingData.goal === g.id ? "active" : ""}`} onClick={() => setOnboardingData({ ...onboardingData, goal: g.id, motivation: g.label })}>
                <div className="motivation-icon" style={{ background: onboardingData.goal === g.id ? "var(--sage-light)" : "#f5f5f5" }}>{g.emoji}</div>
                <div><div className="fw-600" style={{ fontSize: 14 }}>{g.label}</div><div className="text-muted text-xs">{g.desc}</div></div>
              </div>
            ))}
          </div>
          <div className="flex gap-8">
            <button className="btn btn-ghost" onClick={onBack}>← Back</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={onNext} disabled={!onboardingData.goal}>Next: Your Stats →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3_Biometrics({ onNext, onBack }) {
  const { onboardingData, setOnboardingData } = useContext(AppContext);
  const upd = (k, v) => setOnboardingData({ ...onboardingData, [k]: v });
  const valid = onboardingData.age && onboardingData.height && onboardingData.weight;
  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">
        <div className="card" style={{ padding: 32 }}>
          <ProgressBar step={3} total={4} />
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>Your body stats</h2>
          <p className="text-muted text-sm mb-24">Used to calculate your calorie needs</p>
          <div className="grid-2 mb-16">
            <div><label>Age (years)</label><input type="number" placeholder="25" value={onboardingData.age} onChange={e => upd("age", e.target.value)} /></div>
            <div><label>Height (cm)</label><input type="number" placeholder="170" value={onboardingData.height} onChange={e => upd("height", e.target.value)} /></div>
          </div>
          <div className="grid-2 mb-16">
            <div><label>Weight (kg)</label><input type="number" placeholder="70" value={onboardingData.weight} onChange={e => upd("weight", e.target.value)} /></div>
            <div><label>Daily Steps</label><input type="number" placeholder="5000" value={onboardingData.steps} onChange={e => upd("steps", e.target.value)} /></div>
          </div>
          <div className="mb-24">
            <label>Activity Level</label>
            <select value={onboardingData.activity} onChange={e => upd("activity", e.target.value)}>
              <option value="sedentary">Sedentary (desk job, no exercise)</option>
              <option value="light">Lightly Active (1-2 days/week)</option>
              <option value="moderate">Moderately Active (3-4 days/week)</option>
              <option value="active">Very Active (5+ days/week)</option>
            </select>
          </div>
          <div className="flex gap-8">
            <button className="btn btn-ghost" onClick={onBack}>← Back</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={onNext} disabled={!valid}>Generate My Plan →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI RESULTS ───────────────────────────────────────────────────────────────
function Step4_DietPlan({ onNext }) {
  const { onboardingData, dietPlan, setDietPlan, apiKey } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [error, setError] = useState("");
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const generate = async () => {
    setLoading(true); setError("");
    const prompt = `Generate a 7-day personalized diet plan in JSON format for:
- Weight: ${onboardingData.weight}kg, Height: ${onboardingData.height}cm, Age: ${onboardingData.age}
- Goal: ${onboardingData.goal}, Activity: ${onboardingData.activity}
- Diet preferences: ${onboardingData.dietPrefs.join(", ")}
Return ONLY valid JSON: {"days":[{"day":"Monday","calories":2000,"meals":[{"type":"Breakfast","name":"Oats with banana","calories":350,"protein":"10g","notes":"High fiber"},{"type":"Lunch","name":"Dal rice","calories":600,"protein":"20g","notes":""},{"type":"Snack","name":"Fruit bowl","calories":150,"protein":"3g","notes":""},{"type":"Dinner","name":"Grilled chicken","calories":500,"protein":"35g","notes":"Low carb"}]},...7 days]}`;
    try {
      if (!apiKey) {
        const mock = { days: days.map((d, i) => ({ day: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][i], calories: 1800 + i * 50, meals: [{ type: "Breakfast", name: "Oats + Berries", calories: 320, protein: "12g", notes: "High fiber start" }, { type: "Lunch", name: "Grilled Paneer Salad", calories: 480, protein: "28g", notes: "Low carb" }, { type: "Snack", name: "Mixed Nuts", calories: 200, protein: "8g", notes: "Healthy fats" }, { type: "Dinner", name: "Vegetable Soup + Roti", calories: 450, protein: "15g", notes: "Light dinner" }] })) };
        setDietPlan(mock);
      } else {
        const text = await callGemini(prompt, apiKey);
        const parsed = parseJSON(text);
        if (parsed) setDietPlan(parsed);
        else setError("Could not parse AI response. Try again.");
      }
    } catch { setError("API error. Check your key."); }
    setLoading(false);
  };

  useEffect(() => { if (!dietPlan) generate(); }, []);

  const today = dietPlan?.days?.[selectedDay];

  return (
    <div className="onboarding-wrap" style={{ alignItems: "flex-start", paddingTop: 40 }}>
      <div style={{ width: "100%", maxWidth: 700 }}>
        <div className="card" style={{ padding: 32 }}>
          <ProgressBar step={4} total={4} />
          <div className="flex justify-between items-center mb-24">
            <div>
              <h2 style={{ fontSize: 22 }}>🥗 Your 7-Day Diet Plan</h2>
              <p className="text-muted text-sm mt-8">AI-generated based on your profile</p>
            </div>
            {dietPlan && <button className="btn btn-outline btn-sm" onClick={generate}>↻ Regenerate</button>}
          </div>

          {loading && <div style={{ textAlign: "center", padding: 40 }}><LoadingDots /><p className="text-muted text-sm mt-16">Cooking up your plan...</p></div>}
          {error && <div className="alert alert-error">{error}<button className="btn btn-sm btn-accent" onClick={generate} style={{ marginLeft: 12 }}>Retry</button></div>}

          {dietPlan && (
            <>
              <div className="scroll-x mb-24" style={{ gap: 8 }}>
                {days.map((d, i) => (
                  <button key={d} className={`day-pill ${selectedDay === i ? "active" : ""}`} onClick={() => setSelectedDay(i)}>{d}</button>
                ))}
              </div>
              {today && (
                <>
                  <div className="flex items-center justify-between mb-16" style={{ background: "var(--sage-pale)", padding: "12px 16px", borderRadius: "var(--radius)", border: "1px solid var(--sage-light)" }}>
                    <span className="fw-600 text-sage">{today.day}</span>
                    <span className="badge badge-green">🔥 {today.calories} kcal total</span>
                  </div>
                  <div className="scroll-x" style={{ paddingBottom: 16 }}>
                    {today.meals?.map((meal, i) => (
                      <div key={i} className="meal-card" style={{ minWidth: 180 }}>
                        <div className="meal-time">{meal.type}</div>
                        <div className="meal-name">{meal.name}</div>
                        <div className="meal-cal mt-8">🔥 {meal.calories} kcal · 💪 {meal.protein}</div>
                        {meal.notes && <div className="text-xs text-muted mt-8" style={{ fontStyle: "italic" }}>{meal.notes}</div>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <button className="btn btn-primary btn-full btn-lg mt-24" onClick={onNext} disabled={loading}>
            Next: Workout Plan →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD LAYOUT ─────────────────────────────────────────────────────────
function DashboardLayout({ page, setPage, children }) {
  const { user, logout } = useContext(AppContext);
  const navItems = user?.role === "admin"
    ? [{ id: "admin", icon: "👥", label: "User Management" }, { id: "overview", icon: "📊", label: "Analytics" }]
    : [
        { id: "overview", icon: "🏠", label: "Home" },
        { id: "diet", icon: "🥗", label: "Diet Plan" },
        { id: "workout", icon: "🏋️", label: "Workout" },
        { id: "log", icon: "📝", label: "Daily Log" },
        { id: "chat", icon: "🤖", label: "AI Coach" },
        { id: "summary", icon: "📈", label: "Weekly Report" },
      ];

  return (
    <div style={{ display: "flex" }}>
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-text">FitAI</div>
          <div className="logo-sub">Health Intelligence</div>
        </div>
        <div className="sidebar-nav">
          {navItems.map(n => (
            <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: "var(--slate-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{user?.role}</div>
          </div>
          <button className="btn btn-ghost btn-sm btn-full" onClick={logout}>Sign Out</button>
        </div>
      </div>
      <div className="main-content">{children}</div>
    </div>
  );
}

// ─── DASHBOARD OVERVIEW ───────────────────────────────────────────────────────
function OverviewPage({ setPage }) {
  const { user, onboardingData, dietPlan, workoutPlan } = useContext(AppContext);
  const { weight, height, age, goal } = onboardingData;
  const bmi = weight && height ? (weight / (height / 100) ** 2).toFixed(1) : "—";
  const tdee = weight && height && age ? Math.round(10 * weight + 6.25 * height - 5 * age + (goal === "weight_loss" ? -300 : goal === "muscle_gain" ? 300 : 0)) : "—";

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20 }}>Good morning, {user?.name?.split(" ")[0]} 👋</h2>
          <p className="text-muted text-sm mt-8">Here's your health snapshot</p>
        </div>
        <div className="flex gap-8">
          {!dietPlan && <button className="btn btn-accent btn-sm" onClick={() => setPage("diet")}>Generate Plan →</button>}
        </div>
      </div>
      <div className="page-body">
        <div className="grid-4 mb-24">
          {[
            { label: "BMI", value: bmi, sub: bmi < 25 ? "Healthy range" : "Check with doctor", icon: "⚖️" },
            { label: "Daily Target", value: `${tdee}`, sub: "kcal / day", icon: "🔥" },
            { label: "Current Goal", value: { weight_loss: "Lose Weight", muscle_gain: "Gain Muscle", maintenance: "Maintain" }[goal] || "Not set", sub: onboardingData.motivation || "Set your goal", icon: "🎯" },
            { label: "Activity", value: { sedentary: "Sedentary", light: "Light", moderate: "Moderate", active: "Active" }[onboardingData.activity] || "—", sub: "Work mode", icon: "🏃" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div className="card" style={{ padding: 24 }}>
            <div className="flex justify-between items-center mb-16">
              <h3 style={{ fontSize: 16 }}>🥗 Today's Diet</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setPage("diet")}>View Full Plan</button>
            </div>
            {dietPlan ? (
              <div>
                {dietPlan.days?.[0]?.meals?.slice(0, 3).map((m, i) => (
                  <div key={i} className="log-item">
                    <span style={{ fontSize: 18 }}>{i === 0 ? "🌅" : i === 1 ? "☀️" : "🌙"}</span>
                    <div style={{ flex: 1 }}><div className="fw-600 text-sm">{m.name}</div><div className="text-xs text-muted">{m.type}</div></div>
                    <span className="badge badge-green">{m.calories} cal</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 24 }}>
                <div style={{ fontSize: 40 }}>🥗</div>
                <p className="text-muted text-sm mt-8">No diet plan yet</p>
                <button className="btn btn-primary btn-sm mt-8" onClick={() => setPage("diet")}>Generate Plan</button>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="flex justify-between items-center mb-16">
              <h3 style={{ fontSize: 16 }}>🏋️ Today's Workout</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setPage("workout")}>View Plan</button>
            </div>
            {workoutPlan ? (
              <div>
                {workoutPlan.exercises?.slice(0, 3).map((ex, i) => (
                  <div key={i} className="exercise-row">
                    <div className="exercise-num">{i + 1}</div>
                    <div className="exercise-name">{ex.name}</div>
                    <span className="badge badge-orange">{ex.sets || ex.reps}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 24 }}>
                <div style={{ fontSize: 40 }}>🏋️</div>
                <p className="text-muted text-sm mt-8">No workout plan yet</p>
                <button className="btn btn-primary btn-sm mt-8" onClick={() => setPage("workout")}>Generate Workout</button>
              </div>
            )}
          </div>
        </div>

        <div className="card mt-24" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>⚡ Quick Actions</h3>
          <div className="flex flex-wrap gap-8">
            {[["📝 Log Food", "log"], ["🏃 Log Workout", "log"], ["🤖 Ask AI Coach", "chat"], ["📈 Weekly Report", "summary"]].map(([label, p]) => (
              <button key={label} className="btn btn-ghost" onClick={() => setPage(p)}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DIET PLAN PAGE ────────────────────────────────────────────────────────────
function DietPlanPage() {
  const { onboardingData, dietPlan, setDietPlan, apiKey } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [error, setError] = useState("");
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const generate = async () => {
    setLoading(true); setError("");
    const prompt = `Generate a 7-day personalized Indian diet plan in JSON format for:
- Weight: ${onboardingData.weight}kg, Height: ${onboardingData.height}cm, Age: ${onboardingData.age}
- Goal: ${onboardingData.goal}, Activity: ${onboardingData.activity}
- Diet preferences: ${onboardingData.dietPrefs.join(", ")}
Return ONLY valid JSON: {"days":[{"day":"Monday","calories":1900,"meals":[{"type":"Breakfast","name":"Poha with peas","calories":300,"protein":"8g","notes":"Light & easy"},{"type":"Lunch","name":"Dal tadka + 2 roti","calories":550,"protein":"22g","notes":""},{"type":"Snack","name":"Sprouts chaat","calories":180,"protein":"10g","notes":""},{"type":"Dinner","name":"Palak paneer + rice","calories":520,"protein":"24g","notes":""}]},...7 days]}`;
    try {
      if (!apiKey) {
        const meals = [
          [{ type: "Breakfast", name: "Masala Oats + Banana", calories: 320, protein: "11g", notes: "Quick & nutritious" }, { type: "Lunch", name: "Dal Rice + Salad", calories: 580, protein: "22g", notes: "" }, { type: "Snack", name: "Sprouts Chaat", calories: 180, protein: "9g", notes: "High protein" }, { type: "Dinner", name: "Palak Paneer + 1 Roti", calories: 480, protein: "26g", notes: "Iron rich" }],
          [{ type: "Breakfast", name: "Idli Sambar (3 pcs)", calories: 290, protein: "9g", notes: "Fermented goodness" }, { type: "Lunch", name: "Rajma Chawal", calories: 620, protein: "24g", notes: "" }, { type: "Snack", name: "Mixed Nuts + Green Tea", calories: 200, protein: "7g", notes: "" }, { type: "Dinner", name: "Grilled Chicken Salad", calories: 450, protein: "40g", notes: "High protein" }],
          [{ type: "Breakfast", name: "Poha + Coconut Chutney", calories: 310, protein: "8g", notes: "" }, { type: "Lunch", name: "Chicken Curry + Rice", calories: 640, protein: "38g", notes: "Protein-rich" }, { type: "Snack", name: "Fruit Bowl", calories: 160, protein: "2g", notes: "" }, { type: "Dinner", name: "Vegetable Soup + Khichdi", calories: 400, protein: "14g", notes: "Light" }],
          [{ type: "Breakfast", name: "Besan Chilla + Curd", calories: 340, protein: "14g", notes: "" }, { type: "Lunch", name: "Chole Bhature (limited)", calories: 580, protein: "18g", notes: "Cheat day?" }, { type: "Snack", name: "Peanut Butter Toast", calories: 220, protein: "8g", notes: "" }, { type: "Dinner", name: "Methi Chicken + Roti", calories: 520, protein: "36g", notes: "" }],
          [{ type: "Breakfast", name: "Upma + Buttermilk", calories: 300, protein: "10g", notes: "" }, { type: "Lunch", name: "Fish Curry + Rice", calories: 580, protein: "35g", notes: "Omega-3 rich" }, { type: "Snack", name: "Roasted Chana", calories: 190, protein: "10g", notes: "Fiber-rich" }, { type: "Dinner", name: "Paneer Bhurji + 2 Roti", calories: 490, protein: "28g", notes: "" }],
          [{ type: "Breakfast", name: "Aloo Paratha (1) + Curd", calories: 380, protein: "12g", notes: "Weekend treat" }, { type: "Lunch", name: "Mutton Curry + Rice", calories: 680, protein: "42g", notes: "" }, { type: "Snack", name: "Banana Smoothie", calories: 230, protein: "8g", notes: "Post-workout" }, { type: "Dinner", name: "Moong Dal Khichdi", calories: 420, protein: "18g", notes: "Easy digest" }],
          [{ type: "Breakfast", name: "Dosa + Coconut Chutney", calories: 330, protein: "9g", notes: "" }, { type: "Lunch", name: "Dal Makhani + Jeera Rice", calories: 600, protein: "20g", notes: "Sunday special" }, { type: "Snack", name: "Popcorn (plain)", calories: 120, protein: "3g", notes: "" }, { type: "Dinner", name: "Grilled Paneer + Salad", calories: 440, protein: "30g", notes: "Light & healthy" }],
        ];
        setDietPlan({ days: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d, i) => ({ day: d, calories: meals[i].reduce((a, m) => a + m.calories, 0), meals: meals[i] })) });
      } else {
        const text = await callGemini(prompt, apiKey);
        const parsed = parseJSON(text);
        if (parsed) setDietPlan(parsed);
        else setError("Could not parse response. Try again.");
      }
    } catch { setError("API error. Check your Gemini key."); }
    setLoading(false);
  };

  const today = dietPlan?.days?.[selectedDay];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20 }}>🥗 AI Diet Plan</h2>
          <p className="text-muted text-sm mt-8">Personalized 7-day meal plan</p>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-outline btn-sm" onClick={generate} disabled={loading}>{loading ? "..." : "↻ Regenerate"}</button>
        </div>
      </div>
      <div className="page-body">
        {!dietPlan && !loading && (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🥗</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>No Diet Plan Yet</h3>
            <p className="text-muted mb-24">Generate your personalized AI diet plan based on your profile</p>
            <button className="btn btn-primary btn-lg" onClick={generate}>✨ Generate My Diet Plan</button>
          </div>
        )}
        {loading && <div className="card" style={{ padding: 64, textAlign: "center" }}><LoadingDots /><p className="text-muted mt-16">Crafting your personalized plan...</p></div>}
        {error && <div className="alert alert-error">{error}</div>}

        {dietPlan && (
          <>
            <div className="flex gap-8 mb-24 scroll-x">
              {days.map((d, i) => (
                <button key={d} className={`day-pill ${selectedDay === i ? "active" : ""}`} onClick={() => setSelectedDay(i)}>{d}</button>
              ))}
            </div>

            {today && (
              <>
                <div className="flex items-center justify-between mb-16 p-16" style={{ background: "var(--sage-pale)", borderRadius: "var(--radius)", border: "1px solid var(--sage-light)" }}>
                  <div>
                    <div className="fw-600" style={{ color: "var(--sage-dark)", fontSize: 16 }}>{today.day}</div>
                    <div className="text-sm text-muted">Full day plan</div>
                  </div>
                  <div className="flex gap-8">
                    <span className="badge badge-green">🔥 {today.calories} kcal</span>
                    <span className="badge badge-blue">💪 ~{today.meals?.reduce((a, m) => a + parseInt(m.protein || 0), 0)}g protein</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                  {today.meals?.map((meal, i) => (
                    <div key={i} style={{ background: "white", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow)", border: "1px solid #f0f0f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 20 }}>{i === 0 ? "🌅" : i === 1 ? "☀️" : i === 2 ? "🍎" : "🌙"}</span>
                        <span className="meal-time">{meal.type}</span>
                      </div>
                      <div className="meal-name" style={{ fontSize: 15 }}>{meal.name}</div>
                      <div className="flex gap-8 mt-8">
                        <span className="badge badge-green text-xs">🔥 {meal.calories}</span>
                        <span className="badge badge-blue text-xs">💪 {meal.protein}</span>
                      </div>
                      {meal.notes && <div className="text-xs text-muted mt-8" style={{ fontStyle: "italic" }}>{meal.notes}</div>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── WORKOUT PLAN PAGE ─────────────────────────────────────────────────────────
function WorkoutPage() {
  const { onboardingData, workoutPlan, setWorkoutPlan, apiKey } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState("beginner");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const generate = async () => {
    setLoading(true); setError("");
    const prompt = `Create a weekly workout plan for ${onboardingData.goal} at ${level} level in JSON.
Return ONLY: {"goal":"${onboardingData.goal}","level":"${level}","days":[{"day":"Monday","focus":"Chest & Triceps","duration":45,"calories_burned":350,"exercises":[{"name":"Push-ups","sets":"3 x 15","reps":"15","rest":"60s","instructions":"Keep core tight"},...]},... 6 days + 1 rest day]}`;
    try {
      if (!apiKey) {
        const workoutDays = [
          { day: "Monday", focus: "Chest & Triceps", duration: 45, calories_burned: 380, exercises: [{ name: "Push-ups", sets: "3 x 15", reps: "15", rest: "60s", instructions: "Keep core engaged" }, { name: "Dumbbell Press", sets: "3 x 12", reps: "12", rest: "90s", instructions: "Full range of motion" }, { name: "Tricep Dips", sets: "3 x 10", reps: "10", rest: "60s", instructions: "Elbows close to body" }, { name: "Chest Fly", sets: "3 x 12", reps: "12", rest: "60s", instructions: "Slight elbow bend" }] },
          { day: "Tuesday", focus: "Back & Biceps", duration: 45, calories_burned: 360, exercises: [{ name: "Pull-ups / Lat Pulldown", sets: "3 x 8", reps: "8", rest: "90s", instructions: "Squeeze at top" }, { name: "Bent-over Row", sets: "3 x 12", reps: "12", rest: "60s", instructions: "Flat back" }, { name: "Bicep Curls", sets: "3 x 15", reps: "15", rest: "45s", instructions: "Slow eccentric" }, { name: "Face Pulls", sets: "3 x 15", reps: "15", rest: "45s", instructions: "Elbows high" }] },
          { day: "Wednesday", focus: "Cardio & Core", duration: 40, calories_burned: 450, exercises: [{ name: "Jumping Jacks", sets: "3 x 30", reps: "30", rest: "30s", instructions: "Warm up" }, { name: "Mountain Climbers", sets: "3 x 20", reps: "20", rest: "45s", instructions: "Fast pace" }, { name: "Plank", sets: "3 x 60s", reps: "60s", rest: "30s", instructions: "Neutral spine" }, { name: "Burpees", sets: "3 x 10", reps: "10", rest: "60s", instructions: "Explosive jump" }] },
          { day: "Thursday", focus: "Legs & Glutes", duration: 50, calories_burned: 420, exercises: [{ name: "Squats", sets: "4 x 15", reps: "15", rest: "90s", instructions: "Knees over toes" }, { name: "Lunges", sets: "3 x 12 each", reps: "12", rest: "60s", instructions: "Upright torso" }, { name: "Glute Bridges", sets: "3 x 20", reps: "20", rest: "45s", instructions: "Squeeze at top" }, { name: "Calf Raises", sets: "3 x 20", reps: "20", rest: "30s", instructions: "Full range" }] },
          { day: "Friday", focus: "Shoulders & Arms", duration: 40, calories_burned: 320, exercises: [{ name: "Overhead Press", sets: "3 x 12", reps: "12", rest: "90s", instructions: "Core braced" }, { name: "Lateral Raises", sets: "3 x 15", reps: "15", rest: "45s", instructions: "Slight bend at elbow" }, { name: "Hammer Curls", sets: "3 x 12", reps: "12", rest: "45s", instructions: "Neutral grip" }, { name: "Skull Crushers", sets: "3 x 12", reps: "12", rest: "60s", instructions: "Control descent" }] },
          { day: "Saturday", focus: "Full Body HIIT", duration: 35, calories_burned: 500, exercises: [{ name: "Box Jumps", sets: "4 x 10", reps: "10", rest: "60s", instructions: "Soft landing" }, { name: "Kettlebell Swings", sets: "4 x 15", reps: "15", rest: "60s", instructions: "Hip hinge" }, { name: "Battle Ropes", sets: "4 x 30s", reps: "30s", rest: "30s", instructions: "Alternate waves" }, { name: "Sprint Intervals", sets: "6 x 20s", reps: "20s", rest: "40s", instructions: "Max effort" }] },
          { day: "Sunday", focus: "Active Recovery", duration: 30, calories_burned: 150, exercises: [{ name: "Light Walk / Yoga", sets: "1 x 20min", reps: "20min", rest: "—", instructions: "Easy pace" }, { name: "Foam Rolling", sets: "1 x 10min", reps: "10min", rest: "—", instructions: "Sore areas" }, { name: "Stretching", sets: "1 x 15min", reps: "15min", rest: "—", instructions: "Hold 30s each" }] },
        ];
        setWorkoutPlan({ goal: onboardingData.goal, level, days: workoutDays });
      } else {
        const text = await callGemini(prompt, apiKey);
        const parsed = parseJSON(text);
        if (parsed) setWorkoutPlan(parsed);
        else setError("Could not parse AI response. Try again.");
      }
    } catch { setError("API error."); }
    setLoading(false);
  };

  const day = workoutPlan?.days?.[activeTab];
  const weeklyCalories = workoutPlan?.days?.reduce((a, d) => a + (d.calories_burned || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20 }}>🏋️ AI Workout Plan</h2>
          <p className="text-muted text-sm mt-8">Personalized weekly training</p>
        </div>
        <div className="flex gap-8 items-center">
          <select value={level} onChange={e => setLevel(e.target.value)} style={{ width: "auto", padding: "8px 12px", fontSize: 13 }}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={generate} disabled={loading}>{loading ? "..." : "✨ Generate"}</button>
        </div>
      </div>
      <div className="page-body">
        {!workoutPlan && !loading && (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏋️</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Ready to train?</h3>
            <p className="text-muted mb-24">Generate your AI-powered workout plan</p>
            <button className="btn btn-primary btn-lg" onClick={generate}>✨ Generate Workout Plan</button>
          </div>
        )}
        {loading && <div className="card" style={{ padding: 64, textAlign: "center" }}><LoadingDots /><p className="text-muted mt-16">Building your workout...</p></div>}
        {error && <div className="alert alert-error">{error}</div>}

        {workoutPlan && (
          <>
            <div className="grid-4 mb-24">
              {[
                { label: "Weekly Calories", value: weeklyCalories, sub: "kcal burned", icon: "🔥" },
                { label: "Training Days", value: `${workoutPlan.days?.filter(d => d.focus !== "Active Recovery").length}/6`, sub: "active days", icon: "📅" },
                { label: "Level", value: workoutPlan.level || level, sub: "difficulty", icon: "🎯" },
                { label: "Avg Duration", value: `${Math.round(workoutPlan.days?.reduce((a, d) => a + d.duration, 0) / workoutPlan.days?.length)}m`, sub: "per session", icon: "⏱️" },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>

            <div className="tab-bar mb-24">
              {workoutPlan.days?.map((d, i) => (
                <div key={i} className={`tab ${activeTab === i ? "active" : ""}`} onClick={() => setActiveTab(i)}>
                  {d.day.slice(0, 3)}
                </div>
              ))}
            </div>

            {day && (
              <div>
                <div className="flex items-center gap-12 mb-20" style={{ background: "var(--sage-pale)", padding: "16px 20px", borderRadius: "var(--radius)", border: "1px solid var(--sage-light)" }}>
                  <div style={{ flex: 1 }}>
                    <div className="fw-600" style={{ fontSize: 16, color: "var(--sage-dark)" }}>{day.day}: {day.focus}</div>
                    <div className="text-sm text-muted mt-8">⏱️ {day.duration} min · 🔥 ~{day.calories_burned} kcal</div>
                  </div>
                  <span className={`badge ${day.focus === "Active Recovery" ? "badge-blue" : "badge-orange"}`}>{day.exercises?.length} exercises</span>
                </div>

                {day.exercises?.map((ex, i) => (
                  <div key={i} className="exercise-row">
                    <div className="exercise-num">{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div className="exercise-name">{ex.name}</div>
                      {ex.instructions && <div className="text-xs text-muted mt-8">{ex.instructions}</div>}
                    </div>
                    <div className="exercise-meta">
                      <span className="badge badge-green">{ex.sets}</span>
                      <span className="badge badge-orange">Rest: {ex.rest}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── DAILY LOG ────────────────────────────────────────────────────────────────
function LogPage() {
  const { logs, addLog } = useContext(AppContext);
  const [tab, setTab] = useState("food");
  const [food, setFood] = useState({ name: "", calories: "", protein: "" });
  const [workout, setWorkout] = useState({ name: "", duration: "", calories: "" });

  const logFood = () => {
    if (!food.name || !food.calories) return;
    addLog("food", { ...food, type: "food" });
    setFood({ name: "", calories: "", protein: "" });
  };
  const logWorkout = () => {
    if (!workout.name || !workout.duration) return;
    addLog("workout", { ...workout, type: "workout" });
    setWorkout({ name: "", duration: "", calories: "" });
  };

  const totalCal = logs.food.reduce((a, l) => a + parseInt(l.calories || 0), 0);
  const totalBurned = logs.workout.reduce((a, l) => a + parseInt(l.calories || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20 }}>📝 Daily Log</h2>
          <p className="text-muted text-sm mt-8">Track your food & workouts</p>
        </div>
      </div>
      <div className="page-body">
        <div className="grid-4 mb-24">
          {[
            { label: "Calories In", value: totalCal, sub: "logged today", icon: "🍽️" },
            { label: "Calories Burned", value: totalBurned, sub: "from exercise", icon: "🔥" },
            { label: "Net Calories", value: totalCal - totalBurned, sub: "balance", icon: "⚖️" },
            { label: "Log Entries", value: logs.food.length + logs.workout.length, sub: "total logs", icon: "📊" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>🍽️ Log Food</h3>
            <div className="mb-16"><label>Food Name</label><input placeholder="e.g. Dal Rice" value={food.name} onChange={e => setFood({ ...food, name: e.target.value })} /></div>
            <div className="grid-2 mb-16">
              <div><label>Calories</label><input type="number" placeholder="450" value={food.calories} onChange={e => setFood({ ...food, calories: e.target.value })} /></div>
              <div><label>Protein (g)</label><input type="number" placeholder="20" value={food.protein} onChange={e => setFood({ ...food, protein: e.target.value })} /></div>
            </div>
            <button className="btn btn-primary btn-full" onClick={logFood}>+ Add Food</button>

            <div className="mt-24">
              <h4 style={{ fontSize: 14, marginBottom: 12, color: "var(--slate)" }}>Today's Food Log</h4>
              {logs.food.length === 0 && <p className="text-muted text-sm">No food logged yet</p>}
              {logs.food.map(l => (
                <div key={l.id} className="log-item">
                  <span style={{ fontSize: 18 }}>🍽️</span>
                  <div style={{ flex: 1 }}><div className="fw-600 text-sm">{l.name}</div><div className="text-xs text-muted">{l.date}</div></div>
                  <span className="badge badge-green">{l.calories} cal</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>🏃 Log Workout</h3>
            <div className="mb-16"><label>Exercise Name</label><input placeholder="e.g. Running" value={workout.name} onChange={e => setWorkout({ ...workout, name: e.target.value })} /></div>
            <div className="grid-2 mb-16">
              <div><label>Duration (min)</label><input type="number" placeholder="30" value={workout.duration} onChange={e => setWorkout({ ...workout, duration: e.target.value })} /></div>
              <div><label>Calories Burned</label><input type="number" placeholder="250" value={workout.calories} onChange={e => setWorkout({ ...workout, calories: e.target.value })} /></div>
            </div>
            <button className="btn btn-primary btn-full" onClick={logWorkout}>+ Add Workout</button>

            <div className="mt-24">
              <h4 style={{ fontSize: 14, marginBottom: 12, color: "var(--slate)" }}>Today's Workout Log</h4>
              {logs.workout.length === 0 && <p className="text-muted text-sm">No workouts logged yet</p>}
              {logs.workout.map(l => (
                <div key={l.id} className="log-item">
                  <span style={{ fontSize: 18 }}>🏃</span>
                  <div style={{ flex: 1 }}><div className="fw-600 text-sm">{l.name}</div><div className="text-xs text-muted">{l.duration} min · {l.date}</div></div>
                  <span className="badge badge-orange">{l.calories} cal</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI CHATBOT ───────────────────────────────────────────────────────────────
function ChatPage() {
  const { onboardingData, apiKey, chatHistory, setChatHistory } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const suggestions = ["How many calories should I eat?", "Can I eat rice at night?", "Is walking enough for weight loss?", "What should I eat after workout?", "How to reduce belly fat?"];

  const send = async (msg) => {
    const text = msg || input;
    if (!text.trim()) return;
    const userMsg = { role: "user", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    const history = [...chatHistory, userMsg];
    setChatHistory(history);
    setInput("");
    setLoading(true);

    const context = `You are FitAI Coach, a friendly health & fitness expert. User profile: Weight: ${onboardingData.weight}kg, Height: ${onboardingData.height}cm, Age: ${onboardingData.age}, Goal: ${onboardingData.goal}, Activity: ${onboardingData.activity}. Give practical, concise advice (2-3 sentences max) in a friendly, motivating tone. Add relevant emojis.`;
    const fullPrompt = `${context}\n\nUser: ${text}`;

    try {
      let reply = "";
      if (!apiKey) {
        const responses = {
          "calorie": `Based on your profile (${onboardingData.weight}kg, ${onboardingData.goal}), you should aim for about ${onboardingData.goal === "weight_loss" ? "1600-1800" : onboardingData.goal === "muscle_gain" ? "2200-2500" : "1900-2100"} kcal per day. 🔥 Split this across 4-5 meals for best results!`,
          "rice": "Yes, you can eat rice at night in moderate portions! 🍚 Choose smaller portions and pair with protein (dal, chicken, paneer). Brown rice is even better as it digests slower.",
          "walk": "Walking is a great start! 🚶 For weight loss, aim for 8000-10000 steps/day or brisk walking 45 min. Combine with some strength training for best results 💪",
          "workout": "Post-workout: eat within 30 mins! 🏋️ Best combo: fast carbs + protein. Try banana + peanut butter, or rice + chicken, or a protein shake.",
          "belly": "No spot reduction, but these help! 🎯 Focus on: calorie deficit, core exercises (planks, crunches), reduce sugar & refined carbs, and 7-8 hours sleep. Consistency is key!",
        };
        const key = Object.keys(responses).find(k => text.toLowerCase().includes(k));
        reply = key ? responses[key] : `Great question! 💡 Based on your goal (${onboardingData.goal}), I'd recommend focusing on consistency with your diet and workout plan. Small daily improvements lead to big results over time! Keep going! 🌟`;
      } else {
        reply = await callGemini(fullPrompt, apiKey);
      }
      setChatHistory([...history, { role: "ai", text: reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } catch {
      setChatHistory([...history, { role: "ai", text: "Sorry, I couldn't connect right now. Please check your API key. 🙏", time: "" }]);
    }
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20 }}>🤖 AI Health Coach</h2>
          <p className="text-muted text-sm mt-8">Ask anything about fitness, nutrition & health</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50" }} />
          <span className="text-sm fw-600 text-sage">Online</span>
        </div>
      </div>
      <div className="page-body" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 72px)" }}>
        {chatHistory.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Hi, I'm your FitAI Coach!</h3>
            <p className="text-muted text-sm">Ask me anything about fitness, nutrition, or health</p>
            <div className="flex flex-wrap gap-8 mt-16" style={{ justifyContent: "center" }}>
              {suggestions.map(s => (
                <button key={s} className="chip chip-sm" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, marginBottom: 16, paddingRight: 4 }}>
          {chatHistory.map((msg, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "ai" && <div style={{ fontSize: 20, marginBottom: 4 }}>🤖</div>}
              <div className={`chat-bubble ${msg.role}`}>{msg.text}</div>
              <div className="chat-meta">{msg.time}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>🤖</div>
              <div className="chat-bubble ai"><LoadingDots /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {chatHistory.length > 0 && (
          <div className="flex flex-wrap gap-8 mb-12">
            {suggestions.slice(0, 3).map(s => (
              <button key={s} className="chip chip-sm" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        <div className="flex gap-8" style={{ background: "white", padding: 12, borderRadius: "var(--radius-lg)", border: "1px solid #e0e0e0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <input
            style={{ flex: 1, border: "none", outline: "none", fontSize: 15, background: "transparent" }}
            placeholder="Ask your health question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
          />
          <button className="btn btn-primary btn-sm" onClick={() => send()} disabled={loading || !input.trim()}>
            Send →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── WEEKLY SUMMARY ────────────────────────────────────────────────────────────
function SummaryPage() {
  const { onboardingData, logs, weeklySummary, setWeeklySummary, apiKey } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const calData = [1750, 1920, 1680, 2100, 1850, 2200, 1700];
  const burnData = [320, 450, 280, 520, 380, 600, 250];
  const maxVal = Math.max(...calData, ...burnData);

  const generate = async () => {
    setLoading(true);
    const totalCal = logs.food.reduce((a, l) => a + parseInt(l.calories || 0), 0);
    const totalBurned = logs.workout.reduce((a, l) => a + parseInt(l.calories || 0), 0);
    const prompt = `Generate a weekly fitness summary for: Goal: ${onboardingData.goal}, Weight: ${onboardingData.weight}kg, Calories logged: ${totalCal}, Calories burned: ${totalBurned}, Workouts: ${logs.workout.length}. Return JSON: {"score":75,"trend":"improving","summary":"2 sentences","wins":["win1","win2","win3"],"improvements":["tip1","tip2"],"nextWeek":"1 sentence action plan"}`;
    try {
      if (!apiKey) {
        setWeeklySummary({ score: 72, trend: "improving", summary: "Great week! You've been consistent with your workouts and mostly on track with nutrition. A few high-calorie days, but overall trending well towards your goal.", wins: ["Logged workouts 5/7 days", "Protein target met on 4 days", "Stayed under calorie limit 5/7 days"], improvements: ["Add more vegetables to lunch", "Reduce late-night snacking"], nextWeek: "Focus on hitting 8000 steps daily and drinking 3L water." });
      } else {
        const text = await callGemini(prompt, apiKey);
        const parsed = parseJSON(text);
        if (parsed) setWeeklySummary(parsed);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 20 }}>📈 Weekly Report</h2>
          <p className="text-muted text-sm mt-8">AI-powered progress analysis</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={generate} disabled={loading}>{loading ? "..." : "✨ Generate Report"}</button>
      </div>
      <div className="page-body">
        <div className="card mb-24" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>📊 Weekly Overview</h3>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <div className="text-xs text-muted mb-8 fw-600">CALORIES IN vs BURNED</div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
                {days.map((d, i) => (
                  <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 100 }}>
                      <div style={{ flex: 1, background: "var(--sage-light)", borderRadius: "3px 3px 0 0", height: `${(calData[i] / maxVal) * 100}%`, transition: "all 0.3s" }} title={`${calData[i]} cal in`} />
                      <div style={{ flex: 1, background: "var(--accent)", borderRadius: "3px 3px 0 0", height: `${(burnData[i] / maxVal) * 100}%`, opacity: 0.7, transition: "all 0.3s" }} title={`${burnData[i]} burned`} />
                    </div>
                    <div className="text-xs text-muted">{d}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-16 mt-12">
                <div className="flex items-center gap-6"><div style={{ width: 12, height: 12, background: "var(--sage-light)", borderRadius: 2 }} /><span className="text-xs text-muted">Calories In</span></div>
                <div className="flex items-center gap-6"><div style={{ width: 12, height: 12, background: "var(--accent)", borderRadius: 2, opacity: 0.7 }} /><span className="text-xs text-muted">Burned</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {weeklySummary ? (
            <>
              <div className="card" style={{ padding: 24 }}>
                <div className="flex items-center justify-between mb-16">
                  <h3 style={{ fontSize: 16 }}>🎯 AI Analysis</h3>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--sage)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "white", fontFamily: "Syne" }}>{weeklySummary.score}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.8)", textTransform: "uppercase" }}>score</div>
                  </div>
                </div>
                <p className="text-sm" style={{ lineHeight: 1.7, marginBottom: 16 }}>{weeklySummary.summary}</p>
                <span className={`badge ${weeklySummary.trend === "improving" ? "badge-green" : "badge-orange"}`}>📈 Trend: {weeklySummary.trend}</span>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>🏆 Wins & Improvements</h3>
                <div className="mb-16">
                  {weeklySummary.wins?.map((w, i) => (
                    <div key={i} className="flex items-center gap-8 mb-8">
                      <span style={{ color: "var(--sage)" }}>✅</span>
                      <span className="text-sm">{w}</span>
                    </div>
                  ))}
                </div>
                <div className="mb-16">
                  {weeklySummary.improvements?.map((t, i) => (
                    <div key={i} className="flex items-center gap-8 mb-8">
                      <span>💡</span>
                      <span className="text-sm text-slate">{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "var(--sage-pale)", padding: "12px 16px", borderRadius: "var(--radius)", borderLeft: "3px solid var(--sage)" }}>
                  <div className="text-xs fw-600 text-sage mb-8">NEXT WEEK ACTION</div>
                  <div className="text-sm">{weeklySummary.nextWeek}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ padding: 40, textAlign: "center", gridColumn: "1 / -1" }}>
              {loading ? (
                <><LoadingDots /><p className="text-muted mt-16">Analyzing your week...</p></>
              ) : (
                <><div style={{ fontSize: 48 }}>📊</div><h3 style={{ marginTop: 12, marginBottom: 8 }}>No report yet</h3><p className="text-muted text-sm mb-16">Generate your AI weekly analysis</p><button className="btn btn-primary" onClick={generate}>✨ Generate Report</button></>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage() {
  const users = JSON.parse(localStorage.getItem("fitai_users") || "[]");
  return (
    <div>
      <div className="page-header">
        <h2 style={{ fontSize: 20 }}>👥 User Management</h2>
      </div>
      <div className="page-body">
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Registered Users ({users.length})</h3>
          {users.length === 0 ? <p className="text-muted">No users registered yet.</p> :
            users.map(u => (
              <div key={u.id} className="log-item">
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--sage-pale)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--sage-dark)", fontSize: 14 }}>{u.name?.[0]?.toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div className="fw-600 text-sm">{u.name}</div>
                  <div className="text-xs text-muted">{u.email}</div>
                </div>
                <span className={`badge ${u.role === "admin" ? "badge-orange" : "badge-green"}`}>{u.role}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  const { user, onboardingData, dietPlan } = useContext(AppContext);
  const [screen, setScreen] = useState("login"); // login | register | apikey | onboard1..4 | dashboard
  const [dashPage, setDashPage] = useState("overview");

  // Seed admin account
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("fitai_users") || "[]");
    if (!stored.find(u => u.email === "admin@fitai.com")) {
      localStorage.setItem("fitai_users", JSON.stringify([...stored, { id: 1, name: "Admin User", email: "admin@fitai.com", password: "admin123", role: "admin" }]));
    }
  }, []);

  useEffect(() => {
    if (user && screen === "login") setScreen("apikey");
  }, [user]);

  if (!user) {
    if (screen === "register") return <RegisterPage onNavigate={setScreen} />;
    return <LoginPage onNavigate={setScreen} />;
  }
  if (screen === "apikey") return <ApiKeySetup onDone={() => setScreen(user.role === "admin" ? "dashboard" : "onboard1")} />;
  if (screen === "onboard1") return <Step1_DietPrefs onNext={() => setScreen("onboard2")} />;
  if (screen === "onboard2") return <Step2_Motivation onNext={() => setScreen("onboard3")} onBack={() => setScreen("onboard1")} />;
  if (screen === "onboard3") return <Step3_Biometrics onNext={() => setScreen("onboard4")} onBack={() => setScreen("onboard2")} />;
  if (screen === "onboard4") return <Step4_DietPlan onNext={() => setScreen("dashboard")} />;

  return (
    <DashboardLayout page={dashPage} setPage={setDashPage}>
      {dashPage === "overview" && <OverviewPage setPage={setDashPage} />}
      {dashPage === "diet" && <DietPlanPage />}
      {dashPage === "workout" && <WorkoutPage />}
      {dashPage === "log" && <LogPage />}
      {dashPage === "chat" && <ChatPage />}
      {dashPage === "summary" && <SummaryPage />}
      {dashPage === "admin" && <AdminPage />}
    </DashboardLayout>
  );
}

export default function FitAIApp() {
  return (
    <AppProvider>
      <style>{css}</style>
      <div className="app-wrap"><App /></div>
    </AppProvider>
  );
}
