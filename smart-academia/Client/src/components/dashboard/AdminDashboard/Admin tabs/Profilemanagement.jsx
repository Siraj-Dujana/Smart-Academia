import React, { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <span className="material-symbols-outlined text-sm text-white">{icon}</span>
    </div>
    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
    <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }} />
  </div>
);

// ── Mini Bar ──────────────────────────────────────────────────
const MiniBar = ({ value = 0, height = 6 }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#1e293b" }}>
    <div
      className="h-full rounded-full bg-white"
      style={{
        width: `${Math.min(value, 100)}%`,
        boxShadow: "0 0 8px rgba(255,255,255,0.4)",
        transition: "width 1s cubic-bezier(.4,0,.2,1)"
      }}
    />
  </div>
);

// ── Loading Spinner ───────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="relative w-12 h-12 mx-auto">
    <div className="absolute inset-0 rounded-full border-4 border-white/10" />
    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin" />
    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-white/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
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
        className="relative flex items-center justify-center rounded-full overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
        style={{
          width: size,
          height: size,
          background: user?.avatar ? "transparent" : "rgba(255,255,255,0.08)",
          border: "2px solid rgba(255,255,255,0.2)",
          boxShadow: "0 0 20px rgba(255,255,255,0.15)",
        }}
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
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full backdrop-blur-sm">
          {uploading ? (
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 rounded-full border-2 border-white/20" />
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
          className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold border-2 border-gray-900 transition-all duration-300 hover:scale-110"
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
    student: { label: "Student", icon: "school" },
    teacher: { label: "Teacher", icon: "cast_for_education" },
    admin: { label: "Admin", icon: "admin_panel_settings" },
  };
  const c = config[role] || config.student;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)" }}>
      <span className="material-symbols-outlined text-sm">{c.icon}</span>
      {c.label}
    </span>
  );
};

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

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'Lexend', sans-serif" }}>
      <Toast msg={toast.msg} type={toast.type} />

      {/* ── Hero ───────────────────────────────────────────── */}
      <div className="opacity-0 animate-fadeInUp" style={{ animationFillMode: "forwards" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full animate-pulse bg-white" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">SmartAcademia · Profile</p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
          My Profile
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Manage your personal information and account settings
        </p>
      </div>

      {/* ── Profile Card ────────────────────────────────────── */}
      <div className="rounded-2xl p-6 sm:p-8 transition-all duration-300 opacity-0 animate-fadeInUp" style={{ background: "#0f1629", border: "1px solid #1e293b", animationDelay: "80ms", animationFillMode: "forwards" }}>
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
              <span className="material-symbols-outlined text-sm text-white/60">email</span>
              {user?.email}
            </p>
            {user?.department && (
              <p className="text-gray-500 text-xs flex items-center justify-center sm:justify-start gap-1.5">
                <span className="material-symbols-outlined text-sm text-white/60">corporate_fare</span>
                {user.department}
                {user.semester && ` • ${user.semester} Semester`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "#1e293b" }}>
            <span className="material-symbols-outlined text-xs text-white/60">photo_camera</span>
            <span className="text-[10px] text-gray-500">Click photo to change</span>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl p-1.5 opacity-0 animate-fadeInUp" style={{ background: "#0a0f1e", border: "1px solid #1e293b", animationDelay: "140ms", animationFillMode: "forwards" }}>
        {[
          { id: "profile", label: "Personal Info", icon: "person" },
          { id: "security", label: "Security", icon: "lock" },
          { id: "account", label: "Account Details", icon: "badge" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-sm font-semibold transition-all duration-300"
            style={activeTab === tab.id
              ? { background: "#1e293b", color: "#ffffff", boxShadow: "0 0 20px rgba(255,255,255,0.08)" }
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
        <form onSubmit={handleSaveProfile} className="opacity-0 animate-fadeInUp" style={{ animationFillMode: "forwards" }}>
          <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: "#1e293b" }}>
              <SectionHeader icon="person" title="Personal Information" />
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
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-white/40 focus:border-transparent outline-none transition-all duration-300"
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
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-white/40 focus:border-transparent outline-none transition-all duration-300"
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
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-white/40 focus:border-transparent outline-none transition-all duration-300 appearance-none cursor-pointer"
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
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-white/40 focus:border-transparent outline-none transition-all duration-300"
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
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-white/40 focus:border-transparent outline-none transition-all duration-300"
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
            className="w-full mt-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            style={{ background: "#ffffff", color: "#0a0f1e" }}
          >
            {savingProfile ? (
              <>
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 rounded-full border-2 border-black/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-black animate-spin" />
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
        <form onSubmit={handleChangePassword} className="opacity-0 animate-fadeInUp" style={{ animationFillMode: "forwards" }}>
          <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: "#0f1629", border: "1px solid #1e293b" }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: "#1e293b" }}>
              <SectionHeader icon="lock" title="Change Password" />
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
                      className="w-full pl-10 pr-12 py-2.5 text-sm rounded-xl bg-gray-800/50 text-white border border-gray-700 focus:ring-2 focus:ring-white/40 focus:border-transparent outline-none transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const name = field.key.replace("Password", "").toLowerCase();
                        setShowPasswords((p) => ({ ...p, [name]: !p[name] }));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors duration-200"
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
            className="w-full mt-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            style={{ background: "#ffffff", color: "#0a0f1e" }}
          >
            {savingPassword ? (
              <>
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 rounded-full border-2 border-black/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-black animate-spin" />
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
        <div className="rounded-2xl overflow-hidden transition-all duration-300 opacity-0 animate-fadeInUp" style={{ background: "#0f1629", border: "1px solid #1e293b", animationFillMode: "forwards" }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "#1e293b" }}>
            <SectionHeader icon="badge" title="Account Details" />
          </div>
          <div className="divide-y" style={{ borderColor: "#1e293b" }}>
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
              { label: "Email Verified", value: user?.isEmailVerified ? "Yes" : "No", icon: user?.isEmailVerified ? "verified" : "cancel" },
              { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—", icon: "event" },
            ].filter(Boolean).map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors duration-200">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)" }}>
                  <span className="material-symbols-outlined text-lg text-white">{item.icon}</span>
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
      <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#0a0f1e", border: "1px solid #1e293b" }}>
        <span className="material-symbols-outlined text-xs text-white/70 mt-0.5">info</span>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <strong className="text-white/80">Profile tip:</strong> Keep your information up to date. Your profile photo and details help personalize your learning experience.
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out both; }

        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 1.4s ease-in-out infinite; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s cubic-bezier(.16,1,.3,1) both; }
      `}</style>
    </div>
  );
};

export default ProfileManagement;