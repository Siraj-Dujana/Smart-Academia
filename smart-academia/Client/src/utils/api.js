// Global API utility — handles token expiry and logout
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

export const getToken = () => localStorage.getItem("token");

// Main API fetch wrapper — auto handles 401 (token expired)
export const apiFetch = async (url, options = {}) => {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  };

  const res = await fetch(`${API}${url}`, config);

  // Token expired or invalid — force logout
  if (res.status === 401) {
    logout();
    return null;
  }

  return res;
};

export default API;