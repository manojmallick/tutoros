import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TutorOS",
    short_name: "TutorOS",
    description: "Evidence-grounded tutoring workflow with measured integrity and human sign-off.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5ef",
    theme_color: "#132d2a",
  };
}
