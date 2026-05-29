---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-wqproject-2026-05-29/prd.md
  - _bmad-output/planning-artifacts/briefs/brief-wqproject-2026-05-29/brief.md
workflowType: 'architecture'
project_name: 'wqproject'
user_name: 'dawang'
date: '2026-05-29'
lastStep: 8
status: 'complete'
completedAt: '2026-05-29'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
22 个 FR，分为 8 个功能模块：
- 用户注册登录（FR-1~3）：用户名+密码注册，Token 认证
- 商品管理（FR-4~9）：CRUD、图片上传、列表分页、分类筛选
- 商品审核（FR-10~11）：管理员审核流程
- 分类管理（FR-12~13）：一级分类 CRUD
- 预约交易（FR-14~16）：预约记录、买卖双方查看
- 收藏（FR-17~18）：收藏/取消收藏
- 留言（FR-19~20）：公开留言
- 管理员后台（FR-21~22）：用户管理、数据统计

**Non-Functional Requirements:**
- 列表/详情接口 < 500ms
- 后端测试覆盖率 ≥ 60%
- Token 7 天有效期
- 密码 bcrypt 加密存储

**Scale & Complexity:**
- Primary domain: 全栈 Web（Django + React）
- Complexity level: 中低（标准 CRUD + 审核流程）
- Estimated architectural components: 7 个后端 App + 6 个前端页面

### Technical Constraints & Dependencies

- 后端：Django 4.1 + MySQL 5.7 + DRF
- 前端：React 19 + TypeScript + Vite 6 + Tailwind CSS 4
- 认证：自定义 Token（非 JWT），7 天有效期
- 图片存储：本地文件系统（v1）
- 数据库：MySQL 5.7

### Cross-Cutting Concerns Identified

- **认证中间件**：Token 校验贯穿所有需登录接口
- **权限控制**：学生 vs 管理员角色区分（is_staff 字段）
- **图片上传**：文件存储和访问路径
- **分页**：列表接口统一分页组件
- **错误处理**：统一响应格式 {code, message, data}

## Starter Template Evaluation

### Primary Technology Domain

全栈 Web 应用（Django + React）

### Selected Approach

项目已有骨架代码（`backend/` + `frontend/`），技术栈已确定，无需从 starter 生成。

**已确定的技术决策：**

| 层 | 技术 | 版本 |
|----|------|------|
| 后端框架 | Django + DRF | 4.1 / 3.14 |
| 数据库 | MySQL | 5.7 |
| 前端框架 | React | 19 |
| 构建工具 | Vite | 6 |
| 样式 | Tailwind CSS | 4 |
| 认证 | 自定义 Token | 7 天有效期 |
| 图表 | Chart.js | 4.x |

**Rationale:** 技术栈由 CLAUDE.md 约束确定，骨架已初始化，直接进入架构决策。

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- 数据模型设计（7 个 App 的 models）
- 认证中间件实现
- API 响应格式

**Important Decisions (Shape Architecture):**
- 前端状态管理方案
- 图片上传策略
- 权限控制模型

**Deferred Decisions (Post-MVP):**
- 缓存策略（v1 不引入）
- 生产部署配置（v1 仅本地开发）

### Data Architecture

- **数据建模**: 每个 App 独立 models.py，外键关联
- **数据验证**: DRF Serializer 输入验证 + Model 约束兜底
- **迁移策略**: Django Migrations，每次变更生成迁移文件
- **缓存**: v1 不引入，直接查库

### Authentication & Security

- **认证流程**: 自定义 Token 模型，登录签发，中间件校验
- **权限模型**: is_staff 字段区分学生(False)和管理员(True)
- **密码存储**: bcrypt 加密（Django make_password/check_password）

### API & Communication Patterns

- **API 风格**: REST
- **响应格式**: `{code, message, data}`
- **分页**: DRF PageNumberPagination，page_size=20
- **图片上传**: POST multipart/form-data，存储到 `media/products/`

### Frontend Architecture

- **状态管理**: React Context + useState（v1 不引入 Redux）
- **路由**: react-router-dom v7，公开路由 + 受保护路由
- **组件结构**:
  ```
  src/
  ├── view/           # 页面组件（login, product, user, admin）
  ├── components/     # 通用组件（Pagination, ImageUpload, ProtectedRoute）
  └── utils/          # 工具函数（request.ts）
  ```

### Infrastructure & Deployment

- **部署方式**: v1 本地开发环境
- **文件存储**: 本地 `media/` 目录，Django MEDIA_ROOT

### Decision Impact Analysis

**Implementation Sequence:**
1. 数据模型 → 2. 认证中间件 → 3. API 接口 → 4. 前端页面

**Cross-Component Dependencies:**
- Token 认证影响所有需登录接口
- is_staff 权限影响管理员后台所有接口
- 图片上传影响商品发布和详情

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
6 areas where AI agents could make different choices: naming, structure, format, communication, process, auth

### Naming Patterns

**Database Naming Conventions:**
- 表名：复数小写蛇形 — `users`, `products`, `categories`
- 列名：小写蛇形 — `created_at`, `user_id`, `is_active`
- 外键：`{关联表单数}_id` — `user_id`, `category_id`
- 索引：`idx_{表名}_{列名}` — `idx_users_username`

**API Naming Conventions:**
- 端点：复数形式 — `/api/products/`, `/api/users/`
- 路由参数：`{id}` — `/api/products/{id}/`
- 查询参数：小写蛇形 — `page_size`, `category_id`

**Code Naming Conventions:**
- 后端（Python）：蛇形 — `get_user_by_id`, `create_product`
- 前端（TypeScript）：驼峰 — `getUserById`, `createProduct`
- 组件：帕斯卡 — `ProductCard`, `LoginPage`
- 文件：组件用帕斯卡 `ProductCard.tsx`，工具用驼峰 `request.ts`

### Structure Patterns

**Project Organization:**
```
backend/
├── config/          # 项目配置
├── apps/
│   ├── users/       # 用户模块
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests/
│   ├── products/    # 商品模块
│   └── ...
└── media/           # 上传文件

frontend/src/
├── view/            # 页面（按模块分目录）
├── components/      # 通用组件
├── utils/           # 工具函数
└── router/          # 路由定义
```

**Test Location:**
- 后端：各 App 下 `tests/` 目录
- 前端：`__tests__/` 或 `*.test.tsx` 同目录

### Format Patterns

**API Response Formats:**
```json
// 成功
{"code": 200, "message": "success", "data": {...}}

// 错误
{"code": 400, "message": "错误描述", "data": null}

// 列表
{"code": 200, "message": "success", "data": {"results": [...], "count": 100}}
```

**Data Exchange Formats:**
- JSON 字段：后端返回蛇形，前端转驼峰
- 日期：ISO 8601 — `"2026-05-29T10:00:00Z"`
- 布尔值：`true` / `false`

### Process Patterns

**Error Handling:**
- 后端：DRF 异常处理器统一捕获，返回标准格式
- 前端：axios 拦截器统一处理 401/500

**Loading States:**
- 前端：`loading` boolean，按钮禁用 + 文字变化

**Auth Flow:**
- 前端：请求拦截器自动带 Token
- 后端：中间件统一校验，失败返回 401

### Enforcement Guidelines

**All AI Agents MUST:**
1. API 响应使用标准格式 `{code, message, data}`
2. 数据库表名用复数小写蛇形
3. 后端代码用蛇形命名，前端用驼峰
4. 新模块按 models → serializers → views → urls 顺序创建
5. 禁止在 views 中直接操作数据库

## Project Structure & Boundaries

### Complete Directory Tree

```
wqproject/
├── backend/                       # Django 后端
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/                    # 项目配置
│   │   ├── __init__.py            # PyMySQL shim
│   │   ├── settings.py
│   │   ├── urls.py                # 根路由
│   │   └── wsgi.py
│   ├── apps/                      # 业务模块
│   │   ├── users/                 # 用户模块 (FR-1~3, FR-21)
│   │   │   ├── models.py          # User, Token
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   ├── authentication.py  # Token 认证后端
│   │   │   └── tests/
│   │   ├── products/              # 商品模块 (FR-4~9)
│   │   │   ├── models.py          # Product, ProductImage
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   ├── categories/            # 分类模块 (FR-12~13)
│   │   │   ├── models.py          # Category
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   ├── appointments/          # 预约模块 (FR-14~16)
│   │   │   ├── models.py          # Appointment
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   ├── favorites/             # 收藏模块 (FR-17~18)
│   │   │   ├── models.py          # Favorite
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   ├── comments/              # 留言模块 (FR-19~20)
│   │   │   ├── models.py          # Comment
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   └── admin_panel/           # 管理员后台 (FR-21~22)
│   │       ├── views.py
│   │       ├── urls.py
│   │       └── tests/
│   └── media/                     # 上传文件
│       └── products/              # 商品图片
│
├── frontend/                      # React 前端
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css              # Tailwind 入口
│       ├── utils/
│       │   └── request.ts         # axios 实例 + Token 拦截器
│       ├── components/            # 通用组件
│       │   ├── ProtectedRoute.tsx
│       │   ├── Pagination.tsx
│       │   ├── ImageUpload.tsx
│       │   └── Layout.tsx
│       ├── view/                  # 页面组件
│       │   ├── login/
│       │   │   ├── Login.tsx
│       │   │   └── Register.tsx
│       │   ├── product/
│       │   │   ├── ProductList.tsx
│       │   │   ├── ProductDetail.tsx
│       │   │   ├── ProductCreate.tsx
│       │   │   └── MyProducts.tsx
│       │   ├── user/
│       │   │   ├── MyFavorites.tsx
│       │   │   ├── MyAppointments.tsx
│       │   │   └── Profile.tsx
│       │   └── admin/
│       │       ├── AuditList.tsx
│       │       ├── UserManage.tsx
│       │       └── Dashboard.tsx
│       └── router/
│           └── index.tsx
│
└── _bmad-output/                  # BMAD 产物（不参与构建）
```

### FR → Module Mapping

| FR | 后端 App | 前端页面 |
|----|----------|----------|
| FR-1 注册 | users | login/Register.tsx |
| FR-2 登录 | users | login/Login.tsx |
| FR-3 获取用户信息 | users | user/Profile.tsx |
| FR-4 发布商品 | products | product/ProductCreate.tsx |
| FR-5 编辑商品 | products | product/ProductCreate.tsx |
| FR-6 删除商品 | products | product/MyProducts.tsx |
| FR-7 商品列表 | products | product/ProductList.tsx |
| FR-8 商品详情 | products | product/ProductDetail.tsx |
| FR-9 我的发布 | products | product/MyProducts.tsx |
| FR-10 审核商品 | products | admin/AuditList.tsx |
| FR-11 待审核列表 | products | admin/AuditList.tsx |
| FR-12 分类列表 | categories | product/ProductList.tsx |
| FR-13 管理分类 | categories | admin/Dashboard.tsx |
| FR-14 发起预约 | appointments | product/ProductDetail.tsx |
| FR-15 我的预约（买家） | appointments | user/MyAppointments.tsx |
| FR-16 我的预约（卖家） | appointments | user/MyAppointments.tsx |
| FR-17 收藏/取消收藏 | favorites | product/ProductDetail.tsx |
| FR-18 我的收藏 | favorites | user/MyFavorites.tsx |
| FR-19 发表留言 | comments | product/ProductDetail.tsx |
| FR-20 查看留言 | comments | product/ProductDetail.tsx |
| FR-21 用户管理 | users + admin_panel | admin/UserManage.tsx |
| FR-22 数据统计 | admin_panel | admin/Dashboard.tsx |

### Integration Boundaries

**后端模块间依赖：**
- products → users (ForeignKey: seller)
- products → categories (ForeignKey: category)
- appointments → users (ForeignKey: buyer), products (ForeignKey: product)
- favorites → users, products (ForeignKey)
- comments → users, products (ForeignKey)
- admin_panel → users, products (跨 App 查询)

**前后端通信：**
- 统一通过 `/api/` 前缀，Vite proxy 转发到 Django
- 认证：`Authorization: Bearer {token}` header
- 图片：`multipart/form-data` 上传，`media/products/` 存储

**模块边界约束：**
- 各 App 独立，通过外键关联，不跨 App 直接操作数据库
- 公共逻辑（如权限检查）放 `utils/` 或 middleware
- 前端各页面独立，通用逻辑提取到 `components/` 和 `utils/`

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:**
- Django 4.1 + DRF 3.14 + PyMySQL 1.1 — 兼容，无冲突
- React 19 + Vite 6 + Tailwind CSS 4 — 兼容，`@tailwindcss/vite` 插件已确认
- 自定义 Token（非 JWT）与 DRF `BaseAuthentication` 完全兼容
- Chart.js 4.x + react-chartjs-2 — 兼容
- 所有版本组合无已知兼容性问题

**Pattern Consistency:**
- 命名规范：DB 蛇形、API 复数端点、后端蛇形函数、前端驼峰 — 一致
- 响应格式 `{code, message, data}` 贯穿所有接口 — 一致
- 模块创建顺序 models → serializers → views → urls — 一致

**Structure Alignment:**
- 7 个后端 App 对应 8 个功能模块 — 对齐
- 前端 view/ 按模块分目录 — 对齐
- 各 App 独立，外键关联 — 边界清晰

### Requirements Coverage Validation

**Functional Requirements Coverage:**
- FR-1~3 (用户) → users App
- FR-4~9 (商品) → products App
- FR-10~11 (审核) → products App
- FR-12~13 (分类) → categories App
- FR-14~16 (预约) → appointments App
- FR-17~18 (收藏) → favorites App
- FR-19~20 (留言) → comments App
- FR-21~22 (管理员) → users + admin_panel App
- **22/22 FR 全覆盖**

**Non-Functional Requirements:**
- 列表/详情 < 500ms → DRF 分页 + 数据库索引
- 测试覆盖率 ≥ 60% → 各 App tests/ 目录
- Token 7 天 → Token 模型 expires_at
- bcrypt → Django make_password/check_password

### Implementation Readiness Validation

**Decision Completeness:** 所有关键决策有版本号，模式有示例，规则明确可执行。

**Structure Completeness:** 目录树完整，文件职责明确，集成点已映射。

**Pattern Completeness:** 6 类冲突点（命名、结构、格式、通信、流程、认证）全部覆盖。

### Gap Analysis Results

**Critical Gaps:** 无

**Important Gaps:**
- is_staff 权限检查建议用 `IsAdminPermission` 自定义类实现
- admin_panel 无 models.py — 设计合理，只查询其他 App 模型

**Nice-to-Have Gaps:**
- API 版本策略（v1 不需要）
- 日志规范（v1 用 Django 默认 logging）

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** high

**Key Strengths:**
- 22 个 FR 与模块映射完整，无遗漏
- 技术栈版本锁定，兼容性已验证
- 命名/格式/流程模式全面，AI agent 可一致执行
- 模块边界清晰，跨 App 依赖通过外键

**Areas for Future Enhancement:**
- API 版本控制
- 日志与监控
- 缓存策略
- 图片压缩与 OSS 迁移

### Implementation Handoff

**First Implementation Priority:**
1. users App — 已存在，完善测试
2. categories App — 依赖少，其他模块需要
3. products App — 核心功能
4. 其余模块按依赖顺序推进
