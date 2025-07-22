import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 m-4">
            <h2 className="text-xl font-bold text-destructive mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              An error occurred while rendering this component.
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer text-destructive hover:underline">
                Error details
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
