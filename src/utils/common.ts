/**
 * Word-wraps text into at most maxLines lines, each capped at maxLineLen
 * characters. If words remain after filling all lines, the last line is
 * ellipsized to signal truncated content.
 */
export function wrapLabel(text: string, maxLineLen: number, maxLines: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  let wordIndex = 0;

  while (wordIndex < words.length && lines.length < maxLines) {
    const word = words[wordIndex];
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLineLen || !current) {
      current = candidate;
      wordIndex++;
    } else {
      lines.push(current);
      current = '';
    }
  }
  if (current) lines.push(current);

  const overflowed = wordIndex < words.length;
  if (overflowed) {
    const lastIndex = lines.length - 1;
    const last = lines[lastIndex];
    lines[lastIndex] = last.length >= maxLineLen ? last.slice(0, maxLineLen - 1) + '…' : last + '…';
  }

  return lines;
}

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
