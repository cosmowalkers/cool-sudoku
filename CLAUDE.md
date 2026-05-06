# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

数独酷（Cool Sudoku）— 一款 React Native + Expo 数独游戏 App，支持 iOS/Android/Web。

## 常用命令

```bash
npm start              # 启动 Expo 开发服务
npm test               # 运行测试（vitest run）
npm run lint           # ESLint 检查
npx tsc --noEmit       # TypeScript 类型检查
npx expo prebuild --platform android --clean  # 生成 Android 原生项目
cd android && ./gradlew assembleRelease       # 本地打 APK
```

## 技术栈

- **框架**: Expo 54 + React Native 0.81（New Architecture 启用，Reanimated 4.x 要求）
- **路由**: expo-router（file-based routing，页面在 `app/` 目录）
- **样式**: NativeWind 4（Tailwind CSS for RN），通过 `global.css` 入口
- **状态管理**: Zustand + AsyncStorage persist
- **动画**: react-native-reanimated 4
- **测试**: Vitest（测试文件在 `lib/sudoku/__tests__/`）
- **Path alias**: `@/*` 映射项目根目录

## 架构

```
lib/sudoku/         纯逻辑层：谜题生成、求解、校验（无 React 依赖）
lib/audio/          音效引擎（expo-av，preload/play/mute）
lib/i18n/           中英双语（Zustand store + 字典文件）
stores/             Zustand stores
  game-store.ts       游戏状态（棋盘、选中、笔记、历史、计时）
  stats-store.ts      统计 + 连胜（persist with version migrate）
  achievement-store.ts 18 个成就定义 + 检测逻辑
components/
  Board/            9×9 棋盘 Grid + Cell（Reanimated 动画）
  Controls/         NumberPad + ActionBar
  Celebration/      通关庆祝（Lottie confetti + ResultCard）
  Streak/           连胜火焰 Badge
  Achievement/      解锁弹窗
hooks/              useGameTimer, useReducedMotion 等
app/(tabs)/         标签页（游戏主屏 + 统计页）
app/new-game.tsx    难度选择 modal
```

## 关键设计决策

- **错误反馈不暴露答案**：只在违反数独规则（同行/列/宫重复）时触发抖动/音效，不对比 solution
- **Persist 策略**：game-store 使用 2s debounce 自定义 storage，避免每秒 timer tick 写盘
- **Cell 性能**：每个 Cell 通过 Zustand selector 只订阅自己的数据 + React.memo
- **连胜迁移**：stats-store persist version=1，旧用户首次升级从 history 计算初始 streak

## 设计系统

色彩 token 定义在 `tailwind.config.js` 的 `extend.colors` 中，完整规范见 `design-system/MASTER.md`。NativeWind 组件中用 className（如 `bg-primary`），StyleSheet 中直接引用 hex 值。

## 自定义命令

- `/full-workflow` — 完整产品开发工作流（brainstorming → openspec → ralph → subagent 执行）

## 注意事项

- `newArchEnabled` 必须为 true（Reanimated 4.x 强制要求）
- 音效文件在 `assets/sounds/` 目录为占位文件，需替换为真实音效
- Lottie 动画文件 `assets/lottie/confetti.json` 为占位，需替换
- react-native-view-shot 需要 development build（Expo Go 不支持）
