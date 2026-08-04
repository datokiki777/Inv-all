import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level safety net. Catches render-time crashes anywhere in the tree
 * so a bug in one feature (e.g. a PDF template) can't blank the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error", error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface p-6 text-center">
          <p className="font-display text-xl text-ink">Something went wrong</p>
          <p className="max-w-sm text-sm text-ink-muted">
            {this.state.error.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={this.reset}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-contrast"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
