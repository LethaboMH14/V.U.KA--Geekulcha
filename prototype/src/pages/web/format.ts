/**
 * Display helpers for the web pages — deterministic, no Math.random, so the
 * same seed always renders the same hash. These are cosmetic hex strings for
 * a prototype, never real digests.
 */

/** Groups a hex string into space-separated chunks (Plex Mono, 4 chars by default). */
export function chunkHex(hash: string, size = 4): string {
  const clean = hash.replace(/\s+/g, '')
  const parts: string[] = []
  for (let i = 0; i < clean.length; i += size) parts.push(clean.slice(i, i + size))
  return parts.join(' ')
}

/** Deterministic pseudo-random hex string for demo display, keyed by an integer seed. */
export function fakeHash(seed: number, len = 32): string {
  const chars = '0123456789abcdef'
  let x = (seed >>> 0) || 1
  let out = ''
  for (let i = 0; i < len; i++) {
    x = (Math.imul(x, 1103515245) + 12345) >>> 0
    out += chars[x % 16]
  }
  return out
}
