import { Component, createRef, type ReactNode } from 'react';

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  private panel = createRef<HTMLElement>();

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch() {
    window.scrollTo(0, 0);
    this.panel.current?.focus({ preventScroll: true });
  }

  render() {
    if (this.state.failed) return <main ref={this.panel} tabIndex={-1} aria-labelledby="app-error-title" className="narrow">
      <h1 id="app-error-title">Não foi possível abrir esta tela.</h1>
      <p>Recarregue a página para tentar de novo. Se estiver sem conexão, conecte o aparelho à internet.</p>
      <div className="actions">
        <button className="button primary" onClick={() => window.location.reload()}>Recarregar a página</button>
        <a className="button secondary" href={import.meta.env.BASE_URL}>Voltar ao início</a>
      </div>
    </main>;
    return this.props.children;
  }
}
