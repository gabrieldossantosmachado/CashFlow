const { Router } = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const transactionRoutes = Router();

transactionRoutes.get("/", authMiddleware, transactionController.list);
transactionRoutes.post("/", authMiddleware, transactionController.create);

module.exports = transactionRoutes;
