// verify-min page glue (spec §14; T03/T04/T05 scope).
// All verification logic lives in shared/verify.js — this file only fetches
// the pinned values committed in contracts/keys/, parses the pasted export
// and renders the result. Rendering uses textContent only (never innerHTML)
// so a hostile export cannot inject markup into the verify page.
import { chainHeadHex, verifyExport } from "../shared/verify.js";

const pinsUrl = new URL("../contracts/keys/verify-pins.json", import.meta.url);
const manifestUrl = new URL("../contracts/keys/manifest.json", import.meta.url);

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url.pathname} → HTTP ${response.status}`);
  return response.json();
}

function render(text) {
  const out = document.getElementById("result");
  out.textContent = text; // textContent only — no markup from data ever
}

async function verify() {
  render("verifying…");
  let pins;
  let manifest;
  let exportObject;
  try {
    [pins, manifest, exportObject] = await Promise.all([
      fetchJson(pinsUrl),
      fetchJson(manifestUrl),
      Promise.resolve(JSON.parse(document.getElementById("export").value)),
    ]);
  } catch (error) {
    render(`unavailable — could not load pinned values or parse the export: ${error.message}`);
    return;
  }
  const result = await verifyExport(exportObject, {
    server_ed25519_public_key: manifest.server_ed25519_public_key,
    network: pins.network,
    topic_id: pins.topic_id,
    topic_epoch: pins.topic_epoch,
  });
  const head = chainHeadHex(exportObject) ?? "(no head)";
  const lines = [
    result.ok ? "verified-min ✓ (internal consistency only)" : `FAILED at entry ${result.first_broken_index}: ${result.reason}`,
    result.detail,
    `pinned: network ${pins.network}, topic ${pins.topic_id}, epoch ${pins.topic_epoch}`,
    `chain head: ${head}`,
    `entries checked: ${result.entries_checked} (payloads stripped from ${result.payload_removed.length} entries)`,
  ];
  if (result.server_signature_not_checked.length > 0) {
    lines.push(`server signatures NOT checked (no pinned manifest): entries ${result.server_signature_not_checked.join(", ")}`);
  }
  if (result.not_checked.length > 0) {
    lines.push(`not checked: ${result.not_checked.join(", ")} — assurance: ${result.assurance}`);
  }
  render(lines.join("\n"));
}

document.getElementById("verify").addEventListener("click", () => {
  verify().catch((error) => render(`unavailable — ${error.message}`));
});