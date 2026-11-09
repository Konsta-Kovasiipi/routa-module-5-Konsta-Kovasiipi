---
name: verify
description: Check whether the MCP server is done. Use after each build step, and before saying the work is done.
---

Run the checks below. Report each failing check with its error, or say that every check passed. Don't fix anything here, and don't reset anything.

## The checks

1. **The tests pass:** `npm test`.
2. **A live run, as IT would:** `npm run live-check`, with the test environment running. It takes the two tokens from `ROUTA_TOKEN` and `ROUTA_READONLY_TOKEN`, which are already in the environment. Don't read the token files.
3. **The security judge:** a fresh agent that did not build the server reads it against a file of criteria. The criteria file is an input: it is `client/security-criteria.md` unless the user names another, so it can be swapped. Pass its path, never its contents rewritten or summarised.

   Start the judge with the Agent tool (type `Explore`, so it can only read), never as a fork, so it has none of this session's context. Give it only this brief, with `<criteria>` replaced by the file's path:

   > You are a security reviewer. You did not build this MCP server and you don't know why it was built the way it was. Read the server's code in `mcp/src` (every file, including `tools/`) against the criteria in `<criteria>`, and read the criteria file first. Don't read token files, `.env*` or `~/.routa`, and don't change anything. For each finding, give: the severity, exactly one of low, medium, high or critical, as the criteria define it; the criterion it breaks; the file and line, quoted as `path:line` with the line's text; and one sentence on why it matters. Rate by the criteria's own wording, not by your own scale. If you find nothing for a severity, say so. Report only what you saw in the code, and don't say the server is secure.

   The check **fails if any finding is high or critical**. Low and medium findings are listed and don't fail it. A finding with no file and line quoted doesn't count: ask the judge for them, or leave it out and say so. Report the findings as the judge gave them, don't rate them again, and don't fix any of them here.
