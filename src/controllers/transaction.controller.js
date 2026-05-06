const transactionService = require("../services/transaction.service");

const list = async (req, res, next) => {
  try {
    const payload = await transactionService.listByUser(req.user.id);
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const payload = await transactionService.create(req.user.id, req.body);
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  create,
};
