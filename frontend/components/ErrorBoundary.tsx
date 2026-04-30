"use client";

import type { ErrorInfo, ReactNode } from "react";
import React from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("UI error:", error, errorInfo);
  }

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
            <p className="mt-2 text-sm text-slate-600">
              We hit an unexpected error. Try reloading the page.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
