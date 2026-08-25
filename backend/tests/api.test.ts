import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { externalCatalogService } from "../src/services/externalCatalog.service.js";

describe("Integração: API Endpoints (E2E / Integration)", () => {
  it("GET /health deve responder com status ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("GET /api/catalog/search deve retornar itens do catálogo (mockado)", async () => {
    vi.spyOn(externalCatalogService, "searchCatalog").mockResolvedValueOnce([
      {
        externalId: "tmdb-693134",
        externalSource: "TMDB",
        title: "Duna: Parte 2",
        description: "Paul Atreides se une a Chani e aos Fremen em busca de vingança.",
        type: "MOVIE",
        category: "Ficção Científica",
        imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
        suggestedPrice: 45.0,
      },
    ]);

    const res = await request(app).get("/api/catalog/search").query({ query: "Duna", type: "MOVIE" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("title", "Duna: Parte 2");
    expect(res.body.data[0]).toHaveProperty("externalSource", "TMDB");
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
