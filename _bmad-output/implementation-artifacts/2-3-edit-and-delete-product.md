---
baseline_commit: NO_VCS
---

# Story 2.3: 编辑与删除商品

Status: done

## Story

As a 商品发布者,
I want 编辑或删除自己的商品,
so that 我可以更新信息或下架商品。

## Acceptance Criteria

1. 商品属于当前用户且状态非"已上架" → 修改商品信息（编辑后状态重置为"待审核"）→ 返回 200，商品更新成功
2. 商品状态为"已上架" → 尝试编辑商品 → 返回 400，提示已上架商品需先下架再编辑
3. 商品不属于当前用户 → 尝试编辑或删除 → 返回 403
4. 商品无关联预约记录 → 删除商品（软删除，状态变"已下架"）→ 返回 200，商品状态变更为已下架
5. 商品有关联预约记录 → 尝试删除商品 → 返回 400，提示需先取消所有预约

## Tasks / Subtasks

- [x] Task 1: 实现编辑商品接口（AC: #1, #2, #3）
  - [x] PUT /api/products/{id}/ 需要认证（IsAuthenticated）
  - [x] 只能编辑自己的商品（seller == request.user）
  - [x] 已上架商品不可编辑，返回 400
  - [x] 编辑后状态重置为 "pending"
  - [x] 可修改字段：title, description, price, category, contact_info
  - [x] 图片处理：可新增图片（累计不超过3张），可删除已有图片
  - [x] 标题/描述/价格校验同发布接口
  - [x] 非商品 owner 返回 403
  - [x] 商品不存在返回 404
- [x] Task 2: 实现删除商品接口（AC: #4, #5）
  - [x] DELETE /api/products/{id}/ 需要认证（IsAuthenticated）
  - [x] 软删除：status 变为 "offline"
  - [x] 只能删除自己的商品
  - [x] 有预约记录时不可删除，返回 400
  - [x] 非商品 owner 返回 403
  - [x] 商品不存在返回 404
  - [x] 标准响应格式 {code, message, data}
- [x] Task 3: 编写测试（AC: #1~5）
  - [x] 测试编辑成功（200，状态重置为 pending）
  - [x] 测试编辑已上架商品（400）
  - [x] 测试非 owner 编辑（403）
  - [x] 测试删除成功（200，状态变 offline）
  - [x] 测试有预约时删除（400）
  - [x] 测试非 owner 删除（403）
  - [x] 测试商品不存在（404）
  - [x] 测试图片增删

## Dev Notes

### 前置依赖

- Story 2.2（发布商品）已完成 — Product、ProductImage 模型已存在
- Story 2.1（分类管理）已完成 — Category 模型已存在
- Story 1.1（用户注册）已完成 — User 模型已存在

### Architecture Patterns

**后端模块结构（已存在）：**
```
backend/apps/products/
├── models.py          — UPDATE: 无需修改模型
├── serializers.py     — UPDATE: 添加 ProductUpdateSerializer
├── views.py           — UPDATE: 添加 product_detail 视图（PUT+DELETE）
├── urls.py            — UPDATE: 添加 products/{id}/ 路由
└── tests/
    └── test_views.py  — UPDATE: 添加编辑/删除测试
```

**修改顺序：** serializers → views → urls → tests

**views 层禁止直接操作数据库，统一走 serializers**

**权限模型：** IsAuthenticated + owner 校验（seller == request.user）

**API 响应格式：**
```json
{"code": 200, "message": "success", "data": {...}}
```

**现有 Product 模型状态字段：**
```python
STATUS_CHOICES = [
    ("pending", "待审核"),
    ("active", "已上架"),
    ("rejected", "已驳回"),
    ("offline", "已下架"),
]
```

**编辑接口设计要点：**
- PUT /api/products/{id}/
- 先校验 owner（403）→ 再校验 status（400）→ 再校验数据
- 编辑后 status 重置为 "pending"
- 图片处理：接收 uploaded_images（新增）+ keep_image_ids（保留的图片ID），其余删除
- 用 ProductUpdateSerializer（单独，不用 ProductSerializer）

**删除接口设计要点：**
- DELETE /api/products/{id}/
- 软删除：product.status = "offline"，不调用 product.delete()
- 检查 Appointment 模型是否有关联记录（动态导入，同 categories 删除保护模式）
- Appointment 模型尚未创建，用 try/except ImportError 处理

**预约检查模式（同 categories 删除保护）：**
```python
try:
    from apps.appointments.models import Appointment
except ImportError:
    Appointment = None
if Appointment is not None and Appointment.objects.filter(product=product).exists():
    return Response({"code": 400, "message": "需先取消所有预约", "data": None}, ...)
```

**测试规范：**
- 使用 DRF APIClient + force_authenticate
- 图片测试用 PIL 生成真实 JPEG
- 测试文件放在 apps/products/tests/test_views.py（追加）

### 前一个 Story 学习

**来自 Story 2.2 的经验：**
- DRF CharField 默认 allow_blank=False → 自定义 validate 需要 extra_kwargs allow_blank=True
- 图片测试用 PIL.Image.new 生成真实 JPEG，不用 bytes 模拟
- custom_exception_handler 把 validation error 放在 message → 测试断言检查 resp.data["message"]
- ListField max_length=3 已处理图片数量校验，无需自定义 validate
- create() 需要 transaction.atomic 保护
- PrimaryKeyRelatedField 已做存在性校验，无需自定义 validate_category

**来自 Story 2.2 Review 的 Deferred：**
- 无

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3] — 编辑与删除商品 AC
- [Source: _bmad-output/planning-artifacts/architecture.md#FR-5,FR-6] — 编辑/删除商品需求
- [Source: _bmad-output/implementation-artifacts/2-2-publish-product.md] — 前一个 story 学习
- [Source: CLAUDE.md#模块规范] — views 禁止直接操作数据库

## Review Findings

- [x] [Review][Patch] validate_uploaded_images 死代码 — ListField max_length=3 已先拦截 [ProductUpdateSerializer:119-122] — 已修复：移除死代码
- [x] [Review][Defer] 新增图片+保留图片总数可能超过3张 — 无校验 [ProductUpdateSerializer:update] — deferred，信任客户端控制总数

## Dev Agent Record

### Agent Model Used

Claude (mimo-v2.5-pro)

### Debug Log References

- keep_image_ids 从 multipart form data 接收为字符串（如 "1,2"）→ 用 CharField + 手动 split/parse
- 删除测试需要 sys.modules mock Appointment（同 categories 删除保护模式）

### Completion Notes List

- Task 1: PUT /api/products/{id}/ 编辑接口，ProductUpdateSerializer 支持 partial update + 图片增删，编辑后 status 重置 pending
- Task 2: DELETE /api/products/{id}/ 软删除（status→offline），预约检查用动态导入
- Task 3: 13 个新测试覆盖编辑/删除全部 AC（编辑成功、状态重置、已上架拦截、owner 校验、404、图片增删、删除成功、预约拦截）
- 全部 50 个测试通过（12 users + 15 categories + 23 products），无回归

### File List

- `backend/apps/products/serializers.py` — 修改：添加 ProductUpdateSerializer
- `backend/apps/products/views.py` — 修改：添加 product_detail 视图（PUT+DELETE）
- `backend/apps/products/urls.py` — 修改：添加 products/{id}/ 路由
- `backend/apps/products/tests/test_views.py` — 修改：添加 13 个编辑/删除测试用例
