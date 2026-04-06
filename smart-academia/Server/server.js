const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/otp", require("./routes/otp"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/quizzes", require("./routes/quizzes"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/setup", require("./setup/setupRoute"));
app.use("/api/ai", require("./ai/aiRoutes")); // ← AI routes

app.get("/", (req, res) => res.json({ message: "SmartAcademia API is running" }));
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));