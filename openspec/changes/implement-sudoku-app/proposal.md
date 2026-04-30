## Why

项目 cool-sudoku 已搭建好 Expo + React Native + NativeWind 技术骨架，但尚无任何业务功能。需要实现一个完整的数独游戏 App，提供生成谜题、交互填数、校验、计时等核心玩法，作为独立产品的 MVP。

## What Changes

- 新增数独谜题生成与求解引擎（纯 JS，支持多难度）
- 新增 9×9 数独棋盘交互组件（选格、填数、高亮、错误提示）
- 新增数字输入面板与操作栏（笔记模式、撤销、擦除、提示）
- 新增游戏流程管理（新游戏、难度选择、计时、暂停、完成判定）
- 新增游戏统计与历史记录持久化
- 替换脚手架默认的 tab 页面为数独游戏界面

## Capabilities

### New Capabilities

- `sudoku-engine`: 数独谜题生成、求解、难度分级的纯逻辑层
- `game-board`: 9×9 棋盘 UI 组件，支持选中、高亮关联格、错误标记、笔记显示
- `game-controls`: 数字键盘、操作按钮（笔记/撤销/擦除/提示）、难度选择
- `game-session`: 游戏会话管理，包含计时、暂停、完成判定、状态持久化
- `game-stats`: 游戏统计（完成次数、最佳时间、正确率）与历史记录

### Modified Capabilities

（无已有 capabilities）

## Impact

- **路由**: 替换默认 tab 页面，新增游戏主屏、难度选择、统计页
- **依赖**: 可能新增 `async-storage` 用于本地持久化
- **代码**: 新增 `lib/`（引擎逻辑）、`components/`（游戏 UI）、`stores/`（状态管理）
- **现有代码**: 脚手架模板页面将被替换，无 breaking change（项目无用户）
