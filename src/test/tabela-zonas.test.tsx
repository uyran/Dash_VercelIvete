import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import TabelaZonas from "@/components/TabelaZonas";
import { cidadeMaisVotada, infoCidade, locaisDaZona } from "@/lib/agregados";
import { inteiro } from "@/lib/formato";

const linhasTabela = (container: HTMLElement) =>
  [...container.querySelectorAll("tbody tr")].map((tr) => [
    tr.children[0]?.textContent?.trim() ?? "",
    tr.children[1]?.textContent?.trim() ?? "",
    tr.children[2]?.textContent?.trim() ?? "",
  ]);

describe("TabelaZonas", () => {
  it("inicia na cidade mais votada com o resumo dela", () => {
    render(<TabelaZonas />);
    const info = infoCidade(cidadeMaisVotada.cidade)!;

    expect(screen.getByLabelText("Escolher cidade")).toHaveValue(cidadeMaisVotada.cidade);
    expect(screen.getByText("Total de votos na cidade")).toBeInTheDocument();
    expect(screen.getByText(inteiro(info.totalVotos))).toBeInTheDocument();
    expect(screen.getByText("Nº de zonas")).toBeInTheDocument();
    expect(screen.getByText(String(info.nZonas))).toBeInTheDocument();
    expect(screen.getByText("Zona mais votada")).toBeInTheDocument();
    expect(
      screen.getByText(`Zona ${info.zonaMaisVotada.zona} · ${cidadeMaisVotada.cidade}`),
    ).toBeInTheDocument();
  });

  it("exibe um botão por zona com zona e total de votos", () => {
    render(<TabelaZonas />);
    const info = infoCidade(cidadeMaisVotada.cidade)!;
    const grupo = screen.getByRole("group", { name: /zonas da cidade/i });
    const botoes = [...grupo.querySelectorAll("button")];

    expect(botoes).toHaveLength(info.nZonas);
    for (const [i, botao] of botoes.entries()) {
      const z = info.zonas[i];
      expect(botao).toHaveTextContent(`Zona ${z.zona}`);
      expect(botao).toHaveTextContent(inteiro(z.votos));
    }
    const ativas = botoes.filter((b) => b.getAttribute("aria-pressed") === "true");
    expect(ativas).toHaveLength(1);
    expect(ativas[0]).toHaveTextContent(`Zona ${info.zonaMaisVotada.zona}`);
  });

  it("lista os locais da zona inicial do maior para o menor numa área rolável", () => {
    const { container } = render(<TabelaZonas />);
    const info = infoCidade(cidadeMaisVotada.cidade)!;
    const esperado = locaisDaZona(cidadeMaisVotada.cidade, info.zonaMaisVotada.zona);
    const linhas = linhasTabela(container);

    expect(linhas).toHaveLength(esperado.length);
    expect(linhas[0][0]).toBe(esperado[0].local);
    expect(linhas[0][1]).toBe(inteiro(esperado[0].votos));

    const votos = linhas.map(([, v]) => Number(v.replaceAll(".", "")));
    for (let i = 1; i < votos.length; i++) {
      expect(votos[i - 1]).toBeGreaterThanOrEqual(votos[i]);
    }

    const area = screen.getByTestId("area-zonas");
    expect(area).toHaveClass("overflow-y-auto", "max-h-[23rem]");
  });

  it("não tem paginação e deixa a área dos locais rolar", () => {
    render(<TabelaZonas />);

    expect(screen.queryByRole("button", { name: /anterior/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /próxima/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
    expect(screen.getByTestId("area-zonas")).toHaveClass("overflow-y-auto");
  });

  it("volta ao topo da lista ao trocar de zona", async () => {
    const user = userEvent.setup();
    const { container } = render(<TabelaZonas />);
    const info = infoCidade(cidadeMaisVotada.cidade)!;
    const segundaZona = info.zonas[1];

    await user.click(
      screen.getByRole("button", {
        name: `Zona ${segundaZona.zona}, ${inteiro(segundaZona.votos)} votos`,
      }),
    );

    const esperado = locaisDaZona(cidadeMaisVotada.cidade, segundaZona.zona);
    expect(linhasTabela(container)).toHaveLength(esperado.length);
    expect(linhasTabela(container)[0][0]).toBe(esperado[0].local);
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
  });

  it("troca a tabela ao clicar em outra zona", async () => {
    const user = userEvent.setup();
    const { container } = render(<TabelaZonas />);
    const info = infoCidade(cidadeMaisVotada.cidade)!;
    const alvo = info.zonas[1];

    await user.click(
      screen.getByRole("button", {
        name: `Zona ${alvo.zona}, ${inteiro(alvo.votos)} votos`,
      }),
    );

    const esperado = locaisDaZona(cidadeMaisVotada.cidade, alvo.zona);
    const linhas = linhasTabela(container);
    expect(linhas).toHaveLength(esperado.length);
    expect(linhas[0][0]).toBe(esperado[0].local);
    expect(
      screen.getByRole("button", {
        name: `Zona ${alvo.zona}, ${inteiro(alvo.votos)} votos`,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(inteiro(alvo.votos))).toBeInTheDocument();
    expect(container.querySelector("caption")).not.toBeInTheDocument();
    expect(screen.queryByText(/^Zonas de /)).not.toBeInTheDocument();
  });

  it("recalcula tudo ao trocar de cidade", async () => {
    const user = userEvent.setup();
    const { container } = render(<TabelaZonas />);
    const outra = "CARUARU";

    await user.selectOptions(screen.getByLabelText("Escolher cidade"), outra);

    const info = infoCidade(outra)!;
    expect(screen.getByText(inteiro(info.totalVotos))).toBeInTheDocument();
    expect(screen.getByText(String(info.nZonas))).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: `Zona ${info.zonaMaisVotada.zona}, ${inteiro(info.zonaMaisVotada.votos)} votos`,
      }),
    ).toHaveAttribute("aria-pressed", "true");

    const esperado = locaisDaZona(outra, info.zonaMaisVotada.zona);
    expect(linhasTabela(container)).toHaveLength(esperado.length);
    expect(linhasTabela(container)[0][0]).toBe(esperado[0].local);
  });

  it("transforma os títulos das colunas em botões de ordenação", () => {
    render(<TabelaZonas />);

    expect(
      screen.getByRole("button", { name: "Ordenar por Local" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ordenar por Votos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ordenar por End." })).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Local" }),
    ).toHaveAttribute("aria-sort", "none");
    expect(screen.getByRole("columnheader", { name: "Votos" })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    expect(screen.getByRole("columnheader", { name: "End." })).toHaveAttribute(
      "aria-sort",
      "none",
    );
  });

  it("ordena por local e endereço em ordem crescente e por votos em decrescente", async () => {
    const user = userEvent.setup();
    const { container } = render(<TabelaZonas />);

    await user.click(screen.getByRole("button", { name: "Ordenar por Local" }));
    const locais = linhasTabela(container).map(([local]) => local);
    for (let i = 1; i < locais.length; i++) {
      expect(locais[i - 1].localeCompare(locais[i], "pt-BR")).toBeLessThanOrEqual(0);
    }
    expect(
      screen.getByRole("columnheader", { name: "Local" }),
    ).toHaveAttribute("aria-sort", "ascending");

    await user.click(screen.getByRole("button", { name: "Ordenar por End." }));
    const enderecos = linhasTabela(container).map(([, , endereco]) => endereco);
    for (let i = 1; i < enderecos.length; i++) {
      expect(enderecos[i - 1].localeCompare(enderecos[i], "pt-BR")).toBeLessThanOrEqual(0);
    }
    expect(
      screen.getByRole("columnheader", { name: "End." }),
    ).toHaveAttribute("aria-sort", "ascending");

    await user.click(screen.getByRole("button", { name: "Ordenar por Votos" }));
    const votos = linhasTabela(container).map(([, v]) => Number(v.replaceAll(".", "")));
    for (let i = 1; i < votos.length; i++) {
      expect(votos[i - 1]).toBeGreaterThanOrEqual(votos[i]);
    }
    expect(screen.getByRole("columnheader", { name: "Votos" })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
  });
});
