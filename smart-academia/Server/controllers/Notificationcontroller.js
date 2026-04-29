// controllers/notificationController.js
const Notification = require("../models/Notification");
const Enrollment   = require("../models/Enrollment");
const { sendEmail } = require("../utils/sendEmail");

// ─────────────────────────────────────────────────────────────
// HELPER: Create a single notification
// ─────────────────────────────────────────────────────────────
const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = null,
  courseId = null,
  lessonId = null,
  quizId = null,
  labId = null,
  assignmentId = null,
  priority = "normal",
  dueDate = null,
  sendEmailNotif = false,
  recipientEmail = null,
  recipientName = null,
}) => {
  const notification = await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    link,
    courseId,
    lessonId,
    quizId,
    labId,
    assignmentId,
    priority,
    dueDate,
    isEmailSent: false,
  });

  if (sendEmailNotif && recipientEmail) {
    try {
      await sendEmail({
        to: recipientEmail,
        subject: `SmartAcademia — ${title}`,
        html: notificationEmailTemplate({ recipientName, title, message, link, type }),
      });
      notification.isEmailSent = true;
      await notification.save();
    } catch (err) {
      console.error("Email send error:", err.message);
    }
  }

  return notification;
};
module.exports.createNotification = createNotification;

// ─────────────────────────────────────────────────────────────
// HELPER: Broadcast to all admins
// ─────────────────────────────────────────────────────────────
const broadcastToAdmins = async (notifData) => {
  const User = require("../models/User");
  const admins = await User.find({ role: "admin" }).select("_id email fullName");
  
  const ops = admins.map((admin) => ({
    recipient: admin._id,
    ...notifData,
  }));

  if (ops.length === 0) return [];

  const notifications = await Notification.insertMany(ops);

  // Send emails to admins
  if (notifData.sendEmailNotif) {
    for (const admin of admins) {
      if (admin.email) {
        try {
          await sendEmail({
            to: admin.email,
            subject: `SmartAcademia — ${notifData.title}`,
            html: notificationEmailTemplate({
              recipientName: admin.fullName,
              title: notifData.title,
              message: notifData.message,
              link: notifData.link,
              type: notifData.type,
            }),
          });
        } catch (err) {
          console.error("Admin broadcast email error:", err.message);
        }
      }
    }
  }

  return notifications;
};
module.exports.broadcastToAdmins = broadcastToAdmins;

// ─────────────────────────────────────────────────────────────
// HELPER: Broadcast to a specific teacher
// ─────────────────────────────────────────────────────────────
const broadcastToTeacher = async (teacherId, notifData) => {
  const notification = await createNotification({
    recipient: teacherId,
    ...notifData,
  });
  return notification;
};
module.exports.broadcastToTeacher = broadcastToTeacher;

// ─────────────────────────────────────────────────────────────
// HELPER: Broadcast to all students in a course
// ─────────────────────────────────────────────────────────────
const broadcastToCourse = async (courseId, notifData, populateUser = false) => {
  const enrollments = await Enrollment.find({ course: courseId })
    .populate(populateUser ? "student" : "");
  
  const ops = enrollments.map((en) => ({
    recipient: en.student._id || en.student,
    ...notifData,
    courseId,
  }));

  if (ops.length === 0) return [];

  const notifications = await Notification.insertMany(ops);

  if (notifData.sendEmailNotif && populateUser) {
    for (const en of enrollments) {
      if (en.student?.email) {
        try {
          await sendEmail({
            to: en.student.email,
            subject: `SmartAcademia — ${notifData.title}`,
            html: notificationEmailTemplate({
              recipientName: en.student.fullName,
              title: notifData.title,
              message: notifData.message,
              link: notifData.link,
              type: notifData.type,
            }),
          });
        } catch (err) {
          console.error("Broadcast email error:", err.message);
        }
      }
    }
  }

  return notifications;
};
module.exports.broadcastToCourse = broadcastToCourse;

// ─────────────────────────────────────────────────────────────
// EMAIL TEMPLATE
// ─────────────────────────────────────────────────────────────
const notificationEmailTemplate = ({ recipientName, title, message, link, type }) => {
  const iconMap = {
    quiz_deadline: "⏰",
    lab_deadline: "🧪",
    assignment_deadline: "📝",
    announcement: "📢",
    course_published: "🎓",
    enrollment: "✅",
    grade_posted: "📊",
    lab_graded: "🧪",
    assignment_graded: "📝",
    lesson_unlocked: "🔓",
    quiz_passed: "🏆",
    course_completed: "🎉",
    // Admin types
    teacher_registration: "👨‍🏫",
    student_registration: "👨‍🎓",
    course_creation: "📚",
    course_deletion: "🗑️",
    user_report: "🚩",
    system_alert: "⚠️",
    backup_completed: "💾",
    maintenance: "🔧",
    system: "ℹ️",
  };
  const icon = iconMap[type] || "🔔";

  return `
    <div style="font-family: 'Lexend', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
      <div style="background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 32px 24px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; font-size: 28px; margin: 0; letter-spacing: -0.5px;">SmartAcademia</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Your Learning Platform</p>
      </div>
      <div style="background: white; padding: 32px 24px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">${icon}</div>
        <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 12px 0; text-align: center;">${title}</h2>
        ${recipientName ? `<p style="color: #64748b; margin: 0 0 16px 0;">Hi <strong>${recipientName}</strong>,</p>` : ""}
        <p style="color: #334155; line-height: 1.6; margin: 0 0 24px 0;">${message}</p>
        ${link ? `
          <div style="text-align: center; margin: 24px 0;">
            <a href="${link}" style="background: linear-gradient(135deg, #4f46e5, #3b82f6); color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">View Now →</a>
          </div>
        ` : ""}
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
          You received this because you are part of SmartAcademia.<br/>
          Manage your notification preferences in your dashboard settings.
        </p>
      </div>
    </div>
  `;
};
module.exports.notificationEmailTemplate = notificationEmailTemplate;

// ─────────────────────────────────────────────────────────────
// GET /api/notifications — Get user's notifications
// ─────────────────────────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { recipient: req.user._id };
    if (unreadOnly === "true") filter.isRead = false;
    if (type) filter.type = type;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate("sender", "fullName avatar role")
        .populate("courseId", "title code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    res.status(200).json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + notifications.length < total,
      },
    });
  } catch (err) {
    console.error("getNotifications error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.getNotifications = getNotifications;

// ─────────────────────────────────────────────────────────────
// GET /api/notifications/unread-count
// ─────────────────────────────────────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.getUnreadCount = getUnreadCount;

// ─────────────────────────────────────────────────────────────
// PUT /api/notifications/:id/read — Mark single as read
// ─────────────────────────────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ notification: notif });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.markAsRead = markAsRead;

// ─────────────────────────────────────────────────────────────
// PUT /api/notifications/read-all — Mark all as read
// ─────────────────────────────────────────────────────────────
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.markAllAsRead = markAllAsRead;

// ─────────────────────────────────────────────────────────────
// DELETE /api/notifications/:id — Delete single notification
// ─────────────────────────────────────────────────────────────
const deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.deleteNotification = deleteNotification;

// ─────────────────────────────────────────────────────────────
// DELETE /api/notifications/clear-read — Delete all read notifications
// ─────────────────────────────────────────────────────────────
const clearAllRead = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id, isRead: true });
    res.status(200).json({ message: "Read notifications cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.clearAllRead = clearAllRead;

// ─────────────────────────────────────────────────────────────
// ──────────────── ADMIN NOTIFICATION ENDPOINTS ────────────────
// ─────────────────────────────────────────────────────────────

// GET /api/admin/notifications — Get admin notifications
const getAdminNotifications = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { page = 1, limit = 20, unreadOnly = false, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { recipient: req.user._id };
    if (unreadOnly === "true") filter.isRead = false;
    if (type) filter.type = type;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate("sender", "fullName avatar role")
        .populate("courseId", "title code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    res.status(200).json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + notifications.length < total,
      },
    });
  } catch (err) {
    console.error("getAdminNotifications error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.getAdminNotifications = getAdminNotifications;

// PUT /api/admin/notifications/:id/read — Admin mark as read
const markAdminAsRead = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ notification: notif });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.markAdminAsRead = markAdminAsRead;

// PUT /api/admin/notifications/read-all — Admin mark all as read
const markAdminAllAsRead = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.markAdminAllAsRead = markAdminAllAsRead;

// DELETE /api/admin/notifications/clear-read — Admin clear read notifications
const clearAdminRead = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    await Notification.deleteMany({ recipient: req.user._id, isRead: true });
    res.status(200).json({ message: "Read notifications cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.clearAdminRead = clearAdminRead;

// DELETE /api/admin/notifications/:id — Admin delete notification
const deleteAdminNotification = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const notif = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.deleteAdminNotification = deleteAdminNotification;

// ─────────────────────────────────────────────────────────────
// POST /api/admin/notifications/broadcast — Admin broadcast to all users
// ─────────────────────────────────────────────────────────────
const adminBroadcast = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { title, message, type = "announcement", priority = "normal", sendEmail = false, target = "all" } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const User = require("../models/User");
    let users = [];

    if (target === "all") {
      users = await User.find({}).select("_id email fullName role");
    } else if (target === "students") {
      users = await User.find({ role: "student" }).select("_id email fullName role");
    } else if (target === "teachers") {
      users = await User.find({ role: "teacher" }).select("_id email fullName role");
    } else {
      return res.status(400).json({ message: "Invalid target. Use: all, students, teachers" });
    }

    const ops = users.map((user) => ({
      recipient: user._id,
      sender: req.user._id,
      type,
      title,
      message,
      link: "/admin/dashboard?tab=notifications",
      priority,
      isEmailSent: false,
    }));

    const notifications = await Notification.insertMany(ops);

    if (sendEmail) {
      for (const user of users) {
        if (user.email) {
          try {
            await sendEmail({
              to: user.email,
              subject: `SmartAcademia — ${title}`,
              html: notificationEmailTemplate({
                recipientName: user.fullName,
                title,
                message,
                link: "/admin/dashboard?tab=notifications",
                type,
              }),
            });
          } catch (err) {
            console.error(`Email error for ${user.email}:`, err.message);
          }
        }
      }
      await Notification.updateMany(
        { _id: { $in: notifications.map(n => n._id) } },
        { isEmailSent: true }
      );
    }

    res.status(201).json({
      message: `Broadcast sent to ${notifications.length} users`,
      count: notifications.length,
    });
  } catch (err) {
    console.error("adminBroadcast error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.adminBroadcast = adminBroadcast;

// ─────────────────────────────────────────────────────────────
// POST /api/admin/notifications/teacher-registration — Notify admins when teacher registers
// ─────────────────────────────────────────────────────────────
const notifyTeacherRegistration = async (teacherData) => {
  return await broadcastToAdmins({
    type: "teacher_registration",
    title: "New Teacher Registration",
    message: `${teacherData.fullName} (${teacherData.email}) has registered as a teacher. Please review their account.`,
    link: "/admin/dashboard?tab=teachers",
    priority: "high",
    sendEmailNotif: true,
  });
};
module.exports.notifyTeacherRegistration = notifyTeacherRegistration;

// ─────────────────────────────────────────────────────────────
// POST /api/admin/notifications/student-registration — Notify admins when student registers
// ─────────────────────────────────────────────────────────────
const notifyStudentRegistration = async (studentData) => {
  return await broadcastToAdmins({
    type: "student_registration",
    title: "New Student Registration",
    message: `${studentData.fullName} (${studentData.email}) has registered as a student.`,
    link: "/admin/dashboard?tab=students",
    priority: "normal",
    sendEmailNotif: false,
  });
};
module.exports.notifyStudentRegistration = notifyStudentRegistration;

// ─────────────────────────────────────────────────────────────
// POST /api/admin/notifications/course-creation — Notify admins when course is created
// ─────────────────────────────────────────────────────────────
const notifyCourseCreation = async (courseData, teacherName) => {
  return await broadcastToAdmins({
    type: "course_creation",
    title: "New Course Created",
    message: `${teacherName} created a new course: "${courseData.title}" (${courseData.code})`,
    link: `/admin/dashboard?tab=courses`,
    courseId: courseData._id,
    priority: "normal",
    sendEmailNotif: false,
  });
};
module.exports.notifyCourseCreation = notifyCourseCreation;

// ─────────────────────────────────────────────────────────────
// POST /api/admin/notifications/course-deletion — Notify admins when course is deleted
// ─────────────────────────────────────────────────────────────
const notifyCourseDeletion = async (courseData, teacherName) => {
  return await broadcastToAdmins({
    type: "course_deletion",
    title: "Course Deleted",
    message: `${teacherName} deleted the course: "${courseData.title}" (${courseData.code})`,
    link: "/admin/dashboard?tab=courses",
    priority: "high",
    sendEmailNotif: false,
  });
};
module.exports.notifyCourseDeletion = notifyCourseDeletion;

// ─────────────────────────────────────────────────────────────
// POST /api/admin/notifications/system-alert — System alert to admins
// ─────────────────────────────────────────────────────────────
const sendSystemAlert = async (alertData) => {
  return await broadcastToAdmins({
    type: "system_alert",
    title: alertData.title || "System Alert",
    message: alertData.message,
    link: alertData.link || "/admin/dashboard",
    priority: "urgent",
    sendEmailNotif: true,
  });
};
module.exports.sendSystemAlert = sendSystemAlert;

// ─────────────────────────────────────────────────────────────
// POST /api/courses/:id/notify-teacher — Notify teacher about course assignment
// ─────────────────────────────────────────────────────────────
const notifyTeacherAssignment = async (teacherId, courseData, adminName) => {
  return await broadcastToTeacher(teacherId, {
    type: "announcement",
    title: "Course Assigned to You",
    message: `${adminName} has assigned you as the instructor for "${courseData.title}" (${courseData.code}).`,
    link: `/teacher/dashboard?tab=courses`,
    courseId: courseData._id,
    priority: "high",
    sendEmailNotif: true,
  });
};
module.exports.notifyTeacherAssignment = notifyTeacherAssignment;

// ─────────────────────────────────────────────────────────────
// Existing endpoints for students/teachers (unchanged)
// ─────────────────────────────────────────────────────────────
const sendAnnouncementNotification = async (req, res) => {
  // ... existing code
};
module.exports.sendAnnouncementNotification = sendAnnouncementNotification;

const sendDeadlineNotification = async (req, res) => {
  // ... existing code
};
module.exports.sendDeadlineNotification = sendDeadlineNotification;