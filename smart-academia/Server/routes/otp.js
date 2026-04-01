const express = require("express");
const router = express.Router();
const {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
} = require("../controllers/otpController");

// Registration email verification
router.post("/send-reg-otp", sendRegistrationOTP);
router.post("/verify-reg-otp", verifyRegistrationOTP);

// Forgot password
router.post("/send-otp", sendForgotPasswordOTP);
router.post("/verify-otp", verifyForgotPasswordOTP);
router.post("/reset-password", resetPassword);

module.exports = router;