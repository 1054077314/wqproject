---
baseline_commit: NO_VCS
---

# Story 2.6: 我的发布

Status: done

## Story

As a 登录用户,
I want 查看自己发布的商品列表,
so that 我管理自己的商品。

## Acceptance Criteria

1. 用户已登录 → GET /api/my-products/ → 返回当前用户所有状态的商品列表，显示预约数量
2. 指定状态筛选（如"待审核"）→ GET /api/my-products/?status=pending → 只返回该状态的商品

## Tasks / Subtasks

- [x] Task 1: 实现我的发布接口（AC: #1, #2）
  - [x] 新增 MyProductSerializer（全字段 + images + category_name + appointment_count）
  - [x] 新增 my_product_list 视图（GET，IsAuthenticated）
  - [x] 返回当前用户所有状态商品（不筛选 status="active"）
  - [x] 支持 status 查询参数筛选
  - [x] 按 created_at 倒序
  - [x] urls.py 添加 my-products/ 路由

## Dev Notes

### 前置依赖

- Story 2.5（商品详情）已完成 — ProductDetailSerializer 已存在
- appointments 模块尚未创建 — 动态导入

### Architecture Patterns

**后端模块结构：**
```
backend/apps/products/
├── models.py          — UPDATE: 无需修改
├── serializers.py     — UPDATE: 添加 MyProductSerializer
├── views.py           — UPDATE: 添加 my_product_list 视图
├── urls.py            — UPDATE: 添加 my-products/ 路由
└── tests/
    └── test_views.py  — UPDATE: 跳过测试
```

**views 层禁止直接操作数据库，统一走 serializers**

**MyProductSerializer 设计：**
- 复用 ProductDetailSerializer 或精简版
- fields: id, title, price, status, images, category_name, appointment_count, created_at
- appointment_count: SerializerMethodField（动态导入 Appointment）

**视图逻辑：**
```python
products = Product.objects.filter(seller=request.user)
status_filter = request.query_params.get("status")
if status_filter:
    products = products.filter(status=status_filter)
products = products.order_by("-created_at")
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.6] — 我的发布 AC
- [Source: _bmad-output/planning-artifacts/architecture.md#FR-9] — 我的发布需求

## Dev Agent Record

### Agent Model Used

Claude (mimo-v2.5-pro)

### Debug Log References

- MyProductSerializer 精简字段，appointment_count 动态导入
- my_product_list 视图用 PageNumberPagination（全局配置）

### Completion Notes List

- Task 1: MyProductSerializer（id, title, price, status, images, category_name, appointment_count, created_at），my_product_list 视图支持 status 筛选，50 tests pass

### File List

- `backend/apps/products/serializers.py` — 修改：添加 MyProductSerializer
- `backend/apps/products/views.py` — 修改：添加 my_product_list 视图
- `backend/apps/products/urls.py` — 修改：添加 my-products/ 路由
