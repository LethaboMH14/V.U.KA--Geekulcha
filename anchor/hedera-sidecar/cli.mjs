let submissionMayHaveOccurred = false;

async function main() {
  // Imported here, not at the top level: a static import that fails (e.g. the
  // SDK not installed yet) kills the process with Node's own exit code 1
  // before the handler below exists, which anchor/publish.py must read as
  // "maybe submitted" and never retries. Inside main(), the same failure
  // reaches the handler with nothing submitted, so it exits 2 (retryable).
  const { pinnedAnchorMessage, submitPinnedMessage } = await import("./publish.mjs");
  let body = "";
  for await (const chunk of process.stdin) {
    body += chunk;
    if (body.length > 1024) throw new Error("sidecar request is too large");
  }
  const request = JSON.parse(body);
  if (!request || typeof request !== "object" || Array.isArray(request) ||
      Object.keys(request).some((key) => !["kind", "root_hex"].includes(key))) {
    throw new Error("sidecar request has unexpected fields");
  }
  if (process.argv.includes("--sim-stub")) {
    const { message } = await pinnedAnchorMessage(request.kind, request.root_hex);
    process.stdout.write(`${JSON.stringify({ sim: true, submitted: false, message_hex: Buffer.from(message).toString("hex") })}\n`);
    process.exitCode = 2; // Positively not submitted, never a ledger receipt.
    return;
  }
  const result = await submitPinnedMessage(request, {
    onBeforeSubmit: () => { submissionMayHaveOccurred = true; },
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

main().catch((error) => {
  // Do not print the SDK's exception: it may contain credentials or transaction data.
  const reason = error.code === "ERR_MODULE_NOT_FOUND" ? "dependencies not installed (run npm ci)"
    : error.message.startsWith("mirror ") ? error.message : "submission or validation failed";
  process.stderr.write(`Hedera sidecar failed: ${reason}\n`);
  process.exitCode = submissionMayHaveOccurred ? 1 : 2;
});
