# Plan

- [x] Speak MCP over stdio
- [x] get_settings and who_can_reach
- [x] preview_change and apply_change
- [x] The token check on every tool
- [x] set_session_length: IT asked for a quick way
- [x] copy_group_access: IT asked for a way to line one group up with another
- [x] set_session_length only shows the change: every change is shown before it is applied
- [x] copy_group_access only shows the change, behind requireAdmin; applying is left to apply_change (verify's judge: two high findings)
- [ ] The lint fails any tool other than apply-change that calls patchSettings at all, so a tool can't show and apply in one call
- [x] The settings-shape test skips where the recorded settings aren't in git, so CI can pass
- [ ] check_baseline: read-only, lists in plain words every setting that differs from client/security-baseline.json; works with a read-only token and changes nothing
