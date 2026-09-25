# End-to-end test against a running ANCHOR server

Drives the app's own event client (`app/src/api/events.ts`) against the
slice-3 ANCHOR server (PR #89), with a WebCrypto P-256 signer standing in for Android Keystore.

```bash
# 1. PostgreSQL and the server (from a checkout of PR #89)
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

## Journey end to end (slice 3, PR #89)

`journey-e2e.mjs` drives the app's own device layer (`app/src/api/device.ts`:
payload checks, signing, queue, PIN flow) against the slice-3 server, and reads
the outcome back from PostgreSQL. The scenarios:

- normal check-in and end;
- duress check-in (the incident is marked, and a guardian alert is queued);
- three wrong PINs, then a normal one (T47);
- an unanswered check-in (the scheduler writes `no_answer`, ~75 s; skip it with `--fast`);
- the export after an `export` PIN authorisation;
- normal and duress request sizes.

```bash
# the slice-3 API and its scheduler (python -m server.scheduler), same DATABASE_URL
cd app && npx tsc src/api/device.ts --outDir build-e2e --rootDir .. --allowJs   --module commonjs --target es2020 --moduleResolution node --skipLibCheck --lib es2020,dom --esModuleInterop && cd ..
DATABASE_URL=postgresql://vuka@127.0.0.1:55432/vuka3 node scripts/e2e/journey-e2e.mjs http://127.0.0.1:8000
```

Server-authored entries (`no_answer`, `incident_closed`) are signed with the
pinned server key, which only its holder has. To run this locally, start the
server with a throwaway key and patch `server.server_signing._pinned_public_key`
exactly as `server/tests/test_slice3_events.py` does. Never commit that key.
