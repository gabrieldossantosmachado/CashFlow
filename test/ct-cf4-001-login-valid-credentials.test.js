/**
 * CT-CF4-001 — Validar login com usuário ativo, e-mail válido e senha correta
 *
 * Rastreabilidade: CF-4 — [API] Realizar login de usuário no CashFlow
 * (usuário ativo = Sim; e-mail cadastrado = Sim; senha correta = Sim)
 *
 * Pré-condições: API disponível; usuário cadastrado; e-mail e senha válidos conhecidos.
 * Endpoint (OpenAPI): POST /api/auth/login
 */

const { expect } = require("chai");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../src/app");
const connectDatabase = require("../src/config/database");
const env = require("../src/config/env");

describe("CT-CF4-001 — Login com credenciais válidas", () => {
  const password = "SenhaCtCf4001!";
  let email;
  let name;

  before(async () => {
    if (!env.mongodbUri || !env.jwtSecret) {
      throw new Error(
        "Configure MONGODB_URI e JWT_SECRET no .env para executar este teste de integração."
      );
    }
    await connectDatabase();
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    email = `ct-cf4-001-${suffix}@test.local`;
    name = "Usuário CT-CF4-001";

    await request(app)
      .post("/api/auth/register")
      .send({ name, email, password })
      .expect(201);
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it("Passo 1 — payload com e-mail válido e senha preenchida", () => {
    expect(email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(password).to.be.a("string").that.is.not.empty;
  });

  it("Passo 2 — POST /api/auth/login retorna HTTP 200", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password })
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).to.be.an("object");
  });

  it("Passo 3 — corpo: JWT válido (assinatura e expiração), user sem dados sensíveis da senha", async () => {
    const { body } = await request(app)
      .post("/api/auth/login")
      .send({ email, password })
      .expect(200);

    expect(body).to.have.property("token").that.is.a("string").that.is.not.empty;
    expect(body).to.have.property("user").that.is.an("object");
    expect(body.user).to.include.keys("id", "name", "email");
    expect(body.user.email).to.equal(email.toLowerCase());
    expect(body.user).to.not.have.property("password");
    expect(body).to.not.have.property("password");

    const decoded = jwt.verify(body.token, env.jwtSecret);
    expect(decoded).to.have.property("sub").that.is.a("string");
    expect(decoded).to.have.property("exp").that.is.a("number");
    expect(decoded).to.have.property("iat").that.is.a("number");
    expect(decoded.exp).to.be.greaterThan(decoded.iat);

    const nowSec = Math.floor(Date.now() / 1000);
    expect(decoded.exp).to.be.greaterThan(nowSec);
  });

  it("Pós-condição — token aceito em GET /api/auth/me", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password })
      .expect(200);

    await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).to.have.property("userId");
      });
  });
});
