import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

describe("UI Components", () => {
  describe("Badge", () => {
    it("deve renderizar o texto do badge corretamente", () => {
      render(<Badge>Status Ativo</Badge>);
      expect(screen.getByText("Status Ativo")).toBeInTheDocument();
    });

    it("deve renderizar o indicador dot para variante de sucesso", () => {
      const { container } = render(<Badge variant="success">Sucesso</Badge>);
      expect(container.firstChild).toHaveClass("bg-zinc-800");
      const dot = screen.getByTestId("badge-dot");
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveClass("bg-emerald-500");
    });
  });

  describe("Button", () => {
    it("deve renderizar o texto do botão e responder ao clique", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Clique Aqui</Button>);

      const button = screen.getByRole("button", { name: /clique aqui/i });
      expect(button).toBeInTheDocument();

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("deve desabilitar o botão quando isLoading for true", () => {
      render(<Button isLoading>Processando</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });
});
