const jwt = require("jsonwebtoken");

const tokenMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, data) => {
    if (err) {
      return res.status(404).json({ message: "Not Found" });
    }
    req.user = data;
    next();
  });
};
module.exports = tokenMiddleware;