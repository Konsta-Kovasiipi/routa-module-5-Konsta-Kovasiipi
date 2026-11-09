// Lint: every tool that calls patchSettings must also call showChange,
// so a change is shown before it is applied. apply-change.ts is exempt:
// it applies a change that was already shown by preview-change.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const TOOLS = "mcp/src/tools";
const EXEMPT = new Set(["apply-change.ts", "index.ts"]);

const calls = (source: string, name: string) => new RegExp(`\\b${name}\\s*\\(`).test(source);

const failures = readdirSync(TOOLS)
  .filter((file) => file.endsWith(".ts") && !EXEMPT.has(file))
  .filter((file) => {
    const source = readFileSync(join(TOOLS, file), "utf8");
    return calls(source, "patchSettings") && !calls(source, "showChange");
  });

for (const file of failures) {
  console.error(`${TOOLS}/${file}: calls patchSettings without calling showChange`);
}
if (failures.length > 0) process.exit(1);
console.log("lint: ok");
