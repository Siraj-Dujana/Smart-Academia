const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { notifyStudentRegistration, notifyTeacherRegistration } = require("./notificationController"); // ✅ ADD THIS

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ===== REGISTER STUDENT =====
const registerStudent = async (req, res) => {
  try {
    const { fullName, studentId, email, password, department, semester } = req.body;

    if (!fullName || !studentId || !email || !password || !department || !semester) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email OTP was verified
    const tempUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (!tempUser) {
      return res.status(400).json({
        message: "Please verify your email first before registering.",
      });
    }

    // If a fully registered verified user already exists
    if (tempUser.isEmailVerified && tempUser.studentId) {
      return res.status(400).json({ message: "Email already registered. Please login." });
    }

    // Check studentId not taken by another verified user
    const studentIdExists = await User.findOne({
      studentId: studentId.trim(),
      isEmailVerified: true,
    });
    if (studentIdExists) {
      return res.status(400).json({ message: "Student ID already registered" });
    }

    // Update the temp user record with full registration details
    tempUser.fullName = fullName.trim();
    tempUser.studentId = studentId.trim();
    tempUser.email = email.toLowerCase().trim();
    tempUser.password = password; // will be hashed by pre-save hook
    tempUser.department = department;
    tempUser.semester = semester;
    tempUser.role = "student";
    tempUser.isEmailVerified = true;
    tempUser.resetOTP = null;
    tempUser.resetOTPExpiry = null;
    await tempUser.save();

    // ✅ NOTIFY ALL ADMINS - New student registered
    await notifyStudentRegistration({
      fullName: tempUser.fullName,
      email: tempUser.email,
      studentId: tempUser.studentId,
    });

    res.status(201).json({
      message: "Student registered successfully",
      token: generateToken(tempUser._id, tempUser.role),
      user: {
        id: tempUser._id,
        fullName: tempUser.fullName,
        email: tempUser.email,
        role: tempUser.role,
        studentId: tempUser.studentId,
        department: tempUser.department,
        semester: tempUser.semester,
        avatar: tempUser.avatar || null,
      },
    });
  } catch (error) {
    console.error("Register student error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${field === "email" ? "Email" : "Student ID"} already registered`,
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: "Server error, please try again" });
  }
};

// ===== REGISTER TEACHER =====
const registerTeacher = async (req, res) => {
  try {
    const { fullName, employeeId, email, password, department, specialization, qualification } = req.body;

    if (!fullName || !employeeId || !email || !password || !specialization || !qualification) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email OTP was verified
    const tempUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (!tempUser) {
      return res.status(400).json({
        message: "Please verify your email first before registering.",
      });
    }

    if (tempUser.isEmailVerified && tempUser.employeeId) {
      return res.status(400).json({ message: "Email already registered. Please login." });
    }

    // Check employeeId not taken
    const empIdExists = await User.findOne({
      employeeId: employeeId.trim(),
      isEmailVerified: true,
    });
    if (empIdExists) {
      return res.status(400).json({ message: "Employee ID already registered" });
    }

    // Update temp user with full teacher registration
    tempUser.fullName = fullName.trim();
    tempUser.employeeId = employeeId.trim();
    tempUser.email = email.toLowerCase().trim();
    tempUser.password = password;
    tempUser.department = department || null;
    tempUser.specialization = specialization.trim();
    tempUser.qualification = qualification.trim();
    tempUser.role = "teacher";
    tempUser.isEmailVerified = true;
    tempUser.resetOTP = null;
    tempUser.resetOTPExpiry = null;
    await tempUser.save();

    // ✅ NOTIFY ALL ADMINS - New teacher registered
    await notifyTeacherRegistration({
      fullName: tempUser.fullName,
      email: tempUser.email,
      employeeId: tempUser.employeeId,
    });

    res.status(201).json({
      message: "Teacher registered successfully",
      token: generateToken(tempUser._id, tempUser.role),
      user: {
        id: tempUser._id,
        fullName: tempUser.fullName,
        email: tempUser.email,
        role: tempUser.role,
        employeeId: tempUser.employeeId,
        specialization: tempUser.specialization,
        qualification: tempUser.qualification,
        avatar: tempUser.avatar || null,
      },
    });
  } catch (error) {
    console.error("Register teacher error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${field === "email" ? "Email" : "Employee ID"} already registered`,
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: "Server error, please try again" });
  }
};

// ===== LOGIN =====
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Block unverified users from logging in
    if (!user.isEmailVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Return ALL user fields
    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        employeeId: user.employeeId,
        avatar: user.avatar,
        department: user.department,
        semester: user.semester,
        specialization: user.specialization,
        qualification: user.qualification,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error, please try again" });
  }
};

// ===== GET CURRENT USER =====
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ 
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        studentId: user.studentId || null,
        employeeId: user.employeeId || null,
        avatar: user.avatar || null,
        department: user.department || null,
        semester: user.semester || null,
        specialization: user.specialization || null,
        qualification: user.qualification || null,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerStudent, registerTeacher, login, getMe };