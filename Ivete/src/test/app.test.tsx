import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "@/App";

describe("App", () => {
  it("renderiza cabeçalho, indicadores, gráfico e as duas tabelas", () => {
    render(<App />);

    expect(screen.getByTestId("cabecalho")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /professora ivete caetano/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Número 13613")).toBeInTheDocument();
    expect(screen.getByText("Candidata a Deputada Estadual")).toBeInTheDocument();
    expect(screen.getByText("Eleita")).toBeInTheDocument();

    expect(screen.getByTestId("indicadores")).toBeInTheDocument();
    expect(screen.getByTestId("grafico-regioes")).toBeInTheDocument();

    expect(screen.getByTestId("tabela-cidades")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtrar por região")).toHaveValue("Capital");

    expect(screen.getByTestId("tabela-zonas")).toBeInTheDocument();
    expect(screen.getByLabelText("Escolher cidade")).toHaveValue("RECIFE");

    expect(screen.getByTestId("rodape")).toBeInTheDocument();
    expect(screen.getByText("Dados extraidos do TSE.")).toBeInTheDocument();
    expect(screen.getByText("Desenvolvido por uyrancosta@gmail.com")).toBeInTheDocument();
  });
});
