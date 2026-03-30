const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ===== STEP 1: Send OTP to email =====
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Generate OTP and set expiry to 10 minutes from now
    const otp = generateOTP();
    console.log("my name is siraj");
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user (plain text — we verify directly)
    user.resetOTP = otp;
    user.resetOTPExpiry = expiry;
    await user.save();

    // Send email
    await sendEmail({
      to: user.email,
      subject: "SmartAcademia — Your Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2563eb; font-size: 24px; margin: 0;">SmartAcademia</h1>
            <p style="color: #6b7280; margin-top: 4px;">Password Reset Request</p>
          </div>

          <div style="background: white; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; margin: 0 0 16px;">Hi <strong>${user.fullName}</strong>,</p>
            <p style="color: #374151; margin: 0 0 24px;">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>

            <div style="text-align: center; margin: 24px 0;">
              <div style="display: inline-block; background: #eff6ff; border: 2px dashed #2563eb; border-radius: 12px; padding: 16px 40px;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #1d4ed8;">${otp}</span>
              </div>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin: 0; text-align: center;">
              If you didn't request this, please ignore this email.
            </p>
          </div>

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} SmartAcademia · Sukkur IBA University
          </p>
        </div>
      `,
    });

    res.status(200).json({
      message: `OTP sent to ${user.email}`,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

// ===== STEP 2: Verify OTP =====
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Check OTP exists
    if (!user.resetOTP || !user.resetOTPExpiry) {
      return res.status(400).json({ message: "No OTP requested. Please request a new one." });
    }

    // Check OTP expiry
    if (new Date() > user.resetOTPExpiry) {
      user.resetOTP = null;
      user.resetOTPExpiry = null;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Check OTP match
    if (user.resetOTP !== otp.toString().trim()) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // OTP is valid
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ===== STEP 3: Reset Password =====
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

    // Re-verify OTP one more time for security
    if (!user.resetOTP || !user.resetOTPExpiry) {
      return res.status(400).json({ message: "No OTP requested. Please start again." });
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

    // All good — update password and clear OTP
    user.password = newPassword;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now login." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = { sendOTP, verifyOTP, resetPassword };