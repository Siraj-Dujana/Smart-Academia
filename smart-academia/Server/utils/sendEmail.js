const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"SmartAcademia" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

// OTP email template (used for both registration & forgot password)
const otpEmailTemplate = ({ fullName, otp, purpose }) => {
  const purposeText =
    purpose === "registration"
      ? "verify your email address and complete your registration"
      : "reset your password";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2563eb; font-size: 26px; margin: 0;">SmartAcademia</h1>
        <p style="color: #6b7280; margin-top: 4px; font-size: 14px;">Sukkur IBA University</p>
      </div>

      <div style="background: white; border-radius: 10px; padding: 28px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
        <p style="color: #374151; margin: 0 0 12px; font-size: 15px;">
          Hi <strong>${fullName}</strong>,
        </p>
        <p style="color: #374151; margin: 0 0 24px; font-size: 14px; line-height: 1.6;">
          Use the OTP below to ${purposeText}. It expires in <strong>10 minutes</strong>.
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: #eff6ff; border: 2px dashed #2563eb; border-radius: 14px; padding: 18px 44px;">
            <span style="font-size: 38px; font-weight: bold; letter-spacing: 14px; color: #1d4ed8; font-family: monospace;">${otp}</span>
          </div>
        </div>

        <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
          This OTP is valid for 10 minutes only.<br/>
          If you didn't request this, please ignore this email.
        </p>
      </div>

      <p style="color: #d1d5db; font-size: 11px; text-align: center; margin: 0;">
        © ${new Date().getFullYear()} SmartAcademia · Sukkur IBA University · Final Year Project
      </p>
    </div>
  `;
};

module.exports = { sendEmail, otpEmailTemplate };