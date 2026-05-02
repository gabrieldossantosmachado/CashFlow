const mongoose = require("mongoose");
const env = require("./env");

const connectDatabase = async () => {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI não configurada no ambiente.");
  }

  await mongoose.connect(env.mongodbUri);
  // Mantém logs simples para o bootstrap inicial.
  console.log("MongoDB conectado com sucesso.");
};

module.exports = connectDatabase;
