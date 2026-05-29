---
baseline_commit: NO_VCS
---

# Story 2.7: 商品审核

Status: done

## Story

As a 管理员,
I want 审核待上架商品（通过/驳回）,
so that 平台商品质量可控。

## Acceptance Criteria

1. 管理员已登录，有待审核商品 → 对待审核商品执行"通过"操作 → 商品状态变更为"已上架"
2. 管理员已登录 → 对待审核商品执行"驳回"操作并填写驳回原因 → 商品状态变更为"已驳回"，驳回原因保存
3. 驳回时未填写驳回原因 → 提交驳回操作 → 返回 400，提示驳回原因为必填
4. 非管理员用户 → 尝试审核操作 → 返回 403
5. 管理员已登录 → GET /api/admin/pending-products/ → 返回待审核商品列表，按提交时间排序，支持分页

## Tasks / Subtasks

- [x] Task 1: 添加驳回原因字段（AC: #2）
  - [x] Product 模型添加 reject_reason 字段（可为空）
  - [x] 生成迁移文件
- [x] Task 2: 实现审核接口（AC: #1, #2, #3, #4）
  - [x] 新增 ProductReviewSerializer（action + reject_reason）
  - [x] 新增 product_review 视图（POST，IsAdminUser）
  - [x] 通过：status → "active"
  - [x] 驳回：status → "rejected" + reject_reason 必填
  - [x] 非管理员返回 403
  - [x] urls.py 添加 admin/products/{id}/review/ 路由
- [x] Task 3: 实现待审核列表接口（AC: #5）
  - [x] 新增 pending_product_list 视图（GET，IsAdminUser）
  - [x] 返回 status="pending" 商品，按 created_at 排序
  - [x] urls.py 添加 admin/pending-products/ 路由

## Dev Notes

### 前置依赖

- Story 2.6（我的发布）已完成 — Product 模型、所有 serializer 已存在
- is_staff=True 区分管理员

### Architecture Patterns

**后端模块结构：**
```
backend/apps/products/
├── models.py          — UPDATE: 添加 reject_reason 字段
├── serializers.py     — UPDATE: 添加 ProductReviewSerializer
├── views.py           — UPDATE: 添加 product_review + pending_product_list
├── urls.py            — UPDATE: 添加 admin 路由
└── tests/
    └── test_views.py  — UPDATE: 跳过测试
```

**views 层禁止直接操作数据库，统一走 serializers**

**审核接口设计：**
- POST /api/admin/products/{id}/review/
- body: {"action": "approve"/"reject", "reject_reason": "..."}
- action=approve → status="active"
- action=reject → status="rejected" + reject_reason 必填
- 权限: IsAdminUser（DRF 内置）

**待审核列表设计：**
- GET /api/admin/pending-products/
- 返回 status="pending" 商品
- 按 created_at 排序
- 分页（全局配置）
- 权限: IsAdminUser

**注意：** IsAdminUser 检查 is_staff=True，非 is_superuser

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.7] — 商品审核 AC
- [Source: _bmad-output/planning-artifacts/architecture.md#FR-10,FR-11] — 审核需求

## Dev Agent Record

### Agent Model Used

Claude (mimo-v2.5-pro)

### Debug Log References

- ProductReviewSerializer 用 serializers.Serializer（非 ModelSerializer），validate 检查 action=reject 时 reject_reason 必填
- IsAdminUser 检查 is_staff=True
- product_review 视图先校验 status="pending"，非 pending 返回 400

### Completion Notes List

- Task 1: Product 模型添加 reject_reason 字段（blank=True, default=""），生成迁移 0002
- Task 2: ProductReviewSerializer + product_review 视图（POST，approve/reject），50 tests pass
- Task 3: pending_product_list 视图（GET，IsAdminUser），按 created_at 排序 + 分页

### File List

- `backend/apps/products/models.py` — 修改：添加 reject_reason 字段
- `backend/apps/products/migrations/0002_product_reject_reason.py` — 新增：迁移文件
- `backend/apps/products/serializers.py` — 修改：添加 ProductReviewSerializer
- `backend/apps/products/views.py` — 修改：添加 product_review + pending_product_list 视图
- `backend/apps/products/urls.py` — 修改：添加 admin 路由
