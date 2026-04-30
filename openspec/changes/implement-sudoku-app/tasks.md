## 1. 项目基础设施

- [ ] 1.1 安装 zustand 和 @react-native-async-storage/async-storage 依赖
- [ ] 1.2 安装 lucide-react-native（icon 库，design system 指定）
- [ ] 1.3 将 design system color tokens 配置到 tailwind.config.js extend.colors
- [ ] 1.4 清理脚手架默认页面（移除 explore.tsx 默认内容，重置 index.tsx）
- [ ] 1.5 配置 app/(tabs)/_layout.tsx 的 tab 结构（Game / Stats 两个 tab）

## 2. 数独引擎 (lib/sudoku/)

- [ ] 2.1 实现 generateSolution()：回溯法生成完整 9×9 有效解
- [ ] 2.2 实现 createPuzzle(difficulty)：从完整解挖洞生成谜题，确保唯一解
- [ ] 2.3 实现 validatePlacement(board, row, col, num)：校验放置合法性
- [ ] 2.4 实现 solve(board)：回溯法求解器，返回解或 null
- [ ] 2.5 实现 isComplete(board, solution)：判断棋盘是否完成
- [ ] 2.6 定义类型：Board, Cell, Difficulty, GameState 等 TypeScript 类型
- [ ] 2.7 引擎单元测试：验证生成唯一解、校验冲突检测、求解正确性

## 3. 游戏状态管理 (stores/)

- [ ] 3.1 创建 useGameStore：Zustand store，定义 board/solution/selected/notes/history 等状态和 actions
- [ ] 3.2 实现 actions：placeNumber/erase/toggleNote/undo/hint/newGame
- [ ] 3.3 实现撤销栈：每次操作前将当前状态推入 history 数组
- [ ] 3.4 配置 zustand/middleware persist + AsyncStorage：partialize 只存必要字段 + 1s throttle 写入
- [ ] 3.5 实现 hydration loading 状态：App 启动保持 splash screen 直到 persist rehydration 完成
- [ ] 3.6 实现计时器逻辑：启动/暂停/恢复/重置，AppState 监听前后台切换，恢复时时间补偿
- [ ] 3.7 实现笔记自动清除：placeNumber 时移除同行/列/宫中包含该数字的 notes
- [ ] 3.8 实现提示次数管理：限制 3 次/局，状态持久化

## 4. 棋盘 UI (components/Board/)

- [ ] 4.1 实现 Board 组件：9×9 Grid 布局，3×3 宫格加粗边框
- [ ] 4.2 实现 Cell 组件：显示数字/笔记，区分 given/user/hint 样式
- [ ] 4.3 实现选中高亮：选中格、同行列宫、相同数字的高亮逻辑
- [ ] 4.4 实现冲突标记：错误放置时的红色指示

## 5. 控制面板 UI (components/Controls/)

- [ ] 5.1 实现 NumberPad 组件：1-9 数字按钮，已完成数字置灰
- [ ] 5.2 实现操作栏：撤销、擦除、笔记切换、提示按钮
- [ ] 5.3 笔记模式状态指示和切换交互

## 6. 游戏页面 (app/(tabs)/index.tsx)

- [ ] 6.1 组装游戏主屏：顶部信息栏（难度/计时/错误数/提示剩余）+ 棋盘 + 控制面板，底部留 safe area padding
- [ ] 6.2 实现暂停覆盖层：隐藏棋盘 + 继续按钮
- [ ] 6.3 实现完成弹窗：展示用时/错误数/难度 + 新游戏按钮

## 7. 新游戏流程

- [ ] 7.1 创建 app/new-game.tsx modal 页面：难度选择 UI
- [ ] 7.2 实现难度卡片组件（Easy/Medium/Hard/Expert + 描述）
- [ ] 7.3 连接游戏开始逻辑：选择难度 → 生成谜题 → 导航回主屏

## 8. 统计页面 (app/(tabs)/stats.tsx)

- [ ] 8.1 创建 useStatsStore：Zustand store + persist，管理统计数据
- [ ] 8.2 实现总体统计卡片：总局数/胜率/连胜
- [ ] 8.3 实现分难度统计：按难度切换显示最佳时间/平均时间/完成数
- [ ] 8.4 实现历史记录列表：FlashList 渲染最近 100 局

## 9. 收尾与体验优化

- [ ] 9.1 触觉反馈：数字放置和错误时触发 expo-haptics
- [ ] 9.2 游戏完成时记录统计数据到 useStatsStore
- [ ] 9.3 处理边界情况：空棋盘、无法撤销、提示用完（3/3）、数字覆盖等
- [ ] 9.4 适配深色模式：使用 tailwind dark: variant 和 design system dark tokens
- [ ] 9.5 谜题生成性能优化：使用 InteractionManager.runAfterInteractions 避免 UI 阻塞
