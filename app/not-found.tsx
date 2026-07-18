import Link from "next/link";

export default function NotFound() {
  return (
    <main className="fallback-page">
      <span className="brand-mark" aria-hidden="true">T</span>
      <p className="eyebrow">404 · Page not found</p>
      <h1>This evidence trail ends here.</h1>
      <p>The requested page is not part of the TutorOS deployment candidate.</p>
      <Link className="button button-primary" href="/">Return to the synthetic demo</Link>
    </main>
  );
}
