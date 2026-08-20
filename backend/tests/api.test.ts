import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("Integração: API Endpoints (E2E / Integration)", () => {
  it("GET /health deve responder com status ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("GET /api/catalog/search deve retornar itens do catálogo", async () => {
    const res = await request(app).get("/api/catalog/search").query({ query: "Duna", type: "MOVIE" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("title");
  });

  it("GET /api/events deve listar os eventos públicos cadastrados", async () => {
    const res = await request(app).get("/api/events");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "success");
    expect(res.body.data).toHaveProperty("events");
    expect(Array.isArray(res.body.data.events)).toBe(true);
  });

  it("POST /api/auth/login deve autenticar o organizador semeado com sucesso", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "organizador@verzel.com",
      password: "wrong-password",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("status", "error");
    expect(res.body).toHaveProperty("message", "E-mail ou senha incorretos");
  });
});
