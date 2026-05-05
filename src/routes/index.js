const { Router } = require("express");
const authRoutes = require("./auth.routes");
const transactionRoutes = require("./transaction.routes");

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);

module.exports = router;
