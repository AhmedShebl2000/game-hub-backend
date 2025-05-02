const bcrypt = require("bcrypt");
const User = require("../models/user");
const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const { validateLoginRequest } = require("../validation/login.validation");
const { sendResetEmail } = require("../services/emailService"); // Import the sendResetEmail function

router.post("/", async (req, res) => {
  const validation = validateLoginRequest(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      error: "Validation failed",
      details: validation.errors,
    });
  }

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken();
  res.json({
    token: token,
  });
});

//Forgot Password Endpoint
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Validate the email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ error: "User with this email does not exist" });
    }

    // Generate and save the reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Generate the reset link
    const resetLink = `https://game-hub-backend-woad.vercel.app/api/auth/reset-password/${resetToken}`;

    // Send email with the reset link
    await sendResetEmail(user.email, resetLink);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
});

// Reset Password Endpoint
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params; // Get the token from URL params
  const { newPassword } = req.body;

  console.log("Received Token:", token);
  console.log("New Password:", newPassword);

  if (!newPassword || newPassword.length < 5) {
    return res
      .status(400)
      .json({ error: "Password must be at least 5 characters long." });
  }

  // Hash the token from URL to compare with the stored hash
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find the user by the hashed reset token and check if the token is expired
  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpiry: { $gt: Date.now() }, // Ensure token is not expired
  });

  console.log("User found:", user);

  if (!user) {
    return res.status(400).json({ error: "Invalid or expired token." });
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // Clear reset token and expiration
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  await user.save();

  res.json({ message: "Password successfully reset." });
});

module.exports = router;
