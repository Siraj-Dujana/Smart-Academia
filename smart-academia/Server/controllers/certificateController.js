const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

// Helper for center alignment
const drawCenteredText = (page, text, y, size, font, color) => {
  const textWidth = font.widthOfTextAtSize(text, size);
  const x = (page.getWidth() - textWidth) / 2;
  page.drawText(text, { x, y, size, font, color });
};

// Smart Academia Theme Colors (matching your C palette)
const theme = {
  bg: rgb(0.03, 0.05, 0.1),        // #070d1a
  surface: rgb(0.06, 0.09, 0.16),  // #0f1629
  surface2: rgb(0.04, 0.06, 0.12), // #0a0f1e
  border: rgb(0.12, 0.16, 0.23),   // #1e293b
  accent: rgb(0.39, 0.4, 0.94),    // #6366f1
  accent2: rgb(0.66, 0.33, 0.97),  // #a855f7
  green: rgb(0.13, 0.77, 0.37),    // #22c55e
  amber: rgb(0.96, 0.62, 0.04),    // #f59e0b
  text: rgb(0.94, 0.96, 0.98),     // #f1f5f9
  textDim: rgb(0.58, 0.64, 0.72),  // #94a3b8
  textFaint: rgb(0.39, 0.45, 0.55), // #64748b
  indigoLight: rgb(0.51, 0.55, 0.97), // #818cf8
};

// Draw glow effect behind text
const drawGlow = (page, x, y, width, height, color) => {
  for (let i = 1; i <= 3; i++) {
    page.drawRectangle({
      x: x - i * 2,
      y: y - i * 2,
      width: width + i * 4,
      height: height + i * 4,
      color: color,
      opacity: 0.1 / i,
    });
  }
};

const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;

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
    const completionDate = new Date(enrollment.completedAt || enrollment.updatedAt);

    // PDF setup - Landscape A4
    const pdfDoc = await PDFDocument.create();
    const pageWidth = 842;
    const pageHeight = 595;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Dark theme background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: theme.bg,
    });

    // Gradient-like top bar
    page.drawRectangle({
      x: 0,
      y: pageHeight - 12,
      width: pageWidth,
      height: 12,
      color: theme.accent,
    });

    page.drawRectangle({
      x: 0,
      y: pageHeight - 8,
      width: pageWidth,
      height: 4,
      color: theme.accent2,
    });

    // Bottom accent
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: 4,
      color: theme.accent,
    });

    // Glowing border effect
    for (let i = 1; i <= 2; i++) {
      page.drawRectangle({
        x: 35 - i,
        y: 35 - i,
        width: pageWidth - 70 + i * 2,
        height: pageHeight - 70 + i * 2,
        borderColor: theme.accent,
        borderWidth: 1,
        opacity: 0.3 / i,
      });
    }

    // Main border
    page.drawRectangle({
      x: 35,
      y: 35,
      width: pageWidth - 70,
      height: pageHeight - 70,
      borderColor: theme.border,
      borderWidth: 2,
    });

    // Inner border with gradient effect
    page.drawRectangle({
      x: 45,
      y: 45,
      width: pageWidth - 90,
      height: pageHeight - 90,
      borderColor: theme.accent,
      borderWidth: 0.5,
      opacity: 0.5,
    });

    // Glow card effect in background
    page.drawRectangle({
      x: pageWidth / 2 - 150,
      y: pageHeight / 2 - 100,
      width: 300,
      height: 200,
      color: theme.accent,
      opacity: 0.03,
    });

    // ===== HEADER SECTION =====
    let currentY = pageHeight - 100;

    // Logo circle with glow
    const logoX = pageWidth / 2;
    const logoY = currentY+5;
    
    // Outer glow
    page.drawCircle({
      x: logoX,
      y: logoY,
      size: 42,
      color: theme.accent,
      opacity: 0.1,
    });
    
    page.drawCircle({
      x: logoX,
      y: logoY,
      size: 38,
      borderColor: theme.accent,
      borderWidth: 2,
    });
    
    page.drawCircle({
      x: logoX,
      y: logoY,
      size: 33,
      borderColor: theme.accent2,
      borderWidth: 1,
    });
    
    // SA Logo
    drawCenteredText(page, "SA", logoY - 8, 20, boldFont, theme.accent);
    currentY -= 70;

    // University Name with glow
    drawCenteredText(page, "SMART ACADEMIA", currentY, 30, boldFont, theme.text);
    currentY -= 23;

    // Tagline
    drawCenteredText(page, "Center for Academic Excellence", currentY, 13, normalFont, theme.textFaint);
    currentY -= 25;

    // Decorative line with gradient
    const lineY = currentY + 10;
    page.drawLine({
      start: { x: pageWidth / 2 - 200, y: lineY },
      end: { x: pageWidth / 2 + 200, y: lineY },
      thickness: 2,
      color: theme.accent,
    });

    // Small decorative dots
    for (let i = -2; i <= 2; i++) {
      page.drawCircle({
        x: pageWidth / 2 + i * 100,
        y: lineY,
        size: 2.5,
        color: theme.accent2,
      });
    }
    currentY -= 15;

    // ===== TITLE =====
    drawCenteredText(page, "CERTIFICATE OF COMPLETION", currentY, 26, boldFont, theme.accent);
    currentY -= 30;

    // ===== BODY =====
    drawCenteredText(page, "This is to certify that", currentY, 12, italicFont, theme.textDim);
    currentY -= 40;

    // Student Name with glow effect
    const nameWidth = boldFont.widthOfTextAtSize(user.fullName.toUpperCase(), 32);
    drawGlow(page, pageWidth / 2 - nameWidth / 2 - 100, currentY , nameWidth + 200, 25, theme.accent);
    drawCenteredText(page, user.fullName.toUpperCase(), currentY+3, 26, boldFont, theme.accent);
    currentY -= 20;

    drawCenteredText(page, "has successfully completed the course", currentY, 12, italicFont, theme.textDim);
    currentY -= 30;
    
    // Course Name
    drawCenteredText(page, course.title.toUpperCase(), currentY, 20, boldFont, theme.text);
    currentY -= 28;
    
   
const descriptionLines = [
  "This certificate recognizes the successful completion of all course requirements, including",
  "lessons, quizzes, and practical assessments. The recipient has demonstrated",
  "comprehensive understanding and mastery of the subject matter."
];

for (let i = 0; i < descriptionLines.length; i++) {
  drawCenteredText(page, descriptionLines[i], currentY - (i * 14), 13, normalFont, theme.textDim);
}
currentY -= 50;


    // Course Details
    drawCenteredText(page, `${course.code}  |  ${course.credits} Credits  |  ${course.department}`, currentY, 12, boldFont,theme.textFaint);
    currentY -= 45;

   // Date - Top Right corner
const formattedDate = completionDate.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

page.drawText(`Date: ${formattedDate}`, {
  x: pageWidth - 150,  // 180px from right edge
  y: pageHeight -60 ,   // 50px from top edge
  size: 10,
  font: boldFont,
  color: theme.textDim,
});

    // ===== SIGNATURES SECTION =====
    const sigY = 110;

    // Left Signature
    page.drawLine({
      start: { x: 100, y: sigY },
      end: { x: 320, y: sigY },
      thickness: 1,
      color: theme.border,
    });
    page.drawText("Instructor Signature", {
      x: 155,
      y: sigY - 15,
      size: 9,
      font: normalFont,
      color: theme.textFaint,
    });

    // Right Signature
    page.drawLine({
      start: { x: pageWidth - 320, y: sigY },
      end: { x: pageWidth - 100, y: sigY },
      thickness: 1,
      color: theme.border,
    });
    page.drawText("HOD's Signature", {
      x: pageWidth - 240,
      y: sigY - 15,
      size: 9,
      font: normalFont,
      color: theme.textFaint,
    });

    // Center Seal - Glow Card style
    page.drawCircle({
      x: pageWidth / 2,
      y: sigY + 5,
      size: 35,
      color: theme.accent,
      opacity: 0.1,
    });
    page.drawCircle({
      x: pageWidth / 2,
      y: sigY + 5,
      size: 30,
      borderColor: theme.accent2,
      borderWidth: 2,
    });
    page.drawCircle({
      x: pageWidth / 2,
      y: sigY + 5,
      size: 25,
      borderColor: theme.accent,
      borderWidth: 1,
    });
    
    drawCenteredText(page, "SA", sigY - 2, 14, boldFont, theme.accent);
    // ===== FOOTER =====
    // Certificate Number
    const certNumber = `SC-${course.code}-${user._id.toString().slice(-6)}-${Date.now().toString().slice(-4)}`;
    page.drawText(`Certificate No: ${certNumber}`, {
      x: pageWidth - 200,
      y: 60,
      size: 8,
      font: boldFont,
      color: theme.textFaint,
    });

    // Verification text
    page.drawText("Verify at: smartacademia.edu/verify", {
      x: 60,
      y: 60,
      size: 8,
      font: boldFont,
      color: theme.textFaint,
    });

    // Small QR-like decorative element
    page.drawRectangle({
      x: pageWidth - 80,
      y: 15,
      width: 25,
      height: 25,
      borderColor: theme.border,
      borderWidth: 1,
    });
    for (let i = 0; i < 3; i++) {
      page.drawRectangle({
        x: pageWidth - 76 + i * 8,
        y: 19 + i * 8,
        width: 3,
        height: 3,
        color: theme.accent,
        opacity: 0.5,
      });
    }

    // ===== SAVE PDF =====
    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Certificate_${course.code}_${user.fullName.replace(/\s/g, "_")}.pdf"`
    );

    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("generateCertificate error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// Keep the other functions (getCertificate, getMyCertificates) unchanged
const getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
      isCompleted: true,
    });

    if (!enrollment) {
      return res.status(200).json({
        available: false,
        message: "Complete this course to unlock your certificate",
        progress: 0,
      });
    }

    res.status(200).json({
      available: true,
      message: "Certificate available! Generate your certificate.",
      progress: enrollment.progress,
      completedAt: enrollment.completedAt || enrollment.updatedAt,
    });
  } catch (err) {
    console.error("getCertificate error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

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