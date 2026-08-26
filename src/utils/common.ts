/**
 * Reads a query param from either the plain URL (?theme=...) or a hash-router
 * URL (/#/?theme=...), since window.location.search doesn't cover anything
 * after the '#'. Plain search params take precedence.
 */
export function getHashQueryParam(paramName: string): string | null {
  try {
    const plainValue = new URLSearchParams(window.location.search).get(paramName);
    if (plainValue) return plainValue;

    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    if (queryIndex === -1) return null;
    return new URLSearchParams(hash.slice(queryIndex + 1)).get(paramName);
  } catch {
    return null;
  }
}
