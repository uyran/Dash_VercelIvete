import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import TabelaCidades from "@/components/TabelaCidades";
import { cidadesDaRegiao, cidadesOrdenadas, totaisPorRegiao } from "@/lib/agregados";
import { inteiro } from "@/lib/formato";

const POR_PAGINA = 10;

const linhasDaTabela = (container: HTMLElement) =>
  [...container.querySelectorAll("tbody tr")].map((tr) => [
    tr.children[0]?.textContent?.trim() ?? "",
    tr.children[1]?.textContent?.trim() ?? "",
    tr.children[2]?.textContent?.trim() ?? "",
  ]);

const votosDe = (linha: string[]) => Number(linha[2].replaceAll(".", ""));

const alfa = (a: string, b: string) => a.localeCompare(b, "pt-BR");

describe("TabelaCidades", () => {
  it("inicia na Capital, em ordem alfabética e com no máximo 10 linhas", () => {
    const { container } = render(<TabelaCidades />);
    const esperado = cidadesDaRegiao("Capital").sort((a, b) => alfa(a.cidade, b.cidade));
    const linhas = linhasDaTabela(container);

    expect(screen.getByLabelText("Filtrar por região")).toHaveValue("Capital");
    expect(linhas.length).toBeLessThanOrEqual(POR_PAGINA);
    expect(linhas).toHaveLength(Math.min(POR_PAGINA, esperado.length));
    expect(linhas.map((l) => l[0])).toEqual(
      esperado.slice(0, POR_PAGINA).map((c) => c.cidade),
    );
    expect(linhas.every(([, regiao]) => regiao === "Capital")).toBe(true);
    expect(
      screen.getByText(/Mostrando/),
    ).toHaveTextContent(
      `Mostrando 1–${Math.min(POR_PAGINA, esperado.length)} de ${inteiro(esperado.length)} ${
        esperado.length === 1 ? "cidade" : "cidades"
      }`,
    );
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

  it("ordena por cidade e por região em ordem alfabética", async () => {
    const user = userEvent.setup();
    const { container } = render(<TabelaCidades />);

    await user.selectOptions(screen.getByLabelText("Filtrar por região"), "__TODAS__");
    await user.click(screen.getByRole("button", { name: "Ordenar por Região" }));

    const regioes = linhasDaTabela(container).map(([, regiao]) => regiao);
    for (let i = 1; i < regioes.length; i++) {
      expect(alfa(regioes[i - 1], regioes[i])).toBeLessThanOrEqual(0);
    }

    await user.click(screen.getByRole("button", { name: "Ordenar por Cidade" }));
    const cidadesNaTela = linhasDaTabela(container).map(([cidade]) => cidade);
    for (let i = 1; i < cidadesNaTela.length; i++) {
      expect(alfa(cidadesNaTela[i - 1], cidadesNaTela[i])).toBeLessThanOrEqual(0);
    }
  });

  it("pagina as cidades e volta para a página 1 ao trocar a região", async () => {
    const user = userEvent.setup();
    const { container } = render(<TabelaCidades />);
    const esperado = [...cidadesOrdenadas].sort((a, b) => alfa(a.cidade, b.cidade));

    await user.selectOptions(screen.getByLabelText("Filtrar por região"), "__TODAS__");
    await user.click(screen.getByRole("button", { name: /próxima/i }));

    expect(linhasDaTabela(container)[0][0]).toBe(esperado[POR_PAGINA].cidade);
    expect(screen.getByText(/Mostrando/)).toHaveTextContent(
      `Mostrando ${POR_PAGINA + 1}–${Math.min(2 * POR_PAGINA, esperado.length)} de ${inteiro(esperado.length)} cidades`,
    );

    await user.selectOptions(screen.getByLabelText("Filtrar por região"), "Mata Sul");
    expect(screen.getByText(/Mostrando/)).toHaveTextContent("Mostrando 1–");
  });

  it("lista todas as cidades quando a opção Todas é escolhida", async () => {
    const user = userEvent.setup();
    const { container } = render(<TabelaCidades />);

    await user.selectOptions(screen.getByLabelText("Filtrar por região"), "__TODAS__");

    expect(linhasDaTabela(container)).toHaveLength(POR_PAGINA);
    expect(screen.getByText(/Mostrando/)).toHaveTextContent(
      `de ${inteiro(cidadesOrdenadas.length)} cidades`,
    );
    const opcoes = within(screen.getByLabelText("Filtrar por região")).getAllByRole("option");
    expect(opcoes).toHaveLength(1 + totaisPorRegiao.length);
  });
});
