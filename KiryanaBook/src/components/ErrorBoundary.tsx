import React from 'react';

interface Props { children: React.ReactNode }
interface State { error: Error | null }

/**
 * Top-level error boundary. Without this, a single page-level throw
 * shows a white screen and the user has to force-quit the app.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Best effort — log; in prod, hook this to Sentry/Crashlytics.
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
    // Soft refresh — keeps auth state from Firebase persistence.
    if (typeof window !== 'undefined') window.location.href = '/';
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="fixed inset-0 z-error-boundary flex flex-col items-center justify-center p-6 text-center bg-black text-white">
        <div className="max-w-sm">
          <h1 className="text-[28px] font-black mb-3">App mein masla hua</h1>
          <p className="text-[13px] font-bold opacity-70 mb-6">
            Kuch unexpected error aa gaya. Aapka data safe hai — restart kar ke dobara try karein.
          </p>
          <pre className="text-[10px] opacity-50 bg-white/5 p-3 rounded-xl text-left overflow-auto max-h-40 mb-6">
            {this.state.error.message}
          </pre>
          <button
            onClick={this.reset}
            className="px-8 py-3 rounded-2xl bg-[#00E676] text-black font-black text-[14px] active:scale-95 transition"
          >
            RESTART
          </button>
        </div>
      </div>
    );
  }
}
