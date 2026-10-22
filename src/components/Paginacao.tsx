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
  "rounded-lg border-2 border-b-4 border-google-blue-900 bg-gradient-to-b from-google-blue-500 to-google-blue-600",
  "px-4 py-1.5 text-sm font-bold text-white shadow-[0_3px_0_0_var(--color-google-blue-900)] outline-none transition-all",
  "hover:border-google-blue-700 hover:border-b-google-blue-900 hover:from-google-blue-600 hover:to-google-blue-700",
  "focus-visible:ring-2 focus-visible:ring-google-blue-300",
  "active:translate-y-[3px] active:border-b-2 active:shadow-none",
  "disabled:cursor-not-allowed disabled:border-google-grey-300 disabled:border-b-google-grey-400 disabled:from-google-grey-100 disabled:to-google-grey-100 disabled:text-google-grey-600 disabled:opacity-70 disabled:shadow-none disabled:hover:border-google-grey-300 disabled:hover:border-b-google-grey-400 disabled:hover:from-google-grey-100 disabled:hover:to-google-grey-100",
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
