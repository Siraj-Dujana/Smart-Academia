const Lesson         = require("../models/Lesson");
const LessonProgress = require("../models/LessonProgress");
const Enrollment     = require("../models/Enrollment");
const Course         = require("../models/Course");
const Quiz           = require("../models/Quiz");
const Lab            = require("../models/Lab");
const User           = require("../models/User");
const cloudinary     = require("../config/cloudinary");
const multer         = require("multer");
const path           = require("path");
const { notifyLessonUnlocked, notifyCourseCompleted } = require("../utils/notificationHooks");

// Multer setup for image/video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "/tmp"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|pdf/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});
module.exports.uploadMiddleware = upload.single("file");

// ── CORE: Unlock next lesson ─────────────────────────────────
const checkAndUnlockNext = async (studentId, lessonId, courseId) => {
  try {
    console.log("=== 🔓 checkAndUnlockNext START ===");
    console.log("studentId:", studentId);
    console.log("lessonId:", lessonId);
    console.log("courseId:", courseId);

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      console.log("❌ Lesson not found!");
      return;
    }
    console.log("Lesson title:", lesson.title);
    console.log("Lesson order:", lesson.order);
    console.log("Lesson requiresQuiz:", lesson.requiresQuiz);
    console.log("Lesson requiresLab:", lesson.requiresLab);

    const progress = await LessonProgress.findOne({ student: studentId, lesson: lessonId });
    if (!progress) {
      console.log("❌ Progress not found for this lesson!");
      return;
    }
    if (progress.isCompleted) {
      console.log("⚠️ Lesson already completed, skipping...");
      return;
    }

    const quizExists = !!(await Quiz.findOne({ lesson: lessonId, isPublished: true }));
    const labExists  = !!(await Lab.findOne({  lesson: lessonId, isPublished: true }));
    
    console.log("quizExists:", quizExists);
    console.log("labExists:", labExists);
    console.log("progress.lessonViewed:", progress.lessonViewed);
    console.log("progress.quizCompleted:", progress.quizCompleted);
    console.log("progress.labCompleted:", progress.labCompleted);

    const quizOk = !lesson.requiresQuiz || progress.quizCompleted || (lesson.requiresQuiz && !quizExists);
    const labOk  = !lesson.requiresLab  || progress.labCompleted  || (lesson.requiresLab  && !labExists);
    const viewOk = progress.lessonViewed;

    console.log("quizOk:", quizOk);
    console.log("labOk:", labOk);
    console.log("viewOk:", viewOk);

    if (viewOk && quizOk && labOk) {
      console.log("✅✅✅ Conditions met! Completing lesson...");
      
      progress.isCompleted = true;
      progress.completedAt = new Date();
      await progress.save();
      console.log("✅ Lesson marked as completed!");

      const nextLesson = await Lesson.findOne({
        course: courseId,
        order: lesson.order + 1,
        isPublished: true,
      });

      if (nextLesson) {
        console.log("📚 Next lesson found:", nextLesson.title);
        
        await LessonProgress.findOneAndUpdate(
          { student: studentId, lesson: nextLesson._id },
          {
            $setOnInsert: {
              student: studentId,
              lesson:  nextLesson._id,
              course:  courseId,
              lessonViewed:  false,
              quizCompleted: false,
              labCompleted:  false,
              isCompleted:   false,
            },
          },
          { upsert: true }
        );
        console.log("✅ Next lesson unlocked!");

        const student = await User.findById(studentId).select("fullName email");
        await notifyLessonUnlocked({
          studentId,
          lessonTitle: nextLesson.title,
          courseId,
          sendEmailNotif: false,
          recipientEmail: student?.email || null,
          recipientName: student?.fullName || null,
        });
      } else {
        console.log("⚠️ No next lesson found (this might be the last lesson)");
      }

      // Update overall course progress
      const totalLessons = await Lesson.countDocuments({ course: courseId, isPublished: true });
      const completedCount = await LessonProgress.countDocuments({
        student: studentId,
        course:  courseId,
        isCompleted: true,
      });
      const overallProgress = totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;

      console.log(`Course progress: ${completedCount}/${totalLessons} lessons completed (${overallProgress}%)`);

      await Enrollment.findOneAndUpdate(
        { student: studentId, course: courseId },
        { progress: overallProgress, isCompleted: overallProgress === 100 }
      );

      if (overallProgress === 100) {
        console.log("🎉 Course completed!");
        const course = await Course.findById(courseId);
        const student = await User.findById(studentId).select("fullName email");
        
        if (course && student) {
          await notifyCourseCompleted({
            studentId,
            courseTitle: course.title,
            courseId,
            sendEmailNotif: true,
            recipientEmail: student.email,
            recipientName: student.fullName,
          });
        }
      }
    } else {
      console.log("❌ Conditions NOT met for completion:");
      console.log("   - viewOk:", viewOk, "(needs true)");
      console.log("   - quizOk:", quizOk, "(needs true)");
      console.log("   - labOk:", labOk, "(needs true)");
    }
    console.log("=== 🔓 checkAndUnlockNext END ===");
  } catch (err) {
    console.error("checkAndUnlockNext error:", err.message);
    console.error(err.stack);
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

    const existingLessonsCount = await Lesson.countDocuments({ course: course._id });
    const MAX_LESSONS_PER_COURSE = 10;
    
    if (existingLessonsCount >= MAX_LESSONS_PER_COURSE) {
      return res.status(400).json({ 
        message: `You have reached the maximum limit of ${MAX_LESSONS_PER_COURSE} lessons per course. You cannot create more lessons.`,
        limitReached: true,
        currentLessons: existingLessonsCount,
        maxLessons: MAX_LESSONS_PER_COURSE
      });
    }

    const {
      title, description, format, content, videoUrl,
      images, duration, points, requiresQuiz, requiresLab,
      contentBlocks  // ✅ NEW: receive contentBlocks
    } = req.body;
    
    if (!title?.trim()) return res.status(400).json({ message: "Lesson title is required" });

    const last  = await Lesson.findOne({ course: course._id }).sort({ order: -1 });
    const order = last ? last.order + 1 : 1;

    const lesson = await Lesson.create({
      title:       title.trim(),
      description: description || "",
      course:      course._id,
      createdBy:   req.user._id,
      order,
      format:      format   || "text",
      content:     content  || "",
      videoUrl:    videoUrl || null,
      images:      images   || [],
      contentBlocks: contentBlocks || [],  // ✅ NEW: save contentBlocks
      duration:    duration || "30 min",
      points:      points   ?? 100,
      requiresQuiz: requiresQuiz !== undefined ? requiresQuiz : true,
      requiresLab:  requiresLab  !== undefined ? requiresLab  : true,
    });

    // In createLesson function, right after creating the lesson
      console.log("=== DEBUG: Creating lesson ===");
      console.log("Received contentBlocks:", JSON.stringify(contentBlocks, null, 2));
      console.log("Saved lesson contentBlocks:", lesson.contentBlocks);

    if (order === 1) {
      const enrollments = await Enrollment.find({ course: course._id });
      const ops = enrollments.map(en => ({
        updateOne: {
          filter: { student: en.student, lesson: lesson._id },
          update: {
            $setOnInsert: {
              student: en.student,
              lesson:  lesson._id,
              course:  course._id,
              lessonViewed:  false,
              quizCompleted: false,
              labCompleted:  false,
              isCompleted:   false,
            },
          },
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

// ── TEACHER: Get lesson limit info ──────────────────────────
const getLessonLimitInfo = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your course" });

    const existingLessonsCount = await Lesson.countDocuments({ course: course._id });
    const MAX_LESSONS_PER_COURSE = 20;
    
    res.status(200).json({
      currentLessons: existingLessonsCount,
      maxLessons: MAX_LESSONS_PER_COURSE,
      canCreateMore: existingLessonsCount < MAX_LESSONS_PER_COURSE,
      remainingSlots: Math.max(0, MAX_LESSONS_PER_COURSE - existingLessonsCount)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.getLessonLimitInfo = getLessonLimitInfo;


// ── TEACHER: Update lesson ──────────────────────────────────
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    if (lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lesson" });

    // Store old values
    const oldRequiresQuiz = lesson.requiresQuiz;
    const oldRequiresLab = lesson.requiresLab;
    const oldContentBlocks = JSON.stringify(lesson.contentBlocks);
    const oldContent = lesson.content;
    const oldVideoUrl = lesson.videoUrl;
    const oldImages = JSON.stringify(lesson.images);

    // Update all fields
    [
      "title","description","format","content","videoUrl","images",
      "duration","points","isPublished","requiresQuiz","requiresLab",
      "contentBlocks"
    ].forEach(f => { 
      if (req.body[f] !== undefined) lesson[f] = req.body[f]; 
    });

    await lesson.save();

    // Check for changes
    const contentChanged = 
      oldContentBlocks !== JSON.stringify(lesson.contentBlocks) ||
      oldContent !== lesson.content ||
      oldVideoUrl !== lesson.videoUrl ||
      oldImages !== JSON.stringify(lesson.images);
    
    const quizBecameRequired = oldRequiresQuiz === false && lesson.requiresQuiz === true;
    const labBecameRequired = oldRequiresLab === false && lesson.requiresLab === true;
    const requirementsBecameStricter = quizBecameRequired || labBecameRequired;

    // ✅ If requirements became stricter OR content changed, reset everything
    if (contentChanged || requirementsBecameStricter) {
      console.log("⚠️ Lesson changed! Resetting all student progress for this course...");
      
      // 1. Reset progress for THIS lesson
      await LessonProgress.updateMany(
        { lesson: lesson._id },
        { 
          $set: { 
            isCompleted: false,
            quizCompleted: false,
            labCompleted: false,
            lessonViewed: false
          }
        }
      );
      
      // 2. ✅ IMPORTANT: Lock ALL subsequent lessons (delete their progress records)
      const subsequentLessons = await Lesson.find({
        course: lesson.course,
        order: { $gt: lesson.order },
        isPublished: true
      }).select("_id");
      
      const subsequentLessonIds = subsequentLessons.map(l => l._id);
      
      if (subsequentLessonIds.length > 0) {
        // Delete progress for all subsequent lessons (this locks them)
        const deleteResult = await LessonProgress.deleteMany({
          student: { $in: await LessonProgress.distinct("student", { lesson: lesson._id }) },
          lesson: { $in: subsequentLessonIds }
        });
        console.log(`✅ Locked ${deleteResult.deletedCount} subsequent lesson progress records`);
      }
      
      // 3. Update overall course progress for all students
      const students = await LessonProgress.distinct("student", { course: lesson.course });
      
      for (const studentId of students) {
        const totalLessons = await Lesson.countDocuments({ course: lesson.course, isPublished: true });
        const completedCount = await LessonProgress.countDocuments({
          student: studentId,
          course: lesson.course,
          isCompleted: true,
        });
        const overallProgress = totalLessons > 0
          ? Math.round((completedCount / totalLessons) * 100)
          : 0;
        
        await Enrollment.findOneAndUpdate(
          { student: studentId, course: lesson.course },
          { progress: overallProgress, isCompleted: overallProgress === 100 }
        );
      }
      
      console.log("✅ Course progress recalculated");
    }

    res.status(200).json({ 
      message: "Lesson updated successfully", 
      lesson,
      progressReset: true
    });
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
    
    res.status(200).json({ 
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        format: lesson.format,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        images: lesson.images,
        contentBlocks: lesson.contentBlocks || [],  // ✅ NEW: send contentBlocks
        duration: lesson.duration,
        points: lesson.points,
        requiresQuiz: lesson.requiresQuiz,
        requiresLab: lesson.requiresLab,
        isPublished: lesson.isPublished,
      }, 
      quiz, 
      lab 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.getTeacherLessonById = getTeacherLessonById;

// ── STUDENT: Get lessons with lock status ───────────────────
const getStudentLessons = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course:  req.params.courseId,
    });
    if (!enrollment) return res.status(403).json({ message: "Not enrolled" });

    const lessons = await Lesson.find({
      course:      req.params.courseId,
      isPublished: true,
    }).sort({ order: 1 });

    const progressRecords = await LessonProgress.find({
      student: req.user._id,
      course:  req.params.courseId,
    });

    const progressMap = {};
    progressRecords.forEach(p => { progressMap[p.lesson.toString()] = p; });

    const result = lessons.map((lesson, index) => {
      const progress = progressMap[lesson._id.toString()];
      const isLocked = index === 0 ? false : !progress;

      return {
        _id:          lesson._id,
        title:        lesson.title,
        description:  lesson.description,
        order:        lesson.order,
        format:       lesson.format,
        duration:     lesson.duration,
        points:       lesson.points,
        requiresQuiz: lesson.requiresQuiz,
        requiresLab:  lesson.requiresLab,
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
    if (!lesson || !lesson.isPublished)
      return res.status(404).json({ message: "Lesson not found" });

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course:  lesson.course,
    });
    if (!enrollment) return res.status(403).json({ message: "Not enrolled" });

    if (lesson.order > 1) {
      const myProgress = await LessonProgress.findOne({
        student: req.user._id,
        lesson:  lesson._id,
      });
      if (!myProgress) {
        return res.status(403).json({ message: "Complete the previous lesson first" });
      }
    }

    const progress = await LessonProgress.findOneAndUpdate(
      { student: req.user._id, lesson: lesson._id },
      {
        $set:      { lessonViewed: true },
        $setOnInsert: {
          student: req.user._id,
          lesson:  lesson._id,
          course:  lesson.course,
          quizCompleted: false,
          labCompleted:  false,
          isCompleted:   false,
        },
      },
      { upsert: true, new: true }
    );

    const quiz = await Quiz.findOne({ lesson: lesson._id, isPublished: true });
    const lab  = await Lab.findOne({  lesson: lesson._id, isPublished: true });

    await checkAndUnlockNext(req.user._id, lesson._id, lesson.course);

    const updatedProgress = await LessonProgress.findOne({
      student: req.user._id,
      lesson:  lesson._id,
    });

    res.status(200).json({ 
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        format: lesson.format,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        images: lesson.images,
        contentBlocks: lesson.contentBlocks || [],  // ✅ NEW: send contentBlocks
        duration: lesson.duration,
        points: lesson.points,
        requiresQuiz: lesson.requiresQuiz,
        requiresLab: lesson.requiresLab,
      }, 
      progress: updatedProgress || progress, 
      quiz, 
      lab 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.getLessonContent = getLessonContent;

// ── STUDENT: Get course progress ────────────────────────────
const getCourseProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course:  req.params.courseId,
    });
    if (!enrollment) return res.status(403).json({ message: "Not enrolled" });

    const progressRecords = await LessonProgress.find({
      student: req.user._id,
      course:  req.params.courseId,
    }).populate("lesson", "title order duration");

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