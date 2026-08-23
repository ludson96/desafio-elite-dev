import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("deve inicializar com usuário e token nulos", () => {
    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it("deve definir usuário e token após setAuth", () => {
    const mockUser: User = {
      id: "usr-123",
      name: "João Silva",
      email: "joao@example.com",
      role: "CLIENT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useAuthStore.getState().setAuth(mockUser, "jwt-token-123");

    const state = useAuthStore.getState();
    expect(state.user?.name).toBe("João Silva");
    expect(state.token).toBe("jwt-token-123");
  });

  it("deve limpar o estado ao fazer logout", () => {
    const mockUser: User = {
      id: "usr-123",
      name: "João Silva",
      email: "joao@example.com",
      role: "CLIENT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useAuthStore.getState().setAuth(mockUser, "jwt-token-123");
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});
