import { meta } from "@/lib/dados";

const estiloChip = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";

export default function Cabecalho() {
  return (
    <header
      data-testid="cabecalho"
      className="relative overflow-hidden rounded-3xl border border-google-grey-300 bg-white py-6 pr-6 pl-2.5 shadow-sm sm:pr-10 sm:pl-4 lg:pr-12 lg:pl-5"
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-google-blue-500" />

      <div className="flex items-center gap-5">
        <span
          aria-label={`Número ${meta.numero}`}
          className="flex h-28 w-32 shrink-0 items-center justify-center rounded-3xl bg-google-blue-500 font-sans text-4xl font-bold text-white shadow-[0_5px_0_0_var(--color-google-blue-700)] md:h-32 md:w-40 md:text-5xl"
        >
          {meta.numero}
        </span>

        <div className="min-w-0">
          <h1 className="text-3xl leading-tight font-bold text-google-grey-900 md:text-4xl">
            {meta.nomeCartao}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`${estiloChip} bg-google-blue-100 text-google-blue-700`}>
              {meta.cargo === "Deputado Estadual" ? "Candidata a Deputada Estadual" : meta.cargo}
            </span>
            <span className={`${estiloChip} bg-google-grey-100 text-google-grey-700`}>
              {meta.ano}
            </span>
            <span className={`${estiloChip} bg-google-green-100 text-google-green-500`}>
              {meta.situacao}
            </span>
            <span className={`${estiloChip} bg-google-red-100 text-google-red-500`}>
              {meta.partido}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
