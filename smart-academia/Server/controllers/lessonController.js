const Lesson         = require("../models/Lesson");
const LessonProgress = require("../models/LessonProgress");
const Enrollment     = require("../models/Enrollment");
const Course         = require("../models/Course");
const Quiz           = require("../models/Quiz");
const Lab            = require("../models/Lab");
const cloudinary     = require("../config/cloudinary");
const multer         = require("multer");
const path           = require("path");

// Multer setup for image/video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "/tmp"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|pdf/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});
module.exports.uploadMiddleware = upload.single("file");

// ── CORE: Unlock next lesson ────────────────────────────────
const checkAndUnlockNext = async (studentId, lessonId, courseId) => {
  try {
    const lesson   = await Lesson.findById(lessonId);
    if (!lesson)   return;
    const progress = await LessonProgress.findOne({ student: studentId, lesson: lessonId });
    if (!progress || progress.isCompleted) return;

    const quizOk = !lesson.requiresQuiz || progress.quizCompleted;
    const labOk  = !lesson.requiresLab  || progress.labCompleted;

    if (quizOk && labOk) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      await progress.save();

      const nextLesson = await Lesson.findOne({ course: courseId, order: lesson.order + 1, isPublished: true });
      if (nextLesson) {
        await LessonProgress.findOneAndUpdate(
          { student: studentId, lesson: nextLesson._id },
          { $setOnInsert: { student: studentId, lesson: nextLesson._id, course: courseId, lessonViewed: false, quizCompleted: false, labCompleted: false, isCompleted: false } },
          { upsert: true }
        );
      }

      const totalLessons   = await Lesson.countDocuments({ course: courseId, isPublished: true });
      const completedCount = await LessonProgress.countDocuments({ student: studentId, course: courseId, isCompleted: true });
      const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      await Enrollment.findOneAndUpdate(
        { student: studentId, course: courseId },
        { progress: overallProgress, isCompleted: overallProgress === 100 }
      );
    }
  } catch (err) {
    console.error("checkAndUnlockNext error:", err.message);
  }
};
module.exports.checkAndUnlockNext = checkAndUnlockNext;

// ── TEACHER: Upload image/video to Cloudinary ───────────────
const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const ext        = path.extname(req.file.originalname).toLowerCase();
    const isVideo    = [".mp4",".mov",".avi",".mkv"].includes(ext);
    const resourceType = isVideo ? "video" : "image";

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder:        "smartacademia/lessons",
      resource_type: resourceType,
    });

    res.status(200).json({
      url:          result.secure_url,
      publicId:     result.public_id,
      resourceType: result.resource_type,
      format:       result.format,
      bytes:        result.bytes,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};
module.exports.uploadFile = uploadFile;

// ── TEACHER: Create lesson ──────────────────────────────────
const createLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your course" });

    const { title, description, format, content, videoUrl, images, duration, points, requiresQuiz, requiresLab } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Lesson title is required" });

    const last  = await Lesson.findOne({ course: course._id }).sort({ order: -1 });
    const order = last ? last.order + 1 : 1;

    const lesson = await Lesson.create({
      title:       title.trim(),
      description: description || "",
      course:      course._id,
      createdBy:   req.user._id,
      order,
      format:      format  || "text",
      content:     content || "",
      videoUrl:    videoUrl || null,
      images:      images  || [],
      duration:    duration || "30 min",
      points:      points  ?? 100,
      requiresQuiz: requiresQuiz !== undefined ? requiresQuiz : true,
      requiresLab:  requiresLab  !== undefined ? requiresLab  : true,
    });

    if (order === 1) {
      const enrollments = await Enrollment.find({ course: course._id });
      const ops = enrollments.map(en => ({
        updateOne: {
          filter: { student: en.student, lesson: lesson._id },
          update: { $setOnInsert: { student: en.student, lesson: lesson._id, course: course._id } },
          upsert: true,
        },
      }));
      if (ops.length) await LessonProgress.bulkWrite(ops);
    }

    res.status(201).json({ message: "Lesson created", lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.createLesson = createLesson;

// ── TEACHER: Update lesson ──────────────────────────────────
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    if (lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lesson" });

    ["title","description","format","content","videoUrl","images","duration","points","isPublished","requiresQuiz","requiresLab"]
      .forEach(f => { if (req.body[f] !== undefined) lesson[f] = req.body[f]; });
    await lesson.save();
    res.status(200).json({ message: "Lesson updated", lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.updateLesson = updateLesson;

// ── TEACHER: Delete lesson ──────────────────────────────────
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    if (lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lesson" });

    await LessonProgress.deleteMany({ lesson: lesson._id });
    await lesson.deleteOne();
    res.status(200).json({ message: "Lesson deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.deleteLesson = deleteLesson;

// ── TEACHER: Get all lessons (full content) ─────────────────
const getTeacherLessons = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your course" });

    const lessons = await Lesson.find({ course: req.params.courseId }).sort({ order: 1 });
    res.status(200).json({ lessons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.getTeacherLessons = getTeacherLessons;

// ── TEACHER: Get single lesson with quiz+lab ────────────────
const getTeacherLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    if (lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lesson" });

    const quiz = await Quiz.findOne({ lesson: lesson._id });
    const lab  = await Lab.findOne({  lesson: lesson._id });
    res.status(200).json({ lesson, quiz, lab });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.getTeacherLessonById = getTeacherLessonById;

// ── STUDENT: Get lessons with lock status ───────────────────
const getStudentLessons = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
    if (!enrollment) return res.status(403).json({ message: "Not enrolled" });

    const lessons = await Lesson.find({ course: req.params.courseId, isPublished: true }).sort({ order: 1 });
    const progressRecords = await LessonProgress.find({ student: req.user._id, course: req.params.courseId });
    const progressMap = {};
    progressRecords.forEach(p => { progressMap[p.lesson.toString()] = p; });

    const result = lessons.map((lesson, index) => {
      const progress = progressMap[lesson._id.toString()];
      const isLocked = index === 0 ? false : !progress;
      return {
        _id: lesson._id, title: lesson.title, description: lesson.description,
        order: lesson.order, format: lesson.format, duration: lesson.duration,
        points: lesson.points, requiresQuiz: lesson.requiresQuiz, requiresLab: lesson.requiresLab,
        isLocked,
        isCompleted:   progress?.isCompleted   || false,
        lessonViewed:  progress?.lessonViewed  || false,
        quizCompleted: progress?.quizCompleted || false,
        labCompleted:  progress?.labCompleted  || false,
      };
    });
    res.status(200).json({ lessons: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.getStudentLessons = getStudentLessons;

// ── STUDENT: Get lesson content (marks viewed) ──────────────
const getLessonContent = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson || !lesson.isPublished) return res.status(404).json({ message: "Lesson not found" });

    const enrollment = await Enrollment.findOne({ student: req.user._id, course: lesson.course });
    if (!enrollment) return res.status(403).json({ message: "Not enrolled" });

    if (lesson.order > 1) {
      const myProgress = await LessonProgress.findOne({ student: req.user._id, lesson: lesson._id });
      if (!myProgress) return res.status(403).json({ message: "Complete the previous lesson first" });
    }

    const progress = await LessonProgress.findOneAndUpdate(
      { student: req.user._id, lesson: lesson._id },
      { $set: { lessonViewed: true }, $setOnInsert: { student: req.user._id, lesson: lesson._id, course: lesson.course } },
      { upsert: true, new: true }
    );

    const quiz = await Quiz.findOne({ lesson: lesson._id, isPublished: true });
    const lab  = await Lab.findOne({  lesson: lesson._id, isPublished: true });

    res.status(200).json({ lesson, progress, quiz, lab });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.getLessonContent = getLessonContent;

// ── STUDENT: Get course progress ────────────────────────────
const getCourseProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
    if (!enrollment) return res.status(403).json({ message: "Not enrolled" });

    const progressRecords = await LessonProgress.find({ student: req.user._id, course: req.params.courseId })
      .populate("lesson", "title order duration");

    res.status(200).json({
      progress:        progressRecords,
      overallProgress: enrollment.progress    || 0,
      isCompleted:     enrollment.isCompleted || false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.getCourseProgress = getCourseProgress;