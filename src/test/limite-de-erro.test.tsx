import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LimiteDeErro from "@/components/LimiteDeErro";

function Bomba({ explodir }: { explodir: boolean }) {
  if (explodir) throw new Error("falha simulada do gráfico");
  return <p>conteúdo normal</p>;
}

describe("LimiteDeErro", () => {
  it("deixa o conteúdo aparecer quando não há erro", () => {
    render(
      <LimiteDeErro>
        <Bomba explodir={false} />
      </LimiteDeErro>,
    );
    expect(screen.getByText("conteúdo normal")).toBeInTheDocument();
  });

  it("mostra a mensagem de erro em vez de apagar a tela", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <LimiteDeErro>
        <Bomba explodir />
      </LimiteDeErro>,
    );

    const alerta = screen.getByRole("alert");
    expect(alerta).toHaveTextContent("Algo deu errado ao montar o dashboard");
    expect(alerta).toHaveTextContent("falha simulada do gráfico");
    expect(screen.getByRole("button", { name: /recarregar/i })).toBeInTheDocument();
    expect(screen.queryByText("conteúdo normal")).not.toBeInTheDocument();

    vi.restoreAllMocks();
  });
});
