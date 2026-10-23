import { useLayoutEffect, useMemo, useRef, useState } from "react";
import ThOrdenavel, { type EstadoOrdenacao } from "@/components/ThOrdenavel";
import { cidadeMaisVotada, infoCidade, locaisDaZona, type LocalZona } from "@/lib/agregados";
import { cidades } from "@/lib/dados";
import { inteiro } from "@/lib/formato";

/** Altura da área rolável: cabeçalho fixo + 7 locais visíveis. */
const ALTURA_AREA = "max-h-[23rem] overflow-y-auto";

type Campo = "local" | "endereco" | "votos";
type Ordenacao = EstadoOrdenacao<Campo>;

const comparadores: Record<Campo, (a: LocalZona, b: LocalZona) => number> = {
  local: (a, b) => a.local.localeCompare(b.local, "pt-BR") || a.votos - b.votos,
  endereco: (a, b) =>
    a.endereco.localeCompare(b.endereco, "pt-BR") || a.local.localeCompare(b.local, "pt-BR"),
  votos: (a, b) => a.votos - b.votos || a.local.localeCompare(b.local, "pt-BR"),
};

function ordenar(linhas: LocalZona[], { campo, dir }: Ordenacao): LocalZona[] {
  const cmp = comparadores[campo];
  return [...linhas].sort((a, b) => (dir === "asc" ? cmp(a, b) : cmp(b, a)));
}

function Resumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-google-blue-200 bg-white px-2 py-1 shadow-sm">
      <p className="text-sm leading-tight font-bold text-google-blue-700">{valor}</p>
      <p className="text-[9px] font-semibold tracking-wide text-google-grey-700 uppercase">
        {rotulo}
      </p>
    </div>
  );
}

/** Largura a partir da qual os botões de zona passam a duas colunas (breakpoint sm). */
const LARGURA_CELULAR = 640;

const botaoZona = [
  "shrink-0 rounded-lg border-2 px-2.5 py-2 text-xs font-bold transition-all",
  "outline-none focus-visible:ring-2 focus-visible:ring-google-blue-500 focus-visible:ring-offset-2",
  "active:translate-y-[3px]",
].join(" ");

export default function TabelaZonas() {
  const [cidade, setCidade] = useState(cidadeMaisVotada.cidade);
  const [zona, setZona] = useState<number | null>(null);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>({ campo: "votos", dir: "desc" });

  const info = infoCidade(cidade)!;
  const grupoZonasRef = useRef<HTMLDivElement>(null);
  const [larguraZona, setLarguraZona] = useState<number | null>(null);

  useLayoutEffect(() => {
    const grupo = grupoZonasRef.current;
    if (!grupo) return;

    const ajustar = () => {
      const botoes = Array.from(grupo.querySelectorAll<HTMLButtonElement>("button"));
      botoes.forEach((b) => {
        b.style.width = "";
      });
      if (botoes.length < 2) {
        setLarguraZona(null);
        return;
      }
      const maior = Math.max(...botoes.map((b) => b.offsetWidth));
      const emCelular = grupo.clientWidth > 0 && grupo.clientWidth < LARGURA_CELULAR;
      const largura = emCelular ? Math.floor((grupo.clientWidth - 10) / 2) : maior;
      botoes.forEach((b) => {
        b.style.width = `${largura}px`;
      });
      setLarguraZona(largura);
    };

    ajustar();
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, [cidade, info.zonas]);

  const zonaAtiva = useMemo(() => {
    if (zona !== null && info.zonas.some((z) => z.zona === zona)) return zona;
    return info.zonaMaisVotada.zona;
  }, [zona, info]);

  const locais = useMemo(
    () => ordenar(locaisDaZona(cidade, zonaAtiva), ordenacao),
    [cidade, zonaAtiva, ordenacao],
  );
  const votosZona = info.zonas.find((z) => z.zona === zonaAtiva)?.votos ?? 0;

  const aoOrdenar = (campo: Campo) => {
    setOrdenacao((atual) =>
      atual.campo === campo
        ? { campo, dir: atual.dir === "asc" ? "desc" : "asc" }
        : { campo, dir: campo === "votos" ? "desc" : "asc" },
    );
  };

  return (
    <section
      data-testid="tabela-zonas"
      aria-labelledby="titulo-tabela-zonas"
      className="overflow-hidden rounded-2xl border-2 border-google-grey-600/40 bg-google-purple-100/50 shadow-md"
    >
      <div className="border-b-2 border-google-grey-200 bg-google-purple-100 p-5">
        <h2 id="titulo-tabela-zonas" className="text-2xl font-semibold text-google-grey-900">
          Voto por zona e local de votação
        </h2>
        <p className="text-xs font-bold text-google-grey-600">
          Escolha uma cidade para ver o resumo e os locais de cada zona.
        </p>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-2 rounded-2xl bg-google-blue-50 px-4 py-3 sm:flex-row sm:items-center lg:shrink-0">
            <label
              htmlFor="cidade-zona"
              className="text-base font-bold text-google-grey-900"
            >
              Cidade:
            </label>
            <select
              id="cidade-zona"
              aria-label="Escolher cidade"
              value={cidade}
              onChange={(e) => {
                setCidade(e.target.value);
                setZona(null);
              }}
              className="w-full rounded-full border-2 border-google-blue-600 bg-white px-4 py-2 pr-8 text-base font-bold text-google-grey-900 shadow-md outline-none focus-visible:ring-2 focus-visible:ring-google-blue-300 sm:w-80"
            >
              {cidades.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-google-blue-50/70 p-2 sm:grid-cols-4 lg:flex-1">
            <Resumo rotulo="Total de votos na cidade" valor={inteiro(info.totalVotos)} />
            <Resumo rotulo="Nº de zonas" valor={inteiro(info.nZonas)} />
            <Resumo rotulo="Zona mais votada" valor={`Zona ${info.zonaMaisVotada.zona} · ${cidade}`} />
            <Resumo rotulo="Total de votos na zona" valor={inteiro(votosZona)} />
          </div>
        </div>
      </div>

      <div className="border-b-2 border-google-grey-200 p-5">
        <div
          ref={grupoZonasRef}
          className="flex flex-wrap gap-2.5"
          role="group"
          aria-label="Zonas da cidade"
        >
          {info.zonas.map((z) => {
            const ativa = z.zona === zonaAtiva;
            return (
              <button
                key={z.zona}
                type="button"
                aria-pressed={ativa}
                aria-label={`Zona ${z.zona}, ${inteiro(z.votos)} votos`}
                onClick={() => {
                  setZona(z.zona);
                }}
                style={larguraZona !== null ? { width: `${larguraZona}px` } : undefined}
                className={[
                  botaoZona,
                  ativa
                    ? "border-b-google-blue-900 border-google-blue-900 bg-google-blue-600 text-white shadow-[0_4px_0_0_var(--color-google-blue-900)] hover:bg-google-blue-700 active:shadow-none"
                    : "border-b-google-grey-500 border-google-grey-400 bg-gradient-to-b from-white to-google-grey-100 text-google-grey-900 shadow-[0_4px_0_0_var(--color-google-grey-500)] hover:border-google-blue-800 hover:border-b-google-blue-900 hover:from-google-blue-500 hover:to-google-blue-600 hover:text-white hover:shadow-[0_4px_0_0_var(--color-google-blue-900)] active:shadow-none",
                ].join(" ")}
              >
                Zona {z.zona} · {inteiro(z.votos)} votos
              </button>
            );
          })}
        </div>
      </div>

      <div data-testid="area-zonas" className={ALTURA_AREA}>
        <table className="w-full table-fixed border-collapse text-base">
          <thead className="sticky top-0 z-10 border-b-2 border-google-blue-300 bg-google-blue-100 shadow-sm">
            <tr>
              <ThOrdenavel
                campo="local"
                rotulo="Local"
                ordenacao={ordenacao}
                aoOrdenar={aoOrdenar}
                centro
                className="text-xs!"
              />
              <ThOrdenavel
                campo="votos"
                rotulo="Votos"
                ordenacao={ordenacao}
                aoOrdenar={aoOrdenar}
                centro
                className="text-xs!"
              />
              <ThOrdenavel
                campo="endereco"
                rotulo="End."
                ordenacao={ordenacao}
                aoOrdenar={aoOrdenar}
                centro
                className="text-xs!"
              />
            </tr>
          </thead>
          <tbody>
            {locais.map((l, i) => (
              <tr
                key={`${l.local}-${i}`}
                className={`border-b border-google-grey-200 last:border-b-0 ${
                  i % 2 === 1 ? "bg-google-blue-50" : "bg-white"
                } hover:bg-google-yellow-100`}
              >
                <td className="px-5 py-2.5 font-medium text-black">{l.local}</td>
                <td className="px-5 py-2.5 text-center font-semibold text-black">
                  {inteiro(l.votos)}
                </td>
                <td className="px-5 py-2.5 text-black">{l.endereco || "—"}</td>
              </tr>
            ))}
            {locais.length === 0 ? (
              <tr>
                <td colSpan={3} className="bg-white px-5 py-6 text-center text-black">
                  Nenhum local encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
