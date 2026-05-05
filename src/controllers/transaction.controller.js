const transactionService = require("../services/transaction.service");

const create = async (req, res, next) => {
  try {
    const payload = await transactionService.create(req.user.id, req.body);
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
};
