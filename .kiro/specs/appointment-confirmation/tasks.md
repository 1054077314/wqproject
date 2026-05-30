# Implementation Plan

## Task 1: 模型扩展 — 为 Appointment 增加状态字段

- [x] 1. 扩展 Appointment 模型，增加 status 和 updated_at 字段
  - status 字段：CharField，choices 为 pending/confirmed/rejected，默认 pending
  - updated_at 字段：DateTimeField，auto_now=True，记录状态变更时间
  - 生成数据库迁移文件并执行
  - 迁移后现有预约记录自动为 pending 状态
  - _Requirements: 1.1, 1.2, 1.3_

## Task 2: 后端 API — 状态更新端点

- [x] 2.1 扩展序列化器
  - AppointmentListSerializer 增加 status 字段，买家和卖家列表接口均返回状态
  - 新增 AppointmentUpdateSerializer，校验 action 字段为 confirm 或 reject
  - 序列化器校验通过后返回有效 action 值
  - _Requirements: 4.1, 5.1_
  - _Depends: 1_
  - _Boundary: Appointment Serializers_

- [x] 2.2 新增预约状态更新视图
  - PATCH /api/appointments/{id}/ 端点，接收 action 参数
  - 校验：用户已认证、当前用户是该预约对应商品的卖家、预约状态为 pending
  - 非 pending 状态返回 400："该预约已被处理"
  - 非卖家返回 403
  - 预约不存在返回 404
  - 成功更新 status 并返回更新后的预约数据
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_
  - _Depends: 2.1_
  - _Boundary: Appointment Views_

- [x] 2.3 注册路由
  - urls.py 注册 PATCH appointments/<int:pk>/ 路由到 update_appointment_status 视图
  - 路由可访问且返回正确响应
  - _Depends: 2.2_
  - _Boundary: Appointment URLs_

## Task 3: 前端类型定义

- [x] 3. (P) 扩展 AppointmentItem 类型
  - index.ts 中 AppointmentItem 接口增加 status 字段
  - 类型定义与后端序列化器返回的字段一致
  - _Requirements: 4.1, 5.1_
  - _Boundary: Frontend Types_

## Task 4: 前端页面 — 卖家确认/拒绝

- [x] 4. 扩展卖家预约列表 tab
  - 每条预约显示状态标签（待确认/已确认/已拒绝），带对应颜色样式
  - pending 状态显示"确认"和"拒绝"两个操作按钮
  - confirmed 或 rejected 状态隐藏按钮，仅显示状态标签
  - 点击按钮调用 PATCH API，成功后 toast 提示并更新本地状态
  - 非 pending 状态重复操作时显示后端返回的错误提示
  - _Requirements: 2.1, 2.2, 2.4, 3.1, 3.2, 5.1, 5.2, 5.3_
  - _Depends: 2.3, 3_
  - _Boundary: Profile Seller Tab_

## Task 5: 前端页面 — 买家状态显示

- [x] 5. 扩展买家预约列表 tab
  - 每条预约显示状态标签：待确认（pending）、已确认（confirmed）、已拒绝（rejected）
  - 标签颜色与卖家 tab 一致
  - 无操作按钮，纯只读展示
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - _Depends: 3_
  - _Boundary: Profile Buyer Tab_

## Task 6: 集成验证

- [x] 6. 端到端功能验证
  - 创建预约 → 默认 pending → 卖家确认 → 状态变 confirmed → 买家可见
  - 创建预约 → 卖家拒绝 → 状态变 rejected → 再操作返回 400
  - 买家预约列表包含正确状态标签
  - 卖家预约列表 pending 显示按钮、非 pending 隐藏按钮
  - _Depends: 4, 5_
