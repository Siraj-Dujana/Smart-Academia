const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const dotenv   = require("dotenv");
dotenv.config();

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
app.use(express.json());

// Routes
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/otp",           require("./routes/otp"));
app.use("/api/quizzes",       require("./routes/quizzes"));
app.use("/api/admin",         require("./routes/admin"));
app.use("/api/setup",         require("./setup/setupRoute"));
app.use("/api/ai",            require("./ai/aiRoutes"));
app.use("/api/assignments",   require("./routes/assignments"));
app.use("/api/courses",       require("./routes/courses"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/student",       require("./routes/student"));
app.use("/api/courses/:courseId/lessons", require("./routes/lessons"));

// AI Assistant Routes
app.use("/api/assistant", require("./routes/aiRoutes"));           // ✅ Single mount
app.use("/api/assistant/documents", require("./routes/documentRoutes"));
app.use("/api/assistant/flashcards", require("./routes/flashcardRoutes"));
app.use("/api/assistant/quizzes", require("./routes/quizRoutes"));

app.get("/", (req, res) => res.json({ message: "SmartAcademia API running" }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error("MongoDB error:", err));