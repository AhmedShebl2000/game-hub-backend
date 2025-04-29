const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Ajv = require("ajv");
const ajvFormats = require("ajv-formats");
const ajv = new Ajv();
ajvFormats(ajv);

// User Schema
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  last_name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
  phone: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 15,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

// AJV Validation Schema
const userValidationSchema = {
  type: "object",
  properties: {
    first_name: {
      type: "string",
      minLength: 3,
      maxLength: 50,
    },
    last_name: {
      type: "string",
      minLength: 3,
      maxLength: 50,
    },
    email: {
      type: "string",
      format: "email", // Ensure "email" format is recognized
      minLength: 5,
      maxLength: 255,
    },
    password: {
      type: "string",
      minLength: 5,
      maxLength: 20,
    },
    phone: {
      type: "string",
      minLength: 10,
      maxLength: 15,
    },
  },
  required: ["first_name", "last_name", "email", "password", "phone"],
  additionalProperties: false,
};

// Compile the validation function
const validateUser = ajv.compile(userValidationSchema);

// JWT Token Generation Method
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    process.env.SECRET_KEY
  );
  return token;
};

// Create and export the User model
const User = mongoose.model("User", userSchema);

// Export both the model and validation function
module.exports = {
  User,
  validateUser,
};
