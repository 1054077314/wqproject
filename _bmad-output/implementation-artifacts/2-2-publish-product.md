---
baseline_commit: NO_VCS
---

# Story 2.2: 发布商品

Status: done

## Story

As a 登录学生,
I want 发布二手商品（含图片上传）,
so that 商品可以被其他同学看到并预约。

## Acceptance Criteria

1. 用户已登录，提交商品信息（标题≤100字符、描述≤2000字符、价格正数精确到分、分类ID、联系方式）+ 可选图片（最多3张，multipart/form-data）→ 返回 201，商品状态为"待审核"，图片存储到 media/products/
2. 缺少必填字段 → 返回 400，提示缺少的字段
3. 图片超过3张 → 返回 400，提示最多上传3张图片
4. 价格为负数或零 → 返回 400，提示价格必须为正数

## Tasks / Subtasks

- [x] Task 1: 创建 products app（AC: #1~4）
  - [x] 创建 backend/apps/products/ 目录结构
  - [x] models.py: Product 模型（title, description, price, category FK, seller FK, contact_info, status, created_at）
  - [x] models.py: ProductImage 模型（product FK, image, created_at）
  - [x] serializers.py: ProductSerializer（含图片嵌套）
  - [x] views.py: product_create 视图
  - [x] urls.py: 路由配置
  - [x] 注册到 settings.py INSTALLED_APPS
  - [x] 配置 MEDIA_ROOT + MEDIA_URL
  - [x] 根 urls.py 添加 media URL
  - [x] 生成迁移并执行
- [x] Task 2: 实现商品发布接口（AC: #1~4）
  - [x] POST /api/products/ 需要认证（IsAuthenticated）
  - [x] 必填字段：title, description, price, category_id, contact_info
  - [x] 可选图片：通过 multipart/form-data 上传，最多3张
  - [x] 标题≤100字符，描述≤2000字符
  - [x] 价格 > 0，DecimalField 精确到分
  - [x] 分类必须存在（category_id 外键校验）
  - [x] 商品状态默认 "pending"（待审核）
  - [x] 图片存储到 media/products/
  - [x] 标准响应格式 {code, message, data}
- [x] Task 3: 编写测试（AC: #1~4）
  - [x] 创建 tests/__init__.py + test_views.py
  - [x] 测试发布成功（201，含图片）
  - [x] 测试缺少必填字段（400）
  - [x] 测试价格为负数（400）
  - [x] 测试价格为零（400）
  - [x] 测试图片超过3张（400）
  - [x] 测试未登录发布（401）
  - [x] 测试分类不存在（400）

## Dev Notes

### 前置依赖

- Story 2.1（分类管理）已完成 — Category 模型已存在
- Story 1.1（用户注册）已完成 — User 模型已存在

### Architecture Patterns

**后端模块结构（必须遵守）：**
```
backend/apps/products/
├── models.py
├── serializers.py
├── views.py
├── urls.py
├── __init__.py
├── migrations/
│   └── __init__.py
└── tests/
    ├── __init__.py
    └── test_views.py
```

**创建顺序：** models → serializers → views → urls → tests

**views 层禁止直接操作数据库，统一走 serializers**

**权限模型：** IsAuthenticated（登录用户即可发布）

**API 响应格式：**
```json
{"code": 200, "message": "success", "data": {...}}
```

**命名规范：**
- 数据库表名：products, product_images（复数小写蛇形）
- API 端点：/api/products/（发布）
- Python 函数：蛇形命名

**Product 模型设计：**
```python
class Product(models.Model):
    STATUS_CHOICES = [
        ("pending", "待审核"),
        ("active", "已上架"),
        ("rejected", "已驳回"),
        ("offline", "已下架"),
    ]
    title = models.CharField(max_length=100)
    description = models.TextField(max_length=2000)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey("categories.Category", on_delete=models.CASCADE)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    contact_info = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "products"
```

**ProductImage 模型设计：**
```python
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "product_images"
```

**图片上传配置（settings.py）：**
```python
import os
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")
```

**根 urls.py 添加 media URL：**
```python
from django.conf import settings
from django.conf.urls.static import static
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

**Serializer 设计要点：**
- ProductSerializer 接受嵌套的 images 数据
- 使用 `ListField` 或自定义字段处理多图片上传
- 价格校验：`min_value=0.01`
- 分类校验：验证 category_id 存在

**测试规范：**
- 使用 DRF APIClient + force_authenticate
- 图片测试用 SimpleUploadedFile 模拟上传
- 测试文件放在 apps/products/tests/test_views.py

### 前一个 Story 学习

**来自 Story 2.1 的经验：**
- ModelSerializer 内置 unique 验证可能干扰自定义错误码 → 用 extra_kwargs 禁用 + DB 约束兜底
- 列表接口使用 serializer 而非手动构建 dict（架构规范）
- 名称字段需 validate_name 做 strip + 空值校验
- 所有响应统一 {code, message, data} 格式（含 DELETE）
- except 只捕获具体异常（ImportError），不用 except Exception

**来自 Story 2.1 Review 的 Deferred：**
- 无并发处理保护（低频场景，本 story 不涉及）

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2] — 发布商品 AC
- [Source: _bmad-output/planning-artifacts/architecture.md#FR-4] — 发布商品需求
- [Source: _bmad-output/implementation-artifacts/2-1-category-management.md] — 前一个 story 学习
- [Source: CLAUDE.md#模块规范] — views 禁止直接操作数据库

## Review Findings

- [x] [Review][Patch] create() 无事务保护 — 图片创建失败时 product 成孤儿 [serializers.py:72-77] — 已修复：添加 transaction.atomic
- [x] [Review][Patch] validate_uploaded_images 死代码 — ListField max_length=3 已先拦截，自定义校验永不会执行 [serializers.py:60-62] — 已修复：移除死代码
- [x] [Review][Patch] validate_category 冗余 — PrimaryKeyRelatedField 已做存在性校验 [serializers.py:65-70] — 已修复：移除冗余校验

## Dev Agent Record

### Agent Model Used

Claude (mimo-v2.5-pro)

### Debug Log References

- DRF CharField 默认 allow_blank=False，whitespace-only 输入被 DRF 拦截返回"该字段不能为空"而非自定义错误 → 添加 extra_kwargs allow_blank=True 让自定义 validate_title/validate_description 生效
- 图片测试用 b"\xff\xd8\xff\xe0" + zeros 模拟 JPEG 被 Pillow 验证拒绝 → 改用 PIL.Image.new 生成真实 1x1 JPEG
- custom_exception_handler 把 validation error 放在 message 而非 data → 测试断言检查 resp.data["message"]

### Completion Notes List

- Task 1: 创建 products app 完整目录结构，Product + ProductImage 模型，配置 MEDIA_ROOT/MEDIA_URL，安装 Pillow
- Task 2: POST /api/products/ 接口，IsAuthenticated 权限，ProductSerializer 处理嵌套图片上传，validate_title/validate_description/validate_price/validate_uploaded_images 校验
- Task 3: 10 个测试用例覆盖全部 AC（成功发布、含图片、缺必填字段、价格负数/零、图片超限、未登录、分类不存在、空标题/描述）
- 全部 37 个测试通过（12 users + 15 categories + 10 products），无回归

### File List

- `backend/apps/products/__init__.py` — 新增
- `backend/apps/products/models.py` — 新增：Product + ProductImage 模型
- `backend/apps/products/serializers.py` — 新增：ProductImageSerializer + ProductSerializer
- `backend/apps/products/views.py` — 新增：product_create 视图
- `backend/apps/products/urls.py` — 新增：products 路由
- `backend/apps/products/migrations/__init__.py` — 新增
- `backend/apps/products/migrations/0001_initial.py` — 新增：Product + ProductImage 迁移
- `backend/apps/products/tests/__init__.py` — 新增
- `backend/apps/products/tests/test_views.py` — 新增：10 个测试用例
- `backend/config/settings.py` — 修改：INSTALLED_APPS 添加 "apps.products"，添加 MEDIA_URL/MEDIA_ROOT
- `backend/config/urls.py` — 修改：添加 products 路由 + media URL
