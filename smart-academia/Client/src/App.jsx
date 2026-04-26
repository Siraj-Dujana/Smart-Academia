import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TeacherRegistration from './pages/loginRegSystem/teachReg';
import StudentRegistration from './pages/loginRegSystem/studentReg';
import Register from './pages/loginRegSystem/log-reg';
import Login from './pages/loginRegSystem/login';
import ForgotPassword from './pages/loginRegSystem/ForgotPassword';
import LandingPage from './pages/LandingPage';
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Lessons from './components/dashboard/StudentDashboard/Student Tabs/Lessonviewer';
import ProtectedRoute from './components/ProtectedRoute';
import Setup from './pages/Setup';
import LessonEditor from "./components/dashboard/TeacherDashboard/Teacher Tabs/LessonEditor";
import StudentAnalytics from "./components/dashboard/StudentDashboard/Student Tabs/StudentAnalytics";

// =============================================
// Smart home route — checks token and redirects
// to correct dashboard if already logged in
// =============================================
const HomeRoute = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    if (user.role === "student") return <Navigate to="/student/dashboard" replace />;
    if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    
  }

  return <LandingPage />;
};

// =============================================
// /chat — redirect to the right dashboard AI tab
// based on user role
// =============================================
const ChatRoute = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) return <Navigate to="/login" replace />;

  if (user.role === "student")
    return <Navigate to="/student/dashboard?tab=ai-tutor" replace />;
  if (user.role === "teacher")
    return <Navigate to="/teacher/dashboard?tab=ai-tutor" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>

          {/* ===== HOME — smart redirect if logged in ===== */}
          <Route path="/" element={<HomeRoute />} />
          <Route path="/LandingPage" element={<HomeRoute />} />

          {/* ===== PUBLIC ROUTES ===== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/student" element={<StudentRegistration />} />
          <Route path="/register/teacher" element={<TeacherRegistration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/setup" element={<Setup />} />

          {/* ===== /chat — redirect to AI tutor tab ===== */}
          <Route path="/chat" element={<ChatRoute />} />

          {/* ===== PROTECTED STUDENT ROUTES ===== */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/lessons/:courseId" element={
            <ProtectedRoute role="student">
              <Lessons />
            </ProtectedRoute>
          } />


          {/* ===== PROTECTED TEACHER ROUTES ===== */}
          <Route path="/teacher/dashboard" element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          } />

    <Route path="/teacher/lessons/:courseId/create" element={
  <ProtectedRoute role="teacher">
    <LessonEditor />
  </ProtectedRoute>
} />
<Route path="/teacher/lessons/:courseId/edit/:lessonId" element={
  <ProtectedRoute role="teacher">
    <LessonEditor />
  </ProtectedRoute>
} />
          

          {/* ===== PROTECTED ADMIN ROUTES ===== */}
          <Route path="/admin/dashboard" element={
  <ProtectedRoute role="admin">
    <AdminDashboard />
  </ProtectedRoute>
} />

          {/* ===== 404 ===== */}
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300">404</h1>
                <p className="text-gray-500 mt-2">Page not found</p>
                <a href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
                  Go Home
                </a>
              </div>
            </div>
          } />

        </Routes>
      </div>
    </Router>
  );
}

export default App;