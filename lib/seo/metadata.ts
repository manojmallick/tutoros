import type { Metadata } from "next";
import { resolveSiteUrl } from "./site-url";

export function baseMetadata(): Metadata {
  return {
    title: "TutorOS — Deployment candidate for evidence-grounded tutoring",
    description:
      "Explore a privacy-conscious synthetic tutoring workflow with operational health, a 12/12 integrity benchmark, and tutor sign-off.",
    metadataBase: new URL(resolveSiteUrl()),
    openGraph: {
      title: "TutorOS v0.9.0 — Deployment candidate",
      description:
        "A judge-ready synthetic tutoring workflow with deployment health, measured evidence provenance, and human review.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}
