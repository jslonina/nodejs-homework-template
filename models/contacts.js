const Joi = require("joi");

const addContactSchema = Joi.object({
  name: Joi.string().min(2).max(25).required(),
  email: Joi.string().email().lowercase().required(),
  phone: Joi.string().min(7).required(),
});

const updateContactSchema = Joi.object({
  name: Joi.string().min(2).max(20),
  email: Joi.string().email().lowercase(),
  phone: Joi.string().min(7),
}).min(1);

const favoriteSchema = Joi.object({
  favorite: Joi.bool().required(),
});

module.exports = {
  addContactSchema,
  updateContactSchema,
  favoriteSchema,
};