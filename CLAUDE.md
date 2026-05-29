# 项目约束

## 路径限制
- 只允许操作当前项目目录：`D:\bq\mcp\wqproject`
- 禁止 `cd` 到上级目录
- 禁止访问用户目录（`~`、`$env:USERPROFILE`）和系统目录
- 所有文件操作必须在项目根目录内进行
# 技术栈
- 后端：Django 4.1 + MySQL 5.7
- 前端：React 19 + TypeScript + Vite 6 + Tailwind CSS 4
- 认证：自定义 Token，7 天有效期
- 可视化：Chart.js

# 模块规范
- 后端新模块按 models → serializers → views → urls 顺序创建
- views 层禁止直接操作数据库，统一走 serializers
- 前端页面统一放 src/views/<模块名>/
- 组件放 src/components/<模块名>/

# 测试规范
- 后端测试文件命名 test_*.py，放在各 app 下
- 覆盖率目标 60%

# 禁止
- 禁止硬编码配置，统一用 settings.py 或 .env
- 禁止绕过 Token 认证中间件
- 禁止引入 Gin/Go/Vue 相关依赖

# Superpowers 限制
- subagent 任务粒度不超过单个 views 文件
- 禁止 subagent 跨 app 修改文件