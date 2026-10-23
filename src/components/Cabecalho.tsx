import { meta } from "@/lib/dados";

export default function Cabecalho() {
  const partes = meta.nomeCartao.trim().split(/\s+/);
  const prenome = partes[0];
  const nome = partes.slice(1).join(" ");
  const cargo = meta.cargo === "Deputado Estadual" ? "Deputada Estadual" : meta.cargo;

  return (
    <header
      data-testid="cabecalho"
      className="relative overflow-hidden rounded-3xl border-2 border-google-blue-600 bg-white py-6 pr-6 pl-2.5 shadow-[0_6px_0_0_var(--color-google-blue-700),0_10px_14px_-4px_rgba(26,115,232,0.35),0_18px_36px_-12px_rgba(26,115,232,0.45),inset_0_2px_0_0_rgba(255,255,255,0.9)] transition-shadow duration-200 hover:shadow-[0_8px_0_0_var(--color-google-blue-700),0_14px_20px_-6px_rgba(26,115,232,0.4),0_26px_48px_-16px_rgba(26,115,232,0.5),inset_0_2px_0_0_rgba(255,255,255,0.9)] sm:pr-10 sm:pl-4 lg:pr-12 lg:pl-5"
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

      <div className="relative flex flex-col items-start gap-2">
        <h1 className="text-2xl leading-tight font-bold text-google-grey-900 md:text-3xl">
          <span className="block">{prenome}</span>{" "}
          <span className="block">{nome}</span>
        </h1>

        <span
          aria-label={`Número ${meta.numero}`}
          className="inline-flex items-center justify-center rounded-lg bg-google-blue-500 px-2.5 py-1 font-sans text-sm font-bold whitespace-nowrap text-white shadow-[0_3px_0_0_var(--color-google-blue-700)]"
        >
          {meta.numero}
        </span>

        <span className="inline-block text-sm font-bold whitespace-nowrap text-google-blue-700">
          <span>{cargo}</span> - <span>{meta.ano}</span>
        </span>

        <span className="text-sm font-semibold whitespace-nowrap text-google-blue-700">
          <span>{meta.partido}</span> <span>{meta.situacao}</span>
        </span>
      </div>
    </header>
  );
}
