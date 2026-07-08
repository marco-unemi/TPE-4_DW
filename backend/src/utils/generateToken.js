const jwt = require("jsonwebtoken");

const generateToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

module.exports = generateToken;
