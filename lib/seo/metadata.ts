import type { Metadata } from "next";
import { resolveSiteUrl } from "./site-url";

export function baseMetadata(): Metadata {
  return {
    title: "TutorOS — Evidence from lesson plan to parent update",
    description:
      "Explore a no-login synthetic tutoring session: build a lesson plan, record evidence, schedule review, and create an honest parent update.",
    metadataBase: new URL(resolveSiteUrl()),
    openGraph: {
      title: "TutorOS — Evidence from lesson plan to parent update",
      description:
        "A judge-ready synthetic tutoring session with lesson planning, mastery scheduling, and an evidence-grounded parent update.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}
