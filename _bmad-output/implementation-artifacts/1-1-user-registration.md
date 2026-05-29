---
baseline_commit: NO_VCS
---

# Story 1.1: 用户注册

Status: done

## Story

As a 学生,
I want 通过用户名和密码注册账号,
so that 我可以使用平台发布和浏览商品。

## Acceptance Criteria

1. 用户名长度 3-50 字符，全局唯一，重复返回 409
2. 密码长度 >= 6 字符
3. 密码以 Django 内置密码哈希机制加密存储（set_password/check_password，默认 PBKDF2）
4. 注册成功返回 201
5. 字段校验失败返回 400，提示具体原因
6. API 响应统一格式 `{code, message, data}`

## Tasks / Subtasks

- [x] Task 1: 修复 register 接口响应格式（AC: #6）
  - [x] 修改 views.py register 函数返回标准 `{code, message, data}` 格式
  - [x] 成功响应: `{"code": 201, "message": "注册成功", "data": {"user_id": user.id}}`
- [x] Task 2: 修复 login 接口（AC: #6）
  - [x] 添加 is_active 检查，禁用用户返回 403
  - [x] 响应改为标准格式 `{"code": 200, "message": "登录成功", "data": {"token": ..., "user": ...}}`
  - [x] 错误响应改为标准格式
- [x] Task 3: 修复 profile 接口响应格式（AC: #6）
  - [x] 返回标准格式 `{"code": 200, "message": "success", "data": {"id": ..., "username": ...}}`
- [x] Task 4: 编写 users 模块测试（AC: #1~6）
  - [x] 创建 backend/apps/users/tests/__init__.py
  - [x] 创建 backend/apps/users/tests/test_views.py
  - [x] 测试注册成功（201）
  - [x] 测试用户名重复（409）
  - [x] 测试用户名过短/过长（400）
  - [x] 测试密码过短（400）
  - [x] 测试登录成功（200 + token）
  - [x] 测试登录密码错误（401）
  - [x] 测试禁用用户登录（403）
  - [x] 测试 profile 有效 token（200）
  - [x] 测试 profile 无效/过期 token（401）

## Dev Notes

### 已有代码分析

**users app 已实现，需修复而非从零创建。** 以下文件已存在：

- `backend/apps/users/models.py` — User（AbstractBaseUser + PermissionsMixin）+ Token（uuid key, 7天过期）
- `backend/apps/users/authentication.py` — TokenAuthentication（Bearer keyword, 过期自动删除）
- `backend/apps/users/serializers.py` — RegisterSerializer（username 3-50, password >=6）, LoginSerializer
- `backend/apps/users/views.py` — register, login, profile 三个视图函数
- `backend/apps/users/urls.py` — 路由: `api/register`, `api/login`, `api/profile`
- `backend/apps/users/migrations/0001_initial.py` — 已有迁移

**不存在的文件（需创建）：**
- `backend/apps/users/tests/__init__.py`
- `backend/apps/users/tests/test_views.py`

### 需修复的问题

**1. 响应格式不符合标准**
当前 register 返回 `{"message": "注册成功", "user_id": user.id}`，需改为 `{"code": 201, "message": "注册成功", "data": {"user_id": user.id}}`
当前 login 返回 `{"token": ..., "user": ...}`，需改为标准格式
当前 profile 返回 `{"id": ..., "username": ...}`，需改为标准格式

**2. login 缺少 is_active 检查**
`django.contrib.auth.authenticate` 在用户 is_active=False 时返回 None，当前代码会报"用户名或密码错误"，应区分返回 403 + "账号已禁用"。

**3. 无测试**
tests/ 目录不存在，需创建并覆盖所有 AC。

### Architecture Patterns

**技术栈：** Django 4.1 + DRF 3.14 + SQLite（开发）/ MySQL 5.7（生产）

**API 响应格式（必须遵守）：**
```json
// 成功
{"code": 200, "message": "success", "data": {...}}
// 错误
{"code": 400, "message": "错误描述", "data": null}
```

**命名规范：**
- 后端 Python: 蛇形命名 — `create_user`, `validate_username`
- 数据库表名: 复数小写蛇形 — `users`, `tokens`
- API 端点: `/api/register/`, `/api/login/`, `/api/profile/`

**模块创建顺序（本次为修复，按需调整）：** models → serializers → views → urls → tests

**权限模型：** is_staff=False 学生，is_staff=True 管理员

**认证流程：** 自定义 Token 模型，uuid key + expires_at，DRF BaseAuthentication 子类，Bearer keyword

**测试规范：**
- 文件命名 test_*.py，放在各 app/tests/ 下
- 覆盖率目标 60%
- 使用 Django REST framework 的 APIClient

**项目结构约束（来自 CLAUDE.md）：**
- views 层禁止直接操作数据库，统一走 serializers
- 禁止硬编码配置
- 禁止绕过 Token 认证中间件

### File Structure

```
backend/apps/users/
├── models.py          # UPDATE: 无需修改
├── authentication.py  # UPDATE: 无需修改
├── serializers.py     # UPDATE: 无需修改
├── views.py           # UPDATE: 修复响应格式 + is_active 检查
├── urls.py            # UPDATE: 确认路由正确
├── __init__.py        # 无需修改
├── migrations/
│   ├── __init__.py
│   └── 0001_initial.py
└── tests/             # CREATE: 新建目录
    ├── __init__.py    # CREATE
    └── test_views.py  # CREATE: 全部测试用例
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1] — 用户注册 AC
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2] — 用户登录 AC（需一并修复）
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3] — 获取用户信息 AC（需一并修复）
- [Source: _bmad-output/planning-artifacts/architecture.md#API Response Formats] — 标准响应格式
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security] — Token 认证流程
- [Source: _bmad-output/planning-artifacts/architecture.md#Testing Standards] — 测试规范
- [Source: CLAUDE.md#模块规范] — views 禁止直接操作数据库

### Review Findings

- [x] [Review][Patch] 重复用户名返回 400 而非 409，并发注册会 500 [views.py:14-17] — 移除 serializer 重复检查，DB 约束 + IntegrityError 返回 409
- [x] [Review][Patch] views 直接操作数据库，违反架构规范 [views.py:12-36] — RegisterSerializer 加 create() 方法
- [x] [Review][Patch] 登录用户枚举：禁用用户 403 泄露账号存在性 [views.py:36-40] — 禁用用户和密码错误统一返回 401
- [x] [Review][Patch] exception_handler 对非 DRF 异常返回非标准 500 [exception_handler.py:9-10] — 返回标准格式 500
- [x] [Review][Patch] `authenticate` import 未使用 [views.py:1] — 已删除
- [x] [Review][Defer] 无过期 token 清理机制 — deferred, pre-existing
- [x] [Review][Defer] 无登录限流/暴力破解保护 — deferred, not in AC
- [x] [Review][Defer] 无登出/token 撤销机制 — deferred, not in AC

## Dev Agent Record

### Agent Model Used

Claude (mimo-v2.5-pro)

### Debug Log References

- register 重复用户名返回 DRF 默认格式而非标准格式 → 添加自定义异常处理器 `config/exception_handler.py`
- profile 无 token 返回 403 而非 401 → 异常处理器中检测未认证用户，将 403 转为 401

### Completion Notes List

- Task 1: register 接口已改为标准 `{code, message, data}` 格式
- Task 2: login 接口添加 is_active 检查（禁用用户 403），响应改为标准格式，改用 User.objects.get + check_password 替代 authenticate 以区分禁用/密码错误
- Task 3: profile 接口响应改为标准格式
- Task 4: 创建 12 个测试用例，覆盖注册（成功、重复、字段校验）、登录（成功、密码错误、禁用用户）、profile（成功、无token、无效token、过期token）
- 新增 `config/exception_handler.py` 统一 DRF 错误响应格式
- Code review 修复：重复用户名 409（IntegrityError catch）、views 走 serializer create()、禁用用户统一 401 防枚举、异常处理器 500 标准格式、删除未用 import

### File List

- `backend/apps/users/views.py` — 修改：register/login/profile 响应格式 + login is_active 检查
- `backend/config/exception_handler.py` — 新增：统一 DRF 错误响应格式
- `backend/config/settings.py` — 修改：添加 EXCEPTION_HANDLER 配置
- `backend/apps/users/tests/__init__.py` — 新增
- `backend/apps/users/tests/test_views.py` — 新增：12 个测试用例
