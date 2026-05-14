/**
 * Simula localmente o fluxo da CI: sobe a API, espera /api/health, Jest, Mocha.
 * Requer MongoDB acessivel (mesmo MONGODB_URI do .env) e JWT_SECRET.
 */

const path = require("path");
const http = require("http");
const { spawn, spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
require("dotenv").config({ path: path.join(root, ".env") });

const port = Number(process.env.PORT) || 3000;
const healthUrl = `http://127.0.0.1:${port}/api/health`;

function waitForHealth(maxMs) {
  const deadline = Date.now() + maxMs;
  return new Promise((resolve, reject) => {
    function attempt() {
      http
        .get(healthUrl, (res) => {
          let body = "";
          res.on("data", (c) => {
            body += c;
          });
          res.on("end", () => {
            if (res.statusCode === 200) {
              console.log("[health] OK:", body.trim());
              resolve();
            } else {
              retry();
            }
          });
        })
        .on("error", retry);

      function retry() {
        if (Date.now() > deadline) {
          reject(new Error(`Timeout aguardando GET /api/health (${healthUrl})`));
          return;
        }
        setTimeout(attempt, 2000);
      }
    }
    attempt();
  });
}

async function main() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.error("Defina MONGODB_URI e JWT_SECRET no .env antes de rodar este script.");
    process.exit(1);
  }

  console.log("1) Iniciando API (node src/server.js) em background...");
  const server = spawn(process.execPath, [path.join("src", "server.js")], {
    cwd: root,
    env: { ...process.env },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const logPrefix = (s) => (d) => process[s].write(`[api] ${d.toString()}`);
  server.stdout.on("data", logPrefix("stdout"));
  server.stderr.on("data", logPrefix("stderr"));

  let exitCode = 0;
  try {
    console.log("2) Aguardando API responder em /api/health...");
    await waitForHealth(60000);

    console.log("3) Rodando npm test (Jest)...");
    const jest = spawnSync("npm", ["test"], { cwd: root, stdio: "inherit", shell: true });
    if (jest.status !== 0) {
      exitCode = jest.status || 1;
      throw new Error("npm test falhou");
    }

    console.log("4) Rodando npm run test:api (Mocha)...");
    const mocha = spawnSync("npm", ["run", "test:api"], {
      cwd: root,
      stdio: "inherit",
      shell: true,
    });
    if (mocha.status !== 0) {
      exitCode = mocha.status || 1;
      throw new Error("npm run test:api falhou");
    }

    console.log("5) Fluxo completo concluido com sucesso (espelho da CI).");
  } catch (e) {
    console.error(e.message || e);
    exitCode = exitCode || 1;
  } finally {
    console.log("6) Encerrando processo da API...");
    server.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 1500));
    if (!server.killed && server.exitCode === null) {
      server.kill("SIGKILL");
    }
  }

  process.exit(exitCode);
}

main();
