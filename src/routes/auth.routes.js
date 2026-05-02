const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({ userId: req.user.id });
});

module.exports = authRoutes;
