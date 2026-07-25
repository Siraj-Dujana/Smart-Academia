const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
const cloudinary = require("cloudinary").v2;
const nodemailer = require("nodemailer");

// Load environment variables
const dotenv = require("dotenv");
dotenv.config();

// Import routes
const teacherRoutes = require('./routes/Teacherprogress');
const aiProgressRoutes = require("./routes/aiProgressRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const courseNoteRoutes = require('./routes/courseNoteRoutes');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ 
  origin: ["http://localhost:5173", "http://localhost:3000", process.env.CLIENT_URL] 
}));
app.use(express.json());

// ── Service Health Check ────────────────────────────────────
const checkServices = async () => {
  const status = {
    mongodb: { connected: false, message: "" },
    cloudinary: { configured: false, message: "" },
    gemini: { configured: false, message: "" },
    email: { configured: false, message: "" }
  };

  // 1. MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      status.mongodb.connected = true;
      status.mongodb.message = "Connected";
    } else {
      status.mongodb.message = "Not connected";
    }
  } catch (error) {
    status.mongodb.message = error.message;
  }

  // 2. Cloudinary
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
      const result = await cloudinary.api.ping();
      status.cloudinary.configured = result.status === "ok";
      status.cloudinary.message = result.status === "ok" ? "Connected" : "Connection failed";
    } else {
      status.cloudinary.message = "Credentials missing";
    }
  } catch (error) {
    status.cloudinary.configured = false;
    status.cloudinary.message = error.message;
  }

  // 3. Gemini
  try {
    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: "OK"
      });
      status.gemini.configured = !!response.text;
      status.gemini.message = response.text ? "Connected" : "Connection failed";
    } else {
      status.gemini.message = "API key missing";
    }
  } catch (error) {
    status.gemini.configured = false;
    status.gemini.message = error.message;
  }

  // 4. Email
  try {
    const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_PASS;
    
    if (emailUser && emailPass) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
      await transporter.verify();
      status.email.configured = true;
      status.email.message = "Connected";
    } else {
      status.email.message = "Credentials missing";
    }
  } catch (error) {
    status.email.configured = false;
    status.email.message = error.message;
  }

  return status;
};

// ── Health Check Endpoint ────────────────────────────────────
app.get("/api/health", async (req, res) => {
  try {
    const services = await checkServices();
    const allOk = Object.values(services).every(s => 
      s.connected === true || s.configured === true
    );

    res.status(allOk ? 200 : 503).json({
      status: allOk ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      services
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ── Quick Health Check ──────────────────────────────────────
app.get("/api/health/quick", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1,
    uptime: process.uptime()
  });
});

// ── Test Email Endpoint ─────────────────────────────────────
app.post("/api/test-email", async (req, res) => {
  try {
    const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_PASS;
    
    if (!emailUser || !emailPass) {
      return res.status(400).json({ 
        success: false, 
        message: "Email credentials not configured" 
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    await transporter.sendMail({
      from: emailUser,
      to: emailUser,
      subject: "✅ Smart Academia - Test Email",
      html: `
        <h2>Email Test Successful</h2>
        <p>Your Smart Academia backend email configuration is working.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    });

    res.json({ success: true, message: "Test email sent successfully" });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ── Routes ──────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/otp", require("./routes/otp"));
app.use("/api/quizzes", require("./routes/quizzes"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/setup", require("./setup/setupRoute"));
app.use("/api/assignments", require("./routes/assignments"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/student", require("./routes/student"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/notifications", require("./routes/Notifications"));
app.use("/api/courses/:courseId/lessons", require("./routes/lessons"));

// AI Routes
app.use("/api/ai", require("./routes/aiRoutes"));

// AI Assistant
app.use("/api/assistant/documents", require("./routes/documentRoutes"));
app.use("/api/assistant/flashcards", require("./routes/flashcardRoutes"));
app.use("/api/assistant/quizzes", require("./routes/quizRoutes"));

// Analytics & Progress
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/teacher", teacherRoutes);
app.use("/api/ai-progress", aiProgressRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/certificates", certificateRoutes);
app.use('/api/course-notes', courseNoteRoutes);

app.get("/", (req, res) => res.json({ message: "SmartAcademia API running" }));

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // Check services on startup
    const services = await checkServices();
    console.log("\n Service Status:");
    console.log(`  MongoDB:   ${services.mongodb.connected ? " ✅" : "❌"} ${services.mongodb.message}`);
    console.log(`  Cloudinary: ${services.cloudinary.configured ? "✅" : "❌"} ${services.cloudinary.message}`);
    console.log(`  Gemini:     ${services.gemini.configured ? "✅" : "❌"} ${services.gemini.message}`);
    console.log(`  Email:      ${services.email.configured ? "✅" : "❌"} ${services.email.message}`);
    
    app.listen(PORT, () => console.log(`\n Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });