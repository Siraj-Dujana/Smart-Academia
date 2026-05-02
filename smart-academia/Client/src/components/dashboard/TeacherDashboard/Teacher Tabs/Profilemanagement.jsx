import React, { useState, useEffect, useRef } from "react";

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

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, color = C.accent }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
      <span className="material-symbols-outlined text-sm" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
  </div>
);

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
        className={`relative flex items-center justify-center rounded-full overflow-hidden border-4 border-indigo-500 shadow-lg cursor-pointer transition-all hover:shadow-xl ${
          user?.avatar ? "bg-transparent" : "bg-gradient-to-br from-indigo-600 to-blue-500"
        }`}
        style={{ width: size, height: size }}
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
            className="font-bold text-white"
            style={{ fontSize: size * 0.32 }}
          >
            {initials}
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
          {uploading ? (
            <svg className="animate-spin w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
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
          className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold border-2 border-white dark:border-gray-800 transition-transform hover:scale-110"
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
    success: { bg: `${C.green}22`, border: C.green, text: C.greenLight },
    error: { bg: `${C.red}22`, border: C.red, text: C.redLight },
  };
  const c = colors[type] || colors.success;
  return (
    <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm font-medium animate-slideIn max-w-sm" style={{ background: c.bg, borderColor: c.border, color: c.text }}>
      <span className="material-symbols-outlined text-lg">
        {type === "success" ? "check_circle" : "error"}
      </span>
      {msg}
    </div>
  );
};

// ─── Role Badge ──────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const config = {
    student: { label: "Student", color: C.cyan, bg: `${C.cyan}22`, icon: "school" },
    teacher: { label: "Teacher", color: C.greenLight, bg: `${C.green}22`, icon: "cast_for_education" },
    admin: { label: "Admin", color: C.amberLight, bg: `${C.amber}22`, icon: "admin_panel_settings" },
  };
  const c = config[role] || config.student;
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}44` }}>
      <span className="material-symbols-outlined text-sm">{c.icon}</span>
      {c.label}
    </span>
  );
};

// ─── Loading Spinner ───────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: C.border }} />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
    </div>
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
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif", background: C.bg, minHeight: "100vh" }}>
      <Toast msg={toast.msg} type={toast.type} />

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #0c0e1e 0%, #131b35 50%, #0d1527 100%)", border: `1px solid ${C.border}` }}>
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: C.accent }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background: C.accent2 }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.accent }} />
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">SmartAcademia · My Profile</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your personal information and account settings</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar
            user={user}
            size={96}
            onUpload={handleAvatarUpload}
            onDelete={handleAvatarDelete}
            uploading={avatarUploading}
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
              <RoleBadge role={user?.role} />
            </div>
            <p className="text-sm" style={{ color: C.textDim }}>{user?.email}</p>
            {user?.department && (
              <p className="text-xs mt-1 flex items-center justify-center sm:justify-start gap-1" style={{ color: C.textFaint }}>
                <span className="material-symbols-outlined text-sm">corporate_fare</span>
                {user.department}
                {user.semester && ` • ${user.semester} Semester`}
              </p>
            )}
          </div>
          <p className="text-xs" style={{ color: C.textFaint }}>Click photo to change</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        {[
          { id: "profile", label: "Personal Info", icon: "person" },
          { id: "security", label: "Security", icon: "lock" },
          { id: "account", label: "Account Details", icon: "badge" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id
                ? "text-white shadow-md"
                : "hover:bg-white/5"
            }`}
            style={activeTab === tab.id
              ? { background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }
              : { color: C.textDim }}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Personal Info */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile}>
          <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="px-6 py-4 border-b" style={{ background: C.surface2, borderColor: C.border }}>
              <SectionHeader icon="person" title="Personal Information" color={C.accent} />
            </div>
            <div className="p-6 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: C.textFaint }}>badge</span>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: C.textFaint }}>email</span>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl cursor-not-allowed"
                    style={{ background: C.surface2, color: C.textFaint, border: `1px solid ${C.border}`, opacity: 0.7 }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: C.textFaint }}>Email cannot be changed</p>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Department</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: C.textFaint }}>corporate_fare</span>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                    placeholder="e.g. Computer Science"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                </div>
              </div>

              {/* Student Fields */}
              {user?.role === "student" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Current Semester</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: C.textFaint }}>calendar_today</span>
                    <select
                      value={form.semester}
                      onChange={(e) => setForm((p) => ({ ...p, semester: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all appearance-none"
                      style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                    >
                      <option value="">Select semester…</option>
                      {semesters.map((s) => (
                        <option key={s} value={s}>{s} Semester</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Teacher Fields */}
              {user?.role === "teacher" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Specialization</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: C.textFaint }}>psychology</span>
                      <input
                        type="text"
                        value={form.specialization}
                        onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                        placeholder="e.g. Artificial Intelligence"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                        style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                        onFocus={e => e.target.style.borderColor = C.accent}
                        onBlur={e => e.target.style.borderColor = C.border}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>Qualification</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: C.textFaint }}>school</span>
                      <input
                        type="text"
                        value={form.qualification}
                        onChange={(e) => setForm((p) => ({ ...p, qualification: e.target.value }))}
                        placeholder="e.g. PhD, M.Sc"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                        style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                        onFocus={e => e.target.style.borderColor = C.accent}
                        onBlur={e => e.target.style.borderColor = C.border}
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
            className="w-full mt-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}
          >
            {savingProfile ? (
              <>
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 rounded-full border-2 border-white/30" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                </div>
                Saving…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">save</span>
                Save Changes
              </>
            )}
          </button>
        </form>
      )}

      {/* Tab: Security */}
      {activeTab === "security" && (
        <form onSubmit={handleChangePassword}>
          <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="px-6 py-4 border-b" style={{ background: C.surface2, borderColor: C.border }}>
              <SectionHeader icon="lock" title="Change Password" color={C.accent} />
            </div>
            <div className="p-6 space-y-5">
              {[
                { label: "Current Password", key: "currentPassword", icon: "lock", show: showPasswords.current },
                { label: "New Password", key: "newPassword", icon: "lock_reset", show: showPasswords.new },
                { label: "Confirm New Password", key: "confirmPassword", icon: "check_circle", show: showPasswords.confirm },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textFaint }}>{field.label}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: C.textFaint }}>{field.icon}</span>
                    <input
                      type={field.show ? "text" : "password"}
                      value={passwordForm[field.key]}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full pl-10 pr-12 py-2.5 text-sm rounded-xl outline-none transition-all"
                      style={{ background: C.surface2, color: C.text, border: `1px solid ${C.border}` }}
                      onFocus={e => e.target.style.borderColor = C.accent}
                      onBlur={e => e.target.style.borderColor = C.border}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((p) => ({ ...p, [field.key.replace("Password", "")]: !p[field.key.replace("Password", "")] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-all hover:scale-105"
                      style={{ color: C.textFaint }}
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
            disabled={savingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
            className="w-full mt-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }}
          >
            {savingPassword ? (
              <>
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 rounded-full border-2 border-white/30" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                </div>
                Changing Password…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">key</span>
                Update Password
              </>
            )}
          </button>
        </form>
      )}

      {/* Tab: Account Details */}
      {activeTab === "account" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div className="px-6 py-4 border-b" style={{ background: C.surface2, borderColor: C.border }}>
            <SectionHeader icon="badge" title="Account Details" color={C.accent} />
          </div>
          <div className="divide-y" style={{ borderColor: C.border }}>
            {[
              { label: "Account Type", value: user?.role, icon: "manage_accounts" },
              { label: "Full Name", value: user?.fullName, icon: "person" },
              { label: "Email", value: user?.email, icon: "email" },
              user?.studentId && { label: "Student ID", value: user.studentId, icon: "school" },
              user?.employeeId && { label: "Employee ID", value: user.employeeId, icon: "badge" },
              user?.department && { label: "Department", value: user.department, icon: "corporate_fare" },
              user?.semester && { label: "Semester", value: user.semester, icon: "calendar_today" },
              user?.specialization && { label: "Specialization", value: user.specialization, icon: "psychology" },
              user?.qualification && { label: "Qualification", value: user.qualification, icon: "workspace_premium" },
              { label: "Email Verified", value: user?.isEmailVerified ? "Yes ✓" : "No", icon: user?.isEmailVerified ? "verified" : "cancel" },
              { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—", icon: "event" },
            ].filter(Boolean).map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44` }}>
                  <span className="material-symbols-outlined text-sm" style={{ color: C.accent }}>{item.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textFaint }}>{item.label}</p>
                  <p className="text-sm font-medium capitalize text-white">{item.value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManagement;