---
stepsCompleted: [1, 2, 3, 4]
status: complete
completedAt: '2026-05-29'
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-wqproject-2026-05-29/prd.md
  - _bmad-output/planning-artifacts/architecture.md
---

# wqproject - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for wqproject, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-1: 用户注册 — 学生通过用户名和密码注册账号（用户名3-50字符，全局唯一；密码≥6字符；Django内置密码哈希（set_password/check_password）；重复返回409；成功返回201）
FR-2: 用户登录 — 已注册学生通过用户名和密码登录，获取Token（错误返回401；Token有效期7天；格式Bearer {token}）
FR-3: 获取当前用户信息 — 登录用户通过Token获取自己的基本信息（有效Token返回id和username；无效/过期/无Token返回401）
FR-4: 发布商品 — 登录学生发布商品（必填：标题、描述、价格、分类、联系方式；图片可选最多3张；发布后状态"待审核"；价格正数精确到分；标题≤100字符，描述≤2000字符）
FR-5: 编辑商品 — 商品发布者编辑自己未上架的商品（只能编辑自己的；已上架不可编辑；编辑后状态重置为"待审核"）
FR-6: 删除商品 — 商品发布者删除自己的商品（软删除状态变"已下架"；已有预约不可删除）
FR-7: 商品列表 — 所有用户（含访客）浏览已上架商品列表（只显示已上架；支持分类筛选；分页page默认1、page_size默认20；返回标题、价格、首图、分类；按发布时间倒序）
FR-8: 商品详情 — 所有用户（含访客）查看商品详情（返回全部信息+留言列表+是否已被当前用户收藏+预约数量）
FR-9: 我的发布 — 登录用户查看自己发布的商品列表（显示所有状态；支持按状态筛选；显示预约数量）
FR-10: 审核商品 — 管理员对待审核商品执行"通过"或"驳回"（只有管理员可操作；通过→已上架；驳回→已驳回+必须填写驳回原因；操作记录保存）
FR-11: 待审核列表 — 管理员查看所有待审核商品（按提交时间排序；显示基本信息；支持分页）
FR-12: 分类列表 — 所有用户获取商品分类列表（返回id和名称；按排序字段升序）
FR-13: 管理分类 — 管理员增删改分类（只有管理员可操作；有商品的分类不可删除；分类名称不可重复）
FR-14: 发起预约 — 登录学生对已上架商品发起预约（只能预约他人商品；只能预约已上架商品；同一用户对同一商品只能预约一次）
FR-15: 我的预约（买家） — 登录用户查看自己发起的预约列表（显示商品信息和预约时间；按预约时间倒序）
FR-16: 我的预约（卖家） — 登录用户查看自己商品被预约的列表（显示预约者信息和预约时间；按预约时间倒序）
FR-17: 收藏/取消收藏 — 登录用户收藏或取消收藏已上架商品（点击切换状态；只能收藏已上架商品；不能收藏自己的商品）
FR-18: 我的收藏 — 登录用户查看自己的收藏列表（显示商品基本信息；按收藏时间倒序；支持分页）
FR-19: 发表留言 — 登录用户在商品详情页发表留言（内容非空≤500字符；访客不可留言；留言立即显示）
FR-20: 查看留言 — 所有用户（含访客）查看商品的留言列表（按时间正序；显示留言者用户名和留言时间）
FR-21: 用户管理 — 管理员查看用户列表，禁用/启用用户（显示用户名、注册时间、状态；禁用后无法登录；管理员不可禁用自己）
FR-22: 数据统计 — 管理员查看平台运营数据（用户总数、商品总数按状态分、今日新增商品数、待审核商品数）

### NonFunctional Requirements

NFR-1: 列表/详情接口响应时间 < 500ms
NFR-2: 后端测试覆盖率 ≥ 60%
NFR-3: Token 7 天有效期
NFR-4: 密码使用 Django 内置密码哈希机制（set_password/check_password，默认 PBKDF2）

### Additional Requirements

- 自定义 Token 模型（非 JWT），uuid key + expires_at
- DRF 自定义 TokenAuthentication（Bearer keyword）
- is_staff 字段区分学生(False)和管理员(True)
- API 响应统一格式 {code, message, data}
- 图片上传 multipart/form-data → media/products/
- DRF PageNumberPagination，page_size=20
- 前端 axios 拦截器自动带 Token + 401 处理
- 前端 ProtectedRoute 路由守卫
- 管理员账号由开发者手动创建（createsuperuser）

### UX Design Requirements

无 UX 文档，跳过。

### FR Coverage Map

FR-1 注册: Epic 1
FR-2 登录: Epic 1
FR-3 用户信息: Epic 1
FR-4 发布商品: Epic 2
FR-5 编辑商品: Epic 2
FR-6 删除商品: Epic 2
FR-7 商品列表: Epic 2
FR-8 商品详情: Epic 2
FR-9 我的发布: Epic 2
FR-10 审核商品: Epic 2
FR-11 待审核列表: Epic 2
FR-12 分类列表: Epic 2
FR-13 管理分类: Epic 2
FR-14 发起预约: Epic 3
FR-15 买家预约: Epic 3
FR-16 卖家预约: Epic 3
FR-17 收藏切换: Epic 3
FR-18 我的收藏: Epic 3
FR-19 发表留言: Epic 3
FR-20 查看留言: Epic 3
FR-21 用户管理: Epic 4
FR-22 数据统计: Epic 4

## Epic List

### Epic 1: 用户认证与基础
用户可以注册、登录、查看个人信息。完整认证系统，后续所有 Epic 依赖。
**FRs covered:** FR-1, FR-2, FR-3

### Epic 2: 商品发布与浏览
卖家可以发布/编辑/删除商品；所有用户（含访客）可以浏览列表和详情；管理员可以管理分类和审核商品。核心交易链路。
**FRs covered:** FR-4, FR-5, FR-6, FR-7, FR-8, FR-9, FR-10, FR-11, FR-12, FR-13

### Epic 3: 预约、收藏与留言
买家可以预约商品；用户可以收藏商品、在商品页留言；买卖双方查看预约记录。
**FRs covered:** FR-14, FR-15, FR-16, FR-17, FR-18, FR-19, FR-20

### Epic 4: 管理员后台
管理员可以管理用户（禁用/启用）、查看平台数据统计。
**FRs covered:** FR-21, FR-22

---

## Epic 1: 用户认证与基础

用户可以注册、登录、查看个人信息。完整认证系统，后续所有 Epic 依赖。

### Story 1.1: 用户注册

As a 学生,
I want 通过用户名和密码注册账号,
So that 我可以使用平台发布和浏览商品。

**Acceptance Criteria:**

**Given** 用户名未被注册
**When** 提交用户名（3-50字符）和密码（≥6字符）
**Then** 返回 201，密码以 Django 内置密码哈希机制加密存储

**Given** 用户名已被注册
**When** 提交注册请求
**Then** 返回 409 错误

**Given** 用户名长度不满足要求或密码长度 < 6
**When** 提交注册请求
**Then** 返回 400 错误，提示具体原因

### Story 1.2: 用户登录

As a 已注册学生,
I want 通过用户名和密码登录,
So that 我获取 Token 使用需登录功能。

**Acceptance Criteria:**

**Given** 用户名和密码正确，账号 is_active=True
**When** 提交登录请求
**Then** 返回 Token（uuid 格式）和用户基本信息（id, username）

**Given** 用户名或密码错误
**When** 提交登录请求
**Then** 返回 401 错误

**Given** 用户账号 is_active=False（已禁用）
**When** 提交登录请求
**Then** 返回 403 错误，提示账号已禁用

### Story 1.3: 获取当前用户信息

As a 登录用户,
I want 通过 Token 获取自己的信息,
So that 前端可以显示当前登录状态。

**Acceptance Criteria:**

**Given** 请求携带有效且未过期的 Bearer Token
**When** GET /api/profile/
**Then** 返回 200，包含用户 id 和 username

**Given** Token 无效或已过期（超过7天）
**When** GET /api/profile/
**Then** 返回 401

**Given** 请求未携带 Token
**When** GET /api/profile/
**Then** 返回 401

---

## Epic 2: 商品发布与浏览

卖家可以发布/编辑/删除商品；所有用户（含访客）可以浏览列表和详情；管理员可以管理分类和审核商品。核心交易链路。

### Story 2.1: 分类管理

As a 管理员,
I want 创建、编辑、删除商品分类,
So that 商品可以按类别组织和筛选。

**Acceptance Criteria:**

**Given** 管理员已登录（is_staff=True）
**When** 提交分类名称（不重复）和排序值
**Then** 返回 201，分类创建成功

**Given** 管理员已登录
**When** 修改分类名称或排序值
**Then** 返回 200，分类更新成功

**Given** 该分类下无商品
**When** 管理员删除分类
**Then** 返回 204，分类删除成功

**Given** 该分类下有商品
**When** 管理员尝试删除分类
**Then** 返回 400，提示该分类下有商品不可删除

**Given** 任何用户（含访客）
**When** GET /api/categories/
**Then** 返回分类列表（id, name），按排序字段升序

**Given** 非管理员用户
**When** 尝试创建/编辑/删除分类
**Then** 返回 403

### Story 2.2: 发布商品

As a 登录学生,
I want 发布二手商品（含图片上传）,
So that 商品可以被其他同学看到并预约。

**Acceptance Criteria:**

**Given** 用户已登录
**When** 提交商品信息（标题≤100字符、描述≤2000字符、价格正数精确到分、分类ID、联系方式）+ 可选图片（最多3张，multipart/form-data）
**Then** 返回 201，商品状态为"待审核"，图片存储到 media/products/

**Given** 缺少必填字段
**When** 提交发布请求
**Then** 返回 400，提示缺少的字段

**Given** 图片超过3张
**When** 提交发布请求
**Then** 返回 400，提示最多上传3张图片

**Given** 价格为负数或零
**When** 提交发布请求
**Then** 返回 400，提示价格必须为正数

### Story 2.3: 编辑与删除商品

As a 商品发布者,
I want 编辑或删除自己的商品,
So that 我可以更新信息或下架商品。

**Acceptance Criteria:**

**Given** 商品属于当前用户且状态非"已上架"
**When** 修改商品信息（编辑后状态重置为"待审核"）
**Then** 返回 200，商品更新成功

**Given** 商品状态为"已上架"
**When** 尝试编辑商品
**Then** 返回 400，提示已上架商品需先下架再编辑

**Given** 商品不属于当前用户
**When** 尝试编辑或删除
**Then** 返回 403

**Given** 商品无关联预约记录
**When** 删除商品（软删除，状态变"已下架"）
**Then** 返回 200，商品状态变更为已下架

**Given** 商品有关联预约记录
**When** 尝试删除商品
**Then** 返回 400，提示需先取消所有预约

### Story 2.4: 商品列表与筛选

As a 任何用户（含访客）,
I want 浏览已上架商品列表并按分类筛选,
So that 我可以快速找到想要的商品。

**Acceptance Criteria:**

**Given** 数据库有已上架商品
**When** GET /api/products/?page=1&page_size=20
**Then** 返回已上架商品列表（标题、价格、首图、分类名），按发布时间倒序，分页信息包含 count

**Given** 指定分类ID筛选
**When** GET /api/products/?category_id=1
**Then** 只返回该分类下的已上架商品

**Given** 指定页码
**When** GET /api/products/?page=2
**Then** 返回对应页数据

**Given** 数据库无已上架商品
**When** GET /api/products/
**Then** 返回空列表，count=0

### Story 2.5: 商品详情

As a 任何用户（含访客）,
I want 查看商品详情,
So that 我了解商品完整信息并决定是否预约。

**Acceptance Criteria:**

**Given** 商品ID存在
**When** GET /api/products/{id}/
**Then** 返回商品全部信息（标题、描述、价格、图片列表、分类名、卖家联系方式）、留言列表、预约数量

**Given** 用户已登录且已收藏该商品
**When** GET /api/products/{id}/
**Then** is_favorited=True

**Given** 用户未登录或未收藏
**When** GET /api/products/{id}/
**Then** is_favorited=False

**Given** 商品ID不存在
**When** GET /api/products/{id}/
**Then** 返回 404

### Story 2.6: 我的发布

As a 登录用户,
I want 查看自己发布的商品列表,
So that 我管理自己的商品。

**Acceptance Criteria:**

**Given** 用户已登录
**When** GET /api/my-products/
**Then** 返回当前用户所有状态的商品列表，显示预约数量

**Given** 指定状态筛选（如"待审核"）
**When** GET /api/my-products/?status=pending
**Then** 只返回该状态的商品

### Story 2.7: 商品审核

As a 管理员,
I want 审核待上架商品（通过/驳回）,
So that 平台商品质量可控。

**Acceptance Criteria:**

**Given** 管理员已登录，有待审核商品
**When** 对待审核商品执行"通过"操作
**Then** 商品状态变更为"已上架"

**Given** 管理员已登录
**When** 对待审核商品执行"驳回"操作并填写驳回原因
**Then** 商品状态变更为"已驳回"，驳回原因保存

**Given** 驳回时未填写驳回原因
**When** 提交驳回操作
**Then** 返回 400，提示驳回原因为必填

**Given** 非管理员用户
**When** 尝试审核操作
**Then** 返回 403

**Given** 管理员已登录
**When** GET /api/admin/pending-products/
**Then** 返回待审核商品列表，按提交时间排序，支持分页

---

## Epic 3: 预约、收藏与留言

买家可以预约商品；用户可以收藏商品、留言；买卖双方查看预约记录。

### Story 3.1: 发起预约

As a 登录学生,
I want 对已上架商品发起预约,
So that 卖家知道我有交易意向。

**Acceptance Criteria:**

**Given** 商品状态为"已上架"且不属于当前用户，当前用户未预约过该商品
**When** POST /api/appointments/ 提交商品ID
**Then** 返回 201，预约记录创建成功

**Given** 商品属于当前用户
**When** 尝试预约
**Then** 返回 400，提示不能预约自己的商品

**Given** 商品状态非"已上架"
**When** 尝试预约
**Then** 返回 400，提示只能预约已上架商品

**Given** 当前用户已预约过该商品
**When** 再次预约
**Then** 返回 409，提示已预约

### Story 3.2: 查看预约记录

As a 登录用户,
I want 查看我发起的预约和我商品被预约的记录,
So that 我了解交易意向情况。

**Acceptance Criteria:**

**Given** 用户已登录
**When** GET /api/my-appointments/as-buyer/
**Then** 返回当前用户发起的预约列表（商品信息、预约时间），按预约时间倒序

**Given** 用户已登录
**When** GET /api/my-appointments/as-seller/
**Then** 返回当前用户商品被预约的列表（预约者信息、商品信息、预约时间），按预约时间倒序

### Story 3.3: 收藏与取消收藏

As a 登录学生,
I want 收藏或取消收藏已上架商品,
So that 我可以标记感兴趣的商品方便后续查看。

**Acceptance Criteria:**

**Given** 商品状态为"已上架"且不属于当前用户，未收藏
**When** POST /api/favorites/ 提交商品ID
**Then** 返回 201，收藏成功

**Given** 已收藏该商品
**When** POST /api/favorites/ 提交商品ID
**Then** 返回 200，取消收藏（切换逻辑）

**Given** 商品属于当前用户
**When** 尝试收藏
**Then** 返回 400，提示不能收藏自己的商品

**Given** 商品状态非"已上架"
**When** 尝试收藏
**Then** 返回 400，提示只能收藏已上架商品

**Given** 用户已登录
**When** GET /api/my-favorites/
**Then** 返回收藏列表（商品基本信息），按收藏时间倒序，支持分页

### Story 3.4: 发表与查看留言

As a 登录用户,
I want 在商品详情页发表留言,
So that 我可以公开询问商品信息。

**Acceptance Criteria:**

**Given** 用户已登录，商品存在
**When** POST /api/comments/ 提交商品ID和留言内容（非空，≤500字符）
**Then** 返回 201，留言创建成功

**Given** 留言内容为空或超过500字符
**When** 提交留言
**Then** 返回 400，提示内容长度限制

**Given** 任何用户（含访客）
**When** GET /api/products/{id}/ 的留言列表
**Then** 返回该商品所有留言（内容、留言者用户名、时间），按时间正序

**Given** 非登录用户
**When** 尝试发表留言
**Then** 返回 401

---

## Epic 4: 管理员后台

管理员可以管理用户（禁用/启用）、查看平台数据统计。

### Story 4.1: 用户管理

As a 管理员,
I want 查看用户列表并禁用/启用用户,
So that 我可以管理平台用户状态。

**Acceptance Criteria:**

**Given** 管理员已登录
**When** GET /api/admin/users/
**Then** 返回用户列表（id, username, 注册时间, is_active），支持分页

**Given** 管理员已登录，目标用户非管理员自身
**When** PUT /api/admin/users/{id}/ 设置 is_active=False
**Then** 返回 200，用户被禁用，该用户后续登录返回 403

**Given** 管理员尝试禁用自己的账号
**When** PUT /api/admin/users/{self_id}/ 设置 is_active=False
**Then** 返回 400，提示不可禁用自己

**Given** 非管理员用户
**When** 尝试访问用户管理接口
**Then** 返回 403

### Story 4.2: 数据统计

As a 管理员,
I want 查看平台运营数据,
So that 我了解平台整体状况。

**Acceptance Criteria:**

**Given** 管理员已登录
**When** GET /api/admin/statistics/
**Then** 返回统计数据：用户总数、商品总数（按状态分组）、今日新增商品数、待审核商品数

**Given** 非管理员用户
**When** 尝试访问统计接口
**Then** 返回 403
