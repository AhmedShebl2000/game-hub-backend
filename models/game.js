const mongoose = require("mongoose");
const Ajv = require("ajv");
const ajvFormats = require("ajv-formats");
const ajv = new Ajv();
ajvFormats(ajv); // Allow email, uri, etc. formats

// Platform Sub-schema
const platformSchema = new mongoose.Schema(
  {
    platformId: Number,
    name: String,
    slug: String,
  },
  { _id: false }
);

// Store Sub-schema
const storeSchema = new mongoose.Schema(
  {
    storeId: Number,
    name: String,
    slug: String,
    domain: String,
    url: String,
  },
  { _id: false }
);

// Tag Sub-schema
const tagSchema = new mongoose.Schema(
  {
    tagId: Number,
    name: String,
    slug: String,
  },
  { _id: false }
);

// ESRB Rating Sub-schema
const esrbRatingSchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    slug: String,
  },
  { _id: false }
);

// Screenshot Sub-schema
const screenshotSchema = new mongoose.Schema(
  {
    image: String,
  },
  { _id: false }
);

// Trailer/Video Sub-schema
const trailerSchema = new mongoose.Schema(
  {
    clip: String,
    preview: String,
  },
  { _id: false }
);

// Game Main Schema
const gameItemSchema = new mongoose.Schema(
  {
    rawgId: { type: Number, required: false, unique: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    released: { type: Date },
    backgroundImage: { type: String },
    rating: { type: Number },
    ratingTop: { type: Number },
    ratings: { type: [Object] },
    ratingsCount: { type: Number },
    metacritic: { type: Number },
    reviewsCount: { type: Number },
    platforms: { type: [platformSchema], default: [] },
    parentPlatforms: { type: [platformSchema], default: [] },
    stores: { type: [storeSchema], default: [] },
    tags: { type: [tagSchema], default: [] },
    esrbRating: { type: esrbRatingSchema },
    shortScreenshots: { type: [screenshotSchema], default: [] },
    trailers: { type: [trailerSchema], default: [] },

    // 🔹 New field to track purchases
    purchaseCount: { type: Number, default: 0, min: 0 },
    price: {
      type: Number,
      required: true,
      min: 0, // Price can't be negative
      default: 0, // Default to free if not specified
    },
  },
  { timestamps: true }
);

const Game = mongoose.model("Game", gameItemSchema);

module.exports = Game;
