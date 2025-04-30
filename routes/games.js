const express = require("express");
const router = express.Router();
const Game = require("../models/game");
const { validateGame } = require("../validation/game.validation");

// Get all games with pagination
// Now the endpoint is: GET /api/games?page=2&limit=20
router.get("/", async (req, res) => {
  try {
    // Parse page and limit from query params, with defaults
    const page = parseInt(req.query.page) || 1; // default to page 1
    const limit = parseInt(req.query.limit) || 20; // default to 20 items per page

    const skip = (page - 1) * limit;

    // Fetch total count for pagination metadata
    const totalGames = await Game.countDocuments();

    // Fetch paginated games
    const games = await Game.find().skip(skip).limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalGames / limit),
      totalItems: totalGames,
      games,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching games", error });
  }
});

//Get a game by name
router.get("/name", async (req, res) => {
  const { name } = req.query; // Get the name from the query parameters
  try {
    const game = await Game.find({ name: { $regex: name, $options: "i" } }); // Use regex to search for the game name
    if (game.length === 0) {
      return res.status(404).json({ message: "Game not found" }); // If game is not found
    }
    res.status(200).json(game); // Return the found game(s)
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error fetching game", error });
  }
});

//Get a game by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" }); // If game is not found
    }
    res.status(200).json(game);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error fetching game", error });
  }
});

// Add a game
router.post("/add", async (req, res) => {
  const gameData = req.body;

  // Validate the incoming data using AJV
  const valid = validateGame(gameData);
  if (!valid) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: validateGame.errors });
  }

  try {
    // Create a new Game instance
    const newGame = new Game(gameData);

    // Save the new game to the database
    await newGame.save();

    res.status(201).json({ message: "Game added successfully", game: newGame });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error adding game", error: error.message });
  }
});

//Delete a game by id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const game = await Game.findByIdAndDelete(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.status(200).json({ message: "Game deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Failed to delete game", error: error.message });
  }
});

module.exports = router;
