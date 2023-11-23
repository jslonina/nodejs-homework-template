const User = require("./../models/userModel");

const checkUserExists = async (email) => {
  return await User.exists({ email: email });
};

const findUserByEmail = async (email) => {
  return await User.findOne({ email: email });
};
const findUserByID = async (id) => {
  return await User.findById(id);
};

const findUserByVerificationToken = async (token) => {
  return await User.findOne({ verificationToken: token });
};

const addUser = async (body) => {
  return await User.create(body);
};

module.exports = {
  checkUserExists,
  findUserByEmail,
  addUser,
  findUserByID,
  findUserByVerificationToken,
};