// utils/notificationHooks.js
// Central notification dispatcher — called from controllers after key events.
// All functions are fire-and-forget: they log errors but never throw.

const { createNotification, broadcastToCourse, broadcastToAdmins } = require("../controllers/notificationController");
const { sendEmail } = require("./sendEmail");

// ─────────────────────────────────────────────────────────────
// Helper: safe wrapper — never crashes the caller
// ─────────────────────────────────────────────────────────────
const safe = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    console.error(`[notificationHook] ${fn.name} error:`, err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// ENROLLMENT — student enrolls in a course
// ─────────────────────────────────────────────────────────────
const notifyEnrollment = safe(async ({
  studentId, courseId, courseTitle,
  sendEmailNotif = false, recipientEmail = null, recipientName = null,
}) => {
  // 1. Notify the student
  await createNotification({
    recipient: studentId,
    type: "enrollment",
    title: `Enrolled in ${courseTitle}`,
    message: `You have successfully enrolled in "${courseTitle}". Start your learning journey now!`,
    link: "/student/dashboard?tab=courses",
    courseId,
    priority: "normal",
    sendEmailNotif,
    recipientEmail,
    recipientName,
  });

  // 2. Notify admins
  await broadcastToAdmins({
    type: "student_registration",
    title: "New Course Enrollment",
    message: `${recipientName || "A student"} enrolled in "${courseTitle}".`,
    link: "/admin/dashboard?tab=courses",
    courseId,
    priority: "low",
    sendEmailNotif: false,
  });
});

// ─────────────────────────────────────────────────────────────
// UNENROLLMENT
// ─────────────────────────────────────────────────────────────
const notifyUnenrollment = safe(async ({
  studentId, courseId, courseTitle,
  sendEmailNotif = false, recipientEmail = null, recipientName = null,
}) => {
  await createNotification({
    recipient: studentId,
    type: "system",
    title: `Unenrolled from ${courseTitle}`,
    message: `You have been unenrolled from "${courseTitle}". You can re-enroll anytime.`,
    link: "/student/dashboard?tab=courses",
    courseId,
    priority: "low",
    sendEmailNotif,
    recipientEmail,
    recipientName,
  });
});

// ─────────────────────────────────────────────────────────────
// LESSON UNLOCKED — next lesson becomes available
// ─────────────────────────────────────────────────────────────
const notifyLessonUnlocked = safe(async ({
  studentId, lessonTitle, courseId,
  sendEmailNotif = false, recipientEmail = null, recipientName = null,
}) => {
  await createNotification({
    recipient: studentId,
    type: "lesson_unlocked",
    title: `New lesson unlocked: ${lessonTitle}`,
    message: `You have unlocked the next lesson: "${lessonTitle}". Keep up the great work!`,
    link: `/student/dashboard?tab=courses`,
    courseId,
    priority: "normal",
    sendEmailNotif,
    recipientEmail,
    recipientName,
  });
});

// ─────────────────────────────────────────────────────────────
// COURSE COMPLETED
// ─────────────────────────────────────────────────────────────
const notifyCourseCompleted = safe(async ({
  studentId, courseTitle, courseId,
  sendEmailNotif = true, recipientEmail = null, recipientName = null,
}) => {
  await createNotification({
    recipient: studentId,
    type: "course_completed",
    title: `🎓 Course Completed: ${courseTitle}`,
    message: `Congratulations! You have successfully completed "${courseTitle}". Outstanding achievement!`,
    link: "/student/dashboard?tab=progress",
    courseId,
    priority: "high",
    sendEmailNotif,
    recipientEmail,
    recipientName,
  });

  // Notify admins about course completion
  await broadcastToAdmins({
    type: "system",
    title: "Student Completed a Course",
    message: `${recipientName || "A student"} completed the course "${courseTitle}".`,
    link: "/admin/dashboard?tab=courses",
    courseId,
    priority: "low",
    sendEmailNotif: false,
  });
});

// ─────────────────────────────────────────────────────────────
// QUIZ PASSED
// ─────────────────────────────────────────────────────────────
const notifyQuizPassed = safe(async ({
  studentId, quizTitle, score, courseId,
  sendEmailNotif = false, recipientEmail = null, recipientName = null,
}) => {
  await createNotification({
    recipient: studentId,
    type: "quiz_passed",
    title: `🏆 Quiz Passed: ${quizTitle}`,
    message: `You passed the quiz "${quizTitle}" with a score of ${score}%. Great job!`,
    link: `/student/dashboard?tab=quizzes`,
    courseId,
    priority: "normal",
    sendEmailNotif,
    recipientEmail,
    recipientName,
  });
});

// ─────────────────────────────────────────────────────────────
// LAB GRADED
// ─────────────────────────────────────────────────────────────
const notifyLabGraded = safe(async ({
  studentId, labTitle, marks, totalMarks, courseId,
  sendEmailNotif = true, recipientEmail = null, recipientName = null,
}) => {
  const percent = totalMarks > 0 ? Math.round((marks / totalMarks) * 100) : 0;
  await createNotification({
    recipient: studentId,
    type: "lab_graded",
    title: `Lab Graded: ${labTitle}`,
    message: `Your lab "${labTitle}" has been graded. You scored ${marks}/${totalMarks} (${percent}%).`,
    link: `/student/dashboard?tab=labs`,
    courseId,
    priority: "normal",
    sendEmailNotif,
    recipientEmail,
    recipientName,
  });
});

// ─────────────────────────────────────────────────────────────
// ASSIGNMENT GRADED
// ─────────────────────────────────────────────────────────────
const notifyAssignmentGraded = safe(async ({
  studentId, assignmentTitle, marks, totalMarks, courseId,
  sendEmailNotif = true, recipientEmail = null, recipientName = null,
}) => {
  const percent = totalMarks > 0 ? Math.round((marks / totalMarks) * 100) : 0;
  await createNotification({
    recipient: studentId,
    type: "assignment_graded",
    title: `Assignment Graded: ${assignmentTitle}`,
    message: `Your assignment "${assignmentTitle}" has been graded. You scored ${marks}/${totalMarks} (${percent}%).`,
    link: `/student/dashboard?tab=dashboard`,
    courseId,
    priority: "normal",
    sendEmailNotif,
    recipientEmail,
    recipientName,
  });
});

// ─────────────────────────────────────────────────────────────
// ANNOUNCEMENT — teacher posts announcement to course
// ─────────────────────────────────────────────────────────────
const notifyAnnouncement = safe(async ({
  courseId, senderId, title, content,
  sendEmailNotif = false,
}) => {
  // Broadcast to all enrolled students
  await broadcastToCourse(
    courseId,
    {
      sender: senderId,
      type: "announcement",
      title,
      message: content,
      link: `/student/dashboard?tab=dashboard`,
      priority: "normal",
      sendEmailNotif,
    },
    sendEmailNotif  // populate users only if sending email
  );
});

// ─────────────────────────────────────────────────────────────
// COURSE CREATED — teacher creates a new course
// ─────────────────────────────────────────────────────────────
const notifyCourseCreated = safe(async ({
  teacherId, teacherName, courseId, courseTitle, courseCode,
}) => {
  // Notify admins
  await broadcastToAdmins({
    type: "course_creation",
    title: "📚 New Course Created",
    message: `${teacherName} created a new course: "${courseTitle}" (${courseCode}).`,
    link: "/admin/dashboard?tab=courses",
    courseId,
    priority: "normal",
    sendEmailNotif: false,
  });

  // Confirm to the teacher
  await createNotification({
    recipient: teacherId,
    type: "system",
    title: `Course Created: ${courseTitle}`,
    message: `Your course "${courseTitle}" (${courseCode}) has been created successfully. You can now add lessons, quizzes, and labs.`,
    link: "/teacher/dashboard?tab=courses",
    courseId,
    priority: "normal",
    sendEmailNotif: false,
  });
});

// ─────────────────────────────────────────────────────────────
// COURSE DELETED — teacher deletes a course
// ─────────────────────────────────────────────────────────────
const notifyCourseDeleted = safe(async ({
  teacherId, teacherName, courseId, courseTitle, courseCode,
}) => {
  // Notify admins
  await broadcastToAdmins({
    type: "course_deletion",
    title: "🗑️ Course Deleted",
    message: `${teacherName} deleted the course "${courseTitle}" (${courseCode}).`,
    link: "/admin/dashboard?tab=courses",
    priority: "high",
    sendEmailNotif: false,
  });

  // Confirm to the teacher
  await createNotification({
    recipient: teacherId,
    type: "system",
    title: `Course Deleted: ${courseTitle}`,
    message: `Your course "${courseTitle}" (${courseCode}) and all its content have been permanently deleted.`,
    link: "/teacher/dashboard?tab=courses",
    priority: "normal",
    sendEmailNotif: false,
  });
});

// ─────────────────────────────────────────────────────────────
// COURSE PUBLISHED / UNPUBLISHED
// ─────────────────────────────────────────────────────────────
const notifyCoursePublished = safe(async ({
  teacherId, teacherName, courseId, courseTitle, isPublished,
}) => {
  if (isPublished) {
    // Notify admins
    await broadcastToAdmins({
      type: "course_creation",
      title: "✅ Course Published",
      message: `${teacherName} published the course "${courseTitle}". Students can now enroll.`,
      link: "/admin/dashboard?tab=courses",
      courseId,
      priority: "normal",
      sendEmailNotif: false,
    });
  }

  // Notify teacher
  await createNotification({
    recipient: teacherId,
    type: "system",
    title: isPublished ? `Course Published: ${courseTitle}` : `Course Unpublished: ${courseTitle}`,
    message: isPublished
      ? `"${courseTitle}" is now live and visible to students.`
      : `"${courseTitle}" has been set to draft and is no longer visible to students.`,
    link: "/teacher/dashboard?tab=courses",
    courseId,
    priority: "normal",
    sendEmailNotif: false,
  });
});

// ─────────────────────────────────────────────────────────────
// STUDENT REGISTERED — notify admins
// ─────────────────────────────────────────────────────────────
const notifyStudentRegistered = safe(async ({ studentId, fullName, email }) => {
  await broadcastToAdmins({
    type: "student_registration",
    title: "👨‍🎓 New Student Registration",
    message: `${fullName} (${email}) has registered as a student.`,
    link: "/admin/dashboard?tab=students",
    priority: "normal",
    sendEmailNotif: false,
  });
});

// ─────────────────────────────────────────────────────────────
// TEACHER REGISTERED — notify admins
// ─────────────────────────────────────────────────────────────
const notifyTeacherRegistered = safe(async ({ teacherId, fullName, email }) => {
  await broadcastToAdmins({
    type: "teacher_registration",
    title: "👨‍🏫 New Teacher Registration",
    message: `${fullName} (${email}) has registered as a teacher.`,
    link: "/admin/dashboard?tab=teachers",
    priority: "high",
    sendEmailNotif: false,
  });
});

// ─────────────────────────────────────────────────────────────
// LESSON CREATED — notify teacher (confirmation)
// ─────────────────────────────────────────────────────────────
const notifyLessonCreated = safe(async ({
  teacherId, lessonTitle, courseTitle, courseId,
}) => {
  await createNotification({
    recipient: teacherId,
    type: "system",
    title: `Lesson Created: ${lessonTitle}`,
    message: `Your lesson "${lessonTitle}" has been added to "${courseTitle}".`,
    link: "/teacher/dashboard?tab=lessons",
    courseId,
    priority: "low",
    sendEmailNotif: false,
  });
});

// ─────────────────────────────────────────────────────────────
// QUIZ DEADLINE — teacher reminds students
// ─────────────────────────────────────────────────────────────
const notifyQuizDeadline = safe(async ({
  courseId, senderId, quizTitle, dueDate,
}) => {
  const dueDateObj = new Date(dueDate);
  await broadcastToCourse(courseId, {
    sender: senderId,
    type: "quiz_deadline",
    title: `⏰ Quiz Due: ${quizTitle}`,
    message: `Reminder: The quiz "${quizTitle}" is due on ${dueDateObj.toLocaleDateString()}. Make sure to complete it in time!`,
    link: `/student/dashboard?tab=quizzes`,
    priority: "high",
    dueDate: dueDateObj,
    sendEmailNotif: false,
  });
});

// ─────────────────────────────────────────────────────────────
// LAB DEADLINE
// ─────────────────────────────────────────────────────────────
const notifyLabDeadline = safe(async ({
  courseId, senderId, labTitle, dueDate,
}) => {
  const dueDateObj = new Date(dueDate);
  await broadcastToCourse(courseId, {
    sender: senderId,
    type: "lab_deadline",
    title: `🧪 Lab Due: ${labTitle}`,
    message: `Reminder: The lab "${labTitle}" is due on ${dueDateObj.toLocaleDateString()}. Submit before the deadline!`,
    link: `/student/dashboard?tab=labs`,
    priority: "high",
    dueDate: dueDateObj,
    sendEmailNotif: false,
  });
});

// ─────────────────────────────────────────────────────────────
// ASSIGNMENT DEADLINE
// ─────────────────────────────────────────────────────────────
const notifyAssignmentDeadline = safe(async ({
  courseId, senderId, assignmentTitle, dueDate,
}) => {
  const dueDateObj = new Date(dueDate);
  await broadcastToCourse(courseId, {
    sender: senderId,
    type: "assignment_deadline",
    title: `📝 Assignment Due: ${assignmentTitle}`,
    message: `Reminder: The assignment "${assignmentTitle}" is due on ${dueDateObj.toLocaleDateString()}. Don't miss the deadline!`,
    link: `/student/dashboard?tab=dashboard`,
    priority: "high",
    dueDate: dueDateObj,
    sendEmailNotif: false,
  });
});

// ─────────────────────────────────────────────────────────────
// USER DELETED BY ADMIN
// ─────────────────────────────────────────────────────────────
const notifyUserDeleted = safe(async ({ adminName, deletedUserName, deletedUserRole }) => {
  await broadcastToAdmins({
    type: "user_report",
    title: "👤 User Account Deleted",
    message: `Admin "${adminName}" deleted ${deletedUserRole} account: "${deletedUserName}".`,
    link: `/admin/dashboard?tab=${deletedUserRole === "teacher" ? "teachers" : "students"}`,
    priority: "high",
    sendEmailNotif: false,
  });
});

module.exports = {
  notifyEnrollment,
  notifyUnenrollment,
  notifyLessonUnlocked,
  notifyCourseCompleted,
  notifyQuizPassed,
  notifyLabGraded,
  notifyAssignmentGraded,
  notifyAnnouncement,
  notifyCourseCreated,
  notifyCourseDeleted,
  notifyCoursePublished,
  notifyStudentRegistered,
  notifyTeacherRegistered,
  notifyLessonCreated,
  notifyQuizDeadline,
  notifyLabDeadline,
  notifyAssignmentDeadline,
  notifyUserDeleted,
};