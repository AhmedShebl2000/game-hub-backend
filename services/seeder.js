require("dotenv").config();
const mongoose = require("mongoose");
const { Game } = require("../models/game"); // Adjust the path if needed
const rawgGames = require("../rawgGames.json"); // The JSON file with RAWG games

// Connect to DB
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection failed:", error));

// Function to insert games
async function seedGames() {
  try {
    const gamesToInsert = rawgGames.results.map((game) => ({
      rawgId: game.id,
      slug: game.slug,
      name: game.name,
      released: game.released,
      backgroundImage: game.background_image,
      rating: game.rating,
      ratingTop: game.rating_top,
      ratings: game.ratings,
      ratingsCount: game.ratings_count,
      metacritic: game.metacritic,
      reviewsCount: game.reviews_count,
      platforms: (game.platforms || []).map((p) => ({
        platformId: p.platform.id,
        name: p.platform.name,
        slug: p.platform.slug,
      })),
      parentPlatforms: (game.parent_platforms || []).map((p) => ({
        platformId: p.platform.id,
        name: p.platform.name,
        slug: p.platform.slug,
      })),
      stores: (game.stores || []).map((s) => ({
        storeId: s.store.id,
        name: s.store.name,
        slug: s.store.slug,
        domain: "", // RAWG store info can be expanded if you want
        url: "", // Fill in manually or ignore
      })),
      tags: (game.tags || []).map((t) => ({
        tagId: t.id,
        name: t.name,
        slug: t.slug,
      })),
      esrbRating: game.esrb_rating
        ? {
            id: game.esrb_rating.id,
            name: game.esrb_rating.name,
            slug: game.esrb_rating.slug,
          }
        : undefined,
      shortScreenshots: (game.short_screenshots || []).map((s) => ({
        image: s.image,
      })),
      trailers: [], // Leave empty for now unless you fetch videos
    }));

    await Game.insertMany(gamesToInsert);
    console.log("Games seeded successfully!");
  } catch (error) {
    console.error("Error seeding games:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedGames();
