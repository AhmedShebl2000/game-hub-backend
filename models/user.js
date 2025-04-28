const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Ajv = require("ajv");
const ajv = new Ajv();

// Address Schema
const addressSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  street: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
  zipCode: {
    type: String,
    required: true,
  },
  apartmentNumber: {
    type: String,
    required: false, // False as it's often optional
  },
  buildingNumber: {
    type: String,
    required: true,
  },
});

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
    maxlength: 20,
  },
  phone: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 15,
  },
  address: {
    type: addressSchema,
    required: true,
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
      format: "email",
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
    address: {
      type: "object",
      properties: {
        city: { type: "string", minLength: 2, maxLength: 50 },
        street: { type: "string", minLength: 2, maxLength: 100 },
        zipCode: { type: "string" },
        apartmentNumber: { type: "string" },
        buildingNumber: { type: "string" },
      },
      required: ["city", "street", "zipCode", "buildingNumber"],
      additionalProperties: false,
    },
  },
  required: [
    "first_name",
    "last_name",
    "email",
    "password",
    "phone",
    "address",
  ],
  additionalProperties: false,
};

// Compile the validation function
const validateUser = ajv.compile(userValidationSchema);

// JWT Token Generation Method
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
  return token;
};

// Create and export the User model
const User = mongoose.model("User", userSchema);

// Export both the model and validation function
module.exports = {
  User,
  validateUser,
};
