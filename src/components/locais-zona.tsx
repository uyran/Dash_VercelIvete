import { useMemo, useState } from "react";
import locaisRaw from "@/data/locais-zona-2026.json";
import votosRaw from "@/data/votos.json";

type Local = [string, string, number, number, number, number, number, string, string, number[]];
type CidadesJson = Record<string, Record<string, Local[]>>;

const locais = locaisRaw as unknown as CidadesJson;
const fmt = (n: number) => n.toLocaleString("pt-BR");

type VotoRow = [string, number, number, number];
const votos = votosRaw as VotoRow[];

const TOTAIS: Record<string, { v22: number; v26: number }> = (() => {
  const m: Record<string, { v22: number; v26: number }> = {};
  for (const [c, , ano, v] of votos) {
    const o = (m[c] ??= { v22: 0, v26: 0 });
    if (ano === 2022) o.v22 += v;
    else o.v26 += v;
  }
  return m;
})();

const pct = (a: number, b: number) =>
  a === 0
    ? b > 0
      ? "novo"
      : "—"
    : `${(((b - a) / a) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

type Zona = { zona: string; total: number; locais: Local[] };
type Cidade = { nome: string; total: number; zonas: Zona[]; zonaLider: string; liderTotal: number };

const CIDADES: Cidade[] = Object.entries(locais)
  .map(([nome, zmap]) => {
    const zonas: Zona[] = Object.entries(zmap)
      .map(([z, ls]) => ({ zona: z, total: ls.reduce((s, l) => s + l[2], 0), locais: ls }))
      .sort((a, b) => Number(a.zona) - Number(b.zona));
    const total = zonas.reduce((s, z) => s + z.total, 0);
    const lider = zonas.reduce((best, z) => (z.total > best.total ? z : best));
    return { nome, total, zonas, zonaLider: lider.zona, liderTotal: lider.total };
  })
  .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

const POR_NOME = new Map(CIDADES.map((c) => [c.nome, c]));
const INICIAL = CIDADES.reduce((best, c) => (c.total > best.total ? c : best));

type Ordem = "local" | "votos" | "endereco" | "bairro";

const BTN_TOPO =
  "inline-flex w-[120px] justify-center rounded-lg border-2 px-3.5 py-2 text-sm font-semibold transition-all duration-150 hover:-translate-y-[1px] active:translate-y-[3px] peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2";
const BTN_TOPO_ON =
  "border-card bg-card text-nav shadow-[0_4px_0_0_rgba(0,0,0,0.18)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.18)] active:shadow-[0_1px_0_0_rgba(0,0,0,0.18)]";
const BTN_TOPO_OFF =
  "border-nav-foreground/45 bg-nav-foreground/10 text-nav-foreground shadow-[0_4px_0_0_rgba(0,0,0,0.3)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.3)] active:shadow-[0_1px_0_0_rgba(0,0,0,0.3)]";
const BTN_TOPO_ESTATICO =
  "inline-flex w-[120px] justify-center rounded-lg border-2 border-nav-foreground/45 bg-nav-foreground/10 px-3.5 py-2 text-sm font-semibold text-nav-foreground shadow-[0_4px_0_0_rgba(0,0,0,0.3)]";

export function LocaisZona() {
  const [cidade, setCidade] = useState(INICIAL.nome);
  const [zonaSel, setZonaSel] = useState(INICIAL.zonaLider);
  const [ordem, setOrdem] = useState<Ordem>("votos");
  const info = POR_NOME.get(cidade) ?? INICIAL;
  const zona = info.zonas.find((z) => z.zona === zonaSel) ?? null;
  const linhas = useMemo(() => {
    if (!zona) return [];
    const ls = [...zona.locais];
    if (ordem === "local") ls.sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
    else if (ordem === "endereco") ls.sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
    else if (ordem === "bairro")
      ls.sort(
        (a, b) =>
          (a[7] || "").localeCompare(b[7] || "", "pt-BR") || a[0].localeCompare(b[0], "pt-BR"),
      );
    else ls.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0], "pt-BR"));
    return ls;
  }, [zona, ordem]);

  const trocar = (nome: string) => {
    const c = POR_NOME.get(nome);
    if (!c) return;
    setCidade(nome);
    setZonaSel(c.zonaLider);
  };

  const totais = TOTAIS[cidade] ?? { v22: 0, v26: 0 };
  const dif = totais.v26 - totais.v22;

  return (
    <section className="relative rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[2rem] font-semibold">Votos por zona e local de votação em 2026</h3>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
        <select
          value={cidade}
          onChange={(e) => trocar(e.target.value)}
          aria-label="Escolher cidade"
          className="w-64 rounded-md border-2 border-nav/40 bg-nav/10 px-4 py-2 text-sm font-medium shadow-sm"
        >
          {CIDADES.map((c) => (
            <option key={c.nome}>{c.nome}</option>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-md border bg-background px-3 py-2 text-sm">
          <span className="text-foreground">Nº de Zona(s): {info.zonas.length}</span>
          <span className="text-foreground">
            Mais votada: Zona {info.zonaLider} — {fmt(info.liderTotal)} votos
          </span>
          <span className="text-foreground">2022: {fmt(totais.v22)}</span>
          <span className="text-foreground">2026: {fmt(totais.v26)}</span>
          <span className="text-foreground">
            Diferença:{" "}
            <span className={dif >= 0 ? "text-success" : "text-danger"}>
              {dif > 0 ? "+" : ""}
              {fmt(dif)} ({pct(totais.v22, totais.v26)})
            </span>
          </span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {info.zonas.map((z) => {
          const marcada = z.zona === zonaSel;
          return (
            <label key={z.zona} className="inline-flex">
              <input
                type="radio"
                name="zona-locais"
                className="peer sr-only"
                checked={marcada}
                onChange={() => setZonaSel(z.zona)}
              />
              <span
                className={`inline-flex cursor-pointer rounded-lg border-2 px-3.5 py-2 text-sm font-semibold transition-all duration-150 hover:-translate-y-[1px] active:translate-y-[3px] peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 ${
                  marcada
                    ? "border-nav bg-nav text-nav-foreground shadow-[0_4px_0_0_var(--nav)] hover:shadow-[0_5px_0_0_var(--nav)] active:shadow-[0_1px_0_0_var(--nav)]"
                    : "border-foreground/20 bg-card text-foreground shadow-[0_4px_0_0_rgba(0,0,0,0.18)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.18)] active:shadow-[0_1px_0_0_rgba(0,0,0,0.18)]"
                }`}
              >
                Zona {z.zona} - {fmt(z.total)}
              </span>
            </label>
          );
        })}
      </div>

      {!zona ? (
        <p className="text-sm text-muted-foreground">Selecione uma zona.</p>
      ) : (
        <div className="max-h-[340px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-nav">
              <tr className="text-left text-nav-foreground">
                <th className="py-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="ordem-locais"
                      className="peer sr-only"
                      checked={ordem === "local"}
                      onChange={() => setOrdem("local")}
                    />
                    <span
                      className={`${BTN_TOPO} ${ordem === "local" ? BTN_TOPO_ON : BTN_TOPO_OFF}`}
                    >
                      Local
                    </span>
                  </label>
                </th>
                <th className="py-2 pr-8 text-right">
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="ordem-locais"
                      className="peer sr-only"
                      checked={ordem === "votos"}
                      onChange={() => setOrdem("votos")}
                    />
                    <span
                      className={`${BTN_TOPO} ${ordem === "votos" ? BTN_TOPO_ON : BTN_TOPO_OFF}`}
                    >
                      Votos
                    </span>
                  </label>
                </th>
                <th className="py-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="ordem-locais"
                      className="peer sr-only"
                      checked={ordem === "endereco"}
                      onChange={() => setOrdem("endereco")}
                    />
                    <span
                      className={`${BTN_TOPO} ${ordem === "endereco" ? BTN_TOPO_ON : BTN_TOPO_OFF}`}
                    >
                      Endereço
                    </span>
                  </label>
                </th>
                <th className="py-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="ordem-locais"
                      className="peer sr-only"
                      checked={ordem === "bairro"}
                      onChange={() => setOrdem("bairro")}
                    />
                    <span
                      className={`${BTN_TOPO} ${ordem === "bairro" ? BTN_TOPO_ON : BTN_TOPO_OFF}`}
                    >
                      Bairro
                    </span>
                  </label>
                </th>
                <th className="py-2">
                  <span className={BTN_TOPO_ESTATICO}>Seções</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l, i) => (
                <tr key={`${l[0]}-${i}`} className="border-b">
                  <td className="py-2 pr-3">{l[0]}</td>
                  <td className="py-2 pr-8 text-right font-semibold">{fmt(l[2])}</td>
                  <td className="pl-3 text-muted-foreground">{l[1]}</td>
                  <td className="pl-3 text-muted-foreground">{l[7] || "—"}</td>
                  <td className="pl-3 text-muted-foreground" title={l[9].join(", ")}>
                    {l[9].length > 0 ? `${l[9].length} seções` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
