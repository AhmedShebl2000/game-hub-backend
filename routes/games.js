const express = require("express");
const router = express.Router();
const Game = require("../models/game");
const gameController = require("../controllers/gameController");

// Get all games with pagination
// Now the endpoint is: GET /api/games?page=2&limit=20
router.get("/", gameController.getGames);

//Get a game by name
router.get("/name", gameController.getGameByName);

// Add a game
router.post("/add", gameController.addGame);

//Get a game by id
router.get("/:id", gameController.getGameById);

// Delete a game by id
router.delete("/:id", gameController.deleteGame);

module.exports = router;
