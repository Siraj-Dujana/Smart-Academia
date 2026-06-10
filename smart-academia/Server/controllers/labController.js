const Lab            = require("../models/Lab");
const LabSubmission  = require("../models/LabSubmission");
const LessonProgress = require("../models/LessonProgress");
const Lesson         = require("../models/Lesson");
const cloudinary     = require("../config/cloudinary");
const { checkAndUnlockNext } = require("./lessonController");
const { GoogleGenAI } = require("@google/genai");
const { notifyLabGraded } = require("../utils/notificationHooks");
const PointsService = require('../services/pointsService');
const { POINTS_CONFIG } = require('../config/pointsConfig');
const fs   = require("fs");
const path = require("path");
const https = require("https");
const http  = require("http");

// ─────────────────────────────────────────────────────────────
// HELPER: Fetch a PDF from a URL and return a Buffer
// ─────────────────────────────────────────────────────────────
const fetchPdfBuffer = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch PDF: HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end",  () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
};

// ─────────────────────────────────────────────────────────────
// HELPER: Extract text from a PDF Buffer using pdf-parse
// ─────────────────────────────────────────────────────────────
const extractPdfText = async (buffer) => {
  try {
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return (data.text || "").trim();
  } catch (err) {
    console.error("pdf-parse error:", err.message);
    return "";
  }
};

// ─────────────────────────────────────────────────────────────
// SHARED: Get lab for a lesson
// ─────────────────────────────────────────────────────────────
const getLabByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lab = await Lab.findOne({ lesson: lessonId });
    res.status(200).json({ lab: lab || null });
  } catch (err) {
    console.error("getLabByLesson error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: Create Lab manually
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
    const type = labType    || "programming";

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are a university lab assignment creator for computer science students.

Create a lab assignment for the topic: "${topic}"
Difficulty level: ${diff}
Lab type: ${type}

IMPORTANT: The "instructions" field MUST be a single string with numbered steps separated by newlines (\\n). DO NOT return an array.

Return ONLY a valid JSON object. No markdown, no explanation, no code blocks. Just raw JSON.

{
  "title": "concise descriptive lab title",
  "description": "2-3 sentences explaining what the lab covers and what students will practice",
  "instructions": "1. First step\\n2. Second step\\n3. Third step\\n4. Fourth step",
  "outputExample": "the exact expected output or result a correct solution should produce",
  "starterCode": "starter code template if programming lab, empty string otherwise"
}`;

    const response = await ai.models.generateContent({
      model:    "gemini-2.5-flash-lite",
      contents: prompt,
    });

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
      return res.status(500).json({ message: "AI returned invalid format. Try again." });
    }

    if (!generated.title?.trim() || !generated.description?.trim())
      return res.status(500).json({ message: "AI response incomplete. Try again." });

    let instructions = generated.instructions || "";
    if (Array.isArray(instructions)) instructions = instructions.join("\n");
    if (typeof instructions !== "string") instructions = String(instructions);

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
      instructions:  instructions,
      starterCode:   generated.starterCode || "",
      language:      "python",
      testCases:     [],
      totalMarks:    100,
      isPublished:   true,
      aiGenerated:   true,
    });

    res.status(201).json({ message: `Lab generated: "${lab.title}"`, lab });
  } catch (err) {
    console.error("aiGenerateLab error:", err.message);
    res.status(500).json({ message: "AI generation failed: " + err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// AI Explain Lab
// ─────────────────────────────────────────────────────────────
const aiExplainLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.labId)
      .populate({ path: "lesson", populate: { path: "course" } });

    if (!lab) return res.status(404).json({ message: "Lab not found" });

    const isTeacher = lab.lesson.course.teacher.toString() === req.user._id.toString();
    const isStudent = req.user.role === "student";
    if (!isTeacher && !isStudent)
      return res.status(403).json({ message: "Not authorized" });

    if (!process.env.GEMINI_API_KEY)
      return res.status(400).json({ message: "GEMINI_API_KEY not set in .env" });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are a helpful teaching assistant explaining a lab assignment to a university student.

Lab Title: ${lab.title}
Description: ${lab.description}
Instructions: ${lab.instructions}
Expected Output: ${lab.outputExample}

Explain this lab in simple, clear steps so the student knows exactly what to do.
Return ONLY valid JSON. No markdown, no explanation outside the JSON.

{
  "steps": ["clear step 1 for the student", "clear step 2", "clear step 3"],
  "concepts": ["concept 1 they need to know", "concept 2"],
  "tips": ["helpful tip 1", "helpful tip 2"]
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
    console.error("deleteLab error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: Get all submissions for a lab
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
      })
      .populate("student", "fullName email");

    if (!submission)
      return res.status(404).json({ message: "Submission not found" });
    if (submission.lab.lesson.course.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your lab" });

    const numMarks  = Number(marks);
    const totalMarks = submission.lab.totalMarks || 100;

    if (numMarks > totalMarks)
      return res.status(400).json({ message: `Marks cannot exceed ${totalMarks}` });

    submission.marks    = numMarks;
    submission.feedback = feedback?.trim() || "";
    submission.status   = "graded";
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;
    await submission.save();

    const scorePercent = (numMarks / totalMarks) * 100;
    const labPassed = scorePercent >= 70;

    await LessonProgress.findOneAndUpdate(
      { student: submission.student._id, lesson: submission.lesson },
      {
        $set: { 
          labCompleted: true,
          labPassed: labPassed
        },
      },
      { upsert: true }
    );

    if (labPassed) {
      await PointsService.addPoints(
        submission.student._id,
        POINTS_CONFIG.LAB_PASSED,
        `Passed lab: ${submission.lab.title}`
      );
    }
    if (scorePercent === 100) {
      await PointsService.addPoints(
        submission.student._id,
        POINTS_CONFIG.LAB_PERFECT,
        `Perfect score on lab: ${submission.lab.title}`
      );
    }

    await notifyLabGraded({
      studentId:      submission.student._id,
      labTitle:       submission.lab.title,
      marks:          numMarks,
      totalMarks,
      courseId:       submission.course,
      sendEmailNotif: true,
      recipientEmail: submission.student.email,
      recipientName:  submission.student.fullName,
    });

    await checkAndUnlockNext(submission.student._id, submission.lesson, submission.course);

    res.status(200).json({ message: "Graded successfully", submission });
  } catch (err) {
    console.error("gradeSubmission error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// TEACHER: AI Evaluate a submission
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
    const totalMarks = lab.totalMarks || 100;

    let submittedContent = "";
    let contentSource    = "none";

    if (submission.pdfUrl) {
      try {
        const pdfBuffer = await fetchPdfBuffer(submission.pdfUrl);
        const pdfText   = await extractPdfText(pdfBuffer);

        if (pdfText && pdfText.length > 10) {
          submittedContent = pdfText;
          contentSource    = "pdf";
        } else {
          console.warn("⚠️  PDF extracted but text is empty — falling back to text answer");
        }
      } catch (pdfErr) {
        console.error("⚠️  PDF fetch/parse failed:", pdfErr.message);
      }
    }

    if (!submittedContent && submission.answer && submission.answer.trim()) {
      submittedContent = submission.answer.trim();
      contentSource    = "text";
    }

    if (!submittedContent) {
      return res.status(400).json({
        message: "No evaluatable content found. The student's PDF has no extractable text and no text answer was provided.",
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are an expert university lab evaluator grading a student's submission.

LAB REQUIREMENTS:
Title: ${lab.title}
Description: ${lab.description}
Instructions: ${lab.instructions}
Expected Output / Expected Result: ${lab.outputExample || "Not specified"}
Total Marks Available: ${totalMarks}

STUDENT'S SUBMISSION (extracted from ${contentSource === "pdf" ? "their uploaded PDF" : "their text answer"}):
---
${submittedContent}
---

GRADING INSTRUCTIONS:
- Award marks based strictly on how well the student's submission satisfies the lab requirements.
- The score must be between 0 and ${totalMarks}.
- Provide specific, constructive feedback.

Return ONLY valid JSON. No markdown, no explanation outside the JSON.

{
  "score": <integer between 0 and ${totalMarks}>,
  "mistakes": ["specific thing that was wrong or missing", "..."],
  "feedback": "2-4 sentence overall feedback paragraph addressed to the student",
  "suggestions": ["concrete suggestion to improve", "..."]
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

    if (typeof evaluation.score === "number") {
      evaluation.score = Math.max(0, Math.min(totalMarks, Math.round(evaluation.score)));
    }

    evaluation.evaluatedFrom = contentSource;

    res.status(200).json({ evaluation });
  } catch (err) {
    console.error("aiEvaluateSubmission error:", err.message);
    res.status(500).json({ message: "AI evaluation failed: " + err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// HELPER: Get next attempt number for a lab
// ─────────────────────────────────────────────────────────────
const getNextAttemptNumber = async (labId, studentId) => {
  const count = await LabSubmission.countDocuments({
    lab: labId,
    student: studentId,
  });
  return count + 1;
};

// ─────────────────────────────────────────────────────────────
// STUDENT: Submit lab (WITH MULTIPLE ATTEMPTS SUPPORT)
// ─────────────────────────────────────────────────────────────
const submitLab = async (req, res) => {
  try {
    const { courseId, lessonId, labId } = req.params;

    const lab = await Lab.findById(labId);
    if (!lab) return res.status(404).json({ message: "Lab not found" });
    if (!lab.isPublished) return res.status(400).json({ message: "Lab is not available" });

    const answer = req.body.answer?.trim() || "";
    let pdfUrl = null;
    let pdfFileName = null;
    let pdfPublicId = null;

    // Handle PDF upload
    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: `smartacademia/labs/${labId}`,
          resource_type: "raw",
          public_id: `${req.user._id}_${Date.now()}`,
          use_filename: false,
        });
        pdfUrl = uploadResult.secure_url;
        pdfPublicId = uploadResult.public_id;
        pdfFileName = req.file.originalname;
      } catch (uploadErr) {
        console.error("Cloudinary PDF upload error:", uploadErr.message);
        return res.status(500).json({ message: "Failed to upload PDF. Please try again." });
      } finally {
        if (req.file.path && fs.existsSync(req.file.path)) {
          try { fs.unlinkSync(req.file.path); } catch (_) {}
        }
      }
    }

    if (!answer && !pdfUrl)
      return res.status(400).json({ message: "Please write an answer or upload a PDF" });

    // ✅ Get the next attempt number
    const attemptNumber = await getNextAttemptNumber(labId, req.user._id);
    console.log(`📝 Creating attempt #${attemptNumber} for lab: ${lab.title}`);

    // Get content to evaluate
    let contentToEvaluate = "";
    let contentSource = "none";
    
    if (pdfUrl) {
      try {
        const pdfBuffer = await fetchPdfBuffer(pdfUrl);
        const pdfText = await extractPdfText(pdfBuffer);
        if (pdfText && pdfText.length > 10) {
          contentToEvaluate = pdfText;
          contentSource = "pdf";
          console.log("📄 Using PDF content for evaluation, length:", contentToEvaluate.length);
        }
      } catch (pdfErr) {
        console.error("PDF extraction failed:", pdfErr.message);
      }
    }
    
    if (!contentToEvaluate && answer) {
      contentToEvaluate = answer;
      contentSource = "text";
      console.log("📝 Using text answer for evaluation, length:", contentToEvaluate.length);
    }

    // AI Evaluation
    let aiSuggestedMarks = null;
    let aiSuggestedFeedback = null;
    let aiDetailedFeedback = null;

    if (contentToEvaluate && contentToEvaluate.trim()) {
      try {
        console.log(`🤖 Starting AI evaluation for attempt #${attemptNumber}...`);
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const totalMarks = lab.totalMarks || 100;
        
        let evaluationPrompt = lab.labType === "programming" 
          ? `You are evaluating a programming lab submission. Give a score out of ${totalMarks}.

LAB: ${lab.title}
INSTRUCTIONS: ${lab.instructions || "Complete the programming task"}

STUDENT'S SUBMISSION (Attempt #${attemptNumber}):
${contentToEvaluate.slice(0, 4000)}

Return ONLY JSON: {"score": number, "feedback": "feedback", "strengths": [], "areasForImprovement": []}`
          : `You are evaluating a lab submission. Give a score out of ${totalMarks}.

LAB: ${lab.title}
INSTRUCTIONS: ${lab.instructions || "Complete the lab requirements"}

STUDENT'S SUBMISSION (Attempt #${attemptNumber}):
${contentToEvaluate.slice(0, 4000)}

Return ONLY JSON: {"score": number, "feedback": "feedback", "strengths": [], "areasForImprovement": []}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: evaluationPrompt,
        });

        let text = response.text;
        if (text) {
          text = text.trim()
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
          
          try {
            const evaluation = JSON.parse(text);
            if (evaluation && typeof evaluation.score === 'number') {
              aiSuggestedMarks = Math.max(0, Math.min(totalMarks, Math.round(evaluation.score)));
              aiSuggestedFeedback = evaluation.feedback || "";
              aiDetailedFeedback = {
                strengths: evaluation.strengths || [],
                areasForImprovement: evaluation.areasForImprovement || []
              };
              console.log(`✅ AI Evaluation complete: ${aiSuggestedMarks}/${totalMarks} marks`);
            }
          } catch (parseErr) {
            console.error("Failed to parse AI response:", parseErr.message);
          }
        }
      } catch (aiErr) {
        console.error("❌ Auto AI evaluation failed:", aiErr.message);
      }
    }

    // ✅ CREATE NEW SUBMISSION (not update existing)
    const newSubmission = await LabSubmission.create({
      lab: labId,
      lesson: lessonId,
      course: courseId,
      student: req.user._id,
      attemptNumber: attemptNumber,
      answer: answer,
      pdfUrl: pdfUrl,
      pdfFileName: pdfFileName,
      pdfPublicId: pdfPublicId,
      submittedAt: new Date(),
      status: "submitted",
      aiSuggestedMarks: aiSuggestedMarks,
      aiSuggestedFeedback: aiSuggestedFeedback,
      aiDetailedFeedback: aiDetailedFeedback,
      aiEvaluatedFrom: contentSource,
      aiEvaluatedAt: aiSuggestedMarks ? new Date() : null,
    });

    console.log(`✅ Created new submission with ID: ${newSubmission._id}, Attempt #${attemptNumber}`);

    // ✅ Update LessonProgress with attempt tracking
    const progress = await LessonProgress.findOne({ student: req.user._id, lesson: lessonId });
    
    const updateFields = {
      labSubmitted: true,
      labTotalAttempts: attemptNumber,
    };
    
    // Update best score if this attempt is better
    if (aiSuggestedMarks && (!progress?.labBestScore || aiSuggestedMarks > progress.labBestScore)) {
      updateFields.labBestScore = aiSuggestedMarks;
      updateFields.labBestAttempt = attemptNumber;
    }
    
    // Check if this attempt passes (70% or higher)
    const totalMarks = lab.totalMarks || 100;
    const scorePercent = aiSuggestedMarks ? (aiSuggestedMarks / totalMarks) * 100 : 0;
    const passed = scorePercent >= 70;
    
    if (passed) {
      updateFields.labCompleted = true;
      updateFields.labPassed = true;
    }
    
    await LessonProgress.findOneAndUpdate(
      { student: req.user._id, lesson: lessonId },
      { $set: updateFields },
      { upsert: true }
    );

    // Add points for submission
    await PointsService.addPoints(
      req.user._id,
      POINTS_CONFIG.LAB_SUBMITTED,
      `Submitted lab: ${lab.title} (Attempt #${attemptNumber})`
    );

    // Only unlock next lesson if lab is passed
    if (passed) {
      await checkAndUnlockNext(req.user._id, lessonId, courseId);
    }

    res.status(200).json({
      message: aiSuggestedMarks ? `Lab submitted! Attempt #${attemptNumber} - Score: ${aiSuggestedMarks}/${totalMarks}` : `Lab submitted! Attempt #${attemptNumber}`,
      submission: {
        _id: newSubmission._id,
        attemptNumber: newSubmission.attemptNumber,
        answer: newSubmission.answer,
        pdfUrl: newSubmission.pdfUrl,
        pdfFileName: newSubmission.pdfFileName,
        status: newSubmission.status,
        submittedAt: newSubmission.submittedAt,
        aiSuggestedMarks: newSubmission.aiSuggestedMarks,
        aiSuggestedFeedback: newSubmission.aiSuggestedFeedback,
        aiDetailedFeedback: newSubmission.aiDetailedFeedback,
      },
    });
  } catch (err) {
    console.error("submitLab error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// STUDENT: Get my latest submission for a lab
// ─────────────────────────────────────────────────────────────
const getMySubmission = async (req, res) => {
  try {
    // Get the most recent submission (highest attempt number)
    const submission = await LabSubmission.findOne({
      lab: req.params.labId,
      student: req.user._id,
    }).sort({ attemptNumber: -1 });
    
    if (submission) {
      res.status(200).json({ 
        submission: {
          _id: submission._id,
          attemptNumber: submission.attemptNumber,
          answer: submission.answer,
          pdfUrl: submission.pdfUrl,
          pdfFileName: submission.pdfFileName,
          status: submission.status,
          submittedAt: submission.submittedAt,
          marks: submission.marks,
          feedback: submission.feedback,
          gradedAt: submission.gradedAt,
          aiSuggestedMarks: submission.aiSuggestedMarks,
          aiSuggestedFeedback: submission.aiSuggestedFeedback,
          aiDetailedFeedback: submission.aiDetailedFeedback,
          aiEvaluatedAt: submission.aiEvaluatedAt,
        }
      });
    } else {
      res.status(200).json({ submission: null });
    }
  } catch (err) {
    console.error("getMySubmission error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// STUDENT: Get ALL attempts for a lab (for analytics)
// ─────────────────────────────────────────────────────────────
const getMyLabAttempts = async (req, res) => {
  try {
    const attempts = await LabSubmission.find({
      lab: req.params.labId,
      student: req.user._id,
    })
      .sort({ attemptNumber: 1 })
      .select("attemptNumber submittedAt aiSuggestedMarks marks status feedback");

    const totalMarks = req.body.totalMarks || 100;
    
    res.status(200).json({ 
      attempts: attempts.map(a => ({
        attemptNumber: a.attemptNumber,
        submittedAt: a.submittedAt,
        aiScore: a.aiSuggestedMarks,
        teacherScore: a.marks,
        finalScore: a.marks || a.aiSuggestedMarks,
        status: a.status,
        feedback: a.feedback,
        percentage: a.marks || a.aiSuggestedMarks ? Math.round(((a.marks || a.aiSuggestedMarks) / totalMarks) * 100) : null,
      })),
      totalAttempts: attempts.length,
    });
  } catch (err) {
    console.error("getMyLabAttempts error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// ─────────────────────────────────────────────────────────────
// TEACHER/STUDENT: Get PDF file through backend proxy
// ─────────────────────────────────────────────────────────────
const getSubmissionPDF = async (req, res) => {
  try {
    let token = req.query.token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const jwt = require("jsonwebtoken");
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userId = decoded.id;

    const submission = await LabSubmission.findById(req.params.submissionId)
      .populate("student", "fullName");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const lab = await Lab.findById(submission.lab).populate({
      path: "lesson",
      populate: { path: "course", select: "teacher" }
    });

    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    const isTeacher = lab.lesson.course.teacher.toString() === userId.toString();
    const isStudent = submission.student._id.toString() === userId.toString();

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Not authorized to view this PDF" });
    }

    if (!submission.pdfUrl) {
      return res.status(404).json({ message: "No PDF submitted" });
    }

    const protocol = submission.pdfUrl.startsWith("https") ? https : http;
    
    protocol.get(submission.pdfUrl, (pdfRes) => {
      if (pdfRes.statusCode !== 200) {
        return res.status(502).json({ message: `Failed to fetch PDF from storage` });
      }
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${submission.pdfFileName || 'submission.pdf'}"`);
      res.setHeader("Cache-Control", "public, max-age=3600");
      
      pdfRes.pipe(res);
    }).on("error", (err) => {
      console.error("Error proxying PDF:", err.message);
      res.status(502).json({ message: "Failed to load PDF" });
    });

  } catch (err) {
    console.error("getSubmissionPDF error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getLabByLesson,
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
   getMyLabAttempts,  // ✅ Add this
  getSubmissionPDF,
};