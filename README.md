# SmartAcademia

SmartAcademia is an AI-assisted Learning Management System (LMS) that combines modern educational tools with artificial intelligence to create a personalized learning experience for students, teachers, and administrators.

The platform enables educators to create structured courses, lessons, quizzes, and coding labs while providing students with AI-powered learning assistance, automated assessments, progress tracking, and intelligent feedback.

---

## Features

### Student Portal

- User registration and authentication
- Course enrollment
- Sequential lesson completion
- AI learning assistant
- AI-generated quizzes
- Coding lab submissions
- Auto Lab Evaluation (Get instant score)
- Progress tracking
- Performance analytics
- Progress Analyzer (Students can see what topics they are weak in during the course)
- AI Learning Assistant (Student can upload the documents and can chat with that document, generate quizes, generate flashcards)
- Notifications

### Teacher Portal

- User registration and authentication
- Course management
- Lesson management
- Quiz creation (manual)
- AI quiz generation (auto)
- Coding lab creation (auto+manual)
- Student performance monitoring (can see performance of each student seperately)
- Analytics dashboard

### Administrator Panel

- User management
- Course approval
- Platform monitoring
- Content moderation
- System activity logs

---

## AI Capabilities

### AI Learning Assistant

Provides contextual explanations, study guidance, and concept clarification.

### AI Quiz Generation

Automatically generates quizzes based on topics and difficulty levels while ensuring different question sets for every attempt.

### AI Lab Feedback

Analyzes submitted code and provides intelligent explanations, improvement suggestions, and feedback.

### AI Progress Analysis

Evaluates student learning patterns, identifies weak topics, and generates personalized learning recommendations.

### AI Chatbot for both Teacher and Student
helps student and teacher in understanding the concepts clearly.

---

## Learning Workflow

1. Teacher creates a course.
2. Teacher adds lessons, quizzes, and coding labs.
3. Student enrolls in the course.
4. Student completes lessons sequentially. 
5. Student attempts quizzes (maximum three attempts).
6. Student submits coding labs.
7. AI evaluates progress and provides recommendations.
8. Teachers monitor performance through analytics.

---

## Technology Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### AI Integration

- Google Gemini API

### Authentication

- JWT
- bcrypt

### Cloud Storage

- Cloudinary

### Development Tools

- Git
- GitHub
- Postman
- Visual Studio Code

---

## Core Modules

- Authentication
- Course Management
- Lesson Management
- Enrollment System
- Quiz System
- Coding Lab Module
- AI Assistant
- AI Progress Analytics
- Notification System
- Administration Panel

---

## Security

- JWT-based authentication
- Role-based authorization
- Protected API routes
- Quiz attempt validation
- Lesson access control
- Activity logging

---

## Project Structure

```text
SmartAcademia
│
├── client
│   ├── src
│   ├── components
│   ├── pages
│   ├── hooks
│   ├── services
│   ├── assets
│   └── App.jsx
│
├── server
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── utils
│   └── server.js
│
├── README.md
└── package.json
```

---

## Installation

Clone the repository

```bash
git clone https://github.com/Siraj-Dujana/SmartAcademia.git

cd SmartAcademia
```

Install backend dependencies

```bash
npm install
```

Install frontend dependencies

```bash
cd client
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

MONGODB_URI=

JWT_SECRET=

GEMINI_API_KEY=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

---

## Running the Project

Backend

```bash
npm run server
```

Frontend

```bash
cd client
npm run dev
```

---

## Database Collections

- Users
- Courses
- Lessons
- Enrollments
- Quizzes
- Questions
- QuizAttempts
- Labs
- LabSubmissions
- Notifications
- AIReports

---

## Planned Enhancements

- Certificate generation
- AI-powered plagiarism detection
- Discussion forums
- Real-time collaboration
- Mobile application
- Gamification
- Leaderboards
- Advanced analytics

---

## License

This project is licensed under the MIT License.

---

## Developer

Siraj Ahmed

Software Engineer | Full Stack MERN Developer

GitHub: https://github.com/Siraj-Dujana

LinkedIn: https://linkedin.com/in/siraj-ahmed-qureshi
