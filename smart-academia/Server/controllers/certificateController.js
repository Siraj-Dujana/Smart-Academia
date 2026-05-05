const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────
// Generate Course Completion Certificate
// GET /api/certificates/generate/:courseId
// ─────────────────────────────────────────────────────────────
const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Check if user completed the course
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
      isCompleted: true,
    }).populate("course", "title code credits department");
    
    if (!enrollment) {
      return res.status(403).json({ message: "You haven't completed this course yet" });
    }
    
    const user = await User.findById(req.user._id);
    const course = enrollment.course;
    
    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([800, 600]);
    const { width, height } = page;
    
    // Add background color
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.95, 0.97, 1),
    });
    
    // Add border
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderColor: rgb(0.4, 0.2, 0.8),
      borderWidth: 3,
    });
    
    // Add title
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    page.drawText("CERTIFICATE OF COMPLETION", {
      x: width / 2 - 150,
      y: height - 80,
      size: 24,
      font,
      color: rgb(0.3, 0.1, 0.7),
    });
    
    // Add body text
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.drawText("This certificate is proudly presented to", {
      x: width / 2 - 150,
      y: height - 140,
      size: 14,
      font: normalFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    page.drawText(user.fullName, {
      x: width / 2 - 100,
      y: height - 180,
      size: 28,
      font,
      color: rgb(0.5, 0.2, 0.8),
    });
    
    page.drawText(`for successfully completing the course`, {
      x: width / 2 - 130,
      y: height - 230,
      size: 14,
      font: normalFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    page.drawText(course.title, {
      x: width / 2 - 100,
      y: height - 270,
      size: 22,
      font,
      color: rgb(0.3, 0.1, 0.7),
    });
    
    page.drawText(`Course Code: ${course.code}`, {
      x: width / 2 - 80,
      y: height - 320,
      size: 12,
      font: normalFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    page.drawText(`Department: ${course.department}`, {
      x: width / 2 - 80,
      y: height - 345,
      size: 12,
      font: normalFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    page.drawText(`Credits: ${course.credits}`, {
      x: width / 2 - 80,
      y: height - 370,
      size: 12,
      font: normalFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    // Add date
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    page.drawText(`Awarded on: ${date}`, {
      x: width / 2 - 80,
      y: height - 420,
      size: 10,
      font: normalFont,
      color: rgb(0.4, 0.4, 0.4),
    });
    
    // Add signature line
    page.drawLine({
      start: { x: width / 2 - 100, y: height - 470 },
      end: { x: width / 2 + 100, y: height - 470 },
      thickness: 1,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText("Instructor Signature", {
      x: width / 2 - 60,
      y: height - 485,
      size: 8,
      font: normalFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    // Save PDF to buffer
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `smartacademia/certificates/${courseId}`,
          public_id: `${user._id}_${courseId}`,
          resource_type: "raw",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });
    
    // Return PDF URL
    res.status(200).json({
      message: "Certificate generated successfully",
      certificateUrl: result.secure_url,
      certificateId: result.public_id,
    });
  } catch (err) {
    console.error("generateCertificate error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Get Certificate for a course
// GET /api/certificates/course/:courseId
// ─────────────────────────────────────────────────────────────
const getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
      isCompleted: true,
    });
    
    if (!enrollment) {
      return res.status(403).json({ 
        hasCertificate: false,
        message: "Complete the course to unlock your certificate" 
      });
    }
    
    // Check if certificate exists in Cloudinary
    const publicId = `smartacademia/certificates/${courseId}/${req.user._id}_${courseId}`;
    
    res.status(200).json({
      hasCertificate: true,
      courseId,
      canGenerate: true,
      message: "You have completed this course! Generate your certificate.",
    });
  } catch (err) {
    console.error("getCertificate error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// Get All Certificates for user
// GET /api/certificates/my-certificates
// ─────────────────────────────────────────────────────────────
const getMyCertificates = async (req, res) => {
  try {
    const completedEnrollments = await Enrollment.find({
      student: req.user._id,
      isCompleted: true,
    }).populate("course", "title code department credits");
    
    const certificates = completedEnrollments.map(enrollment => ({
      courseId: enrollment.course._id,
      courseTitle: enrollment.course.title,
      courseCode: enrollment.course.code,
      department: enrollment.course.department,
      credits: enrollment.course.credits,
      completedAt: enrollment.completedAt || enrollment.updatedAt,
      certificateUrl: null, // Will be generated on demand
    }));
    
    res.status(200).json({ certificates });
  } catch (err) {
    console.error("getMyCertificates error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  generateCertificate,
  getCertificate,
  getMyCertificates,
};