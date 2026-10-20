import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cidadesDaRegiao, totaisPorRegiao } from "@/lib/agregados";
import { inteiro } from "@/lib/formato";

type Ponto = { regiao: string; votos: number; cidades: number };

/** Formato do item de tooltip entregue pelo recharts (os dados ficam em `payload`). */
export type ItemTooltipRecharts = {
  dataKey?: string | number;
  value?: number | string;
  payload?: Partial<Ponto>;
};

export function BarraTooltip({
  ativo,
  payload,
}: {
  ativo?: boolean;
  payload?: readonly ItemTooltipRecharts[];
}) {
  if (!ativo) return null;

  const ponto = payload?.[0]?.payload;
  if (!ponto) return null;

  const votos = Number(ponto.votos ?? 0);
  const cidades = Number(ponto.cidades ?? 0);

  return (
    <div className="rounded-xl border border-google-grey-300 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-google-grey-900">{ponto.regiao ?? ""}</p>
      <p className="text-google-blue-600">{inteiro(votos)} votos</p>
      <p className="text-xs text-google-grey-600">
        {cidades} {cidades === 1 ? "cidade" : "cidades"}
      </p>
    </div>
  );
}

/** Conteúdo do tooltip: mantém o balão e avisa qual região está sob o cursor. */
export function AreaCidades({
  active,
  payload,
  aoRegiao,
}: {
  active?: boolean;
  payload?: readonly ItemTooltipRecharts[];
  aoRegiao: (regiao: string | null) => void;
}) {
  const ponto = active ? payload?.[0]?.payload : undefined;
  const regiao = typeof ponto?.regiao === "string" ? ponto.regiao : null;

  useEffect(() => {
    aoRegiao(regiao);
    return () => aoRegiao(null);
  }, [regiao, aoRegiao]);

  return <BarraTooltip ativo={active} payload={payload} />;
}

export default function GraficoRegioes() {
  const [regiaoAtiva, setRegiaoAtiva] = useState<string | null>(null);

  const totalVotos = totaisPorRegiao.reduce((soma, r) => soma + r.votos, 0);
  const cidadesDaArea = regiaoAtiva ? cidadesDaRegiao(regiaoAtiva) : [];

  return (
    <section
      data-testid="grafico-regioes"
      aria-labelledby="titulo-grafico-regioes"
      className="overflow-hidden rounded-2xl border-2 border-google-grey-600/40 bg-white p-5 shadow-md"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2
            id="titulo-grafico-regioes"
            className="text-lg font-semibold text-google-grey-900"
          >
            Votação total por região
          </h2>
          <p className="text-xs text-google-grey-600">
            {inteiro(totalVotos)} votos · {totaisPorRegiao.length} regiões
          </p>
        </div>

        <div
          data-testid="cidades-da-regiao"
          aria-live="polite"
          className="flex h-32 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border-2 border-google-blue-300 bg-google-blue-50 px-4 py-2"
        >
          {regiaoAtiva ? (
            <>
              <p className="shrink-0 text-[11px] font-bold tracking-wider text-google-blue-700 uppercase">
                Cidades · {regiaoAtiva}
              </p>
              <p className="mt-1 min-h-0 flex-1 overflow-y-auto text-xs leading-relaxed font-medium break-words text-google-grey-900">
                {cidadesDaArea.map((c) => c.cidade).join(" · ")}
              </p>
            </>
          ) : (
            <p className="m-auto text-xs text-google-grey-500 italic">
              Passe o cursor sobre uma área do gráfico para ver as cidades da região.
            </p>
          )}
        </div>
      </div>

      <div className="h-[460px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={totaisPorRegiao}
            layout="vertical"
            margin={{ top: 4, right: 56, bottom: 8, left: 8 }}
            barCategoryGap={8}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#e8eaed" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v: number) => inteiro(v)}
              tick={{ fill: "#5f6368", fontSize: 12 }}
              axisLine={{ stroke: "#dadce0" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="regiao"
              width={170}
              tick={{ fill: "#3c4043", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(26, 115, 232, 0.08)" }}
              content={<AreaCidades aoRegiao={setRegiaoAtiva} />}
            />
            <Bar dataKey="votos" fill="#1a73e8" radius={[0, 6, 6, 0]} isAnimationActive={false}>
              <LabelList
                dataKey="votos"
                position="right"
                formatter={(v: number) => inteiro(Number(v))}
                style={{ fill: "#3c4043", fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
