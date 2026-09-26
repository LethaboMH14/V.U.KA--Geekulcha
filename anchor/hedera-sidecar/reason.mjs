// The one-line reason cli.mjs prints on failure. It must never carry
// credentials, so it is built only from fixed text, a module-error code, a
// `mirror ...` message (ours), or an SDK status code such as
// INVALID_SIGNATURE / Timeout -- an enum name, reduced to safe characters.
// The SDK's own message and stack are never used: they may include keys or
// transaction bytes.
export function failureReason(error, submissionMayHaveOccurred) {
  if (error?.code === "ERR_MODULE_NOT_FOUND") {
    // Node reports a missing npm package and a missing source file with the
    // same code. They need different fixes (npm ci vs. the deploy package), so
    // name which one: a package name, or only the missing file's name.
    const match = /Cannot find (package|module) '([^']+)'/.exec(String(error.message));
    const safe = (value) => String(value).replace(/[^A-Za-z0-9_.@/-]/g, "").slice(0, 80);
    if (match && match[1] === "package") return `dependency not installed: ${safe(match[2])} (run npm ci)`;
    if (match) return `sidecar file missing: ${safe(match[2].split(/[\\/]/).pop())} (check the deploy package)`;
    return "a module could not be loaded (run npm ci, and check the deploy package)";
  }
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
