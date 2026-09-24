import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.js"],
    environment: "node",
    // T01/T02 run against contracts/vectors/ (Sibusiso's drop); the vector
    // harness skips with a named reason until those files land.
    passWithNoTests: false,
  },
});