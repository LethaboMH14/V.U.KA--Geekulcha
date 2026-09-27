# Ledger demo records (for the video and the judges)

Two real VIGIL exports from Azure (`sim_subj_8d582954`, 27 Sep, simulated demo member, no personal data). Both were tested on the live ledger at https://lethabomh14.github.io/V.U.KA--Geekulcha/dashboard/ledger/#verify

| File | Result on the live ledger |
|---|---|
| `VIGIL-record-demo.json` | **LIVE-VERIFIED.** The browser recomputes 4 entries and the Merkle root, then reads the same root from **Hedera testnet message #62** (consensus **2026-09-27 11:58:39 UTC**). "The record existed in this form, in this order, no later than that time." |
| `VIGIL-record-TAMPERED.json` | **FAILED at entry #3**, `event_hash_mismatch`. It is the same record with one timestamp moved back one minute (`entries[3].ts` 11:58:29Z → 11:57:29Z). The ledger names the exact entry that changed. |

## Recording steps (about 60 s)
1. Open the Verify page above.
2. Drag `VIGIL-record-demo.json` onto the box, or paste its contents. Click **Verify record** and let the trace run to **LIVE-VERIFIED**. Point at the Hedera message number and the time.
3. Click **Clear**. Do the same with `VIGIL-record-TAMPERED.json`, and it shows **FAILED at entry #3**.

**Line to say:** "The check runs in the viewer's own browser and reads the proof from Hedera's public network. Nobody has to trust us, and nobody, including us, can quietly change a record afterwards."
