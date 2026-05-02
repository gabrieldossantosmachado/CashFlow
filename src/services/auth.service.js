const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

const createToken = (userId) =>
  jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("E-mail já cadastrado.");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });
  const token = createToken(user._id.toString());

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("Credenciais inválidas.");
    error.statusCode = 401;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    const error = new Error("Credenciais inválidas.");
    error.statusCode = 401;
    throw error;
  }

  const token = createToken(user._id.toString());
  return {
    user: { id: user._id, name: user.name, email: user.email },
    token,
  };
};

module.exports = {
  register,
  login,
};
