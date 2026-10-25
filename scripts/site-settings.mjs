// Keep one origin for every public URL. The environment override is useful when
// connecting the replacement domain; no unavailable domain is used as a fallback.
export function resolveSiteUrl(value) {
  const url = new URL(value);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw new Error("SITE_URL / siteUrl doit être une origine HTTP(S), sans chemin ni paramètres");
  return url.origin;
}

export function resolveIndexable(value = "true") {
  if (!["true", "false"].includes(value))
    throw new Error("SITE_INDEXABLE doit valoir true ou false");
  return value === "true";
}
