# **MASTER PROMPT FOR CLAUDE – SMARTACADEMIA FULL SYSTEM DESIGN (v3.0 FINAL)**

You are a senior software architect, AI systems designer, and full-stack engineer. I want you to fully understand my Final Year Project called **SmartAcademia**, an AI-assisted Learning Management System, and help me design, implement, and improve it.

Treat this description as a **complete Software Requirements Specification (SRS) and System Design Document**.

---

# **1. Project Overview**

**Project Name:** SmartAcademia
**Type:** Web-based AI-Assisted Learning Management System
**Target:** General platform (initially designed for university-level learning like IBA)

The system provides structured, AI-assisted learning where students progress through lessons in a controlled manner with quizzes, labs, and final assessments.

---

# **2. Technology Stack**

### Frontend:

* React.js with Vite
* Tailwind CSS
* Dark Mode UI

### Backend:

* Node.js with Express.js
* Redis (for caching quiz questions and leaderboard data)

### Database:

* MongoDB

### File Management:

* Cloudinary (videos, images, certificates, user uploads)

### AI Components:

* AI Chatbot Tutor
* AI Quiz Generator
* AI Lab Feedback Generator
* AI Progress Analyzer
* AI Study Planner

---

# **3. User Roles**

## **Student**

* Register/Login (JWT + OTP verification)
* Enroll in courses
* View lessons (text + video + visuals)
* Attempt quizzes (max 3 attempts)
* Submit labs
* View progress & reports
* View leaderboard
* Download certificates
* Interact with AI tutor

## **Teacher**

* Create courses
* Add lessons (manual or AI-generated)
* Upload media via Cloudinary
* Create quizzes (manual + AI-generated)
* Create labs (programming, DLD, networking, etc.)
* Monitor student performance
* Send notifications (quiz deadlines, lab deadlines, announcements)

## **Admin**

* Manage users
* Approve/remove courses
* Monitor system activity
* Moderate content
* View logs

---

# **4. Core Learning Flow (VERY IMPORTANT)**

1. Teacher creates course

2. Teacher adds lessons

3. Each lesson includes:

   * Content (text + video + visuals)
   * Quiz
   * Lab

4. Student enrolls in course

5. Lessons are **locked by default**

6. To unlock next lesson:

   * Complete lesson
   * Submit quiz
   * Submit lab

### Flow:

Lesson 1 → Quiz 1 + Lab 1 → Unlock Lesson 2 → Repeat

7. After all lessons:

   * **Grand Quiz**
   * **Grand Lab / Final Project**

8. Certificate is generated after completion

---

# **5. Quiz System**

## Types:

* Manual (teacher-created)
* Auto-generated (AI-based)

## Rules:

* Maximum 3 attempts
* Each attempt = different questions
* Same topic consistency

## Storage:

Each attempt stores:

* attemptNumber
* questionSet
* answers
* score
* timeTaken
* timestamp

## Extra:

* Attempt locking after 3 tries (optional)
* Weak topic suggestion after quiz

---

# **6. Lab System**

## Types:

* Programming labs (code execution)
* DLD labs (logic-based)
* Networking labs (scenario-based)

## Flow:

* Student writes code / answers
* Backend executes in sandbox
* Test cases validate output
* AI gives feedback

## Extra:

* Plagiarism detection (basic similarity check)
* Multiple submissions stored

---

# **7. Lesson System**

Lessons include:

* Title
* Text content
* Images
* Videos (Cloudinary)

## Locking System:

* Lessons locked by default
* Unlock only after quiz + lab completion

---

# **8. AI Modules**

### 1. AI Chatbot Tutor

* Explains concepts
* Helps debugging
* Answers questions

### 2. AI Quiz Generator

* Generates new questions per attempt

### 3. AI Lab Feedback Generator

* Explains code errors
* Suggests improvements

### 4. AI Progress Analyzer

* Detects weak areas
* Tracks performance trends

### 5. AI Study Planner

* Generates personalized learning plan

---

# **9. Gamification & Engagement**

* Leaderboard (based on performance)
* Points system
* Progress bars
* Course completion certificates (PDF via Cloudinary)
* Dark mode UI

---

# **10. Notifications System**

Supports:

* Email notifications
* In-app notifications

Used for:

* Quiz deadlines
* Lab deadlines
* Course announcements

---

# **11. Activity Logs**

Tracks:

* Student actions (quiz attempts, lab submissions)
* Teacher actions (course creation, updates)
* Suspicious behavior (tab switching)

---

# **12. System Modules**

* Authentication Module (JWT + OTP)
* Course Module
* Lesson Module (locked progression)
* Quiz Module (randomization + attempts)
* Lab Module (execution + feedback)
* AI Module
* Gamification Module
* Notification Module
* Admin Module
* Activity Log Module

---

# **13. Database Collections**

Users
Courses
Lessons
Quizzes
Questions
QuizAttempts
Labs
LabSubmissions
Enrollments
Notifications
AIReports
Certificates
Leaderboard
ActivityLogs
Files (Cloudinary URLs)

---

# **14. Frontend Architecture**

Pages:

* Login/Register
* Student Dashboard
* Teacher Dashboard
* Admin Panel
* Course Viewer
* Lesson Viewer
* Quiz Interface
* Lab IDE
* Leaderboard
* Certificate Viewer

---

# **15. Backend Responsibilities**

* Authentication & authorization
* Course & lesson APIs
* Quiz randomization logic
* Attempt validation
* Lab execution (sandbox)
* AI API integration
* Redis caching
* Notification handling
* File upload via Cloudinary

---

# **16. Security & Integrity**

* Max quiz attempts enforced
* Tab switching detection
* JWT validation
* API protection
* Plagiarism detection
* Activity logging

---

# **17. Expected System Behavior**

SmartAcademia behaves as:

**LMS + Online Judge + AI Tutor + Gamified Learning Platform**

---

# **18. What I Need From You**

Help me with:

* MongoDB schema design
* REST API structure
* Random quiz generation logic
* Secure code execution system
* React component structure
* AI prompt engineering
* Leaderboard logic
* Certificate generation system
* Notification system
* Redis caching integration

If anything is unclear, ask before generating code.


by the way update this prompt the lab is manual submitted