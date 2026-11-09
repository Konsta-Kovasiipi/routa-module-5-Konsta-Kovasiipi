// Lint: only apply-change.ts may call patchSettings, so a tool can't show and apply a change in one call.
// apply-change.ts applies a change that was already shown by preview-change.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const TOOLS = "mcp/src/tools";
const EXEMPT = new Set(["apply-change.ts", "index.ts"]);

const calls = (source: string, name: string) => new RegExp(`\\b${name}\\s*\\(`).test(source);

const failures = readdirSync(TOOLS)
  .filter((file) => file.endsWith(".ts") && !EXEMPT.has(file))
  .filter((file) => calls(readFileSync(join(TOOLS, file), "utf8"), "patchSettings"));

for (const file of failures) {
  console.error(`${TOOLS}/${file}: calls patchSettings; only apply-change.ts may apply a change`);
}
if (failures.length > 0) process.exit(1);
console.log("lint: ok");
