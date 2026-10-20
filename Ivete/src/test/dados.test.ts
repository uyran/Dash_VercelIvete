import { describe, expect, it } from "vitest";
import {
  bottom10Cidades,
  cidadesDaRegiao,
  cidadesOrdenadas,
  cidadeDaZonaMaisVotada,
  cidadeMaisVotada,
  infoCidade,
  localMaisVotado,
  locaisDaZona,
  totaisPorCidade,
  totaisPorRegiao,
  totaisPorZona,
  totalGeral,
  top10Cidades,
  zonaMaisVotada,
} from "@/lib/agregados";
import { cidades, linhas, meta, regioes } from "@/lib/dados";

const soma = (itens: { votos: number }[]) => itens.reduce((acc, i) => acc + i.votos, 0);

describe("metadados da planilha", () => {
  it("traz os dados da candidata e da eleição", () => {
    expect(meta).toMatchObject({
      ano: 2026,
      uf: "PE",
      cargo: "Deputado Estadual",
      numero: 13613,
      nome: "IVETE CAETANO DE OLIVEIRA",
      partido: "PT/PE",
    });
  });

  it("tem todas as linhas com candidata, região e votos válidos", () => {
    expect(linhas.length).toBeGreaterThan(0);
    for (const [regiao, cidade, zona, local, endereco, votos] of linhas) {
      expect(regioes[regiao]).toBeTruthy();
      expect(cidades[cidade]).toBeTruthy();
      expect(Number.isInteger(zona)).toBe(true);
      expect(zona).toBeGreaterThan(0);
      expect(local).toBeGreaterThanOrEqual(0);
      expect(endereco).toBeGreaterThanOrEqual(0);
      expect(votos).toBeGreaterThanOrEqual(0);
    }
  });

  it("mantém 12 regioes e nenhuma cidade sem regiao", () => {
    expect(regioes).toHaveLength(12);
    expect(regioes).not.toContain("");
    for (const c of totaisPorCidade) expect(c.regiao).toBeTruthy();
  });

  it("preenche as 4 cidades que vieram sem região na planilha", () => {
    const regiaoDaCidade = new Map(totaisPorCidade.map((c) => [c.cidade, c.regiao]));
    expect(regiaoDaCidade.get("BONITO")).toBe("Agreste Meridional");
    expect(regiaoDaCidade.get("CHÃ GRANDE")).toBe("Mata Sul");
    expect(regiaoDaCidade.get("GLÓRIA DO GOITÁ")).toBe("Mata Norte");
    expect(regiaoDaCidade.get("POMBOS")).toBe("Agreste Central");
  });
});

describe("agregados gerais", () => {
  it("calcula o total de votos de 2026", () => {
    expect(totalGeral).toBe(63033);
    expect(soma(totaisPorCidade)).toBe(totalGeral);
    expect(soma(totaisPorRegiao)).toBe(totalGeral);
    expect(soma(totaisPorZona)).toBe(totalGeral);
    expect(cidades).toHaveLength(totaisPorCidade.length);
  });

  it("ordena regiões por votos decrescentes", () => {
    for (let i = 1; i < totaisPorRegiao.length; i++) {
      expect(totaisPorRegiao[i - 1].votos).toBeGreaterThanOrEqual(totaisPorRegiao[i].votos);
    }
    expect(soma(totaisPorRegiao)).toBe(totalGeral);
  });

  it("identifica cidade, zona e local mais votados", () => {
    expect(cidadeMaisVotada).toEqual(totaisPorCidade[0]);
    expect(zonaMaisVotada).toEqual(totaisPorZona[0]);
    expect(localMaisVotado.votos).toBeGreaterThan(0);
    expect(localMaisVotado.cidade).toBeTruthy();
    expect(localMaisVotado.zona).toBeGreaterThan(0);
    const maximo = Math.max(...linhas.map((l) => l[5]));
    expect(localMaisVotado.votos).toBe(maximo);

    const cidadesDaZonaGlobal = new Set(
      linhas.filter((l) => l[2] === zonaMaisVotada.zona).map((l) => cidades[l[1]]),
    );
    expect(cidadesDaZonaGlobal.has(cidadeDaZonaMaisVotada)).toBe(true);
    expect(infoCidade(cidadeDaZonaMaisVotada)?.zonas.some((z) => z.zona === zonaMaisVotada.zona)).toBe(
      true,
    );
  });

  it("monta o top 10 e o bottom 10 de cidades", () => {
    expect(top10Cidades).toHaveLength(10);
    expect(bottom10Cidades).toHaveLength(10);
    for (let i = 1; i < top10Cidades.length; i++) {
      expect(top10Cidades[i - 1].votos).toBeGreaterThanOrEqual(top10Cidades[i].votos);
    }
    for (let i = 1; i < bottom10Cidades.length; i++) {
      expect(bottom10Cidades[i - 1].votos).toBeLessThanOrEqual(bottom10Cidades[i].votos);
    }
    expect(top10Cidades[0]).toEqual(totaisPorCidade[0]);
    const menor = totaisPorCidade[totaisPorCidade.length - 1];
    expect(bottom10Cidades[0]).toEqual(menor);
  });

  it("lista cidades em ordem alfabética", () => {
    const nomes = cidadesOrdenadas.map((c) => c.cidade);
    expect([...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"))).toEqual(nomes);
  });
});

describe("consulta por região", () => {
  it("filtra as cidades da Capital", () => {
    const capital = cidadesDaRegiao("Capital");
    expect(capital.length).toBeGreaterThan(0);
    expect(capital.every((c) => c.regiao === "Capital")).toBe(true);
    expect(soma(capital)).toBe(totaisPorRegiao.find((r) => r.regiao === "Capital")!.votos);
  });

  it("filtra qualquer região oficial", () => {
    for (const regiao of regioes) {
      expect(cidadesDaRegiao(regiao).length).toBeGreaterThan(0);
    }
  });
});

describe("consulta por cidade, zona e local", () => {
  it("calcula o resumo da cidade", () => {
    const info = infoCidade(cidadeMaisVotada.cidade)!;
    expect(info.cidade).toBe(cidadeMaisVotada.cidade);
    expect(info.totalVotos).toBe(cidadeMaisVotada.votos);
    expect(info.zonas.length).toBe(info.nZonas);
    expect(soma(info.zonas)).toBe(info.totalVotos);
    expect(info.zonaMaisVotada).toEqual(info.zonas[0]);
    for (let i = 1; i < info.zonas.length; i++) {
      expect(info.zonas[i - 1].votos).toBeGreaterThanOrEqual(info.zonas[i].votos);
    }
  });

  it("devolve cidade inexistente como nulo", () => {
    expect(infoCidade("CIDADE QUE NAO EXISTE")).toBeNull();
    expect(locaisDaZona("CIDADE QUE NAO EXISTE", 1)).toEqual([]);
  });

  it("lista os locais da zona em ordem decrescente de votos", () => {
    const info = infoCidade(cidadeMaisVotada.cidade)!;
    const zona = info.zonas[0].zona;
    const locais = locaisDaZona(cidadeMaisVotada.cidade, zona);
    expect(locais.length).toBeGreaterThan(0);
    expect(soma(locais)).toBe(info.zonas[0].votos);
    for (let i = 1; i < locais.length; i++) {
      expect(locais[i - 1].votos).toBeGreaterThanOrEqual(locais[i].votos);
    }
    expect(locais.every((l) => l.local.length > 0)).toBe(true);
  });

  it("cobre todas as cidades com pelo menos uma zona", () => {
    for (const nome of cidades) {
      const info = infoCidade(nome)!;
      expect(info.nZonas).toBeGreaterThan(0);
      expect(soma(locaisDaZona(nome, info.zonas[0].zona))).toBe(info.zonas[0].votos);
    }
  });
});
