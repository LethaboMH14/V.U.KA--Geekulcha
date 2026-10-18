import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("a missing dependency exits 2 (not submitted), never Node's ambiguous 1", () => {
  // Our own dependency-free reason.mjs, but no publish.mjs or node_modules:
  // the same import failure a container hits while `npm ci` hasn't finished.
  const dir = mkdtempSync(join(tmpdir(), "vuka-cli-"));
  try {
    copyFileSync(new URL("./cli.mjs", import.meta.url), join(dir, "cli.mjs"));
    copyFileSync(new URL("./reason.mjs", import.meta.url), join(dir, "reason.mjs"));
    const run = spawnSync(process.execPath, [join(dir, "cli.mjs")], {
      input: JSON.stringify({ kind: "root", root_hex: "ab".repeat(32) }),
      encoding: "utf8",
    });
    assert.equal(run.status, 2, run.stderr);
    assert.match(run.stderr, /sidecar file missing: publish\.mjs/);
    assert.equal(run.stdout, "");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
