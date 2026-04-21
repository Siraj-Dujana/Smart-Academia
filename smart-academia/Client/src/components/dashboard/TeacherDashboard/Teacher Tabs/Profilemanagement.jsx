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
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
  };
  return (
    <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-sm font-medium animate-slideIn max-w-sm ${colors[type] || colors.success}`}>
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
    student: { label: "Student", className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300", icon: "school" },
    teacher: { label: "Teacher", className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300", icon: "cast_for_education" },
    admin: { label: "Admin", className: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300", icon: "admin_panel_settings" },
  };
  const c = config[role] || config.student;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${c.className}`}>
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
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-10">
      <Toast msg={toast.msg} type={toast.type} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 mb-6">
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.fullName}</h2>
              <RoleBadge role={user?.role} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{user?.email}</p>
            {user?.department && (
              <p className="text-gray-500 dark:text-gray-500 text-xs flex items-center justify-center sm:justify-start gap-1">
                <span className="material-symbols-outlined text-sm">corporate_fare</span>
                {user.department}
                {user.semester && ` • ${user.semester} Semester`}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-400">Click photo to change</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700 mb-6">
        {[
          { id: "profile", label: "Personal Info", icon: "person" },
          { id: "security", label: "Security", icon: "lock" },
          { id: "account", label: "Account Details", icon: "badge" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Personal Info */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">person</span>
                Personal Information
              </h3>
            </div>
            <div className="p-6 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    badge
                  </span>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    email
                  </span>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    corporate_fare
                  </span>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                    placeholder="e.g. Computer Science"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Student Fields */}
              {user?.role === "student" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Current Semester
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      calendar_today
                    </span>
                    <select
                      value={form.semester}
                      onChange={(e) => setForm((p) => ({ ...p, semester: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
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
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Specialization
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                        psychology
                      </span>
                      <input
                        type="text"
                        value={form.specialization}
                        onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
                        placeholder="e.g. Artificial Intelligence"
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Qualification
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                        school
                      </span>
                      <input
                        type="text"
                        value={form.qualification}
                        onChange={(e) => setForm((p) => ({ ...p, qualification: e.target.value }))}
                        placeholder="e.g. PhD, M.Sc"
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 flex items-center justify-center gap-2"
          >
            {savingProfile ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
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

      {/* Tab: Security */}
      {activeTab === "security" && (
        <form onSubmit={handleChangePassword}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">lock</span>
                Change Password
              </h3>
            </div>
            <div className="p-6 space-y-5">
              {[
                { label: "Current Password", key: "currentPassword", icon: "lock", show: showPasswords.current },
                { label: "New Password", key: "newPassword", icon: "lock_reset", show: showPasswords.new },
                { label: "Confirm New Password", key: "confirmPassword", icon: "check_circle", show: showPasswords.confirm },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    {field.label}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      {field.icon}
                    </span>
                    <input
                      type={field.show ? "text" : "password"}
                      value={passwordForm[field.key]}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full pl-10 pr-12 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((p) => ({ ...p, [field.key.split(/(?=[A-Z])/)[0].toLowerCase()]: !p[field.key.split(/(?=[A-Z])/)[0].toLowerCase()] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 flex items-center justify-center gap-2"
          >
            {savingPassword ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
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

      {/* Tab: Account Details */}
      {activeTab === "account" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">badge</span>
              Account Details
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
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
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <span className="material-symbols-outlined text-indigo-600 text-lg">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{item.value}</p>
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