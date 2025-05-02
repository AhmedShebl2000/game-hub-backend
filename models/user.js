const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");

// User Schema
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  last_name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
  phone: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 15,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },

  // 🔐 For Forgot Password
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpiry: {
    type: Date,
    default: null,
  },
});

// JWT Token Generation Method
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    process.env.SECRET_KEY
  );
  return token;
};

// ✅ Add this method to generate a reset token
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
