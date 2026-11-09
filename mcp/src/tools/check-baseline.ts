import { readFileSync } from "node:fs";
import { getSettings } from "../platform.ts";
import type { Settings } from "../platform.ts";
import { requireToken } from "../token-check.ts";

export type Baseline = { access: Record<string, string[]>; policies: Record<string, boolean | number | string> };

const BASELINE_PATH = new URL("../../../client/security-baseline.json", import.meta.url);

const word = (value: unknown) => (value === true ? "on" : value === false ? "off" : JSON.stringify(value));

// Every setting that differs from the baseline, as a sentence. Reads only; changes nothing.
export function differences(settings: Settings, baseline: Baseline): string[] {
  const found: string[] = [];
  for (const { group, apps } of settings.access) {
    const allowed = baseline.access[group];
    if (!allowed) {
      found.push(`${group} is not in the baseline, and it reaches ${apps.length ? apps.join(", ") : "no applications"}.`);
      continue;
    }
    for (const app of apps.filter((a) => !allowed.includes(a))) found.push(`${group} reaches ${app}, but the baseline says it must not.`);
    for (const app of allowed.filter((a) => !apps.includes(a))) found.push(`${group} does not reach ${app}, but the baseline says it should.`);
  }
  for (const group of Object.keys(baseline.access)) {
    if (!settings.access.some((a) => a.group === group)) found.push(`${group} is in the baseline, but the platform has no such group.`);
  }
  for (const { id, value } of settings.policies) {
    if (!(id in baseline.policies)) found.push(`${id} is ${word(value)}, and the baseline doesn't cover it.`);
    else if (baseline.policies[id] !== value) found.push(`${id} is ${word(value)}, but the baseline says ${word(baseline.policies[id])}.`);
  }
  for (const id of Object.keys(baseline.policies)) {
    if (!settings.policies.some((p) => p.id === id)) found.push(`${id} is in the baseline, but the platform has no such policy.`);
  }
  return found;
}

export const checkBaselineTool = {
  name: "check_baseline",
  description: "List, in plain words, every setting that differs from Routa's security baseline. Only reads: it works with a read-only token and changes nothing.",
  inputSchema: { type: "object", properties: {} },
  async handler() {
    await requireToken();
    const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8")) as Baseline;
    const found = differences(await getSettings(), baseline);
    if (found.length === 0) return "Every setting matches the baseline.";
    return [`${found.length} setting${found.length === 1 ? "" : "s"} differ${found.length === 1 ? "s" : ""} from the baseline:`, ...found.map((f) => `- ${f}`), "Nothing has been changed."].join("\n");
  },
};
