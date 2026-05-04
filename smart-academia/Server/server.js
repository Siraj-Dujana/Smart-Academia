const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const dotenv   = require("dotenv");
const { getStudentAnalytics } = require("./controllers/analyticsController");
const teacherRoutes = require('./routes/Teacherprogress');
// Add with your other routes
const aiProgressRoutes = require("./routes/aiProgressRoutes");


dotenv.config();


const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
app.use(express.json());

// ── Core Routes ──────────────────────────────────────────────
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/otp",           require("./routes/otp"));
app.use("/api/quizzes",       require("./routes/quizzes"));
app.use("/api/admin",         require("./routes/admin"));
app.use("/api/setup",         require("./setup/setupRoute"));
app.use("/api/assignments",   require("./routes/assignments"));
app.use("/api/courses",       require("./routes/courses"));
app.use("/api/student",       require("./routes/student"));
app.use("/api/profile",       require("./routes/profile"));
app.use("/api/notifications", require("./routes/Notifications"));

// ── Lesson routes (nested under courses) ─────────────────────
app.use("/api/courses/:courseId/lessons", require("./routes/lessons"));

// ── AI Routes (single mount — no duplicate) ───────────────────
// Both /api/ai and /api/assistant share the same aiRoutes handler.
// Document/flashcard/quiz routes are mounted separately under /api/assistant.
app.use("/api/ai",           require("./routes/aiRoutes"));
app.use("/api/assistant",    require("./routes/aiRoutes"));

// ── AI Assistant sub-resources ───────────────────────────────
app.use("/api/assistant/documents",  require("./routes/documentRoutes"));
app.use("/api/assistant/flashcards", require("./routes/flashcardRoutes"));
app.use("/api/assistant/quizzes",    require("./routes/quizRoutes"));

// Progress
app.use("/api/analytics", require("./routes/analytics"));

// Teacher student progress and course stats routes
app.use("/api/teacher", teacherRoutes);

// AI progress analysis routes
app.use("/api/ai-progress", aiProgressRoutes);

app.get("/", (req, res) => res.json({ message: "SmartAcademia API running" }));


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error("MongoDB error:", err));