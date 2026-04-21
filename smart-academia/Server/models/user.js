const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    // Avatar / profile photo (add after "qualification" field)
    avatar: {
      type: String,
      default: null,
    },
    avatarPublicId: {
      type: String,
      default: null,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true,
    },

    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Student fields
    studentId: { type: String, default: null },
    department: { type: String, default: null },
    semester: { type: String, default: null },

    // Teacher fields
    employeeId: { type: String, default: null },
    specialization: { type: String, default: null },
    qualification: { type: String, default: null },

    // OTP fields (used for both registration verification & forgot password)
    resetOTP: { type: String, default: null },
    resetOTPExpiry: { type: Date, default: null },
    otpResendCount: { type: Number, default: 0 },
    otpResendResetTime: { type: Date, default: null },
  },
  { timestamps: true },
);

// Mongoose 9.x: async pre hooks must NOT use next()
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
