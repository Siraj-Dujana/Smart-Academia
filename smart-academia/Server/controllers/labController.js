// controllers/labController.js — COMPLETE REWRITE
// Changes from original:
//  + aiGenerateLab (Gemini gemini-2.5-flash-lite via @google/genai)
//  + createLab now accepts description, outputExample, difficulty
//  + submitLab now handles PDF upload via Cloudinary
//  + gradeSubmission (NEW)
//  + runCode replaced Judge0 with free Piston API
//  + All other functions kept identical structure

const Lab            = require("../models/Lab");
const LabSubmission  = require("../models/LabSubmission");
const LessonProgress = require("../models/LessonProgress");
const Lesson         = require("../models/Lesson");
const cloudinary     = require("../config/cloudinary");
const { checkAndUnlockNext } = require("./lessonController");
const axios          = require("axios");
const { GoogleGenAI } = require("@google/genai");

// ── Free code execution (Piston — no key needed) ─────────────
const PISTON_URL = process.env.PISTON_URL || "https://emkc.org/api/v2/piston";
const PISTON_LANGS = {
  python:     { language: "python",     version: "3.10.0" },
  javascript: { language: "javascript", version: "18.15.0" },
  cpp:        { language: "c++",        version: "10.2.0" },
  java:       { language: "java",       version: "15.0.2" },
  c:          { language: "c",          version: "10.2.0" },
};

// ─────────────────────────────────────────────────────────────
// TEACHER: Create Lab manually
// POST /api/courses/:courseId/lessons/:lessonId/lab
// ─────────────────────────────────────────────────────────────
const createLab = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const {
      title, description, outputExample, difficulty,
      labType, instructions, starterCode, language,
      testCases, isPublished,
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ message: "Lab title is required" });

    const lesson = await Lesson.findById(lessonId).populate("course");
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    if (lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lesson" });

    // One lab per lesson
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
      isPublished:   isPublished !== undefined ? isPublished : true,
      aiGenerated:   false,
    });

    res.status(201).json({ message: "Lab created", lab });
  } catch (err) {
    console.error("createLab error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: AI Generate Lab
// POST /api/courses/:courseId/lessons/:lessonId/lab/ai-generate
// Body: { topic, difficulty, labType }
// ─────────────────────────────────────────────────────────────
const aiGenerateLab = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { topic, difficulty, labType } = req.body;

    if (!topic?.trim()) return res.status(400).json({ message: "Topic is required" });
    if (!process.env.GEMINI_API_KEY)
      return res.status(400).json({ message: "GEMINI_API_KEY not set in .env" });

    const lesson = await Lesson.findById(lessonId).populate("course");
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    if (lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lesson" });

    // Call Gemini using @google/genai
    const ai     = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const diff   = difficulty || "medium";
    const type   = labType    || "theory";

    const prompt = `You are a university lab assignment creator.
Create a lab for: "${topic}". Difficulty: ${diff}. Type: ${type}.

Return ONLY valid JSON — no markdown, no explanation, no code blocks.

{
  "title": "clear lab title",
  "description": "2-3 sentences what students will learn and practice",
  "instructions": "numbered step-by-step tasks (at least 4 steps)",
  "outputExample": "exact expected output or result example",
  "starterCode": "starter template if programming, empty string if not"
}`;

    const response = await ai.models.generateContent({
      model:    "gemini-2.5-flash-lite",
      contents: prompt,
    });

    let text = response.text.trim()
      .replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/i,"").trim();

    let generated;
    try { generated = JSON.parse(text); }
    catch { return res.status(500).json({ message: "AI returned invalid JSON. Try again." }); }

    if (!generated.title?.trim() || !generated.description?.trim())
      return res.status(500).json({ message: "AI response incomplete. Try again." });

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
      instructions:  generated.instructions || "",
      starterCode:   generated.starterCode  || "",
      language:      "python",
      testCases:     [],
      isPublished:   true,
      aiGenerated:   true,
    });

    res.status(201).json({ message: `AI lab generated: "${lab.title}"`, lab });
  } catch (err) {
    console.error("aiGenerateLab error:", err.message);
    if (err.message?.includes("API_KEY")) {
      return res.status(400).json({ message: "Invalid Gemini API key. Check GEMINI_API_KEY in .env" });
    }
    res.status(500).json({ message: "AI generation failed: " + err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: Update Lab
// ─────────────────────────────────────────────────────────────
const updateLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.labId)
      .populate({ path: "lesson", populate: { path: "course" } });
    if (!lab) return res.status(404).json({ message: "Lab not found" });
    if (lab.lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lab" });

    [
      "title","description","outputExample","difficulty",
      "labType","instructions","starterCode","language",
      "testCases","isPublished",
    ].forEach(f => { if (req.body[f] !== undefined) lab[f] = req.body[f]; });

    await lab.save();
    res.status(200).json({ message: "Lab updated", lab });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: Delete Lab
// ─────────────────────────────────────────────────────────────
const deleteLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.labId)
      .populate({ path: "lesson", populate: { path: "course" } });
    if (!lab) return res.status(404).json({ message: "Lab not found" });
    if (lab.lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lab" });

    await LabSubmission.deleteMany({ lab: lab._id });
    await lab.deleteOne();
    res.status(200).json({ message: "Lab deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: View all submissions for a lab
// GET /api/courses/:courseId/lessons/:lessonId/lab/:labId/submissions
// ─────────────────────────────────────────────────────────────
const getLabSubmissions = async (req, res) => {
  try {
    const submissions = await LabSubmission.find({ lab: req.params.labId })
      .populate("student", "fullName email studentId")
      .sort({ submittedAt: -1 });
    res.status(200).json({ submissions });
  } catch (err) {
    console.error(err);
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
      return res.status(400).json({ message: "marks are required" });
    if (isNaN(Number(marks)) || Number(marks) < 0)
      return res.status(400).json({ message: "marks must be a non-negative number" });

    const submission = await LabSubmission.findById(req.params.submissionId)
      .populate({ path: "lab", populate: { path: "lesson", populate: { path: "course" } } });

    if (!submission) return res.status(404).json({ message: "Submission not found" });
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
// STUDENT: Run code (free Piston API — no key needed)
// POST /api/courses/:courseId/lessons/:lessonId/lab/run-code
// Body: { code, language, stdin }
// ─────────────────────────────────────────────────────────────
const runCode = async (req, res) => {
  try {
    const { code, language, stdin } = req.body;
    if (!code?.trim()) return res.status(400).json({ message: "Code is required" });

    const lang = PISTON_LANGS[language || "python"];
    if (!lang)
      return res.status(400).json({ message: `Unsupported language. Use: ${Object.keys(PISTON_LANGS).join(", ")}` });

    try {
      const pistonRes = await axios.post(`${PISTON_URL}/execute`, {
        language:    lang.language,
        version:     lang.version,
        files:       [{ name: "main", content: code }],
        stdin:       stdin || "",
        run_timeout: 5000,
      }, { timeout: 15000 });

      const run = pistonRes.data.run || {};
      return res.status(200).json({
        stdout:   run.stdout  || "",
        stderr:   run.stderr  || "",
        status:   { id: run.code === 0 ? 3 : 11, description: run.code === 0 ? "Accepted" : "Runtime Error" },
        time:     run.cpu_time != null ? (run.cpu_time / 1000).toFixed(3) : null,
        memory:   run.memory  || null,
        exitCode: run.code,
      });
    } catch {
      return res.status(200).json({
        stdout: "",
        stderr: "Code execution service temporarily unavailable. Submit your code via PDF.",
        status: { id: 0, description: "Service Unavailable" },
        time: null, memory: null,
      });
    }
  } catch (err) {
    console.error("runCode error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// STUDENT: Submit lab — text answer + optional PDF upload
// POST /api/courses/:courseId/lessons/:lessonId/lab/:labId/submit
// multipart/form-data: answer (text), pdf (file, optional)
// ─────────────────────────────────────────────────────────────
const submitLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.labId);
    if (!lab)             return res.status(404).json({ message: "Lab not found" });
    if (!lab.isPublished) return res.status(400).json({ message: "Lab not available" });

    const { answer, testResults } = req.body;
    let pdfUrl = null, pdfFileName = null, pdfPublicId = null;

    // Handle PDF upload to Cloudinary if file present
    if (req.file) {
      if (!process.env.CLOUDINARY_CLOUD_NAME)
        return res.status(400).json({ message: "Cloudinary not configured — cannot upload PDF" });
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder:        `smartacademia/lab-submissions/${lab._id}`,
          resource_type: "auto",     // KEY FIX — handles PDF correctly
          use_filename:  true,
          unique_filename: true,
        });
        pdfUrl       = result.secure_url;
        pdfPublicId  = result.public_id;
        pdfFileName  = req.file.originalname;
      } catch (uploadErr) {
        console.error("PDF upload error:", uploadErr.message);
        return res.status(500).json({ message: "PDF upload failed: " + uploadErr.message });
      }
    }

    // Must have either text answer or PDF
    if (!answer?.trim() && !pdfUrl)
      return res.status(400).json({ message: "Submit a text answer or upload a PDF" });

    // If resubmitting — delete old PDF from Cloudinary to save space
    const existing = await LabSubmission.findOne({ lab: lab._id, student: req.user._id });
    if (existing?.pdfPublicId && pdfUrl) {
      try { await cloudinary.uploader.destroy(existing.pdfPublicId, { resource_type: "raw" }); }
      catch { /* non-critical */ }
    }

    const submission = await LabSubmission.findOneAndUpdate(
      { lab: lab._id, student: req.user._id },
      {
        $set: {
          answer:      answer?.trim() || "",
          pdfUrl,
          pdfFileName,
          pdfPublicId,
          testResults: testResults ? JSON.parse(testResults) : [],
          submittedAt: new Date(),
          // Reset grading on resubmit
          marks: null, feedback: null, status: "submitted", gradedAt: null, gradedBy: null,
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

    // Fire unlock chain
    await LessonProgress.findOneAndUpdate(
      { student: req.user._id, lesson: lab.lesson },
      {
        $set:         { labCompleted: true },
        $setOnInsert: { student: req.user._id, lesson: lab.lesson, course: lab.course },
      },
      { upsert: true }
    );
    await checkAndUnlockNext(req.user._id, lab.lesson, lab.course);

    res.status(200).json({ message: "Lab submitted successfully", submission });
  } catch (err) {
    console.error("submitLab error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// STUDENT: Get my submission for a lab
// ─────────────────────────────────────────────────────────────
const getMySubmission = async (req, res) => {
  try {
    const submission = await LabSubmission.findOne({
      lab:     req.params.labId,
      student: req.user._id,
    });
    res.status(200).json({ submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createLab, aiGenerateLab, updateLab, deleteLab,
  getLabSubmissions, gradeSubmission,
  runCode, submitLab, getMySubmission,
};