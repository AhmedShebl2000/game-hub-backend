const mongoose = require("mongoose");
const Ajv = require("ajv");
const ajvFormats = require("ajv-formats");
const ajv = new Ajv();
ajvFormats(ajv);

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
    wishlist: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: ["first_name", "last_name", "email", "password", "phone"],
  additionalProperties: false,
};

const validateUser = ajv.compile(userValidationSchema);

module.exports = {
  validateUser,
};
