// services/emailService.js
const nodemailer = require("nodemailer");
require("dotenv").config();

// Function to send the reset password email
const sendResetEmail = async (email, resetLink) => {
  try {
    console.log("Sending email to:", email);
    console.log("Reset link:", resetLink);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    // Verify transporter
    await transporter.verify();
    console.log("✅ Transporter is ready");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Reset your password using the link: ${resetLink}`,
      html: `<p>Reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};

module.exports = { sendResetEmail };
