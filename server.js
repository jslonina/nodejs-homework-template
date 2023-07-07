const app = require("./app");
const createFolder = require("./helpers");

app.listen(3000, () => {
  createFolder(".tmp");
  createFolder("./public");
  createFolder("./public/avatars");
  console.log("Server running. Use our API on port: 3000");
});