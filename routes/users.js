const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { validateUser } = require("../validation/user.validation");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");

// Get all users
router.get("/", [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Fetch all users from the database
    res.status(200).json(users); // Return users as JSON
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Error fetching users", error });
  }
});

// Get user by id
router.get("/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("-password"); // Find user by ID
    if (!user) {
      return res.status(404).json({ message: "User not found" }); // If user is not found
    }
    res.status(200).json(user); // Return the user data as JSON
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Error fetching user", error });
  }
});

// add a user
router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ errMessage: error.details[0].message });

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).json({ errMessage: "User already registered." });

  user = new User(_.pick(req.body, ["first_name", "last_name", "email", "password", "phone"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.header("x-auth-token", token).send(_.pick(user, ["_id", "first_name", "last_name", "email", "phone"]));
});

module.exports = router;
