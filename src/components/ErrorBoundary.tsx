import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <h4 className="text-lg font-semibold text-rose-700">Hubo un problema al cargar el laboratorio</h4>
          <p className="mt-2 text-sm text-rose-600">
            Se produjo un error inesperado. Podés recargar la página e intentar de nuevo.
          </p>
          <div className="mt-4 text-xs text-rose-500">{this.state.error?.message}</div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition"
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
