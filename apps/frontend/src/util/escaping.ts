/** html 实体转义 https://www.sitemaps.org/protocol.html#escaping */
export function escaping(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos");
}
