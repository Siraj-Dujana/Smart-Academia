import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Color palette (matches TeacherAnalytics) ─────────────────
const C = {
  bg: "#070d1a", surface: "#0f1629", surface2: "#0a0f1e",
  border: "#1e293b", border2: "#334155",
  accent: "#6366f1", accent2: "#a855f7", amber: "#f59e0b",
  green: "#22c55e", red: "#ef4444", cyan: "#14b8a6",
  text: "#f1f5f9", textDim: "#94a3b8", textFaint: "#64748b",
  indigoLight: "#818cf8", greenLight: "#4ade80",
  amberLight: "#fbbf24", redLight: "#f87171", purpleLight: "#c084fc",
};

// ── Loading Spinner ───────────────────────────────────────────
const Spinner = ({ size = "md" }) => {
  const dim = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  return (
    <div className={`relative ${dim} mx-auto`}>
      <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: C.border }} />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" 
        style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
    </div>
  );
};

// ── Glow Card ─────────────────────────────────────────────────
const GlowCard = ({ icon, label, value, color }) => (
  <div className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-2 group"
    style={{ background: C.surface, border: `1px solid ${color}33` }}>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 70%)` }} />
    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
      style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-lg" style={{ color }}>{icon}</span>
    </div>
    <p className="text-2xl font-black text-white tracking-tight relative z-10"
      style={{ textShadow: `0 0 20px ${color}55` }}>{value ?? "—"}</p>
    <p className="text-xs font-medium relative z-10" style={{ color: C.textDim }}>{label}</p>
  </div>
);

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, color = C.accent, height = 5 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: C.border }}>
    <div className="h-full rounded-full transition-all duration-700"
      style={{ width: `${Math.min(value, 100)}%`, background: `linear-gradient(90deg, ${color}bb, ${color})` }} />
  </div>
);

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [filter, setFilter] = useState("global"); // global, weekly
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeaderboard();
    fetchUserStats();
  }, [filter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = filter === "global" 
        ? "/api/leaderboard/global?limit=50"
        : "/api/leaderboard/weekly?limit=50";
      
      const res = await fetch(`${API}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (res.ok) {
        setLeaderboard(filter === "global" ? data.leaderboard : data.leaderboard);
      } else {
        setError(data.message || "Failed to load leaderboard");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/leaderboard/my-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUserStats(data.stats);
    } catch {
      // silent
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: "🥇", color: C.amber, bg: `${C.amber}22` };
    if (rank === 2) return { icon: "🥈", color: "#94a3b8", bg: `${C.textFaint}22` };
    if (rank === 3) return { icon: "🥉", color: "#cd7f32", bg: `${C.textDim}22` };
    return { icon: `#${rank}`, color: C.textFaint, bg: C.surface2 };
  };

  const getUserInitial = (name) => {
    return name?.charAt(0).toUpperCase() || "S";
  };
  const colors = {
    accent: "#6366f1",
    accent2: "#a855f7",
    amber: "#f59e0b",
    green: "#22c55e",
    red: "#ef4444",
    card: "#0f1629",
    border: "#1e293b",
    muted: "#64748b",
    text: "#e2e8f0",
    textDim: "#94a3b8",
  };

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>
      
       <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: colors.accent }} />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#818cf8" }}>Leaderboard</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Compete with other students and climb the ranks
        </h1>
      </div>
    

      {/* User Stats Cards */}
      {userStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <GlowCard icon="stars" label="Total Points" value={userStats.points || 0} color={C.accent} />
          <GlowCard icon="emoji_events" label="Level" value={userStats.level || 1} color={C.amber} />
          <GlowCard icon="local_fire_department" label="Day Streak" value={userStats.streak || 0} color={C.red} />
          <GlowCard icon="military_tech" label="Global Rank" value={`#${userStats.rank || 1}`} color={C.green} />
        </div>
      )}

      {/* XP Progress */}
      {userStats?.nextLevel && (
        <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Level {userStats.level} → Level {userStats.nextLevel.level}</span>
            <span>{userStats.xp || 0} / {userStats.nextLevel.xpRequired} XP</span>
          </div>
          <MiniBar value={(userStats.xp / userStats.nextLevel.xpRequired) * 100} color={C.accent} />
          <p className="text-xs text-gray-500 mt-2">{userStats.nextLevel.xpRemaining} XP to next level</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-xl p-1.5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        {[
          { key: "global", label: "Global Rankings", icon: "public" },
          { key: "weekly", label: "Weekly Top", icon: "trending_up" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              filter === tab.key ? "text-white shadow-md" : "hover:bg-white/5"
            }`}
            style={filter === tab.key ? { background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` } : { color: C.textDim }}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      {loading ? (
        <div className="py-20">
          <Spinner size="lg" />
          <p className="text-center text-gray-400 mt-4 text-sm">Loading rankings...</p>
        </div>
      ) : error ? (
        <div className="p-5 rounded-2xl flex items-center gap-3" style={{ background: "#1a0a0a", border: "1px solid #ef444433" }}>
          <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
          <div>
            <p className="font-semibold text-red-400">Failed to load leaderboard</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <span className="material-symbols-outlined text-6xl text-gray-700 mb-4 block">leaderboard</span>
          <p className="font-bold text-white text-lg">No rankings yet</p>
          <p className="text-sm text-gray-500">Complete quizzes and labs to earn points and appear on the leaderboard</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: C.surface2, borderBottom: `1px solid ${C.border}` }}>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Rank</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Student</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Points</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Level</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textFaint }}>Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: C.border }}>
                {leaderboard.map((user) => {
                  const rankBadge = getRankBadge(user.rank);
                  return (
                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold"
                          style={{ background: rankBadge.bg, color: rankBadge.color }}>
                          {rankBadge.icon}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <div className="w-8 h-8 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${user.avatar})` }} />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}>
                              {getUserInitial(user.fullName)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white">{user.fullName}</p>
                            <p className="text-[10px] text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-lg font-bold text-white">{user.points || 0}</p>
                        <p className="text-[10px] text-gray-500">points</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-amber-400">Lvl {user.level || 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{user.badges?.length || 0} 🏆</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: C.surface, border: `1px solid ${C.accent}33` }}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44` }}>
          <span className="material-symbols-outlined text-sm" style={{ color: C.accent }}>info</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: C.textDim }}>
          <span className="font-semibold" style={{ color: C.indigoLight }}>How points work:</span> Earn points by completing lessons (50pts), passing quizzes (100pts), perfect scores (50pts bonus), submitting labs (50pts), and completing courses (500pts). Maintain your daily streak for bonus points!
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;