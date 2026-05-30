# Research Log

## Discovery Type
Light discovery — 扩展现有预约系统，无新外部依赖。

## Extension Point Analysis

### 现有 Appointment 模型
- 字段: buyer (FK User), product (FK Product), created_at (auto_now_add)
- unique_together: [buyer, product] — 同一买家对同一商品只能有一条预约
- 无 status 字段，无 updated_at 字段

### 现有 Views
- `create_appointment`: POST，校验 seller != request.user、status == active、无重复
- `my_appointments_as_buyer`: GET，按 created_at 倒序
- `my_appointments_as_seller`: GET，按 created_at 倒序

### 现有 Serializers
- `AppointmentCreateSerializer`: fields = [product_id]
- `AppointmentListSerializer`: fields = [id, product_id, product_title, product_price, buyer_username, created_at]

### 前端 Profile.tsx
- 卖家 tab: 纯只读卡片，无操作按钮
- 买家 tab: 纯只读卡片，无状态标签
- 使用 `AppointmentItem` 类型

## Design Decisions

### 1. 模型扩展 vs 新建表
**决策**: 扩展现有 Appointment 模型，新增 status 和 updated_at 字段。
**理由**: 状态是预约的固有属性，不需要独立实体。现有 unique_together 约束仍然有效。

### 2. 状态更新方式
**决策**: 新增 PATCH 端点，action 参数为 confirm/reject。
**理由**: RESTful 部分更新语义清晰。不使用 PUT 因为只更新一个字段。

### 3. 数据迁移策略
**决策**: 新字段 default="pending"，现有记录自动兼容。
**理由**: 零停机迁移，无需数据回填。

### 4. 前端状态管理
**决策**: 操作成功后直接更新本地 state，不重新请求列表。
**理由**: 与现有 handleFavorite、handleApprove 模式一致。减少 API 调用。

## Integration Risks
- 低风险：仅扩展模型字段，不改现有端点行为
- 数据迁移：ALTER TABLE 加字段，MySQL 5.7 兼容
- 前端改动集中在 Profile.tsx 两个 tab 区域
