const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const verificationSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

module.exports = {
  userSchema,
  verificationSchema,
};