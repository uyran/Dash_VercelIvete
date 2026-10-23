export type EstadoOrdenacao<T extends string> = { campo: T; dir: "asc" | "desc" };

const estiloBotao = [
  "inline-flex w-full items-center gap-1.5 rounded-lg px-2 py-2.5",
  "border-2 border-b-4 border-google-blue-300 border-b-google-blue-600 bg-white",
  "text-sm font-bold tracking-wider text-google-blue-800 shadow-[0_3px_0_0_var(--color-google-blue-600)]",
  "transition-colors hover:border-google-blue-600 hover:bg-google-blue-600 hover:text-white",
  "active:translate-y-[2px] active:border-b-2 active:shadow-none",
  "outline-none focus-visible:ring-2 focus-visible:ring-google-blue-500",
].join(" ");

export default function ThOrdenavel<T extends string>({
  campo,
  rotulo,
  ordenacao,
  aoOrdenar,
  direita = false,
  centro = false,
  minuscula = false,
  className = "",
}: {
  campo: T;
  rotulo: string;
  ordenacao: EstadoOrdenacao<T>;
  /** Ausente = o botão fica visível, mas não altera a ordenação. */
  aoOrdenar?: (campo: T) => void;
  direita?: boolean;
  centro?: boolean;
  minuscula?: boolean;
  className?: string;
}) {
  const ativo = ordenacao.campo === campo;
  const alinhamento = centro ? "text-center" : direita ? "text-right" : "text-left";
  const justifica = centro ? "justify-center" : direita ? "justify-end" : "justify-start";

  return (
    <th
      scope="col"
      aria-sort={ativo ? (ordenacao.dir === "asc" ? "ascending" : "descending") : "none"}
      className={`w-1/3 px-5 py-0 ${alinhamento}`}
    >
      <button
        type="button"
        onClick={() => aoOrdenar?.(campo)}
        aria-label={`Ordenar por ${rotulo}`}
        className={`${estiloBotao} ${justifica} ${minuscula ? "lowercase" : "uppercase"} ${className}`}
      >
        {rotulo}
        <span aria-hidden className="text-[10px] leading-none">
          {ativo ? (ordenacao.dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}
