const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const LessonProgress = require("../models/LessonProgress");
const Enrollment = require("../models/Enrollment");

// =============================================
// TEACHER — Add lesson to a course
// =============================================
const createLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, format, content, videoUrl, duration, points } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Lesson title is required" });
    }

    // Get next order number
    const lastLesson = await Lesson.findOne({ course: course._id }).sort({ order: -1 });
    const order = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await Lesson.create({
      title: title.trim(),
      description: description || "",
      course: course._id,
      order,
      format: format || "text",
      content: content || "",
      videoUrl: videoUrl || null,
      duration: duration || "30 min",
      points: points || 100,
    });

    // Update total lessons count on course
    course.totalLessons += 1;
    await course.save();

    res.status(201).json({ message: "Lesson created successfully", lesson });
  } catch (error) {
    console.error("Create lesson error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// TEACHER — Update a lesson
// =============================================
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    if (lesson.course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, format, content, videoUrl, duration, points, isPublished } = req.body;

    if (title) lesson.title = title.trim();
    if (description !== undefined) lesson.description = description;
    if (format) lesson.format = format;
    if (content !== undefined) lesson.content = content;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (duration) lesson.duration = duration;
    if (points) lesson.points = points;
    if (typeof isPublished === "boolean") lesson.isPublished = isPublished;

    await lesson.save();

    res.status(200).json({ message: "Lesson updated successfully", lesson });
  } catch (error) {
    console.error("Update lesson error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// TEACHER — Delete a lesson
// =============================================
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    if (lesson.course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete lesson progress for all students
    await LessonProgress.deleteMany({ lesson: lesson._id });

    // Decrement lesson count on course
    await Course.findByIdAndUpdate(lesson.course._id, {
      $inc: { totalLessons: -1 },
    });

    await lesson.deleteOne();

    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Delete lesson error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// STUDENT — Get all lessons for a course
// =============================================
const getCourseLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({
      course: req.params.courseId,
      isPublished: true,
    }).sort({ order: 1 });

    // Get this student's progress for each lesson
    const progressRecords = await LessonProgress.find({
      student: req.user._id,
      course: req.params.courseId,
    });

    const progressMap = {};
    progressRecords.forEach((p) => {
      progressMap[p.lesson.toString()] = p.isCompleted;
    });

    // Add completed status and lock logic to each lesson
    const lessonsWithProgress = lessons.map((lesson, index) => {
      const isCompleted = progressMap[lesson._id.toString()] || false;

      // Lock lesson if previous lesson not completed
      let isLocked = false;
      if (index > 0) {
        const prevLesson = lessons[index - 1];
        isLocked = !progressMap[prevLesson._id.toString()];
      }

      return {
        ...lesson.toObject(),
        isCompleted,
        isLocked,
        progress: isCompleted ? 100 : 0,
      };
    });

    res.status(200).json({ lessons: lessonsWithProgress });
  } catch (error) {
    console.error("Get course lessons error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// STUDENT — Mark lesson as complete
// =============================================
const completeLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Check student is enrolled in this course
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course,
    });

    if (!enrollment) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }

    // Mark lesson as complete (upsert — create if not exists)
    await LessonProgress.findOneAndUpdate(
      { student: req.user._id, lesson: lesson._id },
      {
        student: req.user._id,
        lesson: lesson._id,
        course: lesson.course,
        isCompleted: true,
        completedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Recalculate course progress
    const totalLessons = await Lesson.countDocuments({
      course: lesson.course,
      isPublished: true,
    });

    const completedLessons = await LessonProgress.countDocuments({
      student: req.user._id,
      course: lesson.course,
      isCompleted: true,
    });

    const progress = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    // Update enrollment progress
    enrollment.progress = progress;
    enrollment.isCompleted = progress === 100;
    await enrollment.save();

    res.status(200).json({
      message: "Lesson marked as complete",
      progress,
    });
  } catch (error) {
    console.error("Complete lesson error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createLesson,
  updateLesson,
  deleteLesson,
  getCourseLessons,
  completeLesson,
};