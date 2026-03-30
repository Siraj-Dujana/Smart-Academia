const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ===== REGISTER STUDENT =====
const registerStudent = async (req, res) => {
  try {
    const { fullName, studentId, email, password, department, semester } =
      req.body;

    // 1. Check all fields present
    if (!fullName || !studentId || !email || !password || !department || !semester) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check email duplicate - case insensitive
    const emailExists = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered. Please use a different email or login." });
    }

    // 3. Check studentId duplicate
    const studentIdExists = await User.findOne({ studentId: studentId.trim() });
    if (studentIdExists) {
      return res.status(400).json({ message: "Student ID already registered" });
    }

    // 4. Create the user
    const user = await User.create({
      fullName: fullName.trim(),
      studentId: studentId.trim(),
      email: email.toLowerCase().trim(),
      password,
      department,
      semester,
      role: "student",
    });

    // 5. Return token + user info
    res.status(201).json({
      message: "Student registered successfully",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        semester: user.semester,
      },
    });
  } catch (error) {
    console.error("Register student error:", error);

    // Handle MongoDB duplicate key error (code 11000)
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
    const { fullName, employeeId, email, password, department, specialization, qualification } =
      req.body;

    // 1. Check all fields present
    if (!fullName || !employeeId || !email || !password || !specialization || !qualification) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check email duplicate
    const emailExists = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered. Please use a different email or login." });
    }

    // 3. Check employeeId duplicate
    const empIdExists = await User.findOne({ employeeId: employeeId.trim() });
    if (empIdExists) {
      return res.status(400).json({ message: "Employee ID already registered" });
    }

    // 4. Create the user
    const user = await User.create({
      fullName: fullName.trim(),
      employeeId: employeeId.trim(),
      email: email.toLowerCase().trim(),
      password,
      department: department || null,
      specialization: specialization.trim(),
      qualification: qualification.trim(),
      role: "teacher",
    });

    // 5. Return token + user info
    res.status(201).json({
      message: "Teacher registered successfully",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        specialization: user.specialization,
        qualification: user.qualification,
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

    // 1. Check fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find user by email (case insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Return token + user
    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
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
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerStudent, registerTeacher, login, getMe };