import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import AvatarSVG from "./Avatar";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const HOME_QUESTS = [
  { id: 1, name: "10 push-ups", xp: 50 },
  { id: 2, name: "10 sit-ups", xp: 50 },
  { id: 3, name: "1km run", xp: 60 },
  { id: 4, name: "20 squats", xp: 60 },
  { id: 5, name: "1 min plank", xp: 40 },
  { id: 6, name: "10 lunges", xp: 50 },
];

const GYM_QUESTS = [
  { id: 1, name: "Bench press 3x10", xp: 75 },
  { id: 2, name: "Squat 3x10", xp: 75 },
  { id: 3, name: "1km run", xp: 60 },
  { id: 4, name: "Pull-ups 3x8", xp: 70 },
  { id: 5, name: "1 min plank", xp: 40 },
  { id: 6, name: "Deadlift 3x8", xp: 80 },
];

const RANKS = [
  { minLevel: 1, rank: "E", title: "Awakened Hunter" },
  { minLevel: 5, rank: "D", title: "Iron Body" },
  { minLevel: 10, rank: "C", title: "Steel Warrior" },
  { minLevel: 20, rank: "B", title: "Shadow Blade" },
  { minLevel: 35, rank: "A", title: "Monarch" },
  { minLevel: 50, rank: "S", title: "Shadow Sovereign" },
];

const STREAK_MILESTONES = [
  { days: 7, bonus: 100, label: "7 Day Warrior", emoji: "🔥" },
  { days: 14, bonus: 200, label: "2 Week Hunter", emoji: "⚡" },
  { days: 30, bonus: 500, label: "Monthly Legend", emoji: "👑" },
  { days: 60, bonus: 1000, label: "Iron Will", emoji: "💎" },
  { days: 100, bonus: 2000, label: "Shadow Sovereign", emoji: "🌑" },
];

function getRank(level) {
  return [...RANKS].reverse().find((r) => level >= r.minLevel) || RANKS[0];
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

function scheduleNotification(hour) {
  const now = new Date();
  const scheduled = new Date();
  scheduled.setHours(hour, 0, 0, 0);
  if (scheduled <= now) scheduled.setDate(scheduled.getDate() + 1);
  const delay = scheduled.getTime() - now.getTime();
  setTimeout(() => {
    if (Notification.permission === "granted") {
      new Notification("⚡ Hunter System", {
        body: "Your daily quests await. Don't break your streak!",
        icon: "/vite.svg",
        tag: "daily-quest-reminder",
      });
    }
    scheduleNotification(hour);
  }, delay);
}

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        await supabase.from("profiles").insert({ id: data.user.id, username: username || email.split("@")[0], total_xp: 0, level: 1, strength: 10, endurance: 10, vitality: 10, agility: 10, mode: "home", streak: 0, longest_streak: 0, setup_complete: false });
        setMessage("Account created! Check your email to confirm, then log in.");
        setIsLogin(true);
      }
    }
    setLoading(false);
  }

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚡</div>
          <h1 style={{ color: "#e8e8f0", fontSize: 24, fontWeight: 600, margin: 0 }}>Hunter System</h1>
          <p style={{ color: "#534AB7", margin: "6px 0 0", fontSize: 14 }}>Arise and begin your journey</p>
        </div>
        <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", marginBottom: 20, background: "#0a0a0f", borderRadius: 8, padding: 3 }}>
            <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", background: isLogin ? "#534AB7" : "transparent", color: isLogin ? "#fff" : "#666", cursor: "pointer", fontSize: 14 }}>Login</button>
            <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", background: !isLogin ? "#534AB7" : "transparent", color: !isLogin ? "#fff" : "#666", cursor: "pointer", fontSize: 14 }}>Sign Up</button>
          </div>
          {!isLogin && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Hunter Name</div>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your name" style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Email</div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" type="email" style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Password</div>
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" type="password" style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          {error && <div style={{ background: "#2a0a0a", border: "1px solid #5a1a1a", borderRadius: 8, padding: "10px 12px", color: "#ff6b6b", fontSize: 13, marginBottom: 14 }}>{error}</div>}
          {message && <div style={{ background: "#0a2a0a", border: "1px solid #1a5a1a", borderRadius: 8, padding: "10px 12px", color: "#6bff6b", fontSize: 13, marginBottom: 14 }}>{message}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Loading..." : isLogin ? "Login" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingScreen({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ body_type: "", goal: "", mode: "" });
  const steps = [
    { question: "Welcome, Hunter. Before you begin...", subtitle: "What does your body look like right now?", options: [{ value: "very_skinny", label: "Very Skinny", desc: "Quite thin, need to gain mass", emoji: "🦴" }, { value: "skinny", label: "Skinny", desc: "Lean but not very muscular", emoji: "😤" }, { value: "average", label: "Average", desc: "Normal build, some muscle", emoji: "🧍" }, { value: "chubby", label: "Chubby", desc: "A bit of extra weight", emoji: "🙂" }, { value: "overweight", label: "Overweight", desc: "Significantly above ideal weight", emoji: "💪" }], key: "body_type" },
    { question: "What is your main goal?", subtitle: "This will shape your quest recommendations", options: [{ value: "lose_weight", label: "Lose Weight", desc: "Burn fat and get leaner", emoji: "🔥" }, { value: "build_muscle", label: "Build Muscle", desc: "Get stronger and bigger", emoji: "💪" }, { value: "both", label: "Both", desc: "Lose fat and gain muscle", emoji: "⚡" }], key: "goal" },
    { question: "Where will you train?", subtitle: "You can switch anytime later", options: [{ value: "home", label: "At Home", desc: "No equipment needed", emoji: "🏠" }, { value: "gym", label: "At the Gym", desc: "Full equipment available", emoji: "🏋️" }], key: "mode" },
  ];
  const current = steps[step];
  async function finishSetup(finalAnswers) {
    await supabase.from("profiles").update({ body_type: finalAnswers.body_type, goal: finalAnswers.goal, mode: finalAnswers.mode, setup_complete: true }).eq("id", user.id);
    onComplete({ ...finalAnswers, setup_complete: true });
  }
  function selectOption(value) {
    const newAnswers = { ...answers, [current.key]: value };
    setAnswers(newAnswers);
    if (step < steps.length - 1) setTimeout(() => setStep(step + 1), 300);
    else setTimeout(() => finishSetup(newAnswers), 300);
  }
  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", fontFamily: "sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", maxWidth: 420, margin: "0 auto" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
      <div style={{ fontSize: 11, color: "#444", marginBottom: 24, letterSpacing: "0.1em" }}>STEP {step + 1} OF {steps.length}</div>
      <div style={{ width: "100%", background: "#1a1a2e", borderRadius: 4, height: 4, marginBottom: 32 }}>
        <div style={{ background: "#534AB7", borderRadius: 4, height: 4, width: `${((step + 1) / steps.length) * 100}%`, transition: "width 0.4s" }} />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 600, textAlign: "center", marginBottom: 6 }}>{current.question}</h2>
      <p style={{ fontSize: 14, color: "#555", textAlign: "center", marginBottom: 28 }}>{current.subtitle}</p>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        {current.options.map((opt) => (
          <button key={opt.value} onClick={() => selectOption(opt.value)} style={{ width: "100%", background: answers[current.key] === opt.value ? "#1a1035" : "#0f0f1a", border: `1px solid ${answers[current.key] === opt.value ? "#534AB7" : "#1e1e2e"}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", color: "#e8e8f0", textAlign: "left" }}>
            <div style={{ fontSize: 28, width: 36, textAlign: "center" }}>{opt.emoji}</div>
            <div><div style={{ fontSize: 15, fontWeight: 500 }}>{opt.label}</div><div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{opt.desc}</div></div>
            {answers[current.key] === opt.value && <div style={{ marginLeft: "auto", color: "#534AB7", fontSize: 18 }}>✓</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

function NotificationSettings({ user, profile, onSave, onClose }) {
  const [enabled, setEnabled] = useState(profile?.notify_enabled || false);
  const [hour, setHour] = useState(profile?.notify_hour || 19);
  const [saving, setSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(typeof Notification !== "undefined" ? Notification.permission : "default");

  async function save() {
    setSaving(true);
    if (enabled) {
      const granted = await requestNotificationPermission();
      setPermissionStatus(granted ? "granted" : "denied");
      if (granted) scheduleNotification(hour);
    }
    await supabase.from("profiles").update({ notify_enabled: enabled, notify_hour: hour }).eq("id", user.id);
    onSave({ notify_enabled: enabled, notify_hour: hour });
    setSaving(false);
  }

  async function testNotification() {
    const granted = await requestNotificationPermission();
    if (granted) new Notification("⚡ Hunter System", { body: "This is your daily quest reminder! Stay consistent, Hunter.", icon: "/vite.svg" });
  }

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", padding: "0 0 80px" }}>
      <div style={{ background: "#0f0f1a", padding: "16px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 8, padding: "6px 12px", color: "#888", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div><div style={{ fontSize: 16, fontWeight: 500 }}>Notifications</div><div style={{ fontSize: 12, color: "#534AB7" }}>Daily quest reminders</div></div>
      </div>
      <div style={{ padding: "20px" }}>
        <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 12, padding: "16px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontSize: 15, fontWeight: 500 }}>Daily Reminders</div><div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>Get reminded to complete your quests</div></div>
            <div onClick={() => setEnabled(!enabled)} style={{ width: 44, height: 24, borderRadius: 12, background: enabled ? "#534AB7" : "#1a1a2e", cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
              <div style={{ position: "absolute", top: 2, left: enabled ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.3s" }} />
            </div>
          </div>
          {permissionStatus === "denied" && <div style={{ background: "#2a0a0a", border: "1px solid #5a1a1a", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#ff6b6b", marginTop: 10 }}>Notifications are blocked. Please enable them in your browser settings.</div>}
        </div>
        {enabled && (
          <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 12, padding: "16px", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Reminder Time</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[6, 7, 8, 9, 12, 17, 18, 19, 20, 21].map((h) => (
                <button key={h} onClick={() => setHour(h)} style={{ padding: "10px", borderRadius: 8, border: `1px solid ${hour === h ? "#534AB7" : "#1e1e2e"}`, background: hour === h ? "#1a1035" : "transparent", color: hour === h ? "#AFA9EC" : "#555", cursor: "pointer", fontSize: 13 }}>
                  {h === 12 ? "12:00 PM" : h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 12, padding: "16px", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>What you'll receive</div>
          {[["⚡", "Daily quest reminder at your chosen time"], ["🔥", "Streak milestone celebrations"], ["👑", "Level up notifications"]].map(([e, t]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>{e}</span><span style={{ fontSize: 13, color: "#888" }}>{t}</span>
            </div>
          ))}
        </div>
        <button onClick={testNotification} style={{ width: "100%", background: "transparent", border: "1px solid #534AB7", color: "#AFA9EC", borderRadius: 8, padding: "12px", fontSize: 14, cursor: "pointer", marginBottom: 10 }}>Send Test Notification</button>
        <button onClick={save} disabled={saving} style={{ width: "100%", background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function AvatarScreen({ user, profile, onClose }) {
  const rank = getRank(profile?.level || 1).rank;
  const RANK_TITLES = { E: "Awakened Hunter", D: "Iron Body", C: "Steel Warrior", B: "Shadow Blade", A: "Monarch", S: "Shadow Sovereign" };
  const nextRankInfo = RANKS.find(r => r.minLevel > (profile?.level || 1));
  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", padding: "0 0 80px" }}>
      <div style={{ background: "#0f0f1a", padding: "16px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 8, padding: "6px 12px", color: "#888", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div><div style={{ fontSize: 16, fontWeight: 500 }}>My Hunter</div><div style={{ fontSize: 12, color: "#534AB7" }}>Rank {rank} — {RANK_TITLES[rank]}</div></div>
      </div>
      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 200, marginBottom: 16 }}>
          <AvatarSVG rank={rank} bodyType={profile?.body_type || "average"} goal={profile?.goal || "both"} animated={true} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>{profile?.username || "Hunter"}</div>
        <div style={{ fontSize: 14, color: "#534AB7", marginBottom: 16 }}>{RANK_TITLES[rank]}</div>
        <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 12, padding: "14px 20px", marginBottom: 16, width: "100%", display: "flex", justifyContent: "space-around" }}>
          {[["🔥", profile?.streak || 0, "Day Streak"], ["⚡", profile?.level || 1, "Level"], ["👑", profile?.longest_streak || 0, "Best Streak"]].map(([icon, val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{icon}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: "#AFA9EC" }}>{val}</div>
              <div style={{ fontSize: 11, color: "#555" }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 12, padding: "16px", marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>RANK PROGRESSION</div>
          {RANKS.map((r) => {
            const unlocked = (profile?.level || 1) >= r.minLevel;
            const isCurrent = r.rank === rank;
            return (
              <div key={r.rank} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, opacity: unlocked ? 1 : 0.4 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: isCurrent ? "#1a1035" : "#0a0a0f", border: `1.5px solid ${isCurrent ? "#534AB7" : "#1e1e2e"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: isCurrent ? "#AFA9EC" : "#555", fontWeight: 700 }}>{r.rank}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: unlocked ? "#e8e8f0" : "#444" }}>{r.title}</div><div style={{ fontSize: 11, color: "#444" }}>Level {r.minLevel}+</div></div>
                {isCurrent && <span style={{ fontSize: 11, background: "#1a1035", color: "#534AB7", padding: "2px 8px", borderRadius: 10, border: "1px solid #534AB7" }}>Current</span>}
                {unlocked && !isCurrent && <span style={{ fontSize: 12, color: "#4CAF50" }}>✓</span>}
                {!unlocked && <span style={{ fontSize: 11, color: "#333" }}>{r.minLevel - (profile?.level || 1)} lvls</span>}
              </div>
            );
          })}
        </div>
        {nextRankInfo && (
          <div style={{ width: "100%", background: "#0f0f1a", border: "1px solid #534AB7", borderRadius: 12, padding: "14px" }}>
            <div style={{ fontSize: 12, color: "#534AB7", marginBottom: 6 }}>NEXT RANK</div>
            <div style={{ fontSize: 14, color: "#e8e8f0" }}>Level {nextRankInfo.minLevel} — <strong>{nextRankInfo.title}</strong></div>
            <div style={{ background: "#1a1a2e", borderRadius: 4, height: 6, marginTop: 10 }}>
              <div style={{ background: "#534AB7", borderRadius: 4, height: 6, width: `${Math.min(100, ((profile?.level || 1) / nextRankInfo.minLevel) * 100)}%` }} />
            </div>
            <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>{nextRankInfo.minLevel - (profile?.level || 1)} more levels to go</div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestLibrary({ user, profile, onClose }) {
  const [quests, setQuests] = useState([]);
  const [myQuests, setMyQuests] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", xp: "50", category: "strength", mode: "both" });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("browse");
  const [filter, setFilter] = useState("all");
  useEffect(() => { loadData(); }, []);
  async function loadData() {
    const { data: q } = await supabase.from("custom_quests").select("*").order("likes", { ascending: false });
    setQuests(q || []);
    const { data: mine } = await supabase.from("user_custom_quests").select("quest_id").eq("user_id", user.id);
    setMyQuests(mine ? mine.map(m => m.quest_id) : []);
  }
  async function createQuest() {
    if (!form.name) return;
    setSaving(true);
    await supabase.from("custom_quests").insert({ created_by: user.id, creator_name: profile?.username || "Hunter", name: form.name, description: form.description, xp: parseInt(form.xp), category: form.category, mode: form.mode, likes: 0 });
    setForm({ name: "", description: "", xp: "50", category: "strength", mode: "both" });
    loadData(); setSaving(false); setTab("browse");
  }
  async function toggleQuest(questId) {
    if (myQuests.includes(questId)) await supabase.from("user_custom_quests").delete().eq("user_id", user.id).eq("quest_id", questId);
    else await supabase.from("user_custom_quests").insert({ user_id: user.id, quest_id: questId });
    loadData();
  }
  const filtered = quests.filter(q => filter === "all" || q.mode === filter || q.mode === "both");
  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", padding: "0 0 80px" }}>
      <div style={{ background: "#0f0f1a", padding: "16px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 8, padding: "6px 12px", color: "#888", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div><div style={{ fontSize: 16, fontWeight: 500 }}>Quest Library</div><div style={{ fontSize: 12, color: "#534AB7" }}>Browse & create quests</div></div>
      </div>
      <div style={{ display: "flex", background: "#0f0f1a", borderBottom: "1px solid #1e1e2e" }}>
        {[["browse", "Browse"], ["create", "Create"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "12px", border: "none", background: "transparent", color: tab === id ? "#AFA9EC" : "#555", borderBottom: tab === id ? "2px solid #534AB7" : "2px solid transparent", cursor: "pointer", fontSize: 14 }}>{label}</button>
        ))}
      </div>
      {tab === "browse" && (
        <div style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {[["all", "All"], ["home", "🏠 Home"], ["gym", "🏋️ Gym"], ["both", "Both"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{ padding: "6px 12px", borderRadius: 20, border: `1px solid ${filter === val ? "#534AB7" : "#1e1e2e"}`, background: filter === val ? "#1a1035" : "transparent", color: filter === val ? "#AFA9EC" : "#555", cursor: "pointer", fontSize: 12 }}>{label}</button>
            ))}
          </div>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "#444" }}>No quests yet — be the first!</div>}
          {filtered.map((q) => {
            const added = myQuests.includes(q.id);
            return (
              <div key={q.id} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 500 }}>{q.name}</div>{q.description && <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{q.description}</div>}</div>
                  <span style={{ fontSize: 12, color: "#534AB7", fontWeight: 500 }}>+{q.xp} XP</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#444" }}>by {q.creator_name}</span>
                  <span style={{ fontSize: 11, background: "#1a1a2e", padding: "2px 6px", borderRadius: 4, color: "#666" }}>{q.mode}</span>
                  <div style={{ marginLeft: "auto" }}><button onClick={() => toggleQuest(q.id)} style={{ background: added ? "#1a1035" : "#534AB7", border: "none", borderRadius: 6, padding: "4px 10px", color: "#fff", cursor: "pointer", fontSize: 12 }}>{added ? "✓ Added" : "+ Add"}</button></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {tab === "create" && (
        <div style={{ padding: "16px 20px" }}>
          {[["Quest Name", "name", "e.g. 20 push-ups"], ["Description (optional)", "description", "Any tips..."]].map(([label, key, ph]) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{label}</div>
              <input value={form[key]} onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div><div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>XP Reward</div><input value={form.xp} onChange={(e) => setForm(p => ({ ...p, xp: e.target.value }))} type="number" style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Mode</div><select value={form.mode} onChange={(e) => setForm(p => ({ ...p, mode: e.target.value }))} style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }}><option value="both">Both</option><option value="home">Home</option><option value="gym">Gym</option></select></div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Category</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["strength", "cardio", "flexibility", "core", "general"].map(cat => (
                <button key={cat} onClick={() => setForm(p => ({ ...p, category: cat }))} style={{ padding: "6px 12px", borderRadius: 20, border: `1px solid ${form.category === cat ? "#534AB7" : "#1e1e2e"}`, background: form.category === cat ? "#1a1035" : "transparent", color: form.category === cat ? "#AFA9EC" : "#555", cursor: "pointer", fontSize: 12, textTransform: "capitalize" }}>{cat}</button>
              ))}
            </div>
          </div>
          <button onClick={createQuest} disabled={saving || !form.name} style={{ width: "100%", background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>{saving ? "Creating..." : "Create & Share Quest"}</button>
        </div>
      )}
    </div>
  );
}

function BodyLogger({ user, onClose }) {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ weight_kg: "", height_cm: "", chest_cm: "", waist_cm: "", hips_cm: "", bicep_cm: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { loadLogs(); }, []);
  async function loadLogs() {
    const { data } = await supabase.from("body_logs").select("*").eq("user_id", user.id).order("logged_date", { ascending: false }).limit(10);
    setLogs(data || []);
  }
  async function saveLog() {
    setSaving(true);
    const entry = { user_id: user.id, logged_date: getTodayString() };
    Object.keys(form).forEach((k) => { if (form[k] !== "") entry[k] = form[k]; });
    await supabase.from("body_logs").insert(entry);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    setForm({ weight_kg: "", height_cm: "", chest_cm: "", waist_cm: "", hips_cm: "", bicep_cm: "", notes: "" });
    loadLogs(); setSaving(false);
  }
  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", padding: "0 0 80px" }}>
      <div style={{ background: "#0f0f1a", padding: "16px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 8, padding: "6px 12px", color: "#888", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div><div style={{ fontSize: 16, fontWeight: 500 }}>Body Measurements</div><div style={{ fontSize: 12, color: "#534AB7" }}>Track your physical progress</div></div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["weight_kg", "Weight (kg)", "75.5"], ["height_cm", "Height (cm)", "178"], ["chest_cm", "Chest (cm)", "95"], ["waist_cm", "Waist (cm)", "82"], ["hips_cm", "Hips (cm)", "90"], ["bicep_cm", "Bicep (cm)", "35"]].map(([key, label, ph]) => (
            <div key={key}><div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{label}</div><input value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={`e.g. ${ph}`} type="number" style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} /></div>
          ))}
        </div>
        <div style={{ marginTop: 10 }}><div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Notes (optional)</div><input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="How are you feeling?" style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} /></div>
        <button onClick={saveLog} disabled={saving} style={{ width: "100%", marginTop: 14, background: saved ? "#1a4a1a" : "#534AB7", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>{saved ? "✓ Saved!" : saving ? "Saving..." : "Save Measurements"}</button>
      </div>
      <div style={{ padding: "0 20px" }}>
        <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Previous Logs</div>
        {logs.length === 0 && <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "20px", textAlign: "center", color: "#444", fontSize: 14 }}>No logs yet!</div>}
        {logs.map((log) => (
          <div key={log.id} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#AFA9EC", fontWeight: 500 }}>{log.logged_date}</span>
              {log.weight_kg && <span style={{ fontSize: 13, color: "#534AB7", fontWeight: 500 }}>{log.weight_kg} kg</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {[["height_cm", "H"], ["chest_cm", "C"], ["waist_cm", "W"], ["bicep_cm", "B"]].map(([k, l]) => log[k] ? <div key={k} style={{ fontSize: 12, color: "#666" }}>{l}: <span style={{ color: "#c0c0d0" }}>{log[k]}cm</span></div> : null)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NutritionTracker({ user, onClose }) {
  const [meals, setMeals] = useState([]);
  const [goals, setGoals] = useState({ goal_type: "maintain", calorie_target: 2000, protein_target: 150 });
  const [form, setForm] = useState({ meal_name: "", calories: "", protein_g: "", carbs_g: "", fats_g: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  useEffect(() => { loadData(); }, []);
  async function loadData() {
    const { data: mealData } = await supabase.from("nutrition_logs").select("*").eq("user_id", user.id).eq("logged_date", getTodayString()).order("created_at", { ascending: true });
    setMeals(mealData || []);
    const { data: goalData } = await supabase.from("nutrition_goals").select("*").eq("user_id", user.id).single();
    if (goalData) setGoals(goalData);
  }
  async function saveMeal() {
    if (!form.meal_name) return;
    setSaving(true);
    const entry = { user_id: user.id, logged_date: getTodayString(), meal_name: form.meal_name };
    if (form.calories) entry.calories = parseInt(form.calories);
    if (form.protein_g) entry.protein_g = parseFloat(form.protein_g);
    if (form.carbs_g) entry.carbs_g = parseFloat(form.carbs_g);
    if (form.fats_g) entry.fats_g = parseFloat(form.fats_g);
    await supabase.from("nutrition_logs").insert(entry);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    setForm({ meal_name: "", calories: "", protein_g: "", carbs_g: "", fats_g: "" });
    loadData(); setSaving(false);
  }
  async function deleteMeal(id) { await supabase.from("nutrition_logs").delete().eq("id", id); loadData(); }
  async function saveGoals() { await supabase.from("nutrition_goals").upsert({ ...goals, user_id: user.id }); setShowGoals(false); }
  const totalCals = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein = meals.reduce((s, m) => s + (parseFloat(m.protein_g) || 0), 0);
  const calPct = Math.min(100, Math.round((totalCals / goals.calorie_target) * 100));
  const proteinPct = Math.min(100, Math.round((totalProtein / goals.protein_target) * 100));
  const goalColors = { bulk: "#4CAF50", cut: "#f44336", maintain: "#534AB7" };
  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", padding: "0 0 80px" }}>
      <div style={{ background: "#0f0f1a", padding: "16px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 8, padding: "6px 12px", color: "#888", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 500 }}>Nutrition Tracker</div></div>
        <button onClick={() => setShowGoals(!showGoals)} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 8, padding: "6px 12px", color: "#888", cursor: "pointer", fontSize: 13 }}>⚙️</button>
      </div>
      {showGoals && (
        <div style={{ background: "#0f0f1a", borderBottom: "1px solid #1e1e2e", padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {["bulk", "maintain", "cut"].map((g) => (<button key={g} onClick={() => setGoals((p) => ({ ...p, goal_type: g }))} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${goals.goal_type === g ? goalColors[g] : "#1e1e2e"}`, background: goals.goal_type === g ? "#1a1035" : "transparent", color: goals.goal_type === g ? goalColors[g] : "#555", cursor: "pointer", fontSize: 13, textTransform: "capitalize" }}>{g}</button>))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {[["calorie_target", "Daily Calories"], ["protein_target", "Protein (g)"]].map(([k, l]) => (<div key={k}><div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{l}</div><input value={goals[k]} onChange={(e) => setGoals((p) => ({ ...p, [k]: parseInt(e.target.value) }))} type="number" style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} /></div>))}
          </div>
          <button onClick={saveGoals} style={{ width: "100%", background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, cursor: "pointer" }}>Save Goal</button>
        </div>
      )}
      <div style={{ padding: "14px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[["Calories", totalCals, goals.calorie_target, "kcal", calPct], ["Protein", totalProtein.toFixed(1), goals.protein_target, "g", proteinPct]].map(([label, val, target, unit, pct]) => (
            <div key={label} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: pct >= 100 ? (label === "Calories" ? "#f44336" : "#4CAF50") : "#e8e8f0" }}>{val}</div>
              <div style={{ fontSize: 11, color: "#444" }}>/ {target} {unit}</div>
              <div style={{ background: "#1a1a2e", borderRadius: 4, height: 4, marginTop: 8 }}><div style={{ background: pct >= 100 ? (label === "Calories" ? "#f44336" : "#4CAF50") : "#534AB7", borderRadius: 4, height: 4, width: `${pct}%` }} /></div>
            </div>
          ))}
        </div>
        <input value={form.meal_name} onChange={(e) => setForm((p) => ({ ...p, meal_name: e.target.value }))} placeholder="Meal name" style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box", marginBottom: 8 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          {[["calories", "Calories"], ["protein_g", "Protein (g)"], ["carbs_g", "Carbs (g)"], ["fats_g", "Fats (g)"]].map(([key, label]) => (
            <div key={key}><div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{label}</div><input value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} type="number" placeholder="0" style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} /></div>
          ))}
        </div>
        <button onClick={saveMeal} disabled={saving || !form.meal_name} style={{ width: "100%", background: saved ? "#1a4a1a" : "#534AB7", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>{saved ? "✓ Added!" : saving ? "Saving..." : "+ Add Meal"}</button>
      </div>
      <div style={{ padding: "0 20px" }}>
        {meals.length === 0 && <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "20px", textAlign: "center", color: "#444", fontSize: 14 }}>No meals logged yet!</div>}
        {meals.map((meal) => (
          <div key={meal.id} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{meal.meal_name}</div><div style={{ display: "flex", gap: 10 }}>{meal.calories && <span style={{ fontSize: 12, color: "#534AB7" }}>{meal.calories} kcal</span>}{meal.protein_g && <span style={{ fontSize: 12, color: "#666" }}>P: {meal.protein_g}g</span>}</div></div>
            <button onClick={() => deleteMeal(meal.id)} style={{ background: "transparent", border: "none", color: "#333", cursor: "pointer", fontSize: 18 }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressCharts({ user, profile, onClose }) {
  const [weightData, setWeightData] = useState([]);
  const [questData, setQuestData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadData(); }, []);
  async function loadData() {
    setLoading(true);
    const { data: bodyLogs } = await supabase.from("body_logs").select("logged_date, weight_kg").eq("user_id", user.id).order("logged_date", { ascending: true }).limit(30);
    if (bodyLogs) setWeightData(bodyLogs.filter(d => d.weight_kg).map(d => ({ date: d.logged_date.slice(5), weight: parseFloat(d.weight_kg) })));
    const { data: questLogs } = await supabase.from("quest_completions").select("completed_date").eq("user_id", user.id).order("completed_date", { ascending: true });
    if (questLogs) {
      const counts = {};
      questLogs.forEach(q => { counts[q.completed_date] = (counts[q.completed_date] || 0) + 1; });
      setQuestData(Object.entries(counts).slice(-14).map(([date, count]) => ({ date: date.slice(5), quests: count })));
    }
    setLoading(false);
  }
  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", padding: "0 0 80px" }}>
      <div style={{ background: "#0f0f1a", padding: "16px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 8, padding: "6px 12px", color: "#888", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div><div style={{ fontSize: 16, fontWeight: 500 }}>Progress</div><div style={{ fontSize: 12, color: "#534AB7" }}>Your hunter journey</div></div>
      </div>
      {loading ? <div style={{ textAlign: "center", padding: 40, color: "#534AB7" }}>Loading...</div> : (
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
            {[["Level", profile?.level || 1], ["XP", profile?.total_xp || 0], ["🔥 Streak", profile?.streak || 0]].map(([label, val]) => (
              <div key={label} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: "#AFA9EC" }}>{val}</div>
                <div style={{ fontSize: 11, color: "#555" }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "14px", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Weight over time</div>
            {weightData.length < 2 ? <div style={{ textAlign: "center", padding: "20px 0", color: "#444", fontSize: 13 }}>Log 2+ measurements to see chart</div> : (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={weightData}>
                  <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, color: "#e8e8f0" }} />
                  <Line type="monotone" dataKey="weight" stroke="#534AB7" strokeWidth={2} dot={{ fill: "#534AB7", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "14px" }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Daily quests (14 days)</div>
            {questData.length === 0 ? <div style={{ textAlign: "center", padding: "20px 0", color: "#444", fontSize: 13 }}>Complete quests to see activity</div> : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={questData}>
                  <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, color: "#e8e8f0" }} />
                  <Bar dataKey="quests" fill="#534AB7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [levelUpMsg, setLevelUpMsg] = useState(false);
  const [streakMsg, setStreakMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("home");
  const notifScheduled = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadData(session.user);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadData(session.user);
      else { setLoading(false); setProfile(null); setCompleted([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadData(u) {
    setLoading(true);
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", u.id).single();
    setProfile(prof);
    if (prof?.notify_enabled && !notifScheduled.current) {
      notifScheduled.current = true;
      scheduleNotification(prof?.notify_hour || 19);
    }
    const today = getTodayString();
    const { data: quests } = await supabase.from("quest_completions").select("quest_id").eq("user_id", u.id).eq("completed_date", today);
    setCompleted(quests ? quests.map((q) => q.quest_id) : []);
    setLoading(false);
  }

  async function updateStreak(newCompleted, prof) {
    if (newCompleted.length !== 3) return;
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const lastDate = prof.last_quest_date;
    let newStreak = 1;
    if (lastDate === yesterday) newStreak = (prof.streak || 0) + 1;
    else if (lastDate === today) return;
    const newLongest = Math.max(prof.longest_streak || 0, newStreak);
    await supabase.from("profiles").update({ streak: newStreak, last_quest_date: today, longest_streak: newLongest }).eq("id", prof.id);
    setProfile(p => ({ ...p, streak: newStreak, last_quest_date: today, longest_streak: newLongest }));
    const milestone = STREAK_MILESTONES.find(m => m.days === newStreak);
    if (milestone) {
      const { data: existing } = await supabase.from("streak_rewards").select("id").eq("user_id", prof.id).eq("milestone", milestone.days);
      if (!existing || existing.length === 0) {
        await supabase.from("streak_rewards").insert({ user_id: prof.id, milestone: milestone.days });
        const newXP = (prof.total_xp || 0) + milestone.bonus;
        const newLevel = Math.floor(newXP / 200) + 1;
        await supabase.from("profiles").update({ total_xp: newXP, level: newLevel }).eq("id", prof.id);
        setProfile(p => ({ ...p, total_xp: newXP, level: newLevel }));
        setStreakMsg({ ...milestone, streak: newStreak });
        setTimeout(() => setStreakMsg(null), 4000);
        return;
      }
    }
    if (newStreak > 1) {
      setStreakMsg({ days: newStreak, label: `${newStreak} Day Streak!`, emoji: "🔥", bonus: 0 });
      setTimeout(() => setStreakMsg(null), 2500);
    }
  }

  async function toggleMode() {
    if (!profile) return;
    const newMode = profile.mode === "home" ? "gym" : "home";
    await supabase.from("profiles").update({ mode: newMode }).eq("id", user.id);
    setProfile(p => ({ ...p, mode: newMode }));
  }

  async function toggleQuest(id) {
    if (!user || !profile) return;
    const QUESTS = profile.mode === "gym" ? GYM_QUESTS : HOME_QUESTS;
    const q = QUESTS.find((q) => q.id === id);
    if (!q) return;
    const today = getTodayString();
    if (completed.includes(id)) {
      await supabase.from("quest_completions").delete().eq("user_id", user.id).eq("quest_id", id).eq("completed_date", today);
      const newXP = Math.max(0, profile.total_xp - q.xp);
      const newLevel = Math.floor(newXP / 200) + 1;
      await supabase.from("profiles").update({ total_xp: newXP, level: newLevel }).eq("id", user.id);
      setProfile((p) => ({ ...p, total_xp: newXP, level: newLevel }));
      setCompleted((prev) => prev.filter((i) => i !== id));
    } else {
      await supabase.from("quest_completions").insert({ user_id: user.id, quest_id: id, completed_date: today });
      const newXP = profile.total_xp + q.xp;
      const newLevel = Math.floor(newXP / 200) + 1;
      if (newLevel > profile.level) { setLevelUpMsg(true); setTimeout(() => setLevelUpMsg(false), 3000); }
      await supabase.from("profiles").update({ total_xp: newXP, level: newLevel }).eq("id", user.id);
      setProfile((p) => ({ ...p, total_xp: newXP, level: newLevel }));
      const newCompleted = [...completed, id];
      setCompleted(newCompleted);
      await updateStreak(newCompleted, { ...profile, total_xp: newXP, level: newLevel });
    }
  }

  async function handleLogout() { await supabase.auth.signOut(); }

  if (!user) return <AuthScreen />;
  if (loading) return <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#534AB7", fontFamily: "sans-serif", fontSize: 18 }}>⚡ Loading your profile...</div>;
  if (!profile?.setup_complete) return <OnboardingScreen user={user} onComplete={(updates) => setProfile(p => ({ ...p, ...updates }))} />;
  if (screen === "body") return <BodyLogger user={user} onClose={() => setScreen("home")} />;
  if (screen === "nutrition") return <NutritionTracker user={user} onClose={() => setScreen("home")} />;
  if (screen === "progress") return <ProgressCharts user={user} profile={profile} onClose={() => setScreen("home")} />;
  if (screen === "quests") return <QuestLibrary user={user} profile={profile} onClose={() => setScreen("home")} />;
  if (screen === "avatar") return <AvatarScreen user={user} profile={profile} onClose={() => setScreen("home")} />;
  if (screen === "notifications") return <NotificationSettings user={user} profile={profile} onSave={(updates) => { setProfile(p => ({ ...p, ...updates })); setScreen("home"); }} onClose={() => setScreen("home")} />;

  const QUESTS = profile?.mode === "gym" ? GYM_QUESTS : HOME_QUESTS;
  const level = profile?.level || 1;
  const totalXP = profile?.total_xp || 0;
  const xpIntoLevel = totalXP % 200;
  const rank = getRank(level);
  const nextRank = RANKS.find((r) => r.minLevel > level);
  const minQuestsReached = completed.length >= 3;
  const mode = profile?.mode || "home";
  const streak = profile?.streak || 0;

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", padding: "0 0 80px" }}>
      {levelUpMsg && (
        <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", background: "#534AB7", color: "#fff", padding: "14px 28px", borderRadius: "0 0 16px 16px", fontSize: 16, fontWeight: 500, zIndex: 999, textAlign: "center" }}>
          ⚡ LEVEL UP! You are now Level {level}!
        </div>
      )}
      {streakMsg && (
        <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", background: streakMsg.bonus > 0 ? "#1a1035" : "#1a1a0a", border: `1px solid ${streakMsg.bonus > 0 ? "#534AB7" : "#3a3a1a"}`, color: "#fff", padding: "14px 28px", borderRadius: "0 0 16px 16px", fontSize: 15, fontWeight: 500, zIndex: 999, textAlign: "center" }}>
          {streakMsg.emoji} {streakMsg.label}{streakMsg.bonus > 0 ? ` — +${streakMsg.bonus} Bonus XP!` : ""}
        </div>
      )}

      <div style={{ background: "#0f0f1a", padding: "20px 20px 16px", borderBottom: "1px solid #1e1e2e" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: "#1a1035", border: "1px solid #534AB7", borderRadius: 6, padding: "3px 10px", fontSize: 12, color: "#AFA9EC" }}>Rank {rank.rank}</span>
            {streak > 0 && <span style={{ background: "#1a1a0a", border: "1px solid #3a3a1a", borderRadius: 6, padding: "3px 10px", fontSize: 12, color: "#ff8c00" }}>🔥 {streak}</span>}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={toggleMode} style={{ background: mode === "gym" ? "#1a2a1a" : "#1a1035", border: `1px solid ${mode === "gym" ? "#4CAF50" : "#534AB7"}`, borderRadius: 6, padding: "3px 10px", fontSize: 12, color: mode === "gym" ? "#4CAF50" : "#AFA9EC", cursor: "pointer" }}>{mode === "gym" ? "🏋️ Gym" : "🏠 Home"}</button>
            <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 6, padding: "3px 10px", fontSize: 12, color: "#555", cursor: "pointer" }}>Logout</button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setScreen("avatar")} style={{ width: 56, height: 56, borderRadius: "50%", background: "#1a1035", border: "2px solid #534AB7", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", padding: 2, flexShrink: 0 }}>
            <AvatarSVG rank={rank.rank} bodyType={profile?.body_type || "average"} goal={profile?.goal || "both"} animated={false} />
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500 }}>{profile?.username || "Hunter"}</div>
            <div style={{ fontSize: 13, color: "#534AB7" }}>{rank.title}</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#0f0f1a", padding: "14px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 13, color: "#888" }}>Level {level}</span>
          <span style={{ fontSize: 13, color: "#AFA9EC" }}>{xpIntoLevel} / 200 XP</span>
        </div>
        <div style={{ background: "#1a1a2e", borderRadius: 4, height: 8 }}>
          <div style={{ background: "#534AB7", borderRadius: 4, height: 8, width: `${(xpIntoLevel / 200) * 100}%`, transition: "width 0.4s" }} />
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: "#444" }}>{nextRank ? `Next rank at Level ${nextRank.minLevel} — ${nextRank.rank} Rank` : "Max Rank — Shadow Sovereign"}</div>
      </div>

      <div style={{ padding: "10px 20px 0" }}>
        <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#555" }}>🔥 STREAK MILESTONES</span>
            <span style={{ fontSize: 12, color: "#ff8c00", fontWeight: 500 }}>{streak} days</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {STREAK_MILESTONES.map((m) => (
              <div key={m.days} style={{ flex: 1, textAlign: "center", opacity: streak >= m.days ? 1 : 0.3 }}>
                <div style={{ fontSize: 16 }}>{m.emoji}</div>
                <div style={{ fontSize: 10, color: streak >= m.days ? "#ff8c00" : "#444" }}>{m.days}d</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "10px 20px 0" }}>
        {[["Strength", profile?.strength], ["Endurance", profile?.endurance], ["Vitality", profile?.vitality], ["Agility", profile?.agility]].map(([name, val]) => (
          <div key={name} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 20, fontWeight: 500 }}>{val || 10}</div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{name}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "10px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>Daily Quests</div>
          <div style={{ fontSize: 11, color: "#444" }}>Min 3 to level up</div>
        </div>
        {!minQuestsReached && completed.length > 0 && <div style={{ background: "#1a1a0a", border: "1px solid #3a3a1a", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: "#888" }}>⚡ {3 - completed.length} more quest{3 - completed.length > 1 ? "s" : ""} to earn XP today!</div>}
        {minQuestsReached && <div style={{ background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: "#4CAF50" }}>✓ Minimum reached! Keep going for bonus XP!</div>}
        {QUESTS.map((q) => {
          const done = completed.includes(q.id);
          return (
            <div key={q.id} onClick={() => toggleQuest(q.id)} style={{ background: "#0f0f1a", border: `1px solid ${done ? "#534AB7" : "#1e1e2e"}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, marginBottom: 8, cursor: "pointer", transition: "border 0.2s" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? "#534AB7" : "transparent", border: `2px solid ${done ? "#534AB7" : "#444"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{done && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}</div>
              <span style={{ flex: 1, fontSize: 14, color: done ? "#666" : "#c0c0d0", textDecoration: done ? "line-through" : "none" }}>{q.name}</span>
              <span style={{ fontSize: 12, color: "#534AB7", fontWeight: 500 }}>+{q.xp} XP</span>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "8px 20px 0" }}>
        <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>Quests completed today</div>
          <div style={{ fontSize: 22, fontWeight: 500, color: minQuestsReached ? "#4CAF50" : "#AFA9EC" }}>{completed.length} / {QUESTS.length}</div>
          <div style={{ background: "#1a1a2e", borderRadius: 4, height: 4, marginTop: 8 }}><div style={{ background: minQuestsReached ? "#4CAF50" : "#534AB7", borderRadius: 4, height: 4, width: `${(completed.length / QUESTS.length) * 100}%`, transition: "width 0.4s" }} /></div>
          <div style={{ marginTop: 6, fontSize: 11, color: "#444" }}>{completed.length < 3 ? `${3 - completed.length} more to reach daily minimum` : completed.length === QUESTS.length ? "⚡ All quests complete! Come back tomorrow!" : `${QUESTS.length - completed.length} quests remaining`}</div>
        </div>
      </div>

      <div style={{ padding: "12px 20px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { screen: "avatar", icon: "⚡", title: "My Hunter", sub: `View character • ${streak > 0 ? `🔥 ${streak} day streak` : "Start your streak today"}` },
          { screen: "quests", icon: "⚔️", title: "Quest Library", sub: "Browse & create custom quests" },
          { screen: "progress", icon: "📊", title: "Progress Charts", sub: "Weight, quests & history" },
          { screen: "nutrition", icon: "🥗", title: "Nutrition Tracker", sub: "Log meals, calories & macros" },
          { screen: "body", icon: "📏", title: "Body Measurements", sub: "Log weight & measurements" },
          { screen: "notifications", icon: "🔔", title: "Notifications", sub: "Set your daily reminder time" },
        ].map((item) => (
          <button key={item.screen} onClick={() => setScreen(item.screen)} style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", color: "#e8e8f0" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#1a1035", border: "1px solid #534AB7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{item.icon}</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "#534AB7" }}>{item.sub}</div>
            </div>
            <div style={{ marginLeft: "auto", color: "#444", fontSize: 18 }}>›</div>
          </button>
        ))}
      </div>
    </div>
  );
}