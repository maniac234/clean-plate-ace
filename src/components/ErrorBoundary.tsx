import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-4 text-center">
          <p className="text-sm text-muted-foreground">Algo deu errado. Tente novamente.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="rounded-md border border-input px-3 py-1.5 text-sm text-foreground"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
