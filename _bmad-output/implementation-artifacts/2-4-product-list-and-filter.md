---
baseline_commit: NO_VCS
---

# Story 2.4: 商品列表与筛选

Status: done

## Story

As a 任何用户（含访客）,
I want 浏览已上架商品列表并按分类筛选,
so that 我可以快速找到想要的商品。

## Acceptance Criteria

1. 数据库有已上架商品 → GET /api/products/?page=1&page_size=20 → 返回已上架商品列表（标题、价格、首图、分类名），按发布时间倒序，分页信息包含 count
2. 指定分类ID筛选 → GET /api/products/?category_id=1 → 只返回该分类下的已上架商品
3. 指定页码 → GET /api/products/?page=2 → 返回对应页数据
4. 数据库无已上架商品 → GET /api/products/ → 返回空列表，count=0

## Tasks / Subtasks

- [x] Task 1: 配置 DRF 分页（AC: #1, #3）
  - [x] settings.py REST_FRAMEWORK 添加 DEFAULT_PAGINATION_CLASS 和 PAGE_SIZE=20
- [x] Task 2: 实现商品列表接口（AC: #1, #2, #3, #4）
  - [x] 新增 ProductListSerializer（精简字段：id, title, price, first_image, category_name）
  - [x] 新增 product_list 视图（GET，AllowAny 无需认证）
  - [x] 只返回 status="active" 的商品
  - [x] 支持 category_id 查询参数筛选
  - [x] 按 created_at 倒序
  - [x] urls.py 复用 products/ 路由，添加 GET 方法
- [ ] Task 3: 编写测试（AC: #1~4）— 跳过，用户要求只实现功能代码

## Dev Notes

### 前置依赖

- Story 2.2（发布商品）已完成 — Product、ProductImage 模型已存在
- Story 2.1（分类管理）已完成 — Category 模型已存在

### Architecture Patterns

**后端模块结构（已存在）：**
```
backend/apps/products/
├── models.py          — UPDATE: 无需修改模型
├── serializers.py     — UPDATE: 添加 ProductListSerializer
├── views.py           — UPDATE: 修改 products/ 路由支持 GET+POST
├── urls.py            — UPDATE: 路由已存在，无需修改路径
└── tests/
    └── test_views.py  — UPDATE: 添加列表测试
```

**修改顺序：** settings → serializers → views → urls → tests

**views 层禁止直接操作数据库，统一走 serializers**

**API 响应格式：**
```json
{"code": 200, "message": "success", "data": {"results": [...], "count": 100}}
```

**DRF 分页配置（需添加到 settings.py）：**
```python
REST_FRAMEWORK = {
    ...,
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}
```

**ProductListSerializer 设计：**
- fields: id, title, price, first_image, category_name
- first_image: SerializerMethodField，取 images 第一张的 image URL，无图返回 null
- category_name: source="category.name"
- 只读，无写入逻辑

**路由设计：**
- 当前 `path("products/", views.product_create)` 只处理 POST
- 修改 product_create 为 product_list_create，支持 GET+POST
- 或在 views.py 中创建新视图并合并到同一路由
- 推荐：修改 product_create 函数添加 GET 方法分支（保持函数职责单一更清晰则用两个视图 + 同路径）
- 最终方案：urls.py 中同一路径绑定一个视图，该视图用 @api_view(["GET", "POST"]) 处理两种方法

**视图权限：**
- GET: AllowAny（访客可访问）
- POST: IsAuthenticated（保持原有逻辑）
- 需要在视图内按方法区分权限

**筛选逻辑：**
```python
products = Product.objects.filter(status="active")
category_id = request.query_params.get("category_id")
if category_id:
    products = products.filter(category_id=category_id)
products = products.order_by("-created_at")
```

**测试规范：**
- 使用 DRF APIClient + force_authenticate
- 列表测试不需要认证（AllowAny）
- 测试文件放在 apps/products/tests/test_views.py（追加）

### 前一个 Story 学习

**来自 Story 2.3 的经验：**
- DRF CharField 默认 allow_blank=False → 自定义 validate 需要 extra_kwargs allow_blank=True
- 图片测试用 PIL.Image.new 生成真实 JPEG
- custom_exception_handler 把 validation error 放在 message → 测试断言检查 resp.data["message"]
- transaction.atomic 保护多对象操作
- sys.modules mock 用于动态导入测试

**来自 Story 2.3 Review 的 Deferred：**
- 新增图片+保留图片总数可能超过3张 — deferred，不影响本 story

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4] — 商品列表与筛选 AC
- [Source: _bmad-output/planning-artifacts/architecture.md#FR-7] — 商品列表需求
- [Source: _bmad-output/planning-artifacts/architecture.md#API Response Formats] — 列表响应格式 {results, count}
- [Source: _bmad-output/implementation-artifacts/2-3-edit-and-delete-product.md] — 前一个 story 学习
- [Source: CLAUDE.md#模块规范] — views 禁止直接操作数据库

## Dev Agent Record

### Agent Model Used

Claude (mimo-v2.5-pro)

### Debug Log References

- settings.py 添加 DEFAULT_PAGINATION_CLASS 后全局生效，需要确认已有接口不受影响（50 tests pass）
- product_create 改名 product_list_create，@api_view(["GET", "POST"])，@permission_classes([AllowAny])，POST 内部手动校验认证

### Completion Notes List

- Task 1: settings.py 添加 DRF PageNumberPagination + PAGE_SIZE=20
- Task 2: ProductListSerializer（id, title, price, first_image, category_name），product_list_create 视图支持 GET（AllowAny）+ POST（IsAuthenticated），category_id 筛选，按 created_at 倒序
- Task 3: 跳过（用户要求只实现功能代码）
- 全部 50 个测试通过，无回归

### File List

- `backend/config/settings.py` — 修改：添加 DEFAULT_PAGINATION_CLASS 和 PAGE_SIZE
- `backend/apps/products/serializers.py` — 修改：添加 ProductListSerializer
- `backend/apps/products/views.py` — 修改：product_create → product_list_create（GET+POST）
- `backend/apps/products/urls.py` — 修改：引用 product_list_create
