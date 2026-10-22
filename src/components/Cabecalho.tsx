import { meta } from "@/lib/dados";

export default function Cabecalho() {
  const partes = meta.nomeCartao.trim().split(/\s+/);
  const prenome = partes[0];
  const nome = partes.slice(1).join(" ");
  const cargo = meta.cargo === "Deputado Estadual" ? "Deputada Estadual" : meta.cargo;

  return (
    <header
      data-testid="cabecalho"
      className="relative overflow-hidden rounded-3xl border border-google-blue-500 bg-white py-6 pr-6 pl-2.5 shadow-sm sm:pr-10 sm:pl-4 lg:pr-12 lg:pl-5"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/olinda.jpg)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/45"
      />
      <div className="absolute inset-x-0 top-0 h-1.5 bg-google-blue-500" />

      <div className="relative grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-3 sm:gap-x-6">
        <h1 className="col-start-1 row-start-1 text-2xl leading-tight font-bold text-google-grey-900 md:text-3xl">
          <span className="block">{prenome}</span>{" "}
          <span className="block">{nome}</span>
        </h1>

        <div className="col-start-1 row-start-2 flex flex-col items-start gap-2">
          <span className="inline-block rounded-lg bg-google-blue-100 px-3 py-1.5 text-sm font-bold whitespace-nowrap text-google-blue-700">
            <span>{cargo}</span> <span>{meta.ano}</span> - <span>{meta.partido}</span> -{" "}
            <span>{meta.situacao}</span>
          </span>
        </div>

        <span
          aria-label={`Número ${meta.numero}`}
          className="col-start-2 row-start-1 flex items-center justify-center self-center rounded-2xl bg-google-blue-500 px-4 py-2 font-sans text-2xl font-bold whitespace-nowrap text-white shadow-[0_4px_0_0_var(--color-google-blue-700)] md:text-3xl"
        >
          {meta.numero}
        </span>
      </div>
    </header>
  );
}
