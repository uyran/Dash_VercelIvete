import CartaoBalao, { type ItemBalao } from "@/components/CartaoBalao";
import {
  bottom10Cidades,
  cidadeDaZonaMaisVotada,
  cidadeMaisVotada,
  localMaisVotado,
  top10Cidades,
  totalGeral,
  zonaMaisVotada,
} from "@/lib/agregados";
import { inteiro } from "@/lib/formato";

const paraItens = (lista: { cidade: string; votos: number }[]): ItemBalao[] =>
  lista.map((c) => ({ rotulo: c.cidade, valor: inteiro(c.votos) }));

const soma = (lista: { votos: number }[]) => lista.reduce((acc, c) => acc + c.votos, 0);

export default function Indicadores() {
  return (
    <section
      data-testid="indicadores"
      aria-label="Indicadores da votação"
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <CartaoBalao
        titulo="Total de votos em 2026"
        valor={inteiro(totalGeral)}
        sub="votos nominais da candidata"
        tom="azul"
      />

      <CartaoBalao
        titulo="Cidade mais votada"
        valor={cidadeMaisVotada.cidade}
        sub={`${inteiro(cidadeMaisVotada.votos)} votos · ${cidadeMaisVotada.regiao}`}
        tom="verde"
      />

      <CartaoBalao
        titulo="Zona mais votada"
        valor={
          <>
            Zona {zonaMaisVotada.zona}
            <span className="text-base font-semibold"> · {cidadeDaZonaMaisVotada}</span>
          </>
        }
        sub={`${inteiro(zonaMaisVotada.votos)} votos`}
        tom="amarelo"
      />

      <CartaoBalao
        titulo="Local com maior votação"
        valor={<span className="text-lg!">{localMaisVotado.local}</span>}
        sub={`${localMaisVotado.cidade} · Zona ${localMaisVotado.zona} · ${inteiro(localMaisVotado.votos)} votos`}
        tom="roxo"
      />

      <CartaoBalao
        titulo="10 cidades mais votadas"
        valor={inteiro(soma(top10Cidades))}
        sub="votos somados · clique para ver a lista"
        itens={paraItens(top10Cidades)}
        tom="turquesa"
      />

      <CartaoBalao
        titulo="10 cidades menos votadas"
        valor={inteiro(soma(bottom10Cidades))}
        sub="votos somados · clique para ver a lista"
        itens={paraItens(bottom10Cidades)}
        tom="vermelho"
      />
    </section>
  );
}
