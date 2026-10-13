export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

export function assertResolved(html, file) {
  const tokens = [...new Set(html.match(/\{\{[A-Z_]+\}\}/g) || [])];
  if (tokens.length) throw new Error(`${file}: tokens non résolus : ${tokens.join(", ")}`);
}
