#!/usr/bin/env node
// Verify a v2 subject export without a mirror or Merkle receipt.
import { readFile } from "node:fs/promises";
import { verifyExport } from "../verify.js";

const file = process.argv[2];
if (!file || process.argv.length !== 3) {
  process.stderr.write("Usage: node shared/scripts/verify-export.mjs <export.json>\n");
  process.exitCode = 1;
} else {
  try {
    const exportObj = JSON.parse(await readFile(file, "utf8"));
    const result = await verifyExport(exportObj);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    const result = {
      ok: false,
      entries_checked: 0,
      first_broken_index: null,
      reason: "bad_shape",
      detail: `Could not read or parse the export: ${error.message}`,
      payload_removed: [],
      server_signature_not_checked: [],
      not_checked: ["anchor receipts", "Merkle proofs", "key revocation", "server signatures"],
    };
    process.stdout.write(`${JSON.stringify(result)}\n`);
    process.exitCode = 1;
  }
}
