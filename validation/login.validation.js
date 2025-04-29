const Ajv = require("ajv");
const ajvFormats = require("ajv-formats");
const ajv = new Ajv();
ajvFormats(ajv);

const loginSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      format: "email",
      minLength: 5,
      maxLength: 255,
    },
    password: {
      type: "string",
      minLength: 5,
      maxLength: 255,
    },
  },
  required: ["email", "password"],
  additionalProperties: false,
};

const validateLogin = ajv.compile(loginSchema);

function validateLoginRequest(reqBody) {
  const valid = validateLogin(reqBody);
  if (!valid) {
    return {
      isValid: false,
      errors: validateLogin.errors.map((err) => ({
        field: err.instancePath.substring(1),
        message: err.message,
      })),
    };
  }
  return { isValid: true };
}

module.exports = { validateLoginRequest };
