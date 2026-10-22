import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Cabecalho from "@/components/Cabecalho";
import Indicadores from "@/components/Indicadores";
import {
  bottom10Cidades,
  cidadeDaZonaMaisVotada,
  cidadeMaisVotada,
  top10Cidades,
  totalGeral,
  zonaMaisVotada,
} from "@/lib/agregados";
import { inteiro } from "@/lib/formato";

describe("Cabecalho", () => {
  it("exibe nome em destaque, número, cargo, ano + Eleita e partido", () => {
    render(<Cabecalho />);
    const nome = screen.getByRole("heading", { name: /professora ivete caetano/i });
    expect(nome).toHaveClass("font-bold");

    expect(screen.getByLabelText("Número 13613")).toHaveTextContent("13613");
    expect(screen.getByText("Deputada Estadual")).toBeInTheDocument();
    expect(screen.getByText("2026")).toBeInTheDocument();
    expect(screen.getByText("Eleita")).toBeInTheDocument();
    expect(screen.getAllByText("PT/PE").length).toBeGreaterThan(0);
  });

  it("não mostra partido acima do nome nem o nome completo, e lista as etiquetas abaixo", () => {
    render(<Cabecalho />);
    const nome = screen.getByRole("heading", { name: /professora ivete caetano/i });

    expect(screen.queryByText(/·\s*PE/)).not.toBeInTheDocument();
    expect(screen.queryByText("IVETE CAETANO DE OLIVEIRA")).not.toBeInTheDocument();

    const etiquetas = nome.nextElementSibling as HTMLElement;
    expect(etiquetas).toBeInTheDocument();
    expect(etiquetas).toHaveTextContent("Deputada Estadual");
    expect(etiquetas).toHaveTextContent("2026");
    expect(etiquetas).toHaveTextContent("Eleita");
    expect(etiquetas).toHaveTextContent("PT/PE");
  });
});

describe("Indicadores", () => {
  it("mostra os números dos quatro primeiros cartões", () => {
    render(<Indicadores />);
    expect(screen.getByText(inteiro(totalGeral))).toBeInTheDocument();
    expect(screen.getByText(cidadeMaisVotada.cidade)).toBeInTheDocument();
    expect(screen.getByText(`Zona ${zonaMaisVotada.zona}`)).toHaveTextContent(
      `Zona ${zonaMaisVotada.zona} · ${cidadeDaZonaMaisVotada}`,
    );
    expect(screen.getByText("Local com maior votação")).toBeInTheDocument();
  });

  it("exibe o balão com as 10 cidades mais votadas ao passar o mouse", async () => {
    const user = userEvent.setup();
    render(<Indicadores />);
    const cartao = screen.getByRole("button", { name: /10 cidades mais votadas/i });

    expect(screen.queryByTestId("balao-10 cidades mais votadas")).not.toBeInTheDocument();

    await user.hover(cartao);
    const balao = screen.getByTestId("balao-10 cidades mais votadas");
    expect(balao).toBeInTheDocument();

    const itens = within(balao).getAllByRole("listitem");
    expect(itens).toHaveLength(10);
    expect(itens[0]).toHaveTextContent(top10Cidades[0].cidade);
    expect(itens[0]).toHaveTextContent(inteiro(top10Cidades[0].votos));
    expect(balao).toHaveTextContent(inteiro(top10Cidades[9].votos));

    await user.unhover(cartao);
    expect(screen.queryByTestId("balao-10 cidades mais votadas")).not.toBeInTheDocument();
  });

  it("exibe o balão das 10 cidades menos votadas ao clicar", async () => {
    const user = userEvent.setup();
    render(<Indicadores />);
    const cartao = screen.getByRole("button", { name: /10 cidades menos votadas/i });

    await user.click(cartao);
    const balao = screen.getByTestId("balao-10 cidades menos votadas");
    const itens = within(balao).getAllByRole("listitem");
    expect(itens).toHaveLength(10);
    expect(itens[0]).toHaveTextContent(bottom10Cidades[0].cidade);
    expect(itens[0]).toHaveTextContent(inteiro(bottom10Cidades[0].votos));

    await user.click(cartao);
    expect(screen.queryByTestId("balao-10 cidades menos votadas")).not.toBeInTheDocument();
  });

  it("mantém o balão acessível pelo teclado", async () => {
    const user = userEvent.setup();
    render(<Indicadores />);
    const cartao = screen.getByRole("button", { name: /10 cidades mais votadas/i });
    cartao.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("balao-10 cidades mais votadas")).toBeInTheDocument();
    expect(cartao).toHaveAttribute("aria-expanded", "true");
  });
});
