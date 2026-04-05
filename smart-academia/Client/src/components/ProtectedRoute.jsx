import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute - Blocks access to routes based on auth and role
 * 
 * Usage:
 * <ProtectedRoute role="student">
 *   <StudentDashboard />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute role="teacher">
 *   <TeacherDashboard />
 * </ProtectedRoute>
 */

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ===== NOT LOGGED IN =====
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // ===== WRONG ROLE =====
  // WITH this
if (role && user.role !== role) {
  if (user.role === "student") return <Navigate to="/student/dashboard" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === "admin") return <Navigate to="/AdminDashboard" replace />;
  return <Navigate to="/login" replace />;
}

  // ===== AUTHORIZED =====
  return children;
};

export default ProtectedRoute;