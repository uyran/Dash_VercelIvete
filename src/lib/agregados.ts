import {
  cidades,
  linhas,
  nomeCidade,
  nomeEndereco,
  nomeLocal,
  nomeRegiao,
  regiaoDe,
} from "@/lib/dados";

export type TotalCidade = { cidade: string; regiao: string; votos: number };
export type TotalRegiao = { regiao: string; votos: number; cidades: number };
export type TotalZona = { zona: number; votos: number };
export type LocalVotado = {
  local: string;
  endereco: string;
  cidade: string;
  zona: number;
  votos: number;
};
export type LocalZona = { local: string; endereco: string; votos: number };

/** Ordena por votos decrescente; empates ganham o menor rótulo alfabético. */
function porVotosDesc<T extends { votos: number }>(rotulo: (item: T) => string) {
  return (a: T, b: T) => b.votos - a.votos || rotulo(a).localeCompare(rotulo(b), "pt-BR");
}

export const totalGeral: number = linhas.reduce((soma, l) => soma + l[5], 0);

export const totaisPorCidade: TotalCidade[] = (() => {
  const mapa = new Map<number, number>();
  for (const [, cidade, , , , votos] of linhas) {
    mapa.set(cidade, (mapa.get(cidade) ?? 0) + votos);
  }
  return [...mapa.entries()]
    .map(([idx, votos]) => ({ cidade: nomeCidade(idx), regiao: regiaoDe[idx], votos }))
    .sort(porVotosDesc((c) => c.cidade));
})();

export const totaisPorRegiao: TotalRegiao[] = (() => {
  const mapa = new Map<number, { votos: number; cidades: Set<number> }>();
  for (const [regiao, cidade, , , , votos] of linhas) {
    const atual = mapa.get(regiao) ?? { votos: 0, cidades: new Set<number>() };
    atual.votos += votos;
    atual.cidades.add(cidade);
    mapa.set(regiao, atual);
  }
  return [...mapa.entries()]
    .map(([idx, v]) => ({ regiao: nomeRegiao(idx), votos: v.votos, cidades: v.cidades.size }))
    .sort(porVotosDesc((r) => r.regiao));
})();

export const totaisPorZona: TotalZona[] = (() => {
  const mapa = new Map<number, number>();
  for (const [, , zona, , , votos] of linhas) {
    mapa.set(zona, (mapa.get(zona) ?? 0) + votos);
  }
  return [...mapa.entries()]
    .map(([zona, votos]) => ({ zona, votos }))
    .sort((a, b) => b.votos - a.votos || a.zona - b.zona);
})();

export const cidadeMaisVotada: TotalCidade = totaisPorCidade[0];
export const zonaMaisVotada: TotalZona = totaisPorZona[0];

/** Cidade que concentra mais votos na zona mais votada do estado. */
export const cidadeDaZonaMaisVotada: string = (() => {
  const porCidade = new Map<number, number>();
  for (const [, cidade, zona, , , votos] of linhas) {
    if (zona !== zonaMaisVotada.zona) continue;
    porCidade.set(cidade, (porCidade.get(cidade) ?? 0) + votos);
  }
  const melhor = [...porCidade.entries()].sort((a, b) => b[1] - a[1])[0];
  return nomeCidade(melhor[0]);
})();

export const localMaisVotado: LocalVotado = (() => {
  const melhor = linhas.reduce((max, l) => (l[5] > max[5] ? l : max), linhas[0]);
  const [, cidade, zona, local, endereco, votos] = melhor;
  return {
    local: nomeLocal(local),
    endereco: nomeEndereco(endereco),
    cidade: nomeCidade(cidade),
    zona,
    votos,
  };
})();

export const top10Cidades: TotalCidade[] = totaisPorCidade.slice(0, 10);

export const bottom10Cidades: TotalCidade[] = [...totaisPorCidade]
  .sort((a, b) => a.votos - b.votos || a.cidade.localeCompare(b.cidade, "pt-BR"))
  .slice(0, 10);

export const cidadesOrdenadas: TotalCidade[] = [...totaisPorCidade].sort((a, b) =>
  a.cidade.localeCompare(b.cidade, "pt-BR"),
);

export function cidadesDaRegiao(regiao: string): TotalCidade[] {
  return cidadesOrdenadas.filter((c) => c.regiao === regiao);
}

export type InfoCidade = {
  cidade: string;
  regiao: string;
  totalVotos: number;
  nZonas: number;
  zonas: TotalZona[];
  zonaMaisVotada: TotalZona;
};

const indexCidade = new Map<string, number>(cidades.map((nome, idx) => [nome, idx]));

export function infoCidade(nome: string): InfoCidade | null {
  const idx = indexCidade.get(nome);
  if (idx === undefined) return null;

  const porZona = new Map<number, number>();
  let total = 0;
  for (const [, cidade, zona, , , votos] of linhas) {
    if (cidade !== idx) continue;
    porZona.set(zona, (porZona.get(zona) ?? 0) + votos);
    total += votos;
  }

  const zonas = [...porZona.entries()]
    .map(([zona, votos]) => ({ zona, votos }))
    .sort((a, b) => b.votos - a.votos || a.zona - b.zona);

  if (zonas.length === 0) return null;

  return {
    cidade: nome,
    regiao: regiaoDe[idx],
    totalVotos: total,
    nZonas: zonas.length,
    zonas,
    zonaMaisVotada: zonas[0],
  };
}

export function locaisDaZona(nomeCidadeSelecionada: string, zona: number): LocalZona[] {
  const idx = indexCidade.get(nomeCidadeSelecionada);
  if (idx === undefined) return [];

  return linhas
    .filter(([, cidade, z]) => cidade === idx && z === zona)
    .map(([, , , local, endereco, votos]) => ({
      local: nomeLocal(local),
      endereco: nomeEndereco(endereco),
      votos,
    }))
    .sort((a, b) => b.votos - a.votos || a.local.localeCompare(b.local, "pt-BR"));
}
