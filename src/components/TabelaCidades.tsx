import { useMemo, useState } from "react";
import ThOrdenavel, { type EstadoOrdenacao } from "@/components/ThOrdenavel";
import { cidadesDaRegiao, cidadesOrdenadas, type TotalCidade } from "@/lib/agregados";
import { regioes } from "@/lib/dados";
import { inteiro } from "@/lib/formato";

const TODAS = "__TODAS__";
/** Altura da área rolável: cabeçalho fixo + 7 cidades visíveis. */
const ALTURA_AREA = "max-h-[23rem]";

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
  const [ordenacao, setOrdenacao] = useState<Ordenacao>({ campo: "cidade", dir: "asc" });

  const filtradas = useMemo(
    () => (regiao === TODAS ? cidadesOrdenadas : cidadesDaRegiao(regiao)),
    [regiao],
  );
  const linhas = useMemo(() => ordenar(filtradas, ordenacao), [filtradas, ordenacao]);
  const totalVotos = filtradas.reduce((soma, c) => soma + c.votos, 0);

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
      className="overflow-hidden rounded-2xl border-2 border-google-grey-600/40 bg-google-green-100/50 shadow-md"
    >
      <div className="border-b-2 border-google-grey-200 bg-google-green-100 p-5">
        <h2
          id="titulo-tabela-cidades"
          className="text-2xl font-semibold text-google-grey-900"
        >
          Votação por cidade e região
        </h2>

        <div className="mt-3 flex flex-col gap-2 rounded-2xl bg-google-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
          <label
            htmlFor="filtro-regiao"
            className="text-base font-bold text-google-grey-900"
          >
            Região:
          </label>
          <select
            id="filtro-regiao"
            aria-label="Filtrar por região"
            value={regiao}
            onChange={(e) => setRegiao(e.target.value)}
            className="w-full rounded-full border-2 border-google-blue-600 bg-white px-4 py-2 pr-8 text-base font-bold text-google-grey-900 shadow-md outline-none focus-visible:ring-2 focus-visible:ring-google-blue-300 sm:w-80"
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
          <p className="text-base font-bold text-google-grey-600 sm:ml-auto">
            {inteiro(filtradas.length)} {filtradas.length === 1 ? "cidade" : "cidades"} ·{" "}
            {inteiro(totalVotos)} votos
          </p>
        </div>
      </div>

      <div data-testid="area-cidades" className={`${ALTURA_AREA} overflow-y-auto`}>
        <table className="w-full table-fixed border-collapse text-base">
          <thead className="sticky top-0 z-10 border-b-2 border-google-blue-300 bg-google-blue-100 shadow-sm">
            <tr>
              <ThOrdenavel
                campo="cidade"
                rotulo="Cidade"
                ordenacao={ordenacao}
                aoOrdenar={aoOrdenar}
                centro
                className="text-xs! whitespace-nowrap"
                thClassName="w-1/3 px-2 py-0 sm:px-5"
              />
              <ThOrdenavel
                campo="regiao"
                rotulo="Região"
                ordenacao={ordenacao}
                centro
                className="text-xs! whitespace-nowrap"
                thClassName="w-1/3 px-2 py-0 sm:px-5"
              />
              <ThOrdenavel
                campo="votos"
                rotulo="Tot. Votos"
                ordenacao={ordenacao}
                aoOrdenar={aoOrdenar}
                centro
                className="text-xs! whitespace-nowrap"
                thClassName="w-1/3 px-2 py-0 sm:px-5"
              />
            </tr>
          </thead>
          <tbody>
            {linhas.map((c, i) => (
              <tr
                key={c.cidade}
                className={`border-b border-google-grey-200 last:border-b-0 ${
                  i % 2 === 1 ? "bg-google-blue-50" : "bg-white"
                } hover:bg-google-yellow-100`}
              >
                <td className="px-5 py-2.5 font-medium text-black">{c.cidade}</td>
                <td className="px-5 py-2.5 text-center lowercase text-black">{c.regiao}</td>
                <td className="px-5 py-2.5 text-center font-semibold text-black">
                  {inteiro(c.votos)}
                </td>
              </tr>
            ))}
            {linhas.length === 0 ? (
              <tr>
                <td colSpan={3} className="bg-white px-5 py-6 text-center text-black">
                  Nenhuma cidade nesta região.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
