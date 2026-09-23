# shared/ — code both the app and the verify page use

- `canonical.js` — the canonical JSON form (`docs/VUKA-2-SPEC.md` §5), identical byte for byte to the Python reference.
- `der.js` — converts Android Keystore DER signatures to raw r‖s for WebCrypto.
- `merkle.js` — RFC 6962 trees and audit paths (§6).

**Owner:** Ipeleng; tested with vitest against `contracts/vectors/`. The API contract itself lives in `contracts/`, and changing it needs both leads and an ADR.
