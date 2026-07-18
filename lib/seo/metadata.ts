import type { Metadata } from "next";

export function baseMetadata(): Metadata {
  return {
    title: "TutorOS — Every tutoring session shapes the next",
    description:
      "Turn tutoring-session evidence into focused lesson plans, mastery decisions, and honest parent updates.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"),
    openGraph: {
      title: "TutorOS — Every tutoring session shapes the next",
      description:
        "Turn tutoring-session evidence into focused lesson plans, mastery decisions, and honest parent updates.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}
