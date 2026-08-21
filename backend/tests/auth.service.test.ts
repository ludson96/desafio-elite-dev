import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../src/services/auth.service.js";
import { AppError } from "../src/utils/AppError.js";
import type { UserRepository } from "../src/repositories/user.repository.js";

describe("AuthService (Unit Tests)", () => {
  let authService: AuthService;
  let mockUserRepo: UserRepository;

  beforeEach(() => {
    mockUserRepo = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
    } as unknown as UserRepository;

    authService = new AuthService(mockUserRepo);
  });

  it("deve registrar um novo usuário com sucesso", async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);
    vi.mocked(mockUserRepo.create).mockResolvedValue({
      id: "u-1",
      name: "Teste",
      email: "novo@verzel.com",
      passwordHash: "hashed",
      role: "CLIENT",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await authService.register({
      name: "Teste",
      email: "novo@verzel.com",
      password: "password123",
      role: "CLIENT",
    });

    expect(result).toHaveProperty("user");
    expect(result).toHaveProperty("token");
    expect(result.user.email).toBe("novo@verzel.com");
    expect(mockUserRepo.create).toHaveBeenCalledOnce();
  });

  it("deve lançar AppError 409 se o e-mail já estiver cadastrado", async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue({
      id: "u-existing",
      email: "existente@verzel.com",
    } as any);

    await expect(
      authService.register({
        name: "Teste",
        email: "existente@verzel.com",
        password: "password123",
        role: "CLIENT",
      })
    ).rejects.toThrow(AppError);
  });

  it("deve lançar AppError 401 se o usuário não for encontrado no login", async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);

    await expect(
      authService.login({
        email: "naoexiste@verzel.com",
        password: "password123",
      })
    ).rejects.toThrow("E-mail ou senha incorretos");
  });
});
