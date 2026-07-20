import type { Metadata } from "next";
import { resolveSiteUrl } from "./site-url";

export function baseMetadata(): Metadata {
  return {
    title: "TutorOS 1.1 — Evidence from lesson to next decision",
    description:
      "Explore a tutor-built synthetic workflow with a 12/12 integrity benchmark, learner trajectory, and human sign-off.",
    metadataBase: new URL(resolveSiteUrl()),
    openGraph: {
      title: "TutorOS 1.1 — Every session shapes the next",
      description:
        "A judge-ready tutoring workflow with measured evidence provenance, an honest parent update, and human review.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}
