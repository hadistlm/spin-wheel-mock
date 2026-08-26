import React, { StrictMode, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SpinWheel ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1120] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-xl font-black">Something went wrong</h2>
            <p className="text-sm text-slate-400">
              The application encountered a render issue. Clicking reset will restore default wheel configuration and reload the app.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              Reset &amp; Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

