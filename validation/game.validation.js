const Ajv = require("ajv");
const ajvFormats = require("ajv-formats");
const ajv = new Ajv();
ajvFormats(ajv);

const platformSchema = {
  type: "object",
  properties: {
    platformId: { type: "number" },
    name: { type: "string" },
    slug: { type: "string" },
  },
  required: ["platformId", "name", "slug"],
  additionalProperties: false,
};

const storeSchema = {
  type: "object",
  properties: {
    storeId: { type: "number" },
    name: { type: "string" },
    slug: { type: "string" },
    domain: { type: "string" },
    url: { type: "string", format: "uri" },
  },
  required: ["storeId", "name", "slug"],
  additionalProperties: false,
};

const gameValidationSchema = {
  type: "object",
  properties: {
    rawgId: { type: "integer" },
    slug: { type: "string" },
    name: { type: "string" },
    released: { type: "string", format: "date" },
    backgroundImage: { type: "string", format: "uri" },
    rating: { type: "number" },
    ratingTop: { type: "number" },
    ratingsCount: { type: "integer" },
    metacritic: { type: "integer" },
    reviewsCount: { type: "integer" },
    platforms: {
      type: "array",
      items: platformSchema,
    },
    parentPlatforms: {
      type: "array",
      items: platformSchema,
    },
    stores: {
      type: "array",
      items: storeSchema,
    },
    tags: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tagId: { type: "number" },
          name: { type: "string" },
          slug: { type: "string" },
        },
        required: ["tagId", "name", "slug"],
        additionalProperties: false,
      },
    },
    esrbRating: {
      type: "object",
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        slug: { type: "string" },
      },
      required: ["id", "name", "slug"],
      additionalProperties: false,
    },
    shortScreenshots: {
      type: "array",
      items: {
        type: "object",
        properties: {
          image: { type: "string", format: "uri" },
        },
        required: ["image"],
        additionalProperties: false,
      },
    },
    trailers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          clip: { type: "string", format: "uri" },
          preview: { type: "string", format: "uri" },
        },
        required: ["clip"],
        additionalProperties: false,
      },
    },
  },
  required: ["slug", "name"],
  additionalProperties: true,
};

const validateGame = ajv.compile(gameValidationSchema);

module.exports = {
  validateGame,
};
