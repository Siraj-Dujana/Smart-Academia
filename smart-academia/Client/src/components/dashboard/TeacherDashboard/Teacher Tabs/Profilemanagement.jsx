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

// ── Avatar Component ────────────────────────────────────────────
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
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          border: "3px solid #135bec",
          boxShadow: "0 0 0 3px rgba(19,91,236,0.15)",
          background: user?.avatar
            ? "transparent"
            : "linear-gradient(135deg, #135bec 0%, #3b82f6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.32,
          fontWeight: 700,
          color: "white",
          letterSpacing: "0.05em",
          cursor: "pointer",
          transition: "box-shadow 0.2s",
          position: "relative",
        }}
        onClick={() => fileRef.current?.click()}
        title="Click to change photo"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          initials
        )}

        {/* Hover overlay */}
        <div
          className="avatar-overlay"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.2s",
            borderRadius: "50%",
          }}
        >
          {uploading ? (
            <svg
              className="spin"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="white"
                strokeWidth="3"
                strokeOpacity="0.3"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 16V8m0 0l-3 3m3-3l3 3"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 16v2a3 3 0 003 3h12a3 3 0 003-3v-2"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
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
          title="Remove photo"
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "#ef4444",
            border: "2px solid white",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1,
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.15)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          ×
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
      />

      <style>{`
        div:hover > .avatar-overlay { opacity: 1 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
};

// ── Input Component ─────────────────────────────────────────────
const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon,
  disabled,
  hint,
}) => (
  <div style={{ marginBottom: 18 }}>
    <label
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--text-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 6,
      }}
    >
      {label}
    </label>
    <div style={{ position: "relative" }}>
      {icon && (
        <span
          className="material-symbols-outlined"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 18,
            color: "var(--text-secondary)",
            pointerEvents: "none",
          }}
        >
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%",
          padding: icon ? "10px 14px 10px 40px" : "10px 14px",
          borderRadius: 10,
          border: "1.5px solid var(--border)",
          background: disabled ? "var(--surface-disabled)" : "var(--surface)",
          color: disabled ? "var(--text-secondary)" : "var(--text-primary)",
          fontSize: 14,
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s, box-shadow 0.2s",
          cursor: disabled ? "not-allowed" : "text",
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.borderColor = "#135bec";
            e.target.style.boxShadow = "0 0 0 3px rgba(19,91,236,0.1)";
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
    {hint && (
      <p
        style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}
      >
        {hint}
      </p>
    )}
  </div>
);

// ── Select Component ────────────────────────────────────────────
const SelectField = ({ label, value, onChange, options, icon }) => (
  <div style={{ marginBottom: 18 }}>
    <label
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--text-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 6,
      }}
    >
      {label}
    </label>
    <div style={{ position: "relative" }}>
      {icon && (
        <span
          className="material-symbols-outlined"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 18,
            color: "var(--text-secondary)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: icon ? "10px 14px 10px 40px" : "10px 14px",
          borderRadius: 10,
          border: "1.5px solid var(--border)",
          background: "var(--surface)",
          color: "var(--text-primary)",
          fontSize: 14,
          outline: "none",
          boxSizing: "border-box",
          appearance: "none",
          cursor: "pointer",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#135bec";
          e.target.style.boxShadow = "0 0 0 3px rgba(19,91,236,0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.boxShadow = "none";
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

// ── Toast ───────────────────────────────────────────────────────
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  const colors = {
    success: { bg: "#f0fdf4", border: "#86efac", color: "#166534", icon: "check_circle" },
    error: { bg: "#fef2f2", border: "#fca5a5", color: "#991b1b", icon: "error" },
  };
  const c = colors[type] || colors.success;
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        borderRadius: 12,
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        animation: "slideIn 0.25s ease",
        maxWidth: 340,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
        {c.icon}
      </span>
      {msg}
    </div>
  );
};

// ── Card ────────────────────────────────────────────────────────
const Card = ({ title, icon, children }) => (
  <div
    style={{
      background: "var(--card)",
      borderRadius: 16,
      border: "1px solid var(--border)",
      marginBottom: 20,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 20, color: "#135bec" }}
      >
        {icon}
      </span>
      <h3
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h3>
    </div>
    <div style={{ padding: "20px 20px 4px" }}>{children}</div>
  </div>
);

// ── Badge ───────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const cfg = {
    student: { label: "Student", bg: "#eff6ff", color: "#1d4ed8", icon: "school" },
    teacher: { label: "Teacher", bg: "#f0fdf4", color: "#166534", icon: "cast_for_education" },
    admin: { label: "Admin", bg: "#fef3c7", color: "#92400e", icon: "admin_panel_settings" },
  };
  const c = cfg[role] || cfg.student;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: c.bg,
        color: c.color,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
        {c.icon}
      </span>
      {c.label}
    </span>
  );
};

// ── Main Profile Page ───────────────────────────────────────────
const ProfileManagement = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form
  const [form, setForm] = useState({
    fullName: "",
    department: "",
    semester: "",
    specialization: "",
    qualification: "",
    employeeId: "",
    studentId: "",
  });

  // Password form
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
          employeeId: data.user.employeeId || "",
          studentId: data.user.studentId || "",
        });
      }
    } catch (err) {
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

      // Update localStorage user
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, avatar: data.avatar }));

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
      setUser((prev) => ({ ...prev, avatar: null, avatarPublicId: null }));

      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, avatar: null }));

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

      showToast("Profile saved successfully!");
    } catch (err) {
      showToast(err.message || "Failed to save", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return showToast("Passwords do not match", "error");
    if (passwordForm.newPassword.length < 8)
      return showToast("Password must be at least 8 characters", "error");
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

  const SEMESTERS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map((s) => ({
    value: s,
    label: `${s} Semester`,
  }));

  // Color scheme based on dark mode class on document
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const cssVars = `
    :root {
      --card: ${isDark ? "#1a2232" : "#ffffff"};
      --surface: ${isDark ? "#101622" : "#f8fafc"};
      --surface-disabled: ${isDark ? "#1a2232" : "#f1f5f9"};
      --border: ${isDark ? "#343d50" : "#e2e8f0"};
      --text-primary: ${isDark ? "#f6f6f8" : "#111318"};
      --text-secondary: ${isDark ? "#9ea8ba" : "#616f89"};
      --bg: ${isDark ? "#101622" : "#f0f2f5"};
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(16px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 0.8s linear infinite; }
  `;

  if (loading) {
    return (
      <>
        <style>{cssVars}</style>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <svg
            className="spin"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#135bec"
              strokeWidth="3"
              strokeOpacity="0.2"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="#135bec"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Loading profile…
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{cssVars}</style>
      <Toast msg={toast.msg} type={toast.type} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px 40px" }}>
        {/* ── Header ───────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: "0 0 4px",
            }}
          >
            My Profile
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
            Manage your personal information and account settings
          </p>
        </div>

        {/* ── Profile hero card ─────────────────────────────────── */}
        <div
          style={{
            background: "var(--card)",
            borderRadius: 16,
            border: "1px solid var(--border)",
            padding: "28px 24px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <Avatar
            user={user}
            size={90}
            onUpload={handleAvatarUpload}
            onDelete={handleAvatarDelete}
            uploading={avatarUploading}
          />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {user?.fullName}
              </h2>
              <RoleBadge role={user?.role} />
            </div>
            <p
              style={{
                margin: "0 0 6px",
                color: "var(--text-secondary)",
                fontSize: 14,
              }}
            >
              {user?.email}
            </p>
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: 13,
              }}
            >
              {user?.department && (
                <span>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>
                    corporate_fare
                  </span>
                  {user.department}
                </span>
              )}
              {user?.semester && (
                <span style={{ marginLeft: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>
                    calendar_today
                  </span>
                  {user.semester} Semester
                </span>
              )}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-secondary)" }}>
              Click photo to change
            </p>
            {avatarUploading && (
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#135bec" }}>
                Uploading…
              </p>
            )}
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "var(--card)",
            borderRadius: 12,
            padding: 4,
            border: "1px solid var(--border)",
            marginBottom: 20,
          }}
        >
          {[
            { id: "profile", label: "Personal Info", icon: "person" },
            { id: "security", label: "Security", icon: "lock" },
            { id: "account", label: "Account Details", icon: "badge" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 500,
                background:
                  activeTab === tab.id
                    ? "#135bec"
                    : "transparent",
                color:
                  activeTab === tab.id
                    ? "white"
                    : "var(--text-secondary)",
                transition: "all 0.15s",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {tab.icon}
              </span>
              <span
                style={{
                  display: "inline",
                }}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Tab: Personal Info ───────────────────────────────── */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile}>
            <Card title="Personal Information" icon="person">
              <Field
                label="Full Name"
                value={form.fullName}
                onChange={(v) => setForm((p) => ({ ...p, fullName: v }))}
                placeholder="Your full name"
                icon="badge"
              />
              <Field
                label="Email Address"
                value={user?.email || ""}
                onChange={() => {}}
                disabled
                icon="email"
                hint="Email cannot be changed here. Contact admin for email changes."
              />
              <Field
                label="Department"
                value={form.department}
                onChange={(v) => setForm((p) => ({ ...p, department: v }))}
                placeholder="e.g. Computer Science"
                icon="corporate_fare"
              />

              {user?.role === "student" && (
                <SelectField
                  label="Current Semester"
                  value={form.semester}
                  onChange={(v) => setForm((p) => ({ ...p, semester: v }))}
                  options={[{ value: "", label: "Select semester…" }, ...SEMESTERS]}
                  icon="calendar_today"
                />
              )}

              {user?.role === "teacher" && (
                <>
                  <Field
                    label="Specialization"
                    value={form.specialization}
                    onChange={(v) => setForm((p) => ({ ...p, specialization: v }))}
                    placeholder="e.g. Artificial Intelligence"
                    icon="psychology"
                  />
                  <Field
                    label="Qualification"
                    value={form.qualification}
                    onChange={(v) => setForm((p) => ({ ...p, qualification: v }))}
                    placeholder="e.g. PhD, M.Sc"
                    icon="school"
                  />
                </>
              )}
            </Card>

            <button
              type="submit"
              disabled={savingProfile}
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: 12,
                border: "none",
                background: savingProfile
                  ? "#9ca3af"
                  : "linear-gradient(135deg, #135bec 0%, #3b82f6 100%)",
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                cursor: savingProfile ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "opacity 0.2s, transform 0.15s",
                boxShadow: savingProfile ? "none" : "0 4px 14px rgba(19,91,236,0.35)",
              }}
              onMouseEnter={(e) => {
                if (!savingProfile) e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {savingProfile ? (
                <>
                  <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    save
                  </span>
                  Save Changes
                </>
              )}
            </button>
          </form>
        )}

        {/* ── Tab: Security ────────────────────────────────────── */}
        {activeTab === "security" && (
          <form onSubmit={handleChangePassword}>
            <Card title="Change Password" icon="lock">
              {/* Current password */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 6,
                  }}
                >
                  Current Password
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 18,
                      color: "var(--text-secondary)",
                      pointerEvents: "none",
                    }}
                  >
                    lock
                  </span>
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                    }
                    placeholder="Enter your current password"
                    style={{
                      width: "100%",
                      padding: "10px 42px 10px 40px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border)",
                      background: "var(--surface)",
                      color: "var(--text-primary)",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#135bec";
                      e.target.style.boxShadow = "0 0 0 3px rgba(19,91,236,0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((p) => ({ ...p, current: !p.current }))
                    }
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {showPasswords.current ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* New password */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 6,
                  }}
                >
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 18,
                      color: "var(--text-secondary)",
                      pointerEvents: "none",
                    }}
                  >
                    lock_reset
                  </span>
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                    }
                    placeholder="Minimum 8 characters"
                    style={{
                      width: "100%",
                      padding: "10px 42px 10px 40px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border)",
                      background: "var(--surface)",
                      color: "var(--text-primary)",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#135bec";
                      e.target.style.boxShadow = "0 0 0 3px rgba(19,91,236,0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((p) => ({ ...p, new: !p.new }))
                    }
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {showPasswords.new ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {/* Strength bar */}
                {passwordForm.newPassword && (
                  <div style={{ marginTop: 8 }}>
                    {(() => {
                      const pwd = passwordForm.newPassword;
                      let strength = 0;
                      if (pwd.length >= 8) strength++;
                      if (/[A-Z]/.test(pwd)) strength++;
                      if (/[0-9]/.test(pwd)) strength++;
                      if (/[^A-Za-z0-9]/.test(pwd)) strength++;
                      const labels = ["", "Weak", "Fair", "Good", "Strong"];
                      const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
                      return (
                        <>
                          <div
                            style={{
                              height: 4,
                              borderRadius: 2,
                              background: "var(--border)",
                              overflow: "hidden",
                              marginBottom: 4,
                            }}
                          >
                            <div
                              style={{
                                width: `${(strength / 4) * 100}%`,
                                height: "100%",
                                background: colors[strength],
                                borderRadius: 2,
                                transition: "width 0.3s, background 0.3s",
                              }}
                            />
                          </div>
                          <p
                            style={{
                              fontSize: 11,
                              color: colors[strength],
                              margin: 0,
                              fontWeight: 600,
                            }}
                          >
                            {labels[strength]}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: 4 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 6,
                  }}
                >
                  Confirm New Password
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 18,
                      color: "var(--text-secondary)",
                      pointerEvents: "none",
                    }}
                  >
                    check_circle
                  </span>
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                    }
                    placeholder="Repeat new password"
                    style={{
                      width: "100%",
                      padding: "10px 42px 10px 40px",
                      borderRadius: 10,
                      border: `1.5px solid ${
                        passwordForm.confirmPassword &&
                        passwordForm.newPassword !== passwordForm.confirmPassword
                          ? "#ef4444"
                          : "var(--border)"
                      }`,
                      background: "var(--surface)",
                      color: "var(--text-primary)",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      if (
                        !passwordForm.confirmPassword ||
                        passwordForm.newPassword === passwordForm.confirmPassword
                      ) {
                        e.target.style.borderColor = "#135bec";
                        e.target.style.boxShadow = "0 0 0 3px rgba(19,91,236,0.1)";
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor =
                        passwordForm.confirmPassword &&
                        passwordForm.newPassword !== passwordForm.confirmPassword
                          ? "#ef4444"
                          : "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))
                    }
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {showPasswords.confirm ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {passwordForm.confirmPassword &&
                  passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontWeight: 600 }}>
                      Passwords do not match
                    </p>
                  )}
              </div>
            </Card>

            <button
              type="submit"
              disabled={
                savingPassword ||
                !passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                passwordForm.newPassword !== passwordForm.confirmPassword
              }
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: 12,
                border: "none",
                background:
                  savingPassword ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  passwordForm.newPassword !== passwordForm.confirmPassword
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #135bec 0%, #3b82f6 100%)",
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                cursor:
                  savingPassword ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  passwordForm.newPassword !== passwordForm.confirmPassword
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow:
                  savingPassword ? "none" : "0 4px 14px rgba(19,91,236,0.35)",
              }}
            >
              {savingPassword ? (
                <>
                  <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Changing Password…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    key
                  </span>
                  Update Password
                </>
              )}
            </button>
          </form>
        )}

        {/* ── Tab: Account Details ─────────────────────────────── */}
        {activeTab === "account" && (
          <Card title="Account Details" icon="badge">
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
              {
                label: "Email Verified",
                value: user?.isEmailVerified ? "Yes ✓" : "No",
                icon: user?.isEmailVerified ? "verified" : "cancel",
              },
              {
                label: "Member Since",
                value: user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—",
                icon: "event",
              },
            ]
              .filter(Boolean)
              .map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 18,
                      color: "#135bec",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontWeight: 600,
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 14,
                        color: "var(--text-primary)",
                        fontWeight: 500,
                        textTransform: item.label === "Account Type" ? "capitalize" : "none",
                      }}
                    >
                      {item.value || "—"}
                    </p>
                  </div>
                </div>
              ))}
            <div style={{ height: 8 }} />
          </Card>
        )}
      </div>
    </>
  );
};

export default ProfileManagement;