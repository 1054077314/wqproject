# Requirements Document

## Introduction

当前预约系统仅支持买家发起预约、卖家查看预约记录，缺少卖家响应机制。本需求为现有预约流程补充"卖家确认/拒绝预约面交"功能，使买卖双方能通过平台完成预约状态流转，而非仅依赖线下沟通。

## Boundary Context

- **In scope**: Appointment 增加状态字段（pending/confirmed/rejected）；卖家在个人中心确认或拒绝预约；买家查看预约状态
- **Out of scope**: 管理员代操作预约；预约状态之外的订单/交易流程；现有预约发起和查看逻辑的重构
- **Adjacent expectations**: 预约创建后默认为 pending 状态（由系统自动设置，不属于本需求的用户操作范围）

## Requirements

### Requirement 1: 预约状态数据模型

**Objective:** As a 系统, I want 每条预约记录携带状态字段, so that 买卖双方能识别预约当前所处阶段。

#### Acceptance Criteria

1. When 买家成功发起预约, the 系统 shall 将该预约状态设为 pending
2. The 系统 shall 为每条预约记录维护以下状态之一：pending（待确认）、confirmed（已确认）、rejected（已拒绝）
3. The 系统 shall 在预约状态变更时记录变更时间

### Requirement 2: 卖家确认预约

**Objective:** As a 卖家, I want 确认买家的预约意向, so that 双方进入面交阶段。

#### Acceptance Criteria

1. When 卖家在"我收到的预约"列表中点击确认按钮, the 系统 shall 将该预约状态从 pending 变更为 confirmed
2. When 预约状态变更成功, the 系统 shall 向卖家显示操作成功提示
3. If 预约状态不是 pending, then the 系统 shall 拒绝确认操作并提示"该预约已被处理"
4. When 卖家确认预约后, the 系统 shall 立即在列表中更新该预约状态显示

### Requirement 3: 卖家拒绝预约

**Objective:** As a 卖家, I want 拒绝买家的预约意向, so that 买家了解该商品不再接受预约。

#### Acceptance Criteria

1. When 卖家在"我收到的预约"列表中点击拒绝按钮, the 系统 shall 将该预约状态从 pending 变更为 rejected
2. When 预约状态变更成功, the 系统 shall 向卖家显示操作成功提示
3. If 预约状态不是 pending, then the 系统 shall 拒绝操作并提示"该预约已被处理"
4. When 卖家拒绝预约后, the 系统 shall 立即在列表中更新该预约状态显示

### Requirement 4: 买家查看预约状态

**Objective:** As a 买家, I want 在"我预约的买单"列表中看到每笔预约的状态, so that 我了解预约是否被卖家响应。

#### Acceptance Criteria

1. When 买家查看"我预约的买单"列表, the 系统 shall 为每条预约显示当前状态标签（待确认/已确认/已拒绝）
2. When 预约状态为 pending, the 系统 shall 显示"待确认"标签
3. When 预约状态为 confirmed, the 系统 shall 显示"已确认"标签
4. When 预约状态为 rejected, the 系统 shall 显示"已拒绝"标签
5. The 系统 shall 按预约时间倒序排列预约列表

### Requirement 5: 卖家预约列表状态显示

**Objective:** As a 卖家, I want 在"我收到的预约"列表中看到每条预约的状态, so that 我能区分哪些已处理、哪些待处理。

#### Acceptance Criteria

1. When 卖家查看"我收到的预约"列表, the 系统 shall 为每条预约显示当前状态标签
2. When 预约状态为 pending, the 系统 shall 显示确认和拒绝操作按钮
3. When 预约状态为 confirmed 或 rejected, the 系统 shall 隐藏操作按钮，仅显示状态标签
4. The 系统 shall 按预约时间倒序排列预约列表
