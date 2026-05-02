const app = require("./app");
const connectDatabase = require("./config/database");
const env = require("./config/env");

const bootstrap = async () => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET não configurada no ambiente.");
  }

  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`API rodando em ${env.baseUrl}`);
  });
};

bootstrap().catch((error) => {
  console.error("Falha ao inicializar a API:", error.message);
  process.exit(1);
});
