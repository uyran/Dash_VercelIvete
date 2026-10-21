import Cabecalho from "@/components/Cabecalho";
import AssembleiaPE from "@/components/AssembleiaPE";
import GraficoRegioes from "@/components/GraficoRegioes";
import Indicadores from "@/components/Indicadores";
import LimiteDeErro from "@/components/LimiteDeErro";
import TabelaCidades from "@/components/TabelaCidades";
import TabelaZonas from "@/components/TabelaZonas";

export default function App() {
  return (
    <LimiteDeErro>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Cabecalho />
        <Indicadores />
        <GraficoRegioes />
        <TabelaCidades />
        <TabelaZonas />
        <AssembleiaPE />
      </div>
    </LimiteDeErro>
  );
}
