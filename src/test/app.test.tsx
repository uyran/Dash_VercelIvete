import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "@/App";

describe("App", () => {
  it("renderiza cabeçalho, indicadores, gráfico, as duas tabelas e a ALEPE", () => {
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

    expect(screen.getByTestId("assembleia-pe")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /composição da assembleia legislativa/i })).toBeInTheDocument();

    expect(
      screen.getByText((_, el) => el?.tagName === "A" && el.textContent === "uyrancosta@gmail.com"),
    ).toBeInTheDocument();
    expect(screen.getByText("Dados oficiais do TSE / Mapas: Electomaps")).toBeInTheDocument();
  });
});
