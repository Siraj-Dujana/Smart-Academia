const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");
const LessonProgress = require("../models/LessonProgress");

// =============================================
// TEACHER — Create a new course
// =============================================
const createCourse = async (req, res) => {
  try {
    const { title, description, code, department, credits, semester } = req.body;

    if (!title || !description || !code || !department) {
      return res.status(400).json({ message: "Title, description, code and department are required" });
    }

    // Check course code not already taken
    const codeExists = await Course.findOne({ code: code.toUpperCase().trim() });
    if (codeExists) {
      return res.status(400).json({ message: "Course code already exists" });
    }

    const course = await Course.create({
      title: title.trim(),
      description: description.trim(),
      code: code.toUpperCase().trim(),
      department: department.trim(),
      credits: credits || 3,
      semester: semester || "Fall 2024",
      teacher: req.user._id,
    });

    // Populate teacher info before returning
    await course.populate("teacher", "fullName email");

    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    console.error("Create course error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Course code already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// TEACHER — Get all courses created by this teacher
// =============================================
const getTeacherCourses = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user._id })
      .populate("teacher", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Get teacher courses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// TEACHER — Update a course
// =============================================
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Make sure only the teacher who created it can update
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this course" });
    }

    const { title, description, department, credits, semester, isPublished } = req.body;

    if (title) course.title = title.trim();
    if (description) course.description = description.trim();
    if (department) course.department = department.trim();
    if (credits) course.credits = credits;
    if (semester) course.semester = semester;
    if (typeof isPublished === "boolean") course.isPublished = isPublished;

    await course.save();
    await course.populate("teacher", "fullName email");

    res.status(200).json({ message: "Course updated successfully", course });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// TEACHER — Delete a course
// =============================================
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this course" });
    }

    // Delete all lessons, enrollments, and progress for this course
    await Lesson.deleteMany({ course: course._id });
    await Enrollment.deleteMany({ course: course._id });
    await LessonProgress.deleteMany({ course: course._id });
    await course.deleteOne();

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// STUDENT — Get all published courses (browse)
// =============================================
const getAllPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate("teacher", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Get published courses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// STUDENT — Get enrolled courses
// =============================================
const getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: "course",
        populate: { path: "teacher", select: "fullName email" },
      })
      .sort({ enrolledAt: -1 });

    const courses = enrollments.map((enrollment) => ({
      ...enrollment.course.toObject(),
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted,
      enrolledAt: enrollment.enrolledAt,
      enrollmentId: enrollment._id,
    }));

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Get enrolled courses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// STUDENT — Enroll in a course
// =============================================
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.isPublished) {
      return res.status(400).json({ message: "This course is not available for enrollment" });
    }

    // Check already enrolled
    const alreadyEnrolled = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
    });

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    await Enrollment.create({
      student: req.user._id,
      course: course._id,
    });

    // Increment enrolled count
    course.enrolledCount += 1;
    await course.save();

    res.status(201).json({ message: "Enrolled successfully" });
  } catch (error) {
    console.error("Enroll course error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// STUDENT — Unenroll from a course
// =============================================
const unenrollCourse = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.id,
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    await enrollment.deleteOne();

    // Decrement enrolled count
    await Course.findByIdAndUpdate(req.params.id, {
      $inc: { enrolledCount: -1 },
    });

    res.status(200).json({ message: "Unenrolled successfully" });
  } catch (error) {
    console.error("Unenroll error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// ADMIN — Get all courses
// =============================================
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("teacher", "fullName email department")
      .sort({ createdAt: -1 });

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Get all courses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// SHARED — Get single course details
// =============================================
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("teacher", "fullName email department specialization");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get lessons for this course
    const lessons = await Lesson.find({ course: course._id })
      .sort({ order: 1 });

    res.status(200).json({ course, lessons });
  } catch (error) {
    console.error("Get course by id error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCourse,
  getTeacherCourses,
  updateCourse,
  deleteCourse,
  getAllPublishedCourses,
  getEnrolledCourses,
  enrollCourse,
  unenrollCourse,
  getAllCourses,
  getCourseById,
};