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
import Lessons from './components/dashboard/StudentDashboard/Lesson';



function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
            <Route path="/lessons/:courseId" element={<Lessons />} />
          {/* Redirect root to dashboard */}
          <Route path="/TeacherDashboard" element={<TeacherDashboard />} />
          <Route path="/StudentDashboard" element={<StudentDashboard />} />
          <Route path="/LandingPage" element={<LandingPage />} />
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          
          {/* Main routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/student" element={<StudentRegistration />} />
          <Route path="/register/teacher" element={<TeacherRegistration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* 404 page */}
          <Route path="*" element={<div className="flex items-center justify-center min-h-screen">Page not found</div>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;