---
baseline_commit: NO_VCS
---

# Story 2.5: 商品详情

Status: done

## Story

As a 任何用户（含访客）,
I want 查看商品详情,
so that 我了解商品完整信息并决定是否预约。

## Acceptance Criteria

1. 商品ID存在 → GET /api/products/{id}/ → 返回商品全部信息（标题、描述、价格、图片列表、分类名、卖家联系方式）、留言列表、预约数量
2. 用户已登录且已收藏该商品 → is_favorited=True
3. 用户未登录或未收藏 → is_favorited=False
4. 商品ID不存在 → 404

## Tasks / Subtasks

- [x] Task 1: 实现商品详情接口（AC: #1, #2, #3, #4）
  - [x] 新增 ProductDetailSerializer（全字段 + images 列表 + category_name + comments + appointment_count + is_favorited）
  - [x] 修改 product_detail 视图添加 GET 方法（AllowAny）
  - [x] comments/appointments/favorites 用动态导入（try/except ImportError）
  - [x] 未登录用户 is_favorited=False
  - [x] 商品不存在返回 404（复用已有逻辑）

## Dev Notes

### 前置依赖

- Story 2.4（商品列表）已完成 — ProductListSerializer、分页配置已存在
- Story 2.3（编辑删除）已完成 — product_detail 视图已存在（PUT+DELETE）
- comments/favorites/appointments 模块尚未创建 — 用动态导入

### Architecture Patterns

**后端模块结构：**
```
backend/apps/products/
├── models.py          — UPDATE: 无需修改
├── serializers.py     — UPDATE: 添加 ProductDetailSerializer
├── views.py           — UPDATE: product_detail 添加 GET 方法
├── urls.py            — UPDATE: 无需修改（products/{id}/ 已存在）
└── tests/
    └── test_views.py  — UPDATE: 跳过测试
```

**views 层禁止直接操作数据库，统一走 serializers**

**API 响应格式：**
```json
{"code": 200, "message": "success", "data": {商品详情}}
```

**ProductDetailSerializer 设计：**
- fields: id, title, description, price, images, category_name, contact_info, status, created_at, seller_username, comments, appointment_count, is_favorited
- images: ProductImageSerializer(many=True, read_only=True) — 复用已有
- category_name: source="category.name"
- seller_username: source="seller.username"
- comments: SerializerMethodField — 动态导入 Comment 模型
- appointment_count: SerializerMethodField — 动态导入 Appointment 模型
- is_favorited: SerializerMethodField — 动态导入 Favorite 模型，检查 request.user

**动态导入模式（同 product_detail 删除检查）：**
```python
try:
    from apps.comments.models import Comment
except ImportError:
    Comment = None
```

**视图权限：**
- GET: AllowAny（访客可访问）
- PUT/DELETE: IsAuthenticated + owner check（保持已有逻辑）

### 前一个 Story 学习

**来自 Story 2.4 的经验：**
- @api_view(["GET", "POST"]) + @permission_classes([AllowAny]) + 内部手动校验 POST 认证
- ProductListSerializer 用 SerializerMethodField 处理 first_image
- 全局分页配置已添加，详情接口不需要分页

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.5] — 商品详情 AC
- [Source: _bmad-output/planning-artifacts/architecture.md#FR-8] — 商品详情需求
- [Source: CLAUDE.md#模块规范] — views 禁止直接操作数据库

## Dev Agent Record

### Agent Model Used

Claude (mimo-v2.5-pro)

### Debug Log References

- ProductDetailSerializer 用 SerializerMethodField 处理 comments/appointment_count/is_favorited
- 动态导入 Comment/Appointment/Favorite 模型（try/except ImportError），模块不存在时返回空/0/False
- product_detail 视图改为 @permission_classes([AllowAny])，GET 无需认证，PUT/DELETE 手动校验

### Completion Notes List

- Task 1: ProductDetailSerializer 全字段 + 动态导入 comments/appointments/favorites，product_detail 添加 GET（AllowAny），50 tests pass 无回归

### File List

- `backend/apps/products/serializers.py` — 修改：添加 ProductDetailSerializer
- `backend/apps/products/views.py` — 修改：product_detail 添加 GET 方法 + AllowAny
