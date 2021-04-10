const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");

module.exports.generateToken = (user) =>
  jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
    expiresIn: "1h",
  });
