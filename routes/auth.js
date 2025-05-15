const bcrypt = require("bcrypt");
const User = require("../models/user");
const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const jwt = require("jsonwebtoken");
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
    const resetLink = `https://game-hub-iti.netlify.app/reset-password/${resetToken}`;

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

// router.post("/google", async (req, res) => {
//   console.log("Body:", req.body.credential);

//   const credential = req.body.credential;
//   if (!credential) {
//     return res.status(400).json({ error: "Credential is missing" });
//   }
//   // return res.redirect("http://localhost:4200/home");

//   return res
//     .status(200)
//     .json({ message: "Logged in with Google", credential: credential });
// });

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(`${process.env.GOOGLE_CLIENT_ID2}`);

//
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    // ✅ Log the received credential
    console.log(
      "Received credential (first 100 chars):",
      credential?.substring(0, 100)
    );

    if (!credential) {
      return res.status(400).json({ error: "Credential is missing" });
    }

    // ✅ Log expected audience (your Google Client ID)
    console.log("Expected audience:", process.env.GOOGLE_CLIENT_ID2);

    // 1. Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID2,
    });

    // 2. Extract user data
    const payload = ticket.getPayload();
    console.log("Decoded Google payload:", payload);

    const { email, name, sub: googleId } = payload;

    // 3. Check if user exists in your DB (or create a new one)
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name, googleId });
      console.log("New user created:", user);
    } else {
      console.log("Existing user found:", user);
    }

    // 4. Generate your own JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    // ✅ Log generated token
    console.log("JWT token generated:", token);

    // 5. Send the token and user data to the frontend
    res.status(200).json({
      message: "Logged in with Google",
      token,
      user: { email, name },
    });
  } catch (error) {
    console.error("❌ Google auth error:", error);
    res.status(401).json({ error: "Invalid credential" });
  }
});

module.exports = router;
