const User = require("../models/User");
const { sendEmail, otpEmailTemplate } = require("../utils/sendEmail");

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================================================
// REGISTRATION OTP — send OTP before account is created
// ============================================================
const sendRegistrationOTP = async (req, res) => {
  try {
    const { email, fullName } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({ message: "Email and full name are required" });
    }

    // Check if email already registered and verified
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({ message: "Email already registered. Please login instead." });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // If user exists but not verified (previous incomplete registration)
    // update their OTP, otherwise store in a temporary way via a temp record
    if (existingUser && !existingUser.isEmailVerified) {
      // Check resend limit (max 3 per hour)
      const now = new Date();
      if (
        existingUser.otpResendResetTime &&
        now < existingUser.otpResendResetTime &&
        existingUser.otpResendCount >= 3
      ) {
        const minutesLeft = Math.ceil(
          (existingUser.otpResendResetTime - now) / 60000
        );
        return res.status(429).json({
          message: `Too many OTP requests. Try again in ${minutesLeft} minute(s).`,
        });
      }

      // Reset counter if the hour window has passed
      if (!existingUser.otpResendResetTime || now >= existingUser.otpResendResetTime) {
        existingUser.otpResendCount = 0;
        existingUser.otpResendResetTime = new Date(Date.now() + 60 * 60 * 1000);
      }

      existingUser.resetOTP = otp;
      existingUser.resetOTPExpiry = expiry;
      existingUser.otpResendCount += 1;
      await existingUser.save();
    } else {
      // Store a temporary unverified placeholder so we can track the OTP
      const tempUser = new User({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: "TEMP_NOT_REGISTERED_YET",
        role: "student", // placeholder, will be overwritten on real registration
        isEmailVerified: false,
        resetOTP: otp,
        resetOTPExpiry: expiry,
        otpResendCount: 1,
        otpResendResetTime: new Date(Date.now() + 60 * 60 * 1000),
      });
      await tempUser.save();
    }

    // Send OTP email
    await sendEmail({
      to: email.toLowerCase().trim(),
      subject: "SmartAcademia — Verify Your Email",
      html: otpEmailTemplate({
        fullName: fullName.trim(),
        otp,
        purpose: "registration",
      }),
    });

    res.status(200).json({ message: `Verification OTP sent to ${email}` });
  } catch (error) {
    console.error("Send registration OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

// ============================================================
// VERIFY REGISTRATION OTP
// ============================================================
const verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "No OTP request found. Please start registration again." });
    }

    if (!user.resetOTP || !user.resetOTPExpiry) {
      return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }

    if (new Date() > user.resetOTPExpiry) {
      user.resetOTP = null;
      user.resetOTPExpiry = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (user.resetOTP !== otp.toString().trim()) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // Mark OTP as verified — clear OTP fields
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully! Please complete your registration." });
  } catch (error) {
    console.error("Verify registration OTP error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ============================================================
// FORGOT PASSWORD — Send OTP
// ============================================================
const sendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      isEmailVerified: true,
    });

    if (!user) {
      return res.status(404).json({ message: "No verified account found with this email" });
    }

    // Check resend limit
    const now = new Date();
    if (
      user.otpResendResetTime &&
      now < user.otpResendResetTime &&
      user.otpResendCount >= 3
    ) {
      const minutesLeft = Math.ceil((user.otpResendResetTime - now) / 60000);
      return res.status(429).json({
        message: `Too many OTP requests. Try again in ${minutesLeft} minute(s).`,
      });
    }

    if (!user.otpResendResetTime || now >= user.otpResendResetTime) {
      user.otpResendCount = 0;
      user.otpResendResetTime = new Date(Date.now() + 60 * 60 * 1000);
    }

    const otp = generateOTP();
    user.resetOTP = otp;
    user.resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpResendCount += 1;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "SmartAcademia — Password Reset OTP",
      html: otpEmailTemplate({
        fullName: user.fullName,
        otp,
        purpose: "password-reset",
      }),
    });

    res.status(200).json({ message: `OTP sent to ${user.email}` });
  } catch (error) {
    console.error("Send forgot password OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

// ============================================================
// FORGOT PASSWORD — Verify OTP
// ============================================================
const verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (!user.resetOTP || !user.resetOTPExpiry) {
      return res.status(400).json({ message: "No OTP requested. Please request a new one." });
    }

    if (new Date() > user.resetOTPExpiry) {
      user.resetOTP = null;
      user.resetOTPExpiry = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (user.resetOTP !== otp.toString().trim()) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify forgot password OTP error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ============================================================
// FORGOT PASSWORD — Reset Password
// ============================================================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (!user.resetOTP || !user.resetOTPExpiry) {
      return res.status(400).json({ message: "Session expired. Please start again." });
    }

    if (new Date() > user.resetOTPExpiry) {
      user.resetOTP = null;
      user.resetOTPExpiry = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please start again." });
    }

    if (user.resetOTP !== otp.toString().trim()) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    user.otpResendCount = 0;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now login." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
};