import type { Metadata } from "next";
import { resolveSiteUrl } from "./site-url";

export function baseMetadata(): Metadata {
  return {
    title: "TutorOS — Learner trajectory with tutor sign-off",
    description:
      "Explore three evidence-grounded tutoring sessions, a reproducible integrity benchmark, and explicit tutor sign-off.",
    metadataBase: new URL(resolveSiteUrl()),
    openGraph: {
      title: "TutorOS — Three-session trajectory with human sign-off",
      description:
        "A judge-ready synthetic tutoring workflow with measured learner trajectory, evidence provenance, and tutor review.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}
