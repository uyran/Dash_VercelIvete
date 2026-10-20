import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GraficoRegioes, {
  AreaCidades,
  BarraTooltip,
  type ItemTooltipRecharts,
} from "@/components/GraficoRegioes";
import { totaisPorRegiao } from "@/lib/agregados";
import { inteiro } from "@/lib/formato";

/** Payload no formato exato que o recharts entrega ao `content` do Tooltip. */
const payloadDoRecharts = (regiao: string, votos: number, cidades: number) =>
  [{ dataKey: "votos", value: votos, payload: { regiao, votos, cidades } }] as ItemTooltipRecharts[];

describe("GraficoRegioes", () => {
  it("exibe o total de votos e o número de regiões abaixo do título", () => {
    render(<GraficoRegioes />);
    const titulo = screen.getByRole("heading", { name: /votação total por região/i });
    const total = totaisPorRegiao.reduce((s, r) => s + r.votos, 0);

    const sub = screen.getByText(new RegExp(`${inteiro(total)} votos`));
    expect(sub).toHaveTextContent(`${inteiro(total)} votos · ${totaisPorRegiao.length} regiões`);
    expect(titulo.compareDocumentPosition(sub) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("mostra o retângulo de cidades aguardando o cursor sobre o gráfico", () => {
    render(<GraficoRegioes />);
    const caixa = screen.getByTestId("cidades-da-regiao");
    const titulo = screen.getByRole("heading", { name: /votação total por região/i });
    expect(caixa).toHaveTextContent(/passe o cursor sobre uma área do gráfico/i);
    expect(titulo.compareDocumentPosition(caixa) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("desenha uma barra para cada região", () => {
    const { container } = render(<GraficoRegioes />);
    const barras = container.querySelectorAll(".recharts-bar-rectangle");
    expect(barras).toHaveLength(totaisPorRegiao.length);
  });

  it("identifica as regiões nos rótulos do eixo", () => {
    const { container } = render(<GraficoRegioes />);
    const rotulos = [...container.querySelectorAll(".recharts-yAxis text")].map(
      (el) => el.textContent?.trim() ?? "",
    );
    for (const { regiao } of totaisPorRegiao) {
      expect(rotulos).toContain(regiao);
    }
  });

  it("mantém a ordem decrescente de votos no eixo das regiões", () => {
    const { container } = render(<GraficoRegioes />);
    const rotulos = [...container.querySelectorAll(".recharts-yAxis text")].map(
      (el) => el.textContent?.trim() ?? "",
    );
    expect(rotulos).toEqual(totaisPorRegiao.map((r) => r.regiao));
  });
});

describe("BarraTooltip", () => {
  it("lê os dados no formato que o recharts envia (item.payload)", () => {
    render(<BarraTooltip ativo payload={payloadDoRecharts("Capital", 2573, 4)} />);

    expect(screen.getByText("Capital")).toBeInTheDocument();
    expect(screen.getByText("2.573 votos")).toBeInTheDocument();
    expect(screen.getByText("4 cidades")).toBeInTheDocument();
  });

  it("não quebra com um payload vazio", () => {
    const { container } = render(<BarraTooltip ativo payload={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("não renderiza nada quando o tooltip está inativo", () => {
    const { container } = render(
      <BarraTooltip ativo={false} payload={payloadDoRecharts("Capital", 10, 1)} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("AreaCidades", () => {
  it("avisa qual região está sob o cursor e mantém o balão visível", () => {
    const aoRegiao = vi.fn();
    render(
      <AreaCidades
        active
        payload={payloadDoRecharts("Capital", 2573, 4)}
        aoRegiao={aoRegiao}
      />,
    );

    expect(aoRegiao).toHaveBeenCalledWith("Capital");
    expect(screen.getByText("Capital")).toBeInTheDocument();
    expect(screen.getByText("2.573 votos")).toBeInTheDocument();
    expect(screen.getByText("4 cidades")).toBeInTheDocument();
  });

  it("limpa a região quando o cursor sai da área", () => {
    const aoRegiao = vi.fn();
    const { container } = render(
      <AreaCidades active={false} payload={payloadDoRecharts("Capital", 10, 1)} aoRegiao={aoRegiao} />,
    );

    expect(aoRegiao).toHaveBeenCalledWith(null);
    expect(container).toBeEmptyDOMElement();
  });
});
