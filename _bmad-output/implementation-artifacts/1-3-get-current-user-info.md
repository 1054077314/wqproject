---
baseline_commit: NO_VCS
---

# Story 1.3: 获取当前用户信息

Status: done

## Story

As a 登录用户,
I want 通过 Token 获取自己的信息,
so that 前端可以显示当前登录状态。

## Acceptance Criteria

1. 请求携带有效且未过期的 Bearer Token → GET /api/profile/ 返回 200，包含用户 id 和 username
2. Token 无效或已过期（超过7天）→ 返回 401
3. 请求未携带 Token → 返回 401
4. API 响应统一格式 `{code, message, data}`

## Tasks / Subtasks

- [x] Task 1: profile 接口实现（AC: #1~4）— 已在 story 1.1 中完成
  - [x] GET /api/profile/ 需要 Bearer Token 认证
  - [x] 有效 Token 返回标准格式 {id, username}
  - [x] 无效/过期/无 Token 返回 401
  - [x] 4 个测试用例覆盖全部场景

## Dev Notes

### 已实现说明

本 story 的全部功能已在 story 1.1（用户注册）中一并实现：
- profile 接口：`backend/apps/users/views.py` — profile 函数
- Token 认证：`backend/apps/users/authentication.py` — TokenAuthentication
- 测试覆盖：`backend/apps/users/tests/test_views.py` — ProfileViewTest 4 个用例

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3] — 获取用户信息 AC

## Dev Agent Record

### Agent Model Used

Claude (mimo-v2.5-pro)

### Completion Notes List

- 全部 AC 在 story 1.1 实现中已满足
- 无需额外代码变更

### File List

- 无额外变更（全部文件在 story 1.1 中创建/修改）
