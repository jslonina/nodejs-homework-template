const mongoose = require("mongoose");

const dbpath = process.env.DB_PATH;

if (!dbpath) {
  console.error("No db secret...");
}

const connectDatabase = async () => {
  await mongoose
    .connect(dbpath)
    .then(() => console.log("Database connection successful"))
    .catch((err) => {
      console.log("error to connect db" + err);
      process.exit(1);
    });
};

module.exports = { connectDatabase };