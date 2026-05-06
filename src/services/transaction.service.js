const Transaction = require("../models/Transaction");

const VALID_TYPES = new Set(["debito", "credito"]);

const validateCreateTransactionPayload = (body) => {
  if (!body || typeof body !== "object") {
    const error = new Error("Corpo da requisição inválido.");
    error.statusCode = 400;
    throw error;
  }

  const { tipo, descricao, valor, data_lancamento } = body;

  if (!VALID_TYPES.has(tipo)) {
    const error = new Error('Tipo inválido. Use "debito" ou "credito".');
    error.statusCode = 400;
    throw error;
  }

  if (descricao === undefined || descricao === null || String(descricao).trim() === "") {
    const error = new Error("descricao é obrigatória.");
    error.statusCode = 400;
    throw error;
  }

  if (
    valor === undefined ||
    valor === null ||
    typeof valor !== "number" ||
    Number.isNaN(valor) ||
    valor <= 0
  ) {
    const error = new Error("valor deve ser um número maior que zero.");
    error.statusCode = 400;
    throw error;
  }

  if (
    data_lancamento === undefined ||
    data_lancamento === null ||
    String(data_lancamento).trim() === ""
  ) {
    const error = new Error("data_lancamento é obrigatória.");
    error.statusCode = 400;
    throw error;
  }

  const dataLancamento = new Date(data_lancamento);
  if (Number.isNaN(dataLancamento.getTime())) {
    const error = new Error("data_lancamento inválida.");
    error.statusCode = 400;
    throw error;
  }

  return {
    tipo,
    descricao: String(descricao).trim(),
    valor,
    data_lancamento: dataLancamento,
  };
};

const formatTransaction = (doc) => ({
  id: doc._id,
  tipo: doc.tipo,
  descricao: doc.descricao,
  valor: doc.valor,
  data_lancamento: doc.data_lancamento,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const create = async (userId, body) => {
  const normalized = validateCreateTransactionPayload(body);
  const doc = await Transaction.create({
    userId,
    ...normalized,
  });
  return formatTransaction(doc);
};

const listByUser = async (userId) => {
  const docs = await Transaction.find({ userId })
    .sort({ data_lancamento: -1 })
    .lean();

  const creditos = [];
  const debitos = [];
  let totalCredito = 0;
  let totalDebito = 0;

  for (const doc of docs) {
    const item = formatTransaction(doc);
    if (doc.tipo === "credito") {
      creditos.push(item);
      totalCredito += doc.valor;
    } else {
      debitos.push(item);
      totalDebito += doc.valor;
    }
  }

  return {
    creditos,
    debitos,
    totais: { credito: totalCredito, debito: totalDebito },
  };
};

module.exports = {
  create,
  validateCreateTransactionPayload,
  listByUser,
};
