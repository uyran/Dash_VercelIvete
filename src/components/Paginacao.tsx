import { inteiro } from "@/lib/formato";

export type PaginacaoProps = {
  pagina: number;
  total: number;
  porPagina: number;
  aoMudar: (pagina: number) => void;
  /** Substantivo que descreve as linhas: "cidades", "locais"... */
  rotulo: string;
};

const botao = [
  "rounded-lg border-2 border-b-4 border-google-grey-400 bg-gradient-to-b from-white to-google-grey-100",
  "px-4 py-1.5 text-sm font-bold text-google-grey-900 shadow-sm outline-none transition-all",
  "hover:border-google-blue-500 hover:border-b-google-blue-700 hover:from-google-blue-50 hover:to-google-blue-100",
  "focus-visible:ring-2 focus-visible:ring-google-blue-500",
  "active:translate-y-[2px] active:border-b-2",
  "disabled:cursor-not-allowed disabled:border-google-grey-300 disabled:border-b-google-grey-300 disabled:from-white disabled:to-white disabled:text-google-grey-500 disabled:opacity-50 disabled:shadow-none disabled:hover:border-google-grey-300 disabled:hover:border-b-google-grey-300 disabled:hover:from-white disabled:hover:to-white",
].join(" ");

export default function Paginacao({ pagina, total, porPagina, aoMudar, rotulo }: PaginacaoProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const inicio = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const fim = Math.min(pagina * porPagina, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-google-grey-300 bg-white px-5 py-3">
      <p className="text-sm font-bold text-google-grey-900">
        Mostrando <strong className="text-google-blue-700">{inteiro(inicio)}–{inteiro(fim)}</strong> de{" "}
        <strong className="text-google-blue-700">{inteiro(total)}</strong> {rotulo}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={botao}
          disabled={pagina <= 1}
          onClick={() => aoMudar(pagina - 1)}
        >
          ← Anterior
        </button>
        <span className="text-sm font-bold text-google-grey-700">
          Página {inteiro(pagina)} de {inteiro(totalPaginas)}
        </span>
        <button
          type="button"
          className={botao}
          disabled={pagina >= totalPaginas}
          onClick={() => aoMudar(pagina + 1)}
        >
          Próxima →
        </button>
      </div>
    </div>
  );
}
