import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { erro: Error | null };

/** Evita que um erro de renderização apague a página inteira (tela branca). */
export default class LimiteDeErro extends Component<Props, State> {
  state: State = { erro: null };

  static getDerivedStateFromError(erro: Error): State {
    return { erro };
  }

  componentDidCatch(erro: Error, info: ErrorInfo): void {
    console.error("Erro no dashboard:", erro, info.componentStack);
  }

  private recarregar = () => {
    window.location.reload();
  };

  render() {
    if (this.state.erro) {
      return (
        <div
          role="alert"
          className="mx-auto mt-16 max-w-xl rounded-2xl border border-google-red-500/30 bg-google-red-100 p-6 text-center shadow-sm"
        >
          <h1 className="text-lg font-bold text-google-red-500">
            Algo deu errado ao montar o dashboard
          </h1>
          <p className="mt-2 text-sm break-words text-google-grey-800">
            {this.state.erro.message}
          </p>
          <button
            type="button"
            onClick={this.recarregar}
            className="mt-4 rounded-full bg-google-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_2px_0_0_var(--color-google-blue-700)] outline-none hover:bg-google-blue-600 focus-visible:ring-2 focus-visible:ring-google-blue-200 active:translate-y-[1px]"
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
