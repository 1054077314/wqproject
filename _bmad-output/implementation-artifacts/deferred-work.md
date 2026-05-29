## Deferred from: code review of 1-1-user-registration (2026-05-29)

- 无过期 token 清理机制 — pre-existing，需添加定时清理任务
- 无登录限流/暴力破解保护 — 不在 AC 范围，后续添加 throttle
- 无登出/token 撤销机制 — 不在 AC 范围，后续添加 logout endpoint
