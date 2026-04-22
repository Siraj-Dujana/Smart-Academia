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

  // Optionally send email
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
// HELPER: Broadcast to all enrolled students in a course
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

  // Bulk insert
  const notifications = await Notification.insertMany(ops);

  // Send emails if requested
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
          You received this because you are enrolled in a SmartAcademia course.<br/>
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
// DELETE /api/notifications/clear-all — Delete all read notifications
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
// POST /api/notifications/send-announcement — Teacher sends announcement notif
// ─────────────────────────────────────────────────────────────
const sendAnnouncementNotification = async (req, res) => {
  try {
    const { courseId, title, content, priority = "normal", sendEmail: doSendEmail = false } = req.body;

    if (!courseId || !title || !content)
      return res.status(400).json({ message: "courseId, title, content required" });

    const Course = require("../models/Course");
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your course" });

    const notifications = await broadcastToCourse(
      courseId,
      {
        sender: req.user._id,
        type: "announcement",
        title,
        message: content,
        link: `/student/dashboard?tab=dashboard`,
        priority,
        sendEmailNotif: doSendEmail,
      },
      doSendEmail // populate user only if sending email
    );

    res.status(201).json({
      message: `Notifications sent to ${notifications.length} students`,
      count: notifications.length,
    });
  } catch (err) {
    console.error("sendAnnouncementNotification error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.sendAnnouncementNotification = sendAnnouncementNotification;

// ─────────────────────────────────────────────────────────────
// POST /api/notifications/deadline — Teacher sets deadline notification
// ─────────────────────────────────────────────────────────────
const sendDeadlineNotification = async (req, res) => {
  try {
    const {
      courseId, type, title, message, dueDate,
      quizId, labId, assignmentId,
      link, sendEmail: doSendEmail = false
    } = req.body;

    if (!courseId || !type || !title || !dueDate)
      return res.status(400).json({ message: "courseId, type, title, dueDate required" });

    const validTypes = ["quiz_deadline", "lab_deadline", "assignment_deadline"];
    if (!validTypes.includes(type))
      return res.status(400).json({ message: "Invalid deadline type" });

    const Course = require("../models/Course");
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your course" });

    const dueDateObj = new Date(dueDate);
    const formattedDate = dueDateObj.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const notifications = await broadcastToCourse(
      courseId,
      {
        sender: req.user._id,
        type,
        title,
        message: message || `Deadline: ${formattedDate}`,
        link: link || `/lessons/${courseId}`,
        quizId: quizId || null,
        labId: labId || null,
        assignmentId: assignmentId || null,
        dueDate: dueDateObj,
        priority: "high",
        sendEmailNotif: doSendEmail,
      },
      doSendEmail
    );

    res.status(201).json({
      message: `Deadline notifications sent to ${notifications.length} students`,
      count: notifications.length,
    });
  } catch (err) {
    console.error("sendDeadlineNotification error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.sendDeadlineNotification = sendDeadlineNotification;