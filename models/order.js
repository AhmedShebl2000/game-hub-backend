const mongoose = require("mongoose");
const Ajv = require("ajv");
const ajvFormats = require("ajv-formats");
const ajv = new Ajv();
ajvFormats(ajv); // Allow email, uri, etc. formats

// Order Item Schema
const orderItemSchema = new mongoose.Schema(
  {
    rawgId: { type: Number, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    backgroundImage: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    platform: {
      type: String,
      required: true,
      enum: ["PC", "PlayStation", "Xbox", "Nintendo", "Mobile", "Other"],
    },
    region: {
      type: String,
      enum: ["NA", "EU", "ASIA", "GLOBAL"],
      default: "GLOBAL",
    },
  },
  { _id: false }
);

// Order Schema
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "Order must have at least one item",
      },
    },

    payment: {
      method: {
        type: String,
        required: true,
        enum: ["credit_card", "paypal", "stripe", "crypto"],
      },
      transactionId: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
    },
    status: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    discount: {
      code: String,
      amount: Number,
    },
    total: { type: Number, required: true, min: 0 },
    notes: {
      type: String,
      maxlength: 500,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// AJV Validation Schema (shippingFee and shippingAddress removed)
const orderValidationSchema = {
  type: "object",
  properties: {
    user: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
    items: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          rawgId: { type: "integer" },
          name: { type: "string" },
          slug: { type: "string" },
          backgroundImage: { type: "string", format: "uri" },
          price: { type: "number", minimum: 0 },
          platform: {
            type: "string",
            enum: ["PC", "PlayStation", "Xbox", "Nintendo", "Mobile", "Other"],
          },
          region: {
            type: "string",
            enum: ["NA", "EU", "ASIA", "GLOBAL"],
          },
        },
        required: [
          "rawgId",
          "name",
          "slug",
          "backgroundImage",
          "price",
          "platform",
        ],
        additionalProperties: false,
      },
    },

    payment: {
      type: "object",
      properties: {
        method: {
          type: "string",
          enum: ["credit_card", "paypal", "stripe", "crypto"],
        },
        transactionId: { type: "string" },
        status: {
          type: "string",
          enum: ["pending", "completed", "failed", "refunded"],
        },
      },
      required: ["method", "transactionId"],
      additionalProperties: false,
    },
    subtotal: { type: "number", minimum: 0 },
    tax: { type: "number", minimum: 0 },
    discount: {
      type: "object",
      properties: {
        code: { type: "string" },
        amount: { type: "number", minimum: 0 },
      },
      additionalProperties: false,
    },
    total: { type: "number", minimum: 0 },
  },
  required: ["user", "items", "payment", "subtotal", "tax", "total"],
  additionalProperties: false,
};

const validateOrder = ajv.compile(orderValidationSchema);

const Order = mongoose.model("Order", orderSchema);

module.exports = {
  Order,
  validateOrder,
};
