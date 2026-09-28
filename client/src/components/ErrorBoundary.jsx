import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-[#111315] text-[#F5F5F0] p-8 flex flex-col items-center justify-center space-y-4 font-sans select-text">
          <div className="max-w-2xl w-full bg-[#181b20] border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <span className="text-xl">⚠️</span>
              <h2 className="text-lg font-bold text-rose-300">Erro ao renderizar o editor</h2>
            </div>
            <p className="text-sm text-[#92978F]">
              Ocorreu um erro ao carregar a cena do anúncio:
            </p>
            <div className="bg-black/60 p-4 rounded-xl text-xs font-mono text-rose-200 overflow-auto max-h-60 border border-white/10">
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack && (
                <div className="mt-2 text-[#92978F] whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-[#C5F955] text-[#111315] text-xs font-semibold hover:bg-[#b8ea44] transition-colors cursor-pointer"
              >
                Recarregar Aplicativo
              </button>
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = '';
                }}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors cursor-pointer"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
