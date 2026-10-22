import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import TabelaCidades from "@/components/TabelaCidades";
import { cidadesDaRegiao, cidadesOrdenadas, totaisPorRegiao } from "@/lib/agregados";
import { inteiro } from "@/lib/formato";

const linhasDaTabela = (container: HTMLElement) =>
  [...container.querySelectorAll("tbody tr")].map((tr) => [
    tr.children[0]?.textContent?.trim() ?? "",
    tr.children[1]?.textContent?.trim() ?? "",
    tr.children[2]?.textContent?.trim() ?? "",
  ]);

const votosDe = (linha: string[]) => Number(linha[2].replaceAll(".", ""));

const alfa = (a: string, b: string) => a.localeCompare(b, "pt-BR");

describe("TabelaCidades", () => {
  it("inicia na Capital em ordem alfabética e mostra a área rolável com 7 cidades", () => {
    const { container } = render(<TabelaCidades />);
    const esperado = cidadesDaRegiao("Capital").sort((a, b) => alfa(a.cidade, b.cidade));
    const linhas = linhasDaTabela(container);

    expect(screen.getByLabelText("Filtrar por região")).toHaveValue("Capital");
    expect(linhas).toHaveLength(esperado.length);
    expect(linhas.map((l) => l[0])).toEqual(esperado.map((c) => c.cidade));
    expect(linhas.every(([, regiao]) => regiao === "Capital")).toBe(true);

    const area = screen.getByTestId("area-cidades");
    expect(area).toHaveClass("overflow-y-auto", "max-h-[23rem]");
  });

  it("transforma os títulos das colunas em botões de ordenação", () => {
    render(<TabelaCidades />);
    expect(screen.getByRole("heading", { name: /votação por cidade e região/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ordenar por Cidade" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ordenar por Região" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ordenar por Total de votos" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /cidade/i })).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("columnheader", { name: /região/i })).toHaveAttribute("aria-sort", "none");
    expect(screen.getByRole("columnheader", { name: /total de votos/i })).toHaveAttribute("aria-sort", "none");
  });

  it("ordena por votos em ordem decrescente ao clicar no cabeçalho", async () => {
    const user = userEvent.setup();
    const { container } = render(<TabelaCidades />);

    await user.selectOptions(screen.getByLabelText("Filtrar por região"), "__TODAS__");
    await user.click(screen.getByRole("button", { name: "Ordenar por Total de votos" }));

    const votos = linhasDaTabela(container).map(votosDe);
    expect(votos.length).toBeGreaterThan(1);
    for (let i = 1; i < votos.length; i++) {
      expect(votos[i - 1]).toBeGreaterThanOrEqual(votos[i]);
    }
    expect(screen.getByRole("columnheader", { name: /total de votos/i })).toHaveAttribute("aria-sort", "descending");

    await user.click(screen.getByRole("button", { name: "Ordenar por Total de votos" }));
    const invertidos = linhasDaTabela(container).map(votosDe);
    for (let i = 1; i < invertidos.length; i++) {
      expect(invertidos[i - 1]).toBeLessThanOrEqual(invertidos[i]);
    }
  });

  it("ordena por cidade em ordem alfabética e o botão de Região não altera as linhas", async () => {
    const user = userEvent.setup();
    const { container } = render(<TabelaCidades />);

    await user.selectOptions(screen.getByLabelText("Filtrar por região"), "__TODAS__");
    const antes = linhasDaTabela(container);

    await user.click(screen.getByRole("button", { name: "Ordenar por Região" }));
    expect(linhasDaTabela(container)).toEqual(antes);

    const cidadesNaTela = linhasDaTabela(container).map(([cidade]) => cidade);
    for (let i = 1; i < cidadesNaTela.length; i++) {
      expect(alfa(cidadesNaTela[i - 1], cidadesNaTela[i])).toBeLessThanOrEqual(0);
    }
    expect(
      screen.getByRole("columnheader", { name: /região/i }),
    ).toHaveAttribute("aria-sort", "none");
  });

  it("não tem paginação e deixa a área das cidades rolar", () => {
    render(<TabelaCidades />);

    expect(screen.queryByRole("button", { name: /anterior/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /próxima/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
    expect(screen.getByTestId("area-cidades")).toHaveClass("overflow-y-auto");
  });

  it("lista todas as cidades quando a opção Todas é escolhida", async () => {
    const user = userEvent.setup();
    const { container } = render(<TabelaCidades />);

    await user.selectOptions(screen.getByLabelText("Filtrar por região"), "__TODAS__");

    expect(linhasDaTabela(container)).toHaveLength(cidadesOrdenadas.length);
    const total = cidadesOrdenadas.reduce((soma, c) => soma + c.votos, 0);
    expect(
      screen.getByText(
        `${inteiro(cidadesOrdenadas.length)} cidades · ${inteiro(total)} votos`,
      ),
    ).toBeInTheDocument();
    const opcoes = within(screen.getByLabelText("Filtrar por região")).getAllByRole("option");
    expect(opcoes).toHaveLength(1 + totaisPorRegiao.length);
  });
});
