const Assignment           = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Enrollment           = require("../models/Enrollment");
const cloudinary           = require("../config/cloudinary");
const { notifyAssignmentGraded } = require("../utils/notificationHooks");


// ── TEACHER: Create assignment ──────────────────────────────
const createAssignment = async (req, res) => {
  try {
    const { title, description, instructions, courseId, lessonId, dueDate, totalMarks } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    if (!courseId)      return res.status(400).json({ message: "Course is required" });

    const assignment = await Assignment.create({
      title: title.trim(),
      description:  description  || "",
      instructions: instructions || "",
      course:       courseId,
      lesson:       lessonId || null,
      createdBy:    req.user._id,
      dueDate:      dueDate  || null,
      totalMarks:   totalMarks || 100,
    });
    res.status(201).json({ message: "Assignment created", assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── TEACHER: Update assignment ──────────────────────────────
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    if (assignment.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your assignment" });

    ["title","description","instructions","dueDate","totalMarks","isPublished"].forEach(f => {
      if (req.body[f] !== undefined) assignment[f] = req.body[f];
    });
    await assignment.save();
    res.status(200).json({ message: "Assignment updated", assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── TEACHER: Delete assignment ──────────────────────────────
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    if (assignment.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your assignment" });

    await AssignmentSubmission.deleteMany({ assignment: assignment._id });
    await assignment.deleteOne();
    res.status(200).json({ message: "Assignment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── TEACHER: Get assignments for a course ───────────────────
const getTeacherAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      course: req.params.courseId,
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });
    res.status(200).json({ assignments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── TEACHER: Get all submissions for an assignment ──────────
const getSubmissions = async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({ assignment: req.params.id })
      .populate("student", "fullName email studentId")
      .sort({ submittedAt: -1 });
    res.status(200).json({ submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── TEACHER: Grade a submission ─────────────────────────────
const gradeSubmission = async (req, res) => {
  try {
    const { marksAwarded, feedback, status } = req.body;
    const submission = await AssignmentSubmission.findById(req.params.submissionId)
      .populate("assignment")
      .populate("student", "fullName email");  // ✅ ADDED: Populate student for email

    if (!submission) return res.status(404).json({ message: "Submission not found" });
    if (submission.assignment.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your assignment" });
    if (marksAwarded === undefined || marksAwarded === null)
      return res.status(400).json({ message: "Marks are required" });
    if (marksAwarded > submission.assignment.totalMarks)
      return res.status(400).json({ message: `Marks cannot exceed ${submission.assignment.totalMarks}` });

    submission.marksAwarded = marksAwarded;
    submission.feedback      = feedback   || "";
    submission.status        = status     || "approved";
    submission.reviewedAt    = new Date();
    submission.reviewedBy    = req.user._id;
    await submission.save();

    // ✅ Updated with email support
    await notifyAssignmentGraded({
      studentId: submission.student._id,
      assignmentTitle: submission.assignment.title,
      marks: marksAwarded,
      totalMarks: submission.assignment.totalMarks,
      courseId: submission.assignment.course,
      sendEmailNotif: true,                        // ✅ Send email
      recipientEmail: submission.student.email,    // ✅ Student's email
      recipientName: submission.student.fullName,  // ✅ Student's name
    });

    res.status(200).json({ message: "Submission graded", submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── STUDENT: Get assignments for enrolled course ────────────
const getStudentAssignments = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course:  req.params.courseId,
    });
    if (!enrollment) return res.status(403).json({ message: "Not enrolled" });

    const assignments = await Assignment.find({
      course:      req.params.courseId,
      isPublished: true,
    }).sort({ createdAt: -1 });

    // Attach student's own submission status to each assignment
    const submissions = await AssignmentSubmission.find({
      student: req.user._id,
      assignment: { $in: assignments.map(a => a._id) },
    });
    const subMap = {};
    submissions.forEach(s => { subMap[s.assignment.toString()] = s; });

    const result = assignments.map(a => ({
      ...a.toObject(),
      mySubmission: subMap[a._id.toString()] || null,
    }));

    res.status(200).json({ assignments: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── STUDENT: Submit assignment (text or file) ───────────────
const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment)        return res.status(404).json({ message: "Assignment not found" });
    if (!assignment.isPublished) return res.status(400).json({ message: "Assignment not available" });

    const { answerText } = req.body;
    let fileUrl  = null;
    let fileName = null;

    // Handle Cloudinary file upload if a file was attached
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder:        `smartacademia/assignments/${assignment._id}`,
        resource_type: "auto",
      });
      fileUrl  = result.secure_url;
      fileName = req.file.originalname;
    }

    if (!answerText?.trim() && !fileUrl)
      return res.status(400).json({ message: "Submit text or a file" });

    const submission = await AssignmentSubmission.findOneAndUpdate(
      { assignment: assignment._id, student: req.user._id },
      {
        $set: {
          answerText:  answerText?.trim() || "",
          fileUrl,
          fileName,
          submittedAt: new Date(),
          status:      "submitted",
          // Reset grading on resubmit
          marksAwarded: null,
          feedback:     null,
          reviewedAt:   null,
          reviewedBy:   null,
        },
        $setOnInsert: {
          assignment: assignment._id,
          course:     assignment.course,
          student:    req.user._id,
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Assignment submitted", submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── STUDENT: Get my submission ──────────────────────────────
const getMySubmission = async (req, res) => {
  try {
    const submission = await AssignmentSubmission.findOne({
      assignment: req.params.id,
      student:    req.user._id,
    });
    res.status(200).json({ submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAssignment, updateAssignment, deleteAssignment,
  getTeacherAssignments, getSubmissions, gradeSubmission,
  getStudentAssignments, submitAssignment, getMySubmission,
};