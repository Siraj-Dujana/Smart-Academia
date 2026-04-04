const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student", isEmailVerified: true })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json({ students });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all teachers
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher", isEmailVerified: true })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json({ teachers });
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Cannot delete admin" });

    // Delete their enrollments too
    await Enrollment.deleteMany({ student: user._id });
    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, totalTeachers, totalCourses, totalEnrollments] = await Promise.all([
      User.countDocuments({ role: "student", isEmailVerified: true }),
      User.countDocuments({ role: "teacher", isEmailVerified: true }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
    ]);

    res.status(200).json({
      stats: { totalStudents, totalTeachers, totalCourses, totalEnrollments },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllStudents, getAllTeachers, deleteUser, getDashboardStats };