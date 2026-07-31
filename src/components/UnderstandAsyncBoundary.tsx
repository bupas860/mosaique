import { Component, type ErrorInfo, type ReactNode } from "react";

export default class UnderstandAsyncBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Échec du chargement de Comprendre", error, info); }
  render() { return this.state.failed ? <main className="understand-state"><div role="alert"><h1>Chargement impossible</h1><p>Cette ressource de Comprendre n’a pas pu être chargée. Le reste de Mosaïque reste disponible.</p><a href="#/comprendre">Retour à Comprendre</a></div></main> : this.props.children; }
}
