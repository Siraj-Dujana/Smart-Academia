const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    // ===== COMMON FIELDS =====
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
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      enum: ["student", "teacher"],
      required: true,
    },

    // ===== STUDENT SPECIFIC FIELDS =====
    studentId: {
      type: String,
      default: null,
      sparse: true,
      unique: true,
    },
    department: {
      type: String,
      enum: [
        null,
        "Computer Science",
        "Business Administration",
        "Mechanical Engineering",
        "Fine Arts",
        "Mathematics",
      ],
      default: null,
    },
    semester: {
      type: String,
      enum: [null, "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"],
      default: null,
    },

    // ===== TEACHER SPECIFIC FIELDS =====
    employeeId: {
      type: String,
      default: null,
      sparse: true,
      unique: true,
    },
    specialization: {
      type: String,
      default: null,
    },
    qualification: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ===== HASH PASSWORD BEFORE SAVING =====
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ===== METHOD TO COMPARE PASSWORD ON LOGIN =====
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);