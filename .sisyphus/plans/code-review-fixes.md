# MotoTrip 代码审查修复工作计划

## TL;DR

> **Quick Summary**: 基于代码审查报告，系统性修复 13 类代码质量问题，包括 Store 层重构、类型安全修复、测试覆盖提升和代码规范优化。
>
> **Deliverables**:
> - 重构 Store 层消除 ~90% 代码重复
> - 修复 diary.ts 点赞逻辑 Bug
> - 修复 API 层 ~50 处 unknown 类型问题
> - 移除 14 处 `as any` 和 28 处 `console.log`
> - 补充测试覆盖（错误处理、边界条件）
> - 统一配置管理和常量定义
>
> **Estimated Effort**: Medium (~4-6 小时)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: T1 → T2 → T3 → T4 → T14 → T15

---

## Context

### Original Request
用户要求根据代码审查报告生成详细的修复工作计划，涵盖 13 类问题。

### Interview Summary
**Key Discussions**:
- 问题优先级: P0 (立即) → P1 (本周) → P2 (本月) → P3 (可选)
- Store 层重构是核心，需优先处理
- 测试覆盖需补充边界条件和错误处理

**Research Findings**:
- diary.ts, route.ts, trip.ts 三个文件 ~90% 代码重复
- diary.ts 点赞逻辑 Bug: 缺少 isLiked 更新和 currentDiary 同步
- API 层大量使用 unknown 类型，应使用 types/index.ts 中已定义的类型

### Metis Review
**Identified Gaps** (addressed):
- Store 重构时机: 优先做（基础稳定后再处理其他）
- QA 验证方法: TypeScript 编译 + Vitest 测试 + grep 检查
- 测试文件: 可以修改和添加
- API 类型: 从 types/index.ts 推断，已有完整定义

---

## Work Objectives

### Core Objective
系统性修复代码审查发现的 13 类问题，提升代码质量、类型安全性和可维护性。

### Concrete Deliverables
1. 提取 `usePaginatedList` mixin 消除 Store 层重复
2. 修复 diary.ts 点赞逻辑 Bug
3. API 层所有 unknown 类型替换为具体类型
4. 移除所有 as any 和生产环境 console.log
5. 补充测试覆盖（错误处理、边界条件）
6. 统一 API URL 配置
7. 抽取魔法值为常量

### Definition of Done
- [ ] `tsc --noEmit` 编译通过
- [ ] `npm test` 所有测试通过
- [ ] `grep -r "console.log" src/ --include="*.ts"` 仅返回 App.vue
- [ ] `grep -r "as any" src/ --include="*.ts"` 返回 0 结果
- [ ] Store 层代码重复率 < 10%

### Must Have
- diary.ts 点赞 Bug 修复
- Store 层重构（消除重复）
- API 类型安全（unknown → 具体类型）

### Must NOT Have (Guardrails)
- 不添加新功能
- 不修改业务逻辑（diary bug 除外）
- 不添加新 npm 依赖
- 不修改不相关的文件
- 不改变 API 端点签名

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: Tests-after
- **Framework**: Vitest
- **QA**: TypeScript 编译 + Vitest 运行 + 代码检查

### QA Policy
每个任务完成后执行：
1. `tsc --noEmit` - TypeScript 编译检查
2. `npm test` - 运行所有测试
3. 特定检查（grep/文件验证）

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation):
├── T1: 创建基线验证脚本
├── T2: 提取 usePaginatedList mixin
└── T3: 统一 API URL 配置

Wave 2 (After Wave 1 — core fixes):
├── T4: 修复 diary.ts 点赞逻辑 Bug
├── T5: 重构 route.ts 使用 mixin
├── T6: 重构 trip.ts 使用 mixin
├── T7: 重构 diary.ts 使用 mixin
└── T8: 定义 API 类型声明

Wave 3 (After Wave 2 — type safety):
├── T9: 修复 routeApi 类型
├── T10: 修复 tripApi 类型
├── T11: 修复 diaryApi 类型
├── T12: 修复其他 API 类型
└── T13: 移除 as any

Wave 4 (After Wave 3 — cleanup):
├── T14: 移除 console.log 残留
├── T15: 抽取魔法值为常量
├── T16: 补充测试（错误处理）
├── T17: 补充测试（边界条件）
└── T18: 最终验证

Wave FINAL (After ALL tasks — review):
├── F1: TypeScript 编译验证
├── F2: 测试套件验证
└── F3: 代码规范验证
```

### Critical Path
T1 → T2 → T4 → T5/T6/T7 → T8 → T9/T10/T11/T12 → T13 → T14 → T15 → T16/T17 → T18

---

## TODOs

### Wave 1: Foundation

- [ ] 1. 创建基线验证脚本

  **What to do**:
  - 创建 `.sisyphus/scripts/baseline.sh` 记录当前状态
  - 记录: TypeScript 编译错误数、测试通过数、console.log 数量、as any 数量
  - 输出到 `.sisyphus/evidence/baseline.txt`

  **Must NOT do**:
  - 修改任何业务代码
  - 添加依赖

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T2, T3, T4
  - **Blocked By**: None

  **References**:
  - `package.json` - 查看现有脚本
  - `tsconfig.json` - TypeScript 配置

  **Acceptance Criteria**:
  - [ ] 脚本可执行 `bash .sisyphus/scripts/baseline.sh`
  - [ ] 输出包含所有关键指标

  **QA Scenarios**:
  ```
  Scenario: 基线脚本执行成功
    Tool: Bash
    Preconditions: 项目依赖已安装
    Steps:
      1. 执行 `bash .sisyphus/scripts/baseline.sh`
      2. 检查输出文件 .sisyphus/evidence/baseline.txt
    Expected Result: 输出包含 TypeScript 错误数、测试数、console.log 数量
    Evidence: .sisyphus/evidence/task-1-baseline.txt
  ```

  **Commit**: NO

---

- [ ] 2. 提取 usePaginatedList mixin

  **What to do**:
  - 创建 `src/store/usePaginatedList.ts`
  - 提取 diary.ts, route.ts, trip.ts 的公共逻辑:
    - items ref
    - loading ref
    - total/page/pageSize/hasMore ref
    - currentQuery ref
    - fetchItems 方法 (泛型)
    - resetList 方法
    - resetStore 方法
    - loadMore 方法
  - 使用 TypeScript 泛型支持不同数据类型
  - 保留各 Store 的特有方法（如 diary.likeDiary）

  **Must NOT do**:
  - 修改业务逻辑
  - 删除 Store 的特有方法
  - 改变 API 调用方式

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T4, T5, T6, T7
  - **Blocked By**: None

  **References**:
  - `src/store/diary.ts` - 参考分页逻辑
  - `src/store/route.ts` - 参考分页逻辑
  - `src/store/trip.ts` - 参考分页逻辑
  - `src/types/index.ts` - PaginatedResponse 类型

  **Acceptance Criteria**:
  - [ ] 文件创建: `src/store/usePaginatedList.ts`
  - [ ] 导出 `usePaginatedList` 函数
  - [ ] 支持泛型参数 `<T, P>`
  - [ ] `tsc --noEmit` 通过

  **QA Scenarios**:
  ```
  Scenario: mixin 导出和类型检查
    Tool: Bash (TypeScript)
    Preconditions: 项目依赖已安装
    Steps:
      1. 检查文件 `src/store/usePaginatedList.ts` 存在
      2. 执行 `tsc --noEmit src/store/usePaginatedList.ts`
    Expected Result: TypeScript 编译通过，无错误
    Evidence: .sisyphus/evidence/task-2-mixin-typecheck.txt

  Scenario: mixin 泛型支持
    Tool: Bash (代码检查)
    Preconditions: mixin 文件存在
    Steps:
      1. grep "usePaginatedList" src/store/usePaginatedList.ts
      2. 确认包含泛型参数
    Expected Result: 函数定义包含 `<T` 和 `<P` 泛型
    Evidence: .sisyphus/evidence/task-2-mixin-generics.txt
  ```

  **Commit**: NO

---

- [ ] 3. 统一 API URL 配置

  **What to do**:
  - 修改 `src/utils/env.ts` 添加完整的环境配置
  - 创建 `.env.development` 和 `.env.production`
  - 修改 `src/hooks/useCommon.ts` 使用 env.ts
  - 删除 `src/constants/index.ts` 中的 `API_BASE_URL`
  - 修改 `src/constants/index.ts` 从 env.ts 导出

  **Must NOT do**:
  - 修改 API 端点路径
  - 修改业务逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T8
  - **Blocked By**: None

  **References**:
  - `src/utils/env.ts` - 主要配置文件
  - `src/constants/index.ts` - 常量定义
  - `src/hooks/useCommon.ts` - 使用硬编码 URL

  **Acceptance Criteria**:
  - [ ] `src/utils/env.ts` 导出 `API_URL` 和 `API_CONFIG`
  - [ ] `.env.development` 存在
  - [ ] `.env.production` 存在
  - [ ] `src/hooks/useCommon.ts` 使用 `API_URL`
  - [ ] `src/constants/index.ts` 不再定义 `API_BASE_URL`

  **QA Scenarios**:
  ```
  Scenario: API URL 配置统一
    Tool: Bash (grep)
    Preconditions: 文件已修改
    Steps:
      1. grep -r "localhost:3000" src/ --include="*.ts"
      2. 仅在 env.ts 中出现
    Expected Result: API URL 仅在 env.ts 定义
    Evidence: .sisyphus/evidence/task-3-api-url.txt
  ```

  **Commit**: NO

---

### Wave 2: Core Fixes (After Wave 1)

- [ ] 4. 修复 diary.ts 点赞逻辑 Bug

  **What to do**:
  - 修改 `src/store/diary.ts` 的 `likeDiary` 方法
  - 添加 `isLiked` 状态更新
  - 添加 `currentDiary` 同步更新
  - 添加测试用例验证修复

  **Must NOT do**:
  - 修改 API 调用逻辑
  - 修改其他 Store 文件

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: T5, T6, T7, T16
  - **Blocked By**: T1, T2

  **References**:
  - `src/store/diary.ts:46-52` - 当前点赞逻辑
  - `src/types/index.ts:Diary` - Diary 类型定义（包含 isLiked）
  - `src/store/diary.spec.ts` - 现有测试

  **Acceptance Criteria**:
  - [ ] `likeDiary` 方法更新 `diaries[index].isLiked`
  - [ ] `likeDiary` 方法更新 `currentDiary.isLiked`（如果匹配）
  - [ ] `npm test src/store/diary.spec.ts` 通过

  **QA Scenarios**:
  ```
  Scenario: 点赞后 isLiked 状态更新
    Tool: Bash (vitest)
    Preconditions: diary store 已初始化
    Steps:
      1. 执行 `npm test src/store/diary.spec.ts`
      2. 检查测试输出
    Expected Result: 所有测试通过，包含 likeDiary 相关测试
    Evidence: .sisyphus/evidence/task-4-diary-bug.txt
  ```

  **Commit**: YES
  - Message: `fix(store): 修复 diary 点赞 isLiked 状态未更新`
  - Files: `src/store/diary.ts`, `src/store/diary.spec.ts`

---

- [ ] 5. 重构 route.ts 使用 mixin

  **What to do**:
  - 修改 `src/store/route.ts` 使用 `usePaginatedList`
  - 保留 `fetchRouteDetail` 和 `currentRoute` 等特有功能
  - 运行测试确保功能不变

  **Must NOT do**:
  - 删除 `fetchRouteDetail` 方法
  - 删除 `currentRoute` 状态
  - 修改 API 调用

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T9
  - **Blocked By**: T2, T4

  **References**:
  - `src/store/route.ts` - 当前实现
  - `src/store/usePaginatedList.ts` - mixin 实现
  - `src/store/route.spec.ts` - 现有测试

  **Acceptance Criteria**:
  - [ ] `route.ts` 使用 `usePaginatedList`
  - [ ] 保留所有导出方法和状态
  - [ ] `npm test src/store/route.spec.ts` 通过
  - [ ] 代码行数减少 > 30%

  **QA Scenarios**:
  ```
  Scenario: route store 重构后功能不变
    Tool: Bash (vitest)
    Preconditions: mixin 已创建
    Steps:
      1. 执行 `npm test src/store/route.spec.ts`
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-5-route-refactor.txt
  ```

  **Commit**: NO

---

- [ ] 6. 重构 trip.ts 使用 mixin

  **What to do**:
  - 修改 `src/store/trip.ts` 使用 `usePaginatedList`
  - 保留 `fetchTripDetail` 和 `currentTrip` 等特有功能
  - 运行测试确保功能不变

  **Must NOT do**:
  - 删除 `fetchTripDetail` 方法
  - 删除 `currentTrip` 状态
  - 修改 API 调用

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T10
  - **Blocked By**: T2, T4

  **References**:
  - `src/store/trip.ts` - 当前实现
  - `src/store/usePaginatedList.ts` - mixin 实现
  - `src/store/trip.spec.ts` - 现有测试

  **Acceptance Criteria**:
  - [ ] `trip.ts` 使用 `usePaginatedList`
  - [ ] 保留所有导出方法和状态
  - [ ] `npm test src/store/trip.spec.ts` 通过
  - [ ] 代码行数减少 > 30%

  **QA Scenarios**:
  ```
  Scenario: trip store 重构后功能不变
    Tool: Bash (vitest)
    Preconditions: mixin 已创建
    Steps:
      1. 执行 `npm test src/store/trip.spec.ts`
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-6-trip-refactor.txt
  ```

  **Commit**: NO

---

- [ ] 7. 重构 diary.ts 使用 mixin

  **What to do**:
  - 修改 `src/store/diary.ts` 使用 `usePaginatedList`
  - 保留 `likeDiary` 等特有功能
  - 运行测试确保功能不变

  **Must NOT do**:
  - 删除 `likeDiary` 方法
  - 删除 `currentDiary` 状态
  - 修改 API 调用

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T11
  - **Blocked By**: T2, T4

  **References**:
  - `src/store/diary.ts` - 当前实现
  - `src/store/usePaginatedList.ts` - mixin 实现
  - `src/store/diary.spec.ts` - 现有测试

  **Acceptance Criteria**:
  - [ ] `diary.ts` 使用 `usePaginatedList`
  - [ ] 保留所有导出方法和状态
  - [ ] `npm test src/store/diary.spec.ts` 通过
  - [ ] 代码行数减少 > 30%

  **QA Scenarios**:
  ```
  Scenario: diary store 重构后功能不变
    Tool: Bash (vitest)
    Preconditions: mixin 已创建
    Steps:
      1. 执行 `npm test src/store/diary.spec.ts`
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-7-diary-refactor.txt
  ```

  **Commit**: YES
  - Message: `refactor(store): 提取 usePaginatedList 消除 Store 层重复代码`
  - Files: `src/store/usePaginatedList.ts`, `src/store/route.ts`, `src/store/trip.ts`, `src/store/diary.ts`

---

- [ ] 8. 定义 API 类型声明

  **What to do**:
  - 创建 `src/types/api.ts` 为 API 响应定义类型
  - 定义: `RouteApiResponse`, `TripApiResponse`, `DiaryApiResponse` 等
  - 确保与 `src/types/index.ts` 中的实体类型一致

  **Must NOT do**:
  - 修改现有类型定义
  - 修改 API 调用

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T9, T10, T11, T12
  - **Blocked By**: T3

  **References**:
  - `src/types/index.ts` - 现有类型定义
  - `src/services/api.ts` - API 调用模式

  **Acceptance Criteria**:
  - [ ] 文件创建: `src/types/api.ts`
  - [ ] 定义分页响应类型 `ApiResponse<T>`
  - [ ] `tsc --noEmit` 通过

  **QA Scenarios**:
  ```
  Scenario: API 类型定义正确
    Tool: Bash (TypeScript)
    Preconditions: 文件已创建
    Steps:
      1. 执行 `tsc --noEmit src/types/api.ts`
    Expected Result: TypeScript 编译通过
    Evidence: .sisyphus/evidence/task-8-api-types.txt
  ```

  **Commit**: NO

---

### Wave 3: Type Safety (After Wave 2)

- [ ] 9. 修复 routeApi 类型

  **What to do**:
  - 修改 `src/services/api.ts` 中的 `routeApi`
  - 将 `request<unknown>` 替换为具体类型
  - `list` → `request<PaginatedResponse<Route>>`
  - `getDetail` → `request<Route>`
  - `create/update` → `request<Route>`

  **Must NOT do**:
  - 修改 API 端点路径
  - 修改请求方法

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: T13
  - **Blocked By**: T8

  **References**:
  - `src/services/api.ts:120-148` - routeApi 定义
  - `src/types/index.ts:Route` - Route 类型
  - `src/types/api.ts` - API 响应类型

  **Acceptance Criteria**:
  - [ ] `routeApi` 所有方法使用具体类型
  - [ ] `tsc --noEmit` 通过
  - [ ] `npm test` 通过

  **QA Scenarios**:
  ```
  Scenario: routeApi 类型安全
    Tool: Bash (TypeScript)
    Preconditions: API 类型已定义
    Steps:
      1. 执行 `tsc --noEmit`
    Expected Result: 编译通过
    Evidence: .sisyphus/evidence/task-9-route-typecheck.txt
  ```

  **Commit**: NO

---

- [ ] 10. 修复 tripApi 类型

  **What to do**:
  - 修改 `src/services/api.ts` 中的 `tripApi`
  - 将 `request<unknown>` 替换为具体类型

  **Must NOT do**:
  - 修改 API 端点路径

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: T13
  - **Blocked By**: T8

  **References**:
  - `src/services/api.ts:180-208` - tripApi 定义
  - `src/types/index.ts:Trip` - Trip 类型

  **Acceptance Criteria**:
  - [ ] `tripApi` 所有方法使用具体类型
  - [ ] `tsc --noEmit` 通过

  **QA Scenarios**:
  ```
  Scenario: tripApi 类型安全
    Tool: Bash (TypeScript)
    Steps:
      1. 执行 `tsc --noEmit`
    Expected Result: 编译通过
    Evidence: .sisyphus/evidence/task-10-trip-typecheck.txt
  ```

  **Commit**: NO

---

- [ ] 11. 修复 diaryApi 类型

  **What to do**:
  - 修改 `src/services/api.ts` 中的 `diaryApi`
  - 将 `request<unknown>` 替换为具体类型

  **Must NOT do**:
  - 修改 API 端点路径

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: T13
  - **Blocked By**: T8

  **References**:
  - `src/services/api.ts:210-243` - diaryApi 定义
  - `src/types/index.ts:Diary` - Diary 类型

  **Acceptance Criteria**:
  - [ ] `diaryApi` 所有方法使用具体类型
  - [ ] `tsc --noEmit` 通过

  **QA Scenarios**:
  ```
  Scenario: diaryApi 类型安全
    Tool: Bash (TypeScript)
    Steps:
      1. 执行 `tsc --noEmit`
    Expected Result: 编译通过
    Evidence: .sisyphus/evidence/task-11-diary-typecheck.txt
  ```

  **Commit**: NO

---

- [ ] 12. 修复其他 API 类型

  **What to do**:
  - 修改 `src/services/api.ts` 中其他 API 模块
  - `authApi`, `userApi`, `waypointApi`, `preparationApi`, `weatherApi`, `reviewApi`, `mapApi`, `dangerZoneApi`, `noParkingZoneApi`, `warningApi`, `userModeApi`
  - 将 `request<unknown>` 替换为具体类型

  **Must NOT do**:
  - 修改 API 端点路径

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: T13
  - **Blocked By**: T8

  **References**:
  - `src/services/api.ts` - 所有 API 定义
  - `src/types/index.ts` - 所有类型定义

  **Acceptance Criteria**:
  - [ ] 所有 API 方法使用具体类型
  - [ ] `tsc --noEmit` 通过
  - [ ] 未知类型 < 5 个

  **QA Scenarios**:
  ```
  Scenario: 所有 API 类型安全
    Tool: Bash (TypeScript + grep)
    Steps:
      1. 执行 `tsc --noEmit`
      2. grep -c "request<unknown>" src/services/api.ts
    Expected Result: 编译通过，unknown 数量 < 5
    Evidence: .sisyphus/evidence/task-12-other-typecheck.txt
  ```

  **Commit**: YES
  - Message: `fix(api): 修复 API 层类型安全，替换 unknown 为具体类型`
  - Files: `src/services/api.ts`, `src/types/api.ts`

---

- [ ] 13. 移除 as any

  **What to do**:
  - 搜索所有 `as any` 并替换为正确类型
  - 主要位置:
    - `src/hooks/useCommon.ts` (8 处)
    - `src/utils/index.ts` (4 处)
    - `src/pages/profile/mode-settings.vue` (1 处)
    - `src/pages/preparation/list.vue` (1 处)
  - 为 uni API 创建类型声明或使用已有类型

  **Must NOT do**:
  - 修改业务逻辑
  - 添加新的运行时代码

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: T14
  - **Blocked By**: T9, T10, T11, T12

  **References**:
  - grep 结果: `as any` 出现位置
  - `src/shims-vue.d.ts` - 现有类型声明

  **Acceptance Criteria**:
  - [ ] `grep -r "as any" src/ --include="*.ts" --include="*.vue" | grep -v "\.spec\.ts"` 返回 0 结果 (排除测试文件)
  - [ ] `tsc --noEmit` 通过

  **QA Scenarios**:
  ```
  Scenario: as any 完全移除（业务代码）
    Tool: Bash (grep)
    Steps:
      1. grep -r "as any" src/ --include="*.ts" --include="*.vue" | grep -v "\.spec\.ts"
    Expected Result: 返回 0 结果 (测试文件中的 as any 保留用于 mock)
    Evidence: .sisyphus/evidence/task-13-as-any.txt
  ```

  **Commit**: YES
  - Message: `fix(types): 移除 as any 类型断言，使用具体类型`
  - Files: `src/hooks/useCommon.ts`, `src/utils/index.ts`

---

### Wave 4: Cleanup (After Wave 3)

- [ ] 14. 移除 console.log 残留

  **What to do**:
  - 移除 `src/App.vue` 中的 3 个 `console.log`
  - 保留所有 `console.error`（用于错误追踪）
  - 添加注释说明移除原因

  **Must NOT do**:
  - 移除 `console.error`
  - 修改其他文件

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: T18
  - **Blocked By**: T13

  **References**:
  - `src/App.vue:5,9,13` - console.log 位置

  **Acceptance Criteria**:
  - [ ] `src/App.vue` 中无 `console.log`
  - [ ] 所有 `console.error` 保留
  - [ ] `tsc --noEmit` 通过

  **QA Scenarios**:
  ```
  Scenario: console.log 已移除
    Tool: Bash (grep)
    Steps:
      1. grep -r "console.log" src/ --include="*.ts" --include="*.vue"
    Expected Result: 仅返回 test 文件中的结果
    Evidence: .sisyphus/evidence/task-14-console-log.txt
  ```

  **Commit**: NO

---

- [ ] 15. 抽取魔法值为常量

  **What to do**:
  - 修改 `src/constants/index.ts` 添加常量定义
  - 抽取:
    - `DEFAULT_BUDGET = 3000`
    - `EARTH_RADIUS = 6371`
    - `DEFAULT_LOCATION = { lat: 39.9042, lng: 116.4074 }`
    - `WARNING_RADIUS = 10000`
    - `NIGHT_CHECK_INTERVAL = 5 * 60 * 1000`
    - `API_TIMEOUT = 1500`
  - 修改引用文件使用常量

  **Must NOT do**:
  - 修改常量值
  - 添加新功能

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: T18
  - **Blocked By**: T3

  **References**:
  - grep 结果: 魔法值出现位置
  - `src/constants/index.ts` - 现有常量

  **Acceptance Criteria**:
  - [ ] `src/constants/index.ts` 包含所有魔法值常量
  - [ ] 引用文件使用常量而非字面量
  - [ ] `tsc --noEmit` 通过

  **QA Scenarios**:
  ```
  Scenario: 魔法值已抽取
    Tool: Bash (grep)
    Steps:
      1. 检查 src/constants/index.ts 包含常量定义
      2. grep -r "39.9042" src/ --include="*.ts" --include="*.vue" 应返回 0 结果（除 constants）
    Expected Result: 魔法值仅在 constants 中定义
    Evidence: .sisyphus/evidence/task-15-magic-values.txt
  ```

  **Commit**: YES
  - Message: `refactor(constants): 抽取魔法值为常量`
  - Files: `src/constants/index.ts`, 引用文件

---

- [ ] 16. 补充测试（错误处理）

  **What to do**:
  - 修改 `src/store/*.spec.ts` 添加错误处理测试
  - 为每个 Store 添加:
    - API 调用失败测试
    - 网络超时测试
    - 401 未授权测试

  **Must NOT do**:
  - 修改测试框架配置
  - 删除现有测试

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: T18
  - **Blocked By**: T4, T5, T6, T7

  **References**:
  - `src/store/*.spec.ts` - 现有测试
  - `src/test/utils/test-helpers.ts` - 测试辅助

  **Acceptance Criteria**:
  - [ ] 每个 Store 测试文件添加 2-3 个错误处理测试
  - [ ] `npm test` 通过

  **QA Scenarios**:
  ```
  Scenario: 错误处理测试通过
    Tool: Bash (vitest)
    Steps:
      1. 执行 `npm test`
    Expected Result: 所有测试通过，新增错误处理测试
    Evidence: .sisyphus/evidence/task-16-error-tests.txt
  ```

  **Commit**: NO

---

- [ ] 17. 补充测试（边界条件）

  **What to do**:
  - 修改 `src/store/*.spec.ts` 添加边界条件测试
  - 为每个 Store 添加:
    - 空数据测试
    - 分页边界测试
    - resetStore 测试

  **Must NOT do**:
  - 修改测试框架配置
  - 删除现有测试

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: T18
  - **Blocked By**: T4, T5, T6, T7

  **References**:
  - `src/store/*.spec.ts` - 现有测试
  - `src/test/utils/test-helpers.ts` - 测试辅助

  **Acceptance Criteria**:
  - [ ] 每个 Store 测试文件添加 2-3 个边界条件测试
  - [ ] `npm test` 通过

  **QA Scenarios**:
  ```
  Scenario: 边界条件测试通过
    Tool: Bash (vitest)
    Steps:
      1. 执行 `npm test`
    Expected Result: 所有测试通过，新增边界条件测试
    Evidence: .sisyphus/evidence/task-17-boundary-tests.txt
  ```

  **Commit**: YES
  - Message: `test(store): 补充错误处理和边界条件测试`
  - Files: `src/store/*.spec.ts`

---

- [ ] 18. 最终验证

  **What to do**:
  - 运行完整的验证套件
  - 确认所有问题已修复
  - 生成最终报告

  **Must NOT do**:
  - 修改代码

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: T14, T15, T16, T17

  **Acceptance Criteria**:
  - [ ] `tsc --noEmit` 通过
  - [ ] `npm test` 通过
  - [ ] 所有问题已修复

  **QA Scenarios**:
  ```
  Scenario: 最终验证通过
    Tool: Bash
    Steps:
      1. tsc --noEmit
      2. npm test
      3. grep -r "console.log" src/ --include="*.ts"
      4. grep -r "as any" src/ --include="*.ts"
    Expected Result: 编译通过，测试通过，无 console.log 和 as any
    Evidence: .sisyphus/evidence/task-18-final.txt
  ```

  **Commit**: NO

---

## Final Verification Wave (MANDATORY)

- [ ] F1. **TypeScript 编译验证**
  - 执行 `tsc --noEmit`
  - 确认零错误
  - Output: `VERDICT: PASS/FAIL`

- [ ] F2. **测试套件验证**
  - 执行 `npm test`
  - 确认所有测试通过
  - Output: `Tests [N pass/N fail] | VERDICT: PASS/FAIL`

- [ ] F3. **代码规范验证**
  - `grep -r "console.log" src/ --include="*.ts" --include="*.vue"` 返回 0 结果 (业务代码)
  - `grep -r "as any" src/ --include="*.ts" --include="*.vue" | grep -v "\.spec\.ts"` 返回 0 结果 (排除测试文件)
  - Output: `console.log [0 results] | as any [0 results] | VERDICT: PASS/FAIL`

---

## Commit Strategy

### 原子提交
1. `fix(store): 修复 diary 点赞 isLiked 状态未更新`
   - Files: `src/store/diary.ts`, `src/store/diary.spec.ts`

2. `refactor(store): 提取 usePaginatedList 消除 Store 层重复代码`
   - Files: `src/store/usePaginatedList.ts`, `src/store/route.ts`, `src/store/trip.ts`, `src/store/diary.ts`

3. `fix(api): 修复 API 层类型安全，替换 unknown 为具体类型`
   - Files: `src/services/api.ts`, `src/types/api.ts`

4. `fix(types): 移除 as any 类型断言，使用具体类型`
   - Files: `src/hooks/useCommon.ts`, `src/utils/index.ts`

5. `refactor(constants): 抽取魔法值为常量`
   - Files: `src/constants/index.ts`, 引用文件

6. `test(store): 补充错误处理和边界条件测试`
   - Files: `src/store/*.spec.ts`

---

## Success Criteria

### Verification Commands
```bash
tsc --noEmit  # Expected: 0 errors
npm test  # Expected: All tests pass
grep -r "console.log" src/ --include="*.ts" --include="*.vue"  # Expected: 0 results (业务代码)
grep -r "as any" src/ --include="*.ts" --include="*.vue" | grep -v "\.spec\.ts"  # Expected: 0 results (排除测试文件)
```

### Final Checklist
- [ ] TypeScript 编译零错误
- [ ] 所有测试通过
- [ ] 无生产环境 console.log
- [ ] 无 as any 类型断言
- [ ] Store 层代码重复率 < 10%
- [ ] API 层 unknown 类型 < 5 个
