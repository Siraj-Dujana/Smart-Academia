const User = require("../models/User");

// =============================================
// GET /api/setup/status
// Check if setup is needed (no admin exists)
// =============================================
const getSetupStatus = async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    res.status(200).json({
      setupRequired: !adminExists,
      message: adminExists
        ? "System already configured"
        : "Setup required — no admin account found",
    });
  } catch (error) {
    console.error("Setup status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// POST /api/setup/create-admin
// Create first admin — only works if no admin exists
// =============================================
const createAdmin = async (req, res) => {
  try {
    // Check if admin already exists — if yes, block this forever
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return res.status(403).json({
        message: "Setup already completed. Admin account already exists.",
      });
    }

    const { fullName, email, password, setupKey } = req.body;


//     console.log("Frontend key:", setupKey);
// console.log("Env key:", process.env.SETUP_KEY);
    // Validate setup key from .env — extra security layer
    if (setupKey !== process.env.SETUP_KEY) {
      return res.status(403).json({ message: "Invalid setup key" });
    }

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Create admin account
    const admin = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "admin",
      isEmailVerified: true,
    });

    console.log(`✅ Admin account created: ${admin.email}`);

    res.status(201).json({
      message: "Admin account created successfully! You can now login.",
      email: admin.email,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getSetupStatus, createAdmin };