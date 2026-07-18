import type { Metadata } from "next";
import { resolveSiteUrl } from "./site-url";

export function baseMetadata(): Metadata {
  return {
    title: "TutorOS — Measured evidence from lesson plan to parent update",
    description:
      "Explore a no-login synthetic tutoring session with a reproducible 12-case Evidence Integrity Benchmark.",
    metadataBase: new URL(resolveSiteUrl()),
    openGraph: {
      title: "TutorOS — 12/12 Evidence Integrity Benchmark",
      description:
        "A judge-ready synthetic tutoring session with measured mastery, report-integrity, and evidence-provenance checks.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}
