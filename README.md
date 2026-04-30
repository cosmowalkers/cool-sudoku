# Cool Sudoku

一个使用 React Native + Expo 构建的数独游戏 App。

## 功能

- 四级难度（简单 / 中等 / 困难 / 专家）
- 9×9 棋盘交互（选中高亮、关联格高亮、相同数字高亮、冲突标红）
- 笔记模式（铅笔标记候选数字）
- 撤销 / 擦除 / 提示（每局限 3 次）/ 重来
- 计时器（支持暂停，后台自动暂停）
- 游戏进度自动保存（杀掉 App 后恢复）
- 统计记录（分难度统计、历史记录、连胜）
- 中英双语切换
- 深色模式支持
- 触觉反馈

## 技术栈

| 技术 | 用途 |
|------|------|
| Expo 54 + React Native 0.81 | 跨平台框架 |
| expo-router | 文件路由 |
| NativeWind (Tailwind CSS) | 样式 |
| Zustand + AsyncStorage | 状态管理 + 持久化 |
| react-native-reanimated | 动画 |
| lucide-react-native | 图标 |
| Vitest | 单元测试 |

## 项目结构

```
lib/sudoku/          # 数独引擎（生成/求解/校验，纯 TS）
lib/i18n/            # 中英双语 i18n
stores/              # Zustand stores（游戏状态 + 统计）
components/Board/    # 棋盘 UI（Board + Cell）
components/Controls/ # 控制面板（NumberPad + ActionBar）
hooks/               # 自定义 hooks（计时器等）
app/(tabs)/          # 页面（游戏主屏 + 统计）
app/new-game.tsx     # 难度选择 modal
design-system/       # 设计系统规范
```

## 运行

```bash
# 安装依赖
npm install

# 启动开发服务
npx expo start

# 运行测试
npm test
```

## License

MIT
