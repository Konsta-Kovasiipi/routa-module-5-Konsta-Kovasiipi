import assert from "node:assert/strict";
import { test } from "node:test";
import { checkBaselineTool, differences } from "../src/tools/check-baseline.ts";
import type { Baseline } from "../src/tools/check-baseline.ts";
import { fakePlatform } from "./fake-platform.ts";

const baseline: Baseline = {
  access: { contractors: ["timesheets"], staff: ["documents", "timesheets"] },
  policies: { "session-length-hours": 8, "mfa.staff": true },
};

test("nothing differs when the settings match", () => {
  const settings = {
    access: [{ group: "contractors", apps: ["timesheets"] }, { group: "staff", apps: ["timesheets", "documents"] }],
    policies: [{ id: "session-length-hours", label: "", value: 8 }, { id: "mfa.staff", label: "", value: true }],
  };
  assert.deepEqual(differences(settings, baseline), []);
});

test("each difference is a plain sentence", () => {
  const settings = {
    access: [{ group: "contractors", apps: ["timesheets", "finance"] }, { group: "staff", apps: ["documents"] }],
    policies: [{ id: "session-length-hours", label: "", value: 24 }, { id: "mfa.staff", label: "", value: false }, { id: "extra", label: "", value: 1 }],
  };
  assert.deepEqual(differences(settings, baseline), [
    "contractors reaches finance, but the baseline says it must not.",
    "staff does not reach timesheets, but the baseline says it should.",
    "session-length-hours is 24, but the baseline says 8.",
    "mfa.staff is off, but the baseline says on.",
    "extra is 1, and the baseline doesn't cover it.",
  ]);
});

test("check_baseline works with a read-only token and changes nothing", async () => {
  const { patches } = fakePlatform("read");
  const text = await checkBaselineTool.handler();
  assert.match(text, /session-length-hours is 24, but the baseline says 8\./);
  assert.match(text, /Nothing has been changed\./);
  assert.equal(patches.length, 0);
});
