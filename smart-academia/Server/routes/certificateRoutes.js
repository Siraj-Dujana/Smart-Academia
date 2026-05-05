const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  generateCertificate,
  getCertificate,
  getMyCertificates,
} = require("../controllers/certificateController");

router.get("/my-certificates", protect, getMyCertificates);
router.get("/course/:courseId", protect, getCertificate);
router.post("/generate/:courseId", protect, generateCertificate);

module.exports = router;