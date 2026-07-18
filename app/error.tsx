"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("TutorOS route error", error);
  }, [error]);

  return (
    <main className="fallback-page">
      <span className="brand-mark" aria-hidden="true">T</span>
      <p className="eyebrow">The demo hit a temporary problem</p>
      <h1>Your evidence was not submitted.</h1>
      <p>Retry this view. If the problem continues, reload the credential-free sample.</p>
      <button className="button button-primary fallback-button" type="button" onClick={reset}>
        Try again
      </button>
      <Link className="text-link" href="/">Reload the demo</Link>
    </main>
  );
}
