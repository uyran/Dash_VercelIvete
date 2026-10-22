import { useMemo, useState } from "react";
import Paginacao from "@/components/Paginacao";
import ThOrdenavel, { type EstadoOrdenacao } from "@/components/ThOrdenavel";
import { cidadesDaRegiao, cidadesOrdenadas, type TotalCidade } from "@/lib/agregados";
import { regioes } from "@/lib/dados";
import { inteiro } from "@/lib/formato";

const TODAS = "__TODAS__";
const POR_PAGINA = 10;

type Campo = "cidade" | "regiao" | "votos";
type Ordenacao = EstadoOrdenacao<Campo>;

const comparadores: Record<Campo, (a: TotalCidade, b: TotalCidade) => number> = {
  cidade: (a, b) => a.cidade.localeCompare(b.cidade, "pt-BR"),
  regiao: (a, b) =>
    a.regiao.localeCompare(b.regiao, "pt-BR") || a.cidade.localeCompare(b.cidade, "pt-BR"),
  votos: (a, b) => a.votos - b.votos || a.cidade.localeCompare(b.cidade, "pt-BR"),
};

function ordenar(linhas: TotalCidade[], { campo, dir }: Ordenacao): TotalCidade[] {
  const cmp = comparadores[campo];
  return [...linhas].sort((a, b) => (dir === "asc" ? cmp(a, b) : cmp(b, a)));
}

export default function TabelaCidades() {
  const [regiao, setRegiao] = useState("Capital");
  const [pagina, setPagina] = useState(1);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>({ campo: "cidade", dir: "asc" });

  const filtradas = useMemo(
    () => (regiao === TODAS ? cidadesOrdenadas : cidadesDaRegiao(regiao)),
    [regiao],
  );
  const linhas = useMemo(() => ordenar(filtradas, ordenacao), [filtradas, ordenacao]);
  const visiveis = linhas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const totalVotos = filtradas.reduce((soma, c) => soma + c.votos, 0);

  const trocarRegiao = (valor: string) => {
    setRegiao(valor);
    setPagina(1);
  };

  const aoOrdenar = (campo: Campo) => {
    setOrdenacao((atual) =>
      atual.campo === campo
        ? { campo, dir: atual.dir === "asc" ? "desc" : "asc" }
        : { campo, dir: campo === "votos" ? "desc" : "asc" },
    );
  };

  return (
    <section
      data-testid="tabela-cidades"
      aria-labelledby="titulo-tabela-cidades"
      className="overflow-hidden rounded-2xl border-2 border-google-grey-600/40 bg-google-blue-50/50 shadow-md"
    >
      <div className="flex flex-col gap-3 border-b-2 border-google-grey-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="titulo-tabela-cidades"
            className="text-lg font-semibold text-google-grey-900"
          >
            Votação por cidade e região
          </h2>
          <p className="text-xs text-google-grey-600">
            {inteiro(filtradas.length)} {filtradas.length === 1 ? "cidade" : "cidades"} ·{" "}
            {inteiro(totalVotos)} votos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="filtro-regiao"
            className="text-sm lowercase text-google-grey-600"
          >
            Região:
          </label>
          <select
            id="filtro-regiao"
            aria-label="Filtrar por região"
            value={regiao}
            onChange={(e) => trocarRegiao(e.target.value)}
            className="rounded-full border-2 border-google-grey-300 bg-white px-4 py-2 pr-8 text-sm font-medium text-google-grey-900 outline-none focus-visible:border-google-blue-500 focus-visible:ring-2 focus-visible:ring-google-blue-100"
          >
            <option value={TODAS}>Todas as regiões</option>
            {[...regioes]
              .sort((a, b) => a.localeCompare(b, "pt-BR"))
              .map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
          </select>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-google-blue-600 text-white shadow-sm">
          <tr>
            <ThOrdenavel
              campo="cidade"
              rotulo="Cidade"
              ordenacao={ordenacao}
              aoOrdenar={aoOrdenar}
            />
            <ThOrdenavel
              campo="regiao"
              rotulo="Região"
              ordenacao={ordenacao}
              aoOrdenar={aoOrdenar}
              minuscula
            />
            <ThOrdenavel
              campo="votos"
              rotulo="Total de votos"
              ordenacao={ordenacao}
              aoOrdenar={aoOrdenar}
              direita
            />
          </tr>
        </thead>
        <tbody>
          {visiveis.map((c, i) => (
            <tr
              key={c.cidade}
              className={`border-b border-google-grey-200 last:border-b-0 ${
                i % 2 === 1 ? "bg-white/70" : "bg-white"
              } hover:bg-google-yellow-100`}
            >
              <td className="px-5 py-2.5 font-medium text-google-grey-900">{c.cidade}</td>
              <td className="px-5 py-2.5 lowercase text-google-grey-600">{c.regiao}</td>
              <td className="px-5 py-2.5 text-right font-semibold text-google-grey-900">
                {inteiro(c.votos)}
              </td>
            </tr>
          ))}
          {visiveis.length === 0 ? (
            <tr>
              <td colSpan={3} className="bg-white px-5 py-6 text-center text-google-grey-600">
                Nenhuma cidade nesta região.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <Paginacao
        pagina={pagina}
        total={linhas.length}
        porPagina={POR_PAGINA}
        aoMudar={setPagina}
        rotulo={linhas.length === 1 ? "cidade" : "cidades"}
      />
    </section>
  );
}
