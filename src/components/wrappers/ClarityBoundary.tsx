"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { ErrorAlert } from "@/components/generic/ErrorAlert";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ClarityBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service (e.g., Sentry) in production
    console.error("UX Clarity Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorAlert
          title="Something went wrong"
          message="We encountered an unexpected issue. Please refresh the page."
          onRetry={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
