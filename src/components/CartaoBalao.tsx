import { useId, useState, type ReactNode } from "react";

export type ItemBalao = { rotulo: string; valor: string };

export type CartaoBalaoProps = {
  titulo: string;
  valor: ReactNode;
  sub?: string;
  /** Lista exibida no balão ao passar o mouse, focar ou clicar. */
  itens?: ItemBalao[];
  /** Tom de cor no padrão do Google (Material). */
  tom?: "azul" | "verde" | "amarelo" | "roxo" | "turquesa" | "vermelho";
  colunas?: boolean;
};

const TONS = {
  azul: { fundo: "bg-google-blue-50", borda: "border-google-blue-500", texto: "text-google-blue-600", ponto: "bg-google-blue-500" },
  verde: { fundo: "bg-google-green-100", borda: "border-google-green-500", texto: "text-google-green-500", ponto: "bg-google-green-500" },
  amarelo: { fundo: "bg-google-yellow-100", borda: "border-google-yellow-500", texto: "text-[#f9ab00]", ponto: "bg-google-yellow-500" },
  roxo: { fundo: "bg-google-purple-100", borda: "border-google-purple-500", texto: "text-google-purple-500", ponto: "bg-google-purple-500" },
  turquesa: { fundo: "bg-google-teal-100", borda: "border-google-teal-500", texto: "text-[#007b83]", ponto: "bg-google-teal-500" },
  vermelho: { fundo: "bg-google-red-100", borda: "border-google-red-500", texto: "text-google-red-500", ponto: "bg-google-red-500" },
} as const;

export default function CartaoBalao({
  titulo,
  valor,
  sub,
  itens,
  tom = "azul",
  colunas = false,
}: CartaoBalaoProps) {
  const [sobMouse, setSobMouse] = useState(false);
  /** null = segue o mouse | "aberto" = fixado pelo usuário | "fechado" = dispensado */
  const [estado, setEstado] = useState<"aberto" | "fechado" | null>(null);
  const id = useId();

  const interativo = Boolean(itens);
  const aberto =
    interativo && (estado === "aberto" || (estado !== "fechado" && sobMouse));
  const cor = TONS[tom];

  return (
    <div className="relative h-full">
      <div
        tabIndex={interativo ? 0 : undefined}
        role={interativo ? "button" : undefined}
        aria-haspopup={interativo ? "dialog" : undefined}
        aria-expanded={interativo ? aberto : undefined}
        aria-controls={interativo ? id : undefined}
        aria-label={interativo ? `${titulo} — clique para ver a lista` : undefined}
        onMouseEnter={interativo ? () => setSobMouse(true) : undefined}
        onMouseLeave={interativo ? () => setSobMouse(false) : undefined}
        onFocus={interativo ? () => setSobMouse(true) : undefined}
        onBlur={interativo ? () => setSobMouse(false) : undefined}
        onClick={interativo ? () => setEstado((e) => (e === "aberto" ? "fechado" : "aberto")) : undefined}
        onKeyDown={
          interativo
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstado((e) => (e === "aberto" ? "fechado" : "aberto"));
                }
              }
            : undefined
        }
        className={[
          "flex h-full cursor-default flex-col justify-between rounded-2xl border-2 p-5 outline-none",
          "transition-shadow duration-150 focus-visible:ring-2 focus-visible:ring-google-blue-500 focus-visible:ring-offset-2",
          cor.fundo,
          cor.borda,
          interativo
            ? "cursor-pointer shadow-[0_3px_0_0_rgba(60,64,67,0.15)] hover:shadow-[0_6px_0_0_rgba(60,64,67,0.2)] active:translate-y-[2px] active:shadow-[0_1px_0_0_rgba(60,64,67,0.2)]"
            : "shadow-sm",
          aberto ? "ring-2 ring-google-blue-500" : "",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold tracking-wider uppercase text-google-grey-600">
            {titulo}
          </p>
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${cor.ponto}`} aria-hidden />
        </div>

        <p className={`mt-3 text-2xl leading-tight font-bold break-words ${cor.texto}`}>{valor}</p>
        {sub ? <p className="mt-1 text-xs text-google-grey-600">{sub}</p> : null}
      </div>

      {aberto && itens ? (
        <div
          id={id}
          role="tooltip"
          data-testid={`balao-${titulo}`}
          className="balloon absolute top-full left-0 z-30 mt-2 max-h-[22rem] w-[min(24rem,calc(100vw-3rem))] overflow-auto rounded-2xl border border-google-grey-300 bg-white p-4 shadow-[0_8px_24px_rgba(60,64,67,0.25)]"
        >
          <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-google-grey-600">
            {titulo}
          </p>
          <ol className={colunas ? "grid grid-cols-1 gap-1 sm:grid-cols-2" : "space-y-1"}>
            {itens.map((item, i) => (
              <li
                key={item.rotulo}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-1 text-sm odd:bg-google-grey-100"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="w-5 shrink-0 text-right text-xs font-semibold text-google-grey-600">
                    {i + 1}
                  </span>
                  <span className="truncate" title={item.rotulo}>
                    {item.rotulo}
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-google-grey-900">{item.valor}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
