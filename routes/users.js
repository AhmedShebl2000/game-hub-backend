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

// Get User Wishlist
router.get("/wishlist", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const wishlist = user.wishlist;
    if (wishlist.length === 0) {
      return res.status(200).json({ message: "Wishlist is empty" });
    } else {
      return res.status(200).json({ wishlist });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ message: "Error fetching user wishlist", error });
  }
});

// Add to user wishlist
router.put("/wishlist", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { gameId } = req.body;
    if (!gameId) {
      return res.status(400).json({ message: "Game ID is required" });
    }
    // Check if the gameId already exists in the wishlist
    const gameExists = user.wishlist.includes(gameId);
    if (gameExists) {
      return res.status(400).json({ message: "Game already in wishlist" });
    }
    // Add the gameId to the wishlist
    user.wishlist.push(gameId);
    await user.save();
    return res
      .status(200)
      .json({ message: "Game added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "Error updating user wishlist.", error });
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
  if (error)
    return res.status(400).json({ errMessage: error.details[0].message });

  let user = await User.findOne({ email: req.body.email });
  if (user)
    return res.status(400).json({ errMessage: "User already registered." });

  user = new User(
    _.pick(req.body, ["first_name", "last_name", "email", "password", "phone"])
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "first_name", "last_name", "email", "phone"]));
});

// Remove game from wishlist
router.delete("/wishlist/:gameId", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { gameId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.wishlist.indexOf(gameId);
    if (index === -1) {
      return res.status(404).json({ message: "Game not found in wishlist" });
    }

    user.wishlist.splice(index, 1);
    await user.save();

    return res
      .status(200)
      .json({ message: "Game removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
