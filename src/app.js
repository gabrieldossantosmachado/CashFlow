const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const routes = require("./routes");

const swaggerDocument = YAML.load("./src/docs/swagger.yaml");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Erro interno do servidor.";
  res.status(statusCode).json({ message });
});

module.exports = app;
