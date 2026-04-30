## Context

cool-sudoku 是一个全新项目，已搭建好 Expo 54 + React Native 0.81 + NativeWind 4 + expo-router 6 的基础骨架。当前只有脚手架默认页面，无任何业务逻辑。目标是将其实现为一个完整的数独游戏 App。

技术栈约束：
- 路由：expo-router (file-based routing)
- 样式：NativeWind (Tailwind CSS for RN)
- 动画：react-native-reanimated 4
- 列表：@shopify/flash-list
- 平台：iOS / Android / Web

## Goals / Non-Goals

**Goals:**

- 实现可玩的数独游戏 MVP，包含生成、交互、校验完整闭环
- 支持 Easy / Medium / Hard / Expert 四级难度
- 流畅的交互体验（选格高亮、笔记模式、撤销）
- 本地持久化游戏进度和统计数据
- 干净的代码架构，引擎与 UI 解耦

**Non-Goals:**

- 多人对战 / 在线排行榜
- 用户账号系统
- 付费 / 广告 / 内购
- 自定义主题 / 换肤（MVP 后考虑）
- 数独变种（杀手数独、对角线数独等）

## Decisions

### 1. 数独引擎：纯 TypeScript 实现 vs 引入第三方库

**选择**: 纯 TypeScript 自行实现

**理由**:
- 数独生成/求解算法逻辑清晰，回溯法 + 挖洞法代码量可控（~300 行）
- 自行实现可完全控制难度分级策略（基于挖洞数量 + 解题技巧需求）
- 避免引入不可控的第三方依赖
- 作为学习项目，引擎是核心价值

**替代方案**: 使用 `sudoku` npm 包 — 功能完善但难度控制粒度不够，且包体积不必要地大。

### 2. 状态管理：Zustand vs React Context + useReducer

**选择**: Zustand

**理由**:
- 细粒度 selector 可避免棋盘 81 格不必要的 re-render
- 内置 middleware 支持（persist for AsyncStorage、immer for immutable updates）
- API 简洁，比 Context + Provider 嵌套更清晰
- zustand/middleware 的 persist 可直接对接 AsyncStorage，无需手写序列化逻辑
- 撤销通过维护 history 数组 + action 实现，与 Zustand 配合良好

**替代方案**: React Context + useReducer — 无外部依赖但 selector 优化需手动实现，81 格场景下 re-render 问题更难处理。

### 3. 持久化：AsyncStorage vs expo-secure-store vs MMKV

**选择**: @react-native-async-storage/async-storage

**理由**:
- 游戏数据非敏感，不需要加密存储
- AsyncStorage 是 RN 生态标准方案，Expo 良好支持
- 数据量小（当前游戏 + 统计），JSON 序列化即可

### 4. 棋盘布局：FlatList/FlashList vs 固定 9×9 Grid

**选择**: 固定 9×9 Grid（嵌套 View）

**理由**:
- 棋盘固定 81 格，无滚动需求
- Grid 布局可精确控制宫格分隔线样式
- FlatList 对固定数量小列表无优势，反而增加复杂度

### 5. 页面结构

```
app/
  (tabs)/
    index.tsx          → 游戏主屏（棋盘 + 控制面板）
    stats.tsx          → 统计页
  _layout.tsx          → Root layout
  new-game.tsx         → 新游戏/难度选择（modal）
```

### 6. 提示次数：无限 vs 有限

**选择**: 每局限制 3 次提示

**理由**:
- 无限提示等于直接看答案，完全消除挑战性
- 3 次是主流数独 App 的标准设定（Sudoku.com、NYT Sudoku）
- 限制提示强化"错误代价"，让用户更谨慎思考
- 用完后按钮置灰 + 显示"0/3"，明确传达状态

### 7. 错误处理：纯计数 vs 错误上限失败

**选择**: 纯计数，不设失败条件

**理由**:
- 数独是"思考型"游戏，强制失败会打断专注状态，带来挫败感
- 主流 App 中 NYT Sudoku 无限制、Sudoku.com 3 次失败 — 两种模式都有市场
- MVP 选择更宽容的模式，降低用户流失
- 错误计数仍然记录，作为统计和自我挑战的参考

**替代方案**: 可作为后续"挑战模式"引入（3 次错误失败）。

### 8. 数字覆盖行为：直接覆盖 vs 需先擦除

**选择**: 直接覆盖

**理由**:
- 减少操作步骤（不需要 erase → input 两步操作）
- 所有主流数独 App 都采用直接覆盖
- 覆盖动作会被记入 undo 栈，用户可以撤销回上一个值
- 覆盖时如果之前是错误值，错误计数不会重复增加（已在首次放置时计过）

### 9. Hydration 与初始加载

**选择**: App 启动时显示 splash/loading 状态，等 Zustand persist rehydration 完成后再渲染游戏 UI

**理由**:
- AsyncStorage 读取是异步的，直接渲染会出现空白闪烁
- Zustand persist 提供 `onRehydrateStorage` 回调和 `hasHydrated` 状态
- 利用 expo-splash-screen 的 `preventAutoHideAsync` 保持 splash 直到 hydration 完成

### 10. Persist 策略优化

**选择**: partialize + throttle

**理由**:
- `partialize`: 只持久化必要字段（board, solution, notes, history, timer, mistakes, difficulty），不存 UI 状态（selected cell, isNotesMode）
- `throttle`: 每次 state 变化都写 AsyncStorage 是浪费的，1 秒 throttle 即可保证数据安全且不影响性能
- 计时器每秒更新但不需每秒写盘 — elapsed time 可在恢复时用 `savedTime + (Date.now() - lastActiveTimestamp)` 补偿

## Risks / Trade-offs

- **谜题生成性能**: 回溯法在低端设备上可能卡顿 → 使用 Web Worker / 预生成缓存池缓解，MVP 先同步生成观察性能
- **棋盘 re-render**: 81 个格子频繁更新 → Zustand selector 精确订阅单个 cell 状态 + React.memo 避免无效渲染
- **AsyncStorage 限制**: 存储容量有限（Android 6MB）→ 只存最近 100 局记录，定期清理
- **难度算法精度**: 基于挖洞数的难度分级可能不够精确 → MVP 可接受，后续可引入解题技巧评估
