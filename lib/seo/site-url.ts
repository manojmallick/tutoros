export const LOCAL_SITE_URL = "http://localhost:3000";

export function resolveSiteUrl(configuredUrl = process.env.NEXT_PUBLIC_SITE_URL) {
  if (!configuredUrl?.trim()) return LOCAL_SITE_URL;

  try {
    const url = new URL(configuredUrl.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return LOCAL_SITE_URL;
    return url.toString().replace(/\/$/, "");
  } catch {
    return LOCAL_SITE_URL;
  }
}
