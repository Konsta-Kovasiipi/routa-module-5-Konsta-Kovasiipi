// PreToolUse hook: refuses any change to mcp/src/token-check.ts.
// Reads the tool call as JSON on stdin; prints a deny decision to refuse it.
import { resolve } from "node:path";

const PROTECTED = "mcp/src/token-check.ts";
// The file name as a whole word, so protect-token-check.ts is not a match.
const NAMED = /(^|[\s/"'=])token-check\.ts/;

type Call = { tool_name?: string; tool_input?: Record<string, unknown>; cwd?: string };

// Commands that only read, so naming the file after them is fine.
const READ_ONLY = new Set(["cat", "head", "tail", "less", "more", "grep", "rg", "ls", "wc", "stat", "file", "diff", "cmp", "echo", "printf", "test", "["]);
const READ_ONLY_GIT = new Set(["add", "status", "diff", "log", "show", "blame", "ls-files", "check-ignore", "rev-parse", "grep", "shortlog", "annotate"]);

function deny(reason: string): never {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  }));
  process.exit(0);
}

function isProtectedPath(path: unknown, cwd: string): boolean {
  if (typeof path !== "string" || path === "") return false;
  return resolve(cwd, path) === resolve(cwd, PROTECTED);
}

// True if this shell segment names the file and might write to it.
function segmentWrites(segment: string): boolean {
  if (!NAMED.test(segment)) return false;
  // A redirect whose target is the file, e.g. `> mcp/src/token-check.ts`.
  if (/>\|?\s*["']?(\S*\/)?token-check\.ts/.test(segment)) return true;
  const words = segment.trim().split(/\s+/).filter((w) => !/^[A-Za-z_][A-Za-z0-9_]*=/.test(w));
  const [command] = words;
  if (command === "git") {
    const verb = words.slice(1).find((w) => !w.startsWith("-"));
    return !(verb && READ_ONLY_GIT.has(verb));
  }
  return !(command && READ_ONLY.has(command.replace(/^.*\//, "")));
}

function commandWrites(command: string): boolean {
  return command.split(/&&|\|\||[;|\n]/).some(segmentWrites);
}

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
let call: Call = {};
try { call = JSON.parse(raw); } catch { deny("Could not read the tool call, so refusing it to protect " + PROTECTED + "."); }

const cwd = call.cwd ?? process.cwd();
const input = call.tool_input ?? {};
const message = `${PROTECTED} is protected: it can't be changed in this project. Ask the user if it needs to change.`;

if (call.tool_name === "Bash") {
  if (typeof input.command === "string" && commandWrites(input.command)) deny(message);
} else if (isProtectedPath(input.file_path ?? input.notebook_path ?? input.path, cwd)) {
  deny(message);
}
