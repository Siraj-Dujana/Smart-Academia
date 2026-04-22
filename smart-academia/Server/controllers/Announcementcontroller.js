const Announcement = require("../models/Announcement");
const Course       = require("../models/Course");
const Enrollment   = require("../models/Enrollment");
const { notifyAnnouncement } = require("../utils/notificationHooks");

// TEACHER: Create announcement
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, courseId, priority, sendEmail } = req.body;  // ✅ Added sendEmail

    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    if (!content?.trim()) return res.status(400).json({ message: "Content is required" });
    if (!courseId) return res.status(400).json({ message: "Course is required" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your course" });

    const announcement = await Announcement.create({
      title:     title.trim(),
      content:   content.trim(),
      course:    courseId,
      createdBy: req.user._id,
      priority:  priority || "normal",
    });

    // ✅ Updated with email support
    await notifyAnnouncement({
      courseId,
      senderId: req.user._id,
      title: `📢 ${title}`,
      content,
      sendEmailNotif: sendEmail || false,  // ✅ Pass the checkbox value
    });

    // Attach extra fields for response
    const result = {
      ...announcement.toObject(),
      courseTitle:  course.title,
      authorName:   req.user.fullName,
      courseId:     courseId,
    };

    res.status(201).json({ message: "Announcement created", announcement: result });
  } catch (err) {
    console.error("createAnnouncement error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// TEACHER: Get all announcements for a course
const getAnnouncementsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your course" });

    const announcements = await Announcement.find({ course: courseId })
      .sort({ createdAt: -1 })
      .populate("createdBy", "fullName");

    const result = announcements.map(a => ({
      ...a.toObject(),
      courseTitle: course.title,
      authorName:  a.createdBy?.fullName || req.user.fullName,
      courseId:    courseId,
    }));

    res.status(200).json({ announcements: result });
  } catch (err) {
    console.error("getAnnouncementsByCourse error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// TEACHER: Get all announcements by this teacher (across all courses)
const getTeacherAnnouncements = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user._id });
    const courseIds = courses.map(c => c._id);
    const courseMap = {};
    courses.forEach(c => { courseMap[c._id.toString()] = c.title; });

    const announcements = await Announcement.find({ course: { $in: courseIds } })
      .sort({ createdAt: -1 })
      .populate("createdBy", "fullName");

    const result = announcements.map(a => ({
      ...a.toObject(),
      courseTitle: courseMap[a.course.toString()] || "Unknown",
      authorName:  a.createdBy?.fullName || req.user.fullName,
      courseId:    a.course.toString(),
    }));

    res.status(200).json({ announcements: result });
  } catch (err) {
    console.error("getTeacherAnnouncements error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// TEACHER: Update announcement
const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    if (announcement.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your announcement" });

    ["title", "content", "priority"].forEach(f => {
      if (req.body[f] !== undefined) announcement[f] = req.body[f];
    });
    await announcement.save();

    const course = await Course.findById(announcement.course);
    res.status(200).json({
      message: "Announcement updated",
      announcement: {
        ...announcement.toObject(),
        courseTitle: course?.title || "",
        authorName:  req.user.fullName,
        courseId:    announcement.course.toString(),
      },
    });
  } catch (err) {
    console.error("updateAnnouncement error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// TEACHER: Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    if (announcement.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your announcement" });

    await announcement.deleteOne();
    res.status(200).json({ message: "Announcement deleted" });
  } catch (err) {
    console.error("deleteAnnouncement error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// STUDENT: Get announcements for enrolled courses
const getStudentAnnouncements = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id });
    const courseIds = enrollments.map(e => e.course);

    const announcements = await Announcement.find({ course: { $in: courseIds } })
      .sort({ createdAt: -1 })
      .populate("course", "title")
      .populate("createdBy", "fullName");

    const result = announcements.map(a => ({
      ...a.toObject(),
      courseTitle: a.course?.title || "",
      authorName:  a.createdBy?.fullName || "Teacher",
      courseId:    a.course?._id?.toString(),
    }));

    res.status(200).json({ announcements: result });
  } catch (err) {
    console.error("getStudentAnnouncements error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncementsByCourse,
  getTeacherAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getStudentAnnouncements,
};