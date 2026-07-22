const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Lesson               = require("../models/Lesson");
const LessonProgress       = require("../models/LessonProgress");
const Quiz                 = require("../models/Quiz");
const Question             = require("../models/Question");
const Lab                  = require("../models/Lab");
const LabSubmission        = require("../models/LabSubmission");
const QuizAttempt          = require("../models/QuizAttempt");
const Assignment           = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const { notifyUserDeleted } = require("./Notificationcontroller");

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

    // ✅ Store user data BEFORE deletion for notification
    const deletedUserName = user.fullName;
    const deletedUserRole = user.role;
    const adminName = req.user.fullName;

    if (user.role === "student") {
      // Safe to delete — only affects this student's own data
      await Enrollment.deleteMany({ student: user._id });
      await LessonProgress.deleteMany({ student: user._id });
      await QuizAttempt.deleteMany({ student: user._id });
      await LabSubmission.deleteMany({ student: user._id });
      await AssignmentSubmission.deleteMany({ student: user._id });
    }

    if (user.role === "teacher") {
      // ⛔ Block deletion if this teacher still owns courses.
      // Deleting a teacher should NOT silently wipe their courses
      // and every enrolled student's progress in them.
      const courseCount = await Course.countDocuments({ teacher: user._id });
      if (courseCount > 0) {
        return res.status(400).json({
          message: `This teacher has ${courseCount} course(s). Please delete or reassign those courses before removing the teacher.`,
        });
      }
    }

    await user.deleteOne();

    // ✅ NOTIFY ALL ADMINS about user deletion
    await notifyUserDeleted(adminName, deletedUserName, deletedUserRole);

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




// Reassign a course to a different teacher
const reassignCourse = async (req, res) => {
  try {
    const { newTeacherId } = req.body;
    if (!newTeacherId) {
      return res.status(400).json({ message: "newTeacherId is required" });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const newTeacher = await User.findById(newTeacherId);
    if (!newTeacher || newTeacher.role !== "teacher") {
      return res.status(400).json({ message: "Invalid teacher selected" });
    }

    course.teacher = newTeacherId;
    await course.save();
    await course.populate("teacher", "fullName email");

    res.status(200).json({ message: "Course reassigned successfully", course });
  } catch (error) {
    console.error("Reassign course error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllStudents, getAllTeachers, deleteUser, getDashboardStats, reassignCourse };
