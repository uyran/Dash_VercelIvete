import raw from "@/data/votos.json";

export type Meta = {
  ano: number;
  uf: string;
  cargo: string;
  numero: number;
  nome: string;
  nomeCartao: string;
  partido: string;
  situacao: string;
};

type Arquivo = {
  meta: Meta;
  regioes: string[];
  cidades: string[];
  locais: string[];
  enderecos: string[];
  linhas: number[][];
};

/** [regiaoIdx, cidadeIdx, zona, localIdx, enderecoIdx, votos] */
export type Linha = readonly [number, number, number, number, number, number];

const arquivo = raw as unknown as Arquivo;

export const meta: Meta = arquivo.meta;
export const regioes: readonly string[] = arquivo.regioes;
export const cidades: readonly string[] = arquivo.cidades;

export const linhas: readonly Linha[] = arquivo.linhas as unknown as Linha[];

export const regiaoDe: readonly string[] = (() => {
  const mapa = new Array<string>(arquivo.cidades.length).fill("");
  for (const [r, c] of linhas) {
    if (!mapa[c]) mapa[c] = arquivo.regioes[r];
  }
  return mapa;
})();

export const nomeRegiao = (idx: number): string => arquivo.regioes[idx];
export const nomeCidade = (idx: number): string => arquivo.cidades[idx];
export const nomeLocal = (idx: number): string => arquivo.locais[idx];
export const nomeEndereco = (idx: number): string => arquivo.enderecos[idx];
