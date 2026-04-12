"use client";

import React from 'react';

interface Props {
  children: React.ReactNode;
  onReset: () => void;
  locale: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export class PipelineErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('[PipelineErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
    this.props.onReset();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const kn = this.props.locale === 'kn';

    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center space-y-3">
        <p className="text-sm font-medium text-red-700">
          {kn
            ? 'ಒಂದು ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
            : 'Something went wrong. Please try again.'}
        </p>
        <button
          onClick={this.handleReset}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          {kn ? 'ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ' : 'Try again'}
        </button>
      </div>
    );
  }
}
