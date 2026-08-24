import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
    console.error('MindLine UI error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-semibold text-fg-heading mb-3">Something went wrong</h1>
          <p className="text-fg-secondary mb-6 max-w-md">
            The page could not be shown. Please try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="px-8 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-2xl font-medium focus-ring"
          >
            Go home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
