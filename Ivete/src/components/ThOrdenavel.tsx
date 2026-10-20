export type EstadoOrdenacao<T extends string> = { campo: T; dir: "asc" | "desc" };

export default function ThOrdenavel<T extends string>({
  campo,
  rotulo,
  ordenacao,
  aoOrdenar,
  direita = false,
  minuscula = false,
}: {
  campo: T;
  rotulo: string;
  ordenacao: EstadoOrdenacao<T>;
  aoOrdenar: (campo: T) => void;
  direita?: boolean;
  minuscula?: boolean;
}) {
  const ativo = ordenacao.campo === campo;
  return (
    <th
      scope="col"
      aria-sort={ativo ? (ordenacao.dir === "asc" ? "ascending" : "descending") : "none"}
      className={`px-5 py-0 ${direita ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={() => aoOrdenar(campo)}
        aria-label={`Ordenar por ${rotulo}`}
        className={`inline-flex w-full items-center gap-1.5 rounded-lg px-2 py-3 text-xs font-bold tracking-wider text-white ${
          minuscula ? "lowercase" : "uppercase"
        } outline-none transition-colors hover:bg-google-blue-700 focus-visible:ring-2 focus-visible:ring-white/70 ${
          direita ? "justify-end" : "justify-start"
        }`}
      >
        {rotulo}
        <span aria-hidden className="text-[10px] leading-none">
          {ativo ? (ordenacao.dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}
