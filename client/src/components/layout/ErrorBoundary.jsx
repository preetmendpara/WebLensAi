import { Component } from "react";
import { Button } from "@/components/ui/Button";

/**
 * A render error must not leave a blank page — least of all during a live
 * demonstration. Catches anything a page component throws and offers a way
 * back, while keeping the actual stack in the console for us and out of
 * the user's face.
 */
export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error("[weblens] render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-mono text-meta uppercase text-ink-faint">
          Something broke
        </p>
        <h1 className="mt-4 text-title font-medium tracking-tight text-ink">
          This page didn't load correctly.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          The analysis itself is unaffected — reloading usually clears this.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={() => window.location.reload()}>Reload the page</Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/")}>
            Go home
          </Button>
        </div>
      </main>
    );
  }
}
