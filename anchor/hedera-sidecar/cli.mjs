import { submitPinnedMessage } from "./publish.mjs";

async function main() {
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
  const result = await submitPinnedMessage(request);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

main().catch((error) => {
  // Do not print the SDK's exception: it may contain credentials or transaction data.
  process.stderr.write(`Hedera sidecar failed: ${error.message.startsWith("mirror ") ? error.message : "submission or validation failed"}\n`);
  process.exitCode = 1;
});
