# End-to-end test against a running ANCHOR server

Drives the app's own event client (`app/src/api/events.ts`) against the server
from PR #51, with a WebCrypto P-256 signer standing in for Android Keystore.

```bash
# 1. PostgreSQL and the server (from a checkout of PR #51)
export DATABASE_URL=postgresql://vuka@127.0.0.1:55432/vuka
export VUKA_PAYLOAD_KEY_B64=<32 random bytes, base64; local only, never committed>
python -m uvicorn server.main:app --host 127.0.0.1 --port 8000

# 2. The client, compiled for Node (never committed)
cd app && npx tsc src/api/events.ts --outDir build-e2e --rootDir .. --allowJs \
  --module commonjs --target es2020 --moduleResolution node --skipLibCheck --lib es2020,dom && cd ..

# 3. Run
node scripts/e2e/anchor-e2e.mjs http://127.0.0.1:8000
```

Signature encodings, as the server and `shared/verify.js` require: the event
statement signature (`details.sig`) is **DER**; the request header signature
(`X-Vuka-Signature`) is **raw r‖s**. Both come from the same P-256 key.
