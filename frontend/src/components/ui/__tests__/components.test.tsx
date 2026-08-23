import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Badge } from "../Badge";
import { Button } from "../Button";

describe("UI Components", () => {
  describe("Badge", () => {
    it("should render children correctly", () => {
      render(<Badge>Status Ativo</Badge>);
      expect(screen.getByText("Status Ativo")).toBeInTheDocument();
    });

    it("should apply variant styles correctly", () => {
      const { container } = render(<Badge variant="success">Sucesso</Badge>);
      expect(container.firstChild).toHaveClass("bg-emerald-500/10");
    });
  });

  describe("Button", () => {
    it("should render button text and handle click", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Clique Aqui</Button>);

      const button = screen.getByRole("button", { name: /clique aqui/i });
      expect(button).toBeInTheDocument();

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should be disabled and show loading state when isLoading is true", () => {
      render(<Button isLoading>Processando</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });
});
