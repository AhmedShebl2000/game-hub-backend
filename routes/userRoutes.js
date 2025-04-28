const express = require("express");
const router = express.Router();
const { User, validateUser } = require("../models/user");

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.status(200).json(users); // Return users as JSON
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Error fetching users", error });
  }
});

// Get user by id
router.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id); // Find user by ID
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
router.post("/users/add", async (req, res) => {
  try {
    // Validate user input before proceeding
    const valid = validateUser(req.body); // Validate against AJV schema
    if (!valid) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validateUser.errors, // Return the AJV validation errors
      });
    }

    // If validation passes, proceed to create a new user
    const { first_name, last_name, email, password, phone, address } = req.body;
    const newUser = new User({
      first_name,
      last_name,
      email,
      password,
      phone,
      address,
    });

    await newUser.save();

    res.status(201).json({ message: "New user added", user: newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error adding user" });
  }
});

module.exports = router;
