import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const HOME_QUESTS = [
  { id: 1, name: "10 push-ups", xp: 50, mode: "home" },
  { id: 2, name: "10 sit-ups", xp: 50, mode: "home" },
  { id: 3, name: "1km run", xp: 60, mode: "both" },
  { id: 4, name: "20 squats", xp: 60, mode: "home" },
  { id: 5, name: "1 min plank", xp: 40, mode: "both" },
  { id: 6, name: "10 lunges", xp: 50, mode: "home" },
];

const GYM_QUESTS = [
  { id: 1, name: "Bench press 3x10", xp: 75, mode: "gym" },
  { id: 2, name: "Squat 3x10", xp: 75, mode: "gym" },
  { id: 3, name: "1km run", xp: 60, mode: "both" },
  { id: 4, name: "Pull-ups 3x8", xp: 70, mode: "gym" },
  { id: 5, name: "1 min plank", xp: 40, mode: "both" },
  { id: 6, name: "Deadlift 3x8", xp: 80, mode: "gym" },
];

const RANKS = [
  { minLevel: 1, rank: "E", title: "Awakened Hunter" },
  { minLevel: 5, rank: "D", title: "Iron Body" },
  { minLevel: 10, rank: "C", title: "Steel Warrior" },
  { minLevel: 20, rank: "B", title: "Shadow Blade" },
  { minLevel: 35, rank: "A", title: "Monarch" },
  { minLevel: 50, rank: "S", title: "Shadow Sovereign" },
];

function getRank(level) {
  return [...RANKS].reverse().find((r) => level >= r.minLevel) || RANKS[0];
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
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
        await supabase.from("profiles").insert({
          id: data.user.id,
          username: username || email.split("@")[0],
          total_xp: 0, level: 1, strength: 10, endurance: 10, vitality: 10, agility: 10, mode: "home", streak: 0,
        });
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
    await supabase.from("custom_quests").insert({
      created_by: user.id,
      creator_name: profile?.username || "Hunter",
      name: form.name,
      description: form.description,
      xp: parseInt(form.xp),
      category: form.category,
      mode: form.mode,
      likes: 0,
    });
    setForm({ name: "", description: "", xp: "50", category: "strength", mode: "both" });
    loadData();
    setSaving(false);
    setTab("browse");
  }

  async function toggleQuest(questId) {
    if (myQuests.includes(questId)) {
      await supabase.from("user_custom_quests").delete().eq("user_id", user.id).eq("quest_id", questId);
    } else {
      await supabase.from("user_custom_quests").insert({ user_id: user.id, quest_id: questId });
    }
    loadData();
  }

  async function likeQuest(questId) {
    await supabase.from("quest_likes").insert({ user_id: user.id, quest_id: questId });
    await supabase.from("custom_quests").update({ likes: (quests.find(q => q.id === questId)?.likes || 0) + 1 }).eq("id", questId);
    loadData();
  }

  const filtered = quests.filter(q => filter === "all" || q.mode === filter || q.mode === "both");

  const categories = ["strength", "cardio", "flexibility", "core", "general"];

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", padding: "0 0 80px" }}>
      <div style={{ background: "#0f0f1a", padding: "16px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 8, padding: "6px 12px", color: "#888", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Quest Library</div>
          <div style={{ fontSize: 12, color: "#534AB7" }}>Browse & create quests</div>
        </div>
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
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "#444" }}>No quests yet — be the first to create one!</div>}
          {filtered.map((q) => {
            const added = myQuests.includes(q.id);
            return (
              <div key={q.id} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{q.name}</div>
                    {q.description && <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{q.description}</div>}
                  </div>
                  <span style={{ fontSize: 12, color: "#534AB7", fontWeight: 500 }}>+{q.xp} XP</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#444" }}>by {q.creator_name}</span>
                  <span style={{ fontSize: 11, background: "#1a1a2e", padding: "2px 6px", borderRadius: 4, color: "#666" }}>{q.mode}</span>
                  <span style={{ fontSize: 11, background: "#1a1a2e", padding: "2px 6px", borderRadius: 4, color: "#666" }}>{q.category}</span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button onClick={() => likeQuest(q.id)} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 6, padding: "4px 8px", color: "#666", cursor: "pointer", fontSize: 12 }}>♥ {q.likes}</button>
                    <button onClick={() => toggleQuest(q.id)} style={{ background: added ? "#1a1035" : "#534AB7", border: "none", borderRadius: 6, padding: "4px 10px", color: "#fff", cursor: "pointer", fontSize: 12 }}>{added ? "✓ Added" : "+ Add"}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "create" && (
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Create a Quest</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Quest Name</div>
            <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. 20 push-ups" style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Description (optional)</div>
            <input value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Any tips or details..." style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>XP Reward</div>
              <input value={form.xp} onChange={(e) => setForm(p => ({ ...p, xp: e.target.value }))} type="number" placeholder="50" style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Mode</div>
              <select value={form.mode} onChange={(e) => setForm(p => ({ ...p, mode: e.target.value }))} style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }}>
                <option value="both">Both</option>
                <option value="home">Home</option>
                <option value="gym">Gym</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Category</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setForm(p => ({ ...p, category: cat }))} style={{ padding: "6px 12px", borderRadius: 20, border: `1px solid ${form.category === cat ? "#534AB7" : "#1e1e2e"}`, background: form.category === cat ? "#1a1035" : "transparent", color: form.category === cat ? "#AFA9EC" : "#555", cursor: "pointer", fontSize: 12, textTransform: "capitalize" }}>{cat}</button>
              ))}
            </div>
          </div>
          <button onClick={createQuest} disabled={saving || !form.name} style={{ width: "100%", background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
            {saving ? "Creating..." : "Create & Share Quest"}
          </button>
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
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setForm({ weight_kg: "", height_cm: "", chest_cm: "", waist_cm: "", hips_cm: "", bicep_cm: "", notes: "" });
    loadLogs();
    setSaving(false);
  }

  const fields = [
    { key: "weight_kg", label: "Weight (kg)", placeholder: "e.g. 75.5" },
    { key: "height_cm", label: "Height (cm)", placeholder: "e.g. 178" },
    { key: "chest_cm", label: "Chest (cm)", placeholder: "e.g. 95" },
    { key: "waist_cm", label: "Waist (cm)", placeholder: "e.g. 82" },
    { key: "hips_cm", label: "Hips (cm)", placeholder: "e.g. 90" },
    { key: "bicep_cm", label: "Bicep (cm)", placeholder: "e.g. 35" },
  ];

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", padding: "0 0 80px" }}>
      <div style={{ background: "#0f0f1a", padding: "16px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 8, padding: "6px 12px", color: "#888", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Body Measurements</div>
          <div style={{ fontSize: 12, color: "#534AB7" }}>Track your physical progress</div>
        </div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Log Today's Measurements</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{label}</div>
              <input value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} type="number" style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Notes (optional)</div>
          <input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="How are you feeling today?" style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} />
        </div>
        <button onClick={saveLog} disabled={saving} style={{ width: "100%", marginTop: 14, background: saved ? "#1a4a1a" : "#534AB7", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
          {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Measurements"}
        </button>
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
              {log.height_cm && <div style={{ fontSize: 12, color: "#666" }}>Height: <span style={{ color: "#c0c0d0" }}>{log.height_cm}cm</span></div>}
              {log.chest_cm && <div style={{ fontSize: 12, color: "#666" }}>Chest: <span style={{ color: "#c0c0d0" }}>{log.chest_cm}cm</span></div>}
              {log.waist_cm && <div style={{ fontSize: 12, color: "#666" }}>Waist: <span style={{ color: "#c0c0d0" }}>{log.waist_cm}cm</span></div>}
              {log.hips_cm && <div style={{ fontSize: 12, color: "#666" }}>Hips: <span style={{ color: "#c0c0d0" }}>{log.hips_cm}cm</span></div>}
              {log.bicep_cm && <div style={{ fontSize: 12, color: "#666" }}>Bicep: <span style={{ color: "#c0c0d0" }}>{log.bicep_cm}cm</span></div>}
            </div>
            {log.notes && <div style={{ marginTop: 6, fontSize: 12, color: "#555", fontStyle: "italic" }}>"{log.notes}"</div>}
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
    const today = getTodayString();
    const { data: mealData } = await supabase.from("nutrition_logs").select("*").eq("user_id", user.id).eq("logged_date", today).order("created_at", { ascending: true });
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
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setForm({ meal_name: "", calories: "", protein_g: "", carbs_g: "", fats_g: "" });
    loadData();
    setSaving(false);
  }

  async function deleteMeal(id) {
    await supabase.from("nutrition_logs").delete().eq("id", id);
    loadData();
  }

  async function saveGoals() {
    await supabase.from("nutrition_goals").upsert({ ...goals, user_id: user.id });
    setShowGoals(false);
  }

  const totalCals = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein = meals.reduce((s, m) => s + (parseFloat(m.protein_g) || 0), 0);
  const totalCarbs = meals.reduce((s, m) => s + (parseFloat(m.carbs_g) || 0), 0);
  const totalFats = meals.reduce((s, m) => s + (parseFloat(m.fats_g) || 0), 0);
  const calPct = Math.min(100, Math.round((totalCals / goals.calorie_target) * 100));
  const proteinPct = Math.min(100, Math.round((totalProtein / goals.protein_target) * 100));
  const goalColors = { bulk: "#4CAF50", cut: "#f44336", maintain: "#534AB7" };
  const goalLabels = { bulk: "🏋️ Bulk — Gaining muscle", cut: "🔥 Cut — Losing fat", maintain: "⚖️ Maintain — Stay steady" };

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", padding: "0 0 80px" }}>
      <div style={{ background: "#0f0f1a", padding: "16px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 8, padding: "6px 12px", color: "#888", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Nutrition Tracker</div>
          <div style={{ fontSize: 12, color: goalColors[goals.goal_type] }}>{goalLabels[goals.goal_type]}</div>
        </div>
        <button onClick={() => setShowGoals(!showGoals)} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 8, padding: "6px 12px", color: "#888", cursor: "pointer", fontSize: 13 }}>⚙️ Goal</button>
      </div>
      {showGoals && (
        <div style={{ background: "#0f0f1a", borderBottom: "1px solid #1e1e2e", padding: "16px 20px" }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>Set your goal</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {["bulk", "maintain", "cut"].map((g) => (
              <button key={g} onClick={() => setGoals((p) => ({ ...p, goal_type: g }))} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${goals.goal_type === g ? goalColors[g] : "#1e1e2e"}`, background: goals.goal_type === g ? "#1a1035" : "transparent", color: goals.goal_type === g ? goalColors[g] : "#555", cursor: "pointer", fontSize: 13, textTransform: "capitalize" }}>{g}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Daily Calories</div>
              <input value={goals.calorie_target} onChange={(e) => setGoals((p) => ({ ...p, calorie_target: parseInt(e.target.value) }))} type="number" style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Protein Target (g)</div>
              <input value={goals.protein_target} onChange={(e) => setGoals((p) => ({ ...p, protein_target: parseInt(e.target.value) }))} type="number" style={{ width: "100%", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} />
            </div>
          </div>
          <button onClick={saveGoals} style={{ width: "100%", background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, cursor: "pointer" }}>Save Goal</button>
        </div>
      )}
      <div style={{ padding: "14px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>Calories today</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: calPct >= 100 ? "#f44336" : "#e8e8f0" }}>{totalCals}</div>
            <div style={{ fontSize: 11, color: "#444" }}>/ {goals.calorie_target} kcal</div>
            <div style={{ background: "#1a1a2e", borderRadius: 4, height: 4, marginTop: 8 }}>
              <div style={{ background: calPct >= 100 ? "#f44336" : "#534AB7", borderRadius: 4, height: 4, width: `${calPct}%`, transition: "width 0.4s" }} />
            </div>
          </div>
          <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>Protein today</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: proteinPct >= 100 ? "#4CAF50" : "#e8e8f0" }}>{totalProtein.toFixed(1)}g</div>
            <div style={{ fontSize: 11, color: "#444" }}>/ {goals.protein_target}g target</div>
            <div style={{ background: "#1a1a2e", borderRadius: 4, height: 4, marginTop: 8 }}>
              <div style={{ background: proteinPct >= 100 ? "#4CAF50" : "#534AB7", borderRadius: 4, height: 4, width: `${proteinPct}%`, transition: "width 0.4s" }} />
            </div>
          </div>
        </div>
        <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-around" }}>
          {[["Carbs", totalCarbs.toFixed(1) + "g"], ["Fats", totalFats.toFixed(1) + "g"], ["Meals", meals.length]].map(([label, val]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{val}</div>
              <div style={{ fontSize: 11, color: "#555" }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Add a meal</div>
        <input value={form.meal_name} onChange={(e) => setForm((p) => ({ ...p, meal_name: e.target.value }))} placeholder="Meal name (e.g. Chicken & rice)" style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box", marginBottom: 8 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          {[["calories", "Calories (kcal)"], ["protein_g", "Protein (g)"], ["carbs_g", "Carbs (g)"], ["fats_g", "Fats (g)"]].map(([key, label]) => (
            <div key={key}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{label}</div>
              <input value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} type="number" placeholder="0" style={{ width: "100%", background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, padding: "10px 12px", color: "#e8e8f0", fontSize: 14, boxSizing: "border-box" }} />
            </div>
          ))}
        </div>
        <button onClick={saveMeal} disabled={saving || !form.meal_name} style={{ width: "100%", background: saved ? "#1a4a1a" : "#534AB7", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
          {saved ? "✓ Meal Added!" : saving ? "Saving..." : "+ Add Meal"}
        </button>
      </div>
      <div style={{ padding: "0 20px" }}>
        <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Today's meals</div>
        {meals.length === 0 && <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "20px", textAlign: "center", color: "#444", fontSize: 14 }}>No meals logged yet today!</div>}
        {meals.map((meal) => (
          <div key={meal.id} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{meal.meal_name}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {meal.calories && <span style={{ fontSize: 12, color: "#534AB7" }}>{meal.calories} kcal</span>}
                {meal.protein_g && <span style={{ fontSize: 12, color: "#666" }}>P: {meal.protein_g}g</span>}
                {meal.carbs_g && <span style={{ fontSize: 12, color: "#666" }}>C: {meal.carbs_g}g</span>}
                {meal.fats_g && <span style={{ fontSize: 12, color: "#666" }}>F: {meal.fats_g}g</span>}
              </div>
            </div>
            <button onClick={() => deleteMeal(meal.id)} style={{ background: "transparent", border: "none", color: "#333", cursor: "pointer", fontSize: 18, padding: "4px" }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressCharts({ user, profile, onClose }) {
  const [weightData, setWeightData] = useState([]);
  const [questData, setQuestData] = useState([]);
  const [xpData, setXpData] = useState([]);
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
    const { data: nutLogs } = await supabase.from("nutrition_logs").select("logged_date, calories").eq("user_id", user.id).order("logged_date", { ascending: true });
    if (nutLogs) {
      const cals = {};
      nutLogs.forEach(n => { cals[n.logged_date] = (cals[n.logged_date] || 0) + (n.calories || 0); });
      setXpData(Object.entries(cals).slice(-14).map(([date, cal]) => ({ date: date.slice(5), calories: cal })));
    }
    setLoading(false);
  }

  const level = profile?.level || 1;
  const totalXP = profile?.total_xp || 0;
  const rank = getRank(level);

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", padding: "0 0 80px" }}>
      <div style={{ background: "#0f0f1a", padding: "16px 20px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 8, padding: "6px 12px", color: "#888", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Progress</div>
          <div style={{ fontSize: 12, color: "#534AB7" }}>Your hunter journey</div>
        </div>
      </div>
      {loading ? <div style={{ textAlign: "center", padding: 40, color: "#534AB7" }}>Loading charts...</div> : (
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
            {[["Level", level], ["Total XP", totalXP], ["Rank", rank.rank]].map(([label, val]) => (
              <div key={label} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: "#AFA9EC" }}>{val}</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "14px", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Weight over time (kg)</div>
            {weightData.length < 2 ? <div style={{ textAlign: "center", padding: "20px 0", color: "#444", fontSize: 13 }}>Log at least 2 body measurements to see chart</div> : (
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
          <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "14px", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Daily quests completed</div>
            {questData.length === 0 ? <div style={{ textAlign: "center", padding: "20px 0", color: "#444", fontSize: 13 }}>Complete some quests to see activity</div> : (
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
          <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "14px" }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Rank progression</div>
            {RANKS.map((r) => (
              <div key={r.rank} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: level >= r.minLevel ? "#1a1035" : "#0a0a0f", border: `1px solid ${level >= r.minLevel ? "#534AB7" : "#1e1e2e"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: level >= r.minLevel ? "#AFA9EC" : "#333", fontWeight: 500 }}>{r.rank}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: level >= r.minLevel ? "#e8e8f0" : "#444" }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: "#444" }}>Level {r.minLevel}+</div>
                </div>
                {level >= r.minLevel ? <span style={{ fontSize: 12, color: "#534AB7" }}>✓ Unlocked</span> : <span style={{ fontSize: 11, color: "#333" }}>{r.minLevel - level} levels away</span>}
              </div>
            ))}
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
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("home");
  const [minQuestWarning, setMinQuestWarning] = useState(false);

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
    const today = getTodayString();
    const { data: quests } = await supabase.from("quest_completions").select("quest_id").eq("user_id", u.id).eq("completed_date", today);
    setCompleted(quests ? quests.map((q) => q.quest_id) : []);
    setLoading(false);
  }

  async function toggleMode() {
    if (!profile) return;
    const newMode = profile.mode === "home" ? "gym" : "home";
    await supabase.from("profiles").update({ mode: newMode }).eq("id", user.id);
    setProfile(p => ({ ...p, mode: newMode }));
    setCompleted([]);
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
      setCompleted((prev) => [...prev, id]);
    }
  }

  async function handleLogout() { await supabase.auth.signOut(); }

  if (!user) return <AuthScreen />;
  if (loading) return <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#534AB7", fontFamily: "sans-serif", fontSize: 18 }}>⚡ Loading your profile...</div>;
  if (screen === "body") return <BodyLogger user={user} onClose={() => setScreen("home")} />;
  if (screen === "nutrition") return <NutritionTracker user={user} onClose={() => setScreen("home")} />;
  if (screen === "progress") return <ProgressCharts user={user} profile={profile} onClose={() => setScreen("home")} />;
  if (screen === "quests") return <QuestLibrary user={user} profile={profile} onClose={() => setScreen("home")} />;

  const QUESTS = profile?.mode === "gym" ? GYM_QUESTS : HOME_QUESTS;
  const level = profile?.level || 1;
  const totalXP = profile?.total_xp || 0;
  const xpIntoLevel = totalXP % 200;
  const rank = getRank(level);
  const nextRank = RANKS.find((r) => r.minLevel > level);
  const minQuestsReached = completed.length >= 3;
  const mode = profile?.mode || "home";

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e8e8f0", fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", padding: "0 0 80px" }}>
      {levelUpMsg && (
        <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", background: "#534AB7", color: "#fff", padding: "14px 28px", borderRadius: "0 0 16px 16px", fontSize: 16, fontWeight: 500, zIndex: 999, textAlign: "center" }}>
          ⚡ LEVEL UP! You are now Level {level}!
        </div>
      )}

      <div style={{ background: "#0f0f1a", padding: "20px 20px 16px", borderBottom: "1px solid #1e1e2e" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ background: "#1a1035", border: "1px solid #534AB7", borderRadius: 6, padding: "3px 10px", fontSize: 12, color: "#AFA9EC" }}>Rank {rank.rank} — Hunter</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={toggleMode} style={{ background: mode === "gym" ? "#1a2a1a" : "#1a1035", border: `1px solid ${mode === "gym" ? "#4CAF50" : "#534AB7"}`, borderRadius: 6, padding: "3px 10px", fontSize: 12, color: mode === "gym" ? "#4CAF50" : "#AFA9EC", cursor: "pointer" }}>
              {mode === "gym" ? "🏋️ Gym" : "🏠 Home"}
            </button>
            <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #1e1e2e", borderRadius: 6, padding: "3px 10px", fontSize: 12, color: "#555", cursor: "pointer" }}>Logout</button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#1a1035", border: "2px solid #534AB7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#AFA9EC", fontWeight: 500 }}>
            {(profile?.username || "H")[0].toUpperCase()}
          </div>
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
        <div style={{ marginTop: 6, fontSize: 11, color: "#444" }}>
          {nextRank ? `Next rank at Level ${nextRank.minLevel} — ${nextRank.rank} Rank` : "Max Rank — Shadow Sovereign"}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "12px 20px" }}>
        {[["Strength", profile?.strength], ["Endurance", profile?.endurance], ["Vitality", profile?.vitality], ["Agility", profile?.agility]].map(([name, val]) => (
          <div key={name} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 20, fontWeight: 500 }}>{val || 10}</div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{name}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "4px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>Daily Quests</div>
          <div style={{ fontSize: 11, color: "#444" }}>Min 3 to level up</div>
        </div>

        {!minQuestsReached && completed.length > 0 && (
          <div style={{ background: "#1a1a0a", border: "1px solid #3a3a1a", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: "#888" }}>
            ⚡ Complete {3 - completed.length} more quest{3 - completed.length > 1 ? "s" : ""} to earn XP today!
          </div>
        )}

        {minQuestsReached && (
          <div style={{ background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: "#4CAF50" }}>
            ✓ Minimum reached! Keep going for bonus XP!
          </div>
        )}

        {QUESTS.map((q) => {
          const done = completed.includes(q.id);
          return (
            <div key={q.id} onClick={() => toggleQuest(q.id)} style={{ background: "#0f0f1a", border: `1px solid ${done ? "#534AB7" : "#1e1e2e"}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, marginBottom: 8, cursor: "pointer", transition: "border 0.2s" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? "#534AB7" : "transparent", border: `2px solid ${done ? "#534AB7" : "#444"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {done && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}
              </div>
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
          <div style={{ background: "#1a1a2e", borderRadius: 4, height: 4, marginTop: 8 }}>
            <div style={{ background: minQuestsReached ? "#4CAF50" : "#534AB7", borderRadius: 4, height: 4, width: `${(completed.length / QUESTS.length) * 100}%`, transition: "width 0.4s" }} />
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: "#444" }}>
            {completed.length < 3 ? `${3 - completed.length} more to reach daily minimum` : completed.length === QUESTS.length ? "⚡ All quests complete! Come back tomorrow!" : `${QUESTS.length - completed.length} quests remaining`}
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 20px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { screen: "quests", icon: "⚔️", title: "Quest Library", sub: "Browse & create custom quests" },
          { screen: "progress", icon: "📊", title: "Progress Charts", sub: "Weight, quests & calorie history" },
          { screen: "nutrition", icon: "🥗", title: "Nutrition Tracker", sub: "Log meals, calories & macros" },
          { screen: "body", icon: "📏", title: "Body Measurements", sub: "Log weight & measurements" },
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