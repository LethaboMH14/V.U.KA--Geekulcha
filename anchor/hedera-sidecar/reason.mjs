// The one-line reason cli.mjs prints on failure. It must never carry
// credentials, so it is built only from fixed text, a module-error code, a
// `mirror ...` message (ours), or an SDK status code such as
// INVALID_SIGNATURE / Timeout -- an enum name, reduced to safe characters.
// The SDK's own message and stack are never used: they may include keys or
// transaction bytes.
export function failureReason(error, submissionMayHaveOccurred) {
  if (error?.code === "ERR_MODULE_NOT_FOUND") return "dependencies not installed (run npm ci)";
  const phase = submissionMayHaveOccurred ? "after submit" : "before submit";
  if (typeof error?.message === "string" && error.message.startsWith("mirror ")) {
    return `${error.message} (${phase})`;
  }
  if (error?.status !== undefined && error?.status !== null) {
    const safe = (value) => String(value).replace(/[^A-Za-z0-9_.:-]/g, "").slice(0, 60);
    return `${safe(error.constructor?.name ?? "Error")} ${safe(error.status)} (${phase})`;
  }
  return `submission or validation failed (${phase})`;
}
