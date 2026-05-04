import React, { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
};

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, color = "#6366f1", height = 6 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#1e293b" }}>
    <div
      className="h-full rounded-full"
      style={{
        width: `${Math.min(value, 100)}%`,
        background: `linear-gradient(90deg, ${color}cc, ${color})`,
        boxShadow: `0 0 8px ${color}66`,
        transition: "width 1s cubic-bezier(.4,0,.2,1)"
      }}
    />
  </div>
);

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, color = "#6366f1" }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-sm" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
  </div>
);

// ── Glow Card ─────────────────────────────────────────────────
const GlowCard = ({ icon, label, value, color, sub }) => (
  <div className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-3 group" style={{ background: "#0f1629", border: `1px solid ${color}33` }}>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}15 0%, transparent 70%)` }} />
    <div className="flex items-start justify-between">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
        <span className="material-symbols-outlined text-xl" style={{ color }}>{icon}</span>
      </div>
      {sub && <span className="text-[10px] text-gray-500 font-medium bg-gray-800 px-2 py-0.5 rounded-full">{sub}</span>}
    </div>
    <div>
      <p className="text-3xl font-black text-white tracking-tight" style={{ textShadow: `0 0 20px ${color}66` }}>{value}</p>
      <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
    </div>
    <MiniBar value={75} color={color} />
  </div>
);

// ─── Avatar Component ────────────────────────────────────────────
const Avatar = ({ user, size = 96, onUpload, onDelete, uploading }) => {
  const fileRef = useRef();
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div className="relative inline-block">
      <div
        className={`relative flex items-center justify-center rounded-full overflow-hidden border-4 transition-all cursor-pointer hover:scale-105 ${
          user?.avatar ? "border-indigo-500" : "bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-500"
        }`}
        style={{ width: size, height: size, boxShadow: "0 0 20px #6366f166" }}
        onClick={() => fileRef.current?.click()}
        title="Click to change photo"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            className="font-black text-white"
            style={{ fontSize: size * 0.32 }}
          >
            {initials}
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full backdrop-blur-sm">
          {uploading ? (
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
            </div>
          ) : (
            <span className="material-symbols-outlined text-white text-xl">upload</span>
          )}
        </div>
      </div>

      {/* Remove button */}
      {user?.avatar && !uploading && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold border-2 border-gray-900 transition-transform hover:scale-110"
        >
          ×
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
      />
    </div>
  );
};

// ─── Toast ───────────────────────────────────────────────────────
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  const colors = {
    success: { bg: "#22c55e22", border: "#22c55e", text: "#4ade80", icon: "check_circle" },
    error: { bg: "#ef444422", border: "#ef4444", text: "#f87171", icon: "error" },
  };
  const c = colors[type] || colors.success;
  return (
    <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm font-medium animate-slideIn max-w-sm" style={{ background: c.bg, borderColor: c.border, color: c.text }}>
      <span className="material-symbols-outlined text-lg">{c.icon}</span>
      {msg}
    </div>
  );
};

// ─── Role Badge ──────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const config = {
    student: { label: "Student", color: "#0ea5e9", bg: "#0ea5e922", border: "#0ea5e944", icon: "school" },
    teacher: { label: "Teacher", color: "#10b981", bg: "#10b98122", border: "#10b98144", icon: "cast_for_education" },
    admin: { label: "Admin", color: "#a855f7", bg: "#a855f722", border: "#a855f744", icon: "admin_panel_settings" },
  };
  const c = config[role] || config.student;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
      <span className="material-symbols-outlined text-sm">{c.icon}</span>
      {c.label}
    </span>
  );
};

// ─── Loading Spinner ───────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="relative w-12 h-12 mx-auto">
    <div className="absolute inset-0 rounded-full border-4 border-indigo-900" />
    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
  </div>
);

// ─── Main Profile Page ───────────────────────────────────────────
const ProfileManagement = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [activeTab, setActiveTab] = useState("profile");

  const [form, setForm] = useState({
    fullName: "",
    department: "",
    semester: "",
    specialization: "",
    qualification: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/profile/me");
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setForm({
          fullName: data.user.fullName || "",
          department: data.user.department || "",
          semester: data.user.semester || "",
          specialization: data.user.specialization || "",
          qualification: data.user.qualification || "",
        });
      }
    } catch {
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    setAvatarUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch(`${API}/api/profile/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUser((prev) => ({ ...prev, avatar: data.avatar }));

      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, avatar: data.avatar }));
      window.dispatchEvent(new Event("profileUpdated"));

      showToast("Profile photo updated!");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm("Remove your profile photo?")) return;
    try {
      const res = await apiFetch("/api/profile/avatar", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
      setUser((prev) => ({ ...prev, avatar: null }));

      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, avatar: null }));
      window.dispatchEvent(new Event("profileUpdated"));

      showToast("Profile photo removed");
    } catch {
      showToast("Failed to remove photo", "error");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) return showToast("Full name is required", "error");
    setSavingProfile(true);
    try {
      const res = await apiFetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUser(data.user);

      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, fullName: data.user.fullName }));
      window.dispatchEvent(new Event("profileUpdated"));

      showToast("Profile saved successfully!");
    } catch (err) {
      showToast(err.message || "Failed to save", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showToast("Passwords do not match", "error");
    }
    if (passwordForm.newPassword.length < 8) {
      return showToast("Password must be at least 8 characters", "error");
    }
    setSavingPassword(true);
    try {
      const res = await apiFetch("/api/profile/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password changed successfully!");
    } catch (err) {
      showToast(err.message || "Failed to change password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }
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
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#818cf8" }}>My Profile</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Manage Your Account
        </h1>
      </div>

      <Toast msg={toast.msg} type={toast.type} />

      {/* ── Profile Card ────────────────────────────────────── */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: "#0f1629", border: "1px solid #6366f133" }}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar
            user={user}
            size={100}
            onUpload={handleAvatarUpload}
            onDelete={handleAvatarDelete}
            uploading={avatarUploading}
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
              <RoleBadge role={user?.role} />
            </div>
            <p className="text-gray-400 text-sm mb-2 flex items-center justify-center sm:justify-start gap-1.5">
              <span className="material-symbols-outlined text-sm text-indigo-500">email</span>
              {user?.email}
            </p>
            {user?.department && (
              <p className="text-gray-500 text-xs flex items-center justify-center sm:justify-start gap-1.5">
                <span className="material-symbols-outlined text-sm text-indigo-500">corporate_fare</span>
                {user.department}
                {user.semester && ` • ${user.semester} Semester`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "#1e293b" }}>
            <span className="material-symbols-outlined text-xs text-indigo-400">photo_camera</span>
            <span className="text-[10px] text-gray-500">Click photo to change</span>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl p-1.5" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
        {[
          { id: "profile", label: "Personal Info", icon: "person", color: "#6366f1" },
          { id: "security", label: "Security", icon: "lock", color: "#f59e0b" },
          { id: "account", label: "Account Details", icon: "badge", color: "#10b981" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={activeTab === tab.id
              ? { background: "#1e293b", color: "#818cf8", boxShadow: "0 0 20px #6366f120" }
              : { color: "#4b5563" }
            }
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: Personal Info ──────────────────────────────── */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile}>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: "#1e293b" }}>
              <SectionHeader icon="person" title="Personal Information" color="#6366f1" />
            </div>
            <div className="p-6 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                    badge
                  </span>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                    email
                  </span>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/30 text-gray-500 border border-gray-700 cursor-not-allowed outline-none"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1.5">Email cannot be changed</p>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                    corporate_fare
                  </span>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                    placeholder="e.g. Computer Science"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Student Fields */}
              {user?.role === "student" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Current Semester
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                      calendar_today
                    </span>
                    <select
                      value={form.semester}
                      onChange={(e) => setForm((p) => ({ ...p, semester: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-gray-800">Select semester…</option>
                      {semesters.map((s) => (
                        <option key={s} value={s} className="bg-gray-800">{s} Semester</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Teacher Fields */}
              {user?.role === "teacher" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Specialization
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                        psychology
                      </span>
                      <input
                        type="text"
                        value={form.specialization}
                        onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                        placeholder="e.g. Artificial Intelligence"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Qualification
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                        school
                      </span>
                      <input
                        type="text"
                        value={form.qualification}
                        onChange={(e) => setForm((p) => ({ ...p, qualification: e.target.value }))}
                        placeholder="e.g. PhD, M.Sc"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full mt-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            {savingProfile ? (
              <>
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-900" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                </div>
                Saving…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                Save Changes
              </>
            )}
          </button>
        </form>
      )}

      {/* ── Tab: Security ──────────────────────────────────── */}
      {activeTab === "security" && (
        <form onSubmit={handleChangePassword}>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: "#1e293b" }}>
              <SectionHeader icon="lock" title="Change Password" color="#f59e0b" />
            </div>
            <div className="p-6 space-y-5">
              {[
                { label: "Current Password", key: "currentPassword", icon: "lock", show: showPasswords.current },
                { label: "New Password", key: "newPassword", icon: "lock_reset", show: showPasswords.new },
                { label: "Confirm New Password", key: "confirmPassword", icon: "check_circle", show: showPasswords.confirm },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    {field.label}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                      {field.icon}
                    </span>
                    <input
                      type={field.show ? "text" : "password"}
                      value={passwordForm[field.key]}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full pl-10 pr-12 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((p) => ({ ...p, [field.key.split(/(?=[A-Z])/)[0].toLowerCase()]: !p[field.key.split(/(?=[A-Z])/)[0].toLowerCase()] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {field.show ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={
              savingPassword ||
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              passwordForm.newPassword !== passwordForm.confirmPassword
            }
            className="w-full mt-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            {savingPassword ? (
              <>
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 rounded-full border-2 border-amber-900" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                </div>
                Changing Password…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">key</span>
                Update Password
              </>
            )}
          </button>
        </form>
      )}

      {/* ── Tab: Account Details ────────────────────────────── */}
      {activeTab === "account" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "#1e293b" }}>
            <SectionHeader icon="badge" title="Account Details" color="#10b981" />
          </div>
          <div className="divide-y" style={{ borderColor: "#1e293b" }}>
            {[
              { label: "Account Type", value: user?.role, icon: "manage_accounts", color: "#6366f1" },
              { label: "Full Name", value: user?.fullName, icon: "person", color: "#818cf8" },
              { label: "Email", value: user?.email, icon: "email", color: "#60a5fa" },
              user?.studentId && { label: "Student ID", value: user.studentId, icon: "school", color: "#4ade80" },
              user?.employeeId && { label: "Employee ID", value: user.employeeId, icon: "badge", color: "#fbbf24" },
              user?.department && { label: "Department", value: user.department, icon: "corporate_fare", color: "#a78bfa" },
              user?.semester && { label: "Semester", value: user.semester, icon: "calendar_today", color: "#f87171" },
              user?.specialization && { label: "Specialization", value: user.specialization, icon: "psychology", color: "#c084fc" },
              user?.qualification && { label: "Qualification", value: user.qualification, icon: "workspace_premium", color: "#34d399" },
              { label: "Email Verified", value: user?.isEmailVerified ? "Yes" : "No", icon: user?.isEmailVerified ? "verified" : "cancel", color: user?.isEmailVerified ? "#4ade80" : "#f87171" },
              { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—", icon: "event", color: "#94a3b8" },
            ].filter(Boolean).map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}22`, border: `1px solid ${item.color}44` }}>
                  <span className="material-symbols-outlined text-lg" style={{ color: item.color }}>{item.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-medium text-white capitalize">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Info Banner ────────────────────────────────────── */}
      <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: "#0f1629", border: "1px solid #6366f133" }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#6366f122", border: "1px solid #6366f144" }}>
          <span className="material-symbols-outlined text-xs" style={{ color: "#6366f1" }}>info</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong className="text-indigo-400">Profile tip:</strong> Keep your information up to date. Your profile photo and details help personalize your learning experience.
        </p>
      </div>
    </div>
  );
};

export default ProfileManagement;