// utils/notificationHooks.js
// Drop-in helpers — call these from existing controllers to auto-create notifications

const { createNotification, broadcastToCourse } = require("../controllers/notificationController");

// ✅ Base URL for email links
const BASE_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ─── STUDENT: Course enrolled ────────────────────────────────
const notifyEnrollment = async ({ 
  studentId, courseId, courseTitle,
  sendEmailNotif = false, recipientEmail = null, recipientName = null 
}) => {
  try {
    await createNotification({
      recipient: studentId,
      type: "enrollment",
      title: `Enrolled in ${courseTitle}`,
      message: `You've successfully enrolled in "${courseTitle}". Start learning now!`,
      link: `${BASE_URL}/lessons/${courseId}`,
      courseId,
      priority: "normal",
      sendEmailNotif, recipientEmail, recipientName,
    });
  } catch (err) {
    console.error("notifyEnrollment error:", err.message);
  }
};

// ✅ NEW: STUDENT: Course unenrolled ─────────────────────────────
const notifyUnenrollment = async ({ 
  studentId, courseId, courseTitle,
  sendEmailNotif = false, recipientEmail = null, recipientName = null 
}) => {
  try {
    await createNotification({
      recipient: studentId,
      type: "system",
      title: `Unenrolled from ${courseTitle}`,
      message: `You have been unenrolled from "${courseTitle}". You can re-enroll anytime from the courses page.`,
      link: `${BASE_URL}/student/dashboard?tab=courses`,
      courseId,
      priority: "normal",
      sendEmailNotif, recipientEmail, recipientName,
    });
  } catch (err) {
    console.error("notifyUnenrollment error:", err.message);
  }
};

// ─── STUDENT: Lesson unlocked ────────────────────────────────
const notifyLessonUnlocked = async ({ 
  studentId, lessonTitle, courseId,
  sendEmailNotif = false, recipientEmail = null, recipientName = null 
}) => {
  try {
    await createNotification({
      recipient: studentId,
      type: "lesson_unlocked",
      title: "Next Lesson Unlocked! 🔓",
      message: `"${lessonTitle}" is now available. Keep up the great work!`,
      link: `${BASE_URL}/lessons/${courseId}`,
      courseId,
      priority: "normal",
      sendEmailNotif, recipientEmail, recipientName,
    });
  } catch (err) {
    console.error("notifyLessonUnlocked error:", err.message);
  }
};

// ─── STUDENT: Quiz passed ─────────────────────────────────────
const notifyQuizPassed = async ({ 
  studentId, quizTitle, score, courseId,
  sendEmailNotif = false, recipientEmail = null, recipientName = null 
}) => {
  try {
    await createNotification({
      recipient: studentId,
      type: "quiz_passed",
      title: `Quiz Passed! 🏆`,
      message: `Congratulations! You passed "${quizTitle}" with ${score}%.`,
      link: `${BASE_URL}/lessons/${courseId}`,
      courseId,
      priority: "normal",
      sendEmailNotif, recipientEmail, recipientName,
    });
  } catch (err) {
    console.error("notifyQuizPassed error:", err.message);
  }
};

// ─── STUDENT: Course completed ───────────────────────────────
const notifyCourseCompleted = async ({ 
  studentId, courseTitle, courseId,
  sendEmailNotif = false, recipientEmail = null, recipientName = null 
}) => {
  try {
    await createNotification({
      recipient: studentId,
      type: "course_completed",
      title: `Course Completed! 🎉`,
      message: `Amazing! You've completed "${courseTitle}". Well done!`,
      link: `${BASE_URL}/student/dashboard?tab=progress`,
      courseId,
      priority: "high",
      sendEmailNotif, recipientEmail, recipientName,
    });
  } catch (err) {
    console.error("notifyCourseCompleted error:", err.message);
  }
};

// ─── STUDENT: Lab graded ─────────────────────────────────────
const notifyLabGraded = async ({ 
  studentId, labTitle, marks, totalMarks, courseId,
  sendEmailNotif = false, recipientEmail = null, recipientName = null 
}) => {
  try {
    await createNotification({
      recipient: studentId,
      type: "lab_graded",
      title: "Lab Submission Graded 📊",
      message: `Your submission for "${labTitle}" has been graded: ${marks}/${totalMarks} marks.`,
      link: `${BASE_URL}/lessons/${courseId}`,
      courseId,
      priority: "high",
      sendEmailNotif, recipientEmail, recipientName,
    });
  } catch (err) {
    console.error("notifyLabGraded error:", err.message);
  }
};

// ─── STUDENT: Assignment graded ──────────────────────────────
const notifyAssignmentGraded = async ({ 
  studentId, assignmentTitle, marks, totalMarks, courseId,
  sendEmailNotif = false, recipientEmail = null, recipientName = null 
}) => {
  try {
    await createNotification({
      recipient: studentId,
      type: "assignment_graded",
      title: "Assignment Graded 📝",
      message: `"${assignmentTitle}" has been reviewed: ${marks}/${totalMarks} marks.`,
      link: `${BASE_URL}/student/dashboard?tab=dashboard`,
      courseId,
      priority: "high",
      sendEmailNotif, recipientEmail, recipientName,
    });
  } catch (err) {
    console.error("notifyAssignmentGraded error:", err.message);
  }
};

// ─── ALL STUDENTS: Course published ──────────────────────────
const notifyCoursePublished = async ({ courseId, courseTitle, sendEmailNotif = false }) => {
  try {
    await broadcastToCourse(courseId, {
      type: "course_published",
      title: `${courseTitle} is now available!`,
      message: `New content has been published in "${courseTitle}". Check it out now!`,
      link: `${BASE_URL}/lessons/${courseId}`,
      priority: "normal",
      sendEmailNotif,
    });
  } catch (err) {
    console.error("notifyCoursePublished error:", err.message);
  }
};

// ─── ALL STUDENTS: Announcement ──────────────────────────────
const notifyAnnouncement = async ({ courseId, senderId, title, content, sendEmailNotif = false }) => {
  try {
    await broadcastToCourse(courseId, {
      sender: senderId,
      type: "announcement",
      title,
      message: content,
      link: `${BASE_URL}/student/dashboard?tab=dashboard`,
      priority: "normal",
      sendEmailNotif,
    });
  } catch (err) {
    console.error("notifyAnnouncement error:", err.message);
  }
};

module.exports = {
  notifyEnrollment,
  notifyUnenrollment,  // ✅ NEW EXPORT
  notifyLessonUnlocked,
  notifyQuizPassed,
  notifyCourseCompleted,
  notifyLabGraded,
  notifyAssignmentGraded,
  notifyCoursePublished,
  notifyAnnouncement,
};