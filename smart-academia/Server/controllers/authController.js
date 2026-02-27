const User = require("../models/user");
const jwt = require("jsonwebtoken");

// ===== GENERATE JWT TOKEN =====
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

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const studentIdExists = await User.findOne({ studentId });
    if (studentIdExists) {
      return res.status(400).json({ message: "Student ID already registered" });
    }

    const user = await User.create({
      fullName,
      studentId,
      email,
      password,
      department,
      semester,
      role: "student",
    });

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
    const { fullName, employeeId, email, password, specialization, qualification } = req.body;

    if (!fullName || !employeeId || !email || !password || !specialization || !qualification) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const empIdExists = await User.findOne({ employeeId });
    if (empIdExists) {
      return res.status(400).json({ message: "Employee ID already registered" });
    }

    const user = await User.create({
      fullName,
      employeeId,
      email,
      password,
      specialization,
      qualification,
      role: "teacher",
    });

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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

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