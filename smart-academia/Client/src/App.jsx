  import React from 'react';
  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import TeacherRegistration from './pages/loginRegSystem/teachReg'
  import StudentRegistration from './pages/loginRegSystem/studentReg'
  import Register from './pages/loginRegSystem/log-reg'
  import Login from './pages/loginRegSystem/login'
  import ForgotPassword from './pages/loginRegSystem/ForgotPassword';
  import LandingPage from './pages/LandingPage';
  import AdminDashboard from "./pages/AdminDashboard";
  import StudentDashboard from './pages/StudentDashboard';
  import TeacherDashboard from './pages/TeacherDashboard';
  import Lessons from './components/dashboard/StudentDashboard/Student Tabs/Lessons';
  import ProtectedRoute from './components/ProtectedRoute';
  import Setup from './pages/Setup';

  function App() {
    return (
      <Router>
        <div className="App">
          <Routes>

            {/* ===== PUBLIC ROUTES ===== */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/LandingPage" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/student" element={<StudentRegistration />} />
            <Route path="/register/teacher" element={<TeacherRegistration />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/setup" element={<Setup />} />
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

            {/* ===== PROTECTED ADMIN ROUTES ===== */}
            <Route path="/AdminDashboard" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* ===== 404 ===== */}
            <Route path="*" element={<div className="flex items-center justify-center min-h-screen">Page not found</div>} />

          </Routes>
        </div>
      </Router>
    );
  }

  export default App;