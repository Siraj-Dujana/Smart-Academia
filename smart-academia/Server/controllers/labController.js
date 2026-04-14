// controllers/labController.js
const Lab            = require("../models/Lab");
const LabSubmission  = require("../models/LabSubmission");
const LessonProgress = require("../models/LessonProgress");
const Lesson         = require("../models/Lesson");
const cloudinary     = require("../config/cloudinary");
const { checkAndUnlockNext } = require("./lessonController");
const { GoogleGenAI } = require("@google/genai");

// ─────────────────────────────────────────────────────────────
// TEACHER: Create Lab manually
// POST /api/courses/:courseId/lessons/:lessonId/lab
// Body: { title, description, outputExample, difficulty, labType,
//         instructions, starterCode, language, testCases,
//         totalMarks, dueDate, isPublished }
// ─────────────────────────────────────────────────────────────
const createLab = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const {
      title, description, outputExample, difficulty,
      labType, instructions, starterCode, language,
      testCases, totalMarks, dueDate, isPublished,
    } = req.body;

    if (!title?.trim())
      return res.status(400).json({ message: "Lab title is required" });

    const lesson = await Lesson.findById(lessonId).populate("course");
    if (!lesson)
      return res.status(404).json({ message: "Lesson not found" });
    if (lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lesson" });

    // One lab per lesson — replace if exists
    await Lab.deleteOne({ lesson: lessonId });

    const lab = await Lab.create({
      title:         title.trim(),
      description:   description   || "",
      outputExample: outputExample || "",
      difficulty:    difficulty    || "medium",
      lesson:        lessonId,
      course:        lesson.course._id,
      createdBy:     req.user._id,
      labType:       labType       || "theory",
      instructions:  instructions  || "",
      starterCode:   starterCode   || "",
      language:      language      || "python",
      testCases:     testCases     || [],
      totalMarks:    totalMarks    || 100,
      dueDate:       dueDate       || null,
      isPublished:   isPublished !== undefined ? isPublished : true,
      aiGenerated:   false,
    });

    res.status(201).json({ message: "Lab created successfully", lab });
  } catch (err) {
    console.error("createLab error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: AI Generate Lab
// POST /api/courses/:courseId/lessons/:lessonId/lab/ai-generate
// Body: { topic, difficulty, labType }
// Returns: { title, description, outputExample, difficulty }
// ─────────────────────────────────────────────────────────────
const aiGenerateLab = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { topic, difficulty, labType } = req.body;

    if (!topic?.trim())
      return res.status(400).json({ message: "Topic is required" });

    if (!process.env.GEMINI_API_KEY)
      return res.status(400).json({ message: "GEMINI_API_KEY not set in .env" });

    const lesson = await Lesson.findById(lessonId).populate("course");
    if (!lesson)
      return res.status(404).json({ message: "Lesson not found" });
    if (lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lesson" });

    const diff = difficulty || "medium";
    const type = labType    || "theory";

    // @google/genai — gemini-2.5-flash-lite
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are a university lab assignment creator for computer science students.

Create a lab assignment for the topic: "${topic}"
Difficulty level: ${diff}
Lab type: ${type}

Return ONLY a valid JSON object. No markdown, no explanation, no code blocks. Just raw JSON.

{
  "title": "concise descriptive lab title",
  "description": "2-3 sentences explaining what the lab covers and what students will practice",
  "instructions": "detailed numbered steps — at least 4 steps — explaining exactly what to do",
  "outputExample": "the exact expected output or result a correct solution should produce",
  "starterCode": "starter code template if programming lab, empty string otherwise"
}`;

    const response = await ai.models.generateContent({
      model:    "gemini-2.5-flash-lite",
      contents: prompt,
    });

    // Extract text from response
    let text = response.text;
    if (!text)
      return res.status(500).json({ message: "AI returned empty response. Try again." });

    text = text.trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let generated;
    try {
      generated = JSON.parse(text);
    } catch {
      console.error("AI JSON parse failed. Raw text:", text.substring(0, 300));
      return res.status(500).json({ message: "AI returned invalid format. Try again." });
    }

    if (!generated.title?.trim() || !generated.description?.trim())
      return res.status(500).json({ message: "AI response incomplete. Try again." });

    // Save — replace any existing lab for this lesson
    await Lab.deleteOne({ lesson: lessonId });

    const lab = await Lab.create({
      title:         generated.title.trim(),
      description:   generated.description.trim(),
      outputExample: generated.outputExample || "",
      difficulty:    diff,
      lesson:        lessonId,
      course:        lesson.course._id,
      createdBy:     req.user._id,
      labType:       type,
      instructions:  generated.instructions  || "",
      starterCode:   generated.starterCode   || "",
      language:      "python",
      testCases:     [],
      totalMarks:    100,
      isPublished:   true,
      aiGenerated:   true,
    });

    res.status(201).json({
      message: `Lab generated: "${lab.title}"`,
      lab,
    });
  } catch (err) {
    console.error("aiGenerateLab error:", err.message);
    res.status(500).json({ message: "AI generation failed: " + err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: AI Explain Lab (Lab Assistant)
// POST /api/courses/:courseId/lessons/:lessonId/lab/:labId/explain
// Returns: { steps, concepts, tips }
// ─────────────────────────────────────────────────────────────
const aiExplainLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.labId)
      .populate({ path: "lesson", populate: { path: "course" } });

    if (!lab) return res.status(404).json({ message: "Lab not found" });
    if (lab.lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lab" });

    if (!process.env.GEMINI_API_KEY)
      return res.status(400).json({ message: "GEMINI_API_KEY not set in .env" });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are a helpful teaching assistant.

Explain the following lab assignment in simple steps for students:

Lab Title: ${lab.title}
Description: ${lab.description}
Instructions: ${lab.instructions}
Expected Output: ${lab.outputExample}

Return ONLY valid JSON. No markdown, no explanation outside the JSON.

{
  "steps": ["step 1 explanation", "step 2 explanation", "..."],
  "concepts": ["concept 1", "concept 2", "..."],
  "tips": ["tip 1", "tip 2", "..."]
}`;

    const response = await ai.models.generateContent({
      model:    "gemini-2.5-flash-lite",
      contents: prompt,
    });

    let text = response.text;
    if (!text)
      return res.status(500).json({ message: "AI returned empty response." });

    text = text.trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let explanation;
    try {
      explanation = JSON.parse(text);
    } catch {
      return res.status(500).json({ message: "AI returned invalid format. Try again." });
    }

    res.status(200).json({ explanation });
  } catch (err) {
    console.error("aiExplainLab error:", err.message);
    res.status(500).json({ message: "AI explanation failed: " + err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: Update Lab
// PUT /api/courses/:courseId/lessons/:lessonId/lab/:labId
// ─────────────────────────────────────────────────────────────
const updateLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.labId)
      .populate({ path: "lesson", populate: { path: "course" } });

    if (!lab) return res.status(404).json({ message: "Lab not found" });
    if (lab.lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lab" });

    const allowed = [
      "title", "description", "outputExample", "difficulty",
      "labType", "instructions", "starterCode", "language",
      "testCases", "totalMarks", "dueDate", "isPublished",
    ];
    allowed.forEach(f => { if (req.body[f] !== undefined) lab[f] = req.body[f]; });
    await lab.save();

    res.status(200).json({ message: "Lab updated", lab });
  } catch (err) {
    console.error("updateLab error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: Delete Lab
// DELETE /api/courses/:courseId/lessons/:lessonId/lab/:labId
// ─────────────────────────────────────────────────────────────
const deleteLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.labId)
      .populate({ path: "lesson", populate: { path: "course" } });

    if (!lab) return res.status(404).json({ message: "Lab not found" });
    if (lab.lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lab" });

    // Delete all submissions for this lab
    await LabSubmission.deleteMany({ lab: lab._id });
    await lab.deleteOne();

    res.status(200).json({ message: "Lab deleted" });
  } catch (err) {
    console.error("deleteLab error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: Get all submissions for a lab
// GET /api/courses/:courseId/lessons/:lessonId/lab/:labId/submissions
// ─────────────────────────────────────────────────────────────
const getLabSubmissions = async (req, res) => {
  try {
    const submissions = await LabSubmission.find({ lab: req.params.labId })
      .populate("student", "fullName email studentId")
      .sort({ submittedAt: -1 });

    res.status(200).json({ submissions });
  } catch (err) {
    console.error("getLabSubmissions error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: Grade a submission
// PUT /api/courses/:courseId/lessons/:lessonId/lab/:labId/submissions/:submissionId/grade
// Body: { marks, feedback }
// ─────────────────────────────────────────────────────────────
const gradeSubmission = async (req, res) => {
  try {
    const { marks, feedback } = req.body;

    if (marks === undefined || marks === null)
      return res.status(400).json({ message: "marks is required" });
    if (isNaN(Number(marks)) || Number(marks) < 0)
      return res.status(400).json({ message: "marks must be a non-negative number" });

    const submission = await LabSubmission.findById(req.params.submissionId)
      .populate({
        path: "lab",
        populate: { path: "lesson", populate: { path: "course" } },
      });

    if (!submission)
      return res.status(404).json({ message: "Submission not found" });
    if (submission.lab.lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lab" });

    submission.marks    = Number(marks);
    submission.feedback = feedback?.trim() || "";
    submission.status   = "graded";
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;
    await submission.save();

    res.status(200).json({ message: "Graded successfully", submission });
  } catch (err) {
    console.error("gradeSubmission error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: AI Evaluate a submission
// POST /api/courses/:courseId/lessons/:lessonId/lab/:labId/submissions/:submissionId/ai-evaluate
// Returns: { score, mistakes, feedback, suggestions }
// ─────────────────────────────────────────────────────────────
const aiEvaluateSubmission = async (req, res) => {
  try {
    const submission = await LabSubmission.findById(req.params.submissionId)
      .populate({
        path: "lab",
        populate: { path: "lesson", populate: { path: "course" } },
      });

    if (!submission)
      return res.status(404).json({ message: "Submission not found" });
    if (submission.lab.lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lab" });

    if (!process.env.GEMINI_API_KEY)
      return res.status(400).json({ message: "GEMINI_API_KEY not set in .env" });

    const lab = submission.lab;

    // Build context from what student submitted
    const submittedContent = submission.answer || "(No text answer — student uploaded a PDF)";

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are an expert university lab evaluator.

LAB DETAILS:
Title: ${lab.title}
Description: ${lab.description}
Instructions: ${lab.instructions}
Expected Output: ${lab.outputExample}
Total Marks: ${lab.totalMarks || 100}

STUDENT SUBMISSION:
${submittedContent}

Evaluate the student's submission strictly and fairly. Return ONLY valid JSON. No markdown, no explanation outside the JSON.

{
  "score": <number between 0 and ${lab.totalMarks || 100}>,
  "mistakes": ["mistake 1", "mistake 2"],
  "feedback": "overall feedback paragraph for the student",
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

    const response = await ai.models.generateContent({
      model:    "gemini-2.5-flash-lite",
      contents: prompt,
    });

    let text = response.text;
    if (!text)
      return res.status(500).json({ message: "AI returned empty response." });

    text = text.trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let evaluation;
    try {
      evaluation = JSON.parse(text);
    } catch {
      return res.status(500).json({ message: "AI returned invalid format. Try again." });
    }

    res.status(200).json({ evaluation });
  } catch (err) {
    console.error("aiEvaluateSubmission error:", err.message);
    res.status(500).json({ message: "AI evaluation failed: " + err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// STUDENT: Submit lab — text answer + optional PDF upload
// POST /api/courses/:courseId/lessons/:lessonId/lab/:labId/submit
// Content-Type: multipart/form-data
// Fields: answer (text, optional), pdf (file, optional)
// At least one of answer or pdf is required
// ─────────────────────────────────────────────────────────────
const submitLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.labId);
    if (!lab)             return res.status(404).json({ message: "Lab not found" });
    if (!lab.isPublished) return res.status(400).json({ message: "Lab is not available" });

    const answer = req.body.answer?.trim() || "";
    let pdfUrl      = null;
    let pdfFileName = null;
    let pdfPublicId = null;

    // Upload PDF to Cloudinary if file was sent
    if (req.file) {
      if (!process.env.CLOUDINARY_CLOUD_NAME)
        return res.status(400).json({ message: "Cloudinary is not configured on the server" });

      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder:          `smartacademia/lab-submissions/${lab._id}`,
          resource_type:   "auto",       // handles PDF correctly
          use_filename:    true,
          unique_filename: true,
        });
        pdfUrl      = uploadResult.secure_url;
        pdfPublicId = uploadResult.public_id;
        pdfFileName = req.file.originalname;
      } catch (uploadErr) {
        console.error("Cloudinary PDF upload error:", uploadErr.message);
        return res.status(500).json({ message: "PDF upload failed: " + uploadErr.message });
      }
    }

    // Must have at least answer text or a PDF
    if (!answer && !pdfUrl)
      return res.status(400).json({ message: "Please write an answer or upload a PDF" });

    // If student is resubmitting and had an old PDF, delete it from Cloudinary
    const existing = await LabSubmission.findOne({ lab: lab._id, student: req.user._id });
    if (existing?.pdfPublicId && pdfUrl) {
      try {
        await cloudinary.uploader.destroy(existing.pdfPublicId, { resource_type: "raw" });
      } catch {
        // Non-critical — old file deletion failure does not block submission
      }
    }

    const submission = await LabSubmission.findOneAndUpdate(
      { lab: lab._id, student: req.user._id },
      {
        $set: {
          answer,
          pdfUrl,
          pdfFileName,
          pdfPublicId,
          submittedAt: new Date(),
          // Reset grading fields on resubmit
          marks:    null,
          feedback: null,
          status:   "submitted",
          gradedAt: null,
          gradedBy: null,
        },
        $setOnInsert: {
          lab:     lab._id,
          lesson:  lab.lesson,
          course:  lab.course,
          student: req.user._id,
        },
      },
      { upsert: true, new: true }
    );

    // Mark lab as completed and fire lesson unlock check
    await LessonProgress.findOneAndUpdate(
      { student: req.user._id, lesson: lab.lesson },
      {
        $set:         { labCompleted: true },
        $setOnInsert: {
          student: req.user._id,
          lesson:  lab.lesson,
          course:  lab.course,
        },
      },
      { upsert: true }
    );

    await checkAndUnlockNext(req.user._id, lab.lesson, lab.course);

    res.status(200).json({ message: "Lab submitted successfully", submission });
  } catch (err) {
    console.error("submitLab error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// STUDENT: Get my submission for a lab
// GET /api/courses/:courseId/lessons/:lessonId/lab/:labId/my-submission
// ─────────────────────────────────────────────────────────────
const getMySubmission = async (req, res) => {
  try {
    const submission = await LabSubmission.findOne({
      lab:     req.params.labId,
      student: req.user._id,
    });
    res.status(200).json({ submission });
  } catch (err) {
    console.error("getMySubmission error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createLab,
  aiGenerateLab,
  aiExplainLab,
  updateLab,
  deleteLab,
  getLabSubmissions,
  gradeSubmission,
  aiEvaluateSubmission,
  submitLab,
  getMySubmission,
};