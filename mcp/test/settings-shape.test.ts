// Checks our settings against a copy of what the platform returned when we built this.
// The copy is recorded on a developer's machine and kept out of git, so the test skips where it is missing, as in CI.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const recordedPath = new URL("./fixtures/local-settings.json", import.meta.url);
const skip = existsSync(recordedPath) ? false : "no recorded settings here: fixtures/local-settings.json is not in git";

test("the recorded settings have the shape the tools expect", { skip }, () => {
  const recorded = JSON.parse(readFileSync(recordedPath, "utf8"));
  assert.ok(Array.isArray(recorded.access));
  assert.ok(recorded.access.every((a: { group: string; apps: string[] }) => typeof a.group === "string" && Array.isArray(a.apps)));
  assert.ok(recorded.policies.every((p: { id: string }) => typeof p.id === "string"));
});
