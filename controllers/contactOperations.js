const Contact = require("./../models/contactModel");

const listContacts = async (id) => {
  return await Contact.find({ owner: id });
};

const getContactById = async (contactId) => {
  return await Contact.findById(contactId);
};

const removeContact = async (contactId) => {
  return await Contact.deleteOne({ _id: contactId });
};
const addContact = async (body, id) => {
  const { name, email, phone } = body;
  return await Contact.create({ name, email, phone, owner: id });
};

const updateContact = async (contactId, body) => {
  return await Contact.findByIdAndUpdate(contactId, body);
};

const updateFavorite = async (contactId, body) => {
  return await Contact.findByIdAndUpdate(contactId, body);
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateFavorite,
};