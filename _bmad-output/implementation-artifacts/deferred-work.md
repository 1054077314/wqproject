## Deferred from: code review of 1-1-user-registration (2026-05-29)

- 无过期 token 清理机制 — pre-existing，需添加定时清理任务
- 无登录限流/暴力破解保护 — 不在 AC 范围，后续添加 throttle
- 无登出/token 撤销机制 — 不在 AC 范围，后续添加 logout endpoint

## Deferred from: code review of story 2-1-category-management (2026-05-29)

- `extra_kwargs` 禁用 unique 验证，依赖 DB IntegrityError — 和 users app 一致的设计决策
- 并发删除 race condition（check-then-delete 非原子）— 低频场景，后续加事务
- sort_order 无边界校验 — 低优先级，后续添加 min_value/max_value
