const Game = require("../models/game");
const { validateGame } = require("../validation/game.validation");
const axios = require("axios");

// Get all games with pagination
exports.getGames = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

    const rawSort = req.query.sort?.toLowerCase(); // e.g., "-name" or "name"
    let sort = {};

    if (rawSort) {
      const direction = rawSort.startsWith("-") ? -1 : 1;
      const key = rawSort.replace("-", "");

      const sortMap = {
        name: "name",
        releasedate: "released",
        popularity: "ratingsCount",
        average_rating: "rating",
        price: "rating",
      };

      if (sortMap[key]) {
        sort = { [sortMap[key]]: direction }; // gonna use it in future
      }
    }

    const platformFilter = req.query.platform?.toLowerCase();
    const filter = {};

    if (platformFilter && platformFilter !== "all") {
      filter["parentPlatforms.slug"] = platformFilter;
    }

    console.log(`Page=${page}, Limit=${limit}, Sort=${JSON.stringify(sort)}, Platform=${platformFilter || "all"}`);

    const [games, total] = await Promise.all([
      Game.find(filter)
        .collation({ locale: "en", strength: 2 }) // Case-insensitive sorting
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Game.countDocuments(filter),
    ]);

    return res.json({
      data: games,
      meta: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
        sort: rawSort || "relevance",
        platform: platformFilter || "all",
      },
    });
  } catch (error) {
    console.error("Pagination error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

//Get a game by name
exports.getGameByName = async (req, res) => {
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
};

// Add a game
exports.addGame = async (req, res) => {
  const gameData = req.body;

  // Validate the incoming data using AJV
  const valid = validateGame(gameData);
  if (!valid) {
    return res.status(400).json({ message: "Validation failed", errors: validateGame.errors });
  }

  try {
    // Create a new Game instance
    const newGame = new Game(gameData);

    // Save the new game to the database
    await newGame.save();

    res.status(201).json({ message: "Game added successfully", game: newGame });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error adding game", error: error.message });
  }
};

//Get a game by slug name
exports.getGameBySlugName = async (req, res) => {
  const { slug } = req.params;
  try {
    const game = await Game.findOne({ slug });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.status(200).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching game by slug", error });
  }
};

// Delete a game by id
exports.deleteGame = async (req, res) => {
  const { id } = req.params;
  try {
    const game = await Game.findByIdAndDelete(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.status(200).json({ message: "Game deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to delete game", error: error.message });
  }
};

// Get a game by ID
exports.getGameById = async (req, res) => {
  const { rawgId } = req.params;
  try {
    const game = await Game.findOne({ rawgId: Number(rawgId) });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.status(200).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching game by rawgId", error });
  }
};

const API_KEY = "d051469136ff47d4a42aee5ae0a3709f";

// Helper to clean HTML tags from RAWG descriptions
function cleanDescription(description) {
  if (!description) return "";
  return description.replace(/<[^>]*>/g, "").trim();
}

async function updateDescriptionsFromRawg() {
  try {
    let page = 1;
    let hasMoreGames = true;

    while (hasMoreGames) {
      const response = await axios.get("https://api.rawg.io/api/games", {
        params: {
          key: API_KEY,
          page,
          page_size: 20,
        },
      });

      const games = response.data.results;
      hasMoreGames = response.data.next !== null;

      for (const game of games) {
        try {
          //  Get full details for accurate description
          const detailResponse = await axios.get(`https://api.rawg.io/api/games/${game.id}`, {
            params: { key: API_KEY },
          });

          const detailedGame = detailResponse.data;
          const cleanedDescription = cleanDescription(detailedGame.description);

          //  Only update games that exist in your MongoDB
          const existingGame = await Game.findOne({ rawgId: game.id });

          if (existingGame) {
            existingGame.description = cleanedDescription;
            await existingGame.save();
            console.log(`✅ Updated: ${existingGame.name}`);
          } else {
            console.log(`⏭️ Skipped (not in DB): ${game.name}`);
          }
        } catch (err) {
          console.error(`Error processing ${game.name}:`, err.message);
        }
      }

      page++; //  Go to next page
    }
  } catch (error) {
    console.error("Error fetching games list:", error.message);
  }
}

/* 
  don't invoke it
  let it for reference


  updateDescriptionsFromRawg();
*/
