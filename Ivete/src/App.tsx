import Cabecalho from "@/components/Cabecalho";
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
        <footer
          data-testid="rodape"
          className="rounded-2xl border-2 border-google-grey-600/40 bg-white px-6 py-5 text-center shadow-md"
        >
          <p className="text-sm font-medium text-google-grey-600">
            Dados extraidos do TSE.
          </p>
          <p className="mt-1 text-sm">
            <a
              href="mailto:uyrancosta@gmail.com"
              className="font-medium text-google-blue-600 hover:text-google-blue-700 hover:underline"
            >
              Desenvolvido por uyrancosta@gmail.com
            </a>
          </p>
        </footer>
      </div>
    </LimiteDeErro>
  );
}
